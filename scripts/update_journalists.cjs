const fs = require('fs');

let code = fs.readFileSync('src/components/journalists/JournalistPortalModal.jsx', 'utf8');

// 1. Simplify Top Header in JournalistPortalModal:
// Remove Install App, Logout, Volver a Neblina Web and Theme Toggle from top header right side.
const headerActionsStart = '<div className="flex items-center space-x-2">';
const headerEnd = '</header>';
// Find the second occurrence of <div className="flex items-center space-x-2"> after sticky top-0
const headerPos = code.indexOf('<header className="sticky top-0');
if (headerPos !== -1) {
  const hActionPos = code.indexOf('<div className="flex items-center space-x-2">', headerPos + 100);
  const hEndPos = code.indexOf('</header>', hActionPos);

  if (hActionPos !== -1 && hEndPos !== -1) {
    const newHeaderActions = `<div className="flex items-center space-x-2">
            {!isStandalonePage && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-slate-700 dark:text-white flex items-center justify-center transition cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        `;
    code = code.substring(0, hActionPos) + newHeaderActions + code.substring(hEndPos);
    console.log('1. Simplified header in JournalistPortalModal');
  }
}

// 2. Update Desktop Sidebar in JournalistPortalModal to include:
// Top: Journalist Profile Card (Name, Avatar, Role, Permission)
// Bottom: Install App, Toggle Theme, Logout, Volver a Neblina Web
const asideStart = '<aside className="hidden lg:flex w-64 bg-white/70 dark:bg-[#0c141f]/70 backdrop-blur-xl border-r border-slate-200 dark:border-white/10 flex-col justify-between p-4 shrink-0">';
const asideEnd = '</aside>';
const aStartIdx = code.indexOf(asideStart);
const aEndIdx = code.indexOf(asideEnd, aStartIdx);

if (aStartIdx !== -1 && aEndIdx !== -1) {
  const newAside = `<aside className="hidden lg:flex w-72 bg-white/80 dark:bg-[#0c141f]/90 backdrop-blur-xl border-r border-slate-200 dark:border-white/10 flex-col justify-between p-4 shrink-0 overflow-y-auto">
              <div className="space-y-4">
                {/* Cabecera del Sidebar: Perfil Oficial del Periodista */}
                <div className="p-3.5 rounded-2xl bg-slate-100/90 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 space-y-2.5">
                  <div className="flex items-center space-x-3">
                    <img
                      src={session?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80'}
                      alt={session?.name}
                      className="w-12 h-12 rounded-xl object-cover border-2 border-[#00DD9E] shadow-xs shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display font-black text-xs text-slate-900 dark:text-white truncate" title={session?.name}>
                        {session?.name}
                      </h3>
                      <p className="text-[10px] text-emerald-600 dark:text-[#00DD9E] font-bold truncate mt-0.5">
                        {session?.role || 'Periodista'}
                      </p>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-white/10 pt-2 flex justify-between">
                    <span>Permiso:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {session?.canAutoPublish ? 'Publicación Directa' : 'Revisión Editorial'}
                    </span>
                  </div>
                </div>

                <div className="px-3 py-1 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Módulos de Prensa
                </div>

                {/* Botones de Navegación del Periodista */}
                <nav className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('mis_notas')}
                    className={\`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer \${
                      activeTab === 'mis_notas'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md scale-[1.02]'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                    }\`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Newspaper className="w-4 h-4 text-emerald-600 dark:text-[#00DD9E]" />
                      <span>Mis Notas de Prensa</span>
                    </div>
                    <span className="text-[11px] px-1.5 py-0.2 rounded-lg font-bold bg-slate-200 dark:bg-white/10 text-slate-500">
                      {notes.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('nueva_nota')}
                    className={\`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer \${
                      activeTab === 'nueva_nota'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md scale-[1.02]'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                    }\`}
                  >
                    <Plus className="w-4 h-4 text-sky-500" />
                    <span>Redactar Nueva Nota</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('estadisticas')}
                    className={\`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer \${
                      activeTab === 'estadisticas'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md scale-[1.02]'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                    }\`}
                  >
                    <BarChart3 className="w-4 h-4 text-amber-500" />
                    <span>Rendimiento & Métricas</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('perfil_firma')}
                    className={\`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer \${
                      activeTab === 'perfil_firma'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md scale-[1.02]'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                    }\`}
                  >
                    <Feather className="w-4 h-4 text-purple-500" />
                    <span>Firma & Créditos</span>
                  </button>
                </nav>
              </div>

              {/* Pie del Sidebar Desktop: Acciones de Utilidad (Instalar, Tema, Salir, Volver) */}
              <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-2.5">
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
              </div>
            </aside>`;

  code = code.substring(0, aStartIdx) + newAside + code.substring(aEndIdx + asideEnd.length);
  console.log('2. Replaced desktop sidebar in JournalistPortalModal');
}

// 3. Fix Mobile Drawer in JournalistPortalModal (prevent blank screen on mobile!):
// Ensure solid background bg-white dark:bg-[#0c141f], z-50, and full mobile profile & buttons.
const mobileDrawerStart = '{/* DRAWER FLOTANTE PARA DISPOSITIVOS MÓVILES CON AERO GLASS */}';
const mobileDrawerEnd = '{/* Área de Contenido Principal */}';
const mDStart = code.indexOf(mobileDrawerStart);
const mDEnd = code.indexOf(mobileDrawerEnd);

if (mDStart !== -1 && mDEnd !== -1) {
  const newMobileDrawer = `{/* DRAWER FLOTANTE PARA DISPOSITIVOS MÓVILES */}
            {mobileMenuOpen && (
              <div className="lg:hidden fixed inset-0 z-50 flex">
                <div 
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                  onClick={() => setMobileMenuOpen(false)}
                />
                <div className="relative w-80 max-w-[85vw] bg-white dark:bg-[#0c141f] h-full shadow-2xl flex flex-col justify-between p-5 z-10 animate-fadeIn overflow-y-auto">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                      <div className="flex items-center space-x-2">
                        <Newspaper className="w-4 h-4 text-[#00DD9E]" />
                        <span className="font-display font-black text-sm text-slate-900 dark:text-white">Menú de Prensa</span>
                      </div>
                      <button 
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                        aria-label="Cerrar menú"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Tarjeta Móvil del Periodista */}
                    <div className="p-3 rounded-2xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 space-y-2">
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={session?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80'}
                          alt={session?.name}
                          className="w-10 h-10 rounded-xl object-cover border border-[#00DD9E]"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-display font-black text-xs text-slate-900 dark:text-white truncate">{session?.name}</h4>
                          <p className="text-[10px] text-emerald-600 dark:text-[#00DD9E] font-bold truncate">{session?.role}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-200/60 dark:border-white/10">
                        <SystemInstallButton appName="Portal Periodistas" />
                        <button
                          onClick={handleLogout}
                          className="px-2.5 py-1.5 rounded-lg border border-rose-300/40 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center space-x-1"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Salir</span>
                        </button>
                      </div>
                    </div>

                    <nav className="space-y-1">
                      <button
                        type="button"
                        onClick={() => { setActiveTab('mis_notas'); setMobileMenuOpen(false); }}
                        className={\`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer \${
                          activeTab === 'mis_notas'
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                        }\`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <Newspaper className="w-4 h-4 text-emerald-600 dark:text-[#00DD9E]" />
                          <span>Mis Notas de Prensa</span>
                        </div>
                        <span className="text-[11px] px-1.5 py-0.2 rounded-lg font-bold bg-slate-200 dark:bg-white/10">
                          {notes.length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setActiveTab('nueva_nota'); setMobileMenuOpen(false); }}
                        className={\`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer \${
                          activeTab === 'nueva_nota'
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                        }\`}
                      >
                        <Plus className="w-4 h-4 text-sky-500" />
                        <span>Redactar Nueva Nota</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setActiveTab('estadisticas'); setMobileMenuOpen(false); }}
                        className={\`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer \${
                          activeTab === 'estadisticas'
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                        }\`}
                      >
                        <BarChart3 className="w-4 h-4 text-amber-500" />
                        <span>Rendimiento & Métricas</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setActiveTab('perfil_firma'); setMobileMenuOpen(false); }}
                        className={\`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer \${
                          activeTab === 'perfil_firma'
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                        }\`}
                      >
                        <Feather className="w-4 h-4 text-purple-500" />
                        <span>Firma & Créditos</span>
                      </button>
                    </nav>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-2">
                    <button
                      onClick={onClose}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black shadow"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Volver a Neblina Web</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            `;

  code = code.substring(0, mDStart) + newMobileDrawer + code.substring(mDEnd);
  console.log('3. Replaced mobile drawer in JournalistPortalModal (fixed mobile white screen issue)');
}

fs.writeFileSync('src/components/journalists/JournalistPortalModal.jsx', code, 'utf8');
console.log('JournalistPortalModal updated successfully!');
