const fs = require('fs');

let content = fs.readFileSync('src/main.jsx', 'utf8');
content = content.replace("navigator.serviceWorker.register('/sw.js')", "navigator.serviceWorker.register('./sw.js')");
fs.writeFileSync('src/main.jsx', content, 'utf8');
console.log('main.jsx service worker path updated to relative ./sw.js cleanly!');
