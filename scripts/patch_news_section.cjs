const fs = require('fs');

console.log('--- Updating NewsSection.jsx ---');

let code = fs.readFileSync('src/components/NewsSection.jsx', 'utf8');

// 1. Remove text: "Archivo completo de notas de prensa oficiales sincronizadas con neblina105fm.com"
code = code.replace(
  /<p className="text-\[11px\] text-slate-500 dark:text-slate-400">\s*\{isHome\s*\?\s*'Información veraz y al instante desde Santo Domingo, Mérida y Venezuela'\s*:\s*'Archivo completo de notas de prensa oficiales sincronizadas con neblina105fm\.com'\}\s*<\/p>/,
  `{isHome && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Información veraz y al instante desde Santo Domingo, Mérida y Venezuela
                </p>
              )}`
);

// 2. Remove the "Sincronizar" button from header actions
code = code.replace(
  /<button\s+onClick=\{\(\) => loadNews\(true\)\}\s+disabled=\{loading\}\s+className="flex items-center space-x-1\.5 px-3 py-1\.5 rounded-lg bg-white dark:bg-\[#001E4D\]\/80 hover:bg-slate-100 dark:hover:bg-white\/10 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-white\/10 transition shadow-sm cursor-pointer"\s+title="Sincronizar con neblina105fm\.com"\s*>\s*<RefreshCw className=\{`w-3\.5 h-3\.5 \$\{loading \? 'animate-spin' : ''\}`\} \/>\s*<span className="hidden sm:inline">Sincronizar<\/span>\s*<\/button>/,
  ''
);

// 3. Add 45-second background auto-refresh in NewsSection without intrusive spinners
const autoRefreshHook = `
  // Sincronización automática periódica en segundo plano cada 45 segundos sin recargar toda la vista
  useEffect(() => {
    const autoRefreshTimer = setInterval(() => {
      // Sincronizar en background en silencio (showSpinner = false)
      loadNews(false);
    }, 45000);
    return () => clearInterval(autoRefreshTimer);
  }, [isHome, currentPage, debouncedSearch, selectedCategoryId, perPage]);
`;

code = code.replace(
  /window\.addEventListener\('neblina_press_notes_updated', handleNewsUpdate\);/,
  `window.addEventListener('neblina_press_notes_updated', handleNewsUpdate);`
);

// Insert autoRefreshHook before return (
code = code.replace(
  /const handlePageChange =/,
  autoRefreshHook + '\n  const handlePageChange ='
);

// 4. Remove Journalist selector in category bar
const oldCatAndJournalistBar = `<div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none flex-1">
                {categories.map((cat) => {
                  const isSelected = selectedCategoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategoryId(cat.id);
                        setCurrentPage(1);
                      }}
                      className={\`shrink-0 flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-black transition cursor-pointer \${
                        isSelected
                          ? 'bg-[#001E4D] text-[#00DD9E] dark:bg-[#00DD9E] dark:text-[#001E4D] shadow-sm'
                          : 'bg-white/80 dark:bg-[#001E4D]/60 text-slate-700 dark:text-slate-300 hover:text-[#001E4D] dark:hover:text-[#00DD9E] border border-slate-200 dark:border-white/10'
                      }\`}
                    >
                      {cat.isPressCategory && <Feather className="w-3.5 h-3.5" />}
                      <span>{cat.name}</span>
                      {cat.count !== undefined && (
                        <span className={\`text-[11px] px-1.5 py-0.2 rounded-lg font-bold \${
                          isSelected 
                            ? 'bg-white/20 text-[#00DD9E] dark:bg-[#001E4D]/20 dark:text-[#001E4D]' 
                            : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400'
                        }\`}>
                          {cat.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Selector Filtro por Periodista (Aero Glass) */}
              <div className="flex items-center space-x-2 shrink-0 self-start md:self-auto">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center space-x-1">
                  <UserCheck className="w-3.5 h-3.5 text-[#001E4D] dark:text-[#00DD9E]" />
                  <span>Periodista:</span>
                </span>
                <select
                  value={selectedJournalistId}
                  onChange={(e) => {
                    setSelectedJournalistId(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white/90 dark:bg-[#001438] text-slate-800 dark:text-white border border-slate-200 dark:border-[#00DD9E]/30 focus:outline-none focus:ring-1 focus:ring-[#00DD9E] shadow-xs cursor-pointer"
                >
                  <option value="all">Todos los Periodistas</option>
                  {journalistsList.map(j => (
                    <option key={j.id} value={j.id}>
                      {j.name} ({j.role || 'Redactor'})
                    </option>
                  ))}
                </select>
              </div>
            </div>`;

const newCatBar = `<div className="w-full">
              {/* Categorías Oficiales sin sombras pesadas, con bordes limpios y fluidos */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none w-full">
                {categories.map((cat) => {
                  const isSelected = selectedCategoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategoryId(cat.id);
                        setCurrentPage(1);
                      }}
                      className={\`shrink-0 flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer border \${
                        isSelected
                          ? 'bg-[#001E4D] text-[#00DD9E] dark:bg-[#00DD9E] dark:text-[#001E4D] border-[#001E4D] dark:border-[#00DD9E]'
                          : 'bg-white/80 dark:bg-[#001E4D]/40 text-slate-700 dark:text-slate-300 hover:text-[#001E4D] dark:hover:text-[#00DD9E] border-slate-200/80 dark:border-white/10 hover:border-slate-300'
                      }\`}
                    >
                      {cat.isPressCategory && <Feather className="w-3.5 h-3.5" />}
                      <span>{cat.name}</span>
                      {cat.count !== undefined && (
                        <span className={\`text-[11px] px-1.5 py-0.2 rounded-lg font-bold \${
                          isSelected 
                            ? 'bg-white/20 text-[#00DD9E] dark:bg-[#001E4D]/20 dark:text-[#001E4D]' 
                            : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400'
                        }\`}>
                          {cat.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>`;

if (code.includes(oldCatAndJournalistBar)) {
  code = code.replace(oldCatAndJournalistBar, newCatBar);
  console.log('Category bar replaced and journalist selector removed.');
} else {
  console.log('Searching pattern for category bar replacement...');
}

fs.writeFileSync('src/components/NewsSection.jsx', code, 'utf8');
console.log('NewsSection.jsx successfully written.');
