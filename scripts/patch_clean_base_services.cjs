const fs = require('fs');

console.log('--- ACTUALIZANDO SERVICIOS PARA LIMPIEZA TOTAL Y ELIMINACIÓN DE BUCLES ---');

// 1. newsCommentsService.js
{
  const file = 'src/services/newsCommentsService.js';
  let c = fs.readFileSync(file, 'utf8');

  // Vaciar INITIAL_COMMENTS
  c = c.replace(/const INITIAL_COMMENTS = \[\s*\{[\s\S]*?\}\s*\];/m, 'const INITIAL_COMMENTS = [];');

  // Corregir getAllNewsComments para aceptar []
  const oldGet = `export function getAllNewsComments() {
  if (typeof window === 'undefined') return INITIAL_COMMENTS;
  try {
    const raw = localStorage.getItem(STORAGE_COMMENTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Error leyendo comentarios de localStorage:', e);
  }
  return INITIAL_COMMENTS;
}`;

  const newGet = `export function getAllNewsComments() {
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
}`;

  if (c.includes(oldGet)) {
    c = c.replace(oldGet, newGet);
    console.log('✓ newsCommentsService: getAllNewsComments actualizado sin bucle.');
  } else {
    console.warn('! newsCommentsService: oldGet no encontrado exactamente, aplicando patch con regex');
    c = c.replace(/export function getAllNewsComments\(\)\s*\{[\s\S]*?return INITIAL_COMMENTS;\s*\}/, newGet);
  }

  // Corregir resetDefaultNewsComments para que limpie
  c = c.replace(/export function resetDefaultNewsComments\(\)\s*\{[\s\S]*?\}/, `export function resetDefaultNewsComments() {
  saveAllNewsComments([]);
  return [];
}`);

  fs.writeFileSync(file, c, 'utf8');
  console.log('✓ newsCommentsService guardado.');
}

// 2. reportsService.js
{
  const file = 'src/services/reportsService.js';
  let c = fs.readFileSync(file, 'utf8');

  // Vaciar INITIAL_DEMO_REPORTS
  c = c.replace(/export const INITIAL_DEMO_REPORTS = \[\s*\{[\s\S]*?\}\s*\];/m, 'export const INITIAL_DEMO_REPORTS = [];');

  const oldGet = `export function getAllReports() {
  if (typeof window === 'undefined') return INITIAL_DEMO_REPORTS;
  try {
    const raw = localStorage.getItem(STORAGE_REPORTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Error leyendo reportes de localStorage:', e);
  }
  return INITIAL_DEMO_REPORTS;
}`;

  const newGet = `export function getAllReports() {
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
}`;

  if (c.includes(oldGet)) {
    c = c.replace(oldGet, newGet);
    console.log('✓ reportsService: getAllReports actualizado sin bucle.');
  } else {
    c = c.replace(/export function getAllReports\(\)\s*\{[\s\S]*?return INITIAL_DEMO_REPORTS;\s*\}/, newGet);
  }

  fs.writeFileSync(file, c, 'utf8');
  console.log('✓ reportsService guardado.');
}

// 3. citizensDirectoryService.js
{
  const file = 'src/services/citizensDirectoryService.js';
  let c = fs.readFileSync(file, 'utf8');

  c = c.replace(/export const INITIAL_DEMO_CITIZENS = \[\s*\{[\s\S]*?\}\s*\];/m, 'export const INITIAL_DEMO_CITIZENS = [];');

  const oldGet = `export function getAllCitizens() {
  if (typeof window === 'undefined') return INITIAL_DEMO_CITIZENS;
  try {
    const raw = localStorage.getItem(STORAGE_CITIZENS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Error leyendo directorio ciudadano:', e);
  }
  return INITIAL_DEMO_CITIZENS;
}`;

  const newGet = `export function getAllCitizens() {
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
}`;

  if (c.includes(oldGet)) {
    c = c.replace(oldGet, newGet);
    console.log('✓ citizensDirectoryService: getAllCitizens actualizado sin bucle.');
  } else {
    c = c.replace(/export function getAllCitizens\(\)\s*\{[\s\S]*?return INITIAL_DEMO_CITIZENS;\s*\}/, newGet);
  }

  fs.writeFileSync(file, c, 'utf8');
  console.log('✓ citizensDirectoryService guardado.');
}

// 4. unifiedContactsService.js
{
  const file = 'src/services/unifiedContactsService.js';
  let c = fs.readFileSync(file, 'utf8');

  c = c.replace(/export const INITIAL_DEMO_CONTACTS = \[\s*\{[\s\S]*?\}\s*\];/m, 'export const INITIAL_DEMO_CONTACTS = [];');

  const oldGet = `export function getAllUnifiedContacts() {
  if (typeof window === 'undefined') return INITIAL_DEMO_CONTACTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Error leyendo base unificada de contactos:', e);
  }
  return INITIAL_DEMO_CONTACTS;
}`;

  const newGet = `export function getAllUnifiedContacts() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Error leyendo base unificada de contactos:', e);
  }
  return [];
}`;

  if (c.includes(oldGet)) {
    c = c.replace(oldGet, newGet);
    console.log('✓ unifiedContactsService: getAllUnifiedContacts actualizado sin bucle.');
  } else {
    c = c.replace(/export function getAllUnifiedContacts\(\)\s*\{[\s\S]*?return INITIAL_DEMO_CONTACTS;\s*\}/, newGet);
  }

  fs.writeFileSync(file, c, 'utf8');
  console.log('✓ unifiedContactsService guardado.');
}

console.log('Limpieza de servicios base completada.');
