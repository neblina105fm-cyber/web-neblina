import React, { memo } from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * AnimatedBackground - Fondo Dinámico Oficial con Aros Conic-Gradient & Luces Ambientales Apple
 * Optimizado con aceleración por GPU (Zero Frame Drop / 60-120 FPS) y pausas de scroll inteligentes.
 */
function AnimatedBackground() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div 
      className="background-animado fixed inset-0 w-screen h-screen z-0 pointer-events-none overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. Lienzo Base Adaptativo (--fondo-base) */}
      <div 
        className={`absolute inset-0 transition-colors duration-700 ${
          isDark 
            ? 'bg-[#001026]' 
            : 'bg-[#eef2f5]'
        }`}
      />

      {/* 2. Luces Ambientales Difusas Estilo Apple (Cero Costo de Pintado por GPU) */}
      <div 
        className={`absolute inset-0 transition-opacity duration-1000 ${
          isDark 
            ? 'bg-[radial-gradient(circle_at_85%_15%,rgba(0,221,158,0.15),transparent_55%),radial-gradient(circle_at_15%_80%,rgba(0,30,77,0.45),transparent_60%)]' 
            : 'bg-[radial-gradient(circle_at_85%_15%,rgba(0,221,158,0.12),transparent_55%),radial-gradient(circle_at_15%_80%,rgba(185,235,255,0.40),transparent_60%)]'
        }`}
      />

      {/* 3. ARO 1: Recorrido diagonal superior con rotación serena */}
      <div className="mover mover-1">
        <div className="aro" />
      </div>

      {/* 4. ARO 2: Recorrido diagonal inferior cruzado */}
      <div className="mover mover-2">
        <div className="aro" />
      </div>

      {/* 5. ARO 3: Aro temporal / fantasma central */}
      <div className="mover mover-3">
        <div className="aro" />
      </div>

      {/* 6. Velo sutil translúcido para integración óptica de capas */}
      <div 
        className={`absolute inset-0 transition-opacity duration-700 ${
          isDark 
            ? 'bg-gradient-to-b from-transparent via-[#001026]/10 to-[#001026]/30' 
            : 'bg-gradient-to-b from-transparent via-white/10 to-white/20'
        }`}
      />
    </div>
  );
}

export default memo(AnimatedBackground);
