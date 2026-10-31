// Neblina Stereo 105.5 FM - Servicio de Gestión de "Nuestros Talentos" (Locutores & Staff)
// Permite consultar, registrar, editar, cambiar estado y eliminar locutores desde la web y el sistema interno.

const STORAGE_TALENTS_KEY = 'neblina_talents_db';

export const DEFAULT_TALENTS = [];

// Obtener todos los talentos
export function getAllTalents() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_TALENTS_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Error al leer talentos de localStorage:', err);
  }
  return [];
}


// Guardar array completo
export function saveAllTalents(talents) {
  try {
    localStorage.setItem(STORAGE_TALENTS_KEY, JSON.stringify(talents));
    window.dispatchEvent(new CustomEvent('neblina_talents_updated', { detail: talents }));
  } catch (err) {
    console.error('Error al guardar talentos en localStorage:', err);
  }
}

// Obtener solo talentos activos (para vista pública)
export function getActiveTalents() {
  return getAllTalents()
    .filter(t => t.status === 'active' && !t.trashed)
    .sort((a, b) => (a.order || 99) - (b.order || 99));
}

// Guardar o actualizar un talento individual
export function saveTalent(talentData) {
  const current = getAllTalents();
  let updated;

  if (talentData.id) {
    // Editar
    updated = current.map(item => {
      if (item.id === talentData.id) {
        return {
          ...item,
          ...talentData,
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    });
  } else {
    // Crear nuevo
    const newTalent = {
      ...talentData,
      id: `talent_${Date.now()}`,
      status: talentData.status || 'active',
      order: talentData.order ? Number(talentData.order) : current.length + 1,
      createdAt: new Date().toISOString()
    };
    updated = [newTalent, ...current];
  }

  saveAllTalents(updated);
  return updated;
}

// Enviar un talento a la papelera (Eliminación temporal)
export function trashTalent(id) {
  const current = getAllTalents().map(t => {
    if (String(t.id) === String(id)) {
      return { ...t, trashed: true, trashedAt: new Date().toISOString() };
    }
    return t;
  });
  saveAllTalents(current);
  return current;
}

// Restaurar un talento desde la papelera
export function restoreTalent(id) {
  const current = getAllTalents().map(t => {
    if (String(t.id) === String(id)) {
      return { ...t, trashed: false, trashedAt: null };
    }
    return t;
  });
  saveAllTalents(current);
  return current;
}

// Eliminar talento definitivamente
export function deleteTalent(id) {
  const current = getAllTalents();
  const filtered = current.filter(item => String(item.id) !== String(id));
  saveAllTalents(filtered);
  return filtered;
}

export const deleteTalentPermanently = deleteTalent;

// Vaciar papelera de talentos
export function emptyTalentsTrash() {
  const filtered = getAllTalents().filter(t => !t.trashed);
  saveAllTalents(filtered);
  return filtered;
}

// Alternar estado activo / inactivo
export function toggleTalentActive(id) {
  const current = getAllTalents();
  const updated = current.map(item => {
    if (item.id === id) {
      return {
        ...item,
        status: item.status === 'active' ? 'inactive' : 'active'
      };
    }
    return item;
  });
  saveAllTalents(updated);
  return updated;
}

// Restablecer valores predeterminados
export function resetDefaultTalents() {
  saveAllTalents([]);
  return [];
}

// Exportar base de datos a archivo JSON
export function exportTalentsJSON() {
  const data = getAllTalents();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `neblina_talentos_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Importar base de datos desde archivo JSON
export function importTalentsJSON(jsonContent) {
  try {
    const parsed = JSON.parse(jsonContent);
    if (Array.isArray(parsed)) {
      saveAllTalents(parsed);
      return { success: true, count: parsed.length };
    }
    return { success: false, error: 'El archivo JSON no tiene un formato válido de lista.' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Archivar un talento (Locutores Archivados)
export function archiveTalent(id) {
  const current = getAllTalents().map(t => {
    if (String(t.id) === String(id)) {
      return { ...t, archived: true, archivedAt: new Date().toISOString() };
    }
    return t;
  });
  saveAllTalents(current);
  return current;
}

// Desarchivar un talento
export function unarchiveTalent(id) {
  const current = getAllTalents().map(t => {
    if (String(t.id) === String(id)) {
      return { ...t, archived: false, archivedAt: null };
    }
    return t;
  });
  saveAllTalents(current);
  return current;
}
