# Neblina 105.5 FM — proyecto web y app

Radio de Santo Domingo, municipio Cardenal Quintero, Mérida (Venezuela). Lema: «Señal entre la neblina».
Dominio: neblina105fm.com. Marca: **Neblina 105.5 FM** (así, sin «Stereo», salvo que el dueño confirme lo contrario).

## Qué hay en este proyecto
- Web pública (React + Vite + Tailwind), modo oscuro por defecto.
- Módulos internos por ruta: `#admin` (Admin), `#clientes` (Aliados comerciales), `#locutores` (Cabina), `#periodistas` (Redacción), `#tv` (Smart TV).
- App móvil iOS y Android (misma marca, ver reglas de app).

## Fuente de verdad del diseño
El manual de identidad v4.0 manda. Antes de crear o cambiar interfaz, lee:
- @.agents/rules/01-marca.md — color, degradado, tipografía, logo
- @.agents/rules/02-interfaz-web.md — componentes, íconos, posición, movimiento
- @.agents/rules/03-app-movil.md — iOS y Android
- @.agents/rules/04-submarcas-aliados.md — programas, patrocinantes, aliados informativos
Tokens y piezas listas en `design/`: `neblina-tokens-v4.css`, `neblina-tailwind.js`, `neblina-kit.css`, `neblina-kit.js`, `iconos.svg`, `logos/`.

## Reglas que nunca se rompen
1. Usa solo los tokens de `design/`. Nada de colores, radios o sombras inventados.
2. Íconos: solo los de `design/iconos.svg` (trazo 1,8, retícula 24). No mezclar con Lucide, emojis ni otros sets.
3. Tipografía: Lato para todo; Metro DF solo en titulares de marca en mayúsculas; JetBrains Mono solo en sistemas internos.
4. Texto blanco sobre degradado solo con `--nb-grad-texto` (centro Noche). Nunca sobre el degradado original.
5. Un solo reproductor, anclado abajo, en toda la web. Nunca autoplay.
6. Los logos de programas, patrocinantes y aliados no se redibujan ni se recolorean.
7. Si algo no está en el manual, pregunta antes de inventar.

## Cómo trabajar
- Plan corto antes de tocar código; muestra captura del resultado en claro y oscuro, escritorio (1366) y móvil (390).
- Revisa contraste AA (4,5:1 texto normal) y que nada desborde horizontalmente.
- Textos en español de Venezuela, tono cercano y claro. Horas: «7:00 am».
