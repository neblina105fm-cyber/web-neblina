const fs = require('fs');

let content = fs.readFileSync('src/components/YouTubeShortsSection.jsx', 'utf8');

// 1. Reemplazar bg-black/92 por efecto Aero Glass difuminado sutil
content = content.replace(
  'bg-black/92 backdrop-blur-2xl',
  'bg-slate-950/40 dark:bg-black/50 backdrop-blur-md'
);

// 2. Eliminar la indicación inferior flotante "Desplaza con la rueda o desliza verticalmente"
const targetText = `          {/* Indicación Flotante Inferior de Navegación Vertical (Estilo TikTok) */}
          <div className="absolute bottom-20 sm:bottom-22 inset-x-0 flex justify-center pointer-events-none">
            <div className="px-3 py-1 rounded-lg bg-black/60 border border-white/15 backdrop-blur-md text-[11px] text-white/80 flex items-center space-x-1.5 shadow-lg">
              <span className="text-red-400 font-bold">↕️</span>
              <span>Desplaza con la rueda o desliza verticalmente</span>
            </div>
          </div>`;

if (content.includes(targetText)) {
  content = content.replace(targetText, '');
} else {
  // Regex fallback si hay diferencias de whitespace
  content = content.replace(/\{\/\* Indicación Flotante Inferior de Navegación Vertical.*?\n\s*<div className="absolute bottom-20[\s\S]*?Desplaza con la rueda o desliza verticalmente[\s\S]*?<\/div>\s*<\/div>/, '');
}

fs.writeFileSync('src/components/YouTubeShortsSection.jsx', content, 'utf8');
console.log('YouTubeShortsSection aeroglass & hint cleanup applied!');
