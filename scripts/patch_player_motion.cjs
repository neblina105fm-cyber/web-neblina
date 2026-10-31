const fs = require('fs');

console.log('--- APLICANDO CLASES DE MOVIMIENTO HIPNÓTICO Y SUTIL A MIXSTYLEPLAYER ---');

const file = 'src/components/MixStylePlayer.jsx';
let c = fs.readFileSync(file, 'utf8');

// 1. Agregar player-glow-drift al contenedor de la barra
c = c.replace(
  'rounded-t-[26px] sm:rounded-t-[30px] shadow-[0_-12px_40px_rgba(0,30,77,0.18)',
  'player-glow-drift rounded-t-[26px] sm:rounded-t-[30px] shadow-[0_-12px_40px_rgba(0,30,77,0.18)'
);

// 2. Agregar anim-live-breathe y pulso fluido al indicador En Vivo
c = c.replace(
  'inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full border border-red-500/80 bg-red-500/10 dark:bg-red-500/20 backdrop-blur-md transition-all duration-300',
  'anim-live-breathe inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full border border-red-500/80 bg-red-500/10 dark:bg-red-500/20 backdrop-blur-md transition-all duration-300'
);

// 3. Shimmer hover al botón de reproducción principal
c = c.replace(
  'rounded-full bg-[#00DD9E] text-[#001E4D] hover:bg-[#00c98f] active:scale-95 flex items-center justify-center transition-transform duration-200 shadow-md',
  'shimmer-hover btn-spring-press rounded-full bg-[#00DD9E] text-[#001E4D] hover:bg-[#00c98f] active:scale-95 flex items-center justify-center transition-all duration-200 shadow-md'
);

// 4. Agregar anim-vinyl-playing a la carátula cuando está reproduciendo
c = c.replace(
  '<div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-[22%] overflow-hidden',
  `<div className={\`relative w-11 h-11 sm:w-12 sm:h-12 rounded-[22%] overflow-hidden \${isPlaying ? 'anim-vinyl-playing' : ''}\``
);

fs.writeFileSync(file, c, 'utf8');
console.log('✓ MixStylePlayer enriquecido con motion sutil.');
