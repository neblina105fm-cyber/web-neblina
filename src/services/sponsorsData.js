// Neblina Stereo 105.5 FM - Gestión de Patrocinantes y Aliados Comerciales
// Inspirado en el Directorio de CATUREM (Cámara de Turismo del Estado Mérida) y adaptado a Neblina 105.5 FM.
// Compatible con el Sistema Interno Administrativo (CRUD, almacenamiento local, exportación e importación).

const STORAGE_SPONSORS_KEY = 'neblina_sponsors_db';

export const SPONSOR_CATEGORIES = [
  'Todas',
  'Hospedaje & Hoteles',
  'Agencias de Viajes',
  'Restaurantes & Gastronomía',
  'Transporte Turístico',
  'Salud & Especialistas',
  'Comercio & Servicios',
  'Medios & Aliados'
];

export const DEFAULT_SPONSORS = [
  {
    id: 'sp_1',
    name: 'Transfers Mérida C.A.',
    rif: 'J-40918273-1',
    category: 'Transporte Turístico',
    tag: 'Traslados Andinos',
    slogan: 'Traslados ejecutivos y turísticos en el Páramo andino y toda Venezuela',
    description: 'Servicio exclusivo de transporte turístico y traslados privados entre el Aeropuerto Juan Pablo Pérez Alfonzo de El Vigía, Mérida capital, Santo Domingo y las cumbres del Páramo. Unidades confortables con choferes certificados y asistencia las 24 horas.',
    location: 'Av. Las Américas, C.C. Plaza Mayor, Nivel 1, Mérida, Edo. Mérida',
    locationDetails: 'Oficina principal en el Centro Comercial Plaza Mayor, Nivel 1, frente a la parada de transporte ejecutivo. Disponibilidad de recogida a domicilio en cualquier hotel o posada de Santo Domingo.',
    googleMapsUrl: 'https://maps.google.com/?q=Merida+Venezuela',
    url: 'https://www.instagram.com/transfersmerida/',
    instagram: '@transfersmerida',
    facebook: 'https://facebook.com/transfersmerida',
    tiktok: '@transfersmerida',
    phone: '+58 424 745 9774',
    whatsapp: '584247459774',
    web: 'https://transfersmerida.com',
    logo: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=300&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop&q=80'
    ],
    menuUrl: '',
    vectorText: 'TRANSFERS MÉRIDA',
    featuredInHome: true,
    active: true,
    createdAt: '2026-01-15'
  },
  {
    id: 'sp_2',
    name: 'El Encanto Estancia & Spa',
    rif: 'J-31456789-0',
    category: 'Hospedaje & Hoteles',
    tag: 'Estancia & Spa',
    slogan: 'Paz, confort y descanso en las montañas de Santo Domingo',
    description: 'Refugio paradisíaco en Santo Domingo de Mérida. Cabañas de montaña con calefacción, gastronomía andina de autor, circuito de hidroterapia, spa y senderos ecológicos frente a las cumbres nevadas.',
    location: 'Carretera Trasandina, Sector Las Piedras, Santo Domingo, Edo. Mérida',
    locationDetails: 'Carretera Trasandina, entrada al Sector Las Piedras, a 4 minutos del casco central de Santo Domingo en dirección hacia el Collado del Cóndor. Portón rústico de piedra con vigilancia privada.',
    googleMapsUrl: 'https://maps.google.com/?q=Santo+Domingo+Merida+Venezuela',
    url: 'https://www.instagram.com/elencantoestancia/',
    instagram: '@elencantoestancia',
    facebook: 'https://facebook.com/elencantoestancia',
    tiktok: '',
    phone: '+58 424 745 9774',
    whatsapp: '584247459774',
    web: 'https://elencantoestancia.com',
    logo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80'
    ],
    menuUrl: '',
    vectorText: 'El Encanto ESTANCIA & SPA',
    featuredInHome: true,
    active: true,
    createdAt: '2026-01-20'
  },
  {
    id: 'sp_3',
    name: 'Hotel & Cabañas Los Virios',
    rif: 'J-40192834-5',
    category: 'Hospedaje & Hoteles',
    tag: 'Cabañas Andinas',
    slogan: 'El refugio perfecto con el clima privilegiado de Santo Domingo',
    description: 'Cabañas familiares y habitaciones de estilo rústico equipadas con chimeneas a leña, áreas verdes, zona de parrillas y estacionamiento privado con vigilancia las 24 horas.',
    location: 'Sector El Arbolito, Vía Trasandina, Santo Domingo, Edo. Mérida',
    locationDetails: 'Vía principal Trasandina, Sector El Arbolito. Entrada señalizada con valla de madera frente al mirador de las montañas.',
    googleMapsUrl: 'https://maps.google.com/?q=Santo+Domingo+Merida+Venezuela',
    url: 'https://www.instagram.com/hotellosvirios/',
    instagram: '@hotellosvirios',
    facebook: 'https://facebook.com/hotellosvirios',
    tiktok: '',
    phone: '+58 424 745 9774',
    whatsapp: '584247459774',
    web: '',
    logo: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=300&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&auto=format&fit=crop&q=80'
    ],
    menuUrl: '',
    vectorText: 'Los Virios HOTEL & CABAÑAS',
    featuredInHome: true,
    active: true,
    createdAt: '2026-02-01'
  },
  {
    id: 'sp_4',
    name: 'Destinos del Sol Turismo',
    rif: 'J-50123987-2',
    category: 'Agencias de Viajes',
    tag: 'Turismo y Pasajes',
    slogan: 'Tours, pasajes y las mejores rutas turísticas de Venezuela',
    description: 'Agencia de viajes autorizada. Boletos aéreos nacionales e internacionales, paquetes turísticos para el Teleférico Mukumbarí de Mérida, Laguna de Mucubají, Pico El Águila y Los Nevados.',
    location: 'Calle 24 entre Av. 3 y 4, Casco Central, Mérida, Edo. Mérida',
    locationDetails: 'Calle 24, Edificio Albarregas, Planta Baja, a 50 metros del Centro Histórico de Mérida.',
    googleMapsUrl: 'https://maps.google.com/?q=Merida+Centro+Venezuela',
    url: 'https://www.instagram.com/destinosdelsol/',
    instagram: '@destinosdelsol',
    facebook: 'https://facebook.com/destinosdelsol',
    tiktok: '@destinosdelsol',
    phone: '+58 424 745 9774',
    whatsapp: '584247459774',
    web: 'https://destinosdelsol.com',
    logo: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop&q=80'
    ],
    menuUrl: '',
    vectorText: 'DESTINOS DEL SOL',
    featuredInHome: true,
    active: true,
    createdAt: '2026-02-10'
  },
  {
    id: 'sp_5',
    name: 'Green Travel Agencia',
    rif: 'J-41123456-8',
    category: 'Agencias de Viajes',
    tag: 'Ecoturismo de Aventura',
    slogan: 'Ecoturismo andino y expediciones en la Sierra Nevada',
    description: 'Pioneros en turismo de naturaleza y montaña. Trekking a lagunas glaciares, escalada, observación de aves y travesías guiadas por los valles altos de Mérida.',
    location: 'Av. Gonzalo Picón, Edif. Los Andes, Local 3, Mérida, Edo. Mérida',
    locationDetails: 'Av. Gonzalo Picón, frente al Parque de las Heroínas Merideñas, salida hacia el Teleférico Mukumbarí.',
    googleMapsUrl: 'https://maps.google.com/?q=Merida+Venezuela',
    url: 'https://www.instagram.com/greentravelve/',
    instagram: '@greentravelve',
    facebook: 'https://facebook.com/greentravelve',
    tiktok: '',
    phone: '+58 424 745 9774',
    whatsapp: '584247459774',
    web: '',
    logo: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=300&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80'
    ],
    menuUrl: '',
    vectorText: 'Green Travel AGENCIA DE VIAJES',
    featuredInHome: true,
    active: true,
    createdAt: '2026-02-15'
  },
  {
    id: 'sp_6',
    name: 'Convención Hotel Boutique',
    rif: 'J-30876543-9',
    category: 'Hospedaje & Hoteles',
    tag: 'Hotel Boutique',
    slogan: 'Elegancia, eventos corporativos y hospitalidad de primera clase',
    description: 'Alojamiento premium en la zona norte de Mérida. Salones de eventos de alta capacidad, restaurante gourmet, suites ejecutivas y vista panorámica a la Sierra de La Culata.',
    location: 'Av. Universidad, Sector Hoyada de Milla, Mérida, Edo. Mérida',
    locationDetails: 'Av. Universidad con Calle Los Hoteles, Sector Hoyada de Milla. Entrada con fuente decorativa y estacionamiento techado.',
    googleMapsUrl: 'https://maps.google.com/?q=Hoyada+de+Milla+Merida+Venezuela',
    url: 'https://www.instagram.com/convencionhotel/',
    instagram: '@convencionhotel',
    facebook: 'https://facebook.com/convencionhotel',
    tiktok: '',
    phone: '+58 424 745 9774',
    whatsapp: '584247459774',
    web: 'https://convencionhotel.com',
    logo: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=300&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80'
    ],
    menuUrl: '',
    vectorText: 'CONVENCIÓN HOTEL BOUTIQUE',
    featuredInHome: true,
    active: true,
    createdAt: '2026-02-20'
  },
  {
    id: 'sp_7',
    name: 'Dra. Melina Chuecos',
    rif: 'V-16892345-0',
    category: 'Salud & Especialistas',
    tag: 'Ginecología y Obstetricia',
    slogan: 'Ginecología y Obstetricia · La prevención es la clave',
    description: 'Atención médica ginecológica integral, ecografías 4D y 5D, control prenatal de alto riesgo, colposcopia y salud de la mujer con tecnología de vanguardia y calidez humana.',
    location: 'Centro Médico Quirúrgico Los Andes, Consultorio 204, Mérida, Edo. Mérida',
    locationDetails: 'Centro Médico Quirúrgico Los Andes, Piso 2, Consultorio 204. Ascensor disponible y recepción médica.',
    googleMapsUrl: 'https://maps.google.com/?q=Merida+Centro+Medico+Los+Andes',
    url: 'https://www.instagram.com/melinaginecologo1/',
    instagram: '@melinaginecologo1',
    facebook: 'https://facebook.com/dramelinachuecos',
    tiktok: '',
    phone: '+58 424 745 9774',
    whatsapp: '584247459774',
    web: '',
    logo: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=300&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=80'
    ],
    menuUrl: '',
    vectorText: 'Dra. Melina Chuecos',
    featuredInHome: true,
    active: true,
    createdAt: '2026-03-01'
  },
  {
    id: 'sp_8',
    name: 'Restaurante & Café La Cima',
    rif: 'J-40987123-6',
    category: 'Restaurantes & Gastronomía',
    tag: 'Gastronomía Andina',
    slogan: 'Sabores tradicionales del páramo y la mejor trucha andina',
    description: 'Especialistas en trucha deshuesada al ajillo, pisca andina tradicional, pastelitos de queso ahumado, café recién tostado de origen andino y exquisita repostería local.',
    location: 'Calle Bolívar, frente a la Plaza Bolívar, Santo Domingo, Edo. Mérida',
    locationDetails: 'Ubicado en pleno corazón de Santo Domingo, a solo 20 metros de la Plaza Bolívar, al lado del Centro Artesanal. Fácil acceso y estacionamiento vigilado.',
    googleMapsUrl: 'https://maps.google.com/?q=Santo+Domingo+Merida+Venezuela',
    url: 'https://www.instagram.com/neblina105fm',
    instagram: '@lacimarest',
    facebook: 'https://facebook.com/lacimarest',
    tiktok: '@lacimarest',
    phone: '+58 424 745 9774',
    whatsapp: '584247459774',
    web: 'https://neblina105fm.com',
    logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80'
    ],
    menuUrl: 'https://neblina105fm.com/menu-la-cima',
    vectorText: 'La Cima RESTAURANTE & CAFÉ',
    featuredInHome: true,
    active: true,
    createdAt: '2026-03-05'
  }
];

// Notificar a todos los componentes que la lista de patrocinantes cambió
function notifySponsorsChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('neblina_sponsors_updated'));
  }
}

// Obtener lista completa (para el panel interno administrativo)
export function getAllSponsors() {
  if (typeof window === 'undefined') return DEFAULT_SPONSORS;
  try {
    const raw = localStorage.getItem(STORAGE_SPONSORS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Enriquecer con photos, menuUrl y locationDetails si provienen de datos guardados previos
        return parsed.map(item => {
          const defaultMatch = DEFAULT_SPONSORS.find(d => d.id === item.id || d.name === item.name);
          if (defaultMatch) {
            return {
              ...defaultMatch,
              ...item,
              photos: (Array.isArray(item.photos) && item.photos.length > 0) ? item.photos : defaultMatch.photos,
              menuUrl: item.menuUrl !== undefined ? item.menuUrl : (defaultMatch.menuUrl || ''),
              locationDetails: item.locationDetails || (defaultMatch.locationDetails || '')
            };
          }
          return item;
        });
      }
    }
  } catch (e) {
    console.warn('Error leyendo sponsors de localStorage:', e);
  }
  return DEFAULT_SPONSORS;
}

// Obtener solo patrocinantes activos (para la vista pública)
export function getActiveSponsors() {
  const all = getAllSponsors();
  return all.filter(s => s.active !== false && !s.trashed);
}

// Guardar lista completa
export function saveActiveSponsors(sponsorsList) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_SPONSORS_KEY, JSON.stringify(sponsorsList));
    notifySponsorsChanged();
  } catch (e) {
    console.error('Error guardando patrocinantes:', e);
  }
}

// Guardar o Actualizar un único Aliado (Creación o Edición)
export function saveSponsor(sponsorData) {
  const all = [...getAllSponsors()];
  const index = all.findIndex(s => s.id === sponsorData.id);

  if (index >= 0) {
    all[index] = { ...all[index], ...sponsorData, updatedAt: new Date().toISOString() };
  } else {
    const newSponsor = {
      ...sponsorData,
      id: sponsorData.id || `sp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      active: sponsorData.active !== undefined ? sponsorData.active : true,
      featuredInHome: sponsorData.featuredInHome !== undefined ? sponsorData.featuredInHome : true
    };
    all.unshift(newSponsor);
  }

  saveActiveSponsors(all);
  return all;
}

// Enviar un aliado a la papelera (Eliminación temporal)
export function trashSponsor(id) {
  const all = getAllSponsors().map(s => {
    if (String(s.id) === String(id)) {
      return { ...s, trashed: true, trashedAt: new Date().toISOString() };
    }
    return s;
  });
  saveActiveSponsors(all);
  return all;
}

// Restaurar un aliado desde la papelera
export function restoreSponsor(id) {
  const all = getAllSponsors().map(s => {
    if (String(s.id) === String(id)) {
      return { ...s, trashed: false, trashedAt: null };
    }
    return s;
  });
  saveActiveSponsors(all);
  return all;
}

// Eliminar un aliado definitivamente
export function deleteSponsor(id) {
  const all = getAllSponsors().filter(s => String(s.id) !== String(id));
  saveActiveSponsors(all);
  return all;
}

export const deleteSponsorPermanently = deleteSponsor;

// Vaciar papelera de aliados
export function emptySponsorsTrash() {
  const all = getAllSponsors().filter(s => !s.trashed);
  saveActiveSponsors(all);
  return all;
}

// Alternar visibilidad en carrusel de Inicio
export function toggleSponsorFeaturedInHome(id) {
  const all = getAllSponsors().map(s => {
    if (s.id === id) {
      return { ...s, featuredInHome: !s.featuredInHome };
    }
    return s;
  });
  saveActiveSponsors(all);
  return all;
}

// Alternar estado activo / pausado (Visibilidad en Directorio)
export function toggleSponsorActive(id) {
  const all = getAllSponsors().map(s => {
    if (s.id === id) {
      return { ...s, active: !s.active };
    }
    return s;
  });
  saveActiveSponsors(all);
  return all;
}

// Restablecer a los datos por defecto
export function resetDefaultSponsors() {
  saveActiveSponsors(DEFAULT_SPONSORS);
  return DEFAULT_SPONSORS;
}

// Obtener conteo de categorías para los pills estilo directorio
export function getSponsorsCategoriesCount(sponsors = null) {
  const list = sponsors || getActiveSponsors();
  const counts = {};
  list.forEach(s => {
    const cat = s.category || 'Otros Aliados';
    counts[cat] = (counts[cat] || 0) + 1;
  });
  return counts;
}

// Exportar base de datos a JSON para respaldo o descarga
export function exportSponsorsJSON() {
  const sponsors = getAllSponsors();
  const data = {
    station: 'Neblina Stereo 105.5 FM',
    module: 'Directorio de Aliados Comerciales y Patrocinantes',
    exportedAt: new Date().toISOString(),
    total: sponsors.length,
    sponsors
  };
  return JSON.stringify(data, null, 2);
}

// Importar base de datos desde JSON
export function importSponsorsJSON(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    const list = Array.isArray(parsed) ? parsed : (parsed.sponsors || []);
    if (!Array.isArray(list) || list.length === 0) {
      throw new Error('El archivo no contiene una lista válida de aliados.');
    }
    saveActiveSponsors(list);
    return { success: true, count: list.length };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
