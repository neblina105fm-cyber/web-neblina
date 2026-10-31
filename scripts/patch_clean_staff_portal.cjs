const fs = require('fs');

console.log('--- ACTUALIZANDO STAFF PORTAL SERVICE ---');

const file = 'src/services/staffPortalService.js';
let c = fs.readFileSync(file, 'utf8');

// 1. Vaciar INITIAL_STAFF_USERS
c = c.replace(/export const INITIAL_STAFF_USERS = \[\s*\{[\s\S]*?\}\s*\];/m, 'export const INITIAL_STAFF_USERS = [];');

// 2. Vaciar INITIAL_STAFF_TASKS
c = c.replace(/export const INITIAL_STAFF_TASKS = \[\s*\{[\s\S]*?\}\s*\];/m, 'export const INITIAL_STAFF_TASKS = [];');

// 3. Vaciar INITIAL_STAFF_INTERVIEWS
c = c.replace(/export const INITIAL_STAFF_INTERVIEWS = \[\s*\{[\s\S]*?\}\s*\];/m, 'export const INITIAL_STAFF_INTERVIEWS = [];');

// 4. Vaciar INITIAL_STAFF_NOTES
c = c.replace(/export const INITIAL_STAFF_NOTES = \[\s*\{[\s\S]*?\}\s*\];/m, 'export const INITIAL_STAFF_NOTES = [];');

// 5. Vaciar INITIAL_STAFF_MESSAGES
c = c.replace(/export const INITIAL_STAFF_MESSAGES = \[\s*\{[\s\S]*?\}\s*\];/m, 'export const INITIAL_STAFF_MESSAGES = [];');

// 6. Modificar getAllStaffUsers
c = c.replace(
  /export function getAllStaffUsers\(\)\s*\{[\s\S]*?return INITIAL_STAFF_USERS;\s*\}/,
  `export function getAllStaffUsers() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_STAFF_USERS_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}`
);

// 7. Modificar getAllStaffTasks
c = c.replace(
  /export function getAllStaffTasks\(\)\s*\{[\s\S]*?return INITIAL_STAFF_TASKS;\s*\}/,
  `export function getAllStaffTasks() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_STAFF_TASKS_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}`
);

// 8. Modificar getAllStaffInterviews
c = c.replace(
  /export function getAllStaffInterviews\(\)\s*\{[\s\S]*?return INITIAL_STAFF_INTERVIEWS;\s*\}/,
  `export function getAllStaffInterviews() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_STAFF_INTERVIEWS_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}`
);

// 9. Modificar getAllStaffNotes
c = c.replace(
  /export function getAllStaffNotes\(\)\s*\{[\s\S]*?return INITIAL_STAFF_NOTES;\s*\}/,
  `export function getAllStaffNotes() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_STAFF_NOTES_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}`
);

// 10. Modificar getAllStaffMessages
c = c.replace(
  /export function getAllStaffMessages\(\)\s*\{[\s\S]*?return INITIAL_STAFF_MESSAGES;\s*\}/,
  `export function getAllStaffMessages() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_STAFF_MESSAGES_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}`
);

fs.writeFileSync(file, c, 'utf8');
console.log('✓ staffPortalService actualizado con éxito.');
