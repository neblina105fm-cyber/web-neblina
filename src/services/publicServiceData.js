// Neblina Stereo 105.5 FM - Servicio de Datos de "Servicio Público"
// Gestión de Ayudas Médicas/Sociales, Objetos Perdidos y Objetos Encontrados.
// Almacenamiento local reactivo bajo la clave 'neblina_public_service_db'.

const STORAGE_PUBLIC_SERVICE_KEY = 'neblina_public_service_db';

export const INITIAL_PUBLIC_SERVICE_ITEMS = [
  {
    id: 'ps_ayuda_01',
    category: 'ayudas', // 'ayudas' | 'objetos_perdidos' | 'objetos_encontrados'
    title: 'Apoyo Médico y Tratamiento para Doña Carmen Quintero',
    subtitle: 'Requerimiento de antibióticos y estudios especializados en el HULA',
    description: 'Se solicita la colaboración de la comunidad y personas de buen corazón para cubrir los gastos del tratamiento posoperatorio y medicamentos de Doña Carmen Quintero (72 años), habitante del sector Las Piedras. Cualquier aporte suma enormemente para su pronta recuperación.',
    beneficiaryName: 'Carmen Elena Quintero',
    responsibleNames: 'María Quintero (Hija) / Pedro Rondón',
    contactPhone: '584147589921',
    contactWhatsapp: '584147589921',
    bankInfo: 'Banco de Venezuela\nPago Móvil: 0102 - 04147589921 - C.I. 12.456.789\nCuenta Corriente: 0102-0455-12-0000123456',
    location: 'Las Piedras, Municipio Cardenal Quintero, Estado Mérida',
    targetAmountUsd: 250,
    currentCollectedUsd: 95,
    status: 'active', // 'active' | 'completed' | 'paused'
    createdAt: '2026-10-28T14:30:00Z',
    photos: [
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80'
    ],
    medicalRecipes: [
      'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'ps_perdido_01',
    category: 'objetos_perdidos',
    title: 'Billetera de Cuero Marrón con Documentos de Identidad',
    subtitle: 'Extraviada en la parada de transporte de Santo Domingo',
    description: 'Se extravió billetera de cuero color marrón oscuro con documentos personales a nombre de José Leonardo Méndez (Cédula de identidad, licencia de conducir y tarjetas bancarias). Importa recuperar principalmente la documentación personal. Se ofrece gratificación.',
    beneficiaryName: 'José Leonardo Méndez',
    responsibleNames: 'José L. Méndez',
    contactPhone: '584247459774',
    contactWhatsapp: '584247459774',
    location: 'Parada de autobuses de Santo Domingo hacia Mérida',
    status: 'active',
    createdAt: '2026-10-29T10:15:00Z',
    photos: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80'
    ],
    medicalRecipes: []
  },
  {
    id: 'ps_encontrado_01',
    category: 'objetos_encontrados',
    title: 'Llaves de Vehículo con Llavero de Neblina Stereo',
    subtitle: 'Encontradas en la Plaza Bolívar de Santo Domingo',
    description: 'Fueron encontradas y entregadas en custodia en los estudios de Neblina Stereo un juego de dos llaves (una con control remoto tipo alarma) con llavero acrílico. Quien acredite ser el legítimo propietario puede pasar a reclamarlas directamente por la cabina de la radio.',
    beneficiaryName: 'En custodia en Cabina Neblina 105.5 FM',
    responsibleNames: 'Dirección de Neblina Stereo 105.5 FM',
    contactPhone: '584247459774',
    contactWhatsapp: '584247459774',
    location: 'Custodiadas en Estudios Neblina 105.5 FM, Santo Domingo, Mérida',
    status: 'active',
    createdAt: '2026-10-30T09:00:00Z',
    photos: [
      'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800&auto=format&fit=crop&q=80'
    ],
    medicalRecipes: []
  }
];

// Notificador reactivo para sincronizar componentes sin recargar página
function notifyPublicServiceChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('neblina_public_service_updated'));
  }
}

// Obtener todos los casos registrados
export function getAllPublicServices() {
  if (typeof window === 'undefined') return INITIAL_PUBLIC_SERVICE_ITEMS;
  try {
    const raw = localStorage.getItem(STORAGE_PUBLIC_SERVICE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    // Si no existe, inicializar con casos semilla
    localStorage.setItem(STORAGE_PUBLIC_SERVICE_KEY, JSON.stringify(INITIAL_PUBLIC_SERVICE_ITEMS));
    return INITIAL_PUBLIC_SERVICE_ITEMS;
  } catch (err) {
    console.error('Error al leer casos de Servicio Público:', err);
    return INITIAL_PUBLIC_SERVICE_ITEMS;
  }
}

// Guardar array completo
export function saveAllPublicServices(items) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_PUBLIC_SERVICE_KEY, JSON.stringify(items));
    notifyPublicServiceChanged();
  } catch (err) {
    console.error('Error al guardar casos de Servicio Público:', err);
  }
}

// Obtener casos activos para la vista pública (filtrables por categoría)
export function getActivePublicServices(category = 'all') {
  const all = getAllPublicServices();
  return all.filter(item => {
    if (item.status === 'trashed') return false;
    if (category !== 'all' && item.category !== category) return false;
    return true;
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// Crear o editar un caso
export function savePublicServiceItem(itemData) {
  const current = getAllPublicServices();
  let updated;

  if (itemData.id) {
    // Editar
    updated = current.map(c => {
      if (c.id === itemData.id) {
        return {
          ...c,
          ...itemData,
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    });
  } else {
    // Nuevo
    const newItem = {
      ...itemData,
      id: `ps_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      status: itemData.status || 'active',
      createdAt: new Date().toISOString(),
      photos: itemData.photos || [],
      medicalRecipes: itemData.medicalRecipes || []
    };
    updated = [newItem, ...current];
  }

  saveAllPublicServices(updated);
  return updated;
}

// Eliminar caso definitivamente o mover a papelera
export function deletePublicServiceItem(itemId) {
  const current = getAllPublicServices();
  const updated = current.filter(c => c.id !== itemId);
  saveAllPublicServices(updated);
  return updated;
}

// Cambiar estado (active, completed, paused)
export function setPublicServiceStatus(itemId, newStatus) {
  const current = getAllPublicServices();
  const updated = current.map(c => {
    if (c.id === itemId) {
      return { ...c, status: newStatus, updatedAt: new Date().toISOString() };
    }
    return c;
  });
  saveAllPublicServices(updated);
  return updated;
}
