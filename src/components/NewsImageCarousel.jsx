import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

/**
 * NewsImageCarousel - Carrusel de 1 a 3 fotografías para notas de prensa
 * Si tiene 1 foto, se muestra fija en alta definición.
 * Si tiene 2 o 3 fotos, corre un carrusel interactivo y automático con controles, indicadores y contador.
 */
export default function NewsImageCarousel({ 
  images = [], 
  fallbackImage = '', 
  alt = 'Fotografía de la nota de prensa',
  className = 'h-64 sm:h-80 md:h-96',
  aspectRatio = '',
  autoPlay = true,
  autoPlayInterval = 5000 
}) {
  // Normalizar lista de imágenes: soportar array de strings o string único
  const normalizedImages = Array.isArray(images) && images.length > 0
    ? images.filter(img => typeof img === 'string' && img.trim().length > 0)
    : (fallbackImage && typeof fallbackImage === 'string' && fallbackImage.trim().length > 0 ? [fallbackImage.trim()] : []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const total = normalizedImages.length;

  // Auto-rotación si hay más de 1 imagen y no está pausado por hover
  useEffect(() => {
    if (!autoPlay || total <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [total, autoPlay, autoPlayInterval, isHovered]);

  // Si no hay ninguna imagen, mostrar placeholder oficial
  if (total === 0) {
    return (
      <div className={`relative w-full overflow-hidden rounded-2xl bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center ${className}`}>
        <img 
          src="https://neblina105fm.com/wp-content/uploads/2026/10/Neblina-2026-10-4.png" 
          alt={alt}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Si solo hay 1 imagen, renderizar foto estática sin controles innecesarios
  if (total === 1) {
    return (
      <div className={`relative w-full overflow-hidden rounded-2xl bg-black border border-slate-200 dark:border-white/10 ${className}`}>
        <img 
          src={normalizedImages[0]} 
          alt={alt}
          decoding="async"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = 'https://neblina105fm.com/wp-content/uploads/2026/10/Neblina-2026-10-4.png';
          }}
        />
      </div>
    );
  }

  // Carrusel para 2 o 3 imágenes
  const prevSlide = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const nextSlide = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  return (
    <div 
      className={`relative w-full overflow-hidden rounded-2xl bg-black border border-slate-200 dark:border-white/10 group select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Contenedor de Diapositivas */}
      <div className="relative w-full h-full">
        {normalizedImages.map((imgSrc, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img 
              src={imgSrc} 
              alt={`${alt} - Foto ${idx + 1} de ${total}`}
              decoding="async"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://neblina105fm.com/wp-content/uploads/2026/10/Neblina-2026-10-4.png';
              }}
            />
          </div>
        ))}
      </div>

      {/* Insignia de Contador de Fotografías (Ej: 📷 1 / 3) */}
      <div className="absolute top-3 right-3 z-20 flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold shadow-md">
        <ImageIcon className="w-3.5 h-3.5 text-[#00DD9E]" />
        <span>{currentIndex + 1} / {total}</span>
      </div>

      {/* Flechas de Navegación (Izquierda / Derecha) - Siempre visibles y operativas */}
      <button
        onClick={prevSlide}
        aria-label="Foto anterior"
        className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md text-white flex items-center justify-center transition opacity-90 hover:opacity-100 shadow-lg cursor-pointer border border-white/20 active:scale-95"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Foto siguiente"
        className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md text-white flex items-center justify-center transition opacity-90 hover:opacity-100 shadow-lg cursor-pointer border border-white/20 active:scale-95"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Indicadores de Puntos (Dots) en la parte inferior */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-md border border-white/15">
        {normalizedImages.map((_, idx) => (
          <button
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(idx);
            }}
            aria-label={`Ir a foto ${idx + 1}`}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              idx === currentIndex 
                ? 'w-6 h-2 bg-[#00DD9E] shadow-sm shadow-[#00DD9E]/50' 
                : 'w-2 h-2 bg-white/60 hover:bg-white'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
