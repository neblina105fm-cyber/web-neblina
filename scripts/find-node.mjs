import fs from 'fs';

const str = fs.readFileSync('scripts/figma-initial-data.json', 'utf8');
const idx = str.indexOf('4:15');
console.log('Index of 4:15:', idx);
if (idx !== -1) {
  console.log(str.slice(Math.max(0, idx - 150), idx + 300));
} else {
  const idx2 = str.indexOf('4-15');
  console.log('Index of 4-15:', idx2);
  if (idx2 !== -1) {
    console.log(str.slice(Math.max(0, idx2 - 150), idx2 + 300));
  }
}

// Find all occurrences of "name": "
const names = [...str.matchAll(/"name":\s*"([^"]+)"/g)].map(m => m[1]);
console.log('Found names:', names);
