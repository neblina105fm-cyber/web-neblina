import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

async function checkPlayerImg() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tempProfile = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'chrome-img-check-' + Date.now());
  const port = 9397;

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

  await new Promise((r) => setTimeout(r, 2500));

  const info = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        const playerImgs = imgs.filter(img => img.closest('.fixed'));
        return {
          totalImgs: imgs.length,
          playerImgs: playerImgs.map(img => ({
            src: img.src,
            alt: img.alt,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            currentSrc: img.currentSrc,
            complete: img.complete,
            outerHTML: img.outerHTML
          }))
        };
      })()
    `
  }, sessionId);

  console.log('Player IMG Info:', JSON.stringify(info?.result?.result?.value, null, 2));

  try {
    await send('Target.closeTarget', { targetId });
    ws.close();
    chrome.kill();
  } catch (e) {}
}

checkPlayerImg().catch(console.error);
