const fs = require('fs');

// 1. StaffPortalModal
let staffModal = fs.readFileSync('src/components/staff/StaffPortalModal.jsx', 'utf8');
staffModal = staffModal.replace(
  /<img\s+src=\{currentStaff\?\.avatar \|\| 'https:\/\/images\.unsplash\.com\/photo-[^']+'\}\s+alt=\{currentStaff\?\.name\}\s+className="w-10 h-10 rounded-xl object-cover border border-\[#00DD9E\]"\s*\/>/,
  `<div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#001E4D] to-slate-800 border border-[#00DD9E] shrink-0 flex items-center justify-center overflow-hidden">
                          {currentStaff?.avatar ? (
                            <img
                              src={currentStaff.avatar}
                              alt={currentStaff?.name}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          ) : (
                            <User className="w-5 h-5 text-[#00DD9E]" />
                          )}
                        </div>`
);
fs.writeFileSync('src/components/staff/StaffPortalModal.jsx', staffModal, 'utf8');
console.log('StaffPortalModal drawer avatar updated');

// 2. JournalistPortalModal
let journModal = fs.readFileSync('src/components/journalists/JournalistPortalModal.jsx', 'utf8');
journModal = journModal.replace(
  /<img\s+src=\{session\?\.avatar \|\| 'https:\/\/images\.unsplash\.com\/photo-[^']+'\}\s+alt=\{session\?\.name\}\s+className="w-12 h-12 rounded-xl object-cover border-2 border-\[#00DD9E\] shadow-xs shrink-0"\s*\/>/,
  `<div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#001E4D] to-slate-800 border-2 border-[#00DD9E] shadow-xs shrink-0 flex items-center justify-center overflow-hidden">
                      {session?.avatar ? (
                        <img
                          src={session.avatar}
                          alt={session?.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <User className="w-6 h-6 text-[#00DD9E]" />
                      )}
                    </div>`
);

journModal = journModal.replace(
  /<img\s+src=\{session\?\.avatar \|\| 'https:\/\/images\.unsplash\.com\/photo-[^']+'\}\s+alt=\{session\?\.name\}\s+className="w-10 h-10 rounded-xl object-cover border border-\[#00DD9E\]"\s*\/>/,
  `<div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#001E4D] to-slate-800 border border-[#00DD9E] shrink-0 flex items-center justify-center overflow-hidden">
                          {session?.avatar ? (
                            <img
                              src={session.avatar}
                              alt={session?.name}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          ) : (
                            <User className="w-5 h-5 text-[#00DD9E]" />
                          )}
                        </div>`
);
fs.writeFileSync('src/components/journalists/JournalistPortalModal.jsx', journModal, 'utf8');
console.log('JournalistPortalModal avatars updated');
