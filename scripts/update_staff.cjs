const fs = require('fs');

let code = fs.readFileSync('src/components/staff/StaffPortalModal.jsx', 'utf8');

// 1. Simplify top header when currentStaff is logged in:
// Remove the buttons from the top header right side and keep only a clean top or compact header.
// Notice lines 683-720:
// We want to remove ThemeToggle, SystemInstallButton, Logout and Volver a Neblina Web from the top right,
// leaving them in the left sidebar!
// In the top header right side, we can just leave a compact close 'X' button or nothing if user is logged in.

const headerActionsStart = '{/* Acciones de la Cabecera Superior */}';
const headerEnd = '</header>';
const hStartIdx = code.indexOf(headerActionsStart);
const hEndIdx = code.indexOf(headerEnd, hStartIdx);

if (hStartIdx !== -1 && hEndIdx !== -1) {
  const newHeaderActions = `{/* Acciones de la Cabecera Superior: solo cerrar en modal */}
          <div className="flex items-center space-x-2">
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
  code = code.substring(0, hStartIdx) + newHeaderActions + code.substring(hEndIdx);
  console.log('1. Cleaned top header actions in StaffPortalModal');
}

// 2. Remove the top workspace banner (Locutor card + metric boxes + BCV banner)
// Between line 993 and line 1125:
// starts with '{/* Banner Superior con Datos del Locutor & Programa'
// ends before '{/* =====================================================================\n                PESTAÑA 1: CLIENTES & COBRANZAS'
const wsBannerStartStr = '{/* Banner Superior con Datos del Locutor & Programa';
const wsBannerEndStr = '{/* =====================================================================\n                PESTAÑA 1: CLIENTES & COBRANZAS';
const wsAltEndStr = '{/* =====================================================================\r\n                PESTAÑA 1: CLIENTES & COBRANZAS';

const bStart = code.indexOf(wsBannerStartStr);
let bEnd = code.indexOf(wsBannerEndStr);
if (bEnd === -1) bEnd = code.indexOf(wsAltEndStr);

if (bStart !== -1 && bEnd !== -1) {
  code = code.substring(0, bStart) + code.substring(bEnd);
  console.log('2. Removed duplicate locutor banner, metrics and BCV from top of workspace');
} else {
  console.log('Could not find ws banner slice:', bStart, bEnd);
}

// 3. Insert the BCV banner and Metric boxes exclusively into PESTAÑA 1 (Mis Clientes & Cobranzas)
const clientTabStart = "{activeTab === 'clientes' && (\n              <div className=\"space-y-4\">";
const clientAltTabStart = "{activeTab === 'clientes' && (\r\n              <div className=\"space-y-4\">";

const bcvAndMetricsForClientes = `
                {/* Métricas Resumidas del Locutor con Alto Contraste */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center animate-fadeIn">
                  <div className="p-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 shadow-xs">
                    <span className="flex items-center justify-center space-x-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <Users className="w-3.5 h-3.5 text-[#00DD9E]" />
                      <span>Mis Clientes</span>
                    </span>
                    <span className="text-lg font-black text-slate-900 dark:text-white block mt-0.5">{staffMetrics?.activeClientsCount || 0}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 shadow-xs">
                    <span className="flex items-center justify-center space-x-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Total Pautas</span>
                    </span>
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 block mt-0.5">\${staffMetrics?.totalBilledUsd || 0}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 shadow-xs">
                    <span className="flex items-center justify-center space-x-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-300" />
                      <span>Cobrado</span>
                    </span>
                    <span className="text-lg font-black text-teal-600 dark:text-teal-300 block mt-0.5">\${staffMetrics?.totalCollectedUsd || 0}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 shadow-xs">
                    <span className="flex items-center justify-center space-x-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-300" />
                      <span>Pendiente</span>
                    </span>
                    <span className="text-lg font-black text-amber-600 dark:text-amber-300 block mt-0.5">\${staffMetrics?.totalPendingUsd || 0}</span>
                  </div>
                </div>

                {/* Banner Oficial de Cobranzas con Tasas BCV y Calculadora Rápida */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-slate-100/90 to-sky-500/10 dark:from-emerald-500/10 dark:via-white/5 dark:to-sky-500/10 border border-emerald-500/30 shadow-xs">
                  <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                    
                    {/* Cintillo Tasas BCV */}
                    <div className="flex-1 flex flex-wrap items-center gap-2.5">
                      <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-[#00DD9E]">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-wider">Tasas Oficiales BCV</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">USD $:</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
                          {(bcvRates.usd || 884.75).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs.
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">EUR €:</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
                          {(bcvRates.eur || 993.21).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs.
                        </span>
                      </div>

                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 hidden sm:inline">
                        • Fecha: {bcvRates.fechaValor || 'Hoy'}
                      </span>
                    </div>

                    {/* Calculadora Cambiaria Rápida */}
                    <div className="flex items-center space-x-2 bg-white dark:bg-[#001438] p-1.5 rounded-2xl border border-slate-200 dark:border-white/15 shadow-xs">
                      <div className="flex items-center space-x-1 pl-2">
                        <Calculator className="w-4 h-4 text-emerald-600 dark:text-[#00DD9E]" />
                        <select
                          value={calcCurrency}
                          onChange={(e) => setCalcCurrency(e.target.value)}
                          className="text-xs font-black bg-transparent text-slate-800 dark:text-white focus:outline-none cursor-pointer"
                        >
                          <option value="USD">USD $</option>
                          <option value="EUR">EUR €</option>
                        </select>
                      </div>

                      <input
                        type="number"
                        value={calcAmount}
                        onChange={(e) => setCalcAmount(e.target.value)}
                        className="w-20 px-2 py-1 text-xs font-bold rounded-xl bg-slate-100 dark:bg-black/40 text-slate-900 dark:text-white text-right focus:outline-none focus:ring-1 focus:ring-[#00DD9E]"
                        placeholder="Monto"
                      />

                      <div className="px-2 py-1 text-xs font-mono font-black text-emerald-600 dark:text-[#00DD9E] whitespace-nowrap">
                        = {calcResultBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs.
                      </div>

                      <button
                        type="button"
                        onClick={handleCopyCalc}
                        className="p-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-[#00DD9E] transition cursor-pointer"
                        title="Copiar monto en Bs."
                      >
                        {calcCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                  </div>
                </div>
`;

if (code.includes(clientTabStart)) {
  code = code.replace(clientTabStart, clientTabStart + bcvAndMetricsForClientes);
  console.log('3. Inserted Metrics & BCV banner into Clientes & Cobranzas tab (LF)');
} else if (code.includes(clientAltTabStart)) {
  code = code.replace(clientAltTabStart, clientAltTabStart + bcvAndMetricsForClientes);
  console.log('3. Inserted Metrics & BCV banner into Clientes & Cobranzas tab (CRLF)');
}

// 4. Update the Desktop Sidebar in StaffPortalModal to include:
// Top: Locutor Profile (Avatar, Name, Role, Program & Schedule)
// Bottom: Install App, Toggle Theme, Logout, Volver a Neblina Web
const sidebarStart = '<aside className="hidden lg:flex w-64 bg-white/70 dark:bg-[#0c141f]/70 backdrop-blur-xl border-r border-slate-200 dark:border-white/10 flex-col justify-between p-4 shrink-0">';
const sidebarEnd = '</aside>';
const sStartIdx = code.indexOf(sidebarStart);
const sEndIdx = code.indexOf(sidebarEnd, sStartIdx);

if (sStartIdx !== -1 && sEndIdx !== -1) {
  const newSidebar = `<aside className="hidden lg:flex w-72 bg-white/80 dark:bg-[#0c141f]/90 backdrop-blur-xl border-r border-slate-200 dark:border-white/10 flex-col justify-between p-4 shrink-0 overflow-y-auto">
              <div className="space-y-4">
                {/* Cabecera del Sidebar: Perfil Oficial del Locutor */}
                <div className="p-3.5 rounded-2xl bg-slate-100/90 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 space-y-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src={currentStaff?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80'}
                      alt={currentStaff?.name}
                      className="w-12 h-12 rounded-xl object-cover border-2 border-[#00DD9E] shadow-xs shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display font-black text-xs text-slate-900 dark:text-white truncate" title={currentStaff?.name}>
                        {currentStaff?.name}
                      </h3>
                      <div className="flex items-center space-x-1.5 mt-0.5 flex-wrap">
                        <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-700 dark:text-[#00DD9E]">
                          {currentStaff?.role || 'Locutor'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">
                          {currentStaff?.commissionRate}% com.
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-white/80 dark:bg-black/30 border border-slate-200/60 dark:border-white/10 text-[11px] leading-tight">
                    <p className="font-bold text-emerald-700 dark:text-[#00DD9E] flex items-center space-x-1">
                      <Radio className="w-3 h-3 shrink-0" />
                      <span className="truncate">{currentStaff?.programName}</span>
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {currentStaff?.programSchedule}
                    </p>
                  </div>
                </div>

                <div className="px-3 py-1 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Módulos de Cabina & Ventas
                </div>
                <nav className="space-y-1">
                  {staffModules.map((mod) => {
                    const Icon = mod.icon;
                    const isActive = activeTab === mod.id;
                    return (
                      <button
                        key={mod.id}
                        onClick={() => {
                          setActiveTab(mod.id);
                          if (mod.id === 'chat' && currentStaff?.id) {
                            markStaffMessagesAsRead(currentStaff.id, 'staff');
                            setMessages(getStaffMessages(currentStaff.id));
                          }
                        }}
                        className={\`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer \${
                          isActive
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md scale-[1.02]'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                        }\`}
                      >
                        <div className="flex items-center space-x-2.5">
                          {mod.emoji ? (
                            <Emoji3D name={mod.emoji} className="w-4 h-4 shrink-0 drop-shadow-xs" />
                          ) : (
                            <Icon className={\`w-4 h-4 \${isActive ? 'text-[#00DD9E] dark:text-[#008f7a]' : 'text-slate-400'}\`} />
                          )}
                          <span>{mod.label}</span>
                        </div>
                        {mod.alertCount > 0 ? (
                          <span className="text-[11px] font-black px-1.5 py-0.2 rounded-lg bg-amber-500 text-slate-950">
                            {mod.alertCount}
                          </span>
                        ) : mod.count !== undefined ? (
                          <span className={\`text-[11px] px-1.5 py-0.2 rounded-lg font-bold \${
                            isActive ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900' : 'bg-slate-200 dark:bg-white/10 text-slate-500'
                          }\`}>
                            {mod.count}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Pie del Sidebar Desktop: Acciones de Utilidad (Instalar, Tema, Salir, Volver) */}
              <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-2.5">
                <div className="flex items-center justify-between gap-1.5">
                  <SystemInstallButton appName="Portal Locutores" />
                  
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
                    title="Cerrar Sesión de Locutor"
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

  code = code.substring(0, sStartIdx) + newSidebar + code.substring(sEndIdx + sidebarEnd.length);
  console.log('4. Replaced desktop sidebar in StaffPortalModal');
}

// 5. Update Mobile Drawer in StaffPortalModal to have solid background and proper actions
const mobileDrawerStart = '{/* DRAWER FLOTANTE PARA DISPOSITIVOS MÓVILES */}';
const mobileDrawerEnd = '{/* ÁREA DE TRABAJO PRINCIPAL (WORKSPACE) */}';
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
                        <Mic className="w-4 h-4 text-[#00DD9E]" />
                        <span className="font-display font-black text-sm text-slate-900 dark:text-white">Menú de Cabina</span>
                      </div>
                      <button 
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Tarjeta del Locutor en Mobile Drawer */}
                    <div className="p-3 rounded-2xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 space-y-2">
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={currentStaff?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80'}
                          alt={currentStaff?.name}
                          className="w-10 h-10 rounded-xl object-cover border border-[#00DD9E]"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-display font-black text-xs text-slate-900 dark:text-white truncate">
                            {currentStaff?.name}
                          </h4>
                          <p className="text-[10px] text-emerald-600 dark:text-[#00DD9E] font-bold truncate">
                            {currentStaff?.role} · {currentStaff?.programName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-200/60 dark:border-white/10">
                        <SystemInstallButton appName="Portal Locutores" />
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
                      {staffModules.map((mod) => {
                        const Icon = mod.icon;
                        const isActive = activeTab === mod.id;
                        return (
                          <button
                            key={mod.id}
                            onClick={() => {
                              setActiveTab(mod.id);
                              setMobileMenuOpen(false);
                              if (mod.id === 'chat' && currentStaff?.id) {
                                markStaffMessagesAsRead(currentStaff.id, 'staff');
                                setMessages(getStaffMessages(currentStaff.id));
                              }
                            }}
                            className={\`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition \${
                              isActive
                                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                            }\`}
                          >
                            <div className="flex items-center space-x-2.5">
                              {mod.emoji ? (
                                <Emoji3D name={mod.emoji} className="w-4 h-4 shrink-0 drop-shadow-xs" />
                              ) : (
                                <Icon className="w-4 h-4" />
                              )}
                              <span>{mod.label}</span>
                            </div>
                            {mod.alertCount > 0 ? (
                              <span className="text-[11px] font-black px-1.5 py-0.2 rounded-lg bg-amber-500 text-slate-950">
                                {mod.alertCount}
                              </span>
                            ) : mod.count !== undefined ? (
                              <span className="text-[11px] px-1.5 py-0.2 rounded-lg font-bold bg-slate-200 dark:bg-white/10">
                                {mod.count}
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </nav>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-2">
                    <button
                      onClick={onClose}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black shadow"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Volver a la Web</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            `;
  code = code.substring(0, mDStart) + newMobileDrawer + code.substring(mDEnd);
  console.log('5. Replaced mobile drawer in StaffPortalModal');
}

fs.writeFileSync('src/components/staff/StaffPortalModal.jsx', code, 'utf8');
console.log('StaffPortalModal updated successfully!');
