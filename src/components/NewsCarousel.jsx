import React, { useState, useEffect, useRef } from 'react';
import { Newspaper, ChevronLeft, ChevronRight, Calendar, ArrowRight } from 'lucide-react';
import { fetchWordPressNews } from '../services/api';
import { getCombinedNews, getCarouselNews } from '../services/newsData';
import NewsModal from './NewsModal';

export default function NewsCarousel() {
  const [news, setNews] = useState(() => getCarouselNews(getCombinedNews(), 9));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const timerRef = useRef(null);

  const loadLatestNews = async () => {
    try {
      const wpData = await fetchWordPressNews(1, 9);
      const combined = getCombinedNews(wpData);
      const carousel9 = getCarouselNews(combined, 9);
      if (carousel9 && carousel9.length > 0) {
        setNews(carousel9);
      }
    } catch (err) {
      console.warn('Error loading carousel news:', err);
      const fallback = getCarouselNews(getCombinedNews([]), 9);
      if (fallback.length > 0) setNews(fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLatestNews();
    const refreshInterval = setInterval(loadLatestNews, 60000);

    const handleNewsUpdate = () => {
      loadLatestNews();
    };
    window.addEventListener('neblina_news_updated', handleNewsUpdate);

    return () => {
      clearInterval(refreshInterval);
      window.removeEventListener('neblina_news_updated', handleNewsUpdate);
    };
  }, []);

  useEffect(() => {
    if (news.length <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % news.length);
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [news.length, isPaused]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + news.length) % news.length);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % news.length);
  };

  if (loading) {
    return (
      <div className="w-full h-80 sm:h-96 rounded-2xl glass-card border border-neblina-border animate-pulse flex items-center justify-center my-6">
        <div className="text-center text-slate-500">
          <Newspaper className="w-10 h-10 mx-auto mb-2 " />
          <p className="text-xs">Cargando las últimas noticias de neblina105fm.com...</p>
        </div>
      </div>
    );
  }

  if (news.length === 0) return null;

  const currentPost = news[currentIndex];

  return (
    <div 
      className="relative w-full my-6 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Encabezado del Carrusel */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 inline-block shadow-xs"></span>
          <h3 className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-white flex items-center space-x-2">
            <span>Última hora</span>
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">• 9 notas destacadas</span>
          </h3>
        </div>

        {/* Controles de navegación */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={prevSlide}
            className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 dark:bg-neblina-card dark:hover:bg-white/10 text-slate-800 dark:text-white flex items-center justify-center border border-slate-300 dark:border-white/10 transition"
            aria-label="Noticia anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={nextSlide}
            className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 dark:bg-neblina-card dark:hover:bg-white/10 text-slate-800 dark:text-white flex items-center justify-center border border-slate-300 dark:border-white/10 transition"
            aria-label="Siguiente noticia"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Ventana Corrediza / Slider Card con radio Apple de 28px */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 dark:border-white/10 shadow-lg h-80 sm:h-96 group">
        
        {/* Imagen de Fondo de la Noticia con Fade Suave Apple */}
        <div key={`img-${currentPost.id}`} className="absolute inset-0 anim-tab-enter">
          <img
            src={currentPost.image}
            alt={currentPost.title}
            width="1200"
            height="600"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:-translate-y-0.5"
            onError={(e) => { 
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/default-cover.png'; 
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent"></div>
        </div>

        {/* Contenido de la Noticia con Animación de Entrada Fluida */}
        <div key={`content-${currentPost.id}`} className="relative z-10 h-full p-6 sm:p-10 flex flex-col justify-end anim-tab-enter">
          
          <div className="max-w-3xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider bg-[#001E4D]/65 backdrop-blur-xl text-[#00DD9E] border border-[#00DD9E]/45 shadow-[0_4px_14px_rgba(0,0,0,0.3)]">
                {currentPost.category}
              </span>
              <span className="flex items-center space-x-1 text-xs text-slate-200 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                <Calendar className="w-3 h-3 text-[#00DD9E]" />
                <span>{currentPost.date}</span>
              </span>
            </div>

            <h2
              onClick={() => setSelectedPost(currentPost)}
              className="font-display font-black text-xl sm:text-2xl md:text-3xl text-white hover:text-[#00DD9E] transition cursor-pointer leading-tight line-clamp-2"
              dangerouslySetInnerHTML={{ __html: currentPost.title }}
            />

            <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 leading-relaxed max-w-2xl">
              {currentPost.excerpt}
            </p>

            <div className="pt-1">
              <button
                onClick={() => setSelectedPost(currentPost)}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/15 hover:bg-white/25 text-white font-bold text-xs backdrop-blur-md border border-white/20 transition hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Leer Noticia Completa</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* Indicadores de bolitas (Dots) */}
        <div className="absolute bottom-4 right-6 z-20 flex items-center space-x-2">
          {news.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                currentIndex === idx
                  ? 'w-7 h-2 bg-[#00DD9E]'
                  : 'w-2 h-2 bg-white/30 hover:bg-white/60'
              }`}
              aria-label={`Ir a noticia ${idx + 1}`}
            />
          ))}
        </div>

      </div>

      {/* Modal Lector de Noticia con Botones para Compartir */}
      {selectedPost && <NewsModal post={selectedPost} onClose={() => setSelectedPost(null)} />}

    </div>
  );
}
