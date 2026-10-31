// Neblina Stereo 105.5 FM - Servicio de Gestión de Eventos y Cartelera
// Inspirado en CATUREM (Cámara de Turismo de Mérida) y la agenda cultural del Páramo andino.
// Soporta almacenamiento local (CRUD), exportación e importación en el Sistema Interno Administrativo.

const STORAGE_EVENTS_KEY = 'neblina_events_db';

export const EVENT_CATEGORIES = [
  'Todas',
  'Ferias & Fiestas Patronales',
  'Turismo & Aventura Andina',
  'Conciertos & Música en Vivo',
  'Gastronomía & Tradición',
  'Deportes de Montaña',
  'Congresos & Corporativos',
  'Comunidad & Cultura'
];

export const DEFAULT_EVENTS = [
  {
    id: 'evt_1',
    title: 'Gran Fiesta Patronal Santo Domingo de Guzmán 2026',
    category: 'Ferias & Fiestas Patronales',
    date: '2026-11-15',
    dateDisplay: 'Domingo 15 de Noviembre, 2026',
    time: '10:00 AM - 11:00 PM',
    location: 'Plaza Bolívar y Complejo Cultural, Santo Domingo, Mérida',
    googleMapsUrl: 'https://maps.google.com/?q=Santo+Domingo+Merida+Venezuela',
    flyer: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    description: 'La máxima celebración del pueblo de Santo Domingo. Misa solemne, procesión por las calles del páramo, desfile de agrupaciones folclóricas, música campesina en vivo, feria gastronómica de la trucha y fuegos artificiales.',
    admissionPrice: 'Entrada Libre / Apto para toda la familia',
    isFree: true,
    coordinatorName: 'Comité de Festejos Patronales',
    coordinatorPhone: '+584247459774',
    coordinatorWhatsApp: '584247459774',
    eventUrl: 'https://neblina105fm.com',
    instagram: '@neblina105fm',
    facebook: 'https://facebook.com/neblina105fm',
    status: 'upcoming', // 'upcoming' | 'ongoing' | 'completed'
    featuredInHome: true,
    active: true,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'evt_2',
    title: 'Festival Andino de la Trucha & Café de Altura',
    category: 'Gastronomía & Tradición',
    date: '2026-11-22',
    dateDisplay: 'Domingo 22 de Noviembre, 2026',
    time: '11:00 AM - 7:00 PM',
    location: 'Sector Las Piedras, Posadas y Restaurantes Aliados, Santo Domingo',
    googleMapsUrl: 'https://maps.google.com/?q=Santo+Domingo+Merida+Venezuela',
    flyer: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
    description: 'Encuentro culinario con chefs invitados de Mérida, Trujillo y Caracas. Degustación de 12 recetas de trucha andina fresca, catas guiadas de café de especialidad cosechado en los valles altos y música instrumental en vivo.',
    admissionPrice: 'Entrada General Libre · Consumos por ticket',
    isFree: true,
    coordinatorName: 'Cámara de Turismo y Posadas Andinas (CATUREM)',
    coordinatorPhone: '+584247459774',
    coordinatorWhatsApp: '584247459774',
    eventUrl: 'https://caturem.com',
    instagram: '@caturem',
    facebook: '',
    status: 'upcoming',
    featuredInHome: true,
    active: true,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
  },
  {
    id: 'evt_3',
    title: 'Travesía MTB Páramo Extremo: Mucubají - Santo Domingo',
    category: 'Deportes de Montaña',
    date: '2026-12-06',
    dateDisplay: 'Sábado 6 de Diciembre, 2026',
    time: '7:30 AM (Partida)',
    location: 'Salida: Laguna de Mucubají (3.550 msnm) · Llegada: Santo Domingo',
    googleMapsUrl: 'https://maps.google.com/?q=Laguna+de+Mucubaji+Merida+Venezuela',
    flyer: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80',
    description: 'Competencia y reto cicloturístico de 42 km de descenso técnico y senderos naturales por la cordillera andina. Incluye puntos de hidratación, asistencia médica, medalla conmemorativa y cobertura en vivo por Neblina 105.5 FM.',
    admissionPrice: 'Inscripción Preventa $15 · Categorías Open y Máster',
    isFree: false,
    coordinatorName: 'Club de Ciclismo Los Andes & Comisión Deportiva Neblina',
    coordinatorPhone: '+584247459774',
    coordinatorWhatsApp: '584247459774',
    eventUrl: 'https://neblina105fm.com',
    instagram: '@paramoextremomtb',
    facebook: '',
    status: 'upcoming',
    featuredInHome: true,
    active: true,
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString()
  },
  {
    id: 'evt_4',
    title: 'Noche de Gaitas y Música Bailable de Fin de Año',
    category: 'Conciertos & Música en Vivo',
    date: '2026-12-18',
    dateDisplay: 'Viernes 18 de Diciembre, 2026',
    time: '8:00 PM hasta el amanecer',
    location: 'Salón de Eventos Hotel Los Virios, Santo Domingo, Mérida',
    googleMapsUrl: 'https://maps.google.com/?q=Santo+Domingo+Merida+Venezuela',
    flyer: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
    description: 'El gran baile navideño para despedir el año. Actuación estelar de conjuntos gaiteros de la región, mezclas retro de DJ Javier Márquez y la animación en vivo del equipo de locutores de Neblina Stereo 105.5 FM.',
    admissionPrice: 'Preventa $10 · En Puerta $15 (Mesas VIP disponibles)',
    isFree: false,
    coordinatorName: 'Producciones Neblina 105 & Hotel Los Virios',
    coordinatorPhone: '+584247459774',
    coordinatorWhatsApp: '584247459774',
    eventUrl: 'https://instagram.com/neblina105fm',
    instagram: '@neblina105fm',
    facebook: '',
    status: 'upcoming',
    featuredInHome: false,
    active: true,
    createdAt: new Date(Date.now() - 3600000 * 96).toISOString()
  },
  {
    id: 'evt_5',
    title: 'Encuentro Regional de Turismo y Operadores Andinos',
    category: 'Congresos & Corporativos',
    date: '2026-11-28',
    dateDisplay: 'Sábado 28 de Noviembre, 2026',
    time: '9:00 AM - 4:00 PM',
    location: 'Centro de Convenciones Hotel Convención Boutique, Mérida',
    googleMapsUrl: 'https://maps.google.com/?q=Merida+Venezuela',
    flyer: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
    description: 'Jornada gremial convocada por CATUREM y prestadores de servicios de Mérida, Barinas y Táchira. Mesas de trabajo sobre conectividad vial, combustible, digitalización de posadas y estrategias para la temporada alta 2027.',
    admissionPrice: 'Registro previo gratuito para miembros de CATUREM y aliados comerciales',
    isFree: true,
    coordinatorName: 'Directorio Ejecutivo CATUREM',
    coordinatorPhone: '+584247459774',
    coordinatorWhatsApp: '584247459774',
    eventUrl: 'https://caturem.com/eventos/',
    instagram: '@caturem',
    facebook: 'https://facebook.com/caturem',
    status: 'upcoming',
    featuredInHome: false,
    active: true,
    createdAt: new Date(Date.now() - 3600000 * 120).toISOString()
  }
];

// Notificar actualización a componentes de la app
function notifyEventsChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('neblina_events_updated'));
  }
}

// Obtener todos los eventos
export function getAllEvents() {
  if (typeof window === 'undefined') return DEFAULT_EVENTS;
  try {
    const raw = localStorage.getItem(STORAGE_EVENTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Error leyendo eventos de localStorage:', e);
  }
  return DEFAULT_EVENTS;
}

// Guardar array completo
export function saveAllEvents(events) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(events));
    notifyEventsChanged();
  } catch (e) {
    console.error('Error guardando eventos en localStorage:', e);
  }
}

// Obtener eventos activos ordenados por fecha
export function getActiveEvents() {
  return getAllEvents()
    .filter(evt => evt.active !== false && !evt.trashed)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

// Guardar o actualizar un evento
export function saveEvent(eventData) {
  const current = [...getAllEvents()];
  const index = current.findIndex(e => e.id === eventData.id);

  if (index >= 0) {
    current[index] = {
      ...current[index],
      ...eventData,
      updatedAt: new Date().toISOString()
    };
  } else {
    const newEvent = {
      ...eventData,
      id: eventData.id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      status: eventData.status || 'upcoming',
      active: eventData.active !== undefined ? eventData.active : true,
      featuredInHome: eventData.featuredInHome !== undefined ? eventData.featuredInHome : true,
      createdAt: new Date().toISOString()
    };
    current.unshift(newEvent);
  }

  saveAllEvents(current);
  return current;
}

// Enviar un evento a la papelera (Eliminación temporal)
export function trashEvent(id) {
  const current = getAllEvents().map(e => {
    if (String(e.id) === String(id)) {
      return { ...e, trashed: true, trashedAt: new Date().toISOString() };
    }
    return e;
  });
  saveAllEvents(current);
  return current;
}

// Restaurar un evento desde la papelera
export function restoreEvent(id) {
  const current = getAllEvents().map(e => {
    if (String(e.id) === String(id)) {
      return { ...e, trashed: false, trashedAt: null };
    }
    return e;
  });
  saveAllEvents(current);
  return current;
}

// Eliminar un evento definitivamente
export function deleteEvent(id) {
  const current = getAllEvents().filter(e => String(e.id) !== String(id));
  saveAllEvents(current);
  return current;
}

export const deleteEventPermanently = deleteEvent;

// Vaciar papelera de eventos
export function emptyEventsTrash() {
  const current = getAllEvents().filter(e => !e.trashed);
  saveAllEvents(current);
  return current;
}

// Alternar estado activo / inactivo
export function toggleEventActive(id) {
  const current = getAllEvents().map(e => {
    if (e.id === id) {
      return { ...e, active: !e.active };
    }
    return e;
  });
  saveAllEvents(current);
  return current;
}

// Restablecer eventos predeterminados
export function resetDefaultEvents() {
  saveAllEvents(DEFAULT_EVENTS);
  return DEFAULT_EVENTS;
}

// Exportar base de datos de eventos a JSON
export function exportEventsJSON() {
  const data = getAllEvents();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `neblina_eventos_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Importar base de datos de eventos desde archivo JSON
export function importEventsJSON(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    if (Array.isArray(parsed)) {
      saveAllEvents(parsed);
      return { success: true, count: parsed.length };
    }
    return { success: false, error: 'El archivo JSON no tiene un formato válido de lista.' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
