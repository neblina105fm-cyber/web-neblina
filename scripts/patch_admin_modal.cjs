const fs = require('fs');

let code = fs.readFileSync('src/components/admin/AdminModal.jsx', 'utf8');

// 1. Import archiveTalent and unarchiveTalent
const oldTalentImports = "import { \n  getAllTalents, \n  saveTalent, \n  trashTalent, \n  restoreTalent, \n  deleteTalent, \n  emptyTalentsTrash, \n  toggleTalentActive, \n  resetDefaultTalents, \n  exportTalentsJSON, \n  importTalentsJSON \n} from '../../services/talentsData';";

const newTalentImports = `import { 
  getAllTalents, 
  saveTalent, 
  trashTalent, 
  restoreTalent, 
  deleteTalent, 
  emptyTalentsTrash, 
  toggleTalentActive, 
  resetDefaultTalents, 
  exportTalentsJSON, 
  importTalentsJSON,
  archiveTalent,
  unarchiveTalent
} from '../../services/talentsData';`;

if (code.includes(oldTalentImports)) {
  code = code.replace(oldTalentImports, newTalentImports);
  console.log('1. Updated talent imports in AdminModal.jsx');
} else {
  // flexible replace
  code = code.replace("import {\n  getAllTalents,", "import {\n  getAllTalents,\n  archiveTalent,\n  unarchiveTalent,");
  code = code.replace("import { \n  getAllTalents,", "import { \n  getAllTalents,\n  archiveTalent,\n  unarchiveTalent,");
  console.log('1. Updated talent imports flexibly');
}

// 2. Add talentFilter state ('active' | 'archived' | 'trash') instead of just talentsTrashView
const oldTalentsTrashState = "const [talentsTrashView, setTalentsTrashView] = useState(false);";
const newTalentsTabState = "const [talentsTabFilter, setTalentsTabFilter] = useState('active'); // 'active' | 'archived' | 'trash'\n  const [talentsTrashView, setTalentsTrashView] = useState(false);";

if (code.includes(oldTalentsTrashState)) {
  code = code.replace(oldTalentsTrashState, newTalentsTabState);
  console.log('2. Added talentsTabFilter state');
}

// 3. Add handler functions for archiving and unarchiving
const oldRestoreTalentHandler = "const handleRestoreTalent = (id) => {";
const newArchiveHandlers = `const handleArchiveTalent = (id, name) => {
    if (window.confirm(\`¿Archivar al locutor "\${name}"? No aparecerá en la grilla pública principal pero mantendrá su historial.\`)) {
      archiveTalent(id);
      setTalentsList(getAllTalents());
      triggerToast('Locutor archivado');
    }
  };

  const handleUnarchiveTalent = (id) => {
    unarchiveTalent(id);
    setTalentsList(getAllTalents());
    triggerToast('Locutor desarchivado y reincorporado');
  };

  const handleRestoreTalent = (id) => {`;

if (code.includes(oldRestoreTalentHandler)) {
  code = code.replace(oldRestoreTalentHandler, newArchiveHandlers);
  console.log('3. Added archive / unarchive handlers in AdminModal.jsx');
}

// 4. Add YouTube Playlist to adminModules list
// In adminModules, let's add { id: 'youtube_playlist', label: 'Playlists de YouTube', emoji: 'musical_note', icon: Radio }
const talentsModulePattern = "{ id: 'talents', label: 'Nuestros Talentos', emoji: 'microphone', icon: Mic, count: talentsList.filter(t => !t.trashed).length },";
const youtubeModuleEntry = `\n    { id: 'youtube_playlist', label: 'Playlists de YouTube', emoji: 'musical_note', icon: Radio, statusPill: ytPlaylistReminder?.shouldRemind ? 'Por cambiar' : undefined },`;

if (code.includes(talentsModulePattern) && !code.includes("id: 'youtube_playlist'")) {
  code = code.replace(talentsModulePattern, talentsModulePattern + youtubeModuleEntry);
  console.log('4. Added Playlists de YouTube to adminModules');
}

// 5. Update Desktop Sidebar in AdminModal to be static, independent scroll and include footer buttons
const adminSidebarStart = '<aside className="hidden lg:flex w-64 bg-white/70 dark:bg-[#0c141f]/70 backdrop-blur-xl border-r border-slate-200 dark:border-white/10 flex-col justify-between p-4 shrink-0">';
const adminSidebarEnd = '</aside>';
const aSStart = code.indexOf(adminSidebarStart);
const aSEnd = code.indexOf(adminSidebarEnd, aSStart);

if (aSStart !== -1 && aSEnd !== -1) {
  const newAdminSidebar = `<aside className="hidden lg:flex w-72 bg-white/80 dark:bg-[#0c141f]/90 backdrop-blur-xl border-r border-slate-200 dark:border-white/10 flex-col justify-between p-4 shrink-0 overflow-y-auto">
              <div className="space-y-4">
                <div className="px-3 py-1 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Módulos de Control
                </div>
                <nav className="space-y-1">
                  {adminModules.map((mod) => {
                    const Icon = mod.icon;
                    const isActive = activeTab === mod.id;
                    return (
                      <button
                        key={mod.id}
                        onClick={() => setActiveTab(mod.id)}
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
                        ) : mod.statusPill ? (
                          <span className={\`text-[11px] font-black px-1.5 py-0.2 rounded-lg \${
                            mod.id === 'youtube_playlist' && ytPlaylistReminder?.shouldRemind
                              ? 'bg-amber-500 text-slate-950 animate-pulse'
                              : wpConfig.status === 'connected' 
                              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' 
                              : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                          }\`}>
                            {mod.statusPill}
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

              {/* Pie del Sidebar Desktop: Acciones de Utilidad (Tema, Salir, Volver) */}
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
              </div>
            </aside>`;

  code = code.substring(0, aSStart) + newAdminSidebar + code.substring(aSEnd + adminSidebarEnd.length);
  console.log('5. Replaced admin desktop sidebar with fixed independent scroll and utility buttons');
}

// 6. Unify the two talent header containers into one single sleek container with tabs (Activos, Archivados, Papelera), Search Bar and Agregar Locutor button!
const talentSectionStart = "{activeTab === 'talents' && (";
const tStartIdx = code.indexOf(talentSectionStart);

// We need to replace from `<SectionTrashToggle` up to before `{isTalentFormOpen && (` and the search bar below it!
const oldSectionTrashStr = '<SectionTrashToggle';
const oldSearchBarEndStr = '{/* LISTADO DE TALENTOS REGISTRADOS */}';

const trashIdx = code.indexOf(oldSectionTrashStr, tStartIdx);
const listIdx = code.indexOf(oldSearchBarEndStr, trashIdx);

if (trashIdx !== -1 && listIdx !== -1) {
  // Let's check if isTalentFormOpen is between them: yes it is.
  // We want the unified header to be above isTalentFormOpen, and remove the duplicate search bar below it.
  const formStartStr = '{/* FORMULARIO MODAL / EN LÍNEA DE TALENTO */}';
  const fStartIdx = code.indexOf(formStartStr, trashIdx);

  const unifiedHeader = `{/* CONTENEDOR UNIFICADO: GESTIÓN DE TALENTOS, PESTAÑAS (ACTIVOS / ARCHIVADOS / PAPELERA), BUSCADOR Y BOTÓN NUEVO */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-3">
                      <div>
                        <h4 className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-white flex items-center space-x-2">
                          <Mic className="w-4 h-4 text-emerald-500" />
                          <span>Gestión de Locutores y Staff ("Nuestros Talentos")</span>
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Agrega, archiva o modifica los locutores oficiales de la emisora, fotos, biografías y horarios.
                        </p>
                      </div>

                      <button
                        onClick={handleOpenCreateTalent}
                        className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition shadow-sm cursor-pointer self-start md:self-auto shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Agregar Locutor / Talento</span>
                      </button>
                    </div>

                    {/* Barra de Filtros por Estado (Activos, Archivados, Papelera) y Buscador Integrado */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-black/30 p-1 rounded-xl border border-slate-200 dark:border-white/10 overflow-x-auto scrollbar-none">
                        <button
                          type="button"
                          onClick={() => { setTalentsTabFilter('active'); setTalentsTrashView(false); }}
                          className={\`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 \${
                            talentsTabFilter === 'active'
                              ? 'bg-emerald-500 text-slate-950 shadow-sm font-black'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }\`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Locutores Activos</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/15">
                            {talentsList.filter(t => !t.trashed && !t.archived).length}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => { setTalentsTabFilter('archived'); setTalentsTrashView(false); }}
                          className={\`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 \${
                            talentsTabFilter === 'archived'
                              ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }\`}
                        >
                          <Archive className="w-3.5 h-3.5" />
                          <span>Locutores Archivados</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/15">
                            {talentsList.filter(t => !t.trashed && !!t.archived).length}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => { setTalentsTabFilter('trash'); setTalentsTrashView(true); }}
                          className={\`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 \${
                            talentsTabFilter === 'trash'
                              ? 'bg-rose-500 text-white shadow-sm font-black'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }\`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Papelera</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/15">
                            {talentsList.filter(t => !!t.trashed).length}
                          </span>
                        </button>
                      </div>

                      {/* Buscador Integrado */}
                      <div className="relative flex-1 max-w-sm">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={talentSearch}
                          onChange={(e) => setTalentSearch(e.target.value)}
                          placeholder="Buscar locutor por nombre, programa..."
                          className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#00DD9E]"
                        />
                      </div>
                    </div>
                  </div>

                  `;

  // We replace from trashIdx to fStartIdx with unifiedHeader
  code = code.substring(0, trashIdx) + unifiedHeader + code.substring(fStartIdx);
  console.log('6. Replaced separate containers with unified talent container with Activos, Archivados and Papelera tabs');

  // Now remove the duplicate old search bar below the form:
  const oldSearchBelowFormStart = '{/* BUSCADOR DE TALENTOS */}';
  const oldSearchBelowFormEnd = '{/* LISTADO DE TALENTOS REGISTRADOS */}';
  const sStart = code.indexOf(oldSearchBelowFormStart);
  const sEnd = code.indexOf(oldSearchBelowFormEnd);
  if (sStart !== -1 && sEnd !== -1) {
    code = code.substring(0, sStart) + code.substring(sEnd);
    console.log('6b. Removed duplicate search bar below talent form');
  }
}

// 7. Update talent list filter logic to support 'active', 'archived', 'trash'
const oldFilterBlock = `.filter(t => {
                        const isTrash = !!t.trashed;
                        if (talentsTrashView ? !isTrash : isTrash) return false;`;

const newFilterBlock = `.filter(t => {
                        const isTrash = !!t.trashed;
                        const isArchived = !!t.archived;
                        if (talentsTabFilter === 'trash') {
                          if (!isTrash) return false;
                        } else if (talentsTabFilter === 'archived') {
                          if (isTrash || !isArchived) return false;
                        } else {
                          // active
                          if (isTrash || isArchived) return false;
                        }`;

if (code.includes(oldFilterBlock)) {
  code = code.replace(oldFilterBlock, newFilterBlock);
  console.log('7. Updated talents filter block for active / archived / trash views');
}

// 8. Add Archivar / Desarchivar button to talent card action buttons
const oldTalentCardActions = "{/* ACCIONES DE TARJETA */}";
// In the talent card, let's see how buttons are rendered:
// If talent is archived, show Desarchivar button
// If talent is active, show Archivar button
const oldArchiveBtnStr = "<button\n                                onClick={() => handleEditTalent(talent)}";
const newArchiveBtnStr = `{talent.archived ? (
                                <button
                                  onClick={() => handleUnarchiveTalent(talent.id)}
                                  className="p-1.5 rounded-lg border border-amber-300 dark:border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500 hover:text-slate-950 text-xs font-bold flex items-center space-x-1 cursor-pointer"
                                  title="Reincorporar locutor a la grilla activa"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Desarchivar</span>
                                </button>
                              ) : !talent.trashed ? (
                                <button
                                  onClick={() => handleArchiveTalent(talent.id, talent.name)}
                                  className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 hover:text-amber-500 hover:bg-amber-500/10 text-xs font-bold flex items-center space-x-1 cursor-pointer"
                                  title="Archivar locutor"
                                >
                                  <Archive className="w-3.5 h-3.5" />
                                  <span>Archivar</span>
                                </button>
                              ) : null}
                              <button
                                onClick={() => handleEditTalent(talent)}`;

if (code.includes(oldArchiveBtnStr)) {
  code = code.replace(oldArchiveBtnStr, newArchiveBtnStr);
  console.log('8. Added Archive / Unarchive buttons to talent cards');
}

// 9. Separate YouTube Playlist from Parrilla Radial and render it in its own Tab `youtube_playlist`
// Remove the YouTube block from `activeTab === 'schedule'`
const ytBlockStart = "{/* PANEL DE GESTIÓN DE PLAYLIST SEMANAL DE YOUTUBE (RANKING & RECOMENDACIONES) */}";
const ytBlockEnd = "{/* PAPELERA SECCIONAL DE PARRILLA RADIAL */}";
const ytStart = code.indexOf(ytBlockStart);
const ytEnd = code.indexOf(ytBlockEnd);

if (ytStart !== -1 && ytEnd !== -1) {
  const extractedYtBlock = code.substring(ytStart, ytEnd);
  // Remove it from Parrilla Radial
  code = code.substring(0, ytStart) + code.substring(ytEnd);
  console.log('9a. Extracted YouTube block from Parrilla Radial');

  // Create new Tab 17 for youtube_playlist right before or after schedule
  const newYtTab = `
              {/* ============================================================== */}
              {/* TAB EXCLUSIVO: GESTIÓN DE PLAYLISTS DE YOUTUBE                  */}
              {/* ============================================================== */}
              {activeTab === 'youtube_playlist' && (
                <div className="space-y-6 animate-fadeIn">
                  ${extractedYtBlock}
                </div>
              )}
`;

  const scheduleTabEndPattern = "{/* ============================================================== */}\n              {/* TAB 5: REPORTES DE CIUDADANOS";
  const altScheduleTabEndPattern = "{/* ============================================================== */}\r\n              {/* TAB 5: REPORTES DE CIUDADANOS";
  
  if (code.includes(scheduleTabEndPattern)) {
    code = code.replace(scheduleTabEndPattern, newYtTab + '\n              ' + scheduleTabEndPattern);
    console.log('9b. Placed YouTube Playlists tab in its own dedicated section (LF)');
  } else if (code.includes(altScheduleTabEndPattern)) {
    code = code.replace(altScheduleTabEndPattern, newYtTab + '\r\n              ' + altScheduleTabEndPattern);
    console.log('9b. Placed YouTube Playlists tab in its own dedicated section (CRLF)');
  } else {
    // Append before closing of tabs
    const lastTabIdx = code.indexOf("{/* ============================================================== */}\n              {/* TAB 16: HERRAMIENTAS");
    if (lastTabIdx !== -1) {
      code = code.substring(0, lastTabIdx) + newYtTab + '\n              ' + code.substring(lastTabIdx);
      console.log('9b. Placed YouTube Playlists tab before tools');
    }
  }
}

// 10. Update reminder banner in header if clicked to go to 'youtube_playlist' tab instead of 'schedule'
code = code.replace("setActiveTab('schedule');", "setActiveTab('youtube_playlist');");
console.log('10. Updated reminder banner click to switch to youtube_playlist tab');

fs.writeFileSync('src/components/admin/AdminModal.jsx', code, 'utf8');
console.log('AdminModal.jsx updated successfully!');
