const fs = require('fs');

console.log('--- ACTUALIZANDO TALENTS DATA ---');

const file = 'src/services/talentsData.js';
let c = fs.readFileSync(file, 'utf8');

// 1. Vaciar DEFAULT_TALENTS
c = c.replace(/export const DEFAULT_TALENTS = \[\s*\{[\s\S]*?\}\s*\];/m, 'export const DEFAULT_TALENTS = [];');

// 2. Modificar getAllTalents
c = c.replace(
  /function getAllTalents\(\)\s*\{[\s\S]*?return DEFAULT_TALENTS;\s*\}/,
  `function getAllTalents() {
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
}`
);

// 3. Modificar resetDefaultTalents
c = c.replace(
  /export function resetDefaultTalents\(\)\s*\{[\s\S]*?\}/,
  `export function resetDefaultTalents() {
  saveAllTalents([]);
  return [];
}`
);

fs.writeFileSync(file, c, 'utf8');
console.log('✓ talentsData actualizado con éxito.');
