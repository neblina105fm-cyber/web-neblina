import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

async function verifyAppleDesign() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tempProfile = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'chrome-apple-pages-clean-' + Date.now());
  const port = 9337;

  console.log('🚀 Spawning headless Chrome on port', port);
  const chrome = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--disable-gpu',
    `--user-data-dir=${tempProfile}`,
    '--no-first-run',
    '--no-default-browser-check',
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
    console.error('❌ Could not connect to Chrome debugging port');
    chrome.kill();
    process.exit(1);
  }

  const { default: WebSocket } = await import('ws').catch(async () => ({ default: globalThis.WebSocket }));
  const ws = new WebSocket(wsUrl);
  await new Promise((resolve) => ws.onopen = resolve);

  let msgId = 1;
  const pending = new Map();
  const consoleLogs = [];
  const networkErrors = [];

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      pending.get(data.id)(data);
      pending.delete(data.id);
    } else if (data.method === 'Console.messageAdded') {
      const m = data.params.message;
      if (m.level === 'error') {
        consoleLogs.push(`[${m.level.toUpperCase()}] ${m.text}`);
      }
    } else if (data.method === 'Runtime.consoleAPICalled') {
      const p = data.params;
      if (p.type === 'error') {
        const text = p.args.map((a) => a.value || a.description || '').join(' ');
        consoleLogs.push(`[CONSOLE.ERROR] ${text}`);
      }
    } else if (data.method === 'Network.responseReceived') {
      const resp = data.params.response;
      if (resp.status >= 400 && !resp.url.includes('favicon.ico')) {
        networkErrors.push(`${resp.status} ${resp.url}`);
      }
    }
  };

  function send(method, params = {}, sessionId) {
    return new Promise((resolve) => {
      const id = msgId++;
      pending.set(id, resolve);
      const payload = { id, method, params };
      if (sessionId) payload.sessionId = sessionId;
      ws.send(JSON.stringify(payload));
    });
  }

  const target = await send('Target.createTarget', { url: 'about:blank' });
  const targetId = target.result.targetId;
  const attached = await send('Target.attachToTarget', { targetId, flatten: true });
  const sessionId = attached.result.sessionId;

  await send('Page.enable', {}, sessionId);
  await send('Runtime.enable', {}, sessionId);
  await send('Console.enable', {}, sessionId);
  await send('Network.enable', {}, sessionId);

  // Inyectar prevención del modal antes de que cargue la página
  await send('Page.addScriptToEvaluateOnNewDocument', {
    source: `sessionStorage.setItem('neblina_install_popup_shown', 'true');`
  }, sessionId);

  // 1. Desktop Dark Mode (1280x900)
  console.log('📸 Capturing Clean Desktop Dark Mode...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 900,
    deviceScaleFactor: 2,
    mobile: false
  }, sessionId);

  await send('Page.navigate', { url: 'http://localhost:3000' }, sessionId);
  await new Promise((r) => setTimeout(r, 3000));

  const snapDesktopDark = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
  const desktopDarkPath = path.join('C:\\Users\\jtoro\\.gemini\\antigravity\\brain\\736aba55-486f-4001-82db-764cd78f8005', 'apple-page-desktop-dark.png');
  fs.writeFileSync(desktopDarkPath, Buffer.from(snapDesktopDark.result.data, 'base64'));

  // 2. Desktop Light Mode
  console.log('📸 Capturing Clean Desktop Light Mode...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    })()`
  }, sessionId);
  await new Promise((r) => setTimeout(r, 600));
  const snapDesktopLight = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
  const desktopLightPath = path.join('C:\\Users\\jtoro\\.gemini\\antigravity\\brain\\736aba55-486f-4001-82db-764cd78f8005', 'apple-page-desktop-light.png');
  fs.writeFileSync(desktopLightPath, Buffer.from(snapDesktopLight.result.data, 'base64'));

  // 3. Mobile Dark Mode (iPhone 14/15 393x852)
  console.log('📸 Capturing Clean Mobile Dark Mode...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    })()`
  }, sessionId);
  await send('Emulation.setDeviceMetricsOverride', {
    width: 393,
    height: 852,
    deviceScaleFactor: 3,
    mobile: true
  }, sessionId);
  await new Promise((r) => setTimeout(r, 600));
  const snapMobileDark = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
  const mobileDarkPath = path.join('C:\\Users\\jtoro\\.gemini\\antigravity\\brain\\736aba55-486f-4001-82db-764cd78f8005', 'apple-page-mobile-dark.png');
  fs.writeFileSync(mobileDarkPath, Buffer.from(snapMobileDark.result.data, 'base64'));

  // 4. Mobile Light Mode
  console.log('📸 Capturing Clean Mobile Light Mode...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    })()`
  }, sessionId);
  await new Promise((r) => setTimeout(r, 600));
  const snapMobileLight = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
  const mobileLightPath = path.join('C:\\Users\\jtoro\\.gemini\\antigravity\\brain\\736aba55-486f-4001-82db-764cd78f8005', 'apple-page-mobile-light.png');
  fs.writeFileSync(mobileLightPath, Buffer.from(snapMobileLight.result.data, 'base64'));

  console.log('\n--- AUDIT SUMMARY ---');
  console.log(`Console Errors: ${consoleLogs.length}`);
  console.log(`Network 4xx/5xx Errors: ${networkErrors.length}`);

  ws.close();
  chrome.kill();
  try {
    fs.rmSync(tempProfile, { recursive: true, force: true });
  } catch (e) {}

  console.log('✅ Finished capture without modal obstruction.');
}

verifyAppleDesign().catch((err) => {
  console.error('❌ Error during verification:', err);
  process.exit(1);
});
