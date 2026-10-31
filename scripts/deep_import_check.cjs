const fs = require('fs');

function checkFileImports(compPath) {
  const code = fs.readFileSync(compPath, 'utf8');
  const importLines = code.match(/import\s*\{([^}]+)\}\s*from\s*['\"]([^'\"]+)['\"];?/g) || [];
  
  importLines.forEach(imp => {
    const m = imp.match(/import\s*\{([^}]+)\}\s*from\s*['\"]([^'\"]+)['\"]/);
    if (!m) return;
    const names = m[1].split(',').map(s => s.trim().split(/\s+as\s+/)[0]).filter(Boolean);
    const source = m[2];
    
    // If it's a relative import
    if (source.startsWith('.')) {
      let resolved = 'src/' + source.replace(/^\.\.\//, '').replace(/^\.\//, '');
      if (!resolved.endsWith('.js') && !resolved.endsWith('.jsx')) {
        if (fs.existsSync(resolved + '.js')) resolved += '.js';
        else if (fs.existsSync(resolved + '.jsx')) resolved += '.jsx';
      }
      if (fs.existsSync(resolved)) {
        const targetCode = fs.readFileSync(resolved, 'utf8');
        names.forEach(name => {
          if (!targetCode.includes(name)) {
            console.warn(`[${compPath}] ERROR: '${name}' imported from '${source}' but not found in ${resolved}`);
          }
        });
      }
    }
  });
}

checkFileImports('src/components/client/ClientPortalModal.jsx');
checkFileImports('src/components/admin/AdminModal.jsx');
checkFileImports('src/components/staff/StaffPortalModal.jsx');
checkFileImports('src/components/journalists/JournalistPortalModal.jsx');
console.log('Finished import check.');
