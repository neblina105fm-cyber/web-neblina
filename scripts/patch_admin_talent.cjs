const fs = require('fs');

let code = fs.readFileSync('src/components/admin/AdminModal.jsx', 'utf8');

code = code.replace(
  /<img\s+src=\{talent\.photo \|\| '[^']+'\}\s+alt=\{talent\.name\}\s+className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500\/40 shadow-xs flex-shrink-0"\s*\/>/,
  `<div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#001E4D] to-slate-800 border-2 border-emerald-500/40 shadow-xs flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {talent.photo ? (
                          <img
                            src={talent.photo}
                            alt={talent.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <User className="w-6 h-6 text-[#00DD9E]" />
                        )}
                      </div>`
);

code = code.replace(
  /photo: 'https:\/\/images\.unsplash\.com\/photo-[^']+',/,
  "photo: '',"
);

fs.writeFileSync('src/components/admin/AdminModal.jsx', code, 'utf8');
console.log('AdminModal talent photo replaced with User avatar');
