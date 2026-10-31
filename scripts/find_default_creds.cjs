const fs = require('fs');

const files = [
  'src/components/admin/AdminModal.jsx',
  'src/components/client/ClientPortalModal.jsx',
  'src/components/staff/StaffPortalModal.jsx',
  'src/components/journalists/JournalistPortalModal.jsx'
];

files.forEach(f => {
  const code = fs.readFileSync(f, 'utf8');
  console.log('=== ' + f + ' ===');
  const lines = code.split('\n');
  lines.forEach((l, idx) => {
    if (l.includes('useState(\'admin\')') || l.includes('useState("admin")') || l.includes('handleDemo') || l.includes('Acceso Rápido') || l.includes('Credenciales Rápidas') || l.includes('demo') || l.includes('Demo')) {
      console.log('L' + (idx+1) + ': ' + l.trim().slice(0, 120));
    }
  });
});
