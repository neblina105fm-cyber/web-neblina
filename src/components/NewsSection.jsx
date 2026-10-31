import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, 
  RefreshCw, 
  ArrowRight, 
  Share2, 
  Sparkles, 
  Newspaper, 
  Search, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Filter,
  CheckCircle2,
  Images,
  Loader2,
  UserCheck,
  Feather
} from 'lucide-react';
import { 
  fetchWordPressNews, 
  fetchWordPressNewsPaginated, 
  fetchWordPressCategories 
} from '../services/api';
import { getCombinedNews } from '../services/newsData';
import { getAllJournalists, getAllPressNotes } from '../services/journalistsService';
import NewsModal from './NewsModal';
import Emoji3D from './Emoji3D';
import NewsGridAdSlot from './NewsGridAdSlot';

export default function NewsSection({ isHome = false, limit = 9, onSeeAllNews }) {
  // Paginación y Filtrado Oficial de WordPress (neblina105fm.com)
  const [posts, setPosts] = useState(() => isHome ? getCombinedNews().slice(0, limit) : []);
  const [loading, setLoading] = useState(!isHome);
  const [selectedPost, setSelectedPost] = useState(null);
  
  // Estados para la Sala de Prensa completa (!isHome) en lotes de 10 notas
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(91);
  const [totalPosts, setTotalPosts] = useState(901);
  const [perPage, setPerPage] = useState(10); // Lotes estrictos de 10 notas por página
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [selectedJournalistId, setSelectedJournalistId] = useState('all');
  const [journalistsList, setJournalistsList] = useState([]);
  const [categories, setCategories] = useState([
    { id: 'all', name: 'Todas las Notas', count: 901 },
    { id: 'press_notes', name: 'Notas de Prensa', count: 0, isPressCategory: true },
    { id: 1, name: 'Noticias', count: 486 },
    { id: 5, name: 'Mundo Stereo', count: 255 },
    { id: 9, name: 'Titulares Neblina', count: 127 },
    { id: 3, name: 'Zona Stereo', count: 61 },
    { id: 4, name: 'Estrenos', count: 43 },
    { id: 21, name: 'Es Viral', count: 4 }
  ]);

  const topGridRef = useRef(null);

  // Debounce para búsqueda reactiva
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      if (!isHome) {
        setCurrentPage(1); // Volver a página 1 al buscar
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [searchQuery, isHome]);

  // Cargar lista de periodistas y conteos de notas de prensa
  useEffect(() => {
    const refreshJournalists = () => {
      const list = getAllJournalists().filter(j => j.status === 'active');
      setJournalistsList(list);
      const pressNotes = getAllPressNotes().filter(n => !n.trashed && n.status === 'published');
      setCategories(prev => prev.map(c => c.id === 'press_notes' ? { ...c, count: pressNotes.length } : c));
    };
    refreshJournalists();
    window.addEventListener('neblina_journalists_updated', refreshJournalists);
    window.addEventListener('neblina_press_notes_updated', refreshJournalists);
    return () => {
      window.removeEventListener('neblina_journalists_updated', refreshJournalists);
      window.removeEventListener('neblina_press_notes_updated', refreshJournalists);
    };
  }, []);

  // Cargar categorías oficiales de WordPress
  useEffect(() => {
    if (!isHome) {
      fetchWordPressCategories().then(cats => {
        if (Array.isArray(cats) && cats.length > 0) {
          const pressNotes = getAllPressNotes().filter(n => !n.trashed && n.status === 'published');
          setCategories([
            { id: 'all', name: 'Todas las Notas', count: 901 },
            { id: 'press_notes', name: 'Notas de Prensa', count: pressNotes.length, isPressCategory: true },
            ...cats
          ]);
        }
      }).catch(() => {});
    }
  }, [isHome]);

  // Carga de Noticias para Inicio vs Sala de Prensa
  const loadNews = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);

    try {
      if (isHome) {
        // En Inicio cargamos estrictamente las 9 más recientes
        const wpData = await fetchWordPressNews(1, limit);
        if (wpData && wpData.length > 0) {
          const combined = getCombinedNews(wpData).slice(0, limit);
          setPosts(combined);
        } else {
          setPosts(getCombinedNews().slice(0, limit));
        }
      } else {
        // En Sala de Prensa:
        // Caso A: Si el usuario seleccionó "Notas de Prensa" o filtró por un periodista específico
        if (selectedCategoryId === 'press_notes' || selectedJournalistId !== 'all') {
          const allPress = getAllPressNotes().filter(n => !n.trashed && n.status === 'published');
          let filtered = allPress.map(n => ({
            id: n.id,
            title: n.title,
            excerpt: n.excerpt,
            content: n.content,
            category: n.category || 'Notas de Prensa',
            author: n.journalistName,
            date: n.date,
            image: n.image,
            images: n.images || (n.image ? [n.image] : []),
            isPressNote: true,
            journalistId: n.journalistId,
            journalistRole: n.journalistRole,
            link: '#'
          }));

          if (selectedJournalistId !== 'all') {
            filtered = filtered.filter(n => n.journalistId === selectedJournalistId);
          }

          if (debouncedSearch && debouncedSearch.trim()) {
            const q = debouncedSearch.toLowerCase();
            filtered = filtered.filter(n => 
              (n.title && n.title.toLowerCase().includes(q)) ||
              (n.excerpt && n.excerpt.toLowerCase().includes(q)) ||
              (n.author && n.author.toLowerCase().includes(q))
            );
          }

          const total = filtered.length;
          const pages = Math.max(1, Math.ceil(total / perPage));
          const start = (currentPage - 1) * perPage;
          const paginated = filtered.slice(start, start + perPage);

          setPosts(paginated);
          setTotalPosts(total);
          setTotalPages(pages);
        } else {
          // Caso B: Paginación estándar de WordPress con notas locales combinadas
          const result = await fetchWordPressNewsPaginated({
            page: currentPage,
            perPage: perPage,
            search: debouncedSearch,
            categoryId: selectedCategoryId === 'all' ? null : selectedCategoryId
          });

          if (result && result.posts && result.posts.length > 0) {
            setPosts(result.posts);
            setTotalPosts(result.totalPosts || 901);
            setTotalPages(result.totalPages || Math.ceil((result.totalPosts || 901) / perPage));
          } else if (debouncedSearch || selectedCategoryId !== 'all') {
            setPosts([]);
            setTotalPosts(0);
            setTotalPages(1);
          } else {
            // Fallback a noticias iniciales
            const localFallback = getCombinedNews();
            setPosts(localFallback);
          }
        }
      }
    } catch (e) {
      console.warn('Error cargando noticias de WordPress:', e);
      if (posts.length === 0) {
        setPosts(getCombinedNews().slice(0, isHome ? limit : 12));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews(true);

    const handleNewsUpdate = () => {
      loadNews(false);
    };

    window.addEventListener('neblina_news_updated', handleNewsUpdate);
    window.addEventListener('neblina_press_notes_updated', handleNewsUpdate);
    return () => {
      window.removeEventListener('neblina_news_updated', handleNewsUpdate);
      window.removeEventListener('neblina_press_notes_updated', handleNewsUpdate);
    };
  }, [isHome, currentPage, debouncedSearch, selectedCategoryId, selectedJournalistId, perPage]);

  // Manejo de cambio de página con desplazamiento suave hacia el inicio del grid
  
  // Sincronización automática periódica en segundo plano cada 45 segundos sin recargar toda la vista
  useEffect(() => {
    const autoRefreshTimer = setInterval(() => {
      // Sincronizar en background en silencio (showSpinner = false)
      loadNews(false);
    }, 45000);
    return () => clearInterval(autoRefreshTimer);
  }, [isHome, currentPage, debouncedSearch, selectedCategoryId, perPage]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);
    if (topGridRef.current) {
      topGridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Generador inteligente de botones de paginación estilo Apple
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      buttons.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-xs font-bold bg-white dark:bg-[#111923] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition"
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(
          <span key="dots-start" className="px-1 text-slate-400 font-bold text-xs">
            •••
          </span>
        );
      }
    }

    for (let p = startPage; p <= endPage; p++) {
      const isActive = p === currentPage;
      buttons.push(
        <button
          key={p}
          onClick={() => handlePageChange(p)}
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-xs font-black transition cursor-pointer ${
            isActive
              ? 'bg-[#001E4D] text-[#00DD9E] dark:bg-[#00DD9E] dark:text-[#001E4D] shadow-md scale-105 border border-[#00DD9E]/50'
              : 'bg-white dark:bg-[#001E4D]/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10'
          }`}
        >
          {p}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="dots-end" className="px-1 text-slate-400 font-bold text-xs">
            •••
          </span>
        );
      }
      buttons.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-xs font-bold bg-white dark:bg-[#111923] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition"
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  return (
    <section className="py-4" ref={topGridRef}>
      {/* Encabezado Principal */}
      <div className="flex flex-col gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-white/10">
        
        {/* Fila Superior: Título + Contador + Botón Actualizar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <Emoji3D 
              name="newspaper" 
              className="w-9 h-9 sm:w-10 sm:h-10 object-contain drop-shadow-[0_8px_16px_rgba(0,30,77,0.3)] hover:scale-110 transition-transform shrink-0" 
              alt="Noticias" 
            />
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-display font-extrabold text-base sm:text-xl text-slate-900 dark:text-white uppercase tracking-wider">
                  {isHome ? 'Últimas Noticias' : 'Sala de Prensa & Noticias'}
                </h2>
                <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-[#00DD9E]/15 text-[#001E4D] dark:text-[#00DD9E] border border-[#00DD9E]/30">
                  {isHome ? '9 Recientes' : `${totalPosts} Publicaciones`}
                </span>
              </div>
              {isHome && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Información veraz y al instante desde Santo Domingo, Mérida y Venezuela
                </p>
              )}
            </div>
          </div>

          {/* Acciones de Cabecera */}
          <div className="flex items-center space-x-2 self-start sm:self-auto">
            {isHome && onSeeAllNews && (
              <button
                onClick={onSeeAllNews}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-[#001E4D] dark:bg-[#00DD9E] text-[#00DD9E] dark:text-[#001E4D] text-xs font-black hover:opacity-90 transition cursor-pointer"
              >
                <span>Ver todas las noticias</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            
          </div>
        </div>

        {/* Fila Secundaria para la Página Dedicada: Buscador en Tiempo Real + Selector de Categorías */}
        {!isHome && (
          <div className="space-y-3 pt-1">
            {/* Buscador Rápido con Input Apple */}
            <div className="relative max-w-xl">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar entre las 901 noticias (título, lugar, suceso)..."
                className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white dark:bg-[#001438] border border-slate-200 dark:border-[#00DD9E]/25 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00DD9E] shadow-sm transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Categorías Oficiales de WordPress en Pills Desplazables */}
            <div className="w-full">
              {/* Categorías Oficiales sin sombras pesadas, con bordes limpios y fluidos */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none w-full">
                {categories.map((cat) => {
                  const isSelected = selectedCategoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategoryId(cat.id);
                        setCurrentPage(1);
                      }}
                      className={`shrink-0 flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer border ${
                        isSelected
                          ? 'bg-[#001E4D] text-[#00DD9E] dark:bg-[#00DD9E] dark:text-[#001E4D] border-[#001E4D] dark:border-[#00DD9E]'
                          : 'bg-white/80 dark:bg-[#001E4D]/40 text-slate-700 dark:text-slate-300 hover:text-[#001E4D] dark:hover:text-[#00DD9E] border-slate-200/80 dark:border-white/10 hover:border-slate-300'
                      }`}
                    >
                      {cat.isPressCategory && <Feather className="w-3.5 h-3.5" />}
                      <span>{cat.name}</span>
                      {cat.count !== undefined && (
                        <span className={`text-[11px] px-1.5 py-0.2 rounded-lg font-bold ${
                          isSelected 
                            ? 'bg-white/20 text-[#00DD9E] dark:bg-[#001E4D]/20 dark:text-[#001E4D]' 
                            : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400'
                        }`}>
                          {cat.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grid de Noticias (3 Columnas Desktop, 2 Tablet, 1 Móvil) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          // Skeleton Loader de Alta Fidelidad
          Array.from({ length: isHome ? 9 : 6 }).map((_, idx) => (
            <div key={idx} className="rounded-2xl bg-white dark:bg-[#0c1b29] border border-slate-200 dark:border-white/10 p-4 animate-pulse">
              <div className="w-full h-44 bg-slate-200 dark:bg-white/5 rounded-2xl mb-4"></div>
              <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-1/3 mb-2"></div>
              <div className="h-5 bg-slate-200 dark:bg-white/10 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-slate-200 dark:bg-white/5 rounded w-full mb-1"></div>
              <div className="h-3 bg-slate-200 dark:bg-white/5 rounded w-2/3"></div>
            </div>
          ))
        ) : posts.length === 0 ? (
          // Estado Vacío con sugerencia de búsqueda
          <div className="col-span-full text-center py-16 bg-white dark:bg-[#0c141f] rounded-2xl border border-slate-200 dark:border-white/10 px-4">
            <Emoji3D name="newspaper" className="w-12 h-12 mx-auto mb-3 drop-shadow-md opacity-70" alt="Noticias" />
            <h3 className="font-display font-bold text-base text-slate-800 dark:text-white mb-1">
              No se encontraron notas de prensa
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
              {debouncedSearch 
                ? `No hay resultados para "${debouncedSearch}". Intenta con otra palabra clave.`
                : 'No hay notas disponibles en esta categoría actualmente.'}
            </p>
            {debouncedSearch && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold transition hover:opacity-90"
              >
                Limpiar Búsqueda
              </button>
            )}
          </div>
        ) : (
          // Render de Tarjetas de Noticias
          <>
            {posts.map((post) => (
              <article
                key={post.id}
                className="group rounded-2xl glass-card overflow-hidden hover:border-[#00DD9E]/60 transition-all duration-300 flex flex-col hover:shadow-xl shadow-sm"
              >
                {/* Imagen Destacada */}
                <div 
                  className="relative h-44 overflow-hidden bg-slate-900 cursor-pointer"
                  onClick={() => setSelectedPost(post)}
                >
                  <img
                    src={post.image}
                    alt={post.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:-translate-y-0.5 transition-transform duration-500"
                    onError={(e) => { 
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/default-cover.png'; 
                    }}
                  />
                  <span className="absolute top-3 left-3 bg-[#001E4D]/65 dark:bg-[#001E4D]/70 backdrop-blur-xl px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider text-[#00DD9E] border border-[#00DD9E]/45 shadow-[0_4px_14px_rgba(0,0,0,0.3)]">
                    {post.category}
                  </span>

                  {/* Badge de Nota de Prensa Oficial Redactada por Periodista */}
                  {post.isPressNote && (
                    <span className="absolute bottom-3 left-3 bg-[#001E4D]/85 dark:bg-[#00DD9E]/20 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-black text-white dark:text-[#00DD9E] border border-[#00DD9E]/40 flex items-center space-x-1 shadow-sm">
                      <Feather className="w-3 h-3 text-[#00DD9E]" />
                      <span>Nota de Prensa</span>
                    </span>
                  )}

                  {/* Badge de Fotos Múltiples para Carrusel */}
                  {post.images && post.images.length > 1 && (
                    <span className="absolute top-3 right-3 bg-black/75 backdrop-blur-md px-2 py-1 rounded-lg text-[11px] font-bold text-white border border-white/20 flex items-center space-x-1 shadow-sm">
                      <Images className="w-3 h-3 text-[#00DD9E]" />
                      <span>{post.images.length} fotos</span>
                    </span>
                  )}
                </div>

                {/* Contenido de la Tarjeta */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5 text-xs text-slate-600 dark:text-slate-300 mb-2">
                      <Calendar className="w-3.5 h-3.5 text-[#001E4D] dark:text-[#00DD9E]" />
                      <span>{post.date}</span>
                      {post.author && (
                        <>
                          <span className="text-slate-400 dark:text-white/20">·</span>
                          <span className="truncate max-w-[140px] font-semibold text-slate-700 dark:text-slate-300">
                            {post.author}
                          </span>
                        </>
                      )}
                    </div>

                    <h3 
                      onClick={() => setSelectedPost(post)}
                      className="font-display font-bold text-base text-slate-900 dark:text-white group-hover:text-[#00DD9E] dark:group-hover:text-[#00DD9E] transition-colors cursor-pointer line-clamp-2 mb-2 leading-snug"
                    >
                      {post.title}
                    </h3>

                    <p className="text-xs text-slate-700 dark:text-slate-200 line-clamp-3 leading-relaxed mb-4">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedPost(post)}
                      className="flex items-center space-x-1.5 text-[#001E4D] dark:text-[#00DD9E] font-black text-xs hover:underline cursor-pointer"
                    >
                      <span>Leer Noticia</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      neblina105fm.com
                    </span>
                  </div>
                </div>
              </article>
            ))}

            {/* Banner Publicitario en la Cuadrícula para rellenar espacios vacíos (3 columnas en escritorio) */}
            {posts.length > 0 && (posts.length % 3 !== 0) && (
              <NewsGridAdSlot colSpanLg={3 - (posts.length % 3)} />
            )}
          </>
        )}
      </div>

      {/* Barra de Paginación Completa (Solo en la Sala de Prensa completa !isHome) */}
      {!isHome && totalPages > 1 && (
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Indicador de Rango de Noticias en Lotes de 10 */}
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 text-center sm:text-left">
            Mostrando lote de 10 notas · Página <span className="font-black text-slate-900 dark:text-white">{currentPage}</span> de <span className="font-black text-slate-900 dark:text-white">{totalPages}</span> ({totalPosts} notas en total)
          </div>

          {/* Controles de Paginación */}
          <div className="flex items-center space-x-1.5 overflow-x-auto max-w-full pb-1">
            {/* Primera Página */}
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-white dark:bg-[#001E4D]/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Primera Página"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            {/* Página Anterior */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-white dark:bg-[#001E4D]/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Página Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Números de Página */}
            <div className="flex items-center space-x-1">
              {renderPaginationButtons()}
            </div>

            {/* Página Siguiente */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-white dark:bg-[#001E4D]/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Página Siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Última Página */}
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-white dark:bg-[#001E4D]/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Última Página"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Botón Ver Más en Inicio */}
      {isHome && onSeeAllNews && (
        <div className="mt-8 text-center">
          <button
            onClick={onSeeAllNews}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-[#001E4D]/75 hover:bg-[#001E4D]/90 dark:bg-[#00DD9E]/20 dark:hover:bg-[#00DD9E]/30 backdrop-blur-xl text-white dark:text-[#00DD9E] font-extrabold text-xs sm:text-sm -[#001E4D]/15 dark:-[#00DD9E]/15 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border border-[#00DD9E]/45"
          >
            <Newspaper className="w-4 h-4" />
            <span>Visitar sala de prensa</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modal Lector con Botones para Compartir y Embeds de Redes Sociales */}
      {selectedPost && <NewsModal post={selectedPost} onClose={() => setSelectedPost(null)} />}
    </section>
  );
}
