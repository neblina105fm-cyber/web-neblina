import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { 
  Play, 
  ExternalLink, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ChevronUp, 
  ChevronDown, 
  Share2, 
  Check 
} from 'lucide-react';
import { STATION_INFO } from '../services/api';
import Emoji3D from './Emoji3D';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { DEFAULT_SHORTS, fetchLatestYouTubeShorts } from '../services/youtubeService';

const YouTubeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export default function YouTubeShortsSection() {
  const [shorts, setShorts] = useState(DEFAULT_SHORTS);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [slideDirection, setSlideDirection] = useState(null); // 'up' | 'down' | null
  const [copiedId, setCopiedId] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const { isPlaying, pauseStream } = useAudioPlayer();

  // Detección de ítems visibles: 4 en Computadoras de Mesa (>=1024px), 2 en Móviles (<1024px)
  const [itemsPerView, setItemsPerView] = useState(() => {
    if (typeof window === 'undefined') return 4;
    return window.innerWidth >= 1024 ? 4 : 2;
  });

  const [currentCarouselPage, setCurrentCarouselPage] = useState(0);

  // Referencias para interacción táctil y rueda del ratón
  const carouselTouchStartX = useRef(0);
  const carouselTouchStartY = useRef(0);
  const modalTouchStartY = useRef(0);
  const modalTouchStartX = useRef(0);
  const lastWheelTime = useRef(0);
  const autoPlayTimerRef = useRef(null);

  // Sincronización responsiva de items visibles
  useEffect(() => {
    const handleResize = () => {
      const newItemsPerView = window.innerWidth >= 1024 ? 4 : 2;
      setItemsPerView(newItemsPerView);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Carga y sincronización dinámica con el canal oficial de YouTube (@neblina105fm)
  useEffect(() => {
    let isMounted = true;

    const loadShorts = async () => {
      const latest = await fetchLatestYouTubeShorts();
      if (isMounted && Array.isArray(latest) && latest.length > 0) {
        // Asegurar que siempre contenga hasta los últimos 12 shorts
        setShorts(latest.slice(0, 12));
      }
    };

    loadShorts();

    const interval = setInterval(loadShorts, 15 * 60 * 1000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Total de páginas en la ventana corrediza del carrusel
  const totalPages = Math.max(1, Math.ceil(shorts.length / itemsPerView));

  // Ajustar página si cambia el tamaño de pantalla
  useEffect(() => {
    if (currentCarouselPage >= totalPages) {
      setCurrentCarouselPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, currentCarouselPage]);

  // Autoplay del carrusel (cada 5.5 segundos cuando no está en pausa)
  useEffect(() => {
    if (totalPages <= 1 || isPaused || selectedIndex !== null) return;

    autoPlayTimerRef.current = setInterval(() => {
      setCurrentCarouselPage((prev) => (prev + 1) % totalPages);
    }, 5500);

    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [totalPages, isPaused, selectedIndex]);

  // Navegación manual del carrusel en la página
  const prevCarouselSlide = () => {
    setCurrentCarouselPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const nextCarouselSlide = () => {
    setCurrentCarouselPage((prev) => (prev + 1) % totalPages);
  };

  // Gestos táctiles en el carrusel de la página
  const handleCarouselTouchStart = (e) => {
    setIsPaused(true);
    carouselTouchStartX.current = e.touches[0].clientX;
    carouselTouchStartY.current = e.touches[0].clientY;
  };

  const handleCarouselTouchEnd = (e) => {
    setIsPaused(false);
    const deltaX = e.changedTouches[0].clientX - carouselTouchStartX.current;
    const deltaY = e.changedTouches[0].clientY - carouselTouchStartY.current;

    // Solo reaccionar si es un deslizamiento horizontal intencional
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        nextCarouselSlide();
      } else {
        prevCarouselSlide();
      }
    }
  };

  // =========================================================================
  // CONTROL DEL REPRODUCTOR MODAL VERTICAL ESTILO TIKTOK / INSTAGRAM REELS
  // =========================================================================
  const handleOpenShort = (index) => {
    setSelectedIndex(index);
    setSlideDirection(null);
    if (isPlaying && pauseStream) {
      pauseStream();
    }
  };

  const handleClose = () => {
    setSelectedIndex(null);
    setSlideDirection(null);
  };

  // Cambio vertical al siguiente Short (Scroll hacia abajo de TikTok / Reels)
  const goToNextShort = () => {
    setSlideDirection('up');
    setSelectedIndex((prev) => (prev + 1) % shorts.length);
  };

  // Cambio vertical al Short anterior (Scroll hacia arriba de TikTok / Reels)
  const goToPrevShort = () => {
    setSlideDirection('down');
    setSelectedIndex((prev) => (prev - 1 + shorts.length) % shorts.length);
  };

  // Escucha de rueda del mouse (Scroll de escritorio vertical como TikTok/Shorts)
  useEffect(() => {
    if (selectedIndex === null) return;

    const handleWheel = (e) => {
      // Prevenir el scroll predeterminado de la página mientras el visor vertical está activo
      e.preventDefault();
      const now = Date.now();
      if (now - lastWheelTime.current < 450) return; // Debounce suave

      if (e.deltaY > 25) {
        lastWheelTime.current = now;
        goToNextShort();
      } else if (e.deltaY < -25) {
        lastWheelTime.current = now;
        goToPrevShort();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [selectedIndex, shorts.length]);

  // Atajos de teclado en el visor vertical
  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        goToNextShort();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        goToPrevShort();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, shorts.length]);

  // Bloqueo de scroll del body cuando el visor vertical de shorts está abierto
  useEffect(() => {
    if (selectedIndex === null) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = (originalOverflow && originalOverflow !== 'hidden') ? originalOverflow : '';
    };
  }, [selectedIndex]);

  // Gestos táctiles verticales en el visor de Shorts (Swipe Up / Swipe Down)
  const handleModalTouchStart = (e) => {
    modalTouchStartY.current = e.touches[0].clientY;
    modalTouchStartX.current = e.touches[0].clientX;
  };

  const handleModalTouchEnd = (e) => {
    const deltaY = e.changedTouches[0].clientY - modalTouchStartY.current;
    const deltaX = e.changedTouches[0].clientX - modalTouchStartX.current;

    // Estricto gesto vertical (TikTok / Reels / Shorts: deslizar hacia arriba = siguiente)
    if (Math.abs(deltaY) > 40 && Math.abs(deltaY) > Math.abs(deltaX)) {
      if (deltaY < 0) {
        // Deslizó hacia arriba -> Siguiente Short
        goToNextShort();
      } else {
        // Deslizó hacia abajo -> Short anterior
        goToPrevShort();
      }
    }
  };

  // Función para compartir en redes sociales
  const handleShare = (platform, short, e) => {
    if (e) e.stopPropagation();
    const shortUrl = short.url || `https://www.youtube.com/shorts/${short.id}`;
    const text = `${short.title} - Neblina Stereo 105.5 FM`;

    if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + '\n' + shortUrl)}`, '_blank', 'noopener,noreferrer');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shortUrl)}`, '_blank', 'noopener,noreferrer');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shortUrl)}`, '_blank', 'noopener,noreferrer');
    } else if (platform === 'copy') {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shortUrl);
        setCopiedId(short.id);
        setTimeout(() => setCopiedId(null), 2200);
      }
    }
  };

  const activeShort = selectedIndex !== null ? shorts[selectedIndex] : null;

  return (
    <section className="py-4 select-none bg-transparent">
      {/* ========================================================================= */}
      {/* ENCABEZADO CON CONTROLES DEL CARRUSEL (VENTANA CORREDIZA)                 */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center space-x-3">
          <Emoji3D 
            name="youtube" 
            className="w-8 h-8 sm:w-9 sm:h-9 drop-shadow-md hover:scale-110 transition-transform flex-shrink-0" 
            alt="YouTube Shorts" 
          />
          <div>
            <h3 className="font-display font-black text-base sm:text-lg text-slate-900 dark:text-white flex items-center space-x-2">
              <span>Shorts Neblina</span>
              <span className="text-[11px] font-black text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded-lg border border-red-500/20 backdrop-blur-md">
                @neblina105fm
              </span>
            </h3>
          </div>
        </div>

        {/* Controles de Navegación del Carrusel y Enlace al Canal */}
        <div className="flex items-center space-x-2">
          <a
            href={STATION_INFO.youtubeShorts}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center space-x-1 text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition mr-2"
          >
            <span>Ver canal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Flecha Anterior */}
          <button
            onClick={prevCarouselSlide}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-200/80 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-slate-800 dark:text-white flex items-center justify-center border border-slate-300/80 dark:border-white/10 transition active:scale-95 cursor-pointer backdrop-blur-md shadow-xs"
            aria-label="Shorts anteriores"
            title="Shorts anteriores"
          >
            <ChevronLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>

          {/* Flecha Siguiente */}
          <button
            onClick={nextCarouselSlide}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-200/80 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-slate-800 dark:text-white flex items-center justify-center border border-slate-300/80 dark:border-white/10 transition active:scale-95 cursor-pointer backdrop-blur-md shadow-xs"
            aria-label="Siguientes shorts"
            title="Siguientes shorts"
          >
            <ChevronRight className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VENTANA CORREDIZA DEL CARRUSEL (4 EN ESCRITORIO, 2 EN MÓVIL)             */}
      {/* ========================================================================= */}
      <div 
        className="relative overflow-hidden rounded-2xl p-0.5"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleCarouselTouchStart}
        onTouchEnd={handleCarouselTouchEnd}
      >
        {/* Pista Deslizante Suave (Track) */}
        <div 
          className="flex transition-transform duration-700 ease-out -mx-1.5 sm:-mx-2"
          style={{
            transform: `translateX(-${currentCarouselPage * 100}%)`
          }}
        >
          {shorts.map((short, idx) => (
            <div
              key={short.id}
              className="flex-shrink-0 px-1.5 sm:px-2 w-1/2 lg:w-1/4"
            >
              <div
                onClick={() => handleOpenShort(idx)}
                className="group relative rounded-xl overflow-hidden bg-slate-950 shadow-md hover:shadow-lg hover:scale-[1.025] transition-all duration-300 aspect-[9/16] flex flex-col justify-between p-3 sm:p-3.5 cursor-pointer border border-white/5 dark:border-white/10"
                title={`${short.title} (Clic para reproducir en sobreventana)`}
              >
                {/* 1. Miniatura Vertical de Alta Definición (Sin pantalla negra que oscurezca la imagen) */}
                <div className="absolute inset-0">
                  <img
                    src={`https://i.ytimg.com/vi/${short.id}/oar2.jpg`}
                    alt={short.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      if (!e.target.dataset.triedMaxres) {
                        e.target.dataset.triedMaxres = 'true';
                        e.target.src = `https://i.ytimg.com/vi/${short.id}/maxresdefault.jpg`;
                      } else if (!e.target.dataset.triedHq) {
                        e.target.dataset.triedHq = 'true';
                        e.target.src = `https://i.ytimg.com/vi/${short.id}/hqdefault.jpg`;
                      }
                    }}
                  />
                  {/* Degradado leve únicamente en la parte inferior para lectura de letras y botones de compartir */}
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/75 via-black/30 to-transparent pointer-events-none" />
                </div>

                {/* 2. Etiqueta Superior de Short */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-lg bg-red-600/85 backdrop-blur-md border border-white/25 text-white text-[11px] font-black uppercase tracking-wider flex items-center space-x-1 shadow-xs">
                    <YouTubeIcon className="w-2.5 h-2.5" />
                    <span>Short</span>
                  </span>
                  <span className="text-[11px] font-bold text-white bg-black/35 border border-white/20 px-1.5 py-0.5 rounded-lg backdrop-blur-md">
                    #{idx + 1}
                  </span>
                </div>

                {/* 3. Botón Central de Play */}
                <div className="relative z-10 self-center my-auto">
                  <div 
                    className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-red-600/95 group-hover:bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-950/50 transform group-hover:scale-115 active:scale-95 transition-all duration-300 border border-white/35"
                    aria-label="Reproducir Short"
                  >
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>

                {/* 4. Bloque Inferior: Título + Acciones en Aero Glass Líquido */}
                <div className="relative z-10 space-y-2">
                  <p className="font-display font-bold text-xs text-white line-clamp-2 leading-snug group-hover:text-red-200 transition-colors drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]">
                    {short.title}
                  </p>

                  <div 
                    className="flex items-center justify-between pt-1.5 border-t border-white/20"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-[11px] text-white/90 font-semibold tracking-wide drop-shadow-xs">
                      Compartir:
                    </span>

                    <div className="flex items-center space-x-1 sm:space-x-1.5">
                      <button
                        onClick={(e) => handleShare('whatsapp', short, e)}
                        className="w-7 h-7 rounded-lg bg-white/20 hover:bg-[#25D366]/85 backdrop-blur-xl border border-white/35 hover:border-white/60 text-white flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.25)] hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
                        title="Compartir en WhatsApp"
                        aria-label="Compartir en WhatsApp"
                      >
                        <svg className="w-3.5 h-3.5 fill-current drop-shadow-xs" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.625.846 5.059 2.284 7.033l-1.494 5.462 5.606-1.471c1.916 1.246 4.197 1.976 6.604 1.976 6.627 0 12-5.373 12-12s-5.373-12-12-12z"/>
                        </svg>
                      </button>

                      <button
                        onClick={(e) => handleShare('facebook', short, e)}
                        className="w-7 h-7 rounded-lg bg-white/20 hover:bg-[#1877F2]/85 backdrop-blur-xl border border-white/35 hover:border-white/60 text-white flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.25)] hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
                        title="Compartir en Facebook"
                        aria-label="Compartir en Facebook"
                      >
                        <svg className="w-3.5 h-3.5 fill-current drop-shadow-xs" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
                        </svg>
                      </button>

                      <button
                        onClick={(e) => handleShare('twitter', short, e)}
                        className="w-7 h-7 rounded-lg bg-white/20 hover:bg-black/85 backdrop-blur-xl border border-white/35 hover:border-white/60 text-white flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.25)] hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
                        title="Compartir en X"
                        aria-label="Compartir en X"
                      >
                        <svg className="w-3 h-3 fill-current drop-shadow-xs" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </button>

                      <button
                        onClick={(e) => handleShare('copy', short, e)}
                        className="w-7 h-7 rounded-lg bg-white/20 hover:bg-[#00DD9E] backdrop-blur-xl border border-white/35 hover:border-[#00DD9E] text-white hover:text-[#001E4D] flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.25)] hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
                        title={copiedId === short.id ? "¡Enlace copiado!" : "Copiar enlace del Short"}
                        aria-label="Copiar enlace"
                      >
                        {copiedId === short.id ? (
                          <Check className="w-3.5 h-3.5 text-[#00DD9E] stroke-[2.5]" />
                        ) : (
                          <Share2 className="w-3.5 h-3.5 stroke-[2.2]" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Indicadores de Paginación del Carrusel (Estilo Apple / NewsCarousel) */}
      <div className="flex items-center justify-center space-x-2 mt-3 pt-1">
        {Array.from({ length: totalPages }).map((_, pIdx) => (
          <button
            key={pIdx}
            onClick={() => setCurrentCarouselPage(pIdx)}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              currentCarouselPage === pIdx
                ? 'w-7 sm:w-8 h-2 bg-red-600 dark:bg-red-500 shadow-xs'
                : 'w-2 h-2 bg-slate-300 dark:bg-white/25 hover:bg-slate-400 dark:hover:bg-white/50'
            }`}
            aria-label={`Ir a la ventana ${pIdx + 1}`}
            title={`Ventana ${pIdx + 1}`}
          />
        ))}
      </div>

      {/* ========================================================================= */}
      {/* SOBREVENTANA MODAL VERTICAL ESTILO TIKTOK / INSTAGRAM REELS               */}
      {/* CAMBIO EXCLUSIVAMENTE CON SCROLL VERTICAL (ARRIBA / ABAJO)                */}
      {/* Con área segura inferior (pb-28 sm:pb-32) para no chocar con el reproductor */}
      {/* ========================================================================= */}
      {activeShort && typeof document !== 'undefined' && ReactDOM.createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 pt-2 sm:pt-4 pb-28 sm:pb-32 bg-slate-950/40 dark:bg-black/50 backdrop-blur-md overflow-hidden animate-in fade-in duration-200 select-none"
          onClick={handleClose}
          onTouchStart={handleModalTouchStart}
          onTouchEnd={handleModalTouchEnd}
        >
          {/* Contenedor Principal: Centro el video y a la derecha la barra de control vertical */}
          <div 
            className="relative flex items-center justify-center w-full max-w-sm sm:max-w-md mx-auto my-auto px-1 sm:px-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tarjeta del Short con Animación Vertical (Estilo TikTok / Reels) */}
            <div 
              key={`${activeShort.id}-${slideDirection || 'initial'}`}
              className={`relative flex-1 aspect-[9/16] max-h-[68vh] sm:max-h-[74vh] bg-black rounded-2xl overflow-hidden border border-white/15 shadow-lg flex flex-col transition-all duration-300 ${
                slideDirection === 'up'
                  ? 'animate-in slide-in-from-bottom-12 duration-300'
                  : slideDirection === 'down'
                  ? 'animate-in slide-in-from-top-12 duration-300'
                  : 'animate-in zoom-in-95 duration-200'
              }`}
            >
              {/* Cabecera Superior Transparente con Información y Botón Cerrar */}
              <div className="flex items-center justify-between p-3.5 bg-gradient-to-b from-black/90 via-black/50 to-transparent absolute top-0 inset-x-0 z-30 text-white">
                <div className="flex items-center space-x-2 truncate pr-2">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse flex-shrink-0" />
                  <span className="font-bold text-xs truncate max-w-[210px] sm:max-w-[240px]">
                    {activeShort.title}
                  </span>
                </div>

                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full bg-black/60 hover:bg-white/20 text-white flex items-center justify-center border border-white/20 backdrop-blur-md transition flex-shrink-0 cursor-pointer shadow-md"
                  title="Cerrar reproductor"
                  aria-label="Cerrar reproductor"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* IFRAME Embebido con Autoplay y Control Táctil */}
              <div className="relative w-full h-full bg-black">
                <iframe
                  key={activeShort.id}
                  src={`https://www.youtube-nocookie.com/embed/${activeShort.id}?autoplay=1&playsinline=1&modestbranding=1&rel=0&iv_load_policy=3&enablejsapi=1`}
                  title={activeShort.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>

              {/* Pie Inferior del Reproductor */}
              <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex items-center justify-between text-xs text-white border-t border-white/10 z-20">
                <div className="flex items-center space-x-2">
                  <span className="text-red-500 font-extrabold uppercase text-[11px] bg-red-500/20 px-2 py-0.5 rounded-lg border border-red-500/30">
                    Short
                  </span>
                  <span className="text-slate-300 text-[11px] font-semibold">
                    {selectedIndex + 1} de {shorts.length}
                  </span>
                </div>

                <a
                  href={activeShort.url || `https://www.youtube.com/shorts/${activeShort.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-red-600/30 hover:bg-red-600/40 text-red-300 text-[11px] font-bold flex items-center space-x-1 border border-red-500/30 backdrop-blur-xs transition"
                  title="Abrir en YouTube"
                >
                  <span>YouTube</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* ===================================================================== */}
            {/* COLUMNA VERTICAL DE NAVEGACIÓN Y ACCIONES (ESTILO TIKTOK / REELS)    */}
            {/* Ubicada flotante a la derecha del video tanto en móvil como escritorio */}
            {/* ===================================================================== */}
            <div className="flex flex-col items-center space-y-2.5 ml-2.5 sm:ml-4 z-30">
              
              {/* Botón Vertical ARRIBA: Short Anterior (Swipe Down / Scroll Up) */}
              <button
                onClick={goToPrevShort}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-xl border border-white/20 transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-xl group"
                title="Short anterior (Deslizar arriba / Rueda arriba)"
                aria-label="Short anterior"
              >
                <ChevronUp className="w-6 h-6 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              {/* Indicador de posición vertical */}
              <div className="text-[11px] font-black text-white/90 bg-black/60 px-2 py-1 rounded-lg border border-white/20 backdrop-blur-md">
                {selectedIndex + 1}/{shorts.length}
              </div>

              {/* Botón Vertical ABAJO: Siguiente Short (Swipe Up / Scroll Down) */}
              <button
                onClick={goToNextShort}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-xl border border-white/20 transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-xl group"
                title="Siguiente short (Deslizar abajo / Rueda abajo)"
                aria-label="Siguiente short"
              >
                <ChevronDown className="w-6 h-6 group-hover:translate-y-0.5 transition-transform" />
              </button>

              {/* Separador sutil */}
              <div className="w-6 h-px bg-white/20 my-1" />

              {/* Botones de Compartir Verticales (Efecto Aero Glass Líquido) */}
              <button
                onClick={(e) => handleShare('whatsapp', activeShort, e)}
                className="w-10 h-10 rounded-full bg-white/15 hover:bg-[#25D366]/85 text-white flex items-center justify-center backdrop-blur-xl border border-white/30 hover:border-white/60 transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-lg"
                title="Compartir en WhatsApp"
                aria-label="Compartir en WhatsApp"
              >
                <svg className="w-4.5 h-4.5 fill-current drop-shadow-xs" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.625.846 5.059 2.284 7.033l-1.494 5.462 5.606-1.471c1.916 1.246 4.197 1.976 6.604 1.976 6.627 0 12-5.373 12-12s-5.373-12-12-12z"/>
                </svg>
              </button>

              <button
                onClick={(e) => handleShare('facebook', activeShort, e)}
                className="w-10 h-10 rounded-full bg-white/15 hover:bg-[#1877F2]/85 text-white flex items-center justify-center backdrop-blur-xl border border-white/30 hover:border-white/60 transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-lg"
                title="Compartir en Facebook"
                aria-label="Compartir en Facebook"
              >
                <svg className="w-4.5 h-4.5 fill-current drop-shadow-xs" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
                </svg>
              </button>

              <button
                onClick={(e) => handleShare('twitter', activeShort, e)}
                className="w-10 h-10 rounded-full bg-white/15 hover:bg-black/85 text-white flex items-center justify-center backdrop-blur-xl border border-white/30 hover:border-white/60 transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-lg"
                title="Compartir en X"
                aria-label="Compartir en X"
              >
                <svg className="w-4 h-4 fill-current drop-shadow-xs" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </button>

              <button
                onClick={(e) => handleShare('copy', activeShort, e)}
                className="w-10 h-10 rounded-full bg-white/15 hover:bg-[#00DD9E] text-white hover:text-[#001E4D] flex items-center justify-center backdrop-blur-xl border border-white/30 hover:border-[#00DD9E] transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-lg"
                title={copiedId === activeShort.id ? "¡Enlace copiado!" : "Copiar enlace del Short"}
                aria-label="Copiar enlace"
              >
                {copiedId === activeShort.id ? (
                  <Check className="w-4 h-4 text-[#00DD9E]" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
              </button>

            </div>
          </div>


        </div>,
        document.body
      )}
    </section>
  );
}