const fs = require('fs');

console.log('--- OPTIMIZANDO AUDIO BUFFER PARA STREAMING EN TIEMPO REAL ULTRA BAJA LATENCIA ---');

const file = 'src/context/AudioPlayerContext.jsx';
let c = fs.readFileSync(file, 'utf8');

// 1. Modificar inicialización del elemento de audio (preload = 'none' para streams en vivo)
c = c.replace(
  "audio.preload = 'auto';",
  "audio.preload = 'none';"
);

// 2. Función helper para obtener URL con cache-buster fresco
const freshStreamHelper = `
  // Genera URL de streaming en vivo con query param para conectar en el instante presente (Live Edge)
  const getLiveStreamUrl = (serverKey) => {
    const baseUrl = STREAM_CONFIG[serverKey]?.url || STREAM_CONFIG.primary.url;
    // Agrega timestamp único para saltar buffers HTTP / proxy caches intermedios
    const delimiter = baseUrl.includes('?') ? '&' : '?';
    return \`\${baseUrl}\${delimiter}_t=\${Date.now()}\`;
  };
`;

if (!c.includes('getLiveStreamUrl')) {
  c = c.replace(
    '// Función unificada de conmutación de servidor de streaming',
    freshStreamHelper + '\n  // Función unificada de conmutación de servidor de streaming'
  );
}

// 3. Modificar switchToStream para usar fresh URL
c = c.replace(
  'audio.src = targetConfig.url;',
  'audio.src = getLiveStreamUrl(serverKey);'
);

// 4. Modificar playLiveStream para usar fresh URL y forzar carga al borde en vivo
const oldPlayLive = `    const currentKey = internalStreamServerRef.current;
    const targetUrl = STREAM_CONFIG[currentKey]?.url || STREAM_CONFIG.primary.url;
    
    if (audio.src !== targetUrl) {
      audio.src = targetUrl;
    }

    const playPromise = audio.play();`;

const newPlayLive = `    const currentKey = internalStreamServerRef.current;
    const freshLiveUrl = getLiveStreamUrl(currentKey);
    
    // Siempre refrescar src al borde en vivo presente para evitar reproducir audio almacenado previamente en buffer
    try {
      audio.pause();
      audio.src = freshLiveUrl;
      audio.load();
    } catch(e) {}

    const playPromise = audio.play();`;

c = c.replace(oldPlayLive, newPlayLive);

// 5. Agregar watchdog de sincronización en tiempo real (Catch-up / Sincronización en vivo sutil)
// Cada 60 segundos, si el buffered end supera a currentTime por más de 6 segundos, hacer un micro salto al borde
const catchUpSnippet = `
    // Monitor de retardo de buffer: Si la conexión del cliente acumuló mucho buffer viejo (>5s de atraso),
    // resincronizar suavemente con el borde en vivo para estar lo más actualizado posible.
    const onProgress = () => {
      if (playbackTypeRef.current !== 'live' || !isPlayingRef.current || !audio) return;
      try {
        if (audio.buffered && audio.buffered.length > 0) {
          const liveEdge = audio.buffered.end(audio.buffered.length - 1);
          const lag = liveEdge - audio.currentTime;
          // Si el desfase acumulado en buffer supera los 5.5 segundos, saltar discretamente al borde vivo
          if (lag > 5.5 && isFinite(liveEdge)) {
            audio.currentTime = liveEdge - 0.5;
          }
        }
      } catch (e) {}
    };

    audio.addEventListener('progress', onProgress);
`;

if (!c.includes('onProgress')) {
  c = c.replace(
    "audio.addEventListener('loadedmetadata', onLoadedMetadata);",
    "audio.addEventListener('loadedmetadata', onLoadedMetadata);\n" + catchUpSnippet
  );
  
  c = c.replace(
    "audio.removeEventListener('loadedmetadata', onLoadedMetadata);",
    "audio.removeEventListener('loadedmetadata', onLoadedMetadata);\n      audio.removeEventListener('progress', onProgress);"
  );
}

fs.writeFileSync(file, c, 'utf8');
console.log('✓ AudioPlayerContext optimizado con Ultra-Low Latency Live Buffer.');
