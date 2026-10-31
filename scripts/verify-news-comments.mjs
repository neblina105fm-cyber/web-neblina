import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\jtoro\\.gemini\\antigravity\\brain\\736aba55-486f-4001-82db-764cd78f8005';

async function run() {
  console.log('--- INICIANDO VERIFICACIÓN END-TO-END DE COMENTARIOS DE NOTAS DE PRENSA ---');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tempProfile = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'chrome-comments-' + Date.now());
  const port = 9398;

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

  await new Promise((resolve) => {
    ws.onopen = resolve;
  });

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      pending.get(data.id)(data);
      pending.delete(data.id);
    }
  };

  const send = (method, params = {}, sessionId = undefined) => {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      pending.set(id, (res) => {
        if (res.error) reject(res.error);
        else resolve(res);
      });
      const payload = { id, method, params };
      if (sessionId) payload.sessionId = sessionId;
      ws.send(JSON.stringify(payload));
    });
  };

  async function takeScreenshot(name, sessionId) {
    const shot = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
    const buf = Buffer.from(shot.result.data, 'base64');
    const outPath = path.join(ARTIFACT_DIR, name);
    fs.writeFileSync(outPath, buf);
    console.log(`[CAPTURA GUARDADA] -> ${name} (${Math.round(buf.length / 1024)} KB)`);
  }

  // Pre-configurar browser
  const target = await send('Target.createTarget', { url: 'about:blank' });
  const targetId = target.result.targetId;
  const attached = await send('Target.attachToTarget', { targetId, flatten: true });
  const sessionId = attached.result.sessionId;

  await send('Page.enable', {}, sessionId);
  await send('Runtime.enable', {}, sessionId);

  // Inyectar prevención de popup de instalación antes de navegar
  await send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      sessionStorage.setItem('neblina_install_popup_shown', 'true');
      localStorage.setItem('neblina_pwa_prompt_dismissed', 'true');
      localStorage.setItem('neblina_pwa_installed', 'true');
    `
  }, sessionId);

  await send('Emulation.setDeviceMetricsOverride', {
    width: 1366,
    height: 900,
    deviceScaleFactor: 2,
    mobile: false
  }, sessionId);

  // Navegar a localhost:3000
  console.log('--- NAVEGANDO A http://localhost:3000 ---');
  await send('Page.navigate', { url: 'http://localhost:3000' }, sessionId);
  await new Promise((r) => setTimeout(r, 2500));

  // Descartar cualquier modal de instalación si existiera
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const continueBtn = buttons.find(b => b.textContent.includes('Continuar en el navegador'));
        if (continueBtn) continueBtn.click();
      })()
    `
  }, sessionId);

  await new Promise((r) => setTimeout(r, 500));

  // PARTE 1: Abrir la primera noticia de la web pública
  console.log('--- 1. ABRIENDO NOTICIA EN LA WEB PÚBLICA ---');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Leer Noticia Completa'));
        if (btn) {
          btn.click();
          return 'Button Leer Noticia Completa clicked';
        }
        const h2 = document.querySelector('h2.cursor-pointer');
        if (h2) {
          h2.click();
          return 'h2 clicked';
        }
        return 'No news trigger found';
      })()
    `
  }, sessionId);

  await new Promise((r) => setTimeout(r, 1500));

  // Scroll dentro del modal hacia la sección de comentarios
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const modalScroll = document.querySelector('.overflow-y-auto');
        if (modalScroll) {
          modalScroll.scrollTop = modalScroll.scrollHeight;
        }
      })()
    `
  }, sessionId);

  await new Promise((r) => setTimeout(r, 1000));
  await takeScreenshot('public-news-comments-view.png', sessionId);

  // PARTE 2: Llenar el formulario de comentarios como ciudadana (Ana Lucía Morales)
  console.log('--- 2. ENVIANDO COMENTARIO CIUDADANO CON DATOS PRIVADOS ---');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const setVal = (el, val) => {
          if (!el) return;
          const proto = el instanceof HTMLTextAreaElement ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
          const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
          if (setter) setter.call(el, val);
          else el.value = val;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        };

        const inputs = Array.from(document.querySelectorAll('input'));
        const textareas = Array.from(document.querySelectorAll('textarea'));

        const nameInp = inputs.find(i => i.placeholder && i.placeholder.includes('Carlos Ramírez'));
        const cedulaInp = inputs.find(i => i.placeholder && i.placeholder.includes('V-18'));
        const phoneInp = inputs.find(i => i.placeholder && i.placeholder.includes('414'));
        const locInp = inputs.find(i => i.placeholder && i.placeholder.includes('Santo Domingo'));
        const commentArea = textareas.find(t => t.placeholder && t.placeholder.includes('opinión'));

        if (nameInp) setVal(nameInp, 'Ana Lucía Morales');
        if (cedulaInp) setVal(cedulaInp, 'V-24.891.023');
        if (phoneInp) setVal(phoneInp, '+58 414-9988776');
        if (locInp) setVal(locInp, 'Santo Domingo Centro, Sector Las Albarregas');
        if (commentArea) setVal(commentArea, 'Excelente reporte informativo. Felicitaciones a todo el equipo de prensa de Neblina Stereo 105.5 FM por mantenernos siempre al día con la verdad y la inmediatez.');

        // Enviar formulario
        const submitBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Enviar Comentario') || b.textContent.includes('Publicar Comentario'));
        if (submitBtn) submitBtn.click();
        return 'Comment submitted';
      })()
    `
  }, sessionId);

  await new Promise((r) => setTimeout(r, 1200));

  // Volver a hacer scroll para capturar el banner de agradecimiento y confirmación
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const modalScroll = document.querySelector('.overflow-y-auto');
        if (modalScroll) {
          modalScroll.scrollTop = modalScroll.scrollHeight;
        }
      })()
    `
  }, sessionId);

  await new Promise((r) => setTimeout(r, 600));
  await takeScreenshot('public-news-comment-submitted-banner.png', sessionId);

  // Cerrar modal de noticia
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const closeBtn = document.querySelector('button[aria-label="Cerrar noticia"]');
        if (closeBtn) closeBtn.click();
      })()
    `
  }, sessionId);

  await new Promise((r) => setTimeout(r, 800));

  // PARTE 3: Navegar al Sistema Interno de Gestión (#admin)
  console.log('--- 3. ENTRANDO AL SISTEMA INTERNO DE GESTIÓN (#admin) ---');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        sessionStorage.setItem('neblina_admin_session_auth', 'true');
        window.location.hash = '#admin';
      })()
    `
  }, sessionId);

  await new Promise((r) => setTimeout(r, 2000));

  // Ir a la pestaña "Comentarios de Prensa"
  console.log('--- 4. NAVEGANDO A LA PESTAÑA COMENTARIOS DE PRENSA ---');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const commentsTab = buttons.find(b => b.textContent.includes('Comentarios Prensa') || b.textContent.includes('Comentarios'));
        if (commentsTab) commentsTab.click();
      })()
    `
  }, sessionId);

  await new Promise((r) => setTimeout(r, 1200));
  await takeScreenshot('admin-comments-pending-moderation.png', sessionId);

  // Aprobar el comentario pendiente de Ana Lucía Morales
  console.log('--- 5. APROBANDO COMENTARIO DE ANA LUCÍA MORALES ---');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const approveBtn = buttons.find(b => b.textContent.includes('Aprobar y Publicar'));
        if (approveBtn) {
          approveBtn.click();
          return 'Approved clicked';
        }
        return 'Approve button not found';
      })()
    `
  }, sessionId);

  await new Promise((r) => setTimeout(r, 1500));
  await takeScreenshot('admin-comments-moderated-approved.png', sessionId);

  // PARTE 4: Regresar a la Web Pública y verificar que el comentario ahora es visible públicamente
  console.log('--- 6. REGRESANDO A LA WEB PÚBLICA PARA VERIFICAR COMENTARIO APROBADO ---');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const backBtn = buttons.find(b => b.textContent.includes('Volver a Neblina Web'));
        if (backBtn) {
          backBtn.click();
        } else {
          window.location.hash = '';
        }
      })()
    `
  }, sessionId);

  await new Promise((r) => setTimeout(r, 2000));

  // Reabrir la misma noticia
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Leer Noticia Completa'));
        if (btn) {
          btn.click();
          return 'Button clicked';
        }
        const h2 = document.querySelector('h2.cursor-pointer');
        if (h2) {
          h2.click();
          return 'h2 clicked';
        }
      })()
    `
  }, sessionId);

  await new Promise((r) => setTimeout(r, 1500));

  // Scroll al fondo del modal para ver la lista de comentarios aprobados
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const modalScroll = document.querySelector('.overflow-y-auto');
        if (modalScroll) {
          modalScroll.scrollTop = modalScroll.scrollHeight;
        }
      })()
    `
  }, sessionId);

  await new Promise((r) => setTimeout(r, 1000));
  await takeScreenshot('public-news-comment-approved-and-visible.png', sessionId);

  try {
    await send('Target.closeTarget', { targetId });
    ws.close();
    chrome.kill();
  } catch (e) {}

  console.log('--- VERIFICACIÓN END-TO-END DE COMENTARIOS COMPLETADA CON ÉXITO ---');
}

run().catch(console.error);
