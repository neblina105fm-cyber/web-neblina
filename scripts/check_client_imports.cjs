const fs = require('fs');

const code = fs.readFileSync('src/components/client/ClientPortalModal.jsx', 'utf8');
const header = code.slice(0, 3000);
console.log('Does header have Emoji3D?', header.includes('Emoji3D'));
console.log('Does header have AnimatedBackground?', header.includes('AnimatedBackground'));
console.log('Does header have Bell?', header.includes('Bell'));

const lines = header.split('\n');
console.log(lines.slice(0, 60).join('\n'));
