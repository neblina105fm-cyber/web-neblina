// Neblina Stereo 105.5 FM - Servicio del Portal de Locutores & Equipo Comercial
// Permite a locutores y personal gestionar sus clientes, cobranzas (Botón de Cobro y Botón de Pago),
// tasas oficiales BCV con calculadora, tareas/pautas asignadas por la Dirección (publicitarias y de programación),
// notas personales, registro de entrevistas en cabina y chat bidireccional con el Director.

import { getAllClients, saveClient, saveAllClients, recordClientPayment, getAllPayments } from './radioClientsService';
import { getCachedBcvRates } from './bcvService';

const STORAGE_STAFF_USERS_KEY = 'neblina_staff_portal_users_db';
const STORAGE_STAFF_TASKS_KEY = 'neblina_staff_portal_tasks_db';
const STORAGE_STAFF_NOTES_KEY = 'neblina_staff_portal_notes_db';
const STORAGE_STAFF_INTERVIEWS_KEY = 'neblina_staff_portal_interviews_db';
const STORAGE_STAFF_MESSAGES_KEY = 'neblina_staff_portal_messages_db';
const SESSION_STAFF_AUTH_KEY = 'neblina_staff_session_auth';

// Notificador reactivo para sincronización entre componentes
function notifyStaffChanged(eventType, detail = {}) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(`neblina_staff_${eventType}`, { detail }));
    window.dispatchEvent(new CustomEvent('neblina_staff_updated', { detail: { type: eventType, ...detail } }));
  }
}

// =========================================================================
// 1. USUARIOS Y CREDENCIALES DE LOCUTORES / EQUIPO COMERCIAL
// =========================================================================

export const INITIAL_STAFF_USERS = [];

export function getAllStaffUsers() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_STAFF_USERS_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

export function saveAllStaffUsers(users) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_STAFF_USERS_KEY, JSON.stringify(users));
    notifyStaffChanged('users_updated');
  } catch (e) {}
}

export function getStaffUserById(staffId) {
  const users = getAllStaffUsers();
  return users.find(u => String(u.id) === String(staffId)) || null;
}

export function saveStaffUser(staffData) {
  const users = getAllStaffUsers();
  let updated;
  const cleanUsername = (staffData.username || '').trim().toLowerCase();
  const cleanPassword = (staffData.password || '').trim();

  if (staffData.id) {
    const exists = users.some(u => String(u.id) === String(staffData.id));
    if (exists) {
      updated = users.map(u => {
        if (String(u.id) === String(staffData.id)) {
          return {
            ...u,
            ...staffData,
            username: cleanUsername || u.username,
            password: cleanPassword || u.password,
            updatedAt: new Date().toISOString()
          };
        }
        return u;
      });
    } else {
      updated = [staffData, ...users];
    }
  } else {
    const newStaff = {
      ...staffData,
      id: `staff_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      username: cleanUsername || `locutor_${Date.now().toString(36)}`,
      password: cleanPassword || 'neblina105',
      accessActive: staffData.accessActive !== false,
      commissionRate: Number(staffData.commissionRate) || 20,
      createdAt: new Date().toISOString()
    };
    updated = [newStaff, ...users];
  }

  saveAllStaffUsers(updated);
  return updated;
}

export function toggleStaffActive(staffId) {
  const users = getAllStaffUsers();
  const updated = users.map(u => {
    if (String(u.id) === String(staffId)) {
      return { ...u, accessActive: !u.accessActive, updatedAt: new Date().toISOString() };
    }
    return u;
  });
  saveAllStaffUsers(updated);
  return updated;
}

export function deleteStaffUser(staffId) {
  const users = getAllStaffUsers();
  const updated = users.filter(u => String(u.id) !== String(staffId));
  saveAllStaffUsers(updated);
  return updated;
}

// Generar mensaje formateado para enviar acceso por WhatsApp
export function generateStaffWhatsAppMessage(staff) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://neblinastereo105.com';
  const portalUrl = `${origin}/#locutores`;
  return (
    `🎙️ *NEBLINA STEREO 105.5 FM — ACCESO AL PORTAL DE LOCUTORES & VENTAS*\n\n` +
    `¡Hola, *${staff.name}*!\n` +
    `Aquí tienes tus credenciales para acceder a tu portal comercial y de programación:\n\n` +
    `🔗 *Enlace directo:* ${portalUrl}\n` +
    `👤 *Usuario:* ${staff.username}\n` +
    `🔑 *Contraseña:* ${staff.password}\n` +
    `📻 *Programa asignado:* ${staff.programName || 'Programación General'}\n\n` +
    `En tu portal podrás:\n` +
    `• Registrar y administrar tus clientes publicitarios\n` +
    `• Gestionar cobranzas con tasas BCV en vivo (Botón de Cobro y Botón de Pago)\n` +
    `• Consultar tareas y pautas asignadas por la Dirección\n` +
    `• Registrar entrevistas realizadas en cabina\n` +
    `• Mantener notas personales y chat directo con la Dirección.`
  );
}

// =========================================================================
// 2. SESIÓN Y AUTENTICACIÓN DEL LOCUTOR
// =========================================================================

export function getActiveStaffSession() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SESSION_STAFF_AUTH_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

export function setStaffSession(staff) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(SESSION_STAFF_AUTH_KEY, JSON.stringify(staff));
    notifyStaffChanged('session_started', { staffId: staff.id });
  } catch (e) {}
}

export function clearStaffSession() {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(SESSION_STAFF_AUTH_KEY);
    notifyStaffChanged('session_ended');
  } catch (e) {}
}

export function loginStaff(username, password) {
  const users = getAllStaffUsers();
  const cleanU = (username || '').trim().toLowerCase();
  const cleanP = (password || '').trim();

  const found = users.find(u => u.username.toLowerCase() === cleanU && String(u.password) === cleanP);

  if (!found) {
    return { success: false, error: 'Usuario o contraseña incorrectos.' };
  }

  if (!found.accessActive) {
    return { success: false, error: 'Tu cuenta de locutor se encuentra inactiva. Contacta a Dirección.' };
  }

  // Registrar último login
  found.lastLogin = new Date().toISOString();
  saveAllStaffUsers(users);

  setStaffSession(found);
  return { success: true, staff: found };
}

// =========================================================================
// 3. TAREAS Y ACTIVIDADES ASIGNADAS POR DIRECCIÓN (PUBLICITARIAS Y DE PROGRAMACIÓN)
// =========================================================================

export const INITIAL_STAFF_TASKS = [];

export function getAllStaffTasks() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_STAFF_TASKS_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

export function saveAllStaffTasks(tasks) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_STAFF_TASKS_KEY, JSON.stringify(tasks));
    notifyStaffChanged('tasks_updated');
  } catch (e) {}
}

export function getTasksByStaffId(staffId) {
  const tasks = getAllStaffTasks();
  if (!staffId) return tasks;
  return tasks.filter(t => String(t.staffId) === String(staffId));
}

export function saveStaffTask(taskData) {
  const tasks = getAllStaffTasks();
  let updated;

  if (taskData.id) {
    updated = tasks.map(t => String(t.id) === String(taskData.id) ? { ...t, ...taskData, updatedAt: new Date().toISOString() } : t);
  } else {
    const newTask = {
      ...taskData,
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      status: taskData.status || 'pendiente',
      priority: taskData.priority || 'media',
      type: taskData.type || 'publicitaria',
      assignedBy: taskData.assignedBy || 'Dirección General',
      assignedAt: new Date().toISOString()
    };
    updated = [newTask, ...tasks];
  }

  saveAllStaffTasks(updated);
  return updated;
}

export function updateStaffTaskStatus(taskId, status, locutorNotes = '') {
  const tasks = getAllStaffTasks();
  const updated = tasks.map(t => {
    if (String(t.id) === String(taskId)) {
      return {
        ...t,
        status,
        locutorNotes: locutorNotes !== undefined ? locutorNotes : t.locutorNotes,
        updatedAt: new Date().toISOString(),
        completedAt: status === 'completada' ? new Date().toISOString() : t.completedAt
      };
    }
    return t;
  });
  saveAllStaffTasks(updated);
  return updated;
}

export function deleteStaffTask(taskId) {
  const tasks = getAllStaffTasks();
  const updated = tasks.filter(t => String(t.id) !== String(taskId));
  saveAllStaffTasks(updated);
  return updated;
}

// =========================================================================
// 4. REGISTRO DE ENTREVISTAS EN CABINA / PROGRAMA
// =========================================================================

export const INITIAL_STAFF_INTERVIEWS = [];

export function getAllStaffInterviews() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_STAFF_INTERVIEWS_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

export function saveAllStaffInterviews(interviews) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_STAFF_INTERVIEWS_KEY, JSON.stringify(interviews));
    notifyStaffChanged('interviews_updated');
  } catch (e) {}
}

export function getInterviewsByStaffId(staffId) {
  const interviews = getAllStaffInterviews();
  if (!staffId) return interviews;
  return interviews.filter(i => String(i.staffId) === String(staffId));
}

export function saveStaffInterview(interviewData) {
  const interviews = getAllStaffInterviews();
  let updated;

  if (interviewData.id) {
    updated = interviews.map(i => String(i.id) === String(interviewData.id) ? { ...i, ...interviewData, updatedAt: new Date().toISOString() } : i);
  } else {
    const newInterview = {
      ...interviewData,
      id: `int_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    updated = [newInterview, ...interviews];
  }

  saveAllStaffInterviews(updated);
  return updated;
}

export function deleteStaffInterview(interviewId) {
  const interviews = getAllStaffInterviews();
  const updated = interviews.filter(i => String(i.id) !== String(interviewId));
  saveAllStaffInterviews(updated);
  return updated;
}

// =========================================================================
// 5. NOTAS PERSONALES Y ESQUEMA DEL PROGRAMA DEL LOCUTOR
// =========================================================================

export const INITIAL_STAFF_NOTES = [];

export function getAllStaffNotes() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_STAFF_NOTES_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

export function saveAllStaffNotes(notes) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_STAFF_NOTES_KEY, JSON.stringify(notes));
    notifyStaffChanged('notes_updated');
  } catch (e) {}
}

export function getNotesByStaffId(staffId) {
  const notes = getAllStaffNotes();
  if (!staffId) return notes;
  return notes
    .filter(n => String(n.staffId) === String(staffId))
    .sort((a, b) => (Number(a.sortOrder) || 99) - (Number(b.sortOrder) || 99));
}

export function saveStaffNote(noteData) {
  const notes = getAllStaffNotes();
  let updated;

  const statusVal = noteData.status || (noteData.spokenLive ? 'spoken' : 'queued');
  const spokenVal = statusVal === 'spoken' ? true : Boolean(noteData.spokenLive);

  if (noteData.id) {
    updated = notes.map(n =>
      String(n.id) === String(noteData.id)
        ? {
            ...n,
            ...noteData,
            status: statusVal,
            spokenLive: spokenVal,
            updatedAt: new Date().toISOString()
          }
        : n
    );
  } else {
    const staffNotes = notes.filter(n => String(n.staffId) === String(noteData.staffId) && !n.trashed);
    const nextOrder = noteData.sortOrder !== undefined ? Number(noteData.sortOrder) : staffNotes.length + 1;
    const newNote = {
      programDate: new Date().toISOString().split('T')[0],
      dayOfWeek: new Date().getDay() === 0 ? 7 : new Date().getDay(),
      segmentTime: '',
      trashed: false,
      ...noteData,
      id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sortOrder: nextOrder,
      status: statusVal,
      spokenLive: spokenVal,
      updatedAt: new Date().toISOString()
    };
    updated = [newNote, ...notes];
  }

  saveAllStaffNotes(updated);
  return updated;
}

export function updateStaffNoteStatus(noteId, newStatus) {
  const notes = getAllStaffNotes();
  const updated = notes.map(n => {
    if (String(n.id) === String(noteId)) {
      return {
        ...n,
        status: newStatus, // 'queued' | 'spoken' | 'draft'
        spokenLive: newStatus === 'spoken',
        spokenAt: newStatus === 'spoken' ? new Date().toISOString() : n.spokenAt,
        updatedAt: new Date().toISOString()
      };
    }
    return n;
  });
  saveAllStaffNotes(updated);
  return updated;
}

export function reorderStaffNote(noteId, direction = 'up') {
  const notes = getAllStaffNotes();
  const target = notes.find(n => String(n.id) === String(noteId));
  if (!target) return notes;

  const siblings = notes
    .filter(n => String(n.staffId) === String(target.staffId) && !n.trashed)
    .sort((a, b) => (Number(a.sortOrder) || 99) - (Number(b.sortOrder) || 99));

  const idx = siblings.findIndex(n => String(n.id) === String(noteId));
  if (idx < 0) return notes;
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= siblings.length) return notes;

  const reorderedIds = siblings.map(s => s.id);
  const temp = reorderedIds[idx];
  reorderedIds[idx] = reorderedIds[swapIdx];
  reorderedIds[swapIdx] = temp;

  const orderMap = {};
  reorderedIds.forEach((id, i) => {
    orderMap[id] = i + 1;
  });

  const updated = notes.map(n => {
    if (orderMap[n.id] !== undefined) {
      return { ...n, sortOrder: orderMap[n.id], updatedAt: new Date().toISOString() };
    }
    return n;
  });

  saveAllStaffNotes(updated);
  return updated;
}

export function trashStaffNote(noteId) {
  const notes = getAllStaffNotes();
  const updated = notes.map(n =>
    String(n.id) === String(noteId) ? { ...n, trashed: true, trashedAt: new Date().toISOString() } : n
  );
  saveAllStaffNotes(updated);
  return updated;
}

export function restoreStaffNote(noteId) {
  const notes = getAllStaffNotes();
  const updated = notes.map(n =>
    String(n.id) === String(noteId) ? { ...n, trashed: false, trashedAt: null } : n
  );
  saveAllStaffNotes(updated);
  return updated;
}

export function deleteStaffNote(noteId) {
  const notes = getAllStaffNotes();
  const updated = notes.filter(n => String(n.id) !== String(noteId));
  saveAllStaffNotes(updated);
  return updated;
}

// =========================================================================
// 6. CHAT Y MENSAJERÍA BIDIRECCIONAL (DIRECTOR <-> LOCUTOR)
// =========================================================================

export const INITIAL_STAFF_MESSAGES = [];

export function getAllStaffMessages() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_STAFF_MESSAGES_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

export function saveAllStaffMessages(messages) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_STAFF_MESSAGES_KEY, JSON.stringify(messages));
    notifyStaffChanged('messages_updated');
  } catch (e) {}
}

export function getStaffMessages(staffId) {
  const messages = getAllStaffMessages();
  if (!staffId) return [];
  return messages.filter(m => String(m.staffId) === String(staffId));
}

export function sendStaffMessage({ staffId, sender, text }) {
  if (!staffId || !text || !text.trim()) return null;
  const messages = getAllStaffMessages();
  const newMsg = {
    id: `msg_s_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    staffId,
    sender: sender || 'staff',
    text: text.trim(),
    timestamp: new Date().toISOString(),
    read: sender === 'director' ? false : true
  };
  const updated = [...messages, newMsg];
  saveAllStaffMessages(updated);
  return newMsg;
}

export function markStaffMessagesAsRead(staffId, reader = 'staff') {
  const messages = getAllStaffMessages();
  const updated = messages.map(m => {
    if (String(m.staffId) === String(staffId)) {
      // Si el lector es el locutor, marca como leídos los que envió el director
      if (reader === 'staff' && m.sender === 'director') {
        return { ...m, read: true };
      }
      // Si el lector es el director, marca como leídos los que envió el locutor
      if (reader === 'director' && m.sender === 'staff') {
        return { ...m, read: true };
      }
    }
    return m;
  });
  saveAllStaffMessages(updated);
  return updated;
}

// =========================================================================
// 7. CÁLCULO DE VENTAS, COBRANZAS Y COMISIONES POR LOCUTOR
// =========================================================================

export function getStaffSalesMetrics(staffId, clientsList = null, paymentsList = null, bcvUsdRate = null) {
  const allClients = clientsList || getAllClients();
  const allPayments = paymentsList || getAllPayments();
  const rateUsd = bcvUsdRate || getCachedBcvRates().usd || 884.75;

  const staffClients = allClients.filter(c => !c.trashed && String(c.locutorId) === String(staffId));
  const activeClients = staffClients.filter(c => !c.archived);
  const archivedClients = staffClients.filter(c => c.archived);

  // Total facturado por mes (suma de amountUsd de contratos activos)
  const totalBilledUsd = activeClients.reduce((acc, c) => acc + (Number(c.amountUsd) || 0), 0);
  const totalBilledBs = totalBilledUsd * rateUsd;

  // Clientes pagados / pendientes
  const paidClients = activeClients.filter(c => c.paymentStatus === 'paid');
  const pendingClients = activeClients.filter(c => c.paymentStatus === 'pending');
  const overdueClients = activeClients.filter(c => c.paymentStatus === 'overdue');

  const totalCollectedUsd = paidClients.reduce((acc, c) => acc + (Number(c.amountUsd) || 0), 0);
  const totalCollectedBs = totalCollectedUsd * rateUsd;

  const totalPendingUsd = [...pendingClients, ...overdueClients].reduce((acc, c) => acc + (Number(c.amountUsd) || 0), 0);
  const totalPendingBs = totalPendingUsd * rateUsd;

  // Cobranzas registradas en el historial de pagos para este locutor
  const staffClientIds = new Set(staffClients.map(c => String(c.id)));
  const staffPayments = allPayments.filter(p => staffClientIds.has(String(p.clientId)) || String(p.locutorId) === String(staffId));

  // Obtener porcentaje de comisión del locutor
  const staffUser = getStaffUserById(staffId);
  const commissionRate = staffUser?.commissionRate || 20;
  const estimatedCommissionUsd = (totalCollectedUsd * commissionRate) / 100;
  const estimatedCommissionBs = estimatedCommissionUsd * rateUsd;

  return {
    totalClientsCount: staffClients.length,
    activeClientsCount: activeClients.length,
    archivedClientsCount: archivedClients.length,
    paidClientsCount: paidClients.length,
    pendingClientsCount: pendingClients.length,
    overdueClientsCount: overdueClients.length,
    totalBilledUsd,
    totalBilledBs,
    totalCollectedUsd,
    totalCollectedBs,
    totalPendingUsd,
    totalPendingBs,
    commissionRate,
    estimatedCommissionUsd,
    estimatedCommissionBs,
    paymentsCount: staffPayments.length,
    paymentsList: staffPayments
  };
}
