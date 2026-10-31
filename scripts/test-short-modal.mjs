import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\jtoro\\.gemini\\antigravity\\brain\\736aba55-486f-4001-82db-764cd78f8005';

async function testShortModal() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tempProfile = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'chrome-test-short-' + Date.now());
  const port = 9360;

  const chrome = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--disable-gpu',
    `--user-data-dir=${tempProfile}`,
    '--no-first-run',
    'about:blank'
  ]);

  let wsUrl = null;
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 300));
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
    width: 1280,
    height: 900,
    deviceScaleFactor: 2,
    mobile: false
  }, sessionId);

  console.log('1. Waiting 3 seconds...');
  await new Promise((r) => setTimeout(r, 3000));

  // Press Escape to dismiss install modal
  console.log('2. Dismissing install modal with Escape key...');
  await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Escape', code: 'Escape' }, sessionId);
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape' }, sessionId);
  await new Promise((r) => setTimeout(r, 600));

  // Find and click on the first YouTube short card
  console.log('3. Scrolling to YouTube shorts and clicking first card...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      // Find cards with Aspect ratio 9/15 or title containing short
      const cards = Array.from(document.querySelectorAll('div')).filter(d => 
        d.getAttribute('title')?.includes('reproducir en pantalla completa')
      );
      if (cards.length > 0) {
        cards[0].scrollIntoView({ behavior: 'instant', block: 'center' });
        cards[0].click();
      }
    })()`,
    returnByValue: true
  }, sessionId);

  // Wait 2.2 seconds for modal and iframe to mount and load
  await new Promise((r) => setTimeout(r, 2200));

  console.log('4. Capturing YouTube Short Modal screenshot...');
  const screenshot = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'youtube-short-modal-inpage-verified.png'), Buffer.from(screenshot.result.data, 'base64'));

  ws.close();
  chrome.kill();
  console.log('✅ Short in-page player modal captured successfully!');
}

testShortModal().catch(console.error);
