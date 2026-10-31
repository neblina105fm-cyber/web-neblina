const fs = require('fs');

let code = fs.readFileSync('src/components/admin/AdminModal.jsx', 'utf8');

const youtubeTabBlock = `
              {/* ============================================================== */}
              {/* TAB EXCLUSIVO: GESTIÓN DE PLAYLISTS DE YOUTUBE                  */}
              {/* ============================================================== */}
              {activeTab === 'youtube_playlist' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
                      <div>
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md bg-red-600 text-white text-[11px] font-black uppercase tracking-wider mb-1">
                          <span>YouTube Oficial · Sección Ranking & Música</span>
                        </span>
                        <h4 className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-white">
                          Playlist Semanal Recomendada & Cola de Cambio Automático
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Programa el link de la semana siguiente en cola para que se active automáticamente en el horario elegido. El sistema te recordará 3 días antes si la cola está vacía.
                        </p>
                      </div>
                      <div className="text-right text-[11px] font-bold text-slate-600 dark:text-slate-300">
                        Próximo cambio: <span className="text-[#008f7a] dark:text-[#00DD9E]">{ytPlaylistReminder.nextSwitchFormatted}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Playlist Activa Actual */}
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0c131c] border border-slate-200 dark:border-white/10 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-[#00DD9E]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Playlist Activa Esta Semana</span>
                          </span>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">Título Visible en Recomendaciones</label>
                          <input
                            type="text"
                            value={ytPlaylistCfg.currentTitle || ''}
                            onChange={(e) => setYtPlaylistCfg({ ...ytPlaylistCfg, currentTitle: e.target.value })}
                            placeholder="Ej: Selección Oficial de la Semana · Neblina 105.5 FM"
                            className="w-full text-xs px-3 py-2 rounded-lg bg-white dark:bg-[#141d28] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">URL de Playlist o Video de YouTube Activo</label>
                          <input
                            type="url"
                            value={ytPlaylistCfg.currentUrl || ''}
                            onChange={(e) => setYtPlaylistCfg({ ...ytPlaylistCfg, currentUrl: e.target.value })}
                            placeholder="https://www.youtube.com/watch?v=...&list=..."
                            className="w-full text-xs font-mono px-3 py-2 rounded-lg bg-white dark:bg-[#141d28] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>

                      {/* Playlist en Cola para la Próxima Semana */}
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0c131c] border border-slate-200 dark:border-white/10 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Playlist en Cola (Próxima Semana)</span>
                          </span>
                          {ytPlaylistCfg.queuedUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm('¿Deseas activar esta playlist ahora mismo sin esperar a la fecha programada?')) {
                                  const updated = promoteQueuedPlaylistNow();
                                  setYtPlaylistCfg(updated);
                                  setYtPlaylistReminder(getPlaylistAdminReminderStatus());
                                  triggerToast('¡Playlist en cola promovida como activa inmediatamente!');
                                }
                              }}
                              className="text-[11px] font-bold text-emerald-600 dark:text-[#00DD9E] hover:underline cursor-pointer"
                            >
                              Activar Ahora
                            </button>
                          )}
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">Título de la Próxima Playlist (Opcional)</label>
                          <input
                            type="text"
                            value={ytPlaylistCfg.queuedTitle || ''}
                            onChange={(e) => setYtPlaylistCfg({ ...ytPlaylistCfg, queuedTitle: e.target.value })}
                            placeholder="Ej: Especial Éxitos de Fin de Mes · Neblina 105.5 FM"
                            className="w-full text-xs px-3 py-2 rounded-lg bg-white dark:bg-[#141d28] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">URL de YouTube en Cola (Se activará automáticamente)</label>
                          <input
                            type="url"
                            value={ytPlaylistCfg.queuedUrl || ''}
                            onChange={(e) => setYtPlaylistCfg({ ...ytPlaylistCfg, queuedUrl: e.target.value })}
                            placeholder="Deja aquí el link de la siguiente semana..."
                            className="w-full text-xs font-mono px-3 py-2 rounded-lg bg-white dark:bg-[#141d28] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Selector de Horario de Transición y Botón Guardar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
                      <div className="flex items-center space-x-2">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Horario de Cambio Automático:</label>
                        <select
                          value={ytPlaylistCfg.scheduledSlot || 'lunes_12'}
                          onChange={(e) => setYtPlaylistCfg({ ...ytPlaylistCfg, scheduledSlot: e.target.value })}
                          className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#141d28] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-semibold cursor-pointer"
                        >
                          <option value="lunes_06">Lunes 6:00 AM (Apertura de Semana)</option>
                          <option value="lunes_12">Lunes 12:00 PM (Mediodía - Recomendado)</option>
                          <option value="viernes_18">Viernes 6:00 PM (Fin de Semana)</option>
                          <option value="domingo_23">Domingo 11:59 PM (Medianoche)</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const saved = saveRankingYoutubePlaylist(ytPlaylistCfg);
                          setYtPlaylistCfg(saved);
                          setYtPlaylistReminder(getPlaylistAdminReminderStatus());
                          triggerToast('¡Configuración y cola de Playlist de YouTube guardada!');
                        }}
                        className="px-5 py-2 rounded-xl bg-[#00DD9E] text-[#001E4D] font-black text-xs hover:brightness-105 active:scale-95 transition shadow-sm cursor-pointer"
                      >
                        Guardar Playlist & Cola Semanal
                      </button>
                    </div>
                  </div>
                </div>
              )}
`;

const insertTarget = "{activeTab === 'schedule' && (";
const idx = code.indexOf(insertTarget);
if (idx !== -1) {
  code = code.substring(0, idx) + youtubeTabBlock + '\n              ' + code.substring(idx);
  fs.writeFileSync('src/components/admin/AdminModal.jsx', code, 'utf8');
  console.log('Successfully added activeTab === youtube_playlist before schedule tab');
} else {
  console.log('Could not find insertTarget');
}
