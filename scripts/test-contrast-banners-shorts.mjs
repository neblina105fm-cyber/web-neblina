import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\jtoro\\.gemini\\antigravity\\brain\\736aba55-486f-4001-82db-764cd78f8005';

async function testContrastBannersShorts() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tempProfile = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'chrome-test-contrast-' + Date.now());
  const port = 9345;

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
    console.error('Could not get Chrome debug websocket');
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

  // Set sessionStorage to suppress install popup during visual inspection of page content
  await send('Runtime.evaluate', {
    expression: `(() => {
      sessionStorage.setItem('neblina_install_popup_shown', 'true');
    })()`,
    returnByValue: true
  }, sessionId);

  console.log('1. Setting desktop viewport (1280x900)...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 900,
    deviceScaleFactor: 2,
    mobile: false
  }, sessionId);

  await new Promise((r) => setTimeout(r, 2000));

  // Screenshot 1: Desktop Dark Home (Ad, Weather, NewsCarousel, Sponsors)
  console.log('2. Capturing desktop dark top...');
  const desktopTop = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'desktop-contrast-top-dark.png'), Buffer.from(desktopTop.result.data, 'base64'));

  // Scroll down to 9 News & CitizenReportBanner & WhatsApp Community
  console.log('3. Scrolling to middle content (Citizen Report, WhatsApp Community, Ranking)...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      window.scrollTo({ top: 1100, behavior: 'instant' });
    })()`,
    returnByValue: true
  }, sessionId);

  await new Promise((r) => setTimeout(r, 600));

  const desktopMid = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'desktop-contrast-mid-dark.png'), Buffer.from(desktopMid.result.data, 'base64'));

  // Scroll down to YouTube Shorts
  console.log('4. Scrolling to YouTube Shorts section...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const shortsEl = document.querySelector('h3');
      const allH3 = Array.from(document.querySelectorAll('h3'));
      const shortHeader = allH3.find(h => h.textContent.includes('Shorts Oficiales'));
      if (shortHeader) {
        shortHeader.scrollIntoView({ behavior: 'instant', block: 'start' });
      } else {
        window.scrollTo({ top: 2000, behavior: 'instant' });
      }
    })()`,
    returnByValue: true
  }, sessionId);

  await new Promise((r) => setTimeout(r, 600));

  const desktopShorts = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'desktop-shorts-section-dark.png'), Buffer.from(desktopShorts.result.data, 'base64'));

  // Click on the first YouTube short
  console.log('5. Clicking on first YouTube Short to open modal overlay player...');
  const clickEval = await send('Runtime.evaluate', {
    expression: `(() => {
      const card = document.querySelector('div[title*="reproducir en pantalla completa"]');
      if (card) {
        card.click();
        return { clicked: true, title: card.getAttribute('title') };
      }
      return { clicked: false };
    })()`,
    returnByValue: true
  }, sessionId);

  console.log('Short click eval:', clickEval.result?.value);
  await new Promise((r) => setTimeout(r, 1500));

  // Screenshot of the active YouTube Short Modal Player
  const shortModalScreen = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'youtube-short-modal-player-verified.png'), Buffer.from(shortModalScreen.result.data, 'base64'));

  // Close the short modal with Escape
  console.log('6. Closing YouTube Short modal...');
  await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Escape', code: 'Escape' }, sessionId);
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape' }, sessionId);
  await new Promise((r) => setTimeout(r, 600));

  // Switch to Android Mobile Viewport (412x915)
  console.log('7. Switching to Android Mobile viewport (412x915)...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 412,
    height: 915,
    deviceScaleFactor: 2.625,
    mobile: true
  }, sessionId);

  await send('Runtime.evaluate', {
    expression: `(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    })()`,
    returnByValue: true
  }, sessionId);

  await new Promise((r) => setTimeout(r, 800));

  // Mobile Top
  const mobileTop = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'mobile-android-contrast-top-dark.png'), Buffer.from(mobileTop.result.data, 'base64'));

  // Mobile Scroll to WhatsApp & Shorts
  console.log('8. Scrolling mobile to WhatsApp and Shorts...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const allH3 = Array.from(document.querySelectorAll('h3'));
      const shortHeader = allH3.find(h => h.textContent.includes('Shorts Oficiales'));
      if (shortHeader) {
        shortHeader.scrollIntoView({ behavior: 'instant', block: 'center' });
      } else {
        window.scrollTo({ top: 1600, behavior: 'instant' });
      }
    })()`,
    returnByValue: true
  }, sessionId);

  await new Promise((r) => setTimeout(r, 800));

  const mobileShorts = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'mobile-android-contrast-shorts-dark.png'), Buffer.from(mobileShorts.result.data, 'base64'));

  ws.close();
  chrome.kill();
  console.log('✅ ALL CONTRAST & BANNER SCREENSHOTS CAPTURED SUCCESSFULLY!');
}

testContrastBannersShorts().catch(console.error);
