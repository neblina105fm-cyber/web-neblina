const fs = require('fs');

let code = fs.readFileSync('src/components/journalists/JournalistPortalModal.jsx', 'utf8');

// The replacement header:
const properHeader = `        {/* 1. Header Oficial de la Barra Superior */}
        <header className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5 border-b border-slate-200/80 dark:border-white/10 aeroglass-nav">
          <div className="flex items-center space-x-3">
            {/* Botón Menú Móvil en Standalone */}
            {session && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
                aria-label="Abrir menú de navegación"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#001E4D] to-[#00DD9E] p-0.5 shadow-md flex items-center justify-center overflow-hidden shrink-0">
              <div className="w-full h-full bg-[#001438] rounded-[14px] flex items-center justify-center text-white">
                <Newspaper className="w-5 h-5 text-[#00DD9E]" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-md">
                  {session ? session.name : 'Portal de Periodistas'}
                </h1>
                <span className="hidden sm:inline-block text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-[#00DD9E]/15 text-emerald-800 dark:text-[#00DD9E] border border-[#00DD9E]/30">
                  105.5 FM
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate max-w-[280px] sm:max-w-md font-medium">
                Neblina Stereo 105.5 FM · Sistema Editorial de Noticias
              </p>
            </div>
          </div>

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
        </header>`;

const hStart = code.indexOf('{/* 1. Header Oficial de la Barra Superior */}');
const hEnd = code.indexOf('{/* 2. Pantalla de Inicio de Sesión si no está autenticado */}');

if (hStart !== -1 && hEnd !== -1) {
  code = code.substring(0, hStart) + properHeader + '\n\n        ' + code.substring(hEnd);
  console.log('Fixed header in JournalistPortalModal');
  fs.writeFileSync('src/components/journalists/JournalistPortalModal.jsx', code, 'utf8');
}
