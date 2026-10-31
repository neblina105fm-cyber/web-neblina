import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { 
  HeartHandshake, 
  Search, 
  MapPin, 
  Phone, 
  Copy, 
  Check, 
  X, 
  Sparkles, 
  Calendar, 
  User, 
  Users, 
  CreditCard, 
  FileText, 
  HelpCircle, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import Emoji3D from './Emoji3D';
import { getActivePublicServices } from '../services/publicServiceData';

export default function PublicServiceSection() {
  const [items, setItems] = useState(() => getActivePublicServices('all'));
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all' | 'ayudas' | 'objetos_perdidos' | 'objetos_encontrados'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeItemModal, setActiveItemModal] = useState(null);

  useEffect(() => {
    const handleUpdate = () => {
      setItems(getActivePublicServices('all'));
    };
    window.addEventListener('neblina_public_service_updated', handleUpdate);
    return () => window.removeEventListener('neblina_public_service_updated', handleUpdate);
  }, []);

  // Filtrado de casos
  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCategory;

    const matchesQuery = (
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.beneficiaryName && item.beneficiaryName.toLowerCase().includes(q)) ||
      (item.location && item.location.toLowerCase().includes(q))
    );

    return matchesCategory && matchesQuery;
  });

  const categories = [
    { id: 'all', label: 'Todos los Casos', emoji: 'loudspeaker' },
    { id: 'ayudas', label: 'Ayudas Médicas & Sociales', emoji: 'hands_folded' },
    { id: 'objetos_perdidos', label: 'Objetos Perdidos', emoji: 'magnifying_glass' },
    { id: 'objetos_encontrados', label: 'Objetos Encontrados', emoji: 'package' }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6 animate-fadeIn">
      {/* Barra de Filtros por Categoría y Buscador */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Pills de Categorías */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none py-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = cat.id === 'all' 
              ? items.length 
              : items.filter(it => it.category === cat.id).length;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-95 ${
                  isSelected
                    ? 'bg-[#001E4D] text-[#00DD9E] dark:bg-[#00DD9E] dark:text-[#001E4D] border border-transparent font-black shadow-xs'
                    : 'bg-white/70 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200/80 dark:border-white/10'
                }`}
              >
                <Emoji3D name={cat.emoji} className="w-4 h-4" />
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                  isSelected 
                    ? 'bg-black/20 dark:bg-black/20 text-white dark:text-[#001E4D]' 
                    : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Buscador en Vivo */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por caso, nombre, lugar..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-white dark:bg-[#0c141f] border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#00DD9E] transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Grid de Casos de Servicio Público */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white/50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-3">
          <Emoji3D name="magnifying_glass" className="w-12 h-12 mx-auto" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            No se encontraron casos con los criterios seleccionados
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Puedes cambiar de categoría o limpiar el término de búsqueda para ver las demás publicaciones.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <PublicServiceCard 
              key={item.id} 
              item={item} 
              onOpenDetails={() => setActiveItemModal(item)} 
            />
          ))}
        </div>
      )}

      {/* FICHA SUPERPUESTA (MODAL OVERLAY) */}
      {activeItemModal && (
        <PublicServiceModal 
          item={activeItemModal} 
          onClose={() => setActiveItemModal(null)} 
        />
      )}
    </section>
  );
}

// Tarjeta Individual en el Grid
function PublicServiceCard({ item, onOpenDetails }) {
  const isAyuda = item.category === 'ayudas';
  const isPerdido = item.category === 'objetos_perdidos';
  const isEncontrado = item.category === 'objetos_encontrados';

  const categoryBadge = {
    ayudas: {
      label: 'Ayuda Médica & Social',
      color: 'bg-emerald-500/15 text-emerald-800 dark:text-[#00DD9E] border-emerald-500/30',
      emoji: 'hands_folded'
    },
    objetos_perdidos: {
      label: 'Objeto Perdido',
      color: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30',
      emoji: 'magnifying_glass'
    },
    objetos_encontrados: {
      label: 'Objeto Encontrado',
      color: 'bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border-cyan-500/30',
      emoji: 'package'
    }
  }[item.category] || { label: 'Servicio', color: 'bg-slate-200 text-slate-700', emoji: 'loudspeaker' };

  const firstPhoto = item.photos && item.photos.length > 0 ? item.photos[0] : null;

  return (
    <article 
      onClick={onOpenDetails}
      className="group rounded-3xl bg-white/80 dark:bg-[#0c141f]/80 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 hover:border-emerald-500/50 dark:hover:border-[#00DD9E]/50 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer active:scale-[0.99]"
    >
      <div>
        {/* Foto de Portada con Degradado */}
        <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden">
          {firstPhoto ? (
            <img 
              src={firstPhoto} 
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-800/80 p-4">
              <Emoji3D name={categoryBadge.emoji} className="w-12 h-12 mb-2" />
              <span className="text-xs font-bold">Servicio Comunitario</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Badge Superior de Categoría */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider backdrop-blur-md border ${categoryBadge.color}`}>
              <Emoji3D name={categoryBadge.emoji} className="w-3.5 h-3.5" />
              <span>{categoryBadge.label}</span>
            </span>

            {item.photos?.length > 1 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-black/60 text-white backdrop-blur-md border border-white/20">
                +{item.photos.length} fotos
              </span>
            )}
          </div>

          {/* Ubicación sobre la Foto */}
          {item.location && (
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center space-x-1 text-white text-xs font-medium truncate">
              <MapPin className="w-3.5 h-3.5 text-[#00DD9E] shrink-0" />
              <span className="truncate drop-shadow-md">{item.location}</span>
            </div>
          )}
        </div>

        {/* Contenido de la Tarjeta */}
        <div className="p-5 space-y-3">
          <h3 className="font-display font-black text-base sm:text-lg text-slate-900 dark:text-white leading-snug group-hover:text-emerald-600 dark:group-hover:text-[#00DD9E] transition-colors line-clamp-2">
            {item.title}
          </h3>

          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
            {item.description}
          </p>

          {/* Beneficiario o Responsable */}
          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-bold text-[11px]">Beneficiario / Contacto:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[170px]">
                {item.beneficiaryName || item.responsibleNames}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pie de Tarjeta con Botón de Acción */}
      <div className="p-4 pt-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails();
          }}
          className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-black bg-slate-900 text-white dark:bg-white/10 dark:text-white hover:bg-[#00DD9E] hover:text-[#001E4D] dark:hover:bg-[#00DD9E] dark:hover:text-[#001E4D] transition-colors cursor-pointer"
        >
          <span>Ver Ficha Completa</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </article>
  );
}

// FICHA SUPERPUESTA (MODAL OVERLAY INTEGRAL)
function PublicServiceModal({ item, onClose }) {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [copiedBank, setCopiedBank] = useState(false);

  useEffect(() => {
    // Bloquear scroll del fondo
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!item) return null;

  const isAyuda = item.category === 'ayudas';
  const isPerdido = item.category === 'objetos_perdidos';
  const isEncontrado = item.category === 'objetos_encontrados';

  const allPhotos = [...(item.photos || []), ...(item.medicalRecipes || [])];

  const handleCopyBankInfo = () => {
    if (!item.bankInfo) return;
    navigator.clipboard.writeText(item.bankInfo);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2500);
  };

  // Enlace directo de WhatsApp
  const cleanPhone = (item.contactWhatsapp || item.contactPhone || '584247459774').replace(/[^0-9]/g, '');
  let waMsg = '';
  if (isAyuda) {
    waMsg = `¡Hola! Me comunico respecto al caso de Servicio Público "${item.title}" publicado en Neblina Stereo 105.5 FM. Quisiera ofrecer apoyo e información.`;
  } else if (isPerdido) {
    waMsg = `¡Hola! Me comunico respecto al Objeto Perdido "${item.title}" publicado en Neblina Stereo 105.5 FM. Tengo información para reportar.`;
  } else {
    waMsg = `¡Hola! Me comunico respecto al Objeto Encontrado "${item.title}" publicado en Neblina Stereo 105.5 FM para coordinar el reclamo de la pertenencia.`;
  }
  const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(waMsg)}`;

  const modalNode = (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 pt-4 pb-28 sm:pb-32 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-3xl max-h-[calc(100dvh-130px)] sm:max-h-[calc(100dvh-140px)] bg-white dark:bg-[#0c141f] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl flex flex-col overflow-hidden my-auto animate-scaleUp">
        
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 shrink-0">
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${
              isAyuda ? 'bg-emerald-500/15 text-emerald-700 dark:text-[#00DD9E]' :
              isPerdido ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300' :
              'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300'
            }`}>
              <Emoji3D name={isAyuda ? 'hands_folded' : isPerdido ? 'magnifying_glass' : 'package'} className="w-4 h-4" />
              <span>{isAyuda ? 'Caso de Ayuda Social' : isPerdido ? 'Reporte de Objeto Perdido' : 'Objeto Encontrado en Custodia'}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/20 transition cursor-pointer"
            aria-label="Cerrar Ficha"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido con Scroll */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1">
          
          {/* Título y Subtítulo */}
          <div className="space-y-1">
            <h2 className="font-display font-black text-xl sm:text-2xl text-slate-900 dark:text-white leading-tight">
              {item.title}
            </h2>
            {item.subtitle && (
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                {item.subtitle}
              </p>
            )}
            {item.location && (
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1.5 pt-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{item.location}</span>
              </p>
            )}
          </div>

          {/* Carrusel de Fotografías y Récipes */}
          {allPhotos.length > 0 && (
            <div className="space-y-2">
              <div className="relative aspect-[16/9] max-h-80 w-full bg-black rounded-2xl overflow-hidden flex items-center justify-center">
                <img 
                  src={allPhotos[activePhotoIndex]} 
                  alt={`Foto ${activePhotoIndex + 1}`}
                  className="max-h-full max-w-full object-contain"
                />

                {allPhotos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActivePhotoIndex(prev => (prev - 1 + allPhotos.length) % allPhotos.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePhotoIndex(prev => (prev + 1) % allPhotos.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {allPhotos.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {allPhotos.map((ph, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActivePhotoIndex(idx)}
                      className={`relative w-16 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                        activePhotoIndex === idx ? 'border-[#00DD9E] scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={ph} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Descripción Completa del Caso */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
              Detalles del Caso
            </h4>
            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
              {item.description}
            </p>
          </div>

          {/* Beneficiarios & Responsables */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 space-y-1">
              <span className="text-slate-500 font-bold flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-emerald-500" />
                <span>Persona Beneficiaria:</span>
              </span>
              <p className="font-bold text-slate-900 dark:text-white text-sm">
                {item.beneficiaryName || 'N/A'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 space-y-1">
              <span className="text-slate-500 font-bold flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-500" />
                <span>Responsables / Familiares:</span>
              </span>
              <p className="font-bold text-slate-900 dark:text-white text-sm">
                {item.responsibleNames || 'N/A'}
              </p>
            </div>
          </div>

          {/* Datos Bancarios (Para Ayudas Médicas) */}
          {isAyuda && item.bankInfo && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/05 to-sky-500/10 dark:from-[#001E4D]/40 dark:to-teal-950/40 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-emerald-500" />
                  <h4 className="font-display font-black text-xs uppercase tracking-wider text-emerald-800 dark:text-[#00DD9E]">
                    Datos Bancarios & Pago Móvil Oficial
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={handleCopyBankInfo}
                  className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-black bg-white dark:bg-black/40 border border-emerald-500/30 text-emerald-700 dark:text-[#00DD9E] hover:bg-emerald-500 hover:text-white transition cursor-pointer"
                >
                  {copiedBank ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedBank ? '¡Copiado!' : 'Copiar Datos'}</span>
                </button>
              </div>

              <pre className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 whitespace-pre-wrap bg-white/70 dark:bg-black/30 p-3 rounded-xl border border-white/40 dark:border-white/10">
                {item.bankInfo}
              </pre>
            </div>
          )}

          {/* Récipes Médicos Específicos */}
          {isAyuda && item.medicalRecipes && item.medicalRecipes.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-500" />
                <span>Récipes e Informes Médicos Adjuntos ({item.medicalRecipes.length})</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {item.medicalRecipes.map((rc, idx) => (
                  <div key={idx} className="aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-black">
                    <img src={rc} alt={`Récipe ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Barra Inferior con Botón de Contacto por WhatsApp */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
            <span>Teléfono de Contacto: </span>
            <strong className="text-slate-900 dark:text-white font-mono">+{cleanPhone}</strong>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs transition-transform active:scale-95 cursor-pointer shadow-md shadow-emerald-500/20"
            >
              <Emoji3D name="whatsapp" className="w-4 h-4" />
              <span>
                {isAyuda ? 'Contactar por WhatsApp para Ayudar' :
                 isPerdido ? 'Reportar si Conseguí el Objeto' :
                 'Reclamar Objeto por WhatsApp'}
              </span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 rounded-2xl bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-300 dark:hover:bg-white/20 transition cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );

  return ReactDOM.createPortal(modalNode, document.body);
}
