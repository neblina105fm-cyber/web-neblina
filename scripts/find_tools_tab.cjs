const fs = require('fs');

const f = 'src/components/admin/AdminModal.jsx';
const c = fs.readFileSync(f, 'utf8');
const lines = c.split('\n');
lines.forEach((l, i) => {
  if (l.includes("activeTab === 'tools'")) {
    console.log((i+1) + ': ' + l.trim());
  }
});
