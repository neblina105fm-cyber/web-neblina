const fs = require('fs');

let content = fs.readFileSync('src/components/SponsorsDirectorySection.jsx', 'utf8');

const startMarker = '{/* 1. HERO HEADER DE LA SECCIÓN DE ALIADOS */}';
const endMarker = '{/* 2. BARRA DE BÚSQUEDA Y FILTRADO POR CATEGORÍAS */}';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  // Eliminamos el bloque del banner hero superior grande
  content = content.substring(0, startIndex) + content.substring(endIndex);
  fs.writeFileSync('src/components/SponsorsDirectorySection.jsx', content, 'utf8');
  console.log('Hero banner removed successfully from SponsorsDirectorySection.jsx');
} else {
  console.error('Markers not found', { startIndex, endIndex });
}
