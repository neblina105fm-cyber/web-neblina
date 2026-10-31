import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import Emoji3D from './Emoji3D';
import { getActiveSponsors } from '../services/sponsorsData';
import SponsorDetailModal from './SponsorDetailModal';

// Logotipos vectoriales limpios oficiales para los aliados predeterminados
// (Garantizan nitidez absoluta sin bordes ni fondos blancos forzados)
const DEFAULT_VECTOR_LOGOS = {
  sp_1: (
    <svg viewBox="0 0 240 54" className="h-9 sm:h-11 md:h-12 w-auto object-contain text-slate-800 dark:text-white" fill="none">
      <path d="M12 38L24 14L36 38H29L24 28L19 38H12Z" fill="#00DD9E"/>
      <path d="M31 38L39 22L47 38H41L39 34L37 38H31Z" fill="#0071E3"/>
      <text x="56" y="28" fontFamily="system-ui, sans-serif" fontSize="15" fontWeight="900" fill="currentColor" letterSpacing="1.2">TRANSFERS</text>
      <text x="56" y="42" fontFamily="system-ui, sans-serif" fontSize="10" fontWeight="800" fill="#00DD9E" letterSpacing="3">MÉRIDA</text>
    </svg>
  ),
  sp_2: (
    <svg viewBox="0 0 240 54" className="h-9 sm:h-11 md:h-12 w-auto object-contain text-slate-800 dark:text-white" fill="none">
      <circle cx="24" cy="27" r="16" stroke="#10B981" strokeWidth="2"/>
      <path d="M24 16C24 22 18 25 18 30C18 34 21 37 24 37C27 37 30 34 30 30C30 25 24 22 24 16Z" fill="#10B981"/>
      <text x="50" y="26" fontFamily="system-ui, sans-serif" fontSize="14" fontWeight="900" fill="currentColor" letterSpacing="0.8">EL ENCANTO</text>
      <text x="50" y="40" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="700" fill="#10B981" letterSpacing="2.5">ESTANCIA &amp; SPA</text>
    </svg>
  ),
  sp_3: (
    <svg viewBox="0 0 240 54" className="h-9 sm:h-11 md:h-12 w-auto object-contain text-slate-800 dark:text-white" fill="none">
      <path d="M10 38L22 14L34 38H10Z" fill="#0284C7"/>
      <path d="M24 38L34 20L44 38H24Z" fill="#38BDF8"/>
      <text x="52" y="26" fontFamily="system-ui, sans-serif" fontSize="14" fontWeight="900" fill="currentColor" letterSpacing="1">LOS VIRIOS</text>
      <text x="52" y="40" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="700" fill="#0284C7" letterSpacing="2">HOTEL &amp; CABAÑAS</text>
    </svg>
  ),
  sp_4: (
    <svg viewBox="0 0 240 54" className="h-9 sm:h-11 md:h-12 w-auto object-contain text-slate-800 dark:text-white" fill="none">
      <circle cx="24" cy="27" r="9" fill="#F59E0B"/>
      <path d="M24 10V14M24 40V44M7 27H11M37 27H41M12 15L14.8 17.8M33.2 36.2L36 39M12 39L14.8 36.2M33.2 17.8L36 15" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round"/>
      <text x="50" y="26" fontFamily="system-ui, sans-serif" fontSize="13" fontWeight="900" fill="currentColor" letterSpacing="1">DESTINOS DEL SOL</text>
      <text x="50" y="40" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="700" fill="#F59E0B" letterSpacing="2.5">TURISMO &amp; VIAJES</text>
    </svg>
  ),
  sp_5: (
    <svg viewBox="0 0 240 54" className="h-9 sm:h-11 md:h-12 w-auto object-contain text-slate-800 dark:text-white" fill="none">
      <path d="M12 38L24 16L30 26L38 12L48 38H12Z" fill="#16A34A"/>
      <text x="58" y="26" fontFamily="system-ui, sans-serif" fontSize="14" fontWeight="900" fill="currentColor" letterSpacing="1">GREEN TRAVEL</text>
      <text x="58" y="40" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="700" fill="#16A34A" letterSpacing="2">ECOTURISMO ANDINO</text>
    </svg>
  ),
  sp_6: (
    <svg viewBox="0 0 240 54" className="h-9 sm:h-11 md:h-12 w-auto object-contain text-slate-800 dark:text-white" fill="none">
      <rect x="12" y="13" width="28" height="28" rx="6" stroke="#6366F1" strokeWidth="2"/>
      <path d="M20 33V21L26 27L32 21V33" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <text x="48" y="26" fontFamily="system-ui, sans-serif" fontSize="14" fontWeight="900" fill="currentColor" letterSpacing="1">CONVENCIÓN</text>
      <text x="48" y="40" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="700" fill="#6366F1" letterSpacing="2">HOTEL BOUTIQUE</text>
    </svg>
  ),
  sp_7: (
    <svg viewBox="0 0 240 54" className="h-9 sm:h-11 md:h-12 w-auto object-contain text-slate-800 dark:text-white" fill="none">
      <circle cx="24" cy="27" r="15" stroke="#EC4899" strokeWidth="2"/>
      <path d="M24 17V37M14 27H34" stroke="#EC4899" strokeWidth="2.5" strokeLinecap="round"/>
      <text x="48" y="26" fontFamily="system-ui, sans-serif" fontSize="12" fontWeight="900" fill="currentColor" letterSpacing="0.5">DRA. MELINA CHUECOS</text>
      <text x="48" y="40" fontFamily="system-ui, sans-serif" fontSize="8.5" fontWeight="700" fill="#EC4899" letterSpacing="1.5">GINECOLOGÍA &amp; OBSTETRICIA</text>
    </svg>
  ),
  sp_8: (
    <svg viewBox="0 0 240 54" className="h-9 sm:h-11 md:h-12 w-auto object-contain text-slate-800 dark:text-white" fill="none">
      <path d="M16 35C16 35 20 17 26 17C32 17 36 35 36 35H16Z" fill="#EA580C"/>
      <circle cx="26" cy="17" r="3.5" fill="#EA580C"/>
      <text x="44" y="26" fontFamily="system-ui, sans-serif" fontSize="14" fontWeight="900" fill="currentColor" letterSpacing="1">LA CIMA</text>
      <text x="44" y="40" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="700" fill="#EA580C" letterSpacing="2">RESTAURANTE &amp; CAFÉ</text>
    </svg>
  )
};

function getSponsorLink(sponsor) {
  if (sponsor.url && sponsor.url.trim() && sponsor.url !== '#') return sponsor.url;
  if (sponsor.web && sponsor.web.trim()) return sponsor.web;
  if (sponsor.instagram && sponsor.instagram.trim()) {
    const cleanIg = sponsor.instagram.replace('@', '').trim();
    return `https://instagram.com/${cleanIg}`;
  }
  if (sponsor.whatsapp && sponsor.whatsapp.trim()) {
    const cleanWa = sponsor.whatsapp.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanWa}`;
  }
  return '#';
}

function SponsorLogoItem({ sponsor, onSelect }) {
  const [imgError, setImgError] = useState(false);

  // Si tiene un vector oficial predeterminado y el logo almacenado es el unsplash de prueba
  const isDefaultUnsplash = sponsor.logo && sponsor.logo.includes('images.unsplash.com');
  const hasVector = DEFAULT_VECTOR_LOGOS[sponsor.id];

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group relative flex items-center justify-center py-2 px-3 sm:px-5 flex-shrink-0 transition-transform duration-300 hover:scale-110 active:scale-95 cursor-pointer select-none bg-transparent border-0"
      title={`Ver ficha técnica de ${sponsor.name} (${sponsor.category})`}
    >
      {/* 1. Si es uno de los sponsors iniciales o la imagen falló, mostrar el logo vectorial */}
      {hasVector && (!sponsor.logo || isDefaultUnsplash || imgError) ? (
        <div className="opacity-80 group-hover:opacity-100 transition-opacity">
          {DEFAULT_VECTOR_LOGOS[sponsor.id]}
        </div>
      ) : sponsor.logo && !imgError ? (
        /* 2. Logo real proporcionado por el usuario (imagen, PNG transparente, SVG, etc.) */
        <img
          src={sponsor.logo}
          alt={sponsor.name}
          onError={() => setImgError(true)}
          className="h-9 sm:h-11 md:h-12 w-auto max-w-[150px] sm:max-w-[180px] object-contain opacity-80 group-hover:opacity-100 transition-all duration-300 filter drop-shadow-xs"
          loading="lazy"
          decoding="async"
        />
      ) : (
        /* 3. Fallback tipográfico limpio en caso de no tener foto ni vector */
        <div className="flex items-center space-x-1.5 px-3 py-1">
          <span className="font-display font-black text-sm sm:text-base text-slate-800 dark:text-white uppercase tracking-wider group-hover:text-emerald-500 dark:group-hover:text-[#00DD9E] transition-colors whitespace-nowrap">
            {sponsor.vectorText || sponsor.name}
          </span>
        </div>
      )}
    </button>
  );
}

export default function SponsorsCarousel({ setActiveTab }) {
  const [sponsors, setSponsors] = useState([]);
  const [selectedSponsor, setSelectedSponsor] = useState(null);

  const reloadSponsors = () => {
    const list = getActiveSponsors().filter(s => s.featuredInHome !== false);
    setSponsors(list);
  };

  useEffect(() => {
    reloadSponsors();

    const handleUpdate = () => reloadSponsors();
    window.addEventListener('neblina_sponsors_updated', handleUpdate);
    return () => window.removeEventListener('neblina_sponsors_updated', handleUpdate);
  }, []);

  if (!sponsors || sponsors.length === 0) return null;

  // Duplicar la lista para un carrusel marquee continuo infinito sin saltos
  const marqueeItems = [...sponsors, ...sponsors];

  const handleGoToDirectory = () => {
    if (setActiveTab) {
      setActiveTab('sponsors');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-4 sm:py-6 select-none bg-transparent">
      
      {/* 1. Encabezado Integrado Directamente con el Fondo */}
      <div className="text-center max-w-2xl mx-auto mb-4 sm:mb-6">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-bold text-emerald-600 dark:text-[#00DD9E] bg-emerald-500/10 dark:bg-[#00DD9E]/10 border border-emerald-500/20 mb-1.5">
          <Emoji3D name="sparkles" className="w-3.5 h-3.5 inline-block" alt="Patrocinantes" />
          <span>Nuestros patrocinantes y aliados</span>
        </div>

        <h3 className="font-display font-black text-lg sm:text-xl md:text-2xl text-slate-900 dark:text-white tracking-tight">
          Las empresas que hacen posible nuestra señal
        </h3>
      </div>

      {/* 2. Carrusel Continuo Deslizándose (Marquee Infinito de Logos Puros) */}
      <div className="relative overflow-hidden w-full marquee-mask py-2">
        <div className="anim-marquee space-x-6 sm:space-x-10 md:space-x-14 items-center">
          {marqueeItems.map((sponsor, idx) => (
            <SponsorLogoItem 
              key={`${sponsor.id}-${idx}`} 
              sponsor={sponsor} 
              onSelect={() => setSelectedSponsor(sponsor)}
            />
          ))}
        </div>
      </div>

      {/* 3. Acceso Sutil al Directorio Completo */}
      <div className="mt-3 text-center">
        <button
          onClick={handleGoToDirectory}
          className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-[#00DD9E] transition-colors cursor-pointer inline-flex items-center space-x-1.5 group"
        >
          <span>Ver directorio completo de aliados comerciales</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* 4. Modal Ficha Técnica del Aliado Comercial al hacer clic en cualquier logo */}
      {selectedSponsor && (
        <SponsorDetailModal
          sponsor={selectedSponsor}
          onClose={() => setSelectedSponsor(null)}
        />
      )}

    </section>
  );
}
