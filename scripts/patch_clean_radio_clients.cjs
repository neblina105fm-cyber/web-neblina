const fs = require('fs');

console.log('--- ACTUALIZANDO RADIO CLIENTS SERVICE ---');

const file = 'src/services/radioClientsService.js';
let c = fs.readFileSync(file, 'utf8');

// 1. Vaciar INITIAL_CLIENTS
c = c.replace(/export const INITIAL_CLIENTS = \[\s*\{[\s\S]*?\}\s*\];/m, 'export const INITIAL_CLIENTS = [];');

// 2. Modificar getAllClients
const oldGetClients = `export function getAllClients() {
  if (typeof window === 'undefined') return INITIAL_CLIENTS;
  try {
    const raw = localStorage.getItem(STORAGE_CLIENTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        let needsSave = false;
        const normalized = parsed.map(c => {
          const updated = { ...c };
          if (!updated.locutorId) {
            if (updated.id === 'cli_001') {
              updated.locutorId = 'staff_carlos_rondon';
              updated.locutorName = 'Carlos "El Oso" Rondón';
              needsSave = true;
            } else if (updated.id === 'cli_002') {
              updated.locutorId = 'staff_javier_marquez';
              updated.locutorName = 'DJ Javier Márquez';
              needsSave = true;
            } else if (updated.id === 'cli_003') {
              updated.locutorId = 'staff_maria_quintero';
              updated.locutorName = 'María Valentina Quintero';
              needsSave = true;
            } else {
              updated.locutorId = 'staff_carlos_rondon';
              updated.locutorName = 'Carlos "El Oso" Rondón';
              needsSave = true;
            }
          }
          if (!updated.businessDescription) {
            if (updated.id === 'cli_001') updated.businessDescription = 'Especialistas en carnes y cortes premium al carbón, arepas de trigo andinas, truchas frescas del páramo y desayunos criollos tradicionales.';
            if (updated.id === 'cli_002') updated.businessDescription = 'El club nocturno y discoteca más exclusivo del páramo merideño. Audio line-array de alta fidelidad, show de luces y coctelería internacional.';
            if (updated.id === 'cli_003') updated.businessDescription = 'Proveedor líder de telecomunicaciones por fibra óptica simétrica hasta el hogar (FTTH) en Santo Domingo, Las Piedras y Pueblo Llano.';
            needsSave = true;
          }
          if (updated.archived === undefined) {
            updated.archived = false;
            needsSave = true;
          }
          return updated;
        });
        if (needsSave) {
          try {
            localStorage.setItem(STORAGE_CLIENTS_KEY, JSON.stringify(normalized));
          } catch (e) {}
        }
        return normalized;
      }
    }
  } catch (e) {}
  return INITIAL_CLIENTS;
}`;

const newGetClients = `export function getAllClients() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_CLIENTS_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map(c => ({
          ...c,
          archived: Boolean(c.archived)
        }));
      }
    }
  } catch (e) {}
  return [];
}`;

if (c.includes(oldGetClients)) {
  c = c.replace(oldGetClients, newGetClients);
  console.log('✓ getAllClients reemplazado exactamente.');
} else {
  console.log('! Reemplazando con regex...');
  c = c.replace(/export function getAllClients\(\)\s*\{[\s\S]*?return INITIAL_CLIENTS;\s*\}/, newGetClients);
}

fs.writeFileSync(file, c, 'utf8');
console.log('✓ radioClientsService actualizado con éxito.');
