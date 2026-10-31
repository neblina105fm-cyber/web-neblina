const fs = require('fs');

console.log('--- ENRIQUECIENDO SISTEMA DE MOVIMIENTO Y ANIMACIONES SUTILES (DESIGN MOTION PRINCIPLES) ---');

const file = 'src/index.css';
let c = fs.readFileSync(file, 'utf8');

const motionTokens = `
/* ========================================================================= */
/* MOTION DESIGN SYSTEM: APPLE FLUID SPRINGS & HYPNOTIC AMBIENT POLISH      */
/* Inspirado en Emil Kowalski (rapidez/propósito), Jakub Krehel (refinamiento) */
/* y Jhey Tompkins (delight sutil en micro-interacciones)                    */
/* ========================================================================= */

:root {
  /* Curvas de Aceleración y Resortes Físicos Apple */
  --ease-spring-snappy: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-spring-smooth: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-spring-bouncy: cubic-bezier(0.34, 1.35, 0.64, 1);
  --ease-ambient-drift: cubic-bezier(0.45, 0.05, 0.55, 0.95);
  
  --dur-micro: 180ms;
  --dur-card: 260ms;
  --dur-modal: 320ms;
}

/* 1. Pulsación Hipnótica Suave del Indicador 'EN VIVO' (Sin Parpadeo Brusco) */
@keyframes liveAuraBreathe {
  0%, 100% {
    transform: scale(1);
    opacity: 0.9;
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.45);
  }
  50% {
    transform: scale(1.04);
    opacity: 1;
    box-shadow: 0 0 0 5px rgba(239, 68, 68, 0);
  }
}

.anim-live-breathe {
  animation: liveAuraBreathe 2.8s var(--ease-ambient-drift) infinite;
  will-change: transform, box-shadow;
}

/* 2. Resplandor Ambiental Hipnótico en la Barra del Reproductor (AeroGlass Glow) */
@keyframes playerGlowDrift {
  0%, 100% {
    border-color: rgba(255, 255, 255, 0.25);
    box-shadow: 0 -12px 40px rgba(0, 30, 77, 0.18), inset 0 1px 2px rgba(255, 255, 255, 0.85);
  }
  50% {
    border-color: rgba(0, 221, 158, 0.45);
    box-shadow: 0 -16px 48px rgba(0, 221, 158, 0.12), inset 0 1px 2px rgba(255, 255, 255, 0.95);
  }
}

html.dark .player-glow-drift {
  animation: playerGlowDriftDark 6s ease-in-out infinite alternate;
}

@keyframes playerGlowDriftDark {
  0% {
    border-top-color: rgba(255, 255, 255, 0.20);
    box-shadow: 0 -14px 48px rgba(0, 0, 0, 0.75), inset 0 1px 1.5px rgba(255, 255, 255, 0.22);
  }
  100% {
    border-top-color: rgba(0, 221, 158, 0.40);
    box-shadow: 0 -18px 52px rgba(0, 221, 158, 0.14), inset 0 1px 1.5px rgba(0, 221, 158, 0.35);
  }
}

/* 3. Entrada Suave y Flotante para Tarjetas y Elementos Dinámicos */
@keyframes cardFloatIn {
  0% {
    opacity: 0;
    transform: translateY(10px) scale(0.99);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.anim-card-enter {
  animation: cardFloatIn var(--dur-card) var(--ease-spring-snappy) forwards;
  will-change: transform, opacity;
}

/* 4. Efecto Shimmer Metálico Sutil para Botones Principales */
@keyframes subtleShimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.shimmer-hover {
  position: relative;
  overflow: hidden;
}

.shimmer-hover::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg, 
    transparent 0%, 
    rgba(255, 255, 255, 0.18) 50%, 
    transparent 100%
  );
  background-size: 200% 100%;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.shimmer-hover:hover::after {
  opacity: 1;
  animation: subtleShimmer 1.8s ease-in-out infinite;
}

/* 5. Micro-Interacciones en Botones y Píldoras Táctiles */
.btn-spring-press {
  transition: transform var(--dur-micro) var(--ease-spring-snappy), 
              filter var(--dur-micro) ease;
}

.btn-spring-press:active {
  transform: scale(0.96) translate3d(0, 0, 0);
  filter: brightness(0.95);
}

/* 6. Carátula de Canción Rotatoria con Pulso Eased (Estilo Vinilo en Reproducción) */
@keyframes vinylBreathe {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.025);
  }
}

.anim-vinyl-playing {
  animation: vinylBreathe 3.4s var(--ease-ambient-drift) infinite;
  will-change: transform;
}

/* Respeto Obligatorio a Preferencias de Movimiento Reducido */
@media (prefers-reduced-motion: reduce) {
  .anim-live-breathe,
  .player-glow-drift,
  .anim-card-enter,
  .shimmer-hover::after,
  .anim-vinyl-playing {
    animation: none !important;
    transition: none !important;
  }
}
`;

if (!c.includes('liveAuraBreathe')) {
  c += '\n' + motionTokens;
  fs.writeFileSync(file, c, 'utf8');
  console.log('✓ Tokens y animaciones sutiles agregados a index.css.');
} else {
  console.log('• index.css ya contenía tokens de movimiento.');
}
