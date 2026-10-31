import fs from 'fs';

async function run() {
  const res = await fetch('https://www.figma.com/design/BUnPpoy5RamuIhyqzuSeiL/Sin-t%C3%ADtulo?node-id=4-15&t=meVqs0E3zJaG7TYG-1', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  const html = await res.text();
  fs.writeFileSync('scripts/figma-design-page.html', html);
  console.log('Saved figma-design-page.html. Size:', html.length);
  
  // Search for JSON or state in script tags
  const scripts = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
  console.log('Script tags count:', scripts.length);
  for (let i = 0; i < scripts.length; i++) {
    const s = scripts[i];
    if (s.includes('4:15') || s.includes('4-15') || s.includes('thumbnail') || s.includes('INITIAL_STATE') || s.includes('figma.com')) {
      console.log(`Script ${i} matches, length:`, s.length, 'sample:', s.slice(0, 300));
    }
  }
}
run();
