const fs = require('fs');

console.log('--- Updating Buttons Layout in JournalistPortalModal.jsx ---');

let jCode = fs.readFileSync('src/components/journalists/JournalistPortalModal.jsx', 'utf8');

// 1. Desktop Sidebar footer:
// Top: Botón completo Cerrar Sesión
// Middle: Grid 2 columnas: Instalar App (mitad) y Tema (mitad)
// Bottom: Botón Volver a la Web

const oldDesktopFooter = `<div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-2.5">
                <div className="flex items-center justify-between gap-1.5">
                  <SystemInstallButton appName="Portal Periodistas" />
                  
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-xl border border-slate-200 dark:border-white/15 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition cursor-pointer"
                    title={\`Cambiar a tema \${theme === 'dark' ? 'claro' : 'oscuro'}\`}
                  >
                    {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
                  </button>

                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-xl border border-rose-300/40 bg-rose-500/10 hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white transition cursor-pointer"
                    title="Cerrar Sesión de Periodista"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={onClose}
                  className="w-full flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black shadow transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Volver a Neblina Web</span>
                </button>
              </div>`;

const newDesktopFooter = `<div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-2.5">
                {/* Botón Completo de Cerrar Sesión */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl border border-rose-300/40 bg-rose-500/10 hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white font-bold text-xs transition cursor-pointer shadow-xs"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>

                {/* Mitad Instalar App, Mitad Tema */}
                <div className="grid grid-cols-2 gap-2">
                  <SystemInstallButton appName="Portal Periodistas" className="w-full justify-center" />
                  <button
                    onClick={toggleTheme}
                    className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/15 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-bold transition cursor-pointer"
                    title={\`Cambiar a tema \${theme === 'dark' ? 'claro' : 'oscuro'}\`}
                  >
                    {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
                    <span>{theme === 'dark' ? 'Claro' : 'Oscuro'}</span>
                  </button>
                </div>

                {/* Botón Volver a la Web */}
                <button
                  onClick={onClose}
                  className="w-full flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black shadow transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Volver a la Web</span>
                </button>
              </div>`;

if (jCode.includes(oldDesktopFooter)) {
  jCode = jCode.replace(oldDesktopFooter, newDesktopFooter);
  console.log('Desktop footer in JournalistPortalModal replaced successfully.');
} else {
  console.log('Could not find exact oldDesktopFooter in JournalistPortalModal, searching line by line...');
  jCode = jCode.replace(/<span>Volver a Neblina Web<\/span>/g, '<span>Volver a la Web</span>');
}

// Ensure every "Volver a Neblina Web" is replaced with "Volver a la Web"
jCode = jCode.replace(/Volver a Neblina Web/g, 'Volver a la Web');

fs.writeFileSync('src/components/journalists/JournalistPortalModal.jsx', jCode, 'utf8');
console.log('JournalistPortalModal updated.');
