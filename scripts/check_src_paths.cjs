const fs = require('fs');

const files = [
  'src/components/Navbar.jsx',
  'src/components/Footer.jsx',
  'src/components/client/ClientPortalModal.jsx',
  'src/components/staff/StaffPortalModal.jsx',
  'src/components/journalists/JournalistPortalModal.jsx',
  'src/components/admin/AdminModal.jsx'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    const c = fs.readFileSync(f, 'utf8');
    const matches = c.match(/src=["'](\/[^"']*\.(?:svg|png|jpg|webp))["']/g);
    console.log(f, matches);
  }
});
