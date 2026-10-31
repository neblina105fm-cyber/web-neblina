import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

async function testMobileMenu() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tempProfile = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'chrome-test-menu-' + Date.now());
  const port = 9333;

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

  // Wait for port to be ready
  let wsUrl = null;
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 300));
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      const data = await res.json();
      wsUrl = data.webSocketDebuggerUrl;
      if (wsUrl) break;
    } catch (e) {
      // retry
    }
  }

  if (!wsUrl) {
    console.error('❌ Could not connect to Chrome debugging port');
    chrome.kill();
    process.exit(1);
  }

  console.log('✅ Connected to Chrome CDP:', wsUrl);
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

  // 1. Create Target
  const target = await send('Target.createTarget', { url: 'http://localhost:3000' });
  const targetId = target.result.targetId;

  // 2. Attach to Target
  const attached = await send('Target.attachToTarget', { targetId, flatten: true });
  const sessionId = attached.result.sessionId;

  // 3. Emulate iPhone 14 (390 x 844)
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  }, sessionId);

  await send('Page.enable', {}, sessionId);
  await send('Runtime.enable', {}, sessionId);

  console.log('⏳ Waiting for app to load...');
  await new Promise((r) => setTimeout(r, 2500));

  // 4. Check initial mobile header state
  const initialCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const hamburger = document.querySelector('button[aria-label="Abrir Menú"]');
      const dialog = document.querySelector('div[role="dialog"]');
      return {
        hasHamburger: !!hamburger,
        hasDialogInitial: !!dialog
      };
    })()`,
    returnByValue: true
  }, sessionId);
  console.log('📱 Initial check:', initialCheck.result.value);

  // 5. Click hamburger menu
  console.log('👆 Clicking hamburger menu button...');
  const clickResult = await send('Runtime.evaluate', {
    expression: `(() => {
      const hamburger = document.querySelector('button[aria-label="Abrir Menú"]');
      if (hamburger) {
        hamburger.click();
        return true;
      }
      return false;
    })()`,
    returnByValue: true
  }, sessionId);
  console.log('🔘 Click executed:', clickResult.result.value);

  // Wait 400ms for drawer animation
  await new Promise((r) => setTimeout(r, 600));

  // 6. Inspect drawer items
  const drawerCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const dialog = document.querySelector('div[role="dialog"]');
      if (!dialog) return { open: false };
      const buttons = Array.from(dialog.querySelectorAll('button, a')).map(el => el.innerText.trim()).filter(Boolean);
      const title = dialog.querySelector('.font-display')?.innerText;
      return {
        open: true,
        title,
        elementCount: buttons.length,
        buttons: buttons.slice(0, 15)
      };
    })()`,
    returnByValue: true
  }, sessionId);
  console.log('📋 Drawer check results:\n', JSON.stringify(drawerCheck.result.value, null, 2));

  // 7. Capture screenshot
  const screenshot = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
  const screenshotPath = path.join(process.cwd(), 'mobile-menu-verified.png');
  fs.writeFileSync(screenshotPath, Buffer.from(screenshot.result.data, 'base64'));
  console.log('📸 Screenshot saved to:', screenshotPath);

  // 8. Test clicking a tab in the drawer (e.g., "Eventos")
  console.log('👆 Clicking "Eventos" tab in mobile drawer...');
  const clickTab = await send('Runtime.evaluate', {
    expression: `(() => {
      const buttons = Array.from(document.querySelectorAll('div[role="dialog"] button'));
      const eventosBtn = buttons.find(b => b.innerText.includes('Eventos'));
      if (eventosBtn) {
        eventosBtn.click();
        return true;
      }
      return false;
    })()`,
    returnByValue: true
  }, sessionId);
  console.log('🔘 Clicked Eventos:', clickTab.result.value);

  await new Promise((r) => setTimeout(r, 600));

  // 9. Verify drawer closed and Eventos section is shown
  const postClickCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const dialog = document.querySelector('div[role="dialog"]');
      const eventsHeading = document.body.innerText.includes('Cartelera de Eventos') || document.body.innerText.includes('Eventos');
      return {
        drawerClosed: !dialog,
        eventsShown: eventsHeading
      };
    })()`,
    returnByValue: true
  }, sessionId);
  console.log('🎯 Post-click navigation check:', postClickCheck.result.value);

  // Capture navigation screenshot
  const navScreenshot = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
  const navScreenshotPath = path.join(process.cwd(), 'mobile-events-verified.png');
  fs.writeFileSync(navScreenshotPath, Buffer.from(navScreenshot.result.data, 'base64'));
  console.log('📸 Nav screenshot saved to:', navScreenshotPath);

  ws.close();
  chrome.kill();
  console.log('🎉 Verification completed successfully!');
}

testMobileMenu().catch(err => {
  console.error(err);
  process.exit(1);
});
