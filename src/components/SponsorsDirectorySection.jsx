import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  MapPin, 
  Phone, 
  ExternalLink, 
  Sparkles, 
  MessageCircle, 
  Globe, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Layers, 
  Lock,
  ChevronRight,
  Info
} from 'lucide-react';
import { 
  getActiveSponsors, 
  SPONSOR_CATEGORIES, 
  getSponsorsCategoriesCount 
} from '../services/sponsorsData';
import Emoji3D from './Emoji3D';
import { STATION_INFO } from '../services/api';
import SponsorDetailModal from './SponsorDetailModal';
import TickerCategories from './TickerCategories';

const InstagramIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

export default function SponsorsDirectorySection({ onOpenAdmin }) {
  const [sponsors, setSponsors] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoriesCount, setCategoriesCount] = useState({});
  const [selectedSponsor, setSelectedSponsor] = useState(null);

  const reloadData = () => {
    const list = getActiveSponsors();
    setSponsors(list);
    setCategoriesCount(getSponsorsCategoriesCount(list));
  };

  useEffect(() => {
    reloadData();

    const handleUpdate = () => reloadData();
    window.addEventListener('neblina_sponsors_updated', handleUpdate);
    return () => window.removeEventListener('neblina_sponsors_updated', handleUpdate);
  }, []);

  // Filtrado reactivo en tiempo real
  const filteredSponsors = sponsors.filter((item) => {
    const matchCategory = 
      selectedCategory === 'Todas' || 
      item.category?.toLowerCase() === selectedCategory.toLowerCase();

    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchCategory;

    const matchQuery = 
      (item.name && item.name.toLowerCase().includes(query)) ||
      (item.description && item.description.toLowerCase().includes(query)) ||
      (item.location && item.location.toLowerCase().includes(query)) ||
      (item.category && item.category.toLowerCase().includes(query)) ||
      (item.slogan && item.slogan.toLowerCase().includes(query)) ||
      (item.tag && item.tag.toLowerCase().includes(query));

    return matchCategory && matchQuery;
  });

  const advertisingWhatsAppUrl = `https://api.whatsapp.com/send?phone=584247459774&text=${encodeURIComponent(
    '¡Hola, Neblina Stereo 105.5 FM! 🎙️ Deseo información detallada para afiliar mi empresa al Directorio de Aliados Comerciales y pautar publicidad en la radio.'
  )}`;

  return (
    <div className="space-y-8 py-4 sm:py-6 animate-fadeIn">
      
      {/* 2. BARRA DE BÚSQUEDA Y FILTRADO POR CATEGORÍAS */}
      <div className="space-y-4">
        
        {/* Input Buscador en Tiempo Real */}
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, categoría, ciudad o servicio (ej: Hotel, Traslados, Mérida)..."
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white dark:bg-[#1d1d1f] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:focus:ring-[#00DD9E]/50 shadow-sm transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-white"
              aria-label="Limpiar búsqueda"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Carril de Categorías en Teleprómpter Continuo */}
        <div className="w-full">
          <TickerCategories
            items={SPONSOR_CATEGORIES.map(category => ({
              id: category,
              name: category,
              count: category === 'Todas' ? sponsors.length : (categoriesCount[category] || 0)
            }))}
            selectedId={selectedCategory}
            onSelect={(catId) => setSelectedCategory(catId)}
            speed={28}
          />
        </div>

      </div>

      {/* 3. GRILLA DE FICHAS DE ALIADOS COMERCIALES (ESTILO CATUREM + APPLE) */}
      {filteredSponsors.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl bg-white dark:bg-[#1d1d1f] border border-slate-200 dark:border-white/10 space-y-3">
          <Building2 className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
            No se encontraron aliados comerciales
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            No hay empresas registradas que coincidan con "{searchQuery}" en la categoría seleccionada.
          </p>
          <button
            onClick={() => { setSelectedCategory('Todas'); setSearchQuery(''); }}
            className="mt-2 px-5 py-2 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold"
          >
            Ver todos los aliados
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSponsors.map((item) => {
            const contactMsg = encodeURIComponent(
              `¡Hola, ${item.name}! Vi su empresa en el Directorio de Aliados de Neblina Stereo 105.5 FM y quisiera consultar sobre sus servicios.`
            );
            const waUrl = `https://api.whatsapp.com/send?phone=${item.whatsapp || '584247459774'}&text=${contactMsg}`;

            return (
              <article
                key={item.id}
                className="group relative rounded-2xl glass-card border border-[#e6e6e8] dark:border-white/10 p-6 flex flex-col justify-between hover:shadow-xl hover:border-emerald-500/40 dark:hover:border-[#00DD9E]/40 transition-all duration-300"
              >
                <div>
                  
                  {/* Encabezado: Logo / Avatar + Categoría */}
                  <div 
                    onClick={() => setSelectedSponsor(item)}
                    className="flex items-start justify-between gap-3 mb-4 cursor-pointer"
                  >
                    
                    {/* Logotipo o Avatar con Iniciales Vectoriales */}
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 flex-shrink-0 flex items-center justify-center p-1 shadow-inner group-hover:-translate-y-0.5 transition-transform">
                      {item.logo ? (
                        <img
                          src={item.logo}
                          alt={item.name}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover rounded-xl"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        style={{ display: item.logo ? 'none' : 'flex' }}
                        className="w-full h-full rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white items-center justify-center font-black text-lg"
                      >
                        {item.name.substring(0, 2).toUpperCase()}
                      </div>
                    </div>

                    {/* Categoría Badge */}
                    <div className="text-right flex-1">
                      <span className="inline-block px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                        {item.category}
                      </span>
                      {item.rif && (
                        <p className="text-[11px] text-slate-400 font-mono mt-1">
                          RIF: {item.rif}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Título y Slogan */}
                  <h3 
                    onClick={() => setSelectedSponsor(item)}
                    className="font-display font-black text-lg sm:text-xl text-slate-900 dark:text-[#f5f5f7] tracking-tight group-hover:text-emerald-600 dark:group-hover:text-[#00DD9E] transition-colors cursor-pointer"
                  >
                    {item.name}
                  </h3>

                  {item.slogan && (
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1 line-clamp-1">
                      {item.slogan}
                    </p>
                  )}

                  {/* Descripción Breve */}
                  <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed mt-2.5 line-clamp-3 font-medium">
                    {item.description || 'Aliado comercial certificado de Neblina Stereo 105.5 FM.'}
                  </p>

                  {/* Ubicación Geográfica con Pin de Mapa */}
                  {item.location && (
                    <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-white/5 flex items-start space-x-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                      <Emoji3D name="pin" className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" alt="Ubicación" />
                      <span className="line-clamp-2 leading-tight">
                        {item.location}
                      </span>
                    </div>
                  )}

                </div>

                {/* BOTÓN PROMINENTE DE FICHA TÉCNICA Y ACCIONES */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/10 space-y-2.5">
                  
                  {/* Botón Principal: Ver Ficha Técnica Completa */}
                  <button
                    onClick={() => setSelectedSponsor(item)}
                    className="w-full py-2.5 px-3 rounded-2xl bg-[#001E4D] dark:bg-[#00DD9E] text-white dark:text-[#001E4D] hover:bg-[#002d73] dark:hover:bg-[#00c98f] active:scale-98 text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Ver Ficha Técnica Completa</span>
                  </button>

                  {/* Fila Secundaria: WhatsApp + Instagram */}
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs"
                      title={`Escribir por WhatsApp a ${item.name}`}
                    >
                      <Emoji3D name="whatsapp" className="w-4 h-4 flex-shrink-0" alt="WhatsApp" />
                      <span>WhatsApp</span>
                    </a>

                    <a
                      href={item.url || `https://instagram.com/${(item.instagram || '').replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-pink-600 hover:text-white dark:hover:bg-pink-600 text-slate-800 dark:text-white text-xs font-bold transition"
                      title={`Visitar Instagram de ${item.name}`}
                    >
                      <Emoji3D name="instagram" className="w-4 h-4 flex-shrink-0" alt="Instagram" />
                      <span className="truncate">{item.instagram || 'Instagram'}</span>
                    </a>
                  </div>

                  {/* Fila Terciaria: Web o Teléfono si existen */}
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                    {item.web ? (
                      <a
                        href={item.web}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 hover:text-[#0071e3] dark:hover:text-[#00DD9E] font-semibold transition"
                      >
                        <Globe className="w-3 h-3" />
                        <span>Sitio Web</span>
                        <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                        <Emoji3D name="shield" className="w-3.5 h-3.5 inline-block" alt="Verificado" />
                        <span>Aliado Verificado</span>
                      </span>
                    )}

                    {item.googleMapsUrl && (
                      <a
                        href={item.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 hover:text-rose-500 font-semibold transition text-[11px]"
                      >
                        <MapPin className="w-3 h-3 text-rose-500" />
                        <span>Ver en Mapa</span>
                      </a>
                    )}
                  </div>

                </div>

              </article>
            );
          })}
        </div>
      )}

      {/* Modal Ficha Técnica de Aliado Comercial */}
      {selectedSponsor && (
        <SponsorDetailModal 
          sponsor={selectedSponsor} 
          onClose={() => setSelectedSponsor(null)} 
        />
      )}

      {/* 4. CTA BANNER INFERIOR PARA NUEVOS PATROCINANTES */}
      <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 dark:from-[#0b1723] dark:to-[#07131d] text-white p-8 sm:p-12 shadow-xl border border-white/10 overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4">
          <span className="px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-widest bg-emerald-500/20 text-[#00DD9E] border border-emerald-500/30">
            ÚNETE A NUESTRA RED COMERCIAL
          </span>

          <h2 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl tracking-tight">
            ¿Deseas que tu marca o negocio aparezca en Neblina 105.5 FM?
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Nuestra señal en FM y plataforma digital llega diariamente a miles de oyentes y turistas en Santo Domingo, Mérida, los Andes venezolanos y el mundo entero. Contamos con planes de cuñas, menciones en vivo, entrevistas y presencia permanente en nuestra Web App.
          </p>

          <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
            <a
              href={advertisingWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition shadow-lg shadow-emerald-500/25"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Contactar por WhatsApp (+58 424 745 9774)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>

            <a
              href="tel:+584247459774"
              className="inline-flex items-center space-x-1.5 px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition border border-white/20"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Llamar a Cabina</span>
            </a>
          </div>
        </div>
      </div>

    </div>
  );
}
