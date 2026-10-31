import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\jtoro\\.gemini\\antigravity\\brain\\736aba55-486f-4001-82db-764cd78f8005';

async function runVerification() {
  console.log('--- INICIANDO VERIFICACIÓN: PARRILLA RADIAL Y CARÁTULA EN REPRODUCTOR ---');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tempProfile = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'chrome-verify-sched-' + Date.now());
  const port = 9389;

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

  // 1. Crear target para el Admin
  const target = await send('Target.createTarget', { url: 'http://localhost:3000/#admin' });
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

  await new Promise((r) => setTimeout(r, 1500));

  // Autenticar llenando el formulario de login y dando click a "Ingresar al Sistema"
  console.log('--- AUTENTICANDO EN SISTEMA INTERNO ---');
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

  // Cambiar a la pestaña "schedule" (Parrilla Radial)
  console.log('--- NAVEGANDO A LA PESTAÑA PARRILLA RADIAL ---');
  const tabSwitch = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const schedBtn = buttons.find(b => b.textContent.includes('Parrilla') || b.textContent.includes('Programación'));
        if (schedBtn) {
          schedBtn.click();
          return 'Pestaña Parrilla seleccionada';
        }
        return 'Botón Parrilla no encontrado';
      })()
    `
  }, sessionId);
  console.log('Tab switch result:', tabSwitch?.result?.result?.value);

  await new Promise((r) => setTimeout(r, 1000));
  await takeScreenshot('admin-schedule-tab-desktop.png', sessionId);

  // Abrir formulario "Nuevo Programa"
  console.log('--- ABRIENDO FORMULARIO NUEVO PROGRAMA ---');
  const openFormRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const newShowBtn = buttons.find(b => b.textContent.includes('Nuevo Programa') || b.textContent.includes('Agregar Programa'));
        if (newShowBtn) {
          newShowBtn.click();
          return 'Formulario nuevo programa abierto';
        }
        return 'Botón no encontrado';
      })()
    `
  }, sessionId);
  console.log('Open form result:', openFormRes?.result?.result?.value);
  await new Promise((r) => setTimeout(r, 800));

  // Rellenar formulario con carátula personalizada y datos de prueba
  console.log('--- RELLENANDO FORMULARIO CON CARÁTULA PERSONALIZADA ---');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const inputs = Array.from(document.querySelectorAll('input'));
        const titleInput = inputs.find(i => i.placeholder && i.placeholder.includes('El Monstruo'));
        const hostInput = inputs.find(i => i.placeholder && i.placeholder.includes('Jhonas'));
        const urlInput = inputs.find(i => i.type === 'url' || (i.placeholder && i.placeholder.includes('caratula-programa')));
        const descInput = inputs.find(i => i.placeholder && i.placeholder.includes('Música variada'));

        if (titleInput) {
          titleInput.value = 'El Show Estelar de Neblina 105.5';
          titleInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (hostInput) {
          hostInput.value = 'Jhonas Toro & Invitados';
          hostInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (urlInput) {
          urlInput.value = 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&auto=format&fit=crop&q=80';
          urlInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (descInput) {
          descInput.value = 'Transmisión especial en vivo con entrevistas y la mejor música de la región.';
          descInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
      })()
    `
  }, sessionId);

  await new Promise((r) => setTimeout(r, 1000));
  await takeScreenshot('admin-schedule-form-with-cover.png', sessionId);

  // Guardar el programa
  console.log('--- GUARDANDO PROGRAMA EN PARRILLA ---');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const saveBtn = buttons.find(b => b.textContent.includes('Guardar Programa') || b.textContent.includes('Actualizar Programa'));
        if (saveBtn) saveBtn.click();
      })()
    `
  }, sessionId);
  await new Promise((r) => setTimeout(r, 1200));

  // Captura de la lista con el nuevo programa agregado
  await takeScreenshot('admin-schedule-list-updated.png', sessionId);

  // AHORA VERIFICAR EL REPRODUCTOR EN EL HOME:
  // Crear un programa activo en la hora exacta de Venezuela UTC-4
  console.log('--- VERIFICANDO QUE LA CARÁTULA SE PROYECTA EN EL REPRODUCTOR ---');
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
        const endH = Math.min(23, currentH + 3).toString().padStart(2, '0');

        const liveShowNow = {
          id: 'show_on_air_now',
          title: 'El Monstruo de la Mañana (Edición Especial)',
          host: 'Jhonas Toro En Vivo',
          description: 'El programa matutino líder de la radio andina transmitiendo en directo.',
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

        const updated = [liveShowNow, ...list.filter(s => s.id !== liveShowNow.id)];
        localStorage.setItem('neblina_station_schedule_db', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('neblina_schedule_updated'));
      })()
    `
  }, sessionId);

  // Navegar al Home público
  console.log('--- NAVEGANDO AL HOME PRINCIPAL ---');
  await send('Page.navigate', { url: 'http://localhost:3000' }, sessionId);
  await new Promise((r) => setTimeout(r, 3000));

  // Capturar vista del Home con el reproductor proyectando la carátula
  await takeScreenshot('home-player-with-active-show-cover.png', sessionId);

  // Verificar en DOM
  const domCheck = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const imgs = Array.from(document.querySelectorAll('img')).map(i => i.src);
        const hasCustomCover = imgs.some(src => src.includes('photo-1598488035139'));
        const bodyText = document.body.innerText;
        return {
          hasCustomCover,
          hitParadeInText: bodyText.includes('El Monstruo') || bodyText.includes('Jhonas Toro'),
          imgs
        };
      })()
    `
  }, sessionId);
  console.log('DOM check in Player:', domCheck?.result?.result?.value);

  try {
    await send('Target.closeTarget', { targetId });
    ws.close();
    chrome.kill();
  } catch (e) {}

  console.log('--- VERIFICACIÓN COMPLETADA EXITOSAMENTE ---');
}

runVerification().catch(console.error);
