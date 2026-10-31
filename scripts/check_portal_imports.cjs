const fs = require('fs');

const clientCode = fs.readFileSync('src/components/client/ClientPortalModal.jsx', 'utf8');
const adminCode = fs.readFileSync('src/components/admin/AdminModal.jsx', 'utf8');

function extractImports(code) {
  const lines = code.split('\n');
  const froms = [];
  lines.forEach(l => {
    if (l.trim().startsWith('import') || l.includes('from ')) {
      const m = l.match(/from\s*['"]([^'"]+)['"]/);
      if (m) froms.push(m[1]);
    }
  });
  return froms;
}

console.log('ClientPortalModal imports:', extractImports(clientCode));
console.log('AdminModal imports:', extractImports(adminCode));
