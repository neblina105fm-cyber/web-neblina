const fs = require('fs');

let code = fs.readFileSync('src/components/admin/AdminJournalistsTab.jsx', 'utf8');

if (!code.includes('User,') && !code.includes('User\n')) {
  code = code.replace(/import\s*\{/, 'import {\n  User,');
}

code = code.replace(
  /<img\s+src=\{j\.avatar\s*\|\|\s*'[^']+'\}\s+alt=\{j\.name\}\s+className="w-12 h-12 rounded-xl object-cover border-2 border-\[#00DD9E\] flex-shrink-0"\s*\/>/,
  `<div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#001E4D] to-slate-800 border-2 border-[#00DD9E] flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {j.avatar ? (
                    <img
                      src={j.avatar}
                      alt={j.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <User className="w-6 h-6 text-[#00DD9E]" />
                  )}
                </div>`
);
fs.writeFileSync('src/components/admin/AdminJournalistsTab.jsx', code, 'utf8');
console.log('Patched AdminJournalistsTab avatar successfully');
