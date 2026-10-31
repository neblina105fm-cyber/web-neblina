// Neblina Stereo 105.5 FM - Base de Datos Paralela de Contactos y Oyentes Ciudadanos
// Registra y consolida la identidad, número telefónico y lugar de residencia de los ciudadanos
// que reportan sintonía o denuncias, para uso estrictamente interno, estadísticas y proyecciones.

const STORAGE_CITIZENS_KEY = 'neblina_citizens_directory_db';

export const INITIAL_DEMO_CITIZENS = [];

// Disparar evento para reactividad en la interfaz
function notifyCitizensChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('neblina_citizens_updated'));
  }
}

// Obtener todos los registros del directorio ciudadano
export function getAllCitizens() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_CITIZENS_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Error leyendo directorio ciudadano:', e);
  }
  return [];
}

// Guardar lista completa
export function saveAllCitizens(list) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_CITIZENS_KEY, JSON.stringify(list));
    notifyCitizensChanged();
  } catch (e) {
    console.error('Error guardando directorio ciudadano:', e);
  }
}

// Crear o actualizar un contacto ciudadano automáticamente al recibir una denuncia
export function upsertCitizenContact(data = {}) {
  const name = data.citizenName?.trim();
  const phone = data.phone?.trim();
  const sector = data.residenceSector?.trim();
  const citizenId = data.citizenId?.trim();

  // Si no hay datos mínimos para identificar a la persona, omitir
  if (!name && !phone && !sector) return null;

  const all = [...getAllCitizens()];
  const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
  const cleanId = citizenId ? citizenId.replace(/\s+/g, '').toLowerCase() : '';

  // Buscar coincidencia previa por teléfono, cédula o nombre exacto
  const existingIdx = all.findIndex(c => {
    if (cleanPhone && cleanPhone.length > 6) {
      const existingClean = (c.phone || '').replace(/\D/g, '');
      if (existingClean === cleanPhone) return true;
    }
    if (cleanId && cleanId.length > 4) {
      const existingId = (c.citizenId || '').replace(/\s+/g, '').toLowerCase();
      if (existingId === cleanId) return true;
    }
    if (name && name.length > 3) {
      return (c.name || '').trim().toLowerCase() === name.toLowerCase();
    }
    return false;
  });

  const now = new Date().toISOString();

  if (existingIdx !== -1) {
    // Actualizar registro existente
    const current = all[existingIdx];
    all[existingIdx] = {
      ...current,
      name: name || current.name,
      phone: phone || current.phone,
      residenceSector: sector || current.residenceSector,
      citizenId: citizenId || current.citizenId,
      reportCount: (current.reportCount || 1) + 1,
      lastReportDate: now
    };
    saveAllCitizens(all);
    return all[existingIdx];
  } else {
    // Crear nuevo registro en la base de datos paralela
    const newCitizen = {
      id: `cit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name || 'Ciudadano Sin Nombre',
      citizenId: citizenId || 'No especificada',
      phone: phone || 'No indicado',
      residenceSector: sector || 'Santo Domingo / Mérida',
      reportCount: 1,
      firstReportDate: now,
      lastReportDate: now,
      notes: ''
    };
    all.unshift(newCitizen);
    saveAllCitizens(all);
    return newCitizen;
  }
}

// Eliminar un ciudadano del directorio
export function deleteCitizen(id) {
  const all = getAllCitizens().filter(c => c.id !== id);
  saveAllCitizens(all);
  return all;
}

// Actualizar notas internas de un ciudadano
export function updateCitizenNotes(id, notes) {
  const all = getAllCitizens().map(c => {
    if (c.id === id) {
      return { ...c, notes, updatedAt: new Date().toISOString() };
    }
    return c;
  });
  saveAllCitizens(all);
  return all;
}

// Exportar Base de Datos a JSON
export function exportCitizensJSON() {
  const list = getAllCitizens();
  const data = {
    station: 'Neblina Stereo 105.5 FM',
    database: 'Directorio Paralelo de Oyentes y Ciudadanos',
    confidentiality: 'Estrictamente Confidencial - Uso Interno Exclusivo',
    exportedAt: new Date().toISOString(),
    totalContacts: list.length,
    contacts: list
  };
  return JSON.stringify(data, null, 2);
}

// Exportar Base de Datos a CSV (Compatible con Microsoft Excel con BOM UTF-8)
export function exportCitizensCSV() {
  const list = getAllCitizens();
  const headers = ['ID', 'Nombre y Apellido', 'Cédula de Identidad', 'Teléfono / WhatsApp', 'Sector / Lugar de Residencia', 'Total Denuncias', 'Primer Contacto', 'Último Contacto', 'Notas Internas'];
  
  const rows = list.map(c => [
    `"${c.id}"`,
    `"${(c.name || '').replace(/"/g, '""')}"`,
    `"${(c.citizenId || '').replace(/"/g, '""')}"`,
    `"${(c.phone || '').replace(/"/g, '""')}"`,
    `"${(c.residenceSector || '').replace(/"/g, '""')}"`,
    c.reportCount || 1,
    `"${new Date(c.firstReportDate).toLocaleDateString('es-VE')}"`,
    `"${new Date(c.lastReportDate).toLocaleDateString('es-VE')}"`,
    `"${(c.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  return csvContent;
}
