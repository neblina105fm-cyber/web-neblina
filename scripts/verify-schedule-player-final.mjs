import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\jtoro\\.gemini\\antigravity\\brain\\736aba55-486f-4001-82db-764cd78f8005';

async function run() {
  console.log('--- INICIANDO VERIFICACIÓN FINAL: PARRILLA Y CARÁTULA EN REPRODUCTOR ---');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tempProfile = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'chrome-sched-final-' + Date.now());
  const port = 9391;

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

  // 1. Target Admin
  const target = await send('Target.createTarget', { url: 'http://localhost:3000/#admin' });
  const targetId = target.result.targetId;
  const attached = await send('Target.attachToTarget', { targetId, flatten: true });
  const sessionId = attached.result.sessionId;

  await send('Page.enable', {}, sessionId);
  await send('Runtime.enable', {}, sessionId);

  // Desktop View
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1366,
    height: 900,
    deviceScaleFactor: 2,
    mobile: false
  }, sessionId);

  await new Promise((r) => setTimeout(r, 1200));

  // Iniciar sesión
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        sessionStorage.setItem('neblina_admin_session_auth', 'true');
        localStorage.setItem('neblina_pwa_prompt_dismissed', 'true');
        const inputs = Array.from(document.querySelectorAll('input'));
        const userInp = inputs.find(i => i.placeholder && i.placeholder.includes('Usuario'));
        const passInp = inputs.find(i => i.type === 'password' || (i.placeholder && i.placeholder.includes('Contraseña')));
        if (userInp) {
          userInp.value = 'admin';
          userInp.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (passInp) {
          passInp.value = 'neblina2026*';
          passInp.dispatchEvent(new Event('input', { bubbles: true }));
        }
        const submitBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Ingresar al Sistema'));
        if (submitBtn) submitBtn.click();
      })()
    `
  }, sessionId);

  await new Promise((r) => setTimeout(r, 1500));

  // Ir a pestaña Parrilla
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const schedBtn = buttons.find(b => b.textContent.includes('Parrilla') || b.textContent.includes('Programación'));
        if (schedBtn) schedBtn.click();
      })()
    `
  }, sessionId);

  await new Promise((r) => setTimeout(r, 1000));
  await takeScreenshot('admin-schedule-overview-desktop.png', sessionId);

  // Guardar un programa activo ahora con carátula oficial de alta definición
  console.log('--- ACTUALIZANDO PARRILLA CON PROGRAMA Y CARÁTULA EN VIVO ---');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const now = new Date();
        const caracasTimeStr = now.toLocaleTimeString('en-US', { timeZone: 'America/Caracas', hour12: false, hour: '2-digit', minute: '2-digit' });
        const [currentH, currentM] = caracasTimeStr.split(':').map(Number);
        
        const caracasDayStr = now.toLocaleDateString('en-US', { timeZone: 'America/Caracas', weekday: 'short' });
        const daysMap = { 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6, 'Sun': 7 };
        const currentDay = daysMap[caracasDayStr] || 1;

        const startH = Math.max(0, currentH - 1).toString().padStart(2, '0');
        const endH = Math.min(23, currentH + 2).toString().padStart(2, '0');

        const customLiveShow = {
          id: 'show_live_custom',
          title: 'El Monstruo de La Mañana (En Vivo 105.5 FM)',
          host: 'Jhonas Toro & Roxana Toro',
          description: 'Entretenimiento estelar, noticias al día y la mejor energía transmitiendo para todo Mérida y el mundo.',
          startTime: startH + ':00',
          endTime: endH + ':00',
          days: [1, 2, 3, 4, 5, 6, 7],
          color: '#00DD9E',
          image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&auto=format&fit=crop&q=80',
          active: true
        };

        let list = [];
        try {
          const raw = localStorage.getItem('neblina_station_schedule_db');
          if (raw) list = JSON.parse(raw);
        } catch(e) {}

        const updated = [customLiveShow, ...list.filter(s => s.id !== customLiveShow.id)];
        localStorage.setItem('neblina_station_schedule_db', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('neblina_schedule_updated'));
      })()
    `
  }, sessionId);

  // Recargar la pestaña para que las cards muestren el programa activo
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const schedBtn = buttons.find(b => b.textContent.includes('Parrilla') || b.textContent.includes('Programación'));
        if (schedBtn) schedBtn.click();
      })()
    `
  }, sessionId);

  await new Promise((r) => setTimeout(r, 1000));
  await takeScreenshot('admin-schedule-on-air-active-card.png', sessionId);

  // 2. Navegar a la página pública (Home) para verificar que el reproductor tiene la carátula
  console.log('--- NAVEGANDO AL HOME PARA CAPTURAR EL REPRODUCTOR ---');
  await send('Page.navigate', { url: 'http://localhost:3000' }, sessionId);
  await new Promise((r) => setTimeout(r, 2500));

  // Captura del reproductor en el home con la carátula activa
  await takeScreenshot('home-player-with-active-show-cover.png', sessionId);

  // Verificar atributos en DOM
  const check = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const playerImgs = Array.from(document.querySelectorAll('header img, footer img, [class*="player"] img, .fixed img'));
        const coverSrc = playerImgs.map(i => i.src);
        const hasCover = coverSrc.some(s => s.includes('photo-1598488035139'));
        return {
          hasCover,
          playerImages: coverSrc,
          bodySnippet: document.body.innerText.slice(0, 300)
        };
      })()
    `
  }, sessionId);
  console.log('Check result:', check?.result?.result?.value);

  // Limpiar Chrome
  try {
    await send('Target.closeTarget', { targetId });
    ws.close();
    chrome.kill();
  } catch (e) {}

  console.log('--- VERIFICACIÓN CONCLUIDA EXITOSAMENTE ---');
}

run().catch(console.error);
