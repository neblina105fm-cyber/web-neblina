import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\jtoro\\.gemini\\antigravity\\brain\\736aba55-486f-4001-82db-764cd78f8005';

async function run() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tempProfile = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'chrome-sched-bright-' + Date.now());
  const port = 9396;

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

  const target = await send('Target.createTarget', { url: 'http://localhost:3000' });
  const targetId = target.result.targetId;
  const attached = await send('Target.attachToTarget', { targetId, flatten: true });
  const sessionId = attached.result.sessionId;

  await send('Page.enable', {}, sessionId);
  await send('Runtime.enable', {}, sessionId);

  await send('Emulation.setDeviceMetricsOverride', {
    width: 1366,
    height: 900,
    deviceScaleFactor: 2,
    mobile: false
  }, sessionId);

  await new Promise((r) => setTimeout(r, 2000));

  // Inyectar carátula oficial para el programa activo
  const brightCover = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80";

  await send('Runtime.evaluate', {
    expression: `
      (() => {
        sessionStorage.setItem('neblina_install_popup_shown', 'true');
        localStorage.setItem('neblina_pwa_prompt_dismissed', 'true');
        const now = new Date();
        const caracasTimeStr = now.toLocaleTimeString('en-US', { timeZone: 'America/Caracas', hour12: false, hour: '2-digit', minute: '2-digit' });
        const [currentH] = caracasTimeStr.split(':').map(Number);

        const startH = Math.max(0, currentH - 1).toString().padStart(2, '0');
        const endH = Math.min(23, currentH + 2).toString().padStart(2, '0');

        const liveShowNow = {
          id: 'show_live_verified',
          title: 'El Monstruo de La Mañana (En Vivo 105.5 FM)',
          host: 'Jhonas Toro · Neblina 105.5 FM',
          description: 'Música, notas informativas y la mejor vibra.',
          startTime: startH + ':00',
          endTime: endH + ':00',
          days: [1, 2, 3, 4, 5, 6, 7],
          color: '#00DD9E',
          image: "${brightCover}",
          active: true
        };

        let list = [];
        try {
          const raw = localStorage.getItem('neblina_station_schedule_db');
          if (raw) list = JSON.parse(raw);
        } catch(e) {}

        const updated = [liveShowNow, ...list.filter(s => s.id !== liveShowNow.id)];
        localStorage.setItem('neblina_station_schedule_db', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('neblina_schedule_updated'));
      })()
    `
  }, sessionId);

  await new Promise((r) => setTimeout(r, 1000));

  // Dismiss pwa popup if still open
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const closeBtn = document.querySelector('button[aria-label="Cerrar ventana"], [class*="close"]');
        if (closeBtn) closeBtn.click();
        const continueBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Continuar en el navegador'));
        if (continueBtn) continueBtn.click();
      })()
    `
  }, sessionId);

  await new Promise((r) => setTimeout(r, 1500));

  const shot = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
  const buf = Buffer.from(shot.result.data, 'base64');
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'home-clean-with-live-player-cover.png'), buf);
  console.log(`[CAPTURA GUARDADA] -> home-clean-with-live-player-cover.png (${Math.round(buf.length / 1024)} KB)`);

  try {
    await send('Target.closeTarget', { targetId });
    ws.close();
    chrome.kill();
  } catch (e) {}
}

run().catch(console.error);
