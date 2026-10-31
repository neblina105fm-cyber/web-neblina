# 03 · App móvil Neblina 105.5 FM (iOS y Android)

Una sola marca, dos plataformas. La app se siente nativa en cada una (navegación, gestos, controles del sistema) y la marca vive en color, tipografía, íconos, portadas y movimiento.

## Estructura
Barra inferior con 4 destinos: **En vivo** (inicio) · **Noticias** · **Programación** · **Más** (podcasts, eventos, talentos, contacto, ajustes).
Reproductor mini encima de la barra inferior (alto 64, radio 20, vidrio Noche); al tocarlo abre el reproductor completo (hoja deslizable hacia abajo para cerrar).
Fondo por defecto: oscuro (Noche → Azul Páramo). Modo claro disponible siguiendo al sistema.

## Medidas por plataforma
| | iOS | Android |
|---|---|---|
| Barra inferior | Tab bar 49 pt + indicador de inicio 34 pt | Navigation bar Material 3, 80 dp |
| Márgenes laterales | 16 pt (20 en Pro Max) | 16 dp |
| Zonas seguras | Respetar safe area (isla, notch, indicador) | Edge-to-edge con insets del sistema |
| Títulos | Large title Lato 900 32 al inicio, colapsa a 17 | Top app bar, Lato 900 22 |
| Áreas táctiles | ≥ 44 × 44 pt | ≥ 48 × 48 dp |
| Texto | Respetar Dynamic Type (hasta XXL sin cortar) | Respetar escala de fuente (hasta 200 %) |
| Volver | Deslizar desde el borde | Gesto atrás predictivo |
| Vibración | Impacto ligero al play/pausa | HapticFeedback CONFIRM al play |
| Color dinámico | — | Desactivar Material You: la app usa su paleta de marca |

## Reproductor completo
Portada 1:1 con el logo del programa al aire sobre placa clara (radio 28) y anillos difusos detrás (blanco→turquesa).
Debajo: nombre del programa (Lato 900 24), locutor (Lato 400 16, texto secundario), punto EN VIVO con pulso 1800 ms.
Controles: play/pausa central Verde Señal 72 px radio 24 con curva elástica; a los lados historial y compartir. Volumen solo en iOS si no hay control del sistema; en Android se usa el del sistema.
Acento del programa: banda o anillo fino con el color de acento del programa (ver reglas de submarcas). Nunca texto en el color de acento.

## Controles del sistema (obligatorios)
- iOS: MPNowPlayingInfoCenter + MPRemoteCommandCenter → pantalla bloqueada, Centro de control, AirPlay. Artwork = logo del programa al aire 1:1 (600 × 600 mín.) sobre fondo Neblina clara.
- Android: MediaSession + notificación MediaStyle → pantalla bloqueada y panel. Ícono pequeño = «n» monocromo blanco. Artwork igual que iOS.
- Título = programa; subtítulo = «con [locutor] · Neblina 105.5 FM».

## Ícono de app
- iOS 18+: entregar tres variantes 1024: claro (placa plata), oscuro (fondo Noche, «n» blanco→turquesa) y tintado (escala de grises). Archivos en design/app/.
- Android: ícono adaptativo 108 dp (zona segura 66 dp): fondo Noche + «n»; capa **monocroma** obligatoria para íconos temáticos (Android 13+).
- Nunca texto dentro del ícono pequeño; la frecuencia solo en el ícono grande de tiendas si se desea.

## Pantalla de inicio (splash)
Fondo Noche, «n» degradado centrada (iOS: launch screen; Android 12+: Splash Screen API, ícono dentro del círculo de 160 dp). Sin animaciones largas: < 1 s, luego fundido con salir 220 ms.

## Widgets (adaptativo)
- Pequeño: logo del programa + punto EN VIVO + botón play (iOS 17+ interactivo; Android con Glance).
- Mediano: programa al aire + siguiente programa con hora.
- Grande: al aire + 3 titulares de Última hora con guijarro de categoría.
Fondo vidrio Noche; respetan modo tintado/acentuado del sistema (iOS) y forma del launcher (Android).

## Funciones a futuro (diseño ya definido)
- iOS Live Activity / Dynamic Island mientras suena: izquierda «n», derecha ecualizador Verde Señal; expandida con programa y play.
- CarPlay (plantilla de audio) y Android Auto (MediaBrowserService): solo lista de «En vivo» y podcasts; artwork 1:1.
- Apple Watch / Wear OS: complicación «EN VIVO» y botón play.
- Notificaciones push: título ≤ 45 caracteres, categoría primero («Última hora · …»), sin mayúsculas sostenidas ni más de 1 emoji.

## Accesibilidad
VoiceOver / TalkBack: etiquetas en español («Reproducir Neblina en vivo», «Pausar»). Orden lógico. Contraste AA. Movimiento reducido: sin anillos móviles ni rebotes. Subtítulos o transcripción en videos.

## Nunca
Autoplay al abrir · más de un anuncio por pantalla · interstitials · audio publicitario sobre la señal · íconos de SF Symbols o Material mezclados con los de Neblina · recolorear logos de programas.
