import fs from 'fs';
import path from 'path';

const iconBuffer = fs.readFileSync('public/icon.png');
const base64Icon = iconBuffer.toString('base64');

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <!-- Fondo Gradiente Apple iOS: Midnight Cyan a Royal Navy -->
    <linearGradient id="iosBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06141e" />
      <stop offset="45%" stop-color="#071c28" />
      <stop offset="100%" stop-color="#090A3D" />
    </linearGradient>

    <!-- Resplandor Ambiental Radial Cyan (#21F8D2) -->
    <radialGradient id="cyanGlow" cx="50%" cy="42%" r="55%">
      <stop offset="0%" stop-color="#21F8D2" stop-opacity="0.35" />
      <stop offset="60%" stop-color="#20F7CE" stop-opacity="0.10" />
      <stop offset="100%" stop-color="#20F7CE" stop-opacity="0" />
    </radialGradient>

    <!-- Resplandor Acento Oro (#FEDC01) -->
    <radialGradient id="goldGlow" cx="80%" cy="80%" r="45%">
      <stop offset="0%" stop-color="#FEDC01" stop-opacity="0.16" />
      <stop offset="100%" stop-color="#FEDC01" stop-opacity="0" />
    </radialGradient>

    <!-- Borde Especular Biselado estilo Cristal Apple -->
    <linearGradient id="specularBorder" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55" />
      <stop offset="35%" stop-color="#21F8D2" stop-opacity="0.28" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.10" />
    </linearGradient>

    <!-- Filtro de Sombra Suave para el Isotipo -->
    <filter id="logoShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#000000" flood-opacity="0.45" />
    </filter>

    <!-- Clip Path Squircle Continuo Apple iOS (radio 22.5%) -->
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
      href="data:image/png;base64,${base64Icon}"
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
</svg>
`;

fs.writeFileSync('public/favicon.svg', svgContent, 'utf8');
fs.writeFileSync('src/assets/favicon.svg', svgContent, 'utf8');
console.log('[OK] Generated public/favicon.svg and src/assets/favicon.svg');
