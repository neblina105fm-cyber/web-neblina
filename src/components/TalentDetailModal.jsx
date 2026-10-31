import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { 
  X, 
  Radio, 
  Clock, 
  Share2, 
  Check, 
  Sparkles, 
  ExternalLink,
  Volume2
} from 'lucide-react';
import Emoji3D from './Emoji3D';

// Icono Instagram
const InstagramIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

// Icono Facebook
const FacebookIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

// Icono X / Twitter
const XTwitterIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

export default function TalentDetailModal({ talent, onClose }) {
  const [copied, setCopied] = useState(false);

  // Bloqueo controlado de scroll del fondo (body) mientras el modal esté abierto
  useEffect(() => {
    if (!talent) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = (originalOverflow && originalOverflow !== 'hidden') ? originalOverflow : '';
    };
  }, [talent]);

  // Atajo de teclado Escape para cerrar
  useEffect(() => {
    if (!talent) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [talent, onClose]);

  if (!talent) return null;

  // Detección de formato PNG o imagen con recorte transparente
  const isPng = Boolean(
    talent.isTransparentPng ||
    talent.isPng ||
    talent.transparent ||
    (talent.photo && (
      /\.png($|\?)/i.test(talent.photo) ||
      talent.photo.includes('format=png') ||
      talent.photo.startsWith('data:image/png')
    ))
  );

  const handleShare = async (e) => {
    e.stopPropagation();
    const currentUrl = window.location.href;
    const shareData = {
      title: `${talent.name} • Neblina Stereo 105.5 FM`,
      text: `Conoce a ${talent.name}, conductor(a) de "${talent.showName}" en Neblina Stereo 105.5 FM.`,
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

  const talentWaUrl = talent.socialLinks?.whatsapp
    ? `https://wa.me/${talent.socialLinks.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
        `Hola ${talent.name}, te escucho a través de Neblina Stereo 105.5 FM en tu programa "${talent.showName}". Un saludo cordial desde el Páramo.`
      )}`
    : `https://api.whatsapp.com/send?phone=584247459774&text=${encodeURIComponent(
        `Hola cabina de Neblina Stereo 105.5 FM. Un saludo cordial para ${talent.name} en "${talent.showName}".`
      )}`;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 pt-3 sm:pt-4 pb-28 sm:pb-32 bg-slate-950/70 dark:bg-black/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="talent-detail-name"
    >
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-[#001438] border border-slate-200/90 dark:border-white/15 rounded-2xl overflow-hidden flex flex-col shadow-lg transition-colors duration-300 my-auto max-h-[calc(100dvh-120px)] sm:max-h-[calc(100dvh-130px)]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* ================================================================= */}
        {/* CABECERA DE LA FICHA DEL LOCUTOR */}
        {/* ================================================================= */}
        <div className="relative px-5 sm:px-7 pt-5 pb-4 border-b border-slate-100 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02] flex items-center justify-between gap-3">
          
          <div className="flex items-center space-x-1.5 sm:space-x-2.5 min-w-0 flex-1">
            <span className="inline-flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider bg-[#00DD9E]/15 text-[#001E4D] dark:text-[#00DD9E] border border-[#00DD9E]/30 min-w-0">
              <Emoji3D name="microphone" className="w-3.5 h-3.5 flex-shrink-0" alt="Mic" />
              <span className="truncate max-w-[130px] sm:max-w-none">Staff Oficial · 105.5 FM</span>
            </span>

            {talent.featuredInHome && (
              <span className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-[#FEDC01] border border-amber-500/25 flex-shrink-0">
                <Sparkles className="w-3 h-3" />
                <span>Destacado</span>
              </span>
            )}
          </div>

          {/* Botones de acción rápida: Compartir & Cerrar */}
          <div className="flex items-center space-x-1.5 flex-shrink-0">
            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
              title="Compartir perfil"
              aria-label="Compartir perfil de locutor"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
              aria-label="Cerrar perfil de locutor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* CUERPO DEL MODAL CON FOTO AGRANDADA Y SOPORTE PNG */}
        {/* ================================================================= */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-6">

          {/* HERO ESCÉNICO: FOTO AGRANDADA + DATOS DEL LOCUTOR */}
          <div className="relative rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50 to-emerald-500/5 dark:from-white/[0.04] dark:via-white/[0.02] dark:to-[#00DD9E]/10 border border-slate-200/80 dark:border-white/10 p-5 sm:p-6 overflow-hidden">
            
            {/* Glow atmosférico trasero que resalta el PNG del locutor */}
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-tr from-[#00DD9E]/25 via-emerald-500/15 to-[#001E4D]/20 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6">
              
              {/* =========================================================== */}
              {/* FOTO AGRANDADA DEL LOCUTOR (OPTIMIZADA PARA PNG TRANSPARENTE) */}
              {/* =========================================================== */}
              <div className="w-full md:w-56 lg:w-64 flex-shrink-0 flex items-end justify-center relative">
                
                {isPng ? (
                  /* Modo PNG Transparente: sin marco rígido, silueta que se fusiona con el fondo aeroglass */
                  <div className="relative w-48 sm:w-56 md:w-64 h-64 sm:h-72 md:h-80 flex items-end justify-center">
                    <img 
                      src={talent.photo} 
                      alt={talent.name}
                      className="max-h-full max-w-full object-contain object-bottom select-none transition-transform duration-500 hover:scale-103 drop-shadow-[0_16px_28px_rgba(0,0,0,0.40)] dark:drop-shadow-[0_18px_32px_rgba(0,221,158,0.25)]"
                      style={{
                        WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
                        maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)'
                      }}
                      loading="eager"
                    />
                  </div>
                ) : (
                  /* Modo Fotografía Clásica Cuadrada / Retrato con marco Squircle de diseño Apple */
                  <div className="relative w-44 sm:w-52 md:w-56 h-56 sm:h-64 md:h-72 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-[#00DD9E]/30 shadow-xl bg-slate-900 group">
                    <img 
                      src={talent.photo} 
                      alt={talent.name}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:-translate-y-0.5"
                      loading="eager"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />
                    <span className="absolute bottom-2.5 left-2.5 right-2.5 text-center text-[11px] font-bold text-white/90 bg-black/50 backdrop-blur-md rounded-full py-0.5 border border-white/10">
                      Foto Oficial
                    </span>
                  </div>
                )}

              </div>

              {/* DATOS PRINCIPALES DEL LOCUTOR */}
              <div className="flex-1 text-center md:text-left space-y-2.5 min-w-0">
                
                <div>
                  <span className="inline-block text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-[#00DD9E]">
                    {talent.role || 'Locutor & Productor'}
                  </span>
                  
                  <h2 id="talent-detail-name" className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight mt-0.5 leading-tight">
                    {talent.name}
                  </h2>
                </div>

                {/* Badge de Programa Radial */}
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-slate-200/80 dark:bg-white/10 text-xs font-bold text-slate-800 dark:text-white border border-slate-300/60 dark:border-white/10 shadow-xs">
                  <Radio className="w-3.5 h-3.5 text-emerald-600 dark:text-[#00DD9E]" />
                  <span className="truncate max-w-[240px] sm:max-w-none">{talent.showName}</span>
                </div>

                {/* Tarjeta de Horario al Aire */}
                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-black/30 border border-slate-200/70 dark:border-white/10 flex items-center space-x-3 text-left">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-[#00DD9E] flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="block font-bold text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider">
                      Horario de Transmisión en Vivo
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm truncate block mt-0.5">
                      {talent.showSchedule}
                    </span>
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* BIOGRAFÍA COMPLETA */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Acerca de {talent.name}
            </h3>
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/5">
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line font-medium">
                {talent.bio}
              </p>
            </div>
          </div>

          {/* BOTONES DE CONTACTO Y REDES SOCIALES */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Canales de Contacto Directo
            </h3>

            {/* Fila Primaria: WhatsApp en Cabina */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <a
                href={talentWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <Emoji3D name="whatsapp" className="w-4.5 h-4.5 flex-shrink-0" alt="WhatsApp" />
                <span>Escribir por WhatsApp</span>
              </a>

              <a
                href={`https://api.whatsapp.com/send?phone=584247459774&text=${encodeURIComponent(
                  `Hola Neblina 105.5 FM. Deseo solicitar una complacencia musical para el programa "${talent.showName}" de ${talent.name}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 active:scale-95 text-slate-900 dark:text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Radio className="w-4 h-4 text-emerald-500" />
                <span>Pedir Canción al Aire</span>
              </a>
            </div>

            {/* Fila Secundaria: Redes Sociales */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {talent.socialLinks?.instagram && (
                <a
                  href={talent.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 py-2 px-3 rounded-xl bg-pink-500/10 hover:bg-pink-500 hover:text-white text-pink-600 dark:text-pink-400 text-xs font-bold transition border border-pink-500/20 cursor-pointer"
                >
                  <InstagramIcon className="w-3.5 h-3.5" />
                  <span>Instagram</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}

              {talent.socialLinks?.facebook && (
                <a
                  href={talent.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 py-2 px-3 rounded-xl bg-blue-600/10 hover:bg-blue-600 hover:text-white text-blue-600 dark:text-blue-400 text-xs font-bold transition border border-blue-600/20 cursor-pointer"
                >
                  <FacebookIcon className="w-3.5 h-3.5" />
                  <span>Facebook</span>
                </a>
              )}

              {talent.socialLinks?.twitter && (
                <a
                  href={talent.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 py-2 px-3 rounded-xl bg-slate-200/80 dark:bg-white/10 hover:bg-black hover:text-white text-slate-800 dark:text-white text-xs font-bold transition cursor-pointer"
                >
                  <XTwitterIcon className="w-3.5 h-3.5" />
                  <span>X / Twitter</span>
                </a>
              )}

              <button
                onClick={onClose}
                className="ml-auto px-5 py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>

          </div>

        </div>

        {/* SELLO DE AUTENTICIDAD EN EL PIE */}
        <div className="px-5 sm:px-7 py-3 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center space-x-1.5">
            <Radio className="w-3.5 h-3.5 text-[#00DD9E]" />
            <span>Staff Oficial · Neblina Stereo 105.5 FM</span>
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
