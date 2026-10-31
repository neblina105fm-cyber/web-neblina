import React, { useState, useEffect } from 'react';
import Emoji3D from './Emoji3D';
import { 
  getActiveBannersForPlacement, 
  recordBannerView, 
  recordBannerClick 
} from '../services/adBannerService';

export default function AdCarousel({ variant = 'header', placement = 'all', excludeId = null }) {
  const [banners, setBanners] = useState(() => getActiveBannersForPlacement(placement, excludeId));
  const [current, setCurrent] = useState(() => (
    variant === 'news-mid' ? 1 : variant === 'news' ? 2 : 0
  ));
  const [activeSubAssetIndex, setActiveSubAssetIndex] = useState(0);

  // Escuchar cambios en la base de datos de banners
  useEffect(() => {
    const handleUpdate = () => {
      const updated = getActiveBannersForPlacement(placement, excludeId);
      setBanners(updated);
    };

    window.addEventListener('neblina_banners_updated', handleUpdate);
    return () => window.removeEventListener('neblina_banners_updated', handleUpdate);
  }, [placement, excludeId]);

  // Rotación principal entre banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const intervalMs = variant === 'news-mid' ? 9000 : 7000;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % banners.length);
      setActiveSubAssetIndex(0); // Reiniciar sub-recurso al cambiar de banner
    }, intervalMs);
    return () => clearInterval(timer);
  }, [banners.length, variant]);

  const activeIndex = current % (banners.length || 1);
  const ad = banners[activeIndex] || banners[0];

  // Rotación interna si el banner tiene múltiples imágenes (1 a 5 imágenes)
  useEffect(() => {
    if (!ad?.images || ad.images.length <= 1) return;
    const subTimer = setInterval(() => {
      setActiveSubAssetIndex(prev => (prev + 1) % ad.images.length);
    }, 4000);
    return () => clearInterval(subTimer);
  }, [ad?.id, ad?.images?.length]);

  // Registrar visualización (impresión) del banner activo
  useEffect(() => {
    if (ad?.id) {
      recordBannerView(ad.id);
      // Notificar banner activo para evitar colisiones entre el inicio y las notas de prensa
      if (typeof window !== 'undefined') {
        if (variant === 'header') {
          window.__activeHomeBannerId = ad.id;
        } else if (variant === 'news-mid') {
          window.__activeNewsMidBannerId = ad.id;
        }
      }
    }
  }, [ad?.id, variant]);

  if (!ad) return null;

  const handleCtaClick = () => {
    if (ad.id) {
      recordBannerClick(ad.id);
    }
  };

  // Determinar video o imagen activa
  const activeVideo = ad.videos && ad.videos.length > 0 ? ad.videos[activeSubAssetIndex % ad.videos.length] : null;
  const activeImage = ad.images && ad.images.length > 0 ? ad.images[activeSubAssetIndex % ad.images.length] : null;
  const hasMultipleImages = (ad.images?.length || 0) > 1;

  // Ajustes de estilo según variante (no invasivo para mitad de nota de prensa)
  const isMidNews = variant === 'news-mid';

  return (
    <div className={`w-full select-none bg-transparent ${isMidNews ? 'my-5 sm:my-6 not-prose' : variant === 'news' ? 'my-4' : ''}`}>
      <div 
        className={`relative overflow-hidden aeroglass-card transition-all duration-500 group ${
          isMidNews 
            ? 'rounded-2xl border border-slate-200/90 dark:border-white/10 px-3.5 sm:px-4 py-2.5 shadow-xs' 
            : 'rounded-2xl px-3.5 sm:px-5 py-3'
        }`}
      >
        
        {/* Renderizado de Fondo con Video (MP4/WebM) si está configurado en videos o mediaUrl */}
        {(ad.type === 'video' || ad.videos?.length > 0) && (activeVideo?.videoUrl || ad.mediaUrl) ? (
          <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
            <video 
              key={activeVideo?.videoUrl || ad.mediaUrl}
              src={activeVideo?.videoUrl || ad.mediaUrl}
              autoPlay
              loop
              muted
              playsInline
              className={`w-full h-full object-cover filter saturate-150 transition-opacity duration-700 ${
                isMidNews ? 'opacity-20 dark:opacity-25' : 'opacity-35 dark:opacity-40'
              }`}
            />
            <div className={`absolute inset-0 ${
              isMidNews
                ? 'bg-gradient-to-r from-white/95 via-white/85 to-white/95 dark:from-[#001E4D]/95 dark:via-[#001E4D]/90 dark:to-[#001E4D]/95'
                : 'bg-gradient-to-r from-white/90 via-white/70 to-white/90 dark:from-[#001E4D]/95 dark:via-[#001E4D]/80 dark:to-[#001E4D]/95'
            }`} />
          </div>
        ) : null}

        {/* Renderizado de Fondo con Imagen Responsive (Desktop vs Móvil) de Alta Fidelidad */}
        {((ad.type === 'image' || ad.type === 'mixed') || (!ad.videos?.length && ad.mediaUrl)) && (activeImage?.desktopUrl || activeImage?.mobileUrl || ad.mediaUrl) ? (
          <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
            <picture className="w-full h-full block">
              {activeImage?.mobileUrl && (
                <source media="(max-width: 640px)" srcSet={activeImage.mobileUrl} />
              )}
              <img 
                src={activeImage?.desktopUrl || activeImage?.mobileUrl || ad.mediaUrl}
                alt={activeImage?.caption || ad.title}
                className={`w-full h-full object-cover filter saturate-125 transition-opacity duration-700 ${
                  isMidNews ? 'opacity-15 dark:opacity-20' : 'opacity-25 dark:opacity-30'
                }`}
                loading="lazy"
              />
            </picture>
            <div className={`absolute inset-0 ${
              isMidNews
                ? 'bg-gradient-to-r from-white/95 via-white/88 to-white/95 dark:from-[#001E4D]/95 dark:via-[#001E4D]/90 dark:to-[#001E4D]/95'
                : 'bg-gradient-to-r from-white/95 via-white/75 to-white/95 dark:from-[#001E4D]/95 dark:via-[#001E4D]/85 dark:to-[#001E4D]/95'
            }`} />
          </div>
        ) : null}

        {/* Glow sutil difuminado oficial */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#00DD9E]/10 rounded-full blur-2xl pointer-events-none z-[1]" />

        {/* Contenido del Banner */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left">
          
          <div className="flex items-center space-x-3 min-w-0">
            <Emoji3D 
              name="megaphone" 
              className={`object-contain flex-shrink-0 ${
                isMidNews 
                  ? 'w-7 h-7 sm:w-8 sm:h-8 drop-shadow-sm' 
                  : 'w-8 h-8 sm:w-9 sm:h-9 drop-shadow-sm transition-transform group-hover:-translate-y-0.5'
              }`} 
              alt="Publicidad" 
            />

            <div className="min-w-0">
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <span className={`font-black uppercase tracking-wider text-[#00DD9E] ${
                  isMidNews ? 'text-[11px]' : 'text-[11px]'
                }`}>
                  {ad.badge || (isMidNews ? 'Pauta Comercial' : 'Pauta Publicitaria')}
                </span>

                {ad.clientName ? (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-slate-900/10 dark:bg-white/10 text-slate-700 dark:text-slate-300 hidden md:inline truncate">
                    {ad.clientName}
                  </span>
                ) : null}

                {ad.subtitle ? (
                  <span className="text-xs text-slate-500 dark:text-slate-300 hidden lg:inline truncate">
                    • {ad.subtitle}
                  </span>
                ) : null}
              </div>

              <h4 className={`font-display font-extrabold text-slate-900 dark:text-white truncate ${
                isMidNews ? 'text-xs sm:text-[13px] leading-snug' : 'text-xs sm:text-sm'
              }`}>
                {ad.title}
              </h4>

              {/* Sub-indicador de foto/video rotativo si tiene múltiples imágenes */}
              {hasMultipleImages && (
                <div className="flex items-center justify-center sm:justify-start space-x-1.5 mt-0.5">
                  <span className="text-[11px] font-mono font-bold text-slate-400">
                    Foto {(activeSubAssetIndex % ad.images.length) + 1} de {ad.images.length}
                    {activeImage?.caption ? ` • ${activeImage.caption}` : ''}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2.5 flex-shrink-0">
            {/* Indicadores de rotación entre diferentes anuncios */}
            {banners.length > 1 ? (
              <div className="hidden lg:flex items-center space-x-1.5 mr-1">
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrent(idx);
                      setActiveSubAssetIndex(0);
                    }}
                    className={`transition-all rounded-full cursor-pointer ${
                      activeIndex === idx ? 'w-4 h-1.5 bg-[#00DD9E]' : 'w-1.5 h-1.5 bg-slate-300 dark:bg-white/20'
                    }`}
                    aria-label={`Anuncio ${idx + 1}`}
                  />
                ))}
              </div>
            ) : null}

            {/* Botón interactivo oficial con área segura en el cuadrante derecho */}
            <a
              href={ad.ctaLink || ad.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleCtaClick}
              className={`inline-flex items-center space-x-1.5 rounded-xl bg-[#00DD9E] text-[#001E4D] font-bold transition shadow-sm hover:brightness-105 active:scale-95 duration-200 cursor-pointer whitespace-nowrap border border-white/50 ${
                isMidNews ? 'px-3 py-1.5 text-xs' : 'px-3.5 sm:px-4 py-2 text-xs'
              }`}
            >
              <span>{ad.ctaText || ad.cta || 'Contactar'}</span>
              <Emoji3D name="whatsapp" className={isMidNews ? "w-3 h-3" : "w-3.5 h-3.5"} alt="WhatsApp" />
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
