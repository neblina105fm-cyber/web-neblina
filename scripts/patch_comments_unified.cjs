const fs = require('fs');

let code = fs.readFileSync('src/components/admin/AdminModal.jsx', 'utf8');

// Replace the two separate containers:
// 1. <SectionTrashToggle ... />
// 2. <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 dark:bg-[#19222e] p-4 rounded-2xl border border-slate-200 dark:border-white/10"> ... </div>
// and
// 3. The separate search & filter bar below it.
// We will unify everything into a single sleek container!

const commentsSectionStart = "{activeTab === 'comments' && (\n                <div className=\"space-y-6 animate-fadeIn\">";
const commentsSectionAlt = "{activeTab === 'comments' && (\r\n                <div className=\"space-y-6 animate-fadeIn\">";

const targetTrash = '<SectionTrashToggle\n                    isTrashView={commentsTrashView}';
const altTargetTrash = '<SectionTrashToggle\r\n                    isTrashView={commentsTrashView}';

const listStart = '{/* LISTADO DE COMENTARIOS (CARDS) */}';

let cStart = code.indexOf(targetTrash);
if (cStart === -1) cStart = code.indexOf(altTargetTrash);
const cEnd = code.indexOf(listStart);

if (cStart !== -1 && cEnd !== -1) {
  const unifiedCommentsContainer = `{/* CONTENEDOR UNIFICADO: GESTIÓN DE COMENTARIOS, PESTAÑAS (TODOS, PENDIENTES, APROBADOS, RECHAZADOS, PAPELERA), BUSCADOR Y ACCIONES (EXCEL, JSON, RESTABLECER) */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-3">
                      <div>
                        <h4 className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-white flex items-center space-x-2">
                          <MessageSquare className="w-4 h-4 text-[#00DD9E]" />
                          <span>Gestión y Moderación de Comentarios en Prensa</span>
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Aprueba o rechaza los comentarios ciudadanos antes de su publicación web. Cédula y teléfono son de uso exclusivo interno.
                        </p>
                      </div>

                      {/* Botones de Acción Unificados: Restablecer, Excel CSV y JSON */}
                      <div className="flex items-center flex-wrap gap-2 self-start md:self-auto shrink-0">
                        <button
                          type="button"
                          onClick={handleResetComments}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
                          title="Restablecer comentarios de prueba por defecto"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restablecer</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleExportCommentsCSV}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
                          title="Exportar comentarios para Excel en formato CSV"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Excel (CSV)</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleExportCommentsJSON}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
                          title="Exportar respaldo JSON completo"
                        >
                          <span>JSON</span>
                        </button>
                      </div>
                    </div>

                    {/* Barra de Filtros: Pestañas de Estado (Comentarios Activos, Por Revisar/Pendientes, Aprobados, Papelera) y Buscador */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-white/10 overflow-x-auto scrollbar-none">
                        {[
                          { id: 'all', label: 'Comentarios Activos', isTrash: false, count: commentsList.filter(c => !c.trashed).length },
                          { id: 'pending', label: 'Por Revisar', isTrash: false, count: commentsList.filter(c => !c.trashed && c.status === 'pending').length, alert: true },
                          { id: 'approved', label: 'Aprobados', isTrash: false, count: commentsList.filter(c => !c.trashed && c.status === 'approved').length },
                          { id: 'trash', label: 'Papelera', isTrash: true, count: commentsList.filter(c => !!c.trashed).length }
                        ].map((tab) => {
                          const isCurrent = tab.isTrash ? commentsTrashView : (!commentsTrashView && commentStatusFilter === tab.id);
                          return (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => {
                                if (tab.isTrash) {
                                  setCommentsTrashView(true);
                                } else {
                                  setCommentsTrashView(false);
                                  setCommentStatusFilter(tab.id);
                                }
                              }}
                              className={\`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer whitespace-nowrap shrink-0 \${
                                isCurrent
                                  ? tab.isTrash
                                    ? 'bg-rose-500 text-white shadow-sm font-black'
                                    : tab.id === 'pending'
                                    ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                                    : 'bg-emerald-500 text-slate-950 shadow-sm font-black'
                                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                              }\`}
                            >
                              <span>{tab.label}</span>
                              <span className={\`text-[10px] font-black px-1.5 py-0.2 rounded-full \${
                                isCurrent
                                  ? 'bg-black/15 text-current'
                                  : tab.alert && tab.count > 0
                                  ? 'bg-amber-500 text-slate-950 font-black animate-pulse'
                                  : 'bg-black/10 dark:bg-white/10 text-slate-500'
                              }\`}>
                                {tab.count}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Buscador en Tiempo Real */}
                      <div className="relative flex-1 max-w-sm">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Buscar por ciudadano, cédula, teléfono..."
                          value={commentSearch}
                          onChange={(e) => setCommentSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#00DD9E]"
                        />
                      </div>
                    </div>
                  </div>

                  `;

  code = code.substring(0, cStart) + unifiedCommentsContainer + code.substring(cEnd);
  console.log('Unified comments container in AdminModal.jsx successfully!');
  fs.writeFileSync('src/components/admin/AdminModal.jsx', code, 'utf8');
} else {
  console.log('Could not find slice in AdminModal.jsx:', cStart, cEnd);
}
