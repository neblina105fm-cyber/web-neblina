// Neblina Stereo 105.5 FM - API Services

export const STREAM_CONFIG = {
  primary: {
    id: 'primary',
    name: 'Éxtasis Network (HD)',
    url: 'https://radios.mipanel.stream:7018/stream',
    type: 'audio/mpeg',
    isNeblinaOwn: true
  },
  backup: {
    id: 'backup',
    name: 'Zeno Radio (Respaldo Neblina)',
    url: 'https://stream.zeno.fm/bnnrq1fks68uv',
    type: 'audio/mpeg',
    isNeblinaOwn: true
  },
  noticiero102: {
    id: 'noticiero102',
    name: 'Estudio 102.7 FM (Respaldo Noticiero 102)',
    url: 'https://stream.zeno.fm/um833nab8tzuv',
    type: 'audio/aac',
    isNeblinaOwn: false,
    station: 'Estudio 102.7 FM',
    program: 'Noticiero 102',
    isSpecialNewsBackup: true
  },
  metadataUrl: 'https://player.extassisnetwork.com/api.php?url=https%3A%2F%2Fradios.mipanel.stream%3A7018%2Fstream',
  mipanelApiUrl: 'https://mipanel.stream/api/TnpBeE9BPT0rWg==',
  mipanelApiHttpUrl: 'http://mipanel.stream/api/TnpBeE9BPT0rWg=='
};

/**
 * Comprueba si el momento actual (o fecha dada) corresponde a la ventana horaria del Noticiero 102
 * de lunes a viernes en hora local de Venezuela (America/Caracas, UTC-4):
 * - Primera Emisión: 07:00 a 08:00 (7:00 a.m. a 8:00 a.m.)
 * - Emisión Meridiana: 12:00 a 13:00 (12:00 p.m. a 1:00 p.m.)
 */
export function isNoticiero102Window(date = new Date()) {
  try {
    // Soporte para pruebas de control y verificación manual en desarrollo
    if (typeof window !== 'undefined') {
      const override = localStorage.getItem('neblina_debug_force_news_window');
      if (override === 'true') return true;
      if (override === 'false') return false;
    }

    const caracasTimeStr = date.toLocaleTimeString('en-US', { 
      timeZone: 'America/Caracas', 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    const [currentH, currentM] = caracasTimeStr.split(':').map(Number);
    const currentMinutes = currentH * 60 + currentM;

    const caracasDayStr = date.toLocaleDateString('en-US', { 
      timeZone: 'America/Caracas', 
      weekday: 'short' 
    });
    const daysMap = { 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6, 'Sun': 7 };
    const currentDay = daysMap[caracasDayStr] || 0;

    // Lunes a Viernes (1 = Lunes, 5 = Viernes)
    const isWeekDay = currentDay >= 1 && currentDay <= 5;
    if (!isWeekDay) return false;

    // 07:00 a 08:00 (420 a 480 minutos)
    const isMorningNews = currentMinutes >= 420 && currentMinutes < 480;
    // 12:00 a 13:00 (720 a 780 minutos)
    const isMiddayNews = currentMinutes >= 720 && currentMinutes < 780;

    return isMorningNews || isMiddayNews;
  } catch (err) {
    console.warn('Error verificando horario Noticiero 102:', err);
    return false;
  }
}

/**
 * Prueba ligera en segundo plano para verificar si un flujo de streaming está transmitiendo audio.
 * Resuelve true si el flujo emite eventos de audio ('canplay' o 'playing') dentro del tiempo límite.
 */
export function probeAudioStream(url, timeoutMs = 4000) {
  if (typeof window === 'undefined' || typeof Audio === 'undefined') {
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    let finished = false;
    const probe = new Audio();
    probe.muted = true;
    probe.volume = 0;
    probe.preload = 'auto';

    const timer = setTimeout(() => {
      finish(false);
    }, timeoutMs);

    function finish(isLive) {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      try {
        probe.pause();
        probe.removeAttribute('src');
        probe.load();
      } catch (e) {}
      probe.oncanplay = null;
      probe.onplaying = null;
      probe.onerror = null;
      resolve(isLive);
    }

    probe.oncanplay = () => finish(true);
    probe.onplaying = () => finish(true);
    probe.onerror = () => finish(false);

    try {
      const sep = url.includes('?') ? '&' : '?';
      probe.src = `${url}${sep}_probe=${Date.now()}`;
      probe.load();
      const p = probe.play();
      if (p !== undefined) {
        p.catch(() => {});
      }
    } catch (e) {
      finish(false);
    }
  });
}

// Mensajería y Plantillas Oficiales de WhatsApp (+58 424 745 9774)
export const WHATSAPP_CONFIG = {
  phoneDisplay: '+58 424 745 9774',
  phoneRaw: '584247459774',
  
  // Plantilla Interactiva para Solicitud de Canciones / Complacencias y Reporte de Sintonía
  createSongRequestText: (song = '', artist = '', userName = '', userLocation = '') => {
    const nameStr = userName.trim() ? userName.trim() : '[Escribe aquí tu Nombre y Apellido]';
    const locStr = userLocation.trim() ? userLocation.trim() : '[Escribe aquí tu Sector / Ciudad / País]';
    const songStr = song.trim() ? song.trim() : '[Escribe aquí el Nombre de la Canción]';
    const artistStr = artist.trim() ? ` de ${artist.trim()}` : ' [Nombre del Artista o Grupo]';

    return `¡Hola, Neblina Stereo 105.5 FM! 📻✨\n\nHola, soy ${nameStr} reportando sintonía desde ${locStr}.\n\n🎶 *SOLICITUD DE COMPLACENCIA:*\nHola, complacencia, quiero solicitar el tema ${songStr}${artistStr} y por favor complace con el tema.\n\nDedicatoria / Saludo: [Escribe aquí tu dedicatoria para que la lean al aire]\n\n¡Contigo en la cima! 🏔️🎵`;
  },

  // Plantilla Interactiva para Reporte de Denuncia Ciudadana
  createCitizenReportText: (data = {}) => {
    const citizenName = data.citizenName?.trim() || '[Nombre y Apellido del Ciudadano]';
    const citizenId = data.citizenId?.trim() || '[V/E - Número de Cédula]';
    const phone = data.phone?.trim() || '';
    const residenceSector = data.residenceSector?.trim() || '[Indica el sector o comunidad donde vives]';
    const eventLocation = data.eventLocation?.trim() || '[Indica específicamente la calle, sector o comunidad donde ocurre el hecho]';
    const referencePoint = data.referencePoint?.trim() || '[Punto de referencia cercano]';
    const eventDate = data.eventDate?.trim() || '[Día / Mes / Año]';
    const eventTime = data.eventTime?.trim() || '[Hora aproximada]';
    const description = data.description?.trim() || '[Explica detalladamente la situación, problemática o acontecimiento]';

    const phoneStr = phone ? `, Teléfono: ${phone}` : '';

    return `🚨 *DENUNCIA CIUDADANA - SALA DE REDACCIÓN NEBLINA STEREO 105.5 FM* 📢\n\nHola, soy ${citizenName}, Cédula de Identidad ${citizenId}${phoneStr}, vivo en el sector ${residenceSector}.\n\n📍 *LUGAR DEL ACONTECIMIENTO:*\nEl acontecimiento está ocurriendo en: ${eventLocation}\nPunto de referencia: ${referencePoint}\n\n📅 *FECHA Y HORA:*\nFecha: ${eventDate}\nHora: ${eventTime}\n\n📝 *DESCRIPCIÓN DE LA DENUNCIA:*\n${description}\n\n📎 *EVIDENCIA FOTOGRÁFICA O EN VIDEO:*\n(Anexo a continuación las fotos y/o videos como respaldo de mi denuncia).`;
  }
};

export function getSongRequestUrl(song = '', artist = '', userName = '', userLocation = '') {
  const text = WHATSAPP_CONFIG.createSongRequestText(song, artist, userName, userLocation);
  return `https://api.whatsapp.com/send?phone=${WHATSAPP_CONFIG.phoneRaw}&text=${encodeURIComponent(text)}`;
}

export function getCitizenReportUrl(data = {}) {
  const text = WHATSAPP_CONFIG.createCitizenReportText(data);
  return `https://api.whatsapp.com/send?phone=${WHATSAPP_CONFIG.phoneRaw}&text=${encodeURIComponent(text)}`;
}

export const DEFAULT_RADIO_COVER = '/cover-default.png';

export const STATION_INFO = {
  name: 'Neblina Stereo 105.5 Fm',
  slogan: 'Santo Domingo - Mérida',
  city: 'Santo Domingo, Mérida, Venezuela',
  logo: '/logo-tight.svg',
  icon: '/icon-tight.svg',
  cover: DEFAULT_RADIO_COVER,
  album: DEFAULT_RADIO_COVER,
  whatsapp: WHATSAPP_CONFIG.phoneDisplay,
  whatsappRaw: WHATSAPP_CONFIG.phoneRaw,
  whatsappUrl: getSongRequestUrl(),
  whatsappSongRequestUrl: getSongRequestUrl(),
  whatsappDenunciaUrl: getCitizenReportUrl(),
  whatsappChannel: 'https://whatsapp.com/channel/0029VaCcXLD8Pgs7z9ZASY31',
  whatsappGroup1: 'https://chat.whatsapp.com/Hn5wrFVsN3dIQfWo6NDMq2?s=cl&p=a&mlu=4&ilr=4',
  whatsappGroup2: 'https://chat.whatsapp.com/KRpRWN8evHs7Ihk7gpmTsp?s=cl&p=a&mlu=4&ilr=4',
  instagram: 'https://www.instagram.com/neblina105fm',
  facebook: 'https://www.facebook.com/share/1CSnfJd56w/',
  youtube: 'https://www.youtube.com/@neblina105fm',
  youtubeShorts: 'https://www.youtube.com/@neblina105fm/shorts'
};

export const STATION_SCHEDULE = [
  {
    id: 145,
    title: 'Buenos Días Venezuela',
    host: 'Neblina Stereo 105.5 Fm',
    description: 'Amanecer sabanero transmitido a través de las mejores ejecuciones de la canta criolla.',
    days: [1, 2, 3, 4, 5, 6, 7],
    startTime: '05:30',
    endTime: '07:00',
    image: 'https://mipanel.stream/player/uploads/programacion/7018/cde39f0824644fa527cf6725c70227f5cb9c4e1a_2c976d05.jpg',
    color: '#8454ff'
  },
  {
    id: 146,
    title: 'Noticiero 102 (Primera Emisión)',
    host: 'Equipo Informativo',
    description: 'Actualidad local, regional y nacional, destacando la noticia diaria y el acontecer comunitario de Mérida.',
    days: [1, 2, 3, 4, 5],
    startTime: '07:00',
    endTime: '08:00',
    image: 'https://mipanel.stream/player/uploads/programacion/Noticiero-102_ba48738a.jpg',
    color: '#00d2ff'
  },
  {
    id: 148,
    title: 'Carrileras y algo más...',
    host: 'Neblina Stereo 105.5 Fm',
    description: 'Viaje al corazón de la tradición carrilera y la música del pueblo.',
    days: [1, 3, 5],
    startTime: '08:00',
    endTime: '09:00',
    image: 'https://mipanel.stream/player/uploads/programacion/Carrileras-y-Algo-Ms_427ee8e2.jpg',
    color: '#ffaa00'
  },
  {
    id: 149,
    title: 'El Monstruo de La Mañana',
    host: 'Jhonas Toro',
    description: 'Entretenimiento integral, buena música, sorpresas y la mejor energía para alegrar tus mañanas.',
    days: [1, 2, 3, 4, 5],
    startTime: '09:00',
    endTime: '12:00',
    image: 'https://mipanel.stream/player/uploads/programacion/El-Monstruo-de-la-Maana_fe5bbab8.jpg',
    color: '#ff007a'
  },
  {
    id: 147,
    title: 'Noticiero 102 (Emisión Meridiana)',
    host: 'Equipo Informativo',
    description: 'Resumen informativo del mediodía con las noticias más destacadas de la región andina.',
    days: [1, 2, 3, 4, 5],
    startTime: '12:00',
    endTime: '13:00',
    image: 'https://mipanel.stream/player/uploads/programacion/Noticiero-102_340f398a.jpg',
    color: '#00d2ff'
  },
  {
    id: 153,
    title: 'Baladas de Ayer, Hoy y Siempre',
    host: 'Neblina Stereo 105.5 Fm',
    description: 'El refugio para los amantes del romanticismo, las canciones nostálgicas y los grandes éxitos del amor.',
    days: [1, 2, 3, 4, 5],
    startTime: '13:00',
    endTime: '14:00',
    image: 'https://mipanel.stream/player/uploads/programacion/Baladas-de-ayer-hoy-y-siempre_9464d84d.jpg',
    color: '#ec4899'
  },
  {
    id: 154,
    title: 'La Gaita y Su Cabuyazo',
    host: 'Neblina Stereo 105.5 Fm',
    description: 'Sabor tradicional y fiesta con el repique de tambores y las mejores gaitas.',
    days: [1, 2, 3, 4, 5],
    startTime: '14:00',
    endTime: '15:00',
    image: 'https://mipanel.stream/player/uploads/programacion/La-Gaita-y-su-Cabuyazo_d844f881.jpg',
    color: '#eab308'
  },
  {
    id: 161,
    title: 'Buena Salsa',
    host: 'Neblina Stereo 105.5 Fm',
    description: 'El punto de encuentro para los amantes del género con lo mejor del timbal, clave y salsa brava.',
    days: [1, 2, 3, 4, 5],
    startTime: '15:00',
    endTime: '16:00',
    image: 'https://mipanel.stream/player/uploads/programacion/Buena-Salsa_705e4e3a.jpg',
    color: '#f97316'
  },
  {
    id: 167,
    title: 'Entre el Acordeón y el Mariachi',
    host: 'Roxana Toro',
    description: 'Una auténtica fiesta para el alma donde las notas del vallenato se abrazan con el mariachi mexicano.',
    days: [1, 3, 5],
    startTime: '16:00',
    endTime: '18:00',
    image: 'https://mipanel.stream/player/uploads/programacion/Entra-el-acordion-y-el-mariachi_c16296d4.jpg',
    color: '#8b5cf6'
  },
  {
    id: 168,
    title: 'Buena Vibra',
    host: 'Yosbely Mejias',
    description: 'Música romántica, pop, baladas suaves y reflexiones para llenar de armonía el atardecer.',
    days: [1, 2, 3, 4, 5],
    startTime: '18:00',
    endTime: '20:00',
    image: 'https://mipanel.stream/player/uploads/programacion/Buena-Vibra_67992b89.jpg',
    color: '#10b981'
  }
];

export const PODCASTS_DATA = [
  {
    id: 22,
    title: 'Entrevista con Dra. Melina Chuecos',
    show: 'El Monstruo de La Mañana',
    author: 'Jhonas Toro',
    category: 'Entrevistas de Salud',
    description: 'El Cáncer de Mama: La detección temprana es la clave fundamental para asegurar altas probabilidades de supervivencia y tratamientos menos invasivos.',
    duration: '21:14',
    audio_url: 'https://mipanel.stream/player/uploads/podcasts/EntrevistaconDraMelinaChuecos_5a2412f1.mp3',
    cover_url: 'https://mipanel.stream/player/uploads/podcasts/7018/cde39f0824644fa527cf6725c70227f5cb9c4e1a_7ed5139d.jpg',
    date: '07 Oct 2026'
  }
];

// Obtener el programa al aire según hora local de Venezuela (UTC-4)
export function getCurrentLiveShow() {
  const now = new Date();
  // Obtener hora en zona de Caracas
  const caracasTimeStr = now.toLocaleTimeString('en-US', { timeZone: 'America/Caracas', hour12: false, hour: '2-digit', minute: '2-digit' });
  const [currentH, currentM] = caracasTimeStr.split(':').map(Number);
  const currentMinutes = currentH * 60 + currentM;

  // 1 = Lunes, ..., 7 = Domingo
  const caracasDayStr = now.toLocaleDateString('en-US', { timeZone: 'America/Caracas', weekday: 'short' });
  const daysMap = { 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6, 'Sun': 7 };
  const currentDay = daysMap[caracasDayStr] || 1;

  // Consultar parrilla activa desde la base de datos local o valores por defecto
  let scheduleList = STATION_SCHEDULE;
  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('neblina_station_schedule_db');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) scheduleList = parsed;
      }
    }
  } catch (e) {}

  for (const show of scheduleList) {
    if (show.active === false || show.trashed) continue;
    if (show.days && Array.isArray(show.days) && show.days.includes(currentDay)) {
      const [startH, startM] = (show.startTime || '00:00').split(':').map(Number);
      const [endH, endM] = (show.endTime || '23:59').split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
        return {
          ...show,
          isLive: true,
          timeRange: `${show.startTime} - ${show.endTime}`
        };
      }
    }
  }

  return {
    id: 0,
    title: 'Neblina Stereo 105.5 FM',
    host: 'Música Continua en HD',
    description: 'La mejor selección musical sin pausas desde Santo Domingo, Mérida.',
    startTime: '20:00',
    endTime: '05:30',
    image: STATION_INFO.cover || 'https://neblina105fm.com/wp-content/uploads/2026/10/Neblina-2026-10-4.png',
    isLive: true,
    timeRange: '24/7',
    color: '#00DD9E'
  };
}

// Validador de textos genéricos de estación o no-musicales (promos, hora, identificaciones)
export function isGenericMetadataText(text = '') {
  if (!text || typeof text !== 'string') return true;
  const clean = text.toLowerCase().trim();
  if (clean.length < 2) return true;
  const genericList = [
    'en vivo',
    'radio en vivo',
    'señal en vivo',
    'señal en vivo hd',
    'neblina',
    'neblina stereo',
    'neblina 105.5',
    'neblina 105.5 fm',
    'contigo en la cima',
    'musica continua',
    'música continua',
    'música continua en hd',
    'publicidad',
    'comercial',
    'pauta comercial',
    'hora',
    'la hora',
    'identificacion',
    'identificación',
    'promo',
    'promocion',
    'promoción',
    'santo domingo',
    'santo domingo - mérida',
    'equipo informativo'
  ];
  return genericList.includes(clean);
}

// Extraer valor de una etiqueta XML simple devuelta por http://mipanel.stream/api/TnpBeE9BPT0rWg==
function extractXmlTag(xml = '', tag = '') {
  const m = String(xml).match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return m ? decodeWpHtmlEntities(m[1].trim()) : '';
}

// Consultar metadatos en tiempo real desde el endpoint oficial http://mipanel.stream/api/TnpBeE9BPT0rWg==
export async function fetchMiPanelLiveXmlMetadata() {
  const urls = [STREAM_CONFIG.mipanelApiUrl, STREAM_CONFIG.mipanelApiHttpUrl];
  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) continue;
      const xml = await res.text();
      if (!xml || !xml.includes('<musica_atual>')) continue;

      const musicaAtual = extractXmlTag(xml, 'musica_atual');
      const proximaMusica = extractXmlTag(xml, 'proxima_musica');
      const capaMusica = extractXmlTag(xml, 'capa_musica');
      const status = extractXmlTag(xml, 'status');

      let artist = '';
      let song = musicaAtual;
      if (musicaAtual.includes(' - ')) {
        const parts = musicaAtual.split(' - ');
        artist = parts[0].trim();
        song = parts.slice(1).join(' - ').trim();
      }

      return {
        ok: true,
        status,
        songtitle: musicaAtual,
        artist,
        song,
        nextSong: proximaMusica,
        artwork: capaMusica && capaMusica.startsWith('http') ? capaMusica : ''
      };
    } catch (e) {
      // Continuar al siguiente esquema o fallback
    }
  }
  return { ok: false };
}

// Obtener metadatos en vivo de la señal
export async function fetchNowPlaying() {
  try {
    // 1. Intentar primero con el endpoint oficial de MiPanel (http://mipanel.stream/api/TnpBeE9BPT0rWg==) y en paralelo con el JSON del player
    const [mipanelXml, jsonRes] = await Promise.allSettled([
      fetchMiPanelLiveXmlMetadata(),
      fetch(STREAM_CONFIG.metadataUrl).then(r => (r.ok ? r.json() : null))
    ]);

    const xmlData = mipanelXml.status === 'fulfilled' && mipanelXml.value?.ok ? mipanelXml.value : null;
    const data = (jsonRes.status === 'fulfilled' && jsonRes.value) || {};

    const rawSongtitle = (xmlData?.songtitle || data.songtitle || '').trim();
    const rawArtist = (xmlData?.artist || data.artist || '').trim();
    const rawSong = (xmlData?.song || data.song || '').trim();

    let detectedArtist = rawArtist;
    let detectedSong = rawSong;

    // Si el encoder envía "Artista - Canción" unificado en songtitle o en song
    if ((!detectedArtist || isGenericMetadataText(detectedArtist)) && rawSongtitle.includes(' - ')) {
      const parts = rawSongtitle.split(' - ');
      detectedArtist = parts[0].trim();
      detectedSong = parts.slice(1).join(' - ').trim();
    } else if ((!detectedArtist || isGenericMetadataText(detectedArtist)) && rawSong.includes(' - ')) {
      const parts = rawSong.split(' - ');
      detectedArtist = parts[0].trim();
      detectedSong = parts.slice(1).join(' - ').trim();
    }

    const isNonMusic = isGenericMetadataText(detectedArtist) && isGenericMetadataText(detectedSong);

    let finalArtwork = DEFAULT_RADIO_COVER;
    let hasSongCover = false;

    const candidateArt = xmlData?.artwork || data.artwork;

    // 1. Si la señal envía directamente un artwork válido y no-placeholder
    if (candidateArt && typeof candidateArt === 'string' && candidateArt.startsWith('http') && !candidateArt.includes('default') && !candidateArt.includes('placeholder')) {
      finalArtwork = candidateArt;
      hasSongCover = true;
    } 
    // 2. Si no viene carátula pero es una canción real identificable, buscar su cover oficial en iTunes
    else if (!isNonMusic && (detectedArtist || detectedSong)) {
      try {
        const itunesArt = await fetchArtworkForSong(detectedArtist, detectedSong);
        if (itunesArt && itunesArt.startsWith('http') && !itunesArt.includes('cover-default') && !itunesArt.includes('logo-tight')) {
          finalArtwork = itunesArt;
          hasSongCover = true;
        }
      } catch (err) {
        // Fallback silencioso a la carátula oficial por defecto
      }
    }

    return {
      songtitle: rawSongtitle || 'Neblina Stereo 105.5 FM',
      artist: detectedArtist || 'Contigo en la cima',
      song: detectedSong || 'Radio En Vivo',
      artwork: finalArtwork,
      hasSongCover,
      history: data.song_history || []
    };
  } catch (err) {
    console.warn('Error fetching now-playing:', err);
    return {
      songtitle: 'Neblina Stereo 105.5 FM',
      artist: 'Contigo en la cima',
      song: 'Señal En Vivo HD',
      artwork: DEFAULT_RADIO_COVER,
      hasSongCover: false,
      history: []
    };
  }
}

// Decodificador de entidades HTML para títulos y textos de WordPress
export function decodeWpHtmlEntities(str = '') {
  if (!str) return '';
  return str
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8217;/g, '’')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&#8230;|&hellip;/g, '…')
    .replace(/&#038;|&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

const WP_NEWS_CACHE_KEY = 'neblina_wp_news_cache';

// Obtener noticias de WordPress cacheadas sincrónicamente
export function getCachedWordPressNews() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(WP_NEWS_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      if (parsed?.posts && Array.isArray(parsed.posts)) return parsed.posts;
    }
  } catch (e) {}
  return [];
}

// Obtener las últimas noticias oficiales directamente desde WordPress (neblina105fm.com)
export async function fetchWordPressNews(page = 1, perPage = 9) {
  try {
    const controller = new AbortController();
    // Timeout razonable de 8s para no congelar la app si el servidor tarda
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    // Consulta optimizada con _fields para reducir tamaño de payload y tiempo de respuesta en ~60%
    const url = `https://neblina105fm.com/wp-json/wp/v2/posts?_fields=id,date,title,excerpt,content,link,_links,_embedded&_embed=1&per_page=${perPage}&page=${page}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`WP error: ${res.status}`);
    const posts = await res.json();
    
    const mapped = posts.map(post => {
      // Extraer imagen destacada real de WordPress
      let featuredImage = 'https://neblina105fm.com/wp-content/uploads/2026/10/Neblina-2026-10-4.png';
      if (post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0]) {
        featuredImage = post._embedded['wp:featuredmedia'][0].source_url || featuredImage;
      }

      // Extraer categoría de la taxonomía de WordPress
      let category = 'Noticias';
      if (post._embedded && post._embedded['wp:term'] && post._embedded['wp:term'][0] && post._embedded['wp:term'][0][0]) {
        category = post._embedded['wp:term'][0][0].name;
      }

      const decodedTitle = decodeWpHtmlEntities(post.title?.rendered || '');
      const rawExcerpt = (post.excerpt?.rendered || '').replace(/<[^>]+>/g, '').trim();
      const decodedExcerpt = decodeWpHtmlEntities(rawExcerpt);

      return {
        id: post.id,
        title: decodedTitle,
        excerpt: decodedExcerpt,
        content: post.content?.rendered || '',
        date: new Date(post.date).toLocaleDateString('es-VE', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        rawDate: post.date,
        link: post.link,
        image: featuredImage,
        category: category,
        status: 'published',
        featuredInCarousel: true
      };
    });

    // Guardar en cache persistente para que cargue instantáneamente en la próxima visita
    if (page === 1 && mapped.length > 0 && typeof window !== 'undefined') {
      try {
        localStorage.setItem(WP_NEWS_CACHE_KEY, JSON.stringify(mapped));
      } catch (e) {}
    }

    return mapped;
  } catch (err) {
    console.warn('WordPress news fetch error o timeout, recurriendo a cache persistente:', err.message);
    const cached = getCachedWordPressNews();
    if (cached && cached.length > 0) {
      return cached.slice(0, perPage);
    }
    return [];
  }
}

// Cache en memoria para carátulas de álbumes (iTunes)
const artworkCache = new Map();

export async function fetchArtworkForSong(artist = '', title = '') {
  const cleanQ = `${artist} ${title}`
    .replace(/[\(\[\{].*?[\)\]\}]/gi, ' ')
    .replace(/ft\.?|feat\.?|remix|official|video/gi, ' ')
    .replace(/[_\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanQ || isGenericMetadataText(cleanQ)) return DEFAULT_RADIO_COVER;
  if (artworkCache.has(cleanQ)) return artworkCache.get(cleanQ);

  try {
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(cleanQ)}&entity=song&limit=1`);
    if (!res.ok) throw new Error('iTunes error');
    const data = await res.json();
    if (data.results && data.results.length > 0 && data.results[0].artworkUrl100) {
      const art = data.results[0].artworkUrl100.replace('100x100bb', '600x600bb');
      artworkCache.set(cleanQ, art);
      return art;
    }
  } catch (err) {
    // Fallback silencioso
  }

  artworkCache.set(cleanQ, DEFAULT_RADIO_COVER);
  return DEFAULT_RADIO_COVER;
}

// Obtener Ranking & Lo Más Sonado desde la API oficial de MiPanel (http://mipanel.stream/api/TnpBeE9BPT0rWg== y widgets API)
export async function fetchRankingData(type = 'songs', period = '7d', limit = 20) {
  try {
    const endpoint = type === 'artists' 
      ? 'https://mipanel.stream/inc/widgets-api-most-played-artists.php'
      : 'https://mipanel.stream/inc/widgets-api-most-played-songs.php';

    const url = `${endpoint}?porta=7018&code=TnpBeE9BPT0rWg==&period=${encodeURIComponent(period)}&limit=${limit}&min_seconds=30`;
    const [res, liveXml] = await Promise.allSettled([
      fetch(url, { cache: 'no-store' }),
      fetchMiPanelLiveXmlMetadata()
    ]);

    let items = [];
    let periodObj = { key: period };
    let typeVal = type;

    if (res.status === 'fulfilled' && res.value.ok) {
      const data = await res.value.json();
      if (data && data.ok && Array.isArray(data.items)) {
        items = data.items;
        periodObj = data.period || periodObj;
        typeVal = data.type || typeVal;
      }
    }

    // Incorporar también la canción/artista actual reportado por http://mipanel.stream/api/TnpBeE9BPT0rWg== si es válido
    if (liveXml.status === 'fulfilled' && liveXml.value?.ok) {
      const { artist, song, artwork } = liveXml.value;
      if (artist && song && !isGenericMetadataText(artist) && !isGenericMetadataText(song)) {
        if (type === 'artists') {
          const exists = items.some(it => (it.artist || '').toLowerCase() === artist.toLowerCase());
          if (!exists) {
            items = [
              ...items,
              {
                rank: items.length + 1,
                artist,
                total_plays: 1,
                unique_titles: 1,
                artwork,
                trend: { state: 'new', is_new: true }
              }
            ];
          }
        } else {
          const exists = items.some(
            it =>
              (it.artist || '').toLowerCase() === artist.toLowerCase() &&
              (it.title || '').toLowerCase() === song.toLowerCase()
          );
          if (!exists) {
            items = [
              ...items,
              {
                rank: items.length + 1,
                artist,
                title: song,
                plays: 1,
                artwork,
                trend: { state: 'new', is_new: true }
              }
            ];
          }
        }
      }
    }

    if (items.length > 0) {
      return {
        ok: true,
        type: typeVal,
        period: periodObj,
        items
      };
    }
    return { ok: false, items: [] };
  } catch (err) {
    console.error('Error fetching ranking data:', err);
    return { ok: false, items: [] };
  }
}

// Re-exportar utilidades oficiales de WordPress REST API
export { 
  fetchWordPressNewsPaginated, 
  fetchWordPressCategories, 
  getWordPressConfig, 
  saveWordPressConfig, 
  testWordPressConnection, 
  publishPostToWordPress 
} from './wordpressService';

