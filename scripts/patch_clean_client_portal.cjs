const fs = require('fs');

console.log('--- ACTUALIZANDO CLIENT PORTAL SERVICE ---');

const file = 'src/services/clientPortalService.js';
let c = fs.readFileSync(file, 'utf8');

// 1. Vaciar INITIAL_CLIENT_USERS
c = c.replace(/export const INITIAL_CLIENT_USERS = \[\s*\{[\s\S]*?\}\s*\];/m, 'export const INITIAL_CLIENT_USERS = [];');

// 2. Vaciar INITIAL_CLIENT_ASSETS
const assetIdx = c.indexOf('export const INITIAL_CLIENT_ASSETS = [');
const assetEndIdx = c.indexOf('export function getAllClientAssets');
if (assetIdx !== -1 && assetEndIdx !== -1) {
  c = c.substring(0, assetIdx) + 'export const INITIAL_CLIENT_ASSETS = [];\n\n' + c.substring(assetEndIdx);
  console.log('✓ INITIAL_CLIENT_ASSETS vaciado.');
}

// 3. Vaciar INITIAL_CLIENT_REQUESTS
c = c.replace(/export const INITIAL_CLIENT_REQUESTS = \[\s*\{[\s\S]*?\}\s*\];/m, 'export const INITIAL_CLIENT_REQUESTS = [];');

// 4. Vaciar INITIAL_INVOICES
c = c.replace(/export const INITIAL_INVOICES = \[\s*\{[\s\S]*?\}\s*\];/m, 'export const INITIAL_INVOICES = [];');

// 5. Vaciar INITIAL_MESSAGES
c = c.replace(/export const INITIAL_MESSAGES = \[\s*\{[\s\S]*?\}\s*\];/m, 'export const INITIAL_MESSAGES = [];');

// 6. Vaciar INITIAL_CLIENT_NOTIFICATIONS
c = c.replace(/export const INITIAL_CLIENT_NOTIFICATIONS = \[\s*\{[\s\S]*?\}\s*\];/m, 'export const INITIAL_CLIENT_NOTIFICATIONS = [];');

// 7. Modificar getAllClientUsers
c = c.replace(
  /export function getAllClientUsers\(\)\s*\{[\s\S]*?return INITIAL_CLIENT_USERS;\s*\}/,
  `export function getAllClientUsers() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_PORTAL_USERS_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}`
);

// 8. Modificar getAllClientAssets
c = c.replace(
  /export function getAllClientAssets\(\)\s*\{[\s\S]*?return INITIAL_CLIENT_ASSETS;\s*\}/,
  `export function getAllClientAssets() {
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
}`
);

// 9. Modificar getAllRequests
c = c.replace(
  /export function getAllRequests\(\)\s*\{[\s\S]*?return INITIAL_CLIENT_REQUESTS;\s*\}/,
  `export function getAllRequests() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_PORTAL_REQUESTS_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}`
);

// 10. Modificar getAllInvoices
c = c.replace(
  /export function getAllInvoices\(\)\s*\{[\s\S]*?return INITIAL_INVOICES;\s*\}/,
  `export function getAllInvoices() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_PORTAL_INVOICES_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}`
);

// 11. Modificar getAllInternalMessages
c = c.replace(
  /export function getAllInternalMessages\(\)\s*\{[\s\S]*?return INITIAL_MESSAGES;\s*\}/,
  `export function getAllInternalMessages() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_PORTAL_MESSAGES_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}`
);

// 12. Modificar getAllClientNotifications
c = c.replace(
  /export function getAllClientNotifications\(\)\s*\{[\s\S]*?return INITIAL_CLIENT_NOTIFICATIONS;\s*\}/,
  `export function getAllClientNotifications() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_PORTAL_NOTIFS_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}`
);

// 13. Agregar deleteInvoice
const deleteInvoiceFn = `
// Eliminar factura definitivamente
export function deleteInvoice(invoiceId) {
  const all = getAllInvoices();
  const updated = all.filter(i => String(i.id) !== String(invoiceId));
  saveAllInvoices(updated);
  return updated;
}
`;

if (!c.includes('export function deleteInvoice')) {
  c = c.replace('export function markInvoicePaid', deleteInvoiceFn + '\nexport function markInvoicePaid');
  console.log('✓ deleteInvoice exportado en clientPortalService.');
}

fs.writeFileSync(file, c, 'utf8');
console.log('✓ clientPortalService actualizado con éxito.');
