const fs = require('fs');

const f = 'src/services/talentsData.js';
let c = fs.readFileSync(f, 'utf8');

const badSnippet = `    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_TALENTS;
  } catch (err) {
    console.error('Error al leer talentos de localStorage:', err);
    return DEFAULT_TALENTS;
  }
}`;

c = c.replace(badSnippet, '');

fs.writeFileSync(f, c, 'utf8');
console.log('✓ talentsData corregido.');
