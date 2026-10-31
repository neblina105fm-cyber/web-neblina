// Neblina Stereo 105.5 FM - Servicio Oficial de Banners Publicitarios (Imágenes & Videos)
// Gestión integral por cliente comercial, soporte multiformato (1-5 imágenes, 2-3 videos),
// especificaciones técnicas para diseñadores y métricas de conversión con rotación inteligente.

const STORAGE_BANNERS_KEY = 'neblina_ad_banners_v1';

// =========================================================================
// ESPECIFICACIONES TÉCNICAS OFICIALES RECOMENDADAS (MEDIDAS & FORMATOS)
// Para diseñadores gráficos, agencias de publicidad y clientes de la radio
// =========================================================================
export const BANNER_SPECS = {
  desktop: {
    title: 'Pantallas Computadora & Tablets (Escritorio)',
    aspectRatio: '4:1 (Panorámico Ultra-Ancho) o 3:1',
    standardResolution: '1200 x 300 px (1x Estándar)',
    retinaResolution: '2400 x 600 px (2x Retina HD - Máxima Nitidez sin pixelado)',
    recommendedFormats: 'WebP (calidad 85-90%) / PNG-24 (para tipografías o transparencias) / JPG progresivo',
    maxFileSize: '450 KB recomendado (ideal < 280 KB para carga instantánea)',
    colorSpace: 'sRGB (perfil estándar web para color fiel en pantallas Mac y PC)'
  },
  mobile: {
    title: 'Smartphones y Celulares (Móvil Vertical/Horizontal)',
    aspectRatio: '2:1 (Diseño adaptado para anchos de 360px a 430px)',
    standardResolution: '800 x 400 px (1x Estándar)',
    retinaResolution: '1600 x 800 px (2x HD Retina / OLED)',
    recommendedFormats: 'WebP (85% calidad) / JPG optimizado',
    maxFileSize: '220 KB (garantiza apertura inmediata en redes móviles 3G/4G)',
    colorSpace: 'sRGB'
  },
  video: {
    title: 'Spots Publicitarios en Video (Bucle Continuo / Loop)',
    desktopResolution: '1200 x 300 px (4:1) o 1920 x 480 px',
    mobileResolution: '800 x 400 px (2:1)',
    format: 'MP4 con códec de video H.264 (AVC Baseline/High Profile) y WebM (VP9)',
    attributes: 'Autoplay, Muted (Silenciado), Loop (Bucle), Playsinline',
    bitrate: '1.5 Mbps a 2.2 Mbps a 24-30 cuadros por segundo (fps)',
    audioTrack: 'Silenciado / Sin pista de audio (Requisito estricto de iOS WebKit y Android Chrome para auto-reproducción)',
    duration: 'De 6 a 15 segundos en bucle suave',
    maxFileSize: '4.5 MB máximo (recomendado de 1.8 a 3.0 MB)'
  },
  buttonSafeZone: {
    title: 'Área Segura y Zona de Interacción (Botón CTA de WhatsApp)',
    position: 'Cuadrante inferior derecho (Right: 20px, Bottom: 14px en computadoras; centrado inferior en móviles)',
    clearance: 'Dejar un recuadro de 280 px de ancho x 65 px de alto en la esquina inferior derecha completamente libre de logotipos, números de teléfono o textos clave.',
    interaction: 'El botón interactivo conecta en un clic con el WhatsApp comercial del cliente o enlace web configurado.'
  },
  newsGrid: {
    title: 'Banner en Cuadrícula de Noticias (Sala de Prensa)',
    wide: {
      span: '2 columnas (computadora)',
      aspectRatio: '2:1',
      standardResolution: '800 x 400 px (1x Estándar)',
      retinaResolution: '1600 x 800 px (2x Retina)'
    },
    square: {
      span: '1 columna (tablet / celular)',
      aspectRatio: '1:1',
      standardResolution: '400 x 400 px (1x Estándar)',
      retinaResolution: '800 x 800 px (2x Retina)'
    },
    recommendedFormats: 'WebP / JPG',
    maxFileSize: '300 KB máximo',
    safeZone: 'Mantener textos y logotipos en la zona segura central (el recorte varía entre 2:1 y 1:1)'
  },
  smartTv: {
    title: 'Banner Superior para Smart TVs',
    aspectRatio: '16:9 Panorámico TV (o Ultra-Panorámico 6:1)',
    standardResolution: '1920 x 320 px (Pantallas 1080p / 4K)',
    retinaResolution: '3840 x 640 px (4K Ultra HD)',
    recommendedFormats: 'WebP (90% calidad) / PNG-24 sin pixelado',
    maxFileSize: '600 KB máximo',
    safeZone: 'Mantener contenido centrado horizontalmente visible a distancia de sala de estar (10-foot UI)'
  },
  limits: {
    maxImagesPerBanner: 5,
    maxVideosPerBanner: 3
  }
};

// =========================================================================
// NORMALIZACIÓN DE BANNERS (MIGRACIÓN SEGURA & RETROCOMPATIBILIDAD)
// =========================================================================
export function normalizeBanner(b) {
  if (!b) return null;
  const images = Array.isArray(b.images) ? [...b.images] : [];
  const videos = Array.isArray(b.videos) ? [...b.videos] : [];

  let clientId = b.clientId || null;
  let clientName = b.clientName || '';

  // Auto-vincular banners de muestra existentes sin cliente para demostración completa
  if (!clientId) {
    if (b.id === 'ad_default_2' || b.id === 'ad_client_fogon_01' || (b.title && b.title.toLowerCase().includes('fogón'))) {
      clientId = 'cli_001';
      clientName = 'Restaurante & Parrillera El Fogón del Páramo';
    } else if (b.id === 'ad_default_3' || b.id === 'ad_client_paramo_vip_02' || (b.title && b.title.toLowerCase().includes('vip'))) {
      clientId = 'cli_002';
      clientName = 'Discoteca & Club Nocturno Páramo VIP';
    } else if (b.id === 'ad_default_4' || b.id === 'ad_client_cima_hotel_03' || (b.title && b.title.toLowerCase().includes('cima'))) {
      clientId = 'cli_hoteles_cima';
      clientName = 'Hotel & Cabañas La Cima del Páramo';
    }
  }

  // Si tiene un mediaUrl antiguo y no tiene imágenes o videos en el array, migrarlo
  if (images.length === 0 && b.mediaUrl && b.type !== 'video') {
    images.push({
      id: `img_${b.id || Date.now()}_1`,
      desktopUrl: b.mediaUrl,
      mobileUrl: b.mobileMediaUrl || b.mediaUrl,
      caption: b.title || 'Arte publicitario'
    });
  }

  // Para demostración rica de El Fogón si no tiene imágenes
  if (clientId === 'cli_001' && images.length === 0) {
    images.push(
      {
        id: `img_fogon_1`,
        desktopUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
        mobileUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
        caption: 'Salón principal y ambiente andino'
      },
      {
        id: `img_fogon_2`,
        desktopUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
        mobileUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
        caption: 'Cortes de carne y parrilladas'
      }
    );
  }

  // Para demostración rica de Páramo VIP si no tiene imágenes
  if (clientId === 'cli_002' && images.length === 0) {
    images.push(
      {
        id: `img_vip_1`,
        desktopUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
        mobileUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
        caption: 'Pista y show de luces'
      }
    );
  }

  if (videos.length === 0 && b.mediaUrl && b.type === 'video') {
    videos.push({
      id: `vid_${b.id || Date.now()}_1`,
      videoUrl: b.mediaUrl,
      mobileVideoUrl: '',
      caption: 'Spot publicitario principal'
    });
  }

  // Determinar tipo
  let type = b.type || 'gradient';
  if (videos.length > 0 && images.length > 0) {
    type = 'mixed';
  } else if (videos.length > 0) {
    type = 'video';
  } else if (images.length > 0) {
    type = 'image';
  }

  return {
    ...b,
    clientId,
    clientName,
    type,
    images: images.slice(0, 5),
    videos: videos.slice(0, 3),
    mediaUrl: b.mediaUrl || images[0]?.desktopUrl || videos[0]?.videoUrl || '',
    active: b.active ?? true,
    placements: b.placements || 'all',
    gridWideUrl: b.gridWideUrl || '',
    gridSquareUrl: b.gridSquareUrl || '',
    tvBannerUrl: b.tvBannerUrl || '',
    viewsCount: Number(b.viewsCount) || 0,
    clicksCount: Number(b.clicksCount) || 0,
    createdAt: b.createdAt || new Date().toISOString()
  };
}

// Banners predeterminados con clientes reales y recursos multi-imagen / video
export const INITIAL_BANNERS = [
  {
    id: 'ad_client_fogon_01',
    clientId: 'cli_001',
    clientName: 'Restaurante & Parrillera El Fogón del Páramo',
    title: 'Cortes al carbón y gastronomía criolla en Santo Domingo',
    subtitle: 'Ambiente familiar, música en vivo, carnes de primera y vista a las montañas.',
    badge: 'Restaurante Aliado',
    type: 'mixed',
    mediaUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    images: [
      {
        id: 'img_fogon_1',
        desktopUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
        mobileUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
        caption: 'Salón principal y ambiente'
      },
      {
        id: 'img_fogon_2',
        desktopUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
        mobileUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
        caption: 'Cortes de carne a la brasa'
      },
      {
        id: 'img_fogon_3',
        desktopUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
        mobileUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
        caption: 'Terraza cordillerana'
      }
    ],
    videos: [
      {
        id: 'vid_fogon_1',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-chef-garnishing-a-plate-in-a-restaurant-kitchen-42999-large.mp4',
        caption: 'Preparación en cocina y cortes'
      }
    ],
    ctaText: 'Reservar Mesa / Menú',
    ctaLink: 'https://wa.me/584247459774?text=%C2%A1Hola%20El%20Fog%C3%B3n%20del%20P%C3%A1ramo!%20Deseo%20conocer%20el%20men%C3%BA%20y%20hacer%20una%20reservaci%C3%B3n',
    active: true,
    placements: 'all',
    viewsCount: 1420,
    clicksCount: 89,
    createdAt: '2026-10-01T12:00:00.000Z'
  },
  {
    id: 'ad_client_paramo_vip_02',
    clientId: 'cli_002',
    clientName: 'Discoteca & Club Nocturno Páramo VIP',
    title: 'Las Noches Más Prendidas de Santo Domingo los Fines de Semana',
    subtitle: 'Luces láser, DJs invitados, coctelería internacional y seguridad privada.',
    badge: 'Discoteca & Lounge',
    type: 'mixed',
    mediaUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
    images: [
      {
        id: 'img_vip_1',
        desktopUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
        mobileUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
        caption: 'Pista de baile y show de luces'
      },
      {
        id: 'img_vip_2',
        desktopUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
        mobileUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
        caption: 'Zona VIP y cócteles'
      }
    ],
    videos: [
      {
        id: 'vid_vip_1',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-dj-mixing-music-in-a-club-at-night-42358-large.mp4',
        caption: 'DJ en vivo Páramo VIP'
      }
    ],
    ctaText: 'Lista VIP & Cover',
    ctaLink: 'https://wa.me/584126549870?text=%C2%A1Hola%20P%C3%A1ramo%20VIP!%20Quiero%20anotarme%20en%20lista%20para%20este%20fin%20de%20semana',
    active: true,
    placements: 'all',
    viewsCount: 1105,
    clicksCount: 64,
    createdAt: '2026-10-05T12:00:00.000Z'
  },
  {
    id: 'ad_client_cima_hotel_03',
    clientId: 'cli_hoteles_cima',
    clientName: 'Hotel & Cabañas La Cima del Páramo',
    title: 'Disfruta de la Mejor Vista Cordillerana, Chimenea y Gastronomía',
    subtitle: 'Cabañas equipadas con calefacción, estacionamiento privado y senderos.',
    badge: 'Hospedaje Premium',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    images: [
      {
        id: 'img_cima_1',
        desktopUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
        mobileUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
        caption: 'Fachada del hotel y cordillera'
      },
      {
        id: 'img_cima_2',
        desktopUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
        mobileUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
        caption: 'Habitaciones con chimenea'
      }
    ],
    videos: [],
    ctaText: 'Reservar Estadía',
    ctaLink: 'https://wa.me/584247459774?text=%C2%A1Hola!%20Quiero%20informaci%C3%B3n%20y%20tarifas%20de%20habitaciones%20en%20Hotel%20La%20Cima',
    active: true,
    placements: 'all',
    viewsCount: 890,
    clicksCount: 47,
    createdAt: '2026-10-10T12:00:00.000Z'
  },
  {
    id: 'ad_neblina_pauta_04',
    clientId: null,
    clientName: 'Neblina 105.5 FM Oficial',
    title: 'Pauta tu negocio en Santo Domingo, Mérida y el mundo',
    subtitle: 'Llega a miles de oyentes en señal abierta FM y en nuestra Web App interactiva.',
    badge: 'Publicidad Radial',
    type: 'gradient',
    mediaUrl: '',
    images: [],
    videos: [],
    ctaText: 'Pautar en Neblina',
    ctaLink: 'https://wa.me/584247459774?text=%C2%A1Hola%20Neblina%20105.5%20FM!%20Deseo%20cotizar%20un%20espacio%20publicitario',
    active: true,
    placements: 'all',
    viewsCount: 1650,
    clicksCount: 102,
    createdAt: '2026-10-15T12:00:00.000Z'
  }
];

// Notificar cambios globales en los banners
function notifyBannersChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('neblina_banners_updated', { detail: { timestamp: Date.now() } }));
  }
}

// Obtener todos los banners almacenados (normalizados)
export function getAllBanners() {
  if (typeof window === 'undefined') return INITIAL_BANNERS.map(normalizeBanner);
  try {
    const raw = localStorage.getItem(STORAGE_BANNERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(normalizeBanner);
      }
    }
  } catch (e) {
    console.warn('Error leyendo banners de localStorage:', e);
  }
  return INITIAL_BANNERS.map(normalizeBanner);
}

// Guardar lista completa de banners
export function saveAllBanners(banners) {
  if (typeof window === 'undefined') return;
  try {
    const normalized = (banners || []).map(normalizeBanner);
    localStorage.setItem(STORAGE_BANNERS_KEY, JSON.stringify(normalized));
    notifyBannersChanged();
  } catch (e) {
    console.error('Error guardando banners:', e);
  }
}

// Obtener banners asociados a un cliente específico
export function getBannersByClient(clientId) {
  if (!clientId) return [];
  const all = getAllBanners();
  return all.filter(b => String(b.clientId) === String(clientId));
}

// Guardar o actualizar un banner individual
export function saveBanner(bannerData) {
  const current = getAllBanners();
  let updated;
  const normalizedData = normalizeBanner(bannerData);

  if (normalizedData.id) {
    const exists = current.some(b => String(b.id) === String(normalizedData.id));
    if (exists) {
      updated = current.map(b => String(b.id) === String(normalizedData.id) ? { ...b, ...normalizedData, updatedAt: new Date().toISOString() } : b);
    } else {
      updated = [normalizedData, ...current];
    }
  } else {
    const newBanner = {
      ...normalizedData,
      id: `ad_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      viewsCount: 0,
      clicksCount: 0,
      createdAt: new Date().toISOString()
    };
    updated = [newBanner, ...current];
  }

  saveAllBanners(updated);
  return updated;
}

// Eliminar un banner
export function deleteBanner(bannerId) {
  const current = getAllBanners();
  const filtered = current.filter(b => String(b.id) !== String(bannerId));
  saveAllBanners(filtered);
  return filtered;
}

// Alternar estado activo de un banner
export function toggleBannerActive(bannerId) {
  const current = getAllBanners();
  const updated = current.map(b => {
    if (String(b.id) === String(bannerId)) {
      return { ...b, active: !b.active };
    }
    return b;
  });
  saveAllBanners(updated);
  return updated;
}

// Registrar una visualización (impresión) de banner con debounce por sesión para evitar saturar localStorage en picos de tráfico
const bannerViewsRecordedThisSession = new Set();

export function recordBannerView(bannerId) {
  if (typeof window === 'undefined' || !bannerId) return;
  try {
    const sessionKey = `${bannerId}_${Math.floor(Date.now() / 60000)}`;
    if (bannerViewsRecordedThisSession.has(sessionKey)) return;
    bannerViewsRecordedThisSession.add(sessionKey);

    const current = getAllBanners();
    const updated = current.map(b => {
      if (String(b.id) === String(bannerId)) {
        return { ...b, viewsCount: (b.viewsCount || 0) + 1 };
      }
      return b;
    });
    localStorage.setItem(STORAGE_BANNERS_KEY, JSON.stringify(updated));
  } catch (e) {}
}

// Registrar un clic en el botón del banner
export function recordBannerClick(bannerId) {
  if (typeof window === 'undefined' || !bannerId) return;
  try {
    const current = getAllBanners();
    const updated = current.map(b => {
      if (String(b.id) === String(bannerId)) {
        return { ...b, clicksCount: (b.clicksCount || 0) + 1 };
      }
      return b;
    });
    localStorage.setItem(STORAGE_BANNERS_KEY, JSON.stringify(updated));
    notifyBannersChanged();
  } catch (e) {}
}

// Obtener banners aptos para una ubicación ('home', 'news', 'news-grid' o 'smart-tv'), excluyendo opcionalmente banners activos en otras zonas para evitar duplicados simultáneos
// 'smart-tv' devuelve banners con ubicación 'smart-tv' o 'all'.
export function getActiveBannersForPlacement(placement = 'all', excludeId = null) {
  const all = getAllBanners().filter(b => b.active);
  let matching = all.filter(b => b.placements === 'all' || b.placements === placement);

  if (matching.length === 0) matching = all;

  // Si se solicita excluir uno o varios IDs de banners activos (ej. el del home o el del medio de la nota de prensa)
  if (excludeId && matching.length > 1) {
    const isExcluded = (id) => {
      if (Array.isArray(excludeId)) {
        return excludeId.filter(Boolean).some(ex => String(ex) === String(id));
      }
      return String(id) === String(excludeId);
    };

    const withoutExcluded = matching.filter(b => !isExcluded(b.id));
    if (withoutExcluded.length > 0) return withoutExcluded;
  }

  return matching.length > 0 ? matching : INITIAL_BANNERS.map(normalizeBanner);
}
