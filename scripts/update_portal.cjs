const fs = require('fs');

let code = fs.readFileSync('src/components/client/ClientPortalModal.jsx', 'utf8');

// 1. Build the Ficha Oficial Tab component string
const fichaTabBlock = `
              {/* ================================================================= */}
              {/* TAB: FICHA OFICIAL DEL ESTABLECIMIENTO                            */}
              {/* ================================================================= */}
              {activeTab === 'ficha' && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-white/10">
                      <div>
                        <div className="flex items-center space-x-2 flex-wrap">
                          <span className="inline-flex items-center space-x-1.5 text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-[#00DD9E]">
                            <Building2 className="w-4 h-4" />
                            <span>Ficha Oficial del Establecimiento</span>
                          </span>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-[#00DD9E] border border-emerald-500/25">
                            Sincronizada con el Sistema Interno de Dirección
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Nombre de registro, marca comercial, datos de RIF y ficha descriptiva para pautas al aire, web y facturación.
                        </p>
                      </div>

                      {!isEditingDescription && (
                        <button
                          type="button"
                          onClick={handleOpenEditProfile}
                          className="self-start sm:self-center flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#001E4D] text-[#00DD9E] dark:bg-[#00DD9E] dark:text-[#001E4D] hover:brightness-105 text-xs font-black transition shadow-xs cursor-pointer flex-shrink-0"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Crear / Solicitar Cambios en la Ficha</span>
                        </button>
                      )}
                    </div>

                    {isEditingDescription ? (
                      <form onSubmit={handleRequestProfileChanges} className="p-4 rounded-xl bg-slate-50 dark:bg-[#001438] border border-emerald-500/30 space-y-3 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Nombre de Registro (Razón Social) *
                            </label>
                            <input
                              type="text"
                              value={profileForm.registeredName}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, registeredName: e.target.value }))}
                              placeholder="Ej: Inversiones El Fogón C.A."
                              required
                              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-semibold"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Nombre Comercial de la Marca *
                            </label>
                            <input
                              type="text"
                              value={profileForm.businessName}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, businessName: e.target.value }))}
                              placeholder="Ej: Restaurante El Fogón del Páramo"
                              required
                              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-semibold"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                              RIF del Establecimiento *
                            </label>
                            <input
                              type="text"
                              value={profileForm.businessRif}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, businessRif: e.target.value }))}
                              placeholder="Ej: J-31489201-4"
                              required
                              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-mono font-semibold"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Ficha Descriptiva del Establecimiento (Detalle para locutores, cuñas y promociones) *
                          </label>
                          <textarea
                            rows={3}
                            value={profileForm.businessDescription}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, businessDescription: e.target.value }))}
                            placeholder="Describa su negocio, especialidades, ubicación exacta, horario y diferenciales para la pauta radial..."
                            required
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white text-xs font-normal"
                          />
                        </div>

                        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200 dark:border-white/10">
                          <button
                            type="button"
                            onClick={() => setIsEditingDescription(false)}
                            className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-white/15 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-1.5 rounded-xl bg-[#00DD9E] text-[#001E4D] font-black hover:brightness-105 shadow-xs cursor-pointer"
                          >
                            Enviar a Revisión de Dirección
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/25 border border-slate-200/80 dark:border-white/10">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                            Nombre de Registro
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white block mt-0.5">
                            {clientData?.registeredName || clientData?.businessName || 'No registrado'}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/25 border border-slate-200/80 dark:border-white/10">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                            Nombre Comercial de la Marca
                          </span>
                          <span className="font-bold text-emerald-600 dark:text-[#00DD9E] block mt-0.5">
                            {clientData?.businessName || session.businessName}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/25 border border-slate-200/80 dark:border-white/10">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                            Datos del RIF
                          </span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white block mt-0.5">
                            {clientData?.businessRif || 'No indicado'}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/25 border border-slate-200/80 dark:border-white/10">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                            Estado de Ficha
                          </span>
                          <span className="font-bold text-emerald-600 dark:text-[#00DD9E] flex items-center space-x-1 mt-0.5">
                            {clientData?.profileStatus === 'pending_review' ? (
                              <>
                                <Clock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                                <span>Cambios en revisión por Dirección</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                <span>Verificada en Sistema</span>
                              </>
                            )}
                          </span>
                        </div>

                        <div className="sm:col-span-2 md:col-span-4 p-3.5 rounded-xl bg-slate-50 dark:bg-black/25 border border-slate-200/80 dark:border-white/10">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                            <FileText className="w-3.5 h-3.5 text-slate-400" />
                            <span>Ficha Descriptiva del Establecimiento</span>
                          </span>
                          <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed mt-1">
                            {clientData?.businessDescription || 'Aún no ha completado la ficha descriptiva de su establecimiento. Pulse en "Crear / Solicitar Cambios en la Ficha" para registrarla.'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
`;

// 2. Remove the old duplicate top section (from startPattern to endPattern)
const startPattern = '{/* 1. CABECERA PRINCIPAL CON ESTADO DE PAUTA Y BOTÓN LOGOUT */}';
const endPattern = '{/* Mensajes de Éxito Globales */}';

const startIndex = code.indexOf(startPattern);
const endIndex = code.indexOf(endPattern);

if (startIndex !== -1 && endIndex !== -1) {
  code = code.substring(0, startIndex) + code.substring(endIndex);
  console.log('Removed duplicate header/ficha/bcv top section');
}

// 3. Insert fichaTabBlock right after tab 1 (Material) or before solicitudes
const altSolicitudes = '{/* TAB 2: SOLICITUDES DE CAMBIO PUBLICITARIO';
const solIndex = code.indexOf(altSolicitudes);
if (solIndex !== -1) {
  const insertPos = code.lastIndexOf('{/* =====', solIndex);
  if (insertPos !== -1) {
    code = code.substring(0, insertPos) + fichaTabBlock + '\n              ' + code.substring(insertPos);
    console.log('Inserted Ficha Tab block');
  }
}

// 4. Update the audio element tag to hook onTimeUpdate and onLoadedMetadata
const oldAudioTag = '<audio ref={audioRef} onEnded={() => setCurrentlyPlayingAudio(null)} className="hidden" />';
const newAudioTag = `<audio
                    ref={audioRef}
                    onTimeUpdate={(e) => setAudioCurrentTime(e.currentTarget.currentTime)}
                    onLoadedMetadata={(e) => setAudioDuration(e.currentTarget.duration || 0)}
                    onEnded={() => {
                      setCurrentlyPlayingAudio(null);
                      setIsAudioPaused(false);
                      setAudioCurrentTime(0);
                    }}
                    className="hidden"
                  />`;

if (code.includes(oldAudioTag)) {
  code = code.replace(oldAudioTag, newAudioTag);
  console.log('Updated audio element tag with time tracking');
}

// 5. Replace Material Publicitario Tab header with 3 separate channel filters and subfilters
const oldFilterBarStart = '{/* Barra de Filtros */}';
const oldFilterBarEnd = '{/* Listado de Materiales */}';
const fStartIndex = code.indexOf(oldFilterBarStart);
const fEndIndex = code.indexOf(oldFilterBarEnd);

if (fStartIndex !== -1 && fEndIndex !== -1) {
  const newFilterBar = `{/* Canales de Material Publicitario: Web, Radial, Redes */}
                  <div className="space-y-3 pb-3 border-b border-slate-200 dark:border-white/10">
                    <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
                      <button
                        type="button"
                        onClick={() => setAssetChannelFilter('all')}
                        className={\`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer shrink-0 \${
                          assetChannelFilter === 'all'
                            ? 'bg-[#001E4D] text-[#00DD9E] dark:bg-white dark:text-slate-900 shadow-sm'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                        }\`}
                      >
                        <span>📁 Todos los Canales</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10 font-bold">
                          {assets.length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAssetChannelFilter('web')}
                        className={\`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer shrink-0 \${
                          assetChannelFilter === 'web'
                            ? 'bg-sky-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                        }\`}
                      >
                        <span>🌐 Material Página Web</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10 font-bold">
                          {assets.filter(a => (a.channelType || (a.type === 'audio' ? 'radial' : 'web')) === 'web').length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAssetChannelFilter('radial')}
                        className={\`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer shrink-0 \${
                          assetChannelFilter === 'radial'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                        }\`}
                      >
                        <span>📻 Material Radial</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10 font-bold">
                          {assets.filter(a => (a.channelType || (a.type === 'audio' ? 'radial' : 'web')) === 'radial').length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAssetChannelFilter('redes')}
                        className={\`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer shrink-0 \${
                          assetChannelFilter === 'redes'
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                        }\`}
                      >
                        <span>📱 Redes Sociales</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10 font-bold">
                          {assets.filter(a => (a.channelType || (a.type === 'audio' ? 'radial' : 'web')) === 'redes').length}
                        </span>
                      </button>
                    </div>

                    {/* Subfiltros por formato y vigencia */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1.5 text-xs">
                        <span className="font-bold text-slate-500">Formato:</span>
                        <button
                          type="button"
                          onClick={() => setAssetTypeFilter('all')}
                          className={\`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer \${
                            assetTypeFilter === 'all'
                              ? 'bg-[#001E4D] text-[#00DD9E] dark:bg-white/20 dark:text-white'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                          }\`}
                        >
                          Todos
                        </button>
                        <button
                          type="button"
                          onClick={() => setAssetTypeFilter('audio')}
                          className={\`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer \${
                            assetTypeFilter === 'audio'
                              ? 'bg-[#001E4D] text-[#00DD9E] dark:bg-white/20 dark:text-white'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                          }\`}
                        >
                          Audios Radiales
                        </button>
                        <button
                          type="button"
                          onClick={() => setAssetTypeFilter('photo')}
                          className={\`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer \${
                            assetTypeFilter === 'photo'
                              ? 'bg-[#001E4D] text-[#00DD9E] dark:bg-white/20 dark:text-white'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                          }\`}
                        >
                          Fotos / Banners
                        </button>
                        <button
                          type="button"
                          onClick={() => setAssetTypeFilter('video')}
                          className={\`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer \${
                            assetTypeFilter === 'video'
                              ? 'bg-[#001E4D] text-[#00DD9E] dark:bg-white/20 dark:text-white'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                          }\`}
                        >
                          Videos / Reels
                        </button>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-500">Vigencia:</span>
                        <select
                          value={assetStatusFilter}
                          onChange={(e) => setAssetStatusFilter(e.target.value)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/10 border border-slate-300 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-white cursor-pointer"
                        >
                          <option value="all">Todas las Vigencias</option>
                          <option value="vigente">Solo Vigentes</option>
                          <option value="no_vigente">No Vigentes / Históricos</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  \${newAudioTag}

                  `;
  code = code.substring(0, fStartIndex) + newFilterBar + code.substring(fEndIndex);
  console.log('Updated Material Tab channels & filter bar');
}

// 6. Update Audio Card in Material Tab with interactive scrub bar + clickable image for lightbox
const oldAudioCardStart = '{isAudio && (';
const oldAudioCardEnd = '{/* Metadatos y Botón de Descarga */}';

const aCardStart = code.indexOf(oldAudioCardStart);
const aCardEnd = code.indexOf(oldAudioCardEnd, aCardStart);

if (aCardStart !== -1 && aCardEnd !== -1) {
  const newAudioCard = `{isAudio && (
                              <div className="my-2.5 p-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                  <button
                                    type="button"
                                    onClick={() => togglePlayAudio(asset)}
                                    className={\`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer \${
                                      isPlaying && !isAudioPaused
                                        ? 'bg-emerald-500 text-white shadow-md'
                                        : 'bg-[#001E4D] text-[#00DD9E] dark:bg-[#00DD9E] dark:text-[#001E4D]'
                                    }\`}
                                  >
                                    {isPlaying && !isAudioPaused ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                                    <span>{isPlaying && !isAudioPaused ? 'Pausar Cuña' : isPlaying && isAudioPaused ? 'Reanudar Cuña' : 'Reproducir Cuña Radial'}</span>
                                  </button>
                                  <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                                    {isPlaying
                                      ? \`\${Math.floor(audioCurrentTime / 60)}:\${String(Math.floor(audioCurrentTime % 60)).padStart(2, '0')} / \${Math.floor(audioDuration / 60)}:\${String(Math.floor(audioDuration % 60)).padStart(2, '0')}\`
                                      : asset.duration || '0:30'}
                                  </span>
                                </div>

                                {/* Barra interactiva para navegar / adelantar dentro del audio */}
                                {isPlaying && (
                                  <div className="pt-1 flex items-center space-x-2">
                                    <input
                                      type="range"
                                      min="0"
                                      max={audioDuration || 100}
                                      step="0.1"
                                      value={audioCurrentTime}
                                      onChange={handleSeekAudio}
                                      className="w-full h-1.5 bg-slate-300 dark:bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#00DD9E]"
                                      title="Deslizar para avanzar o retroceder en el audio"
                                    />
                                  </div>
                                )}
                              </div>
                            )}

                            `;
  code = code.substring(0, aCardStart) + newAudioCard + code.substring(aCardEnd);
  console.log('Updated Audio Card with interactive progress slider and pause toggle');
}

// 7. Update photo image preview in card to open in large imagePreviewModal
const oldPhotoImgTag = '<img \n                                  src={asset.url} \n                                  alt={asset.name} \n                                  className="w-full h-36 object-cover hover:-translate-y-0.5 transition-transform duration-300" \n                                />';
const altPhotoPattern = 'className="w-full h-36 object-cover';
const pIdx = code.indexOf(altPhotoPattern);
if (pIdx !== -1) {
  // Let's replace the whole photo preview container
  const photoContainerStart = code.lastIndexOf('{isPhoto && asset.url && (', pIdx);
  const photoContainerEnd = code.indexOf('</div>\n                            )}', pIdx);
  if (photoContainerStart !== -1 && photoContainerEnd !== -1) {
    const endPoint = photoContainerEnd + '</div>\n                            )}'.length;
    const newPhotoContainer = `{isPhoto && asset.url && (
                              <div
                                onClick={() => setImagePreviewModal(asset)}
                                className="my-2.5 rounded-xl overflow-hidden max-h-44 bg-black/10 cursor-pointer relative group border border-slate-200 dark:border-white/10"
                                title="Haga clic para previsualizar en gran tamaño"
                              >
                                <img 
                                  src={asset.url} 
                                  alt={asset.name} 
                                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" 
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2 text-white text-xs font-black">
                                  <Eye className="w-4 h-4" />
                                  <span>Ver en Gran Tamaño</span>
                                </div>
                              </div>
                            )}`;
    code = code.substring(0, photoContainerStart) + newPhotoContainer + code.substring(endPoint);
    console.log('Updated Photo Card with lightbox click trigger');
  }
}

// 8. Place BCV Rates & Calculator Banner directly inside Facturacion & Pagos Tab (at the very top of it)
const facturacionTabStart = "{activeTab === 'facturacion' && (\n                <div className=\"space-y-5\">";
const bcvInFacturacion = `{activeTab === 'facturacion' && (
                <div className="space-y-5 animate-fadeIn">

                  {/* Banner de Tasas Oficiales BCV con Calculadora Interactiva de Conversión */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-slate-100/80 to-sky-500/10 dark:from-emerald-500/10 dark:via-white/5 dark:to-sky-500/10 border border-emerald-500/30 backdrop-blur-md flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-[#00DD9E]">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            Tasas Oficiales BCV del Día ({bcvRates.fechaValor || 'Hoy'})
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-[#00DD9E]">
                            Oficial
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 text-xs font-black text-slate-900 dark:text-white mt-1">
                          <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-[#00DD9E] border border-emerald-500/20 font-mono">
                            USD $: {bcvRates.usd.toFixed(2)} Bs.
                          </span>
                          <span className="px-2.5 py-0.5 rounded-lg bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/20 font-mono">
                            EUR €: {bcvRates.eur.toFixed(2)} Bs.
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Calculadora Interactiva con Conversión a Bolívares */}
                    <div className="flex items-center flex-wrap gap-2 bg-white dark:bg-[#001438] p-2 rounded-xl border border-slate-200 dark:border-white/15">
                      <span className="text-[11px] font-bold text-slate-500">Calcular:</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={calcAmount}
                        onChange={(e) => setCalcAmount(e.target.value)}
                        className="w-20 px-2 py-1 text-xs font-bold rounded-lg bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white focus:outline-none focus:border-[#00DD9E]"
                        placeholder="Monto"
                        title="Monto en divisas"
                      />
                      <select
                        value={calcCurrency}
                        onChange={(e) => setCalcCurrency(e.target.value)}
                        className="px-2 py-1 text-xs font-black rounded-lg bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-[#00DD9E] cursor-pointer focus:outline-none"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                      </select>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-xs font-mono font-black text-emerald-700 dark:text-[#00DD9E] border border-emerald-500/25">
                        = {calcResult.amountBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs.
                      </span>
                    </div>
                  </div>`;

if (code.includes(facturacionTabStart)) {
  code = code.replace(facturacionTabStart, bcvInFacturacion);
  console.log('Inserted BCV rate & calculator banner inside Facturacion tab');
}

// 9. Add the imagePreviewModal Lightbox overlay before closing tags
const endMarker = '          </div>\n        )}\n\n      </div>\n\n    </div>\n  );\n}';
const altEndMarker = '          </div>\r\n        )}\r\n\r\n      </div>\r\n\r\n    </div>\r\n  );\r\n}';

const lightboxJSX = `
        {/* MODAL / LIGHTBOX DE PREVISUALIZACIÓN DE IMÁGENES EN GRAN TAMAÑO */}
        {imagePreviewModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
            <div 
              className="fixed inset-0"
              onClick={() => setImagePreviewModal(null)}
            />
            <div className="relative z-10 max-w-4xl max-h-[90vh] bg-slate-900 border border-white/20 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
              <div className="p-3 sm:p-4 bg-slate-950/80 border-b border-white/10 flex items-center justify-between gap-3 text-white">
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#00DD9E] block">
                    {imagePreviewModal.category || 'Material Publicitario'} · {imagePreviewModal.channelType ? imagePreviewModal.channelType.toUpperCase() : 'WEB'}
                  </span>
                  <h3 className="font-display font-bold text-sm truncate">
                    {imagePreviewModal.name}
                  </h3>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <a
                    href={imagePreviewModal.url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-[#001E4D] font-black text-xs transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar Original</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setImagePreviewModal(null)}
                    className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-3 sm:p-5 flex items-center justify-center bg-black/50 overflow-auto max-h-[75vh]">
                <img
                  src={imagePreviewModal.url}
                  alt={imagePreviewModal.name}
                  className="max-h-[70vh] max-w-full w-auto h-auto object-contain rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        )}
`;

if (code.includes(endMarker)) {
  code = code.replace(endMarker, lightboxJSX + '\n' + endMarker);
  console.log('Appended Image Preview Modal Lightbox');
} else if (code.includes(altEndMarker)) {
  code = code.replace(altEndMarker, lightboxJSX + '\r\n' + altEndMarker);
  console.log('Appended Image Preview Modal Lightbox (CRLF)');
} else {
  // Find last </div>\n  );\n}
  const lastReturn = code.lastIndexOf('  );\n}');
  if (lastReturn !== -1) {
    code = code.substring(0, lastReturn) + lightboxJSX + '\n' + code.substring(lastReturn);
    console.log('Appended Image Preview Modal Lightbox before last return');
  }
}

fs.writeFileSync('src/components/client/ClientPortalModal.jsx', code, 'utf8');
console.log('ClientPortalModal.jsx update finished successfully.');
