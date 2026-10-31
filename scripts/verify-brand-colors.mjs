import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\jtoro\\.gemini\\antigravity\\brain\\736aba55-486f-4001-82db-764cd78f8005';

async function runVerification() {
  console.log('--- VALIDACIÓN VISUAL DE LA PALETA OFICIAL DE MARCA NEBLINA 105.5 FM ---');
  
  // 1. Iniciar servidor local preview con la build oficial
  console.log('[*] Levantando servidor local en http://127.0.0.1:3000...');
  const server = spawn('cmd.exe', ['/c', 'npx vite preview --port 3000 --host'], {
    stdio: 'ignore'
  });

  let serverReady = false;
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 300));
    try {
      const res = await fetch('http://127.0.0.1:3000/');
      if (res.ok) {
        serverReady = true;
        console.log('[OK] Servidor Vite listo y respondiendo 200 OK.');
        break;
      }
    } catch (e) {}
  }

  if (!serverReady) {
    console.error('El servidor no respondió a tiempo');
    server.kill();
    return;
  }

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tempProfile = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'chrome-brand-' + Date.now());
  const port = 9392;

  const chrome = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--disable-gpu',
    `--user-data-dir=${tempProfile}`,
    '--no-first-run',
    'about:blank'
  ]);

  let wsUrl = null;
  for (let i = 0; i < 25; i++) {
    await new Promise((r) => setTimeout(r, 250));
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      const data = await res.json();
      wsUrl = data.webSocketDebuggerUrl;
      if (wsUrl) break;
    } catch (e) {}
  }

  if (!wsUrl) {
    console.error('No se pudo conectar a Chrome CDP');
    chrome.kill();
    server.kill();
    return;
  }

  const ws = new WebSocket(wsUrl);
  let msgId = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      pending.get(data.id)(data);
      pending.delete(data.id);
    }
  };

  await new Promise((resolve) => (ws.onopen = resolve));

  function send(method, params = {}, sessionId) {
    return new Promise((resolve) => {
      const id = msgId++;
      pending.set(id, resolve);
      const payload = { id, method, params };
      if (sessionId) payload.sessionId = sessionId;
      ws.send(JSON.stringify(payload));
    });
  }

  async function takeScreenshot(name, sessionId) {
    const shot = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
    const buf = Buffer.from(shot.result.data, 'base64');
    const outPath = path.join(ARTIFACT_DIR, name);
    fs.writeFileSync(outPath, buf);
    console.log(`[CAPTURA GUARDADA] -> ${name} (${Math.round(buf.length / 1024)} KB)`);
  }

  try {
    // Crear target para Home
    const target = await send('Target.createTarget', { url: 'http://127.0.0.1:3000/' });
    const targetId = target.result.targetId;
    const attached = await send('Target.attachToTarget', { targetId, flatten: true });
    const sessionId = attached.result.sessionId;

    await send('Page.enable', {}, sessionId);
    await send('Runtime.enable', {}, sessionId);

    // Desktop View
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 2,
      mobile: false
    }, sessionId);

    await new Promise((r) => setTimeout(r, 2000));

    // A. Capturar Home en Modo Oscuro Oficial (#001E4D & #00DD9E)
    await send('Runtime.evaluate', {
      expression: `
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        localStorage.setItem('neblina_theme', 'dark');
      `
    }, sessionId);
    await new Promise((r) => setTimeout(r, 1200));

    await takeScreenshot('brand-palette-desktop-dark.png', sessionId);

    // B. Capturar Home en Modo Claro Oficial (Blanco Puro, Orbes Pastel #B9EBFF/#EBE1FA y Azul Marino #001E4D)
    await send('Runtime.evaluate', {
      expression: `
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        localStorage.setItem('neblina_theme', 'light');
      `
    }, sessionId);
    await new Promise((r) => setTimeout(r, 1200));

    await takeScreenshot('brand-palette-desktop-light.png', sessionId);

    // C. Sala de Prensa con Colores de Marca y Paginación
    await send('Runtime.evaluate', {
      expression: `
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        localStorage.setItem('neblina_theme', 'dark');
        const btnNews = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Noticias'));
        if (btnNews) btnNews.click();
      `
    }, sessionId);
    await new Promise((r) => setTimeout(r, 2500));

    await takeScreenshot('brand-palette-news-room-dark.png', sessionId);

    // D. Vista Móvil Android (393 x 852)
    await send('Emulation.setDeviceMetricsOverride', {
      width: 393,
      height: 852,
      deviceScaleFactor: 2.75,
      mobile: true
    }, sessionId);

    await send('Page.navigate', { url: 'http://127.0.0.1:3000/' }, sessionId);
    await new Promise((r) => setTimeout(r, 2500));

    await takeScreenshot('brand-palette-mobile-home-dark.png', sessionId);

    // E. Menú Móvil Abierto
    await send('Runtime.evaluate', {
      expression: `
        const menuBtn = document.querySelector('button[aria-label="Abrir Menú"]');
        if (menuBtn) menuBtn.click();
      `
    }, sessionId);
    await new Promise((r) => setTimeout(r, 1000));

    await takeScreenshot('brand-palette-mobile-drawer.png', sessionId);

    // F. Panel Administrativo Standalone (#admin)
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 2,
      mobile: false
    }, sessionId);

    await send('Page.navigate', { url: 'http://127.0.0.1:3000/#admin' }, sessionId);
    await new Promise((r) => setTimeout(r, 2000));

    // Desbloquear login
    await send('Runtime.evaluate', {
      expression: `
        const pwd = document.querySelector('input[type="password"]');
        if (pwd) {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(pwd, 'neblina2026*');
          pwd.dispatchEvent(new Event('input', { bubbles: true }));
          pwd.dispatchEvent(new Event('change', { bubbles: true }));
        }
        const sub = document.querySelector('button[type="submit"]');
        if (sub) sub.click();
      `
    }, sessionId);
    await new Promise((r) => setTimeout(r, 2000));

    await takeScreenshot('brand-palette-admin-dashboard.png', sessionId);

  } catch (err) {
    console.error('Error durante la verificación:', err);
  } finally {
    ws.close();
    chrome.kill();
    server.kill();
    console.log('--- FIN DE VALIDACIÓN ---');
  }
}

runVerification();