// Neblina Stereo 105.5 FM - Servicio de Comentarios y Verificación Ciudadana en Notas de Prensa
// Maneja el registro privado (Cédula, Teléfono/WhatsApp, Procedencia) y la moderación interna
// antes de la publicación visible al público (Nombre y Comentario).

import { addUnifiedContact } from './unifiedContactsService';

const STORAGE_COMMENTS_KEY = 'neblina_news_comments_db';

// Notificar a toda la aplicación cuando haya cambios en los comentarios
function notifyCommentsChanged(newsId = null) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('neblina_comments_updated', { 
      detail: { newsId, timestamp: Date.now() } 
    }));
  }
}

// Datos semilla iniciales realistas para demostración y verificación
const INITIAL_COMMENTS = [];

// Obtener todos los comentarios (Uso interno administrativo)
export function getAllNewsComments() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_COMMENTS_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Error leyendo comentarios de localStorage:', e);
  }
  return [];
}

// Guardar lista completa
export function saveAllNewsComments(comments) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_COMMENTS_KEY, JSON.stringify(comments));
    notifyCommentsChanged();
  } catch (e) {
    console.error('Error guardando comentarios:', e);
  }
}

// Obtener comentarios aprobados para una nota de prensa específica (Vista pública)
// IMPORTANTE: Retorna únicamente nombre, fecha y comentario. Omite cédula, teléfono y ubicación privada.
export function getPublicApprovedComments(newsId) {
  const all = getAllNewsComments();
  const targetId = String(newsId || '');
  
  return all
    .filter(c => (String(c.newsId) === targetId || !newsId) && c.status === 'approved' && !c.trashed)
    .map(c => ({
      id: c.id,
      newsId: c.newsId,
      authorName: c.authorName || 'Ciudadano',
      comment: c.comment,
      formattedDate: c.formattedDate || new Date(c.createdAt).toLocaleDateString('es-VE', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }));
}

// Función de saneamiento contra XSS para comentarios y aportes de usuarios
function sanitizeString(str = '') {
  return String(str || '')
    .replace(/[<>]/g, '') // Elimina etiquetas HTML potencialmente peligrosas
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

// Registrar un nuevo comentario desde el formulario público de la noticia
export function submitNewsComment({
  newsId,
  newsTitle,
  newsUrl = '',
  authorName,
  authorCedula,
  authorPhone,
  authorLocation,
  comment
}) {
  const all = getAllNewsComments();
  const now = new Date();

  const formattedDate = now.toLocaleDateString('es-VE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const newComment = {
    id: `comm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    newsId: newsId || 'general',
    newsTitle: sanitizeString(newsTitle || 'Nota de Prensa Neblina 105.5 FM'),
    newsUrl: newsUrl || (typeof window !== 'undefined' ? window.location.href : ''),
    authorName: sanitizeString(authorName || ''),
    authorCedula: sanitizeString(authorCedula || ''),
    authorPhone: sanitizeString(authorPhone || ''),
    authorLocation: sanitizeString(authorLocation || ''),
    comment: sanitizeString(comment || ''),
    status: 'pending', // Por defecto pasa a moderación previa
    trashed: false,
    createdAt: now.toISOString(),
    formattedDate
  };

  // Registrar automáticamente en la Base de Datos Unificada de Oyentes y Contactos
  try {
    addUnifiedContact({
      name: newComment.authorName,
      phone: newComment.authorPhone,
      cedula: newComment.authorCedula,
      location: newComment.authorLocation,
      origin: 'Comentario de Noticia',
      details: `Noticia: ${newComment.newsTitle} — ${newComment.comment}`
    });
  } catch (err) {
    console.warn('Error enlazando con base unificada de contactos:', err);
  }

  const updated = [newComment, ...all];
  saveAllNewsComments(updated);
  notifyCommentsChanged(newsId);

  return { success: true, comment: newComment };
}

// Actualizar estado de moderación ('approved' | 'rejected' | 'pending')
export function updateNewsCommentStatus(commentId, newStatus) {
  const all = getAllNewsComments();
  let affectedNewsId = null;

  const updated = all.map(c => {
    if (c.id === commentId) {
      affectedNewsId = c.newsId;
      return { 
        ...c, 
        status: newStatus, 
        moderatedAt: new Date().toISOString() 
      };
    }
    return c;
  });

  saveAllNewsComments(updated);
  notifyCommentsChanged(affectedNewsId);
  return updated;
}

// Enviar un comentario a la papelera (Eliminación temporal)
export function trashNewsComment(commentId) {
  const all = getAllNewsComments();
  let affectedNewsId = null;

  const updated = all.map(c => {
    if (c.id === commentId) {
      affectedNewsId = c.newsId;
      return { ...c, trashed: true, trashedAt: new Date().toISOString() };
    }
    return c;
  });

  saveAllNewsComments(updated);
  notifyCommentsChanged(affectedNewsId);
  return updated;
}

// Restaurar un comentario desde la papelera
export function restoreNewsComment(commentId) {
  const all = getAllNewsComments();
  let affectedNewsId = null;

  const updated = all.map(c => {
    if (c.id === commentId) {
      affectedNewsId = c.newsId;
      return { ...c, trashed: false, trashedAt: null };
    }
    return c;
  });

  saveAllNewsComments(updated);
  notifyCommentsChanged(affectedNewsId);
  return updated;
}

// Eliminar un comentario definitivamente
export function deleteNewsComment(commentId) {
  const all = getAllNewsComments();
  let affectedNewsId = null;

  const updated = all.filter(c => {
    if (c.id === commentId) {
      affectedNewsId = c.newsId;
      return false;
    }
    return true;
  });

  saveAllNewsComments(updated);
  notifyCommentsChanged(affectedNewsId);
  return updated;
}

export const deleteNewsCommentPermanently = deleteNewsComment;

// Vaciar papelera de comentarios
export function emptyNewsCommentsTrash() {
  const all = getAllNewsComments().filter(c => !c.trashed);
  saveAllNewsComments(all);
  notifyCommentsChanged();
  return all;
}

// Obtener conteo de comentarios pendientes de aprobación
export function getPendingCommentsCount() {
  const all = getAllNewsComments();
  return all.filter(c => c.status === 'pending').length;
}

// Restablecer comentarios iniciales
export function resetDefaultNewsComments() {
  saveAllNewsComments([]);
  return [];
}

// Exportar base de datos de comentarios a JSON
export function exportNewsCommentsJSON() {
  const comments = getAllNewsComments();
  const data = {
    station: 'Neblina Stereo 105.5 FM',
    module: 'Registro de Comentarios y Verificación Ciudadana',
    exportedAt: new Date().toISOString(),
    totalComments: comments.length,
    pending: comments.filter(c => c.status === 'pending').length,
    approved: comments.filter(c => c.status === 'approved').length,
    rejected: comments.filter(c => c.status === 'rejected').length,
    comments
  };
  return JSON.stringify(data, null, 2);
}

// Exportar base de datos a formato CSV compatible con Excel
export function exportNewsCommentsCSV() {
  const comments = getAllNewsComments();
  const headers = [
    'ID',
    'Fecha',
    'Estado',
    'ID Noticia',
    'Titulo Noticia',
    'Nombre y Apellido',
    'Cedula',
    'Telefono / WhatsApp',
    'Procedencia / Sector',
    'Comentario'
  ];

  const escapeCSV = (str) => {
    if (str === null || str === undefined) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = comments.map(c => [
    escapeCSV(c.id),
    escapeCSV(c.formattedDate || c.createdAt),
    escapeCSV(c.status === 'approved' ? 'Aprobado' : c.status === 'rejected' ? 'Rechazado' : 'Pendiente'),
    escapeCSV(c.newsId),
    escapeCSV(c.newsTitle),
    escapeCSV(c.authorName),
    escapeCSV(c.authorCedula),
    escapeCSV(c.authorPhone),
    escapeCSV(c.authorLocation),
    escapeCSV(c.comment)
  ].join(','));

  return [headers.join(','), ...rows].join('\r\n');
}
