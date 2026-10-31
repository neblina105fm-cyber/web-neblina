// Neblina 105.5 FM · preset de Tailwind (v4). Uso: presets:[require('./neblina-tailwind.js')]
module.exports={theme:{extend:{
 colors:{noche:'#090A3D',destello:'#20F7CE',paramo:'#0B244D',senal:'#0ADDA0','senal-texto':'#05634A',plata:{1:'#F2F2F2',2:'#E6E6E6',3:'#CCCCCC'},neblina:{clara:'#F2F9FD',DEFAULT:'#E3EBF5'},acento:{'buena-vibra':'#7E47DD','el-monstruo-de-la-manana':'#75E12D','entre-el-acordeon-y-el-mariachi':'#0C4D84','la-busetica-tropical':'#CA5C16','la-movil-de-neblina':'#FA0E18','noticiero-102':'#D50000','parajes-andinos':'#2E6344'}},
 backgroundImage:{'nb-degradado':'linear-gradient(120deg,#20F7CE 0%,#090A3D 29%,#21F8D2 70%,#09043A 100%)','nb-texto':'linear-gradient(120deg,#20F7CE 0%,#090A3D 26%,#090A3D 74%,#21F8D2 100%)','nb-plata':'linear-gradient(135deg,#F2F2F2 0%,#CCCCCC 35%,#F2F2F2 52%,#E6E6E6 76%,#F2F2F2 100%)'},
 fontFamily:{marca:['Metro DF','Michroma','sans-serif'],texto:['Lato','system-ui','sans-serif'],datos:['JetBrains Mono','ui-monospace','monospace']},
 borderRadius:{campo:'14px',sistema:'16px',tarjeta:'24px',vidrio:'28px'},
 backdropBlur:{vidrio:'26px'},
 transitionTimingFunction:{standard:'cubic-bezier(.22,1,.36,1)',bounce:'cubic-bezier(.34,1.56,.64,1)',snappy:'cubic-bezier(.2,.9,.25,1)',gentle:'cubic-bezier(.45,0,.15,1)',entrar:'cubic-bezier(0,0,.2,1)',salir:'cubic-bezier(.4,0,1,1)'},
 transitionDuration:{snappy:'280ms',entrar:'420ms',salir:'220ms',standard:'550ms',gentle:'900ms'}
}}};
// Cambios en tu web actual: #00DD9E -> senal (#0ADDA0) · #001E4D -> paramo (#0B244D) en interfaz o noche (#090A3D) en fondos.
