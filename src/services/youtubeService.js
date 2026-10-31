// Servicio para obtener y sincronizar en tiempo real los Shorts Oficiales de YouTube (@neblina105fm)
// Canal Oficial: UC3oO0YL1irodIogNRvh-JbA

export const YOUTUBE_CHANNEL_ID = 'UC3oO0YL1irodIogNRvh-JbA';
export const YOUTUBE_FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;

// Shorts iniciales de alta fidelidad garantizados (Fallback robusto offline / sin conexión) - 12 Shorts Oficiales
export const DEFAULT_SHORTS = [
  {
    id: 'K3Y2_OC54wg',
    title: 'Volcamiento de camión por falla de frenos en carretera Mérida-Barinas 🚛⚠️',
    url: 'https://www.youtube.com/shorts/K3Y2_OC54wg',
    channel: '@neblina105fm'
  },
  {
    id: 'WSxuJD4tW3U',
    title: 'Denuncia Ciudadana: Comunidad de Valecillos exige patrullaje 📢🚔',
    url: 'https://www.youtube.com/shorts/WSxuJD4tW3U',
    channel: '@neblina105fm'
  },
  {
    id: 'mswNrzmgN9g',
    title: 'Incidentes viales del fin de semana en Cardenal Quintero 🏍️🚨',
    url: 'https://www.youtube.com/shorts/mswNrzmgN9g',
    channel: '@neblina105fm'
  },
  {
    id: 'RG1eMt_EItQ',
    title: 'Residencias Caribe: Búsqueda y labores en La Guaira 🌊',
    url: 'https://www.youtube.com/shorts/RG1eMt_EItQ',
    channel: '@neblina105fm'
  },
  {
    id: 'JNzVtd3iVv0',
    title: 'Colisión vehicular en la carretera nacional Mérida-Barinas 🚗⚠️',
    url: 'https://www.youtube.com/shorts/JNzVtd3iVv0',
    channel: '@neblina105fm'
  },
  {
    id: 'OjU91awRAyE',
    title: 'Descubre la magia de las montañas y senderos de Mérida 🏔️🌤️',
    url: 'https://www.youtube.com/shorts/OjU91awRAyE',
    channel: '@neblina105fm'
  },
  {
    id: 'sBChtRvvgQU',
    title: 'Octubre Rosa: Conciencia y Prevención por la Vida 🎀🩺',
    url: 'https://www.youtube.com/shorts/sBChtRvvgQU',
    channel: '@neblina105fm'
  },
  {
    id: 'P83v8eG4SeE',
    title: 'Amanecer andino sobre los picos de Mérida 🌤️🏔️',
    url: 'https://www.youtube.com/shorts/P83v8eG4SeE',
    channel: '@neblina105fm'
  },
  {
    id: 'oqmE6dOp2To',
    title: 'Actualización y noticias de interés internacional 🕊️',
    url: 'https://www.youtube.com/shorts/oqmE6dOp2To',
    channel: '@neblina105fm'
  },
  {
    id: 'nkz3XXsMcQ0',
    title: 'Vuelo y conservación del majestuoso Cóndor Andino 🦅',
    url: 'https://www.youtube.com/shorts/nkz3XXsMcQ0',
    channel: '@neblina105fm'
  },
  {
    id: 'YX5g118mWDQ',
    title: 'Nevada mágica en el Refugio de Alta Montaña Mifafí ❄️🏔️',
    url: 'https://www.youtube.com/shorts/YX5g118mWDQ',
    channel: '@neblina105fm'
  },
  {
    id: 'KK5Dgm49BSQ',
    title: 'Buenos días Mérida Natural y Tradición Andina 🏔️🇻🇪',
    url: 'https://www.youtube.com/shorts/KK5Dgm49BSQ',
    channel: '@neblina105fm'
  }
];

const CACHE_KEY = 'neblina_youtube_shorts_cache_v3';
const CACHE_TTL_MS = 25 * 60 * 1000; // 25 minutos

/**
 * Parsea el XML de YouTube y extrae los shorts con sus IDs, títulos e imágenes
 */
function parseYouTubeXml(xmlString) {
  if (!xmlString || typeof xmlString !== 'string') return [];

  const items = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi;
  let match;

  while ((match = entryRegex.exec(xmlString)) !== null) {
    const entry = match[1];
    const idMatch = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/i);
    const titleMatch = entry.match(/<title>([^<]+)<\/title>/i);
    const linkMatch = entry.match(/<link[^>]*href="([^"]+)"[^>]*>/i);

    if (idMatch && idMatch[1]) {
      const id = idMatch[1].trim();
      let title = titleMatch ? titleMatch[1].trim() : 'Short de Neblina 105.5 FM';
      title = title.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

      const url = linkMatch ? linkMatch[1].trim() : `https://www.youtube.com/shorts/${id}`;
      const isShort = url.includes('/shorts/') || entry.includes('/shorts/');

      items.push({
        id,
        title,
        url,
        isShort,
        channel: '@neblina105fm'
      });
    }
  }

  return items;
}

/**
 * Obtiene los últimos shorts de YouTube del canal oficial @neblina105fm
 * Con estrategia Stale-While-Revalidate: Devuelve instantáneamente la caché y actualiza en segundo plano.
 */
export async function fetchLatestYouTubeShorts() {
  // 1. Verificar caché existente para velocidad instantánea (0ms)
  let cachedList = null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.items) && parsed.items.length > 0) {
        cachedList = parsed.items;
        // Si la caché es reciente, devolverla directamente
        if (Date.now() - (parsed.timestamp || 0) < CACHE_TTL_MS) {
          return cachedList;
        }
      }
    }
  } catch (err) {
    console.warn('Error leyendo cache de YouTube shorts:', err);
  }

  // 2. Consultar el feed RSS oficial de YouTube vía proxy CORS seguro
  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(YOUTUBE_FEED_URL)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const response = await fetch(proxyUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      const xmlContents = data.contents;
      const parsedEntries = parseYouTubeXml(xmlContents);

      if (parsedEntries.length > 0) {
        // Preferir los que son Shorts o los más recientes del canal
        const shortsOnly = parsedEntries.filter(e => e.isShort);
        const finalSelection = (shortsOnly.length >= 6 ? shortsOnly : parsedEntries).slice(0, 12);

        // Guardar en caché persistente
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            timestamp: Date.now(),
            items: finalSelection
          }));
        } catch {
          // localStorage full / blocked
        }

        return finalSelection;
      }
    }
  } catch (fetchErr) {
    // Si falla la red o el proxy, no romper la experiencia
  }

  // 3. Fallback: Devolver caché previa o lista por defecto garantizada
  return cachedList || DEFAULT_SHORTS;
}
