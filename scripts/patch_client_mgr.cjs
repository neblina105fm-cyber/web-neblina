const fs = require('fs');

let code = fs.readFileSync('src/components/admin/AdminClientPortalManager.jsx', 'utf8');

// 1. In the sub-tabs navigation (lines ~415-470):
// We have:
// - Accesos & Claves
// - Material Publicitario
// - Solicitudes & Eventos
// - Facturación
// - Mensajería
// The user asks:
// "al lado del material para redes sociales, las solicitudes de eventos"
// and "me vas a separar por comercios y dentro de los comercios me vas a separar la sección de banners de web, me vas a separar la sección de radio y me vas a separar la sección de publicidad para redes sociales... de igual manera va a pasar con las solicitudes de eventos. Vas a crear la parte en administración interna donde también va a aparecer, al lado del material para redes sociales, las solicitudes de eventos."

// Let's inspect subTab === 'material':
// Right now in subTab === 'material', we have:
// <select value={selectedClientId} ...>
// <select value={selectedChannelType} ...> with options:
// - all: Todas las Secciones
// - web: Página Web
// - radial: Radial (Audios)
// - redes: Redes Sociales
//
// Let's upgrade this selector into prominent, top-level Channel Pills:
// 🌐 Banners & Web
// 📻 Publicidad Radial
// 📱 Material Redes Sociales (Descargas para clientes)
// 📅 Solicitudes & Eventos
//
// And also when viewing each client, or via the client dropdown, allow switching between these 4 channels easily!

const filterBarStart = '<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">';
const fIdx = code.indexOf(filterBarStart);

if (fIdx !== -1) {
  // Let's replace the filters bar with a cleaner, segmented Channel & Comercio view:
  const newSegmentedFilterBar = `{/* BARRA DE SEGMENTACIÓN POR COMERCIO Y CANALES (WEB, RADIAL, REDES SOCIALES, SOLICITUDES DE EVENTOS) */}
          <div className="space-y-3 p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-3">
              <div className="flex items-center space-x-2.5">
                <Store className="w-4 h-4 text-[#00DD9E]" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Comercio Seleccionado:
                </span>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/15 text-xs font-black text-slate-900 dark:text-[#00DD9E] cursor-pointer focus:outline-none"
                >
                  <option value="all">🏢 Todos los Comercios ({clients.length})</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.businessName}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2 self-start md:self-auto">
                <div className="relative w-48">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar en material..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAssetForm(prev => ({ 
                      ...prev, 
                      clientId: selectedClientId !== 'all' ? selectedClientId : (clients[0]?.id || ''),
                      channelType: selectedChannelType !== 'all' ? selectedChannelType : 'web'
                    }));
                    setIsAssetModalOpen(true);
                    scrollToSubpanel('asset-form-inline');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#00DD9E] text-[#001E4D] text-xs font-black uppercase tracking-wider hover:brightness-105 active:scale-95 transition shadow-xs flex items-center space-x-1 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Subir Material</span>
                </button>
              </div>
            </div>

            {/* Pestañas de Canales por Comercio: Web, Radial, Redes Sociales y Solicitudes de Eventos */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedChannelType('all')}
                className={\`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 \${
                  selectedChannelType === 'all'
                    ? 'bg-[#001E4D] text-[#00DD9E] dark:bg-white dark:text-slate-900 font-black shadow-xs'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                }\`}
              >
                <span>📂 Todo el Material</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/15 font-mono">
                  {assets.filter(a => selectedClientId === 'all' || String(a.clientId) === String(selectedClientId)).length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedChannelType('web')}
                className={\`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 \${
                  selectedChannelType === 'web'
                    ? 'bg-sky-600 text-white font-black shadow-xs'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                }\`}
              >
                <span>🌐 Banners & Web</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/15 font-mono">
                  {assets.filter(a => (selectedClientId === 'all' || String(a.clientId) === String(selectedClientId)) && (a.channelType || (a.type === 'audio' ? 'radial' : 'web')) === 'web').length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedChannelType('radial')}
                className={\`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 \${
                  selectedChannelType === 'radial'
                    ? 'bg-emerald-600 text-white font-black shadow-xs'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                }\`}
              >
                <span>📻 Publicidad Radial</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/15 font-mono">
                  {assets.filter(a => (selectedClientId === 'all' || String(a.clientId) === String(selectedClientId)) && (a.channelType || (a.type === 'audio' ? 'radial' : 'web')) === 'radial').length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedChannelType('redes')}
                className={\`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 \${
                  selectedChannelType === 'redes'
                    ? 'bg-purple-600 text-white font-black shadow-xs'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                }\`}
              >
                <span>📱 Publicidad para Redes Sociales</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/15 font-mono">
                  {assets.filter(a => (selectedClientId === 'all' || String(a.clientId) === String(selectedClientId)) && (a.channelType || (a.type === 'audio' ? 'radial' : 'web')) === 'redes').length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSubTab('solicitudes')}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition cursor-pointer shrink-0"
                title="Ver solicitudes de cambio y eventos de los clientes"
              >
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                <span>📅 Solicitudes de Eventos ({requests.length})</span>
              </button>
            </div>
          </div>
`;

  // Find the end of the old filter bar
  const oldFilterBarEnd = '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">';
  const endIdx = code.indexOf(oldFilterBarEnd, fIdx);
  if (endIdx !== -1) {
    code = code.substring(0, fIdx) + newSegmentedFilterBar + '\n\n          ' + code.substring(endIdx);
    console.log('Successfully updated AdminClientPortalManager filter bar');
    fs.writeFileSync('src/components/admin/AdminClientPortalManager.jsx', code, 'utf8');
  }
}
