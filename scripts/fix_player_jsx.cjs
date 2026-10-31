const fs = require('fs');

const f = 'src/components/MixStylePlayer.jsx';
let c = fs.readFileSync(f, 'utf8');

const target = 'rounded-[22%] overflow-hidden ${isPlaying ? \'anim-vinyl-playing\' : \'\'}` bg-white/50 dark:bg-black/40 border border-white/80 dark:border-[#00DD9E]/40 flex-shrink-0 flex items-center justify-center shadow-sm group">';
const fixed = 'rounded-[22%] overflow-hidden ${isPlaying ? "anim-vinyl-playing" : ""} bg-white/50 dark:bg-black/40 border border-white/80 dark:border-[#00DD9E]/40 flex-shrink-0 flex items-center justify-center shadow-sm group`}>';

c = c.replace(target, fixed);

fs.writeFileSync(f, c, 'utf8');
console.log('✓ JSX corregido en MixStylePlayer.');
