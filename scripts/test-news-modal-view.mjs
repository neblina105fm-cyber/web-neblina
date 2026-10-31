import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

async function testNewsModal() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tempProfile = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'chrome-test-modal-' + Date.now());
  const port = 9339;

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

  // Set iPhone viewport (390 x 844) like in user's image
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  }, sessionId);

  // Dismiss privacy consent so it doesn't block clicks
  await send('Runtime.evaluate', {
    expression: `(() => {
      localStorage.setItem('neblina_privacy_consent', 'accepted');
      return true;
    })()`,
    returnByValue: true
  }, sessionId);

  // Inject a test article with an Instagram embed to see it render inside the modal!
  await send('Runtime.evaluate', {
    expression: `(() => {
      const customNews = [{
        id: 'news_ig_demo',
        title: 'Festival Musical y Gastronómico en el Páramo Merideño',
        excerpt: 'Todo listo para el encuentro cultural con las mejores agrupaciones.',
        content: '<p>Este fin de semana Santo Domingo vibrará al ritmo de la música andina y gastronomía típica.</p><blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/reel/DBUxample123/"><div><a href="https://www.instagram.com/reel/DBUxample123/">View this post on Instagram</a></div></blockquote><p>Más información en cabina 105.5 FM.</p>',
        category: 'ES VIRAL',
        author: 'Redacción Neblina',
        date: '21 oct. 2026',
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800',
        featuredInCarousel: true,
        status: 'published'
      }];
      localStorage.setItem('neblina_custom_news_db', JSON.stringify(customNews));
      return true;
    })()`,
    returnByValue: true
  }, sessionId);

  await send('Page.reload', {}, sessionId);
  console.log('⏳ Waiting 3.5s for page reload...');
  await new Promise((r) => setTimeout(r, 3500));

  // Click on "Leer Noticia Completa"
  console.log('👆 Clicking "Leer Noticia Completa"...');
  const clicked = await send('Runtime.evaluate', {
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.innerText && b.innerText.includes('Leer Noticia Completa'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    })()`,
    returnByValue: true
  }, sessionId);
  console.log('🔘 Button clicked result:', clicked.result.value);

  await new Promise((r) => setTimeout(r, 1200));

  // Take screenshot
  const screenshot = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
  const screenshotPath = path.join(process.cwd(), 'modal-separation-test.png');
  fs.writeFileSync(screenshotPath, Buffer.from(screenshot.result.data, 'base64'));
  console.log('📸 Screenshot saved to:', screenshotPath);

  ws.close();
  chrome.kill();
}

testNewsModal().catch(console.error);
