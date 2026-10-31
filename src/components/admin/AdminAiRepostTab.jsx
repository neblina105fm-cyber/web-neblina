import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ExternalLink, 
  Check, 
  Eye, 
  Edit3, 
  Share2, 
  Send, 
  Search, 
  Tag, 
  Globe, 
  Layers, 
  ChevronRight, 
  ArrowLeft,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Filter,
  CheckCheck,
  RotateCcw
} from 'lucide-react';
import { 
  getAllNewsSources,
  addCustomNewsSource,
  deleteCustomNewsSource,
  FEED_CATEGORIES, 
  INITIAL_REPOST_CATALOG, 
  checkIsMunicipalPáramo,
  generateAiRepostModels 
} from '../../services/aiRepostService';
import { getAllCategories } from '../../services/newsCategoriesService';
import { saveNewsItem } from '../../services/newsData';
import Emoji3D from '../Emoji3D';

export default function AdminAiRepostTab({ onShowToast, onNewsPublished }) {
  // Lista de portales (oficiales + personalizados)
  const [sources, setSources] = useState(() => getAllNewsSources());
  const [isManagePortalsOpen, setIsManagePortalsOpen] = useState(false);
  const [newPortalForm, setNewPortalForm] = useState({
    name: '',
    url: '',
    domain: '',
    logo: ''
  });

  // Filtros de navegación
  const [selectedSourceId, setSelectedSourceId] = useState('all'); // 'all' | id del portal
  const [searchTerm, setSearchTerm] = useState('');

  // Noticia seleccionada para preparar y repostear
  const [selectedArticle, setSelectedArticle] = useState(null);
  
  // Índice del modelo de IA elegido (0: Modelo A, 1: Modelo B, 2: Modelo C)
  const [chosenModelIndex, setChosenModelIndex] = useState(0);

  // Modo edición previa antes de publicar
  const [isEditing, setIsEditing] = useState(false);
  const [editableTitle, setEditableTitle] = useState('');
  const [editableParagraph1, setEditableParagraph1] = useState('');
  const [editableParagraph2, setEditableParagraph2] = useState('');
  const [editableParagraph3, setEditableParagraph3] = useState('');
  const [targetCategory, setTargetCategory] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Estados visuales de animación interactiva y microfeedback
  const [isPublishing, setIsPublishing] = useState(false);
  const [justSwitchedModel, setJustSwitchedModel] = useState(false);

  // Categorías de la página del usuario
  const siteCategories = getAllCategories();

  // Filtrado de noticias del catálogo
  const filteredCatalog = INITIAL_REPOST_CATALOG.filter(item => {
    // Filtro por portal
    if (selectedSourceId !== 'all' && item.sourceId !== selectedSourceId) {
      return false;
    }
    // Búsqueda por texto
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      const matchTitle = item.originalTitle.toLowerCase().includes(q);
      const matchAi = item.aiModels.some(m => m.title.toLowerCase().includes(q) || m.paragraphs.some(p => p.toLowerCase().includes(q)));
      if (!matchTitle && !matchAi) return false;
    }
    return true;
  });

  // Agregar nuevo portal
  const handleAddPortal = (e) => {
    e.preventDefault();
    if (!newPortalForm.name.trim() || !newPortalForm.url.trim()) {
      alert('Por favor introduce el nombre y la URL del portal.');
      return;
    }
    addCustomNewsSource(newPortalForm);
    setSources(getAllNewsSources());
    setNewPortalForm({ name: '', url: '', domain: '', logo: '' });
    setIsManagePortalsOpen(false);
    if (onShowToast) onShowToast('¡Portal agregado con éxito!');
  };

  // Eliminar portal
  const handleDeletePortal = (portalId, portalName) => {
    if (window.confirm(`¿Eliminar el portal "${portalName}"?`)) {
      deleteCustomNewsSource(portalId);
      setSources(getAllNewsSources());
      if (selectedSourceId === portalId) setSelectedSourceId('all');
      if (onShowToast) onShowToast(`Portal "${portalName}" eliminado.`);
    }
  };

  // Al abrir una noticia para repostear
  const handleSelectArticle = (art) => {
    setSelectedArticle(art);
    setChosenModelIndex(0);
    setIsEditing(false);
    setSelectedImageIndex(0);

    const m = art.aiModels[0];
    setEditableTitle(m.title);
    setEditableParagraph1(m.paragraphs[0] || '');
    setEditableParagraph2(m.paragraphs[1] || '');
    setEditableParagraph3(m.paragraphs[2] || '');
    
    // Categoría destino sugerida según tu página
    const foundCat = siteCategories.find(c => c.name.toLowerCase() === (art.suggestedCategory || '').toLowerCase());
    setTargetCategory(foundCat ? foundCat.name : (siteCategories[0]?.name || 'Noticias'));

    // Desplazamiento fluido y foco en vista móvil
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  // Al cambiar entre los 3 modelos generados por IA (Microinteracción suave de transición)
  const handleSwitchModel = (idx) => {
    setChosenModelIndex(idx);
    setJustSwitchedModel(true);
    setTimeout(() => setJustSwitchedModel(false), 240);

    const m = selectedArticle.aiModels[idx];
    setEditableTitle(m.title);
    setEditableParagraph1(m.paragraphs[0] || '');
    setEditableParagraph2(m.paragraphs[1] || '');
    setEditableParagraph3(m.paragraphs[2] || '');
  };

  // Publicar la nota en la página web con animación de confirmación
  const handlePublishToSite = () => {
    if (!editableTitle.trim()) {
      alert('Por favor indica un titular.');
      return;
    }

    setIsPublishing(true);

    const source = sources.find(s => s.id === selectedArticle.sourceId) || { name: 'Portal Digital', shortName: 'Prensa' };
    
    // Contenido estructurado con exactamente 3 párrafos y la cortesía oficial
    const finalContent = `
      <p class="mb-4 text-base leading-relaxed font-normal">${editableParagraph1.trim()}</p>
      <p class="mb-4 text-base leading-relaxed font-normal">${editableParagraph2.trim()}</p>
      <p class="mb-6 text-base leading-relaxed font-normal">${editableParagraph3.trim()}</p>
      
      <div class="my-6 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="flex items-center space-x-2">
          <span class="text-xs text-slate-500 font-semibold">Fuente Informativa:</span>
          <span class="text-xs font-black text-slate-800 dark:text-white">${source.name}</span>
        </div>
        <a 
          href="${selectedArticle.originalUrl}" 
          target="_blank" 
          rel="noopener noreferrer"
          class="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-[#001E4D] dark:bg-[#00DD9E] text-white dark:text-[#001E4D] text-xs font-black shadow-xs hover:opacity-90 transition"
        >
          <span>Leer en ${source.shortName}</span>
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
        </a>
      </div>
    `.trim();

    const selectedImg = selectedArticle.images[selectedImageIndex] || selectedArticle.images[0];

    const newPost = {
      id: `repost_${Date.now()}`,
      title: editableTitle.trim(),
      excerpt: editableParagraph1.slice(0, 160) + '...',
      content: finalContent,
      category: targetCategory || 'Noticias',
      categories: [targetCategory || 'Noticias'],
      image: selectedImg,
      images: selectedArticle.images,
      author: `Redacción (${source.shortName})`,
      publishedDate: new Date().toISOString(),
      date: new Date().toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'published',
      featured: false,
      isAiRepost: true,
      courtesyPortal: source.name,
      courtesyUrl: selectedArticle.originalUrl
    };

    setTimeout(() => {
      saveNewsItem(newPost);
      setIsPublishing(false);

      if (onShowToast) {
        onShowToast(`Nota de prensa publicada exitosamente en "${targetCategory}".`);
      }
      if (onNewsPublished) {
        onNewsPublished(newPost);
      }

      // Regresar a la lista de notas con estado limpio
      setSelectedArticle(null);
    }, 400);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 transition-colors duration-300">
      
      {/* ========================================================================= */}
      {/* BARRA DE NAVEGACIÓN Y SELECTOR DE PORTALES EXTERNOS                       */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
              <Globe className="w-4 h-4 text-[#00DD9E]" />
              <span>Portales de Origen ({sources.length} medios configurados)</span>
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Filtra las notas por portal o administra los portales registrados
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsManagePortalsOpen(!isManagePortalsOpen)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-white font-bold text-xs transition cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-500" />
              <span>{isManagePortalsOpen ? 'Ocultar Gestión de Portales' : 'Administrar Portales'}</span>
            </button>
          </div>
        </div>

        {/* Panel Desplegable: Administrar y Agregar Portales */}
        {isManagePortalsOpen && (
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2.5">
              <h4 className="font-display font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
                <Globe className="w-4 h-4 text-emerald-500" />
                <span>Gestión de Portales Informativos</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsManagePortalsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Formulario Agregar Portal */}
            <form onSubmit={handleAddPortal} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre del Portal *</label>
                <input
                  type="text"
                  placeholder="Ej: Diario Los Andes"
                  value={newPortalForm.name}
                  onChange={(e) => setNewPortalForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">URL Oficial *</label>
                <input
                  type="url"
                  placeholder="https://diariolosandes.com"
                  value={newPortalForm.url}
                  onChange={(e) => setNewPortalForm(prev => ({ ...prev, url: e.target.value }))}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Dominio (Opcional)</label>
                <input
                  type="text"
                  placeholder="diariolosandes.com"
                  value={newPortalForm.domain}
                  onChange={(e) => setNewPortalForm(prev => ({ ...prev, domain: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Logo / Favicon URL</label>
                  <input
                    type="url"
                    placeholder="https://.../favicon.ico"
                    value={newPortalForm.logo}
                    onChange={(e) => setNewPortalForm(prev => ({ ...prev, logo: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shrink-0 cursor-pointer shadow-xs"
                >
                  + Agregar
                </button>
              </div>
            </form>

            {/* Listado de Portales Personalizados */}
            {sources.some(s => s.isCustom) && (
              <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-2">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Portales Personalizados Agregados:
                </p>
                <div className="flex flex-wrap gap-2">
                  {sources.filter(s => s.isCustom).map(cp => (
                    <div key={cp.id} className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs">
                      <span className="font-bold text-slate-800 dark:text-white">{cp.name}</span>
                      <button
                        type="button"
                        onClick={() => handleDeletePortal(cp.id, cp.name)}
                        className="text-rose-500 hover:text-rose-700 text-xs font-bold"
                        title="Eliminar portal"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Portales con scroll suave y estados táctiles óptimos */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {/* Opción Todos */}
          <button
            type="button"
            onClick={() => setSelectedSourceId('all')}
            className={`p-2.5 px-4 rounded-2xl border flex items-center space-x-2 text-center transition-all duration-200 cursor-pointer active:scale-95 shrink-0 ${
              selectedSourceId === 'all'
                ? 'bg-[#001E4D] text-[#00DD9E] border-[#00DD9E] dark:bg-[#00DD9E] dark:text-[#001E4D] shadow-md font-bold'
                : 'bg-white/80 dark:bg-[#19222e]/80 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-white/10 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span className="text-xs font-bold">Todos los Portales</span>
          </button>

          {/* Portales individuales */}
          {sources.map((src) => {
            const isSelected = selectedSourceId === src.id;
            return (
              <button
                key={src.id}
                type="button"
                onClick={() => setSelectedSourceId(src.id)}
                className={`p-2 px-3.5 rounded-2xl border flex items-center space-x-2 text-center transition-all duration-200 cursor-pointer active:scale-95 shrink-0 ${
                  isSelected
                    ? 'bg-[#001E4D] text-[#00DD9E] border-[#00DD9E] dark:bg-[#00DD9E] dark:text-[#001E4D] shadow-md font-bold'
                    : 'bg-white/80 dark:bg-[#19222e]/80 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-white/10 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
                title={src.description}
              >
                {src.logo && (
                  <img
                    src={src.logo}
                    alt={src.name}
                    className="w-4 h-4 rounded-sm object-contain"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                )}
                <span className="text-xs font-bold whitespace-nowrap">
                  {src.badge || src.shortName || src.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Buscador Rápido con Input Apple */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar en el catálogo de notas por título o tema..."
            className="w-full pl-8 pr-3 py-2 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00DD9E]/50 transition-all"
          />
        </div>

        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">
          {filteredCatalog.length} nota(s) encontradas
        </span>
      </div>

      {/* ========================================================================= */}
      {/* VISTA 1: LISTADO DE NOTAS DISPONIBLES PARA REPOSTEAR                     */}
      {/* ========================================================================= */}
      {!selectedArticle && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
          {filteredCatalog.map((art) => {
            const source = sources.find(s => s.id === art.sourceId) || { name: 'Portal Web', badge: 'Prensa' };
            const m = art.aiModels[0];

            return (
              <div
                key={art.id}
                className="rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-[#19222e]/90 backdrop-blur-xl p-4 flex flex-col justify-between space-y-3.5 shadow-xs hover:shadow-lg transition-all duration-240 hover:-translate-y-1 group"
              >
                <div className="space-y-3">
                  {/* Imagen y Badges */}
                  <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-100 dark:bg-black/40">
                    <img
                      src={art.images[0]}
                      alt={art.originalTitle}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5">
                      <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-[#001E4D]/90 text-white backdrop-blur-md shadow-xs">
                        {source.badge}
                      </span>
                      {art.feedCategory === 'municipales' && (
                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 shadow-xs">
                          Páramo
                        </span>
                      )}
                    </div>
                    <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/70 text-white backdrop-blur-md">
                      {art.publishedDate}
                    </span>
                  </div>

                  {/* Título original de la fuente */}
                  <h4 className="font-display font-black text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug">
                    {art.originalTitle}
                  </h4>

                  {/* Resumen sintetizado en 3 párrafos por IA */}
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {m.excerpt}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2">
                  <a
                    href={art.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-slate-400 hover:text-emerald-500 dark:hover:text-[#00DD9E] flex items-center space-x-1 transition-colors"
                    title="Ver nota en el portal original"
                  >
                    <span>Fuente original</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleSelectArticle(art)}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-[#00DD9E] hover:opacity-95 text-slate-950 font-black text-xs shadow-xs transition-all duration-180 active:scale-95 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Preparar Reposteo</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 2: PREVISUALIZADOR, COMPARADOR DE 3 MODELOS Y EDITOR               */}
      {/* ========================================================================= */}
      {selectedArticle && (
        <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#19222e] border-2 border-emerald-500/40 shadow-2xl space-y-6 animate-fadeIn transition-colors">
          
          {/* Cabecera del Editor con Acciones Superiores */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-white transition active:scale-95 cursor-pointer"
                title="Volver al catálogo"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-[#00DD9E] uppercase tracking-wider block">
                  Cortesía: {sources.find(s => s.id === selectedArticle.sourceId)?.name}
                </span>
                <h4 className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-white">
                  Vista y Edición de Nota de Prensa
                </h4>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-180 active:scale-95 cursor-pointer ${
                  isEditing
                    ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                    : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white border-slate-300 dark:border-white/20 hover:bg-slate-200'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Ver Vista Previa' : 'Editar Nota de Prensa'}</span>
              </button>

              <button
                type="button"
                onClick={handlePublishToSite}
                disabled={isPublishing}
                className="inline-flex items-center space-x-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00DD9E] hover:opacity-95 text-slate-950 font-black text-xs shadow-md transition-all duration-180 active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isPublishing ? 'Publicando...' : 'Publicar en la Web'}</span>
              </button>
            </div>
          </div>

          {/* SELECCIÓN DE CATEGORÍA DE TU PÁGINA E IMAGEN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Publicar en Categoría de mi Página *
              </label>
              <select
                value={targetCategory}
                onChange={(e) => setTargetCategory(e.target.value)}
                className="w-full text-xs font-bold px-3 py-2 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                {siteCategories.map(cat => (
                  <option key={cat.id || cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                La nota se publicará directamente en esta sección de tu sitio web.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Seleccionar Imagen Principal de la Nota
              </label>
              <div className="flex items-center space-x-2 pt-0.5">
                {selectedArticle.images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImageIndex(i)}
                    className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 transition-all duration-180 active:scale-95 cursor-pointer ${
                      selectedImageIndex === i ? 'border-emerald-500 shadow-md scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Opción" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* VISTA PREVIA O EDITOR DE LOS 3 PÁRRAFOS */}
          <div className={`transition-opacity duration-240 ${justSwitchedModel ? 'opacity-50' : 'opacity-100'}`}>
            {isEditing ? (
              <div className="space-y-4 p-5 rounded-2xl border border-purple-500/30 bg-purple-500/5 animate-fadeIn">
                <h5 className="font-bold text-xs text-purple-700 dark:text-purple-300 flex items-center space-x-1.5">
                  <Edit3 className="w-4 h-4" />
                  <span>Editor de Texto de la Nota de Prensa</span>
                </h5>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Titular Atractivo (Sin Amarillismo)
                  </label>
                  <input
                    type="text"
                    value={editableTitle}
                    onChange={(e) => setEditableTitle(e.target.value)}
                    className="w-full text-xs font-bold px-3 py-2.5 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Párrafo 1 (Entrada & Contexto Principal)
                  </label>
                  <textarea
                    rows="3"
                    value={editableParagraph1}
                    onChange={(e) => setEditableParagraph1(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white leading-relaxed focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Párrafo 2 (Desarrollo, Detalles y Datos Clave)
                  </label>
                  <textarea
                    rows="3"
                    value={editableParagraph2}
                    onChange={(e) => setEditableParagraph2(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white leading-relaxed focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Párrafo 3 (Cierre & Repercusión / Llamado Institucional)
                  </label>
                  <textarea
                    rows="3"
                    value={editableParagraph3}
                    onChange={(e) => setEditableParagraph3(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white leading-relaxed focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#121820] border border-slate-200 dark:border-white/10 shadow-sm animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Vista Previa Oficial (Cómo se verá en la Web)
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#00DD9E]/20 text-[#00DD9E]">
                    Categoría: {targetCategory}
                  </span>
                </div>

                {/* Imagen Principal */}
                <div className="relative h-60 sm:h-72 rounded-2xl overflow-hidden shadow-inner">
                  <img
                    src={selectedArticle.images[selectedImageIndex] || selectedArticle.images[0]}
                    alt={editableTitle}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-102"
                  />
                </div>

                {/* Titular */}
                <h2 className="font-display font-black text-base sm:text-xl text-slate-900 dark:text-white leading-snug">
                  {editableTitle}
                </h2>

                {/* 3 Párrafos de Texto Redactados por IA */}
                <div className="space-y-3.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  <p className="p-3 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">{editableParagraph1}</p>
                  <p className="p-3 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">{editableParagraph2}</p>
                  <p className="p-3 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">{editableParagraph3}</p>
                </div>

                {/* Botón de Cortesía Oficial con Logo del Portal */}
                {(() => {
                  const source = sources.find(s => s.id === selectedArticle.sourceId) || { name: 'Portal', shortName: 'Portal' };
                  return (
                    <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-500">Cortesía Informativa:</span>
                        <span className="text-xs font-black text-slate-800 dark:text-white">{source.name}</span>
                      </div>

                      <a
                        href={selectedArticle.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#001E4D] dark:bg-[#00DD9E] text-white dark:text-[#001E4D] font-bold text-xs shadow-sm hover:scale-105 active:scale-95 transition-all"
                      >
                        {source.logo && <img src={source.logo} alt={source.name} className="w-4 h-4 object-contain rounded-full" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
                        <span>Leer nota original en {source.shortName || source.name}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Botón de Publicación Inferior */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-white/10">
            <button
              type="button"
              onClick={() => setSelectedArticle(null)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition active:scale-95 cursor-pointer"
            >
              Cancelar y Volver
            </button>

            <button
              type="button"
              onClick={handlePublishToSite}
              disabled={isPublishing}
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00DD9E] hover:opacity-95 text-slate-950 font-black text-xs shadow-md transition-all duration-180 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isPublishing ? 'Publicando en la Web...' : 'Confirmar y Publicar en la Web'}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
