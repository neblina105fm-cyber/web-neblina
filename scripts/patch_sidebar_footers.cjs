const fs = require('fs');

// Function to update the sidebar footer in a file
function updateSidebarFooter(filePath, appName) {
  let code = fs.readFileSync(filePath, 'utf8');

  // Regex or pattern to replace the 3 bottom buttons:
  // Cerrar Sesión -> top
  // Instalar App & Tema -> middle
  // Volver a la Web -> bottom

  // Look for the block containing LogOut, SystemInstallButton, and onClose / Volver a la Web
  const oldPattern1 = /<div className="pt-4 border-t border-slate-200 dark:border-white\/10 space-y-2\.5">[\s\S]*?<\/aside>/;
  const oldPattern2 = /<div className="pt-4 border-t border-slate-200 dark:border-white\/10 space-y-2\.5">[\s\S]*?<\/div>[\s\S]*?<\/aside>/;

  const newFooter = `<div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-2.5">
                {/* 1. Botón Superior: Cerrar Sesión */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl border border-rose-300/40 bg-rose-500/10 hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white font-bold text-xs transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>

                {/* 2. Botones de la Mitad: Instalar App y Cambiar Tema */}
                <div className="grid grid-cols-2 gap-2">
                  <SystemInstallButton appName="${appName}" className="w-full justify-center" />
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/15 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-bold transition cursor-pointer"
                    title={\`Cambiar a tema \${theme === 'dark' ? 'claro' : 'oscuro'}\`}
                  >
                    {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
                    <span>{theme === 'dark' ? 'Claro' : 'Oscuro'}</span>
                  </button>
                </div>

                {/* 3. Botón Inferior: Volver a la Web */}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Volver a la Web</span>
                </button>
              </div>
            </aside>`;

  if (oldPattern1.test(code)) {
    code = code.replace(oldPattern1, newFooter);
    fs.writeFileSync(filePath, code, 'utf8');
    console.log('Updated sidebar footer in:', filePath);
  } else {
    console.log('Pattern not matched in:', filePath);
  }
}

updateSidebarFooter('src/components/journalists/JournalistPortalModal.jsx', 'Portal Periodistas');
updateSidebarFooter('src/components/staff/StaffPortalModal.jsx', 'Portal Locutores');
updateSidebarFooter('src/components/client/ClientPortalModal.jsx', 'Portal Aliados');
updateSidebarFooter('src/components/admin/AdminModal.jsx', 'Neblina Admin');
