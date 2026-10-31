const fs = require('fs');

const files = [
  'src/components/admin/AdminModal.jsx',
  'src/components/client/ClientPortalModal.jsx',
  'src/components/staff/StaffPortalModal.jsx',
  'src/components/journalists/JournalistPortalModal.jsx'
];

files.forEach(f => {
  const code = fs.readFileSync(f, 'utf8');
  // Extract all imported identifiers
  const imported = new Set();
  const importLines = code.split('\n').filter(l => l.startsWith('import ') || l.trim().startsWith('import {') || l.includes('from '));
  const fullImportsText = code.slice(0, 4000);
  
  // Find JSX component usages <Tag
  const tagRegex = /<([A-Z][a-zA-Z0-9]+)/g;
  let m;
  const missing = [];
  while ((m = tagRegex.exec(code)) !== null) {
    const tag = m[1];
    // If not in fullImportsText and not declared inside component
    if (!fullImportsText.includes(tag)) {
      missing.push(tag);
    }
  }
  console.log(f, 'Missing imports for JSX tags:', [...new Set(missing)]);
});
