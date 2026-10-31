import React, { useState, useEffect } from 'react';
import Emoji3D from './Emoji3D';
import { 
  getActiveBannersForPlacement, 
  recordBannerView, 
  recordBannerClick 
} from '../services/adBannerService';

export default function NewsGridAdSlot({ colSpanLg = 2 }) {
  const [banners, setBanners] = useState(() => getActiveBannersForPlacement('news-grid'));
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const handleUpdate = () => {
      setBanners(getActiveBannersForPlacement('news-grid'));
    };
    window.addEventListener('neblina_banners_updated', handleUpdate);
    return () => window.removeEventListener('neblina_banners_updated', handleUpdate);
  }, []);

  const banner = banners[currentIndex % (banners.length || 1)] || banners[0];

  useEffect(() => {
    if (banner?.id) {
      recordBannerView(banner.id);
    }
  }, [banner?.id]);

  if (!banner) return null;

  const bgImage = banner.gridWideUrl || banner.mediaUrl || banner.images?.[0]?.desktopUrl || '';
  const colClass = colSpanLg === 2 ? 'lg:col-span-2' : 'lg:col-span-1';

  return (
    <div 
      className={`relative rounded-2xl overflow-hidden aeroglass-card border border-emerald-500/30 shadow-md flex flex-col justify-between group min-h-[340px] ${colClass} sm:col-span-2 lg:${colClass}`}
    >
      {/* Fondo de Imagen o Gradiente */}
      {bgImage ? (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            src={bgImage} 
            alt={banner.title || 'Publicidad'} 
            className="w-full h-full object-cover group-hover:-translate-y-0.5 transition-transform duration-700 opacity-30 dark:opacity-40"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#001E4D]/95 via-[#001E4D]/75 to-transparent dark:from-[#001438]/95 dark:via-[#001438]/80" />
        </div>
      ) : (
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#001E4D]/80 via-[#002a6b]/60 to-[#00DD9E]/20" />
      )}

      {/* Cabecera del Banner */}
      <div className="relative z-10 p-5 flex items-center justify-between">
        <span className="bg-[#001E4D]/75 backdrop-blur-xl px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider text-[#00DD9E] border border-[#00DD9E]/45 shadow-sm">
          {banner.badge || 'Publicidad Destacada'}
        </span>
        <span className="text-[11px] font-bold text-slate-300 dark:text-slate-400 bg-black/40 px-2 py-0.5 rounded-md">
          {banner.clientName || 'Neblina 105.5 FM'}
        </span>
      </div>

      {/* Cuerpo y Llamado a la Acción */}
      <div className="relative z-10 p-5 sm:p-6 space-y-3">
        <h4 className="font-display font-extrabold text-lg sm:text-xl text-white group-hover:text-[#00DD9E] transition-colors line-clamp-2">
          {banner.title}
        </h4>
        {banner.subtitle && (
          <p className="text-xs text-slate-200 dark:text-slate-300 line-clamp-2 leading-relaxed">
            {banner.subtitle}
          </p>
        )}

        <div className="pt-2 flex items-center justify-between">
          <a
            href={banner.ctaLink || 'https://wa.me/584247459774'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => recordBannerClick(banner.id)}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00DD9E] to-teal-400 text-[#001E4D] font-black text-xs shadow-md hover:brightness-105 active:scale-95 transition cursor-pointer"
          >
            <span>{banner.ctaText || 'Más Información'}</span>
            <Emoji3D name="whatsapp" className="w-3.5 h-3.5" alt="WhatsApp" />
          </a>
          <span className="text-[11px] text-slate-400">
            Espacio Comercial
          </span>
        </div>
      </div>
    </div>
  );
}
