import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { 
  X, 
  MapPin, 
  Phone, 
  Globe, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink, 
  Sparkles, 
  UtensilsCrossed,
  Share2,
  Check,
  Building2,
  Navigation
} from 'lucide-react';
import Emoji3D from './Emoji3D';

// Iconos vectoriales de redes
const InstagramIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const FacebookIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const TikTokIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
);

export default function SponsorDetailModal({ sponsor, onClose }) {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const autoSlideTimerRef = useRef(null);

  // Lista de fotos del marco
  const photos = React.useMemo(() => {
    if (!sponsor) return [];
    if (Array.isArray(sponsor.photos) && sponsor.photos.length > 0) {
      return sponsor.photos.filter(p => p && typeof p === 'string' && p.trim().length > 0);
    }
    // Si no tiene fotos explícitas, usar el logo o una foto por defecto
    if (sponsor.logo) return [sponsor.logo];
    return [];
  }, [sponsor]);

  // Rotación automática de fotos cada 3.5 segundos
  useEffect(() => {
    if (!sponsor || photos.length <= 1 || isPaused) return;

    autoSlideTimerRef.current = setInterval(() => {
      setActivePhotoIdx(prev => (prev + 1) % photos.length);
    }, 3500);

    return () => {
      if (autoSlideTimerRef.current) clearInterval(autoSlideTimerRef.current);
    };
  }, [sponsor, photos.length, isPaused]);

  // Reiniciar índice de fotos cuando cambia el sponsor
  useEffect(() => {
    setActivePhotoIdx(0);
  }, [sponsor?.id]);

  // Bloqueo de scroll controlado: se activa SOLO cuando el modal está abierto
  // y restaura siempre el scroll limpio en el cleanup
  useEffect(() => {
    if (!sponsor) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = (originalOverflow && originalOverflow !== 'hidden') ? originalOverflow : '';
    };
  }, [sponsor]);

  // Atajo de teclado Escape para cerrar
  useEffect(() => {
    if (!sponsor) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sponsor, onClose]);

  if (!sponsor) return null;

  const isRestaurant = sponsor.category && (
    sponsor.category.toLowerCase().includes('restaurante') ||
    sponsor.category.toLowerCase().includes('gastronom') ||
    sponsor.category.toLowerCase().includes('café') ||
    sponsor.category.toLowerCase().includes('comida')
  );

  const hasDigitalMenu = !!(sponsor.menuUrl && sponsor.menuUrl.trim());

  // Mensaje de WhatsApp
  const cleanPhone = (sponsor.whatsapp || '584247459774').replace(/[^0-9]/g, '');
  const contactMsg = encodeURIComponent(
    `¡Hola, ${sponsor.name}! Los encontré a través del Directorio de Aliados de Neblina Stereo 105.5 FM y quisiera consultar sobre sus servicios e información.`
  );
  const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${contactMsg}`;

  // Copiar enlace de ficha técnica
  const handleCopyLink = () => {
    const url = window.location.origin + window.location.pathname + `?aliado=${encodeURIComponent(sponsor.name)}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const nextPhoto = (e) => {
    e?.stopPropagation();
    setActivePhotoIdx(prev => (prev + 1) % photos.length);
  };

  const prevPhoto = (e) => {
    e?.stopPropagation();
    setActivePhotoIdx(prev => (prev - 1 + photos.length) % photos.length);
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 pt-3 sm:pt-4 pb-28 sm:pb-32 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sponsor-detail-title"
    >
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-[#001438] border border-slate-200/90 dark:border-white/15 rounded-2xl overflow-hidden flex flex-col shadow-lg transition-colors duration-300 my-auto max-h-[calc(100dvh-120px)] sm:max-h-[calc(100dvh-130px)]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* ================================================================= */}
        {/* CABECERA DE LA FICHA TÉCNICA */}
        {/* ================================================================= */}
        <div className="relative px-5 sm:px-7 pt-5 pb-4 border-b border-slate-100 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02] flex items-center justify-between gap-3">
          
          <div className="flex items-center space-x-3 min-w-0">
            {/* Logo / Emblema Cuadrado */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/15 bg-white dark:bg-black/30 flex-shrink-0 flex items-center justify-center p-1 shadow-sm">
              {sponsor.logo ? (
                <img 
                  src={sponsor.logo} 
                  alt={sponsor.name} 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                style={{ display: sponsor.logo ? 'none' : 'flex' }}
                className="w-full h-full rounded-xl bg-gradient-to-tr from-[#001E4D] to-[#00DD9E] text-white items-center justify-center font-black text-sm"
              >
                {sponsor.name.substring(0, 2).toUpperCase()}
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-lg text-[11px] font-black uppercase tracking-wider bg-[#00DD9E]/15 text-[#001E4D] dark:text-[#00DD9E] border border-[#00DD9E]/30">
                  <Sparkles className="w-3 h-3 text-[#00DD9E]" />
                  <span>{sponsor.category || 'Aliado Comercial'}</span>
                </span>
                {sponsor.rif && (
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    RIF: {sponsor.rif}
                  </span>
                )}
              </div>
              <h2 id="sponsor-detail-title" className="font-display font-black text-base sm:text-lg md:text-xl text-slate-900 dark:text-white truncate mt-0.5">
                {sponsor.name}
              </h2>
            </div>
          </div>

          {/* Botones Superiores: Copiar enlace & Cerrar */}
          <div className="flex items-center space-x-1.5 flex-shrink-0">
            <button
              onClick={handleCopyLink}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              title="Copiar enlace de esta ficha técnica"
              aria-label="Copiar enlace"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              aria-label="Cerrar ficha técnica"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* CUERPO CON SCROLL INTERNO DE LA FICHA */}
        {/* ================================================================= */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-6">

          {/* 1. MARCO DE FOTOS CON DESLIZAMIENTO AUTOMÁTICO */}
          {photos.length > 0 && (
            <div 
              className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-xl overflow-hidden border border-slate-200/90 dark:border-white/10 shadow-lg bg-slate-950 group select-none"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onTouchStart={() => setIsPaused(true)}
              onTouchEnd={() => setIsPaused(false)}
            >
              {/* Fotos */}
              {photos.map((photoUrl, idx) => (
                <div
                  key={idx}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    idx === activePhotoIdx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  <img
                    src={photoUrl}
                    alt={`${sponsor.name} - Foto ${idx + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Gradiente sutil inferior para legibilidad */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                </div>
              ))}

              {/* Botón Anterior */}
              {photos.length > 1 && (
                <button
                  onClick={prevPhoto}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center opacity-80 sm:opacity-0 group-hover:opacity-100 transition-all cursor-pointer border border-white/20"
                  aria-label="Foto anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}

              {/* Botón Siguiente */}
              {photos.length > 1 && (
                <button
                  onClick={nextPhoto}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center opacity-80 sm:opacity-0 group-hover:opacity-100 transition-all cursor-pointer border border-white/20"
                  aria-label="Foto siguiente"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {/* Indicadores de Puntos (Dots) */}
              {photos.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-md border border-white/10">
                  {photos.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      onClick={() => setActivePhotoIdx(dotIdx)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        dotIdx === activePhotoIdx 
                          ? 'w-5 bg-[#00DD9E]' 
                          : 'w-1.5 bg-white/50 hover:bg-white/80'
                      }`}
                      aria-label={`Ver foto ${dotIdx + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Badge Contador de Fotos */}
              {photos.length > 1 && (
                <div className="absolute top-3 right-3 z-20 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-[11px] font-bold text-white border border-white/15">
                  {activePhotoIdx + 1} / {photos.length}
                </div>
              )}
            </div>
          )}

          {/* 2. SLOGAN & DESCRIPCIÓN DEL ESTABLECIMIENTO */}
          <div className="space-y-2">
            {sponsor.slogan && (
              <p className="text-xs sm:text-sm font-bold text-[#00DD9E] flex items-center space-x-1.5">
                <span>“{sponsor.slogan}”</span>
              </p>
            )}

            <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed space-y-2">
              <p>
                {sponsor.description || 'Aliado comercial certificado y verificado por la directiva de Neblina Stereo 105.5 FM. Servicio con garantía de calidad y atención preferencial para nuestra audiencia en toda la región andina.'}
              </p>
            </div>
          </div>

          {/* 3. BOTÓN DESTACADO DE MENÚ DIGITAL (SI ES RESTAURANTE O TIENE MENÚ) */}
          {(hasDigitalMenu || isRestaurant) && (
            <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-[#001E4D] flex items-center justify-center flex-shrink-0 shadow-sm font-black">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                    {hasDigitalMenu ? 'Menú Digital Disponible' : 'Carta & Especialidades'}
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    {hasDigitalMenu 
                      ? 'Explora los platillos, precios y especialidades gastronómicas.'
                      : 'Solicita la carta y platillos del día vía WhatsApp oficial.'}
                  </p>
                </div>
              </div>

              {hasDigitalMenu ? (
                <a
                  href={sponsor.menuUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-[#001E4D] text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer flex-shrink-0"
                >
                  <UtensilsCrossed className="w-4 h-4" />
                  <span>Ver Menú Digital</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <a
                  href={`${waUrl}&text=${encodeURIComponent(`¡Hola, ${sponsor.name}! Deseo consultar su menú y platillos disponibles.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold transition cursor-pointer flex-shrink-0"
                >
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  <span>Pedir Menú</span>
                </a>
              )}
            </div>
          )}

          {/* 4. SECCIÓN DE UBICACIÓN & CÓMO LLEGAR */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-rose-500" />
                <h4 className="font-display font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                  Ubicación & Referencias
                </h4>
              </div>

              {/* Botón Google Maps */}
              {sponsor.googleMapsUrl && (
                <a
                  href={sponsor.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-[11px] font-bold transition shadow-xs cursor-pointer active:scale-95"
                >
                  <Navigation className="w-3 h-3" />
                  <span>Abrir en Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Dirección principal */}
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-start space-x-1.5">
              <span>{sponsor.location || 'Santo Domingo, Estado Mérida, Venezuela'}</span>
            </p>

            {/* Breve descripción de la ubicación / Puntos de referencia */}
            {sponsor.locationDetails && (
              <div className="p-3 rounded-xl bg-white dark:bg-black/30 border border-slate-200 dark:border-white/5 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                <span className="font-black text-slate-700 dark:text-slate-200 block uppercase tracking-wider text-[11px]">
                  Punto de Referencia:
                </span>
                <p className="leading-relaxed">
                  {sponsor.locationDetails}
                </p>
              </div>
            )}
          </div>

          {/* 5. BOTONERA DE CONTACTO Y REDES SOCIALES */}
          <div className="space-y-3 pt-1">
            <h4 className="font-display font-black text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Canales Directos de Atención
            </h4>

            {/* Fila Primaria: WhatsApp y Llamada Telefónica */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                <Emoji3D name="whatsapp" className="w-4.5 h-4.5 flex-shrink-0" alt="WhatsApp" />
                <span>Contactar por WhatsApp</span>
              </a>

              {sponsor.phone ? (
                <a
                  href={`tel:${sponsor.phone.replace(/[^0-9+]/g, '')}`}
                  className="flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 active:scale-95 text-slate-900 dark:text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-blue-500" />
                  <span>Llamar: {sponsor.phone}</span>
                </a>
              ) : (
                <div className="flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-400 text-xs font-semibold">
                  <Building2 className="w-4 h-4" />
                  <span>Atención en Horario Comercial</span>
                </div>
              )}
            </div>

            {/* Fila Secundaria: Redes Sociales y Sitio Web */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {sponsor.instagram && (
                <a
                  href={`https://instagram.com/${sponsor.instagram.replace('@', '').trim()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 py-2 px-3 rounded-xl bg-pink-500/10 hover:bg-pink-500 hover:text-white text-pink-600 dark:text-pink-400 text-xs font-bold transition border border-pink-500/20 cursor-pointer"
                >
                  <InstagramIcon className="w-3.5 h-3.5" />
                  <span>{sponsor.instagram}</span>
                </a>
              )}

              {sponsor.facebook && (
                <a
                  href={sponsor.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 py-2 px-3 rounded-xl bg-blue-600/10 hover:bg-blue-600 hover:text-white text-blue-600 dark:text-blue-400 text-xs font-bold transition border border-blue-600/20 cursor-pointer"
                >
                  <FacebookIcon className="w-3.5 h-3.5" />
                  <span>Facebook</span>
                </a>
              )}

              {sponsor.tiktok && (
                <a
                  href={sponsor.tiktok.startsWith('http') ? sponsor.tiktok : `https://tiktok.com/@${sponsor.tiktok.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 py-2 px-3 rounded-xl bg-slate-200/80 dark:bg-white/10 hover:bg-black hover:text-white text-slate-800 dark:text-white text-xs font-bold transition cursor-pointer"
                >
                  <TikTokIcon className="w-3.5 h-3.5" />
                  <span>TikTok</span>
                </a>
              )}

              {sponsor.web && (
                <a
                  href={sponsor.web}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-800 dark:text-white text-xs font-bold transition cursor-pointer ml-auto"
                >
                  <Globe className="w-3.5 h-3.5 text-[#00DD9E]" />
                  <span>Sitio Web Oficial</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}
            </div>

          </div>

          {/* Sello de Autenticidad */}
          <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center space-x-1">
              <Emoji3D name="shield" className="w-3.5 h-3.5" alt="Verificado" />
              <span>Patrocinante Oficial · Neblina Stereo 105.5 FM</span>
            </span>
            <span>Santo Domingo - Mérida</span>
          </div>

        </div>

      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? ReactDOM.createPortal(modalContent, document.body)
    : modalContent;
}
