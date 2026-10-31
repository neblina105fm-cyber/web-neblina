function cleanShowImage(url) {
  if (!url) return '';
  return url.replace('https://player.mipanel.stream/player/uploads', 'https://mipanel.stream/player/uploads');
}

// Neblina Stereo 105.5 FM - Parrilla y Programación Radial
// Permite al equipo administrativo editar programas, locutores y horarios en vivo.

import { STATION_SCHEDULE } from './api';

const STORAGE_SCHEDULE_KEY = 'neblina_station_schedule_db';

// Notificar cambios en la parrilla radial
function notifyScheduleChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('neblina_schedule_updated'));
  }
}

// Obtener toda la programación
export function getAllSchedule() {
  if (typeof window === 'undefined') return STATION_SCHEDULE;
  try {
    const raw = localStorage.getItem(STORAGE_SCHEDULE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) { return parsed.map(s => ({ ...s, image: cleanShowImage(s.image) })); }
    }
  } catch (e) {
    console.warn('Error leyendo programación de localStorage:', e);
  }
  return STATION_SCHEDULE;
}

// Guardar lista completa
export function saveAllSchedule(scheduleList) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_SCHEDULE_KEY, JSON.stringify(scheduleList));
    notifyScheduleChanged();
  } catch (e) {
    console.error('Error guardando programación:', e);
  }
}

// Guardar o actualizar un programa
export function saveScheduleShow(showData) {
  const all = [...getAllSchedule()];
  const index = all.findIndex(s => s.id === showData.id);

  if (index >= 0) {
    all[index] = { ...all[index], ...showData };
  } else {
    const newShow = {
      ...showData,
      id: showData.id || `show_${Date.now()}`,
      active: showData.active !== undefined ? showData.active : true
    };
    all.push(newShow);
  }

  saveAllSchedule(all);
  return all;
}

// Enviar un programa a la papelera (Eliminación temporal)
export function trashScheduleShow(id) {
  const all = getAllSchedule().map(s => {
    if (String(s.id) === String(id)) {
      return { ...s, trashed: true, trashedAt: new Date().toISOString() };
    }
    return s;
  });
  saveAllSchedule(all);
  return all;
}

// Restaurar un programa desde la papelera
export function restoreScheduleShow(id) {
  const all = getAllSchedule().map(s => {
    if (String(s.id) === String(id)) {
      return { ...s, trashed: false, trashedAt: null };
    }
    return s;
  });
  saveAllSchedule(all);
  return all;
}

// Eliminar un programa definitivamente
export function deleteScheduleShow(id) {
  const all = getAllSchedule().filter(s => String(s.id) !== String(id));
  saveAllSchedule(all);
  return all;
}

export const deleteScheduleShowPermanently = deleteScheduleShow;

// Vaciar papelera de programas
export function emptyScheduleTrash() {
  const all = getAllSchedule().filter(s => !s.trashed);
  saveAllSchedule(all);
  return all;
}

// Alternar activo / inactivo
export function toggleScheduleShowActive(id) {
  const all = getAllSchedule().map(s => {
    if (s.id === id) {
      return { ...s, active: s.active === false ? true : false };
    }
    return s;
  });
  saveAllSchedule(all);
  return all;
}

// Restablecer valores de fábrica
export function resetDefaultSchedule() {
  saveAllSchedule(STATION_SCHEDULE);
  return STATION_SCHEDULE;
}

// Exportar programación a JSON
export function exportScheduleJSON() {
  const schedule = getAllSchedule();
  const data = {
    station: 'Neblina Stereo 105.5 FM',
    module: 'Parrilla y Programación Radial',
    exportedAt: new Date().toISOString(),
    total: schedule.length,
    schedule
  };
  return JSON.stringify(data, null, 2);
}
