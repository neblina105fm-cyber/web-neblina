import fs from 'fs';

const html = fs.readFileSync('scripts/figma-design-page.html', 'utf8');

// Find occurrences of 4:15
let idx = 0;
while ((idx = html.indexOf('4:15', idx)) !== -1) {
  console.log('--- Occurrence at', idx, '---');
  console.log(html.slice(Math.max(0, idx - 200), Math.min(html.length, idx + 400)));
  idx += 4;
}
