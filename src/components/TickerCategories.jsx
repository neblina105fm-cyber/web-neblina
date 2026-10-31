import React, { useRef, useState } from 'react';

/**
 * TickerCategories
 * Carrusel continuo estilo teleprómpter que rueda automáticamente
 * con duplicación infinita sin saltos y pausa suave al posar el cursor o interactuar.
 */
export default function TickerCategories({ 
  items = [], 
  selectedId, 
  onSelect,
  renderIcon,
  speed = 30 // segundos por ciclo
}) {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef(null);

  if (!items || items.length === 0) return null;

  // Duplicamos los elementos tres veces para lograr el bucle infinito del teleprómpter continuo
  const duplicatedItems = [...items, ...items, ...items];

  return (
    <div 
      className="relative w-full overflow-hidden py-1 group select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setTimeout(() => setIsHovered(false), 2000)}
    >
      {/* Máscara de desvanecimiento suave en los bordes */}
      <div className="absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none bg-gradient-to-r from-[#eef2f5] dark:from-[#001438] to-transparent" />
      <div className="absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none bg-gradient-to-l from-[#eef2f5] dark:from-[#001438] to-transparent" />

      {/* Contenedor animado */}
      <div 
        ref={containerRef}
        className="flex items-center space-x-2 w-max animate-ticker"
        style={{
          animationDuration: `${speed}s`,
          animationPlayState: isHovered ? 'paused' : 'running'
        }}
      >
        {duplicatedItems.map((cat, idx) => {
          const rawId = typeof cat === 'string' ? cat : cat.id;
          const label = typeof cat === 'string' ? cat : (cat.name || cat.label || '');
          const count = typeof cat === 'object' ? cat.count : undefined;
          const isSelected = selectedId === rawId;

          return (
            <button
              key={`${rawId}-${idx}`}
              type="button"
              onClick={() => onSelect(rawId)}
              className={`shrink-0 flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-colors cursor-pointer border ${
                isSelected
                  ? 'bg-[#001E4D] text-[#00DD9E] dark:bg-[#00DD9E] dark:text-[#001E4D] border-[#001E4D] dark:border-[#00DD9E]'
                  : 'bg-white dark:bg-[#001E4D]/40 text-slate-700 dark:text-slate-300 hover:text-[#001E4D] dark:hover:text-[#00DD9E] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
              }`}
            >
              {renderIcon && renderIcon(cat)}
              <span>{label}</span>
              {count !== undefined && (
                <span className={`text-[11px] px-1.5 py-0.2 rounded-md font-bold ${
                  isSelected 
                    ? 'bg-white/20 text-[#00DD9E] dark:bg-[#001E4D]/20 dark:text-[#001E4D]' 
                    : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
