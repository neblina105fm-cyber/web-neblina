import fs from 'fs';

const content = fs.readFileSync('scripts/figma-node-thumbnail.png', 'utf8');
console.log('First 500 chars:', content.slice(0, 500));
const matches = content.match(/https:\/\/[^"']+\.(png|svg|jpg|jpeg|webp)/gi);
console.log('Matches:', matches ? [...new Set(matches)] : 'none');
const allUrls = content.match(/https:\/\/[^"'\s<>]+/gi);
console.log('All URLs:', allUrls ? [...new Set(allUrls)].slice(0, 20) : 'none');
