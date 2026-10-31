const fs = require('fs');
const lines = fs.readFileSync('src/components/staff/StaffPortalModal.jsx', 'utf8').split('\n');
lines.forEach((l, i) => {
  if (l.includes('Cobranzas') || l.includes('factura') || l.includes('Facturaci')) {
    console.log((i+1) + ': ' + l.trim().substring(0, 80));
  }
});
