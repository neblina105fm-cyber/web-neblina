const fs = require('fs');

let content = fs.readFileSync('src/components/admin/AdminModal.jsx', 'utf8');

// 1. Ocultar la cabecera superior cuando el usuario ya está autenticado (isAuthenticated)
// Buscamos: <header className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5 border-b border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c141f]/80 backdrop-blur-2xl">
const targetHeader = `<header className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5 border-b border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c141f]/80 backdrop-blur-2xl">`;

const replacementHeader = `{/* CABECERA SUPERIOR (Solo visible en pantalla de login si no está autenticado) */}
        {!isAuthenticated && (
          <header className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5 border-b border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c141f]/80 backdrop-blur-2xl">`;

content = content.replace(targetHeader, replacementHeader);

// Y cerramos el condicional después de </header>
const targetHeaderEnd = `</header>`;
// Reemplazamos la primera ocurrencia de </header>
content = content.replace(targetHeaderEnd, `</header>\n        )}`);

// 2. En el sidebar desktop, agregar en la parte superior el logo y encabezado del Sistema Interno
const targetSidebarTop = `<aside className="hidden lg:flex w-72 bg-white/80 dark:bg-[#0c141f]/90 backdrop-blur-xl border-r border-slate-200 dark:border-white/10 flex-col justify-between p-4 shrink-0 overflow-y-auto">
              <div className="space-y-4">
                <div className="px-3 py-1 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Módulos de Control
                </div>`;

const replacementSidebarTop = `<aside className="hidden lg:flex w-72 bg-white/80 dark:bg-[#0c141f]/90 backdrop-blur-xl border-r border-slate-200 dark:border-white/10 flex-col justify-between p-4 shrink-0 overflow-y-auto">
              <div className="space-y-4">
                {/* Cabecera del Sidebar: Logo Oficial & Sistema Interno */}
                <div className="p-3.5 rounded-2xl bg-slate-100/90 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 space-y-2">
                  <div className="flex items-center space-x-3">
                    <Emoji3D name="key" className="w-10 h-10 drop-shadow-md shrink-0" alt="Sistema Interno" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-1.5">
                        <h3 className="font-display font-black text-xs text-slate-900 dark:text-white truncate">
                          Sistema Interno
                        </h3>
                        <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-700 dark:text-[#00DD9E]">
                          105.5 FM
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        Dirección & Administración
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-3 py-1 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Módulos de Control
                </div>`;

content = content.replace(targetSidebarTop, replacementSidebarTop);

// 3. En la parte inferior del sidebar desktop, reorganizar los botones según instrucción del usuario:
// - Botón completo de cerrar sesión
// - Mitad del espacio instalar app y mitad tema
// - Botón "Volver a la Web"
const targetSidebarFooter = `              {/* Pie del Sidebar Desktop: Acciones de Utilidad (Tema, Salir, Volver) */}
              <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-2.5">
                <div className="flex items-center justify-between gap-1.5">
                  <SystemInstallButton appName="Neblina Admin" />
                  
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
                    title="Cerrar Sesión de Administrador"
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

const replacementSidebarFooter = `              {/* Pie del Sidebar Desktop: Acciones de Utilidad */}
              <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-2.5">
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
                  <SystemInstallButton appName="Neblina Admin" className="w-full justify-center" />
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

content = content.replace(targetSidebarFooter, replacementSidebarFooter);

// 4. En el drawer móvil también agregar el botón de menú flotante en la barra superior móvil si hace falta
// En la barra de pills móvil agregar botón de menú móvil si es standalone
const targetMobileBar = `<div className="lg:hidden flex items-center space-x-1.5 px-4 pt-2.5 pb-2 overflow-x-auto scrollbar-none border-b border-slate-200 dark:border-white/10 bg-white/60 dark:bg-[#0c131c]/60 shrink-0">`;

const replacementMobileBar = `<div className="lg:hidden flex items-center space-x-1.5 px-3 py-2 overflow-x-auto scrollbar-none border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#0c141f]/80 backdrop-blur-xl shrink-0">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="p-1.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10 shrink-0 flex items-center space-x-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold"
                  title="Abrir Menú"
                >
                  <Menu className="w-4 h-4" />
                  <span>Módulos</span>
                </button>`;

content = content.replace(targetMobileBar, replacementMobileBar);

fs.writeFileSync('src/components/admin/AdminModal.jsx', content, 'utf8');
console.log('AdminModal updated with new top bar and sidebar layout!');
