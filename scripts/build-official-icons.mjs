import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const PUBLIC_DIR = path.resolve('public');

// Vector paths of the official Neblina 'n' + 105.5 FM logo (extracted from Figma node 4-15)
const nPath = "M1406.68 483.36V897.65H1285.25V468.06C1285.25 411.6 1267.73 367.55 1232.69 335.91C1197.65 304.27 1151.22 288.46 1093.4 288.46H944.43C889.33 288.46 843.41 304.96 806.66 337.94C769.93 370.96 751.56 414.32 751.56 468.05V897.64H630.13V182.35H751.56V276.22C795.09 213.64 859.38 182.35 944.43 182.35H1093.4C1192.03 182.35 1268.92 208.04 1324.02 259.39C1379.12 310.76 1406.68 385.41 1406.68 483.37V483.36Z";
const mPath = "M597.65 852.2V866.79H526L527.67 870.74L546.69 889.88L538.92 897.66L513.8 873.14V852.21H597.65V852.2Z";
const fPath = "M560.45 742.99C571.62 742.99 579.81 744.31 585.03 746.94C590.25 749.57 593.74 754.04 595.5 760.34C596.94 765.36 597.65 773.58 597.65 784.98V795.75C597.65 807.55 596.65 816.13 594.66 821.47C592.51 827.29 588.52 831.32 582.7 833.55C577.44 835.46 568.87 836.42 556.98 836.42C544.46 836.42 535.49 835.58 530.07 833.91C523.69 831.92 519.3 828.09 516.91 822.43C514.52 816.77 513.32 807.8 513.32 795.52V784.87C513.32 771.71 514.68 762.24 517.39 756.46C520.1 750.68 524.97 746.91 531.98 745.16C537.24 743.72 546.73 743.01 560.45 743.01V742.99ZM559.97 757.34H551.96C543.99 757.34 538.3 758.14 534.91 759.73C531.52 761.33 529.35 764.24 528.39 768.46C527.67 771.41 527.31 777.07 527.31 785.45V794.66C527.31 806.22 528.51 813.52 530.9 816.55C533.85 820.22 540.91 822.05 552.07 822.05H560.08C571.01 822.05 577.86 820.18 580.65 816.43C582.8 813.48 583.88 806.34 583.88 795.02V785.21C583.88 777 583.6 771.45 583.04 768.58C582.08 764.35 579.95 761.42 576.64 759.79C573.33 758.16 567.77 757.34 559.95 757.34H559.97Z";
const fivePath2 = "M569.54 640C580.23 640 587.72 642.79 592.03 648.37C595.86 653.32 597.77 661.25 597.77 672.17V698.73C597.77 720.02 589.8 730.63 573.85 730.55V716.32C578.71 716.32 581.95 714.09 583.54 709.62C584.5 706.99 584.98 702.68 584.98 696.7V673.38C584.98 666.68 583.78 661.9 581.39 659.03C578.68 655.92 574.01 654.36 567.39 654.36C562.45 654.36 558.66 655.84 556.03 658.79C553.4 661.74 552.08 665.77 552.08 670.87V700.89C552.08 708.55 553.68 713.17 556.87 714.77V729.12H513.81V643.23H525.41V714.88H543.23C540.6 712.73 539.28 707.74 539.28 699.93V672.54C539.28 660.98 541.39 652.76 545.62 647.9C550.17 642.64 558.14 640 569.54 640Z";
const dotPath = "M597.65 611.77V628.04H582.82V611.77H597.65Z";
const fivePath1 = "M569.54 503.88C580.23 503.88 587.72 506.67 592.03 512.25C595.86 517.2 597.77 525.13 597.77 536.05V562.61C597.77 583.9 589.8 594.51 573.85 594.43V580.2C578.71 580.2 581.95 577.97 583.54 573.5C584.5 570.87 584.98 566.56 584.98 560.58V537.26C584.98 530.56 583.78 525.78 581.39 522.91C578.68 519.8 574.01 518.24 567.39 518.24C562.45 518.24 558.66 519.72 556.03 522.67C553.4 525.62 552.08 529.65 552.08 534.75V564.77C552.08 572.43 553.68 577.05 556.87 578.65V593H513.81V507.11H525.41V578.76H543.23C540.6 576.61 539.28 571.62 539.28 563.81V536.42C539.28 524.86 541.39 516.64 545.62 511.78C550.17 506.52 558.14 503.88 569.54 503.88Z";
const zeroPath = "M548.37 429.59V370.5H560.45V429.59H597.65V442.99L554.11 442.87C542.55 442.87 534.17 441.95 528.99 440.12C523.09 438.05 518.98 434.1 516.67 428.28C514.44 422.78 513.32 414.05 513.32 402.08V386.53C513.32 371.46 515.16 361.09 518.82 355.43C522.33 350.01 528.99 346.74 538.8 345.62V359.14C533.22 360.42 529.63 363.29 528.03 367.75C526.91 370.94 526.36 377.4 526.36 387.13V401.24C526.36 412.56 527.44 419.82 529.59 423.01C532.22 427.08 538.48 429.27 548.37 429.59Z";
const onePath = "M554.47 195.26C535.65 195.26 526.24 204.67 526.24 223.49C526.24 235.61 529.07 243.91 534.73 248.37C539.68 252.28 548.45 254.23 561.05 254.23H597.65V267.51H560.09C548.53 267.51 540.31 269.11 535.45 272.29C529.31 276.28 526.24 283.7 526.24 294.54C526.24 305.38 528.15 313.48 531.98 318.1C536.21 323.28 543.7 325.87 554.47 325.87L597.65 325.99V338.79H554.71C527.44 338.79 513.8 325.71 513.8 299.56C513.8 289.27 514.48 281.9 515.83 277.43C517.98 270.09 522.61 264.55 529.71 260.8C519.11 254.98 513.8 244.73 513.8 230.06C513.8 219.77 514.04 213.04 514.52 209.85C517.63 191.51 531.03 182.34 554.71 182.34H597.65V195.14L554.47 195.26Z";

// 1. PURE VECTOR FAVICON SVG (Transparent background, high-contrast signature gradient + white accents)
// Perfect for browser tabs in light mode and dark mode
const pureFaviconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="480 150 960 780" width="100%" height="100%">
  <defs>
    <linearGradient id="neblinaGradient" x1="575" y1="935" x2="1287" y2="222" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#00DD9E"/>
      <stop offset="28%" stop-color="#001E4D"/>
      <stop offset="70%" stop-color="#00DD9E"/>
      <stop offset="100%" stop-color="#001E4D"/>
    </linearGradient>
    <filter id="tabDropShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#00DD9E" flood-opacity="0.30"/>
    </filter>
  </defs>
  
  <!-- Outer glow & pure vector logo -->
  <g filter="url(#tabDropShadow)">
    <path d="${nPath}" fill="url(#neblinaGradient)"/>
  </g>
  <g fill="#FFFFFF">
    <path d="${mPath}"/>
    <path d="${fPath}"/>
    <path d="${fivePath2}"/>
    <path d="${dotPath}"/>
    <path d="${fivePath1}"/>
    <path d="${zeroPath}"/>
    <path d="${onePath}"/>
  </g>
</svg>`;

// Write public/favicon.svg
fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon.svg'), pureFaviconSvg);
console.log('✅ Generated public/favicon.svg (pure vector, zero raster, crystal clear)');

// 2. MASTER APP ICON SVG (Full bleed Apple iOS & Android PWA canvas: #001E4D Royal Navy background, subtle #00DD9E ambient glow, pure vector logo centered)
const masterAppIconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background Gradient: Pure Neblina Midnight Navy -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#001026"/>
      <stop offset="40%" stop-color="#001438"/>
      <stop offset="100%" stop-color="#001E4D"/>
    </linearGradient>
    
    <!-- Ambient Cyan Radial Glow -->
    <radialGradient id="cyanGlow" cx="50%" cy="45%" r="55%">
      <stop offset="0%" stop-color="#00DD9E" stop-opacity="0.35"/>
      <stop offset="65%" stop-color="#00DD9E" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#00DD9E" stop-opacity="0"/>
    </radialGradient>

    <!-- Logo Signature Gradient -->
    <linearGradient id="logoGrad" x1="575" y1="935" x2="1287" y2="222" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#00DD9E"/>
      <stop offset="30%" stop-color="#001E4D"/>
      <stop offset="72%" stop-color="#00DD9E"/>
      <stop offset="100%" stop-color="#001E4D"/>
    </linearGradient>

    <filter id="logoShadow" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#000000" flood-opacity="0.6"/>
      <feDropShadow dx="0" dy="2" stdDeviation="6" flood-color="#00DD9E" flood-opacity="0.25"/>
    </filter>
  </defs>

  <!-- Full canvas fill (Square per Apple HIG - iOS clips it natively) -->
  <rect width="512" height="512" fill="url(#bgGrad)"/>
  <rect width="512" height="512" fill="url(#cyanGlow)"/>

  <!-- Centered Logo inside safe zone (scale ~0.38, offset centered) -->
  <g transform="translate(72, 86) scale(0.39)" filter="url(#logoShadow)">
    <!-- Move viewBox origin (480, 150) to (0, 0) -->
    <g transform="translate(-480, -150)">
      <path d="${nPath}" fill="url(#logoGrad)"/>
      <g fill="#FFFFFF">
        <path d="${mPath}"/>
        <path d="${fPath}"/>
        <path d="${fivePath2}"/>
        <path d="${dotPath}"/>
        <path d="${fivePath1}"/>
        <path d="${zeroPath}"/>
        <path d="${onePath}"/>
      </g>
    </g>
  </g>
</svg>`;

// Write master app icon svg
fs.writeFileSync(path.join(PUBLIC_DIR, 'icon-master.svg'), masterAppIconSvg);
console.log('✅ Generated public/icon-master.svg (master vector)');

// 3. RENDER ALL SIZES VIA SHARP
async function generateAll() {
  const masterBuffer = Buffer.from(masterAppIconSvg);
  const pureFaviconBuffer = Buffer.from(pureFaviconSvg);

  // A. Transparent high-res icon.png
  await sharp(pureFaviconBuffer)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(PUBLIC_DIR, 'icon.png'));
  console.log('✅ Generated public/icon.png (512x512 transparent)');

  // B. Apple Touch Icons (Filled square per Apple Human Interface Guidelines)
  await sharp(masterBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(PUBLIC_DIR, 'apple-touch-icon.png'));
  await sharp(masterBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(PUBLIC_DIR, 'apple-touch-icon-180x180.png'));
  await sharp(masterBuffer)
    .resize(152, 152)
    .png()
    .toFile(path.join(PUBLIC_DIR, 'apple-touch-icon-152x152.png'));
  await sharp(masterBuffer)
    .resize(120, 120)
    .png()
    .toFile(path.join(PUBLIC_DIR, 'apple-touch-icon-120x120.png'));
  console.log('✅ Generated public/apple-touch-icon.png (180x180, 152x152, 120x120)');

  // C. PWA Icons (Any & Maskable)
  await sharp(masterBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(PUBLIC_DIR, 'icon-192.png'));
  await sharp(masterBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(PUBLIC_DIR, 'icon-512.png'));
  await sharp(masterBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(PUBLIC_DIR, 'icon-maskable-192.png'));
  await sharp(masterBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(PUBLIC_DIR, 'icon-maskable-512.png'));
  console.log('✅ Generated PWA 192 & 512 (any + maskable)');

  // D. Favicon PNGs
  await sharp(pureFaviconBuffer)
    .resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(PUBLIC_DIR, 'favicon.png'));
  await sharp(pureFaviconBuffer)
    .resize(48, 48, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(PUBLIC_DIR, 'favicon-48x48.png'));
  await sharp(pureFaviconBuffer)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(PUBLIC_DIR, 'favicon-32x32.png'));
  await sharp(pureFaviconBuffer)
    .resize(16, 16, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(PUBLIC_DIR, 'favicon-16x16.png'));
  console.log('✅ Generated favicon-16, 32, 48, 64 PNGs');

  // E. Favicon ICO (Multi-frame 16, 32, 48)
  const png16 = await sharp(pureFaviconBuffer).resize(16, 16).png().toBuffer();
  const png32 = await sharp(pureFaviconBuffer).resize(32, 32).png().toBuffer();
  const png48 = await sharp(pureFaviconBuffer).resize(48, 48).png().toBuffer();

  const icoHeader = Buffer.alloc(6);
  icoHeader.writeUInt16LE(0, 0); // Reserved
  icoHeader.writeUInt16LE(1, 2); // Type 1 = ICO
  icoHeader.writeUInt16LE(3, 4); // 3 images

  const entries = [
    { width: 16, height: 16, buffer: png16 },
    { width: 32, height: 32, buffer: png32 },
    { width: 48, height: 48, buffer: png48 }
  ];

  let offset = 6 + (16 * 3);
  const dirBuffers = [];
  const imageBuffers = [];

  for (const entry of entries) {
    const dir = Buffer.alloc(16);
    dir.writeUInt8(entry.width === 256 ? 0 : entry.width, 0);
    dir.writeUInt8(entry.height === 256 ? 0 : entry.height, 1);
    dir.writeUInt8(0, 2); // Colors
    dir.writeUInt8(0, 3); // Reserved
    dir.writeUInt16LE(1, 4); // Color planes
    dir.writeUInt16LE(32, 6); // Bits per pixel
    dir.writeUInt32LE(entry.buffer.length, 8); // Image size in bytes
    dir.writeUInt32LE(offset, 12); // Offset

    dirBuffers.push(dir);
    imageBuffers.push(entry.buffer);
    offset += entry.buffer.length;
  }

  const icoBuffer = Buffer.concat([icoHeader, ...dirBuffers, ...imageBuffers]);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon.ico'), icoBuffer);
  console.log('✅ Generated public/favicon.ico (multi-resolution 16/32/48)');
}

generateAll().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
