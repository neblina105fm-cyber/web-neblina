// Neblina Stereo 105.5 FM - Servicio del Portal de Clientes Publicitarios
// Gestión de Material Publicitario (Fotos, Videos, Audios), Estados de Pauta,
// Solicitudes de Cambios, Notificación de Eventos/Promociones, Facturación con Tasa BCV y Chat Interno con el Director.

import { getAllClients, saveClient, saveAllClients, getAllBankProfiles } from './radioClientsService';
import { getCachedBcvRates } from './bcvService';
import { showPortalPushNotification } from './notificationService';

const STORAGE_PORTAL_USERS_KEY = 'neblina_client_portal_users_db';
const STORAGE_PORTAL_ASSETS_KEY = 'neblina_client_portal_assets_db';
const STORAGE_PORTAL_REQUESTS_KEY = 'neblina_client_portal_requests_db';
const STORAGE_PORTAL_INVOICES_KEY = 'neblina_client_portal_invoices_db';
const STORAGE_PORTAL_MESSAGES_KEY = 'neblina_client_portal_messages_db';
const STORAGE_PORTAL_NOTIFS_KEY = 'neblina_client_portal_notifications_db';
const SESSION_CLIENT_AUTH_KEY = 'neblina_client_session_auth';

// Notificador de cambios reactivos
function notifyPortalChanged(eventType, detail = {}) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(`neblina_portal_${eventType}`, { detail }));
    window.dispatchEvent(new CustomEvent('neblina_portal_updated', { detail: { type: eventType, ...detail } }));
  }
}

// =========================================================================
// 1. CREDENCIALES Y AUTENTICACIÓN DE CLIENTES
// =========================================================================

export const INITIAL_CLIENT_USERS = [];

export function getAllClientUsers() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_PORTAL_USERS_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

export function saveAllClientUsers(users) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_PORTAL_USERS_KEY, JSON.stringify(users));
    notifyPortalChanged('users_updated');
  } catch (e) {}
}

export function getClientUserByClientId(clientId) {
  const users = getAllClientUsers();
  return users.find(u => String(u.clientId) === String(clientId)) || null;
}

export function setClientCredentials(clientId, { username, password, accessActive = true, businessName = '' }) {
  const users = getAllClientUsers();
  const existingIndex = users.findIndex(u => String(u.clientId) === String(clientId));
  
  const cleanUser = (username || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  if (existingIndex >= 0) {
    users[existingIndex] = {
      ...users[existingIndex],
      username: cleanUser || users[existingIndex].username,
      password: cleanPass || users[existingIndex].password,
      accessActive,
      updatedAt: new Date().toISOString()
    };
  } else {
    users.push({
      clientId,
      username: cleanUser || `cliente_${clientId.replace(/[^a-zA-Z0-9]/g, '')}`,
      password: cleanPass || 'neblina105',
      businessName,
      accessActive,
      lastLogin: null,
      createdAt: new Date().toISOString()
    });
  }

  saveAllClientUsers(users);
  return getClientUserByClientId(clientId);
}

export function loginClient(username, password) {
  const users = getAllClientUsers();
  const inputUser = (username || '').trim().toLowerCase();
  const inputPass = (password || '').trim();

  const foundUser = users.find(u => u.username.toLowerCase() === inputUser && u.password === inputPass);

  if (!foundUser) {
    return { success: false, error: 'Usuario o contraseña incorrectos.' };
  }

  if (foundUser.accessActive === false) {
    return { success: false, error: 'Su acceso ha sido pausado temporalmente por la administración de Neblina 105.5 FM.' };
  }

  // Buscar datos completos del cliente en el CRM
  const allClients = getAllClients();
  const clientData = allClients.find(c => String(c.id) === String(foundUser.clientId));

  const sessionObj = {
    clientId: foundUser.clientId,
    username: foundUser.username,
    businessName: clientData?.businessName || foundUser.businessName,
    loggedInAt: new Date().toISOString()
  };

  if (typeof window !== 'undefined') {
    sessionStorage.setItem(SESSION_CLIENT_AUTH_KEY, JSON.stringify(sessionObj));
    // Actualizar último login
    foundUser.lastLogin = new Date().toISOString();
    saveAllClientUsers(users);
    notifyPortalChanged('auth_state');
  }

  return { success: true, client: clientData, user: foundUser };
}

export function getLoggedClientSession() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SESSION_CLIENT_AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function logoutClient() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(SESSION_CLIENT_AUTH_KEY);
    notifyPortalChanged('auth_state');
  }
}

// =========================================================================
// 2. MATERIAL PUBLICITARIO (FOTOS, VIDEOS, AUDIOS RADIALES) CON FECHA Y VIGENCIA
// =========================================================================

export const INITIAL_CLIENT_ASSETS = [];

export function getAllClientAssets() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_PORTAL_ASSETS_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map(a => ({
          ...a,
          channelType: a.channelType || (a.type === 'audio' ? 'radial' : 'web')
        }));
      }
    }
  } catch (e) {}
  return [];
}

export function saveAllClientAssets(assets) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_PORTAL_ASSETS_KEY, JSON.stringify(assets));
    notifyPortalChanged('assets_updated');
  } catch (e) {}
}

export function getAssetsByClientId(clientId) {
  const all = getAllClientAssets();
  return all.filter(a => String(a.clientId) === String(clientId));
}

export function addClientAsset(clientId, assetData) {
  const all = getAllClientAssets();
  const newAsset = {
    id: `ast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    clientId,
    type: assetData.type || 'photo', // 'photo' | 'video' | 'audio'
    channelType: assetData.channelType || (assetData.type === 'audio' ? 'radial' : 'web'), // 'web' | 'radial' | 'redes'
    name: assetData.name || 'Archivo publicitario',
    url: assetData.url || '',
    thumbnailUrl: assetData.thumbnailUrl || '',
    uploadedAt: assetData.uploadedAt || new Date().toISOString(),
    status: assetData.status || 'vigente', // 'vigente' | 'no_vigente'
    duration: assetData.duration || '',
    category: assetData.category || 'Material Comercial',
    notes: assetData.notes || ''
  };

  const updated = [newAsset, ...all];
  saveAllClientAssets(updated);
  return newAsset;
}

export function updateClientAsset(assetId, updates) {
  const all = getAllClientAssets();
  const updated = all.map(a => a.id === assetId ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a);
  saveAllClientAssets(updated);
  return updated;
}

export function toggleAssetValidity(assetId) {
  const all = getAllClientAssets();
  const target = all.find(a => a.id === assetId);
  if (!target) return all;
  const newStatus = target.status === 'vigente' ? 'no_vigente' : 'vigente';
  return updateClientAsset(assetId, { status: newStatus });
}

export function deleteClientAsset(assetId) {
  const all = getAllClientAssets();
  const updated = all.filter(a => a.id !== assetId);
  saveAllClientAssets(updated);
  return updated;
}

// =========================================================================
// 3. ESTADO DE PAUTA (ACTIVA / INACTIVA) Y SOLICITUDES EN 4 PASOS
// (pendiente -> en_revision -> atendido -> archivado)
// =========================================================================

export const REQUEST_STEPS = [
  { id: 'pendiente', label: 'Pendiente', badgeClass: 'bg-amber-500/20 text-amber-500 dark:text-amber-300 border-amber-500/30' },
  { id: 'en_revision', label: 'En Revisión', badgeClass: 'bg-sky-500/20 text-sky-500 dark:text-sky-300 border-sky-500/30' },
  { id: 'atendido', label: 'Atendido', badgeClass: 'bg-emerald-500/20 text-emerald-600 dark:text-[#00DD9E] border-emerald-500/30' },
  { id: 'archivado', label: 'Archivado', badgeClass: 'bg-slate-500/20 text-slate-500 dark:text-slate-400 border-slate-500/30' }
];

export const INITIAL_CLIENT_REQUESTS = [];

export function getAllRequests() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_PORTAL_REQUESTS_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

export function saveAllRequests(requests) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_PORTAL_REQUESTS_KEY, JSON.stringify(requests));
    notifyPortalChanged('requests_updated');
  } catch (e) {}
}

export function getRequestsByClientId(clientId) {
  const all = getAllRequests();
  return all.filter(r => String(r.clientId) === String(clientId));
}

export function submitClientRequest({
  clientId,
  businessName,
  type = 'cambio_publicitario', // 'cambio_publicitario' | 'evento_promocion' | 'ficha_establecimiento'
  channel = 'publicidad_radial',
  title,
  description,
  targetDate = null,
  proposedProfile = null
}) {
  const all = getAllRequests();
  const newReq = {
    id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    clientId,
    businessName: businessName || 'Cliente Publicitario',
    type,
    channel,
    title: title.trim(),
    description: description.trim(),
    targetDate: targetDate || '',
    proposedProfile: proposedProfile || null,
    status: 'pendiente',
    adminNotes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const updated = [newReq, ...all];
  saveAllRequests(updated);

  // Enviar mensaje automático al chat interno de notificación al Director
  const typeLabel = type === 'evento_promocion'
    ? 'Evento/Promoción'
    : type === 'ficha_establecimiento'
    ? 'Actualización de Ficha Comercial'
    : 'Cambio Publicitario';
  sendInternalMessage({
    clientId,
    sender: 'cliente',
    senderName: businessName || 'Cliente',
    text: `📋 [Nueva Solicitud: ${typeLabel}] ${newReq.title}\n${newReq.description}`
  });

  return newReq;
}

export function approveClientProfileRequest(requestId, customAdminNotes = 'Cambios de ficha del establecimiento aprobados y aplicados oficialmente por la Dirección.') {
  const allReqs = getAllRequests();
  const req = allReqs.find(r => r.id === requestId);
  if (!req) return null;

  if (req.proposedProfile && req.clientId) {
    const allClients = getAllClients();
    const updatedClients = allClients.map(c => {
      if (String(c.id) === String(req.clientId)) {
        return {
          ...c,
          registeredName: req.proposedProfile.registeredName !== undefined ? req.proposedProfile.registeredName : (c.registeredName || ''),
          businessName: req.proposedProfile.businessName || c.businessName,
          businessRif: req.proposedProfile.businessRif || c.businessRif,
          businessDescription: req.proposedProfile.businessDescription !== undefined ? req.proposedProfile.businessDescription : c.businessDescription,
          address: req.proposedProfile.address !== undefined ? req.proposedProfile.address : c.address,
          ownerPhone: req.proposedProfile.ownerPhone !== undefined ? req.proposedProfile.ownerPhone : c.ownerPhone,
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    });
    saveAllClients(updatedClients);
  }

  return updateRequestStep(requestId, 'atendido', customAdminNotes);
}

export function updateRequestStep(requestId, newStatus, adminNotes = null) {
  const all = getAllRequests();
  const updated = all.map(r => {
    if (r.id === requestId) {
      const updates = { 
        status: newStatus, 
        updatedAt: new Date().toISOString() 
      };
      if (adminNotes !== null) updates.adminNotes = adminNotes;
      return { ...r, ...updates };
    }
    return r;
  });

  saveAllRequests(updated);
  return updated;
}

// =========================================================================
// 4. FACTURACIÓN Y COBRANZAS DEL CLIENTE (PENDIENTES Y CANCELADAS)
// =========================================================================

export const INITIAL_INVOICES = [];

export function getAllInvoices() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_PORTAL_INVOICES_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

export function saveAllInvoices(invoices) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_PORTAL_INVOICES_KEY, JSON.stringify(invoices));
    notifyPortalChanged('invoices_updated');
  } catch (e) {}
}

export function getInvoicesByClientId(clientId) {
  const all = getAllInvoices();
  return all.filter(i => String(i.clientId) === String(clientId));
}

export function createInvoice(invoiceData) {
  const all = getAllInvoices();
  const nextNum = String(all.length + 101).padStart(4, '0');
  const allBanks = getAllBankProfiles();
  const selectedBank = invoiceData.paymentDetails || (invoiceData.bankProfileId ? allBanks.find(b => b.id === invoiceData.bankProfileId) : allBanks[0]) || null;

  const newInvoice = {
    id: invoiceData.id || `FAC-2026-${nextNum}`,
    clientId: invoiceData.clientId,
    businessName: invoiceData.businessName || 'Cliente Publicitario',
    businessRif: invoiceData.businessRif || '',
    issueDate: invoiceData.issueDate || new Date().toISOString().split('T')[0],
    dueDate: invoiceData.dueDate || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    amountUsd: Number(invoiceData.amountUsd) || 0,
    status: invoiceData.status || 'pendiente', // 'pendiente' | 'cobrada'
    concept: invoiceData.concept || 'Servicio de Publicidad Radial & Digital',
    period: invoiceData.period || 'Mes en Curso',
    items: invoiceData.items || [
      { description: invoiceData.concept || 'Pauta Publicitaria', qty: 1, priceUsd: Number(invoiceData.amountUsd) || 0, totalUsd: Number(invoiceData.amountUsd) || 0 }
    ],
    bankProfileId: invoiceData.bankProfileId || (selectedBank ? selectedBank.id : ''),
    paymentDetails: selectedBank,
    paidAt: invoiceData.paidAt || null,
    paymentMethod: invoiceData.paymentMethod || '',
    paymentReference: invoiceData.paymentReference || '',
    rateUsed: invoiceData.rateUsed || null,
    amountBsPaid: invoiceData.amountBsPaid || null,
    notes: invoiceData.notes || '',
    createdAt: new Date().toISOString()
  };

  const updated = [newInvoice, ...all];
  saveAllInvoices(updated);

  const bankSummary = selectedBank
    ? `\n💳 Cuenta receptora asignada: ${selectedBank.bankName} · Tel: ${selectedBank.phone} · RIF/CI: ${selectedBank.cedulaRif} (${selectedBank.holderName}).\n⚠️ Verifique siempre los datos de pago antes de realizar su transferencia o Pago Móvil, ya que las cuentas receptoras pueden variar.`
    : '';

  // Notificar al cliente vía chat interno
  sendInternalMessage({
    clientId: invoiceData.clientId,
    sender: 'director',
    senderName: 'Director Neblina 105.5 FM',
    text: `🧾 Se ha emitido la Factura N° ${newInvoice.id} por $${newInvoice.amountUsd.toFixed(2)} USD correspondiente a: ${newInvoice.concept}. Puede revisarla y descargarla en su sección de Facturación.${bankSummary}`
  });

  return newInvoice;
}


// Eliminar factura definitivamente
export function deleteInvoice(invoiceId) {
  const all = getAllInvoices();
  const updated = all.filter(i => String(i.id) !== String(invoiceId));
  saveAllInvoices(updated);
  return updated;
}

export function markInvoicePaid(invoiceId, { paymentMethod = 'Pago Móvil BCV', reference = '', rateUsed = null }) {
  const all = getAllInvoices();
  const currentBcv = getCachedBcvRates();
  const finalRate = rateUsed || currentBcv.usd;

  const updated = all.map(inv => {
    if (inv.id === invoiceId) {
      const totalBs = inv.amountUsd * finalRate;
      return {
        ...inv,
        status: 'cobrada',
        paidAt: new Date().toISOString(),
        paymentMethod,
        paymentReference: reference.trim(),
        rateUsed: finalRate,
        amountBsPaid: totalBs
      };
    }
    return inv;
  });

  saveAllInvoices(updated);

  const updatedInv = updated.find(i => i.id === invoiceId);
  if (updatedInv) {
    sendInternalMessage({
      clientId: updatedInv.clientId,
      sender: 'director',
      senderName: 'Administración Neblina',
      text: `✅ Factura ${updatedInv.id} marcada como CANCELADA / COBRADA con éxito. Ref: ${reference || 'Conciliación Directa'}. Gracias por su preferencia.`
    });
  }

  return updated;
}

// =========================================================================
// 5. SISTEMA DE MENSAJERÍA INTERNA BIDIRECCIONAL (DIRECTOR ↔ CLIENTE)
// =========================================================================

export const INITIAL_MESSAGES = [];

export function getAllInternalMessages() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_PORTAL_MESSAGES_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

export function saveAllInternalMessages(messages) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_PORTAL_MESSAGES_KEY, JSON.stringify(messages));
    notifyPortalChanged('messages_updated');
  } catch (e) {}
}

export function getMessagesByClientId(clientId) {
  const all = getAllInternalMessages();
  return all.filter(m => String(m.clientId) === String(clientId));
}

export function sendInternalMessage({ clientId, sender = 'cliente', senderName = '', text = '', attachment = null }) {
  if (!text && !attachment) return null;
  const all = getAllInternalMessages();

  const newMsg = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    clientId,
    sender,
    senderName: senderName || (sender === 'director' ? 'Director de Neblina 105.5 FM' : 'Cliente'),
    text: text.trim(),
    attachment: attachment || null,
    timestamp: new Date().toISOString(),
    read: false
  };

  const updated = [...all, newMsg];
  saveAllInternalMessages(updated);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('neblina_chat_notification', { detail: newMsg }));
  }

  // Emitir notificación push del sistema si está concedido el permiso
  const pushTitle = sender === 'director'
    ? `🎙️ Mensaje del Director — Neblina 105.5 FM`
    : `💬 Nuevo mensaje de ${newMsg.senderName}`;
  showPortalPushNotification({
    title: pushTitle,
    body: newMsg.text.slice(0, 140),
    tag: `chat-${clientId}-${newMsg.id}`
  });

  return newMsg;
}

export function markMessagesReadForClient(clientId, reader = 'cliente') {
  const all = getAllInternalMessages();
  let hasChanges = false;
  const updated = all.map(m => {
    if (String(m.clientId) === String(clientId)) {
      // Si el lector es el cliente, marcar como leídos los que envió el director
      if (reader === 'cliente' && m.sender === 'director' && !m.read) {
        hasChanges = true;
        return { ...m, read: true };
      }
      // Si el lector es el director, marcar como leídos los que envió el cliente
      if (reader === 'director' && m.sender === 'cliente' && !m.read) {
        hasChanges = true;
        return { ...m, read: true };
      }
    }
    return m;
  });

  if (hasChanges) {
    saveAllInternalMessages(updated);
  }
  return updated;
}

export function getUnreadCount(clientId = null, reader = 'director') {
  const all = getAllInternalMessages();
  return all.filter(m => {
    if (clientId && String(m.clientId) !== String(clientId)) return false;
    if (reader === 'director') return m.sender === 'cliente' && !m.read;
    return m.sender === 'director' && !m.read;
  }).length;
}

// =========================================================================
// 6. ESTADO DE PAUTA GLOBAL DEL CLIENTE (ACTIVA / INACTIVA)
// =========================================================================

export function toggleClientAdStatus(clientId, customStatus = null) {
  const allClients = getAllClients();
  const target = allClients.find(c => String(c.id) === String(clientId));
  if (!target) return null;

  const currentStatus = target.adStatus || 'active'; // 'active' | 'inactive'
  const newStatus = customStatus || (currentStatus === 'active' ? 'inactive' : 'active');

  const updated = allClients.map(c => {
    if (String(c.id) === String(clientId)) {
      return { ...c, adStatus: newStatus, adStatusChangedAt: new Date().toISOString() };
    }
    return c;
  });

  saveAllClients(updated);
  notifyPortalChanged('ad_status_updated', { clientId, adStatus: newStatus });
  return newStatus;
}

// =========================================================================
// 7. NOTIFICACIONES DE PAGOS, VENCIMIENTOS Y ALERTAS AL CLIENTE
// =========================================================================

export const INITIAL_CLIENT_NOTIFICATIONS = [];

export function getAllClientNotifications() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_PORTAL_NOTIFS_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

export function saveAllClientNotifications(list) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_PORTAL_NOTIFS_KEY, JSON.stringify(list));
    notifyPortalChanged('notifications_updated');
  } catch (e) {}
}

export function getClientNotifications(clientId = null) {
  const all = getAllClientNotifications();
  if (!clientId) return all;
  return all.filter(n => String(n.clientId) === String(clientId));
}

export function markClientNotificationsRead(clientId) {
  const all = getAllClientNotifications();
  let changed = false;
  const updated = all.map(n => {
    if (String(n.clientId) === String(clientId) && !n.read) {
      changed = true;
      return { ...n, read: true };
    }
    return n;
  });
  if (changed) {
    saveAllClientNotifications(updated);
  }
  return updated;
}

export function createClientNotification({
  clientId,
  businessName = '',
  type = 'upcoming', // 'upcoming' | 'due_today' | 'overdue'
  title = '',
  message = '',
  dueDate = '',
  amountUsd = 0,
  autoGenerated = false,
  postToChat = true
}) {
  const all = getAllClientNotifications();
  const todayKey = new Date().toISOString().split('T')[0];
  const dedupKey = `${clientId}_${type}_${todayKey}`;

  if (autoGenerated && all.some(n => n.dedupKey === dedupKey)) {
    return null;
  }

  const defaultTitles = {
    upcoming: '⏳ Pronto Vencimiento de Pauta Publicitaria',
    due_today: '📅 Día de Pago Hoy — Pauta Publicitaria',
    overdue: '🚨 Aviso de Pago Atrasado / En Mora'
  };

  const finalTitle = title || defaultTitles[type] || defaultTitles.upcoming;
  const finalAmount = Number(amountUsd) || 0;
  const finalMessage = message || (
    type === 'overdue'
      ? `Estimado aliado comercial de ${businessName}: su pauta publicitaria por $${finalAmount.toFixed(2)} USD presenta saldo vencido. Por favor verifique las cuentas receptoras vigentes y envíe su comprobante.`
      : type === 'due_today'
      ? `Hoy corresponde la fecha de pago de su pauta publicitaria en Neblina 105.5 FM por $${finalAmount.toFixed(2)} USD (Tasa Oficial BCV).`
      : `Le recordamos que en los próximos días vence el ciclo de su pauta publicitaria por $${finalAmount.toFixed(2)} USD.`
  );

  const newNotif = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    dedupKey,
    clientId,
    businessName,
    type,
    title: finalTitle,
    message: finalMessage,
    dueDate: dueDate || todayKey,
    amountUsd: finalAmount,
    read: false,
    autoGenerated,
    createdAt: new Date().toISOString()
  };

  const updated = [newNotif, ...all];
  saveAllClientNotifications(updated);

  // Enviar notificación push del navegador
  showPortalPushNotification({
    title: `${finalTitle} — ${businessName}`,
    body: finalMessage,
    tag: `pay-notif-${clientId}-${type}`
  });

  // Publicar también como aviso en el chat interno del cliente con el Director
  if (postToChat) {
    sendInternalMessage({
      clientId,
      sender: 'director',
      senderName: 'Sistema de Cobranzas Neblina 105.5 FM',
      text: `${finalTitle}\n${finalMessage}\n⚠️ Verifique siempre los datos bancarios antes de transferir.`
    });
  }

  return newNotif;
}

export function runAutomatedPaymentNotifications() {
  const clients = getAllClients().filter(c => !c.trashed && !c.archived);
  const invoices = getAllInvoices().filter(i => i.status === 'pendiente');
  const now = new Date();
  const currentDay = now.getDate();
  const todayStr = now.toISOString().split('T')[0];
  const created = [];

  clients.forEach(client => {
    const billDay = Number(client.billingDay) || 15;
    const diffDays = billDay - currentDay;

    if (client.paymentStatus === 'overdue') {
      const n = createClientNotification({
        clientId: client.id,
        businessName: client.businessName,
        type: 'overdue',
        dueDate: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(billDay).padStart(2, '0')}`,
        amountUsd: client.amountUsd || 0,
        autoGenerated: true,
        postToChat: true
      });
      if (n) created.push(n);
    } else if (client.paymentStatus !== 'paid') {
      if (diffDays === 0) {
        const n = createClientNotification({
          clientId: client.id,
          businessName: client.businessName,
          type: 'due_today',
          dueDate: todayStr,
          amountUsd: client.amountUsd || 0,
          autoGenerated: true,
          postToChat: true
        });
        if (n) created.push(n);
      } else if (diffDays >= 1 && diffDays <= 3) {
        const n = createClientNotification({
          clientId: client.id,
          businessName: client.businessName,
          type: 'upcoming',
          dueDate: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(billDay).padStart(2, '0')}`,
          amountUsd: client.amountUsd || 0,
          autoGenerated: true,
          postToChat: true
        });
        if (n) created.push(n);
      }
    }
  });

  invoices.forEach(inv => {
    if (!inv.dueDate) return;
    const dueTime = new Date(inv.dueDate + 'T12:00:00').getTime();
    const todayTime = new Date(todayStr + 'T12:00:00').getTime();
    const daysLeft = Math.round((dueTime - todayTime) / 86400000);

    if (daysLeft < 0) {
      const n = createClientNotification({
        clientId: inv.clientId,
        businessName: inv.businessName,
        type: 'overdue',
        title: `🚨 Factura ${inv.id} Vencida`,
        dueDate: inv.dueDate,
        amountUsd: inv.amountUsd,
        autoGenerated: true,
        postToChat: true
      });
      if (n) created.push(n);
    } else if (daysLeft === 0) {
      const n = createClientNotification({
        clientId: inv.clientId,
        businessName: inv.businessName,
        type: 'due_today',
        title: `📅 Factura ${inv.id} Vence Hoy`,
        dueDate: inv.dueDate,
        amountUsd: inv.amountUsd,
        autoGenerated: true,
        postToChat: true
      });
      if (n) created.push(n);
    } else if (daysLeft >= 1 && daysLeft <= 3) {
      const n = createClientNotification({
        clientId: inv.clientId,
        businessName: inv.businessName,
        type: 'upcoming',
        title: `⏳ Factura ${inv.id} Próxima a Vencer (${daysLeft} día${daysLeft > 1 ? 's' : ''})`,
        dueDate: inv.dueDate,
        amountUsd: inv.amountUsd,
        autoGenerated: true,
        postToChat: true
      });
      if (n) created.push(n);
    }
  });

  return created;
}
