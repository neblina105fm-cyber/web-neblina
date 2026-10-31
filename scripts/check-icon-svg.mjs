import fs from 'fs';

const svg = fs.readFileSync('public/icon-tight.svg', 'utf8');
console.log('SVG length:', svg.length);
console.log('Contains 105.5 FM paths:', svg.includes('513.8'));
console.log('Contains linear gradients:', svg.includes('paint1_linear_1_2'));
