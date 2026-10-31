const fs = require('fs');

let code = fs.readFileSync('src/services/talentsData.js', 'utf8');

const newFunctions = `
// Archivar un talento (Locutores Archivados)
export function archiveTalent(id) {
  const current = getAllTalents().map(t => {
    if (String(t.id) === String(id)) {
      return { ...t, archived: true, archivedAt: new Date().toISOString() };
    }
    return t;
  });
  saveAllTalents(current);
  return current;
}

// Desarchivar un talento
export function unarchiveTalent(id) {
  const current = getAllTalents().map(t => {
    if (String(t.id) === String(id)) {
      return { ...t, archived: false, archivedAt: null };
    }
    return t;
  });
  saveAllTalents(current);
  return current;
}
`;

if (!code.includes('export function archiveTalent')) {
  code += newFunctions;
  fs.writeFileSync('src/services/talentsData.js', code, 'utf8');
  console.log('Added archiveTalent and unarchiveTalent to talentsData.js');
}
