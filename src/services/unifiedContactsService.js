// Neblina Stereo 105.5 FM - Base de Datos Unificada de Oyentes y Contactos Ciudadanos
// Centraliza de forma unificada a todos los ciudadanos y oyentes que ingresan sus datos
// en cualquier parte de la plataforma: Comentarios de Noticias, Denuncias Ciudadanas,
// Mensajes a Cabina por WhatsApp y Formulario de Contacto Web.

const STORAGE_KEY = 'neblina_unified_contacts_db';

export const INITIAL_DEMO_CONTACTS = [];

function notifyUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('neblina_contacts_updated'));
  }
}

// Obtener todos los contactos (incluyendo papelera)
export function getAllUnifiedContacts() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Error leyendo base unificada de contactos:', e);
  }
  return [];
}

// Obtener solo contactos activos (no enviados a la papelera)
export function getActiveUnifiedContacts() {
  return getAllUnifiedContacts().filter(c => !c.trashed);
}

// Obtener solo contactos en la papelera
export function getTrashedUnifiedContacts() {
  return getAllUnifiedContacts().filter(c => c.trashed);
}

// Guardar lista completa
export function saveAllUnifiedContacts(list) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    notifyUpdated();
  } catch (e) {
    console.error('Error guardando base unificada de contactos:', e);
  }
}

// Agregar o actualizar un contacto de forma unificada desde cualquier punto de la web
export function addUnifiedContact({
  name = '',
  phone = '',
  cedula = '',
  location = '',
  origin = 'Mensaje Web',
  details = '',
  notes = ''
}) {
  const cleanName = (name || '').trim();
  const cleanPhone = (phone || '').trim();
  const cleanCedula = (cedula || '').trim();
  const cleanLocation = (location || '').trim();
  const cleanDetails = (details || '').trim();

  // Si no hay datos mínimos para identificar a la persona, omitir
  if (!cleanName && !cleanPhone && !cleanLocation) return null;

  const all = [...getAllUnifiedContacts()];
  const digitsPhone = cleanPhone.replace(/\D/g, '');
  const digitsCedula = cleanCedula.replace(/\D/g, '');

  // Buscar coincidencia previa por teléfono (mín 7 dígitos) o cédula (mín 5 dígitos) o nombre exacto
  const existingIdx = all.findIndex(c => {
    if (digitsPhone.length >= 7) {
      const existingDigits = (c.phone || '').replace(/\D/g, '');
      if (existingDigits && existingDigits === digitsPhone) return true;
    }
    if (digitsCedula.length >= 5) {
      const existingCedulaDigits = (c.cedula || '').replace(/\D/g, '');
      if (existingCedulaDigits && existingCedulaDigits === digitsCedula) return true;
    }
    if (cleanName.length >= 4) {
      if ((c.name || '').trim().toLowerCase() === cleanName.toLowerCase()) return true;
    }
    return false;
  });

  const now = new Date().toISOString();
  const historyEntry = {
    date: now,
    origin,
    details: cleanDetails || 'Interacción registrada en la plataforma web'
  };

  if (existingIdx !== -1) {
    // Actualizar registro existente y enriquecer datos
    const current = all[existingIdx];
    const updatedHistory = Array.isArray(current.history) ? [...current.history, historyEntry] : [historyEntry];

    all[existingIdx] = {
      ...current,
      name: cleanName || current.name,
      phone: cleanPhone || current.phone,
      cedula: cleanCedula || current.cedula,
      location: cleanLocation || current.location,
      origin: origin || current.origin,
      details: cleanDetails || current.details,
      interactionCount: (current.interactionCount || 1) + 1,
      lastContactDate: now,
      trashed: false, // Si interactúa de nuevo, se reactiva automáticamente
      trashedAt: null,
      history: updatedHistory
    };

    saveAllUnifiedContacts(all);
    return all[existingIdx];
  } else {
    // Crear nuevo registro
    const newContact = {
      id: `cont_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: cleanName || 'Oyente Anónimo',
      phone: cleanPhone || 'No indicado',
      cedula: cleanCedula || 'No especificada',
      location: cleanLocation || 'Santo Domingo / Mérida',
      origin: origin || 'Interacción Web',
      details: cleanDetails || 'Primer contacto registrado desde la web app',
      interactionCount: 1,
      firstContactDate: now,
      lastContactDate: now,
      notes: notes || '',
      trashed: false,
      trashedAt: null,
      history: [historyEntry]
    };

    all.unshift(newContact);
    saveAllUnifiedContacts(all);
    return newContact;
  }
}

// Enviar un contacto a la papelera (eliminación temporal)
export function trashContact(id) {
  const all = getAllUnifiedContacts().map(c => {
    if (c.id === id) {
      return { ...c, trashed: true, trashedAt: new Date().toISOString() };
    }
    return c;
  });
  saveAllUnifiedContacts(all);
  return all;
}

// Restaurar un contacto desde la papelera
export function restoreContact(id) {
  const all = getAllUnifiedContacts().map(c => {
    if (c.id === id) {
      return { ...c, trashed: false, trashedAt: null };
    }
    return c;
  });
  saveAllUnifiedContacts(all);
  return all;
}

// Eliminar definitivamente un contacto de la papelera
export function deleteContactPermanently(id) {
  const all = getAllUnifiedContacts().filter(c => c.id !== id);
  saveAllUnifiedContacts(all);
  return all;
}

// Vaciar toda la papelera de contactos
export function emptyContactsTrash() {
  const all = getAllUnifiedContacts().filter(c => !c.trashed);
  saveAllUnifiedContacts(all);
  return all;
}

// Actualizar notas internas de un contacto
export function updateContactNotes(id, notes) {
  const all = getAllUnifiedContacts().map(c => {
    if (c.id === id) {
      return { ...c, notes, updatedAt: new Date().toISOString() };
    }
    return c;
  });
  saveAllUnifiedContacts(all);
  return all;
}

// Exportar Base de Datos a JSON
export function exportContactsJSON() {
  const list = getAllUnifiedContacts();
  const data = {
    station: 'Neblina Stereo 105.5 FM',
    database: 'Base de Datos General de Usuarios y Contactos',
    origin: 'Plataforma Digital Oficial (Santo Domingo - Mérida)',
    confidentiality: 'Estrictamente Confidencial - Uso Interno Exclusivo de la Dirección',
    exportedAt: new Date().toISOString(),
    totalActiveContacts: list.filter(c => !c.trashed).length,
    totalTrashedContacts: list.filter(c => c.trashed).length,
    contacts: list
  };
  return JSON.stringify(data, null, 2);
}

// Exportar Base de Datos a CSV (Compatible directo con Microsoft Excel con BOM UTF-8)
export function exportContactsCSV() {
  const list = getAllUnifiedContacts();
  const headers = [
    'ID',
    'Nombre y Apellido',
    'Cédula de Identidad',
    'Teléfono / WhatsApp',
    'Ubicación / Sector / Municipio',
    'Canal de Entrada',
    'Último Detalle / Mensaje',
    'Total Interacciones',
    'Primer Contacto',
    'Último Contacto',
    'Estado',
    'Notas Internas'
  ];

  const rows = list.map(c => [
    `"${c.id}"`,
    `"${(c.name || '').replace(/"/g, '""')}"`,
    `"${(c.cedula || '').replace(/"/g, '""')}"`,
    `"${(c.phone || '').replace(/"/g, '""')}"`,
    `"${(c.location || '').replace(/"/g, '""')}"`,
    `"${(c.origin || '').replace(/"/g, '""')}"`,
    `"${(c.details || '').replace(/"/g, '""')}"`,
    c.interactionCount || 1,
    `"${new Date(c.firstContactDate).toLocaleDateString('es-VE')}"`,
    `"${new Date(c.lastContactDate).toLocaleDateString('es-VE')}"`,
    c.trashed ? '"En Papelera"' : '"Activo"',
    `"${(c.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  return csvContent;
}
