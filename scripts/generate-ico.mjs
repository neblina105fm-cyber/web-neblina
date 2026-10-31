import fs from 'fs';

// Genera un archivo .ico estándar que contiene imágenes PNG (16x16, 32x32, 48x48)
const png16 = fs.readFileSync('public/favicon-16x16.png');
const png32 = fs.readFileSync('public/favicon-32x32.png');
const png48 = fs.readFileSync('public/favicon-48x48.png');

const images = [
  { width: 16, height: 16, data: png16 },
  { width: 32, height: 32, data: png32 },
  { width: 48, height: 48, data: png48 }
];

// Cabecera ICONDIR: 6 bytes
// 0-1: Reservado (0)
// 2-3: Tipo (1 para ICO)
// 4-5: Número de imágenes (images.length)
const count = images.length;
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(count, 4);

let offset = 6 + (16 * count);
const entries = [];
const imageBuffers = [];

for (const img of images) {
  // ICONDIRENTRY: 16 bytes
  const entry = Buffer.alloc(16);
  entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);   // Ancho
  entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1); // Alto
  entry.writeUInt8(0, 2);                                  // Paleta de colores (0 si no aplica)
  entry.writeUInt8(0, 3);                                  // Reservado
  entry.writeUInt16LE(1, 4);                               // Planos de color (1)
  entry.writeUInt16LE(32, 6);                              // Bits por pixel (32)
  entry.writeUInt32LE(img.data.length, 8);                 // Tamaño de la imagen en bytes
  entry.writeUInt32LE(offset, 12);                         // Offset donde inicia la imagen

  entries.push(entry);
  imageBuffers.push(img.data);
  offset += img.data.length;
}

const icoBuffer = Buffer.concat([header, ...entries, ...imageBuffers]);
fs.writeFileSync('public/favicon.ico', icoBuffer);
console.log(`[OK] Generated public/favicon.ico (${icoBuffer.length} bytes, ${count} frames)`);
