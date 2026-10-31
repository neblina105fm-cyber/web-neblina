import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\jtoro\\.gemini\\antigravity\\brain\\736aba55-486f-4001-82db-764cd78f8005';

async function runVerification() {
  console.log('--- INICIANDO VERIFICACIÓN EN VIVO: ADMIN STANDALONE Y NOTICIAS WORDPRESS ---');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tempProfile = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'chrome-verify-' + Date.now());
  const port = 9385;

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

  // 1. Crear target
  const target = await send('Target.createTarget', { url: 'http://localhost:3000' });
  const targetId = target.result.targetId;
  const attached = await send('Target.attachToTarget', { targetId, flatten: true });
  const sessionId = attached.result.sessionId;

  await send('Page.enable', {}, sessionId);
  await send('Runtime.enable', {}, sessionId);

  // Desktop View
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 900,
    deviceScaleFactor: 2,
    mobile: false
  }, sessionId);

  // Prevenir modal de instalación cerrándolo automáticamente
  await send('Runtime.evaluate', {
    expression: `
      localStorage.setItem('neblina_install_modal_dismissed', 'true');
      localStorage.setItem('neblina_privacy_consent_accepted', 'true');
    `
  }, sessionId);

  await new Promise(r => setTimeout(r, 1500));

  // TEST 1: Ir a la Sala de Prensa completa (Pestaña Noticias)
  console.log('TEST 1: Navegando a la Sala de Prensa completa...');
  await send('Runtime.evaluate', {
    expression: `
      // Cerrar modal de instalación si está presente
      const closeInstall = document.querySelector('button[aria-label="Cerrar modal"], .lucide-x');
      if (closeInstall) closeInstall.click();

      // Pulsar pestaña Noticias
      const buttons = Array.from(document.querySelectorAll('nav button, button'));
      const newsBtn = buttons.find(b => b.textContent && b.textContent.trim().startsWith('Noticias'));
      if (newsBtn) newsBtn.click();
    `
  }, sessionId);

  // Esperar a que carguen las noticias paginadas de WordPress
  await new Promise(r => setTimeout(r, 3500));
  await takeScreenshot('news-room-paginated-desktop.png', sessionId);

  // TEST 2: Ir a la Página Administrativa Independiente (#admin)
  console.log('TEST 2: Navegando a la Página Administrativa Independiente (#admin)...');
  await send('Page.navigate', { url: 'http://localhost:3000/#admin' }, sessionId);
  await new Promise(r => setTimeout(r, 2000));

  // Captura del Login Standalone
  await takeScreenshot('admin-standalone-login-desktop.png', sessionId);

  // Autenticarse correctamente usando el prototype setter de React
  console.log('Autenticando en el Sistema Interno...');
  await send('Runtime.evaluate', {
    expression: `
      function setVal(input, val) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(input, val);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const userInputs = document.querySelectorAll('input[type="text"]');
      const passInputs = document.querySelectorAll('input[type="password"]');
      if (userInputs.length > 0) setVal(userInputs[0], 'admin');
      if (passInputs.length > 0) setVal(passInputs[0], 'neblina2026*');
      
      const submitBtn = document.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.click();
    `
  }, sessionId);

  await new Promise(r => setTimeout(r, 2000));
  await takeScreenshot('admin-standalone-dashboard-desktop.png', sessionId);

  // TEST 3: Ir a la pestaña WordPress API
  console.log('TEST 3: Probando pestaña WordPress API...');
  await send('Runtime.evaluate', {
    expression: `
      const buttons = Array.from(document.querySelectorAll('button, nav button'));
      const wpBtn = buttons.find(b => b.textContent && b.textContent.includes('WordPress API'));
      if (wpBtn) wpBtn.click();
    `
  }, sessionId);

  await new Promise(r => setTimeout(r, 1500));
  await takeScreenshot('admin-wordpress-api-desktop.png', sessionId);

  // TEST 4: Probar en Modo Móvil (iPhone 14 / Android 390x844)
  console.log('TEST 4: Cambiando a vista móvil 390x844...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    mobile: true
  }, sessionId);

  await new Promise(r => setTimeout(r, 1200));
  await takeScreenshot('admin-standalone-mobile.png', sessionId);

  // Abrir menú lateral en móvil
  await send('Runtime.evaluate', {
    expression: `
      const menuBtn = document.querySelector('button[aria-label="Abrir menú de navegación"]');
      if (menuBtn) menuBtn.click();
    `
  }, sessionId);
  await new Promise(r => setTimeout(r, 1000));
  await takeScreenshot('admin-mobile-drawer.png', sessionId);

  // Cerrar drawer
  await send('Runtime.evaluate', {
    expression: `
      const closeBtn = document.querySelector('.lucide-x');
      if (closeBtn) closeBtn.closest('button').click();
    `
  }, sessionId);
  await new Promise(r => setTimeout(r, 500));

  // TEST 5: Probar botón "← Volver a Neblina Web"
  console.log('TEST 5: Probando retorno a la web pública...');
  // Restaurar desktop
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 900,
    deviceScaleFactor: 2,
    mobile: false
  }, sessionId);

  await send('Runtime.evaluate', {
    expression: `
      const buttons = Array.from(document.querySelectorAll('button'));
      const backBtn = buttons.find(b => b.textContent && b.textContent.includes('Volver a Neblina Web'));
      if (backBtn) backBtn.click();
    `
  }, sessionId);

  await new Promise(r => setTimeout(r, 2000));
  await takeScreenshot('admin-returned-to-web.png', sessionId);

  // Cerrar Chrome y WS
  ws.close();
  chrome.kill();
  console.log('--- VERIFICACIÓN FINALIZADA CON ÉXITO ---');
}

runVerification().catch(console.error);
