# 02 · Interfaz web: componentes, íconos, posición, movimiento

## Estructura de la página principal (no cambiar el orden)
1. Barra superior fija (vidrio): logo izq. · menú centro (Noticias, Ranking, Programación, Talentos, Eventos, Aliados, Podcasts, Cabina) · derecha «Portal aliados» (secundario) + «Instalar app» (principal Verde Señal).
2. Aliado destacado (máx. 1, bajo la barra). 3. Cinta en vivo (ubicación, clima, tasa BCV).
4. Última hora (carrusel). 5. Patrocinantes (placas blancas). 6. Tasa BCV. 7. Últimas noticias (3 columnas → 2 → 1).
8. Programación + Ranking. 9. Pie con barra social. Reserva 110 px al final para el reproductor.

## Componentes (clases en design/neblina-kit.css)
- Botón principal `.nb-btn`: Verde Señal, texto Noche Lato 900, alto 48, radio 16. Uno por vista.
- Secundario: borde blanco 18 % sobre oscuro / Azul Páramo 20 % sobre claro.
- Chip `.nb-chip`: --nb-grad-texto, alto 28, radio 9. Variante `.plano` para filtros.
- Tarjeta de noticia: radio 24, foto arriba 16:9, guijarro de categoría (40 px) montado en el borde, título Lato 900 15–17, «Leer nota →» en Verde Señal. Hover: sube 4 px con spring-bounce.
- Vidrio: blur 26, fondo blanco 42 % (claro) o Noche 60–66 % (oscuro), borde blanco 80 % / 16 %, radio 28.
- Reproductor `.nb-player`: fijo abajo centrado, 16 px del borde + safe-area, máx. 780 × 72 (64 en móvil), radio 24, vidrio oscuro. Portada = logo del programa al aire. Play Verde Señal 52 px radio 17. Se minimiza a 132 px.
- Ventana de nota `.nb-overlay` + `.nb-note`: velo rgba(4,6,30,.5) blur 10; panel vidrio máx. 760, radio 28; cierra con X, clic fuera y Esc; foco atrapado; el reproductor sigue sonando.
- Barra social `.nb-social`: 9 botones en orden fijo WhatsApp · Telegram · Facebook · Instagram · TikTok · Threads · X · YouTube · Web; 44 px (mín. 32), separación ⅙ del botón; handle en Lato 900 mayúsculas Noche (claro) o blanco (oscuro). Nunca recolorear los botones.

## Íconos
- Solo `design/iconos.svg` (107 símbolos `#i-nombre`). Trazo 1,8, extremos redondos, `currentColor`.
- Tamaño = 1,25 × tamaño del texto; separación = 0,5 × texto. 16 px texto → 20 px ícono, 8 px de aire.
- A la izquierda del texto, centrado a la altura media de las letras. Excepción: «siguiente/abrir» con flecha a la derecha.
- Botón solo-ícono: 40–44 px, radio ⅓, `aria-label` obligatorio.
- Categorías de noticias van dentro de guijarro. Nunca relleno sólido, nunca mezclar estilos, nunca emojis como íconos.
- Plataformas (Android, iOS, Windows) con íconos genéricos propios; insignias oficiales solo en botones de tienda.

## Fondos y decoración
- Anillos con física: máx. 2 nítidos por pantalla; difusos libres. Sobre oscuro el anillo va blanco→turquesa (`--nb-anillo-oscuro`). Se detienen con prefers-reduced-motion.
- Patrones (Señal, Ondas, Transmisión, Páramo): solo de fondo, opacidad 18–22 %, nunca detrás de párrafos.
- Estela del cursor: solo en héroes de escritorio, nunca en móvil ni en sistemas internos.

## Movimiento (variables --nb-*)
spring-standard 550 ms (aparecer/abrir) · spring-bounce 500 (chips, hover) · snappy 280 (pestañas, interruptores) · gentle 900 (tema) · entrar 420 / salir 220 (paneles) · press escala .96 100 ms · pulso en vivo 1800 ms · escalonado 70 ms. Respeta prefers-reduced-motion (sin desplazamientos, solo opacidad).

## Accesibilidad y calidad
Contraste AA · foco visible (anillo Verde Señal 3 px) · áreas táctiles ≥44 px · imágenes con alt · sin desborde horizontal en 360 px · modo claro y oscuro probados.

## Sistemas internos (#admin, #clientes, #locutores, #periodistas)
Barra lateral Noche, tarjetas radio 16, estados en cápsula (borrador gris, revisión ámbar, publicada Verde Señal, al aire rojo pulso), JetBrains Mono para tiempos/tablas. Acceso: tarjeta de vidrio oscuro con guijarro del portal, campos radio 14, botón Verde Señal. Cabina siempre en modo oscuro.
