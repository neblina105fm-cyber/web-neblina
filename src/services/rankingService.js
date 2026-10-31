// Neblina Stereo 105.5 FM - Servicio de Ranking Musical & Playlist Semanal de YouTube
import { isGenericMetadataText, STATION_INFO } from './api';

const STORAGE_RANKING_EVENTS_KEY = 'neblina_ranking_play_events_db';
const STORAGE_YOUTUBE_PLAYLIST_KEY = 'neblina_ranking_youtube_playlist_db';

// Canciones semilla realistas y representativas de Neblina Stereo 105.5 FM
// para garantizar que las 4 vistas (24h Canciones, 24h Artistas, Top 10 Semana, Top 10 Mensual)
// siempre tengan datos ricos, además de acumular en tiempo real lo que suena en el streaming.
const SEED_SONGS = [
  {
    title: 'Caracas en el 2000',
    artist: 'Elena Rose, Danny Ocean & Jerry Di',
    artwork: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
    plays24h: 14,
    plays7d: 78,
    plays30d: 295,
    uniqueArtistTitles: 4,
    trend: { state: 'up', delta: 2 }
  },
  {
    title: 'La Bachata',
    artist: 'Manuel Turizo',
    artwork: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&auto=format&fit=crop&q=80',
    plays24h: 12,
    plays7d: 71,
    plays30d: 268,
    uniqueArtistTitles: 3,
    trend: { state: 'same', delta: 0 }
  },
  {
    title: 'Me Rehúso',
    artist: 'Danny Ocean',
    artwork: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80',
    plays24h: 11,
    plays7d: 65,
    plays30d: 254,
    uniqueArtistTitles: 5,
    trend: { state: 'up', delta: 1 }
  },
  {
    title: 'Caballo Viejo',
    artist: 'Simón Díaz',
    artwork: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80',
    plays24h: 10,
    plays7d: 61,
    plays30d: 240,
    uniqueArtistTitles: 6,
    trend: { state: 'up', delta: 3 }
  },
  {
    title: 'Provenza',
    artist: 'Karol G',
    artwork: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&auto=format&fit=crop&q=80',
    plays24h: 9,
    plays7d: 58,
    plays30d: 229,
    uniqueArtistTitles: 5,
    trend: { state: 'down', delta: 1 }
  },
  {
    title: 'Llorarás',
    artist: 'Oscar D\'León',
    artwork: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400&auto=format&fit=crop&q=80',
    plays24h: 9,
    plays7d: 54,
    plays30d: 215,
    uniqueArtistTitles: 7,
    trend: { state: 'up', delta: 2 }
  },
  {
    title: 'Te Quiero',
    artist: 'Hombres G',
    artwork: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&auto=format&fit=crop&q=80',
    plays24h: 8,
    plays7d: 49,
    plays30d: 198,
    uniqueArtistTitles: 3,
    trend: { state: 'same', delta: 0 }
  },
  {
    title: 'Moliendo Café',
    artist: 'Hugo Blanco',
    artwork: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&auto=format&fit=crop&q=80',
    plays24h: 7,
    plays7d: 46,
    plays30d: 185,
    uniqueArtistTitles: 3,
    trend: { state: 'new', is_new: true }
  },
  {
    title: 'La Gota Fría',
    artist: 'Carlos Vives',
    artwork: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=400&auto=format&fit=crop&q=80',
    plays24h: 7,
    plays7d: 43,
    plays30d: 174,
    uniqueArtistTitles: 4,
    trend: { state: 'up', delta: 1 }
  },
  {
    title: 'Venezuela',
    artist: 'Luis Silva',
    artwork: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&auto=format&fit=crop&q=80',
    plays24h: 6,
    plays7d: 40,
    plays30d: 166,
    uniqueArtistTitles: 5,
    trend: { state: 'same', delta: 0 }
  },
  {
    title: 'Ojos Marrones',
    artist: 'Lasso',
    artwork: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=400&auto=format&fit=crop&q=80',
    plays24h: 6,
    plays7d: 37,
    plays30d: 152,
    uniqueArtistTitles: 4,
    trend: { state: 'up', delta: 2 }
  },
  {
    title: 'Sentimiento Nacional',
    artist: 'Guaco',
    artwork: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&auto=format&fit=crop&q=80',
    plays24h: 5,
    plays7d: 34,
    plays30d: 141,
    uniqueArtistTitles: 6,
    trend: { state: 'down', delta: 1 }
  }
];

// Temas recomendados para el reproductor embebido de YouTube en la página de Ranking
export const DEFAULT_YOUTUBE_RECOMMENDED_TRACKS = [
  {
    id: 'yt-1',
    title: 'Elena Rose, Danny Ocean, Jerry Di - Caracas en el 2000',
    artist: 'Elena Rose & Danny Ocean',
    videoId: 'b7QlX3yR2xs',
    duration: '3:28'
  },
  {
    id: 'yt-2',
    title: 'Lasso - Ojos Marrones (Video Oficial)',
    artist: 'Lasso',
    videoId: 'W8r-tXRLazs',
    duration: '3:18'
  },
  {
    id: 'yt-3',
    title: 'Danny Ocean - Me Rehúso (Official Audio)',
    artist: 'Danny Ocean',
    videoId: 'aDCcLQto5BM',
    duration: '3:26'
  },
  {
    id: 'yt-4',
    title: 'Manuel Turizo - La Bachata (Video Oficial)',
    artist: 'Manuel Turizo',
    videoId: 'TiM_TFpT_DE',
    duration: '2:43'
  },
  {
    id: 'yt-5',
    title: 'Carlos Vives - La Gota Fría (Video Oficial)',
    artist: 'Carlos Vives',
    videoId: 'M724c5p2E8A',
    duration: '3:36'
  }
];

export const PLAYLIST_SCHEDULE_SLOTS = [
  {
    id: 'lunes_12',
    label: 'Lunes 12:00 PM (Mediodía - Recomendado)',
    dayOfWeek: 1, // Lunes
    hour: 12,
    minute: 0
  },
  {
    id: 'domingo_22',
    label: 'Domingo 10:00 PM (Cierre de Fin de Semana)',
    dayOfWeek: 0, // Domingo
    hour: 22,
    minute: 0
  },
  {
    id: 'lunes_07',
    label: 'Lunes 7:00 AM (Inicio de Semana)',
    dayOfWeek: 1, // Lunes
    hour: 7,
    minute: 0
  }
];

const INITIAL_PLAYLIST_CONFIG = {
  currentUrl: 'https://www.youtube.com/watch?v=b7QlX3yR2xs&list=PLFgquLnL59alCl_2TQvOiD5Vgm1hCaGSI',
  currentTitle: 'Selección Oficial de la Semana · Neblina 105.5 FM',
  queuedUrl: '',
  queuedTitle: '',
  scheduledSlot: 'lunes_12',
  lastPromotedAt: null,
  updatedAt: '2026-10-19T12:00:00.000Z'
};

// Obtener eventos de reproducción registrados localmente desde el streaming en vivo
export function getLocalPlayEvents() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_RANKING_EVENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

// Registrar una canción detectada en la transmisión en vivo para alimentar el ranking
let lastRecordedKey = '';
let lastRecordedTime = 0;

export function recordSongPlay(meta = {}) {
  if (typeof window === 'undefined') return;
  try {
    const song = (meta.song || '').trim();
    const artist = (meta.artist || '').trim();
    if (!song || !artist) return;
    if (isGenericMetadataText(song) && isGenericMetadataText(artist)) return;

    const key = `${artist.toLowerCase()}__${song.toLowerCase()}`;
    const now = Date.now();
    // Evitar duplicar la misma canción en un lapso menor a 3 minutos
    if (key === lastRecordedKey && now - lastRecordedTime < 3 * 60 * 1000) {
      return;
    }
    lastRecordedKey = key;
    lastRecordedTime = now;

    const events = getLocalPlayEvents();
    events.unshift({
      id: `play-${now}`,
      song,
      artist,
      artwork: meta.artwork || STATION_INFO.cover,
      timestamp: now
    });

    // Conservar los últimos 600 registros (30 días)
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const pruned = events.filter(e => e.timestamp >= thirtyDaysAgo).slice(0, 600);
    localStorage.setItem(STORAGE_RANKING_EVENTS_KEY, JSON.stringify(pruned));
    window.dispatchEvent(new CustomEvent('neblina_ranking_updated'));
  } catch (e) {
    console.warn('Error registrando canción en el ranking:', e);
  }
}

// Combinar datos de la API de MiPanel con el registro en tiempo real + semilla para garantizar Top 10 rico
export function buildHybridRanking(apiItems = [], tabKey = '24h_songs') {
  const isArtists = tabKey === '24h_artists';
  const now = Date.now();
  const windowMs =
    tabKey === '24h_songs' || tabKey === '24h_artists'
      ? 24 * 60 * 60 * 1000
      : tabKey === 'weekly'
      ? 7 * 24 * 60 * 60 * 1000
      : 30 * 24 * 60 * 60 * 1000;

  const localEvents = getLocalPlayEvents().filter(e => now - e.timestamp <= windowMs);

  // Mapa acumulador
  const map = new Map();

  // 1. Incorporar en primer lugar los datos reales de la API de MiPanel (http://mipanel.stream/api/TnpBeE9BPT0rWg==)
  if (Array.isArray(apiItems) && apiItems.length > 0) {
    apiItems.forEach((item, idx) => {
      const artist = (item.artist || '').trim();
      const title = (item.title || '').trim();
      if (!artist && !title) return;
      const mapKey = isArtists
        ? artist.toLowerCase()
        : `${artist.toLowerCase()}__${title.toLowerCase()}`;
      const apiPlays = Number(item.plays || item.total_plays || 1);
      map.set(mapKey, {
        title: title || artist,
        artist: artist || 'Artista Neblina',
        artwork: item.artwork || '',
        plays: apiPlays,
        total_plays: apiPlays,
        unique_titles: item.unique_titles || 1,
        trend: item.trend || { state: 'new', is_new: true },
        fromApi: true,
        apiOrder: item.rank || (idx + 1)
      });
    });
  }

  // 2. Sumar reproducciones detectadas en vivo en el navegador del usuario
  localEvents.forEach((ev) => {
    const mapKey = isArtists
      ? ev.artist.toLowerCase()
      : `${ev.artist.toLowerCase()}__${ev.song.toLowerCase()}`;
    const existing = map.get(mapKey);
    if (existing) {
      existing.plays += 1;
      existing.total_plays = existing.plays;
      if (!existing.artwork && ev.artwork) existing.artwork = ev.artwork;
      existing.trend = { state: 'up', delta: 1 };
    } else {
      map.set(mapKey, {
        title: ev.song,
        artist: ev.artist,
        artwork: ev.artwork,
        plays: 1,
        total_plays: 1,
        unique_titles: 1,
        trend: { state: 'new', is_new: true },
        fromApi: true,
        apiOrder: 99
      });
    }
  });

  // 3. Completar con temas de respaldo si la API tiene menos de 10 posiciones registradas
  SEED_SONGS.forEach((seed, idx) => {
    const basePlays =
      tabKey === '24h_songs' || tabKey === '24h_artists'
        ? seed.plays24h
        : tabKey === 'weekly'
        ? seed.plays7d
        : seed.plays30d;

    const mapKey = isArtists
      ? seed.artist.toLowerCase()
      : `${seed.artist.toLowerCase()}__${seed.title.toLowerCase()}`;

    if (!map.has(mapKey)) {
      map.set(mapKey, {
        title: seed.title,
        artist: seed.artist,
        artwork: seed.artwork,
        plays: basePlays,
        total_plays: basePlays,
        unique_titles: seed.uniqueArtistTitles || 1,
        trend: seed.trend || { state: 'same', delta: 0 },
        fromApi: false,
        apiOrder: 100 + idx
      });
    }
  });

  const sorted = Array.from(map.values()).sort((a, b) => {
    if (a.fromApi !== b.fromApi) return a.fromApi ? -1 : 1;
    if (a.fromApi && b.fromApi && a.apiOrder !== b.apiOrder && a.plays === b.plays) {
      return a.apiOrder - b.apiOrder;
    }
    return (b.plays || 0) - (a.plays || 0);
  });
  return sorted.slice(0, 10);
}

// ============================================================================
// GESTIÓN DE PLAYLIST SEMANAL DE YOUTUBE CON COLA AUTOMÁTICA Y RECORDATORIO
// ============================================================================

export function extractYouTubeEmbedInfo(url = '') {
  const clean = (url || '').trim();
  if (!clean) {
    return {
      embedUrl: `https://www.youtube.com/embed/${DEFAULT_YOUTUBE_RECOMMENDED_TRACKS[0].videoId}?rel=0`,
      playlistId: 'PLFgquLnL59alCl_2TQvOiD5Vgm1hCaGSI',
      videoId: DEFAULT_YOUTUBE_RECOMMENDED_TRACKS[0].videoId
    };
  }

  let listMatch = clean.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  let videoMatch =
    clean.match(/[?&]v=([a-zA-Z0-9_-]{11})/) ||
    clean.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/) ||
    clean.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);

  const playlistId = listMatch ? listMatch[1] : '';
  const videoId = videoMatch ? videoMatch[1] : '';

  if (playlistId && videoId) {
    return {
      embedUrl: `https://www.youtube.com/embed/${videoId}?list=${playlistId}&rel=0`,
      playlistId,
      videoId
    };
  }
  if (playlistId) {
    return {
      embedUrl: `https://www.youtube.com/embed/videoseries?list=${playlistId}&rel=0`,
      playlistId,
      videoId: ''
    };
  }
  if (videoId) {
    return {
      embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0`,
      playlistId: '',
      videoId
    };
  }

  return {
    embedUrl: `https://www.youtube.com/embed/${DEFAULT_YOUTUBE_RECOMMENDED_TRACKS[0].videoId}?rel=0`,
    playlistId: '',
    videoId: DEFAULT_YOUTUBE_RECOMMENDED_TRACKS[0].videoId
  };
}

export function getRankingYoutubePlaylist() {
  if (typeof window === 'undefined') return INITIAL_PLAYLIST_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_YOUTUBE_PLAYLIST_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_YOUTUBE_PLAYLIST_KEY, JSON.stringify(INITIAL_PLAYLIST_CONFIG));
      return INITIAL_PLAYLIST_CONFIG;
    }
    const parsed = JSON.parse(raw);
    return { ...INITIAL_PLAYLIST_CONFIG, ...parsed };
  } catch (e) {
    return INITIAL_PLAYLIST_CONFIG;
  }
}

export function saveRankingYoutubePlaylist(updates = {}) {
  if (typeof window === 'undefined') return INITIAL_PLAYLIST_CONFIG;
  const current = getRankingYoutubePlaylist();
  const next = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_YOUTUBE_PLAYLIST_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('neblina_youtube_playlist_updated'));
  return next;
}

// Promover inmediatamente la playlist en cola como playlist activa
export function promoteQueuedPlaylistNow() {
  const cfg = getRankingYoutubePlaylist();
  if (!cfg.queuedUrl || !cfg.queuedUrl.trim()) return cfg;
  return saveRankingYoutubePlaylist({
    currentUrl: cfg.queuedUrl.trim(),
    currentTitle: cfg.queuedTitle?.trim() || 'Selección Oficial de la Semana · Neblina 105.5 FM',
    queuedUrl: '',
    queuedTitle: '',
    lastPromotedAt: new Date().toISOString()
  });
}

// Calcula la última fecha/hora en que ocurrió el slot programado (p.ej. Lunes 12:00 PM)
function getMostRecentSlotTimestamp(slotId = 'lunes_12', now = new Date()) {
  const slot = PLAYLIST_SCHEDULE_SLOTS.find(s => s.id === slotId) || PLAYLIST_SCHEDULE_SLOTS[0];
  const candidate = new Date(now);
  const currentDay = candidate.getDay(); // 0 = Domingo, 1 = Lunes, ...
  let diffDays = (currentDay - slot.dayOfWeek + 7) % 7;
  candidate.setDate(candidate.getDate() - diffDays);
  candidate.setHours(slot.hour, slot.minute, 0, 0);

  if (candidate.getTime() > now.getTime()) {
    // Todavía no ha llegado la hora hoy; la ocurrencia anterior fue hace 7 días
    candidate.setDate(candidate.getDate() - 7);
  }
  return candidate.getTime();
}

// Calcula la próxima fecha/hora en que ocurrirá el cambio automático
export function getNextSlotDate(slotId = 'lunes_12', now = new Date()) {
  const lastTs = getMostRecentSlotTimestamp(slotId, now);
  const nextDate = new Date(lastTs + 7 * 24 * 60 * 60 * 1000);
  return nextDate;
}

// Comprueba si ya pasó el horario programado (por defecto Lunes 12:00 PM) y si hay una playlist en cola para activarla
export function checkAndPromoteQueuedPlaylist() {
  const cfg = getRankingYoutubePlaylist();
  if (!cfg.queuedUrl || !cfg.queuedUrl.trim()) return cfg;

  const now = new Date();
  const mostRecentSlotTs = getMostRecentSlotTimestamp(cfg.scheduledSlot || 'lunes_12', now);
  const lastPromotedTs = cfg.lastPromotedAt ? new Date(cfg.lastPromotedAt).getTime() : 0;
  const updatedTs = cfg.updatedAt ? new Date(cfg.updatedAt).getTime() : 0;

  // Si la cola fue guardada antes del hito horario más reciente y aún no se ha promovido en este ciclo:
  if (mostRecentSlotTs > lastPromotedTs && updatedTs <= mostRecentSlotTs) {
    return promoteQueuedPlaylistNow();
  }
  return cfg;
}

// Estado de recordatorio administrativo:
// Advierte con 3 días de antelación (desde el Viernes previo al Lunes 12:00 PM) si no hay una playlist en cola
export function getPlaylistAdminReminderStatus() {
  const cfg = getRankingYoutubePlaylist();
  const hasQueued = Boolean(cfg.queuedUrl && cfg.queuedUrl.trim());
  const nextSwitch = getNextSlotDate(cfg.scheduledSlot || 'lunes_12');
  const msRemaining = nextSwitch.getTime() - Date.now();
  const daysRemaining = msRemaining / (1000 * 60 * 60 * 24);
  const hoursRemaining = Math.max(1, Math.round(msRemaining / (1000 * 60 * 60)));

  // Si faltan 3 días o menos (ej. Viernes, Sábado, Domingo o Lunes por la mañana) y no hay playlist en cola
  const shouldRemind = !hasQueued && daysRemaining <= 3.5;

  const slotObj = PLAYLIST_SCHEDULE_SLOTS.find(s => s.id === (cfg.scheduledSlot || 'lunes_12')) || PLAYLIST_SCHEDULE_SLOTS[0];

  return {
    shouldRemind,
    hasQueued,
    daysRemaining: Math.max(0, Math.ceil(daysRemaining)),
    hoursRemaining,
    nextSwitchFormatted: nextSwitch.toLocaleDateString('es-VE', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }),
    slotLabel: slotObj.label
  };
}
