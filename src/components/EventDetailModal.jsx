import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Share2, 
  Check, 
  ExternalLink, 
  Sparkles, 
  Ticket, 
  User, 
  Phone,
  Radio,
  Navigation
} from 'lucide-react';
import Emoji3D from './Emoji3D';

export default function EventDetailModal({ event, onClose }) {
  const [copied, setCopied] = useState(false);

  // Bloqueo controlado de scroll del fondo (body) mientras el modal esté abierto
  useEffect(() => {
    if (!event) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = (originalOverflow && originalOverflow !== 'hidden') ? originalOverflow : '';
    };
  }, [event]);

  // Atajo de teclado Escape para cerrar
  useEffect(() => {
    if (!event) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [event, onClose]);

  if (!event) return null;

  const handleShare = async (e) => {
    e.stopPropagation();
    const currentUrl = window.location.href;
    const shareData = {
      title: event.title,
      text: `${event.title} • ${event.dateDisplay || event.date} en ${event.location}. ¡Cartelera oficial de Neblina Stereo 105.5 FM!`,
      url: currentUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const coordinatorWaUrl = event.coordinatorWhatsApp
    ? `https://wa.me/${event.coordinatorWhatsApp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
        `¡Hola! Vi el evento "${event.title}" en Neblina Stereo 105.5 FM y deseo información detallada / comprar entradas.`
      )}`
    : null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 pt-3 sm:pt-4 pb-28 sm:pb-32 bg-slate-950/70 dark:bg-black/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-detail-title"
    >
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-[#001438] border border-slate-200/90 dark:border-white/15 rounded-2xl overflow-hidden flex flex-col shadow-lg transition-colors duration-300 my-auto max-h-[calc(100dvh-120px)] sm:max-h-[calc(100dvh-130px)]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* ================================================================= */}
        {/* CABECERA DE LA FICHA TÉCNICA DEL EVENTO */}
        {/* ================================================================= */}
        <div className="relative px-4 sm:px-7 pt-4 sm:pt-5 pb-3.5 sm:pb-4 border-b border-slate-100 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02] flex items-center justify-between gap-2 sm:gap-3">
          
          <div className="flex items-center space-x-1.5 sm:space-x-2.5 min-w-0 flex-1">
            <span className="inline-flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider bg-[#00DD9E]/15 text-[#001E4D] dark:text-[#00DD9E] border border-[#00DD9E]/30 min-w-0">
              <Sparkles className="w-3 h-3 text-[#00DD9E] flex-shrink-0" />
              <span className="truncate max-w-[140px] sm:max-w-xs">{event.category || 'Evento Regional'}</span>
            </span>

            <span className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex-shrink-0">
              <Ticket className="w-3 h-3" />
              <span>{event.isFree ? 'Entrada Libre' : (event.admissionPrice || 'Con Boleto')}</span>
            </span>
          </div>

          {/* Botones de acción rápida: Compartir & Cerrar */}
          <div className="flex items-center space-x-1.5 flex-shrink-0">
            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
              title="Compartir evento"
              aria-label="Compartir evento"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
              aria-label="Cerrar ficha de evento"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* CUERPO CON SCROLL INTERNO */}
        {/* ================================================================= */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-5">

          {/* 1. Flyer Oficial del Evento */}
          {event.flyer && (
            <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-xl overflow-hidden border border-slate-200/90 dark:border-white/10 shadow-lg bg-slate-950 group select-none">
              <img 
                src={event.flyer} 
                alt={event.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />
              
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 font-bold text-[11px] text-[#00DD9E]">
                  Cartelera Oficial
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 font-mono text-[11px] text-slate-300">
                  Santo Domingo · Mérida
                </span>
              </div>
            </div>
          )}

          {/* 2. Título Principal */}
          <div>
            <div className="flex sm:hidden items-center space-x-2 mb-2">
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-lg text-[11px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                <Ticket className="w-3 h-3" />
                <span>{event.isFree ? 'Entrada Libre' : (event.admissionPrice || 'Con Boleto')}</span>
              </span>
            </div>
            <h2 id="event-detail-title" className="font-display font-black text-xl sm:text-2xl md:text-3xl text-slate-900 dark:text-white tracking-tight leading-tight">
              {event.title}
            </h2>
          </div>

          {/* 3. Ficha Clave de Datos: Fecha, Horario y Ubicación */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 text-xs">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-[#00DD9E] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="block font-bold text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider">Fecha del Evento</span>
                <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                  {event.dateDisplay || event.date}
                </span>
              </div>
            </div>

            {event.time && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-[#FEDC01] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-bold text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider">Horario de Actividades</span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                    {event.time}
                  </span>
                </div>
              </div>
            )}

            <div className="sm:col-span-2 flex items-start space-x-3 pt-2 border-t border-slate-200/60 dark:border-white/5">
              <div className="w-8 h-8 rounded-xl bg-red-500/15 text-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="block font-bold text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider">Lugar & Dirección</span>
                <p className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm mt-0.5 leading-snug">
                  {event.location}
                </p>
                {event.googleMapsUrl && (
                  <a
                    href={event.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-600 dark:text-[#00DD9E] hover:underline mt-1 cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Abrir ubicación en Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* 4. Descripción Completa */}
          {event.description && (
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Detalles y Descripción del Evento
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line font-medium bg-slate-50/60 dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-200/60 dark:border-white/5">
                {event.description}
              </p>
            </div>
          )}

          {/* 5. Coordinador y Organización */}
          {(event.coordinatorName || coordinatorWaUrl) && (
            <div className="p-4 rounded-2xl aeroglass-subcard border border-white/20 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center space-x-1">
                  <User className="w-3.5 h-3.5" />
                  <span>Coordinación & Información Oficial</span>
                </p>
                <p className="font-extrabold text-slate-900 dark:text-white text-sm mt-0.5 truncate">
                  {event.coordinatorName || 'Comité Organizador'}
                </p>
                {event.coordinatorPhone && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 font-mono">
                    Tel: {event.coordinatorPhone}
                  </p>
                )}
              </div>

              {coordinatorWaUrl && (
                <a
                  href={coordinatorWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer flex-shrink-0"
                >
                  <Emoji3D name="whatsapp" className="w-4 h-4 flex-shrink-0" alt="WhatsApp" />
                  <span>Contactar Coordinador</span>
                </a>
              )}
            </div>
          )}

          {/* 6. Enlaces Oficiales (Boletería / Sitio Web) */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {event.eventUrl && (
              <a
                href={event.eventUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 text-xs font-bold transition shadow-sm cursor-pointer"
              >
                <span>Sitio Web / Boletería Oficial</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {event.googleMapsUrl && (
              <a
                href={event.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-800 dark:text-white text-xs font-bold transition cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                <span>Cómo Llegar (GPS)</span>
              </a>
            )}

            <button
              onClick={onClose}
              className="ml-auto px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
            >
              Cerrar
            </button>
          </div>

        </div>

        {/* Sello de Autenticidad en el Pie */}
        <div className="px-5 sm:px-7 py-3 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center space-x-1.5">
            <Radio className="w-3.5 h-3.5 text-[#00DD9E]" />
            <span>Cartelera Oficial · Neblina Stereo 105.5 FM</span>
          </span>
          <span>Santo Domingo - Mérida</span>
        </div>

      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? ReactDOM.createPortal(modalContent, document.body)
    : modalContent;
}
