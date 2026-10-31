// Neblina Stereo 105.5 FM - Buzón y Gestión de Denuncias Ciudadanas
// Almacena y gestiona los reportes recibidos desde la Web App para la sala de prensa y locutores.
import { upsertCitizenContact } from './citizensDirectoryService';
import { addUnifiedContact } from './unifiedContactsService';

const STORAGE_REPORTS_KEY = 'neblina_citizen_reports_db';

export const REPORT_STATUSES = [
  'Pendiente',
  'En Revisión',
  'Atendido',
  'Archivado'
];

export const INITIAL_DEMO_REPORTS = [];

// Notificar cambios en reportes
function notifyReportsChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('neblina_reports_updated'));
  }
}

// Obtener todos los reportes
export function getAllReports() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_REPORTS_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Error leyendo reportes de localStorage:', e);
  }
  return [];
}

// Guardar lista completa
export function saveAllReports(reportsList) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_REPORTS_KEY, JSON.stringify(reportsList));
    notifyReportsChanged();
  } catch (e) {
    console.error('Error guardando reportes:', e);
  }
}

function sanitizeReportString(str = '') {
  return String(str || '')
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

// Agregar nuevo reporte recibido
export function addCitizenReport(reportData) {
  const all = [...getAllReports()];
  const sanitizedReport = {
    ...reportData,
    citizenName: sanitizeReportString(reportData.citizenName),
    citizenId: sanitizeReportString(reportData.citizenId),
    residenceSector: sanitizeReportString(reportData.residenceSector),
    eventLocation: sanitizeReportString(reportData.eventLocation),
    referencePoint: sanitizeReportString(reportData.referencePoint),
    description: sanitizeReportString(reportData.description),
    phone: sanitizeReportString(reportData.phone)
  };

  const newReport = {
    ...sanitizedReport,
    id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    status: sanitizedReport.status || 'Pendiente',
    trashed: false,
    createdAt: new Date().toISOString()
  };
  all.unshift(newReport);
  saveAllReports(all);

  // Registrar automáticamente en la base de datos paralela de ciudadanos y en la base unificada
  try {
    upsertCitizenContact(sanitizedReport);
    addUnifiedContact({
      name: sanitizedReport.citizenName,
      phone: sanitizedReport.phone,
      cedula: sanitizedReport.citizenId,
      location: sanitizedReport.residenceSector || sanitizedReport.eventLocation,
      origin: 'Denuncia Ciudadana',
      details: sanitizedReport.description
    });
  } catch (err) {
    console.warn('Error sincronizando con base de datos de ciudadanos:', err);
  }

  return newReport;
}

// Cambiar estado de un reporte
export function updateReportStatus(id, newStatus) {
  const all = getAllReports().map(r => {
    if (r.id === id) {
      return { ...r, status: newStatus, updatedAt: new Date().toISOString() };
    }
    return r;
  });
  saveAllReports(all);
  return all;
}

// Enviar un reporte a la papelera (Eliminación temporal)
export function trashReport(id) {
  const all = getAllReports().map(r => {
    if (r.id === id) {
      return { ...r, trashed: true, trashedAt: new Date().toISOString() };
    }
    return r;
  });
  saveAllReports(all);
  return all;
}

// Restaurar un reporte desde la papelera
export function restoreReport(id) {
  const all = getAllReports().map(r => {
    if (r.id === id) {
      return { ...r, trashed: false, trashedAt: null };
    }
    return r;
  });
  saveAllReports(all);
  return all;
}

// Eliminar definitivamente un reporte
export function deleteCitizenReport(id) {
  const all = getAllReports().filter(r => r.id !== id);
  saveAllReports(all);
  return all;
}

export const deleteReportPermanently = deleteCitizenReport;

// Vaciar papelera de reportes
export function emptyReportsTrash() {
  const all = getAllReports().filter(r => !r.trashed);
  saveAllReports(all);
  return all;
}

// Exportar reportes a JSON
export function exportReportsJSON() {
  const reports = getAllReports();
  const data = {
    station: 'Neblina Stereo 105.5 FM',
    module: 'Buzón de Denuncias Ciudadanas',
    exportedAt: new Date().toISOString(),
    total: reports.length,
    reports
  };
  return JSON.stringify(data, null, 2);
}

// Exportar reportes a CSV (Compatible con Microsoft Excel con BOM UTF-8)
export function exportReportsCSV() {
  const reports = getAllReports();
  const headers = ['ID', 'Fecha Reporte', 'Ciudadano', 'Cédula', 'Teléfono', 'Sector Residencia', 'Lugar del Suceso', 'Punto Referencia', 'Fecha Suceso', 'Hora Suceso', 'Estado', 'Descripción'];
  
  const rows = reports.map(r => [
    `"${r.id}"`,
    `"${new Date(r.createdAt || Date.now()).toLocaleDateString('es-VE')}"`,
    `"${(r.citizenName || '').replace(/"/g, '""')}"`,
    `"${(r.citizenId || '').replace(/"/g, '""')}"`,
    `"${(r.phone || '').replace(/"/g, '""')}"`,
    `"${(r.residenceSector || '').replace(/"/g, '""')}"`,
    `"${(r.eventLocation || '').replace(/"/g, '""')}"`,
    `"${(r.referencePoint || '').replace(/"/g, '""')}"`,
    `"${(r.eventDate || '').replace(/"/g, '""')}"`,
    `"${(r.eventTime || '').replace(/"/g, '""')}"`,
    `"${(r.status || 'Pendiente')}"`,
    `"${(r.description || '').replace(/"/g, '""')}"`
  ]);

  return '\uFEFF' + [headers.join(','), ...rows.map(row => row.join(','))].join('\r\n');
}
