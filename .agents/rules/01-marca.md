# 01 · Marca Neblina 105.5 FM: color, tipografía, logo

## Color (usa siempre las variables)
| Variable | HEX | Uso |
|---|---|---|
| --nb-noche | #090A3D | Fondos profundos, titulares de piezas, horario, barra lateral de sistemas |
| --nb-azul-paramo | #0B244D | Interfaz: menús, logo plano, texto de interfaz sobre claro |
| --nb-verde-senal | #0ADDA0 | Acento plano: en vivo, play, foco, botón principal |
| --nb-destello | #20F7CE | SOLO dentro del degradado y la estela. Nunca plano ni como texto |
| --nb-blanco | #FFFFFF | Texto sobre Noche y sobre degradado de texto |
| --nb-plata (degradado) | #F2F2F2→#CCCCCC | Placa del logo, barra social, sticker de programas |
| --nb-verde-texto | #05634A | Verde cuando va como texto sobre blanco |
Apoyo: --nb-neblina-clara #F2F9FD (fondo claro), --nb-texto #33415A, --nb-texto-sec #5B6A82.

Contraste (AA): blanco/Noche 18,7 ✔ · Verde Señal/Noche 11,6 ✔ · Noche/Verde Señal ✔ (texto de botón) · Verde Señal/blanco 1,9 ✘ (no usar como texto en claro: usa --nb-verde-texto).
Equivalencias de la web actual: #00DD9E → --nb-verde-senal · #001E4D → --nb-azul-paramo (interfaz) o --nb-noche (fondos).

## Degradados
- `--nb-degradado` (120°, Destello→Noche→Destello→Noche): logo, ícono, fondos de héroe SIN texto encima.
- `--nb-grad-texto` (destello solo en bordes, centro Noche): chips, botones o bandas CON texto blanco.
- Nunca: degradado rotado a otro ángulo, con otros colores, en texto (background-clip:text), ni texto sobre la franja clara.

## Tipografía
| Familia | Pesos | Uso | Nunca |
|---|---|---|---|
| Metro DF | 400 | Titulares de marca cortos, MAYÚSCULAS, ≤6 palabras | Párrafos, minúsculas, botones, formularios |
| Lato | 400 / 700 / 900 | Todo: titulares de interfaz (900), cuerpo (400, interlineado 1,6), botones (900) | Cursivas falsas, estirar, tracking negativo en cuerpo |
| JetBrains Mono | 500 | Solo sistemas internos: tiempos, tablas, códigos | Web pública, app, piezas |
Escala web (px): 12 · 14 · 16 (cuerpo) · 20 · 24 · 32 · 44. Móvil mínimo 16 px en cuerpo.
Chip: Lato 900, mayúsculas, tracking .09em. Horario: Lato 900 en Noche, «7:00 am» (espacio antes de am/pm).
Metro DF no trae «×»: usa «x» o reescribe. Si Metro DF no carga, usa la de respaldo `Michroma`.
Licencia: Metro DF tiene fsType=1; confirmar licencia web antes de servirla como @font-face pública.

## Logo
- Archivos en `design/logos/`: `neblina-principal.svg` (con placa plata), `neblina-plano.svg` (una tinta), `icono-app.svg`.
- Espacio libre alrededor = alto de la «n» del logo. Tamaño mínimo: 96 px de ancho en pantalla, 25 mm impreso. Ícono: 24 px.
- Sobre fondo oscuro: logo principal (placa plata) o plano en blanco. Sobre claro: principal o plano en Azul Páramo.
- Nunca: recolorear, deformar, rotar, añadir sombras/contornos, poner sobre fotos sin placa, meterlo en una cápsula.

## Formas madre
- **Cápsula ⅓**: radio = ⅓ del alto. Chips, etiquetas, botones. (36 px de alto → 12 px de radio).
- **Guijarro**: forma orgánica de los botones sociales. Contenedor de íconos de categoría. Un ícono por guijarro, blanco, al 52 %.
- Radios de sistema: campo 14 · sistema 16 · tarjeta 24 · vidrio 28 · píldora 999 (solo barra social y reproductor minimizado).
