import fs from 'fs';

const svg = fs.readFileSync('public/favicon.svg', 'utf8');
console.log('favicon.svg length:', svg.length);
// Extract the <image> tag
const match = svg.match(/<image[\s\S]*?\/>/);
if (match) {
  console.log('Image tag:', match[0].slice(0, 150));
}
