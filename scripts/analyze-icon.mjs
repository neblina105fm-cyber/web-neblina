import fs from 'fs';
const svg = fs.readFileSync('public/icon-tight.svg', 'utf8');
const pathMatches = svg.match(/<path[^>]+>/g) || [];
console.log('Total paths:', pathMatches.length);
pathMatches.forEach((p, i) => {
  const fillMatch = p.match(/fill="([^"]+)"/);
  console.log(`Path ${i} fill:`, fillMatch ? fillMatch[1] : 'none');
});
