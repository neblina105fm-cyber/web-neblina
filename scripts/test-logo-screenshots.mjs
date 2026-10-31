import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

async function captureScreenshots() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tempProfile = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'chrome-test-logo-' + Date.now());
  const port = 9334;

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

  if (!wsUrl) {
    chrome.kill();
    process.exit(1);
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

  // 1. Desktop Dark Screenshot
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 450,
    deviceScaleFactor: 2,
    mobile: false
  }, sessionId);

  await new Promise((r) => setTimeout(r, 2000));
  const desktopDark = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
  fs.writeFileSync('logo-desktop-dark.png', Buffer.from(desktopDark.result.data, 'base64'));

  // 2. Mobile Dark Screenshot (iPhone 14)
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 400,
    deviceScaleFactor: 2,
    mobile: true
  }, sessionId);

  await new Promise((r) => setTimeout(r, 500));
  const mobileDark = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
  fs.writeFileSync('logo-mobile-dark.png', Buffer.from(mobileDark.result.data, 'base64'));

  // 3. Toggle to Light Mode
  await send('Runtime.evaluate', {
    expression: `(() => {
      const toggle = document.querySelector('button[aria-label="Cambiar tema"]');
      if (toggle) toggle.click();
    })()`,
    returnByValue: true
  }, sessionId);

  await new Promise((r) => setTimeout(r, 600));

  // 4. Mobile Light Screenshot
  const mobileLight = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
  fs.writeFileSync('logo-mobile-light.png', Buffer.from(mobileLight.result.data, 'base64'));

  // 5. Desktop Light Screenshot
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 450,
    deviceScaleFactor: 2,
    mobile: false
  }, sessionId);

  await new Promise((r) => setTimeout(r, 500));
  const desktopLight = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
  fs.writeFileSync('logo-desktop-light.png', Buffer.from(desktopLight.result.data, 'base64'));

  ws.close();
  chrome.kill();
  console.log('✅ All logo screenshots captured!');
}

captureScreenshots().catch(console.error);
