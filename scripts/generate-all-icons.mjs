import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const PUBLIC_DIR = path.resolve('public');

// 1. Read high-res icon.png source
const iconPngPath = path.join(PUBLIC_DIR, 'icon.png');
const iconPngBase64 = fs.readFileSync(iconPngPath).toString('base64');

// 2. Define master SVG for Squircle Icons (Favicon, Apple Touch Icon, PWA Any Icon)
const squircleSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <!-- Fondo Gradiente Apple iOS: Midnight Cyan a Royal Navy -->
    <linearGradient id="iosBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06141e" />
      <stop offset="45%" stop-color="#071c28" />
      <stop offset="100%" stop-color="#001E4D" />
    </linearGradient>

    <!-- Resplandor Ambiental Radial Cyan (#00DD9E) -->
    <radialGradient id="cyanGlow" cx="50%" cy="42%" r="55%">
      <stop offset="0%" stop-color="#00DD9E" stop-opacity="0.38" />
      <stop offset="60%" stop-color="#00DD9E" stop-opacity="0.12" />
      <stop offset="100%" stop-color="#00DD9E" stop-opacity="0" />
    </radialGradient>

    <!-- Resplandor Acento Oro (#FEDC01) -->
    <radialGradient id="goldGlow" cx="80%" cy="80%" r="45%">
      <stop offset="0%" stop-color="#FEDC01" stop-opacity="0.16" />
      <stop offset="100%" stop-color="#FEDC01" stop-opacity="0" />
    </radialGradient>

    <!-- Borde Especular Biselado estilo Cristal Apple -->
    <linearGradient id="specularBorder" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55" />
      <stop offset="35%" stop-color="#00DD9E" stop-opacity="0.28" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.10" />
    </linearGradient>

    <!-- Sombra suave para dar profundidad 3D al Isotipo -->
    <filter id="logoShadow" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#000000" flood-opacity="0.50" />
    </filter>

    <!-- Clip Path Squircle Continuo Apple iOS (radio 22.5%) con esquinas transparentes -->
    <clipPath id="iosSquircleClip">
      <rect x="8" y="8" width="496" height="496" rx="112" ry="112" />
    </clipPath>
  </defs>

  <!-- Contenedor del Squircle con Clip (Esquinas Transparentes) -->
  <g clip-path="url(#iosSquircleClip)">
    <!-- Fondo Gradiente Apple -->
    <rect x="0" y="0" width="512" height="512" fill="url(#iosBg)" />

    <!-- Resplandor Cyan -->
    <rect x="0" y="0" width="512" height="512" fill="url(#cyanGlow)" />

    <!-- Resplandor Dorado -->
    <rect x="0" y="0" width="512" height="512" fill="url(#goldGlow)" />

    <!-- Isotipo Oficial Neblina Stereo 105.5 FM Centrado -->
    <image 
      href="data:image/png;base64,${iconPngBase64}"
      x="67" 
      y="102" 
      width="378" 
      height="308" 
      preserveAspectRatio="xMidYMid meet"
      filter="url(#logoShadow)"
    />
  </g>

  <!-- Borde Especular Biselado Exterior -->
  <rect 
    x="8" 
    y="8" 
    width="496" 
    height="496" 
    rx="112" 
    ry="112" 
    fill="none" 
    stroke="url(#specularBorder)" 
    stroke-width="3.5" 
  />
</svg>`;

// 3. Define master SVG for Maskable Icons (Full Bleed Background, Icon in Safe Zone 80%)
const maskableSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="iosBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06141e" />
      <stop offset="45%" stop-color="#071c28" />
      <stop offset="100%" stop-color="#001E4D" />
    </linearGradient>

    <radialGradient id="cyanGlow" cx="50%" cy="42%" r="55%">
      <stop offset="0%" stop-color="#00DD9E" stop-opacity="0.38" />
      <stop offset="60%" stop-color="#00DD9E" stop-opacity="0.12" />
      <stop offset="100%" stop-color="#00DD9E" stop-opacity="0" />
    </radialGradient>

    <radialGradient id="goldGlow" cx="80%" cy="80%" r="45%">
      <stop offset="0%" stop-color="#FEDC01" stop-opacity="0.16" />
      <stop offset="100%" stop-color="#FEDC01" stop-opacity="0" />
    </radialGradient>

    <filter id="logoShadow" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#000000" flood-opacity="0.50" />
    </filter>
  </defs>

  <!-- Full Bleed Background without corner clipping -->
  <rect x="0" y="0" width="512" height="512" fill="url(#iosBg)" />
  <rect x="0" y="0" width="512" height="512" fill="url(#cyanGlow)" />
  <rect x="0" y="0" width="512" height="512" fill="url(#goldGlow)" />

  <!-- Logo placed within the 80% safe zone (center diameter ~409px) -->
  <image 
    href="data:image/png;base64,${iconPngBase64}"
    x="81" 
    y="113" 
    width="350" 
    height="286" 
    preserveAspectRatio="xMidYMid meet"
    filter="url(#logoShadow)"
  />
</svg>`;

// Helper: Pack array of PNG buffers into Windows .ICO binary format
function createIco(pngBuffers) {
  const numImages = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // icon type (1 = icon)
  header.writeUInt16LE(numImages, 4); // number of images

  let offset = 6 + numImages * 16;
  const dirEntries = [];
  for (const item of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(item.width === 256 ? 0 : item.width, 0);
    entry.writeUInt8(item.height === 256 ? 0 : item.height, 1);
    entry.writeUInt8(0, 2); // color palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(item.buffer.length, 8); // size of image data
    entry.writeUInt32LE(offset, 12); // offset of image data
    dirEntries.push(entry);
    offset += item.buffer.length;
  }
  return Buffer.concat([header, ...dirEntries, ...pngBuffers.map(p => p.buffer)]);
}

async function run() {
  console.log('--- Generating All Application and Favicon Assets ---');

  // 1. Write public/favicon.svg
  fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon.svg'), squircleSvg);
  console.log('✓ Wrote public/favicon.svg');

  const squircleBuffer = Buffer.from(squircleSvg);
  const maskableBuffer = Buffer.from(maskableSvg);

  // 2. Generate standard multi-resolution PNGs
  const standardTargets = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-48x48.png', size: 48 },
    { name: 'favicon.png', size: 64 },
    { name: 'apple-touch-icon-120x120.png', size: 120 },
    { name: 'apple-touch-icon-152x152.png', size: 152 },
    { name: 'apple-touch-icon-180x180.png', size: 180 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'icon-192.png', size: 192 },
    { name: 'icon-512.png', size: 512 }
  ];

  for (const t of standardTargets) {
    const outPath = path.join(PUBLIC_DIR, t.name);
    await sharp(squircleBuffer)
      .resize(t.size, t.size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toFile(outPath);
    console.log(`✓ Generated ${t.name} (${t.size}x${t.size})`);
  }

  // 3. Generate maskable icons
  const maskableTargets = [
    { name: 'icon-maskable-192.png', size: 192 },
    { name: 'icon-maskable-512.png', size: 512 }
  ];

  for (const t of maskableTargets) {
    const outPath = path.join(PUBLIC_DIR, t.name);
    await sharp(maskableBuffer)
      .resize(t.size, t.size, { fit: 'contain' })
      .png({ compressionLevel: 9 })
      .toFile(outPath);
    console.log(`✓ Generated ${t.name} (${t.size}x${t.size} Maskable)`);
  }

  // 4. Generate multi-resolution public/favicon.ico (16, 32, 48)
  const icoPng16 = await sharp(squircleBuffer).resize(16, 16).png().toBuffer();
  const icoPng32 = await sharp(squircleBuffer).resize(32, 32).png().toBuffer();
  const icoPng48 = await sharp(squircleBuffer).resize(48, 48).png().toBuffer();

  const icoBuffer = createIco([
    { width: 16, height: 16, buffer: icoPng16 },
    { width: 32, height: 32, buffer: icoPng32 },
    { width: 48, height: 48, buffer: icoPng48 }
  ]);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon.ico'), icoBuffer);
  console.log('✓ Generated public/favicon.ico (Multi-size: 16x16, 32x32, 48x48)');

  console.log('=== All Icon Assets Successfully Created! ===');
}

run().catch(err => {
  console.error('Fatal error during icon generation:', err);
  process.exit(1);
});
