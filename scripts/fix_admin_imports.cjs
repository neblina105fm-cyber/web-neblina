const fs = require('fs');

let code = fs.readFileSync('src/components/admin/AdminModal.jsx', 'utf8');

// Find and clean up the react-dom / lucide import mix
const badImport = "import {\n  Archive,\n  LogOut, createPortal } from 'react-dom';";
if (code.includes(badImport)) {
  code = code.replace(
    badImport,
    "import { createPortal } from 'react-dom';\nimport {\n  Archive,\n  LogOut,"
  );
  fs.writeFileSync('src/components/admin/AdminModal.jsx', code, 'utf8');
  console.log('Fixed imports in AdminModal.jsx successfully');
} else {
  console.log('Searching pattern...');
  const lines = code.split('\n');
  console.log(lines.slice(0, 10).join('\n'));
}
