import https from 'node:https';

https.get('https://player.mipanel.stream/player-app-win/7018', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Length:', data.length);
    
    // Look for ranking, top, etc.
    const regex = /(ranking|top|lo más sonado|mas sonado)/gi;
    let match;
    const indices = [];
    while ((match = regex.exec(data)) !== null) {
      indices.push({ text: match[0], index: match.index });
    }
    console.log('Matches found:', indices.length);
    indices.forEach(m => {
      console.log('--- Match:', m.text, 'at', m.index);
      console.log(data.substring(Math.max(0, m.index - 100), Math.min(data.length, m.index + 200)));
    });

    // Check all script tags and iframes
    const scripts = data.match(/<script[\s\S]*?<\/script>/gi) || [];
    console.log('\nTotal scripts:', scripts.length);
    scripts.forEach((s, i) => {
      if (s.includes('http') || s.includes('api') || s.includes('top') || s.includes('ranking') || s.includes('7018')) {
        console.log(`Script ${i}:`, s.substring(0, 300));
      }
    });
  });
}).on('error', err => console.error(err));
