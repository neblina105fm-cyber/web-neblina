// Neblina Stereo 105.5 FM - Sistema Central de Periodistas & Notas de Prensa
// Gestiona el registro de periodistas, autenticación, publicación de notas y trazabilidad editorial.

import { saveNewsItem, getAllNews } from './newsData';

const JOURNALISTS_STORAGE_KEY = 'neblina_journalists_users_db';
const JOURNALIST_SESSION_KEY = 'neblina_journalist_session';
const PRESS_NOTES_STORAGE_KEY = 'neblina_press_notes_db';

// Periodistas semilla preconfigurados
export const DEFAULT_JOURNALISTS = [
  {
    id: 'journalist_admin',
    username: 'admin',
    password: 'admin',
    name: 'Redacción Oficial Neblina 105.5 FM',
    email: 'prensa@neblina105fm.com',
    carruselCard: 'CNP Directorio',
    bio: 'Cuenta oficial de la Dirección de Prensa y Noticias de Neblina Stereo 105.5 FM.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    role: 'Jefe de Información & Redacción',
    department: 'Dirección General de Prensa',
    phone: '+58 424-7459774',
    signatureText: 'Dirección de Prensa y Medios Digitales\nNeblina Stereo 105.5 FM · Mérida, Venezuela.',
    instagramHandle: '@neblina105fm',
    twitterHandle: '@neblina105fm',
    status: 'active',
    canAutoPublish: true, // Siempre publica directo sin pasar por revisión
    createdAt: '2026-01-01T08:00:00Z'
  },
  {
    id: 'journalist_ivan_rivera',
    username: 'ivan.rivera',
    password: '123',
    name: 'Iván Alfonso Rivera',
    email: 'ivanrivera@neblina105fm.com',
    carruselCard: 'CNP 18.421',
    bio: 'Periodista de investigación y corresponsal de sucesos en la región andina.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    role: 'Corresponsal Jefe',
    department: 'Sucesos & Comunidad',
    phone: '+58 414-7521098',
    signatureText: 'Iván Alfonso Rivera | Corresponsal Jefe · CNP 18.421\nCobertura e investigación para Neblina Stereo 105.5 FM.',
    instagramHandle: '@ivan_alfonso_rivera',
    twitterHandle: '@ivanrivera',
    status: 'active',
    canAutoPublish: true,
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'journalist_martha_colmenares',
    username: 'martha.c',
    password: '123',
    name: 'Lic. Martha Colmenares',
    email: 'marthacolmenares@neblina105fm.com',
    carruselCard: 'CNP 22.109',
    bio: 'Redactora de cultura, patrimonio del Páramo de Mérida y turismo andino.',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
    role: 'Redactora Especial',
    department: 'Cultura & Turismo',
    phone: '+58 424-7459774',
    signatureText: 'Lic. Martha Colmenares | CNP 22.109\nRedacción Especial de Cultura, Turismo & Tradición Andina · Neblina 105.5 FM.',
    instagramHandle: '@marthacolmenares',
    twitterHandle: '@marthac_merida',
    status: 'active',
    canAutoPublish: true,
    createdAt: '2026-02-15T10:00:00Z'
  },
  {
    id: 'journalist_diego_paredes',
    username: 'diego.paredes',
    password: '123',
    name: 'Diego Paredes',
    email: 'diegoparedes@neblina105fm.com',
    carruselCard: 'CNP 26.540',
    bio: 'Cobertura de deportes de montaña, ciclismo andino y fútbol regional.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    role: 'Periodista Deportivo',
    department: 'Deportes',
    phone: '+58 412-6543210',
    signatureText: 'Diego Paredes | CNP 26.540\nCronista Deportivo en las Alturas · Neblina Stereo 105.5 FM.',
    instagramHandle: '@diegoparedes_deportes',
    twitterHandle: '@diegop_deportes',
    status: 'active',
    canAutoPublish: true, // Autorizado con publicación directa por directiva
    createdAt: '2026-03-01T10:00:00Z'
  }
];

// Obtener todos los periodistas registrados
export function getAllJournalists() {
  if (typeof window === 'undefined') return DEFAULT_JOURNALISTS;
  try {
    const raw = localStorage.getItem(JOURNALISTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(JOURNALISTS_STORAGE_KEY, JSON.stringify(DEFAULT_JOURNALISTS));
      return DEFAULT_JOURNALISTS;
    }
    let list = JSON.parse(raw);
    if (!Array.isArray(list) || list.length === 0) {
      localStorage.setItem(JOURNALISTS_STORAGE_KEY, JSON.stringify(DEFAULT_JOURNALISTS));
      return DEFAULT_JOURNALISTS;
    }
    // No forzar usuario demo en la lista de periodistas
    return list;
  } catch (e) {
    return DEFAULT_JOURNALISTS;
  }
}

// Guardar lista de periodistas
export function saveJournalists(list) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(JOURNALISTS_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('neblina_journalists_updated', { detail: list }));
  } catch (e) {
    console.error('Error guardando periodistas:', e);
  }
}

// Crear o actualizar un periodista (desde el Admin)
export function saveJournalist(data) {
  const all = getAllJournalists();
  const index = all.findIndex(j => j.id === data.id);

  if (index >= 0) {
    all[index] = {
      ...all[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
  } else {
    const newJournalist = {
      ...data,
      id: data.id || `journalist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      status: data.status || 'active'
    };
    all.unshift(newJournalist);
  }

  saveJournalists(all);
  return all;
}

// Eliminar periodista
export function deleteJournalist(id) {
  const all = getAllJournalists().filter(j => j.id !== id);
  saveJournalists(all);
  return all;
}

// Iniciar sesión de periodista
export function loginJournalist(username, password) {
  const all = getAllJournalists();
  const normalizedUser = String(username || '').trim().toLowerCase();
  const normalizedPass = String(password || '').trim();

  const found = all.find(j => 
    (j.username.toLowerCase() === normalizedUser || j.email.toLowerCase() === normalizedUser) &&
    String(j.password) === normalizedPass &&
    j.status !== 'inactive'
  );

  if (found) {
    const session = {
      id: found.id,
      name: found.name,
      username: found.username,
      email: found.email,
      role: found.role,
      department: found.department,
      avatar: found.avatar,
      carruselCard: found.carruselCard,
      signatureText: found.signatureText,
      instagramHandle: found.instagramHandle,
      twitterHandle: found.twitterHandle,
      phone: found.phone,
      bio: found.bio,
      canAutoPublish: found.canAutoPublish,
      loginAt: new Date().toISOString()
    };
    try {
      localStorage.setItem(JOURNALIST_SESSION_KEY, JSON.stringify(session));
      window.dispatchEvent(new CustomEvent('neblina_journalist_auth_changed', { detail: session }));
    } catch (e) {}
    return { success: true, session };
  }

  return { success: false, error: 'Credenciales inválidas o cuenta inactiva' };
}

// Obtener sesión activa
export function getActiveJournalistSession() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(JOURNALIST_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

// Cerrar sesión
export function logoutJournalist() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(JOURNALIST_SESSION_KEY);
    window.dispatchEvent(new CustomEvent('neblina_journalist_auth_changed', { detail: null }));
  } catch (e) {}
}

// =========================================================================
// GESTIÓN DE NOTAS DE PRENSA PUBLICADAS POR PERIODISTAS
// =========================================================================

// Obtener todas las notas de prensa registradas
export function getAllPressNotes() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PRESS_NOTES_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) || [];
  } catch (e) {
    return [];
  }
}

// Guardar lista de notas de prensa
export function saveAllPressNotes(notes) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PRESS_NOTES_STORAGE_KEY, JSON.stringify(notes));
    window.dispatchEvent(new CustomEvent('neblina_press_notes_updated', { detail: notes }));
  } catch (e) {
    console.error('Error guardando notas de prensa:', e);
  }
}

// Publicar o editar una nota de prensa (Desde el Portal del Periodista o Admin)
export function publishPressNote(noteData, currentJournalist) {
  const notes = getAllPressNotes();
  const isEditing = Boolean(noteData.id && notes.some(n => n.id === noteData.id));

  const noteId = noteData.id || `press_note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  // Toda publicación de periodistas autorizados se realiza directamente sin moderación previa
  const status = 'published';

  const fullNote = {
    ...noteData,
    id: noteId,
    journalistId: currentJournalist?.id || noteData.journalistId || 'journalist_general',
    journalistName: currentJournalist?.name || noteData.journalistName || 'Periodista Neblina',
    journalistRole: currentJournalist?.role || noteData.journalistRole || 'Corresponsal',
    journalistAvatar: currentJournalist?.avatar || noteData.journalistAvatar || '',
    journalistCnp: currentJournalist?.carruselCard || noteData.journalistCnp || '',
    journalistSignature: currentJournalist?.signatureText || noteData.journalistSignature || '',
    journalistInstagram: currentJournalist?.instagramHandle || noteData.journalistInstagram || '',
    journalistTwitter: currentJournalist?.twitterHandle || noteData.journalistTwitter || '',
    status: status,
    date: noteData.date || new Date().toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' }),
    createdAt: noteData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    views: noteData.views || 0,
    isPressNote: true
  };

  if (isEditing) {
    const idx = notes.findIndex(n => n.id === noteId);
    if (idx >= 0) notes[idx] = fullNote;
  } else {
    notes.unshift(fullNote);
  }

  saveAllPressNotes(notes);

  // Si su estado es 'published', sincronizarlo inmediatamente con el archivo global de noticias de la web
  if (status === 'published') {
    saveNewsItem({
      id: noteId,
      title: fullNote.title,
      excerpt: fullNote.excerpt,
      content: fullNote.content,
      category: fullNote.category || 'Notas de Prensa',
      author: fullNote.journalistName,
      date: fullNote.date,
      image: fullNote.image,
      images: fullNote.images || (fullNote.image ? [fullNote.image] : []),
      status: 'published',
      featuredInCarousel: Boolean(fullNote.featuredInCarousel),
      isPressNote: true,
      journalistId: fullNote.journalistId,
      journalistRole: fullNote.journalistRole,
      journalistAvatar: fullNote.journalistAvatar,
      journalistCnp: fullNote.journalistCnp,
      journalistSignature: fullNote.journalistSignature,
      journalistInstagram: fullNote.journalistInstagram,
      journalistTwitter: fullNote.journalistTwitter
    });
  }

  return fullNote;
}

// Cambiar estado de nota de prensa (Aprobar, Rechazar, Enviar a Papelera desde Admin)
export function setPressNoteStatus(noteId, newStatus) {
  const notes = getAllPressNotes();
  const note = notes.find(n => n.id === noteId);
  if (!note) return null;

  note.status = newStatus;
  note.updatedAt = new Date().toISOString();
  saveAllPressNotes(notes);

  // Sincronizar con el sistema global de noticias
  if (newStatus === 'published') {
    saveNewsItem({
      id: note.id,
      title: note.title,
      excerpt: note.excerpt,
      content: note.content,
      category: note.category || 'Notas de Prensa',
      author: note.journalistName,
      date: note.date,
      image: note.image,
      images: note.images,
      status: 'published',
      featuredInCarousel: Boolean(note.featuredInCarousel),
      isPressNote: true,
      journalistId: note.journalistId,
      journalistRole: note.journalistRole,
      journalistAvatar: note.journalistAvatar,
      journalistCnp: note.journalistCnp,
      journalistSignature: note.journalistSignature,
      journalistInstagram: note.journalistInstagram,
      journalistTwitter: note.journalistTwitter
    });
  }

  return note;
}

// Eliminar nota de prensa
export function deletePressNote(noteId) {
  const notes = getAllPressNotes().filter(n => n.id !== noteId);
  saveAllPressNotes(notes);
  return notes;
}

// Obtener notas filtradas por periodista
export function getNotesByJournalist(journalistId) {
  const all = getAllPressNotes();
  if (!journalistId || journalistId === 'all') return all;
  return all.filter(n => n.journalistId === journalistId);
}

// Obtener métricas consolidadas y rendimiento detallado del periodista
export function getJournalistMetrics(journalistId) {
  const notes = getNotesByJournalist(journalistId);
  const published = notes.filter(n => n.status === 'published');
  const pending = notes.filter(n => n.status === 'pending_review');

  // Integrar lecturas y compartidos de analytics si existen en el navegador
  let globalNewsMetrics = {};
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('neblina_analytics_news_metrics');
      if (raw) globalNewsMetrics = JSON.parse(raw);
    } catch (e) {}
  }

  // Enriquecer cada nota con estadísticas reales o de simulación realista de lecturas
  const notesStats = notes.map((note, index) => {
    const tracked = globalNewsMetrics[String(note.id)] || {};
    // Semilla realista según orden y antigüedad si aún no ha acumulado lecturas en el navegador
    const baseViews = 145 + ((note.id.length * 37 + index * 93) % 480);
    const views = (note.views || 0) + (tracked.views || 0) || baseViews;
    const baseShares = 18 + ((index * 29 + 7) % 65);
    const shares = (tracked.shares || 0) || baseShares;

    const platforms = tracked.platforms || {
      whatsapp: Math.round(shares * 0.58),
      telegram: Math.round(shares * 0.18),
      x: Math.round(shares * 0.14),
      facebook: Math.round(shares * 0.10)
    };

    return {
      ...note,
      statsViews: views,
      statsShares: shares,
      platforms,
      engagementRate: ((shares / Math.max(1, views)) * 100).toFixed(1)
    };
  });

  const totalViews = notesStats.reduce((acc, curr) => acc + curr.statsViews, 0);
  const totalShares = notesStats.reduce((acc, curr) => acc + curr.statsShares, 0);
  const avgViewsPerNote = notesStats.length > 0 ? Math.round(totalViews / notesStats.length) : 0;

  return {
    totalNotes: notes.length,
    publishedCount: published.length,
    pendingCount: pending.length,
    totalViews,
    totalShares,
    avgViewsPerNote,
    notesStats: notesStats.sort((a, b) => b.statsViews - a.statsViews)
  };
}
