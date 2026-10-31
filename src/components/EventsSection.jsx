import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Tag, 
  ExternalLink, 
  Share2, 
  Search, 
  X, 
  Sparkles, 
  Ticket, 
  User, 
  Phone,
  MessageCircle,
  Radio,
  Check
} from 'lucide-react';
import Emoji3D from './Emoji3D';
import { getActiveEvents, EVENT_CATEGORIES } from '../services/eventsData';
import EventDetailModal from './EventDetailModal';
import TickerCategories from './TickerCategories';

function formatCalendarDate(dateString) {
  try {
    const d = new Date(dateString + 'T00:00:00');
    if (isNaN(d.getTime())) return { day: '--', month: '---' };
    const day = d.getDate();
    const month = d.toLocaleDateString('es-VE', { month: 'short' }).toUpperCase().replace('.', '');
    return { day, month };
  } catch (e) {
    return { day: '--', month: '---' };
  }
}

export default function EventsSection() {
  const [events, setEvents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [copiedEventId, setCopiedEventId] = useState(null);

  const reloadEvents = () => {
    setEvents(getActiveEvents());
  };

  useEffect(() => {
    reloadEvents();
    const handleUpdate = () => reloadEvents();
    window.addEventListener('neblina_events_updated', handleUpdate);
    return () => window.removeEventListener('neblina_events_updated', handleUpdate);
  }, []);

  const handleShare = async (e, event) => {
    e.stopPropagation();
    const shareData = {
      title: event.title,
      text: `${event.title} • ${event.dateDisplay || event.date} en ${event.location}. ¡Conoce más en Neblina Stereo 105.5 FM!`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      setCopiedEventId(event.id);
      setTimeout(() => setCopiedEventId(null), 2500);
    }
  };

  const filteredEvents = events.filter((evt) => {
    const matchesCategory = selectedCategory === 'Todas' || evt.category === selectedCategory;
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term || (
      evt.title.toLowerCase().includes(term) ||
      (evt.location && evt.location.toLowerCase().includes(term)) ||
      (evt.description && evt.description.toLowerCase().includes(term)) ||
      (evt.coordinatorName && evt.coordinatorName.toLowerCase().includes(term))
    );
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="py-4 space-y-5">
      
      {/* 1. Categorías en Teleprómpter Continuo */}
      <div className="w-full">
        <TickerCategories 
          items={EVENT_CATEGORIES}
          selectedId={selectedCategory}
          onSelect={(cat) => setSelectedCategory(cat)}
          speed={26}
        />
      </div>

      {/* 2. Buscador Rápido de Eventos debajo de las Categorías */}
      <div className="relative max-w-xl mx-auto">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input 
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar evento, lugar o fecha..."
          className="w-full pl-9 pr-8 py-2.5 rounded-2xl text-xs bg-white dark:bg-[#001438] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00DD9E]/40 shadow-xs transition"
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 3. Grid de Eventos */}
      {filteredEvents.length === 0 ? (
        <div className="rounded-2xl glass-card p-12 text-center text-slate-500 dark:text-slate-400 space-y-3">
          <Calendar className="w-10 h-10 mx-auto text-slate-400 opacity-60" />
          <p className="text-base font-bold">No se encontraron eventos en esta categoría o búsqueda.</p>
          <button 
            onClick={() => { setSelectedCategory('Todas'); setSearchTerm(''); }}
            className="text-xs text-[#0066cc] dark:text-[#00DD9E] font-semibold underline cursor-pointer"
          >
            Ver toda la cartelera
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const { day, month } = formatCalendarDate(event.date);
            const isOngoing = event.status === 'ongoing';
            const isCompleted = event.status === 'completed';

            const coordinatorWaUrl = event.coordinatorWhatsApp 
              ? `https://wa.me/${event.coordinatorWhatsApp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola, vi el evento "${event.title}" en Neblina 105.5 FM y quisiera consultar detalles / adquirir entradas.`)}`
              : null;

            return (
              <article 
                key={event.id}
                className="group rounded-2xl glass-card overflow-hidden border border-slate-200/90 dark:border-white/10 hover:border-emerald-500/40 dark:hover:border-[#00DD9E]/40 transition-all duration-300 shadow-sm flex flex-col justify-between"
              >
                <div>
                  {/* Flyer Contenedor con Aspecto Vertical 16:10 */}
                  <div 
                    className="relative aspect-[16/10] overflow-hidden bg-slate-900 cursor-pointer"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <img 
                      src={event.flyer || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80'} 
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:-translate-y-0.5 transition-transform duration-500"
                      loading="lazy"
                      decoding="async"
                    />

                    {/* Degradado para Legibilidad */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Bloque Calendario iOS Flotante */}
                    <div className="absolute top-3 left-3 flex flex-col items-center justify-center w-12 h-14 rounded-2xl bg-white/95 dark:bg-slate-950/90 backdrop-blur-md border border-white/30 text-slate-900 dark:text-white shadow-md">
                      <span className="text-[11px] font-black uppercase text-red-500 tracking-wider">
                        {month}
                      </span>
                      <span className="font-display font-black text-lg leading-none mt-0.5">
                        {day}
                      </span>
                    </div>

                    {/* Estado del Evento */}
                    <div className="absolute top-3 right-3 flex items-center space-x-1.5">
                      {isOngoing && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-black uppercase bg-emerald-500 text-slate-950 shadow-md">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
                          <span>Hoy / En Curso</span>
                        </span>
                      )}
                      {event.featuredInHome && !isOngoing && (
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-black uppercase bg-amber-500 text-slate-950 shadow-md">
                          Destacado
                        </span>
                      )}
                      {isCompleted && (
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-black uppercase bg-slate-800 text-slate-300">
                          Finalizado
                        </span>
                      )}
                    </div>

                    {/* Barra Inferior del Flyer: Categoría y Precio */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                      <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-slate-950/70 backdrop-blur-md border border-white/20 text-[#00DD9E] truncate max-w-[170px]">
                        {event.category}
                      </span>

                      <span className="text-[11px] font-extrabold text-amber-300 bg-black/60 px-2 py-0.5 rounded-lg backdrop-blur-sm">
                        {event.isFree ? 'Entrada Libre' : event.admissionPrice}
                      </span>
                    </div>
                  </div>

                  {/* Cuerpo de la Tarjeta */}
                  <div className="p-5 sm:p-6 space-y-3">
                    <h3 
                      onClick={() => setSelectedEvent(event)}
                      className="font-display font-black text-lg sm:text-xl text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight hover:text-emerald-600 dark:hover:text-[#00DD9E] transition-colors cursor-pointer line-clamp-2"
                    >
                      {event.title}
                    </h3>

                    {/* Info de Fecha, Hora y Lugar */}
                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span className="font-semibold truncate">{event.dateDisplay || event.date}</span>
                      </div>

                      {event.time && (
                        <div className="flex items-center space-x-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{event.time}</span>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>

                    {/* Descripción Corta */}
                    <p className="text-xs text-slate-700 dark:text-slate-200 line-clamp-3 leading-relaxed pt-1 font-medium">
                      {event.description}
                    </p>
                  </div>
                </div>

                {/* Acciones del Evento */}
                <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5">
                    
                    {/* Botón Coordinador / WhatsApp Directo */}
                    {coordinatorWaUrl && (
                      <a
                        href={coordinatorWaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:scale-120 active:scale-95 transition-transform duration-200 cursor-pointer p-0.5"
                        title="Contactar al coordinador del evento"
                        aria-label="WhatsApp Coordinador"
                      >
                        <Emoji3D name="whatsapp" className="w-6.5 h-6.5 drop-shadow-sm" />
                      </a>
                    )}

                    {/* Instagram del Evento */}
                    {event.instagram && (
                      <a
                        href={`https://instagram.com/${event.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:scale-120 active:scale-95 transition-transform duration-200 cursor-pointer p-0.5"
                        title="Instagram oficial del evento"
                        aria-label="Instagram"
                      >
                        <Emoji3D name="instagram" className="w-6.5 h-6.5 drop-shadow-sm" />
                      </a>
                    )}

                    {/* Enlace Web del Evento */}
                    {event.eventUrl && (
                      <a
                        href={event.eventUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:scale-120 active:scale-95 transition-transform duration-200 cursor-pointer p-0.5"
                        title="Página web / Boletería oficial"
                        aria-label="Sitio Web"
                      >
                        <Emoji3D name="globe" className="w-6.5 h-6.5 drop-shadow-sm" />
                      </a>
                    )}

                    {/* Botón Compartir Evento */}
                    <button
                      onClick={(e) => handleShare(e, event)}
                      className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-600 dark:text-slate-300 flex items-center justify-center transition"
                      title="Compartir evento"
                    >
                      {copiedEventId === event.id ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Ver Detalles */}
                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white dark:bg-white/10 dark:text-white hover:bg-emerald-600 dark:hover:bg-[#00DD9E] dark:hover:text-slate-950 transition-all cursor-pointer shadow-xs"
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>Ver Detalles</span>
                  </button>
                </div>

              </article>
            );
          })}
        </div>
      )}

      {/* 4. Modal Ficha Técnica de Evento con Portal al Body */}
      {selectedEvent && (
        <EventDetailModal 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
        />
      )}

    </section>
  );
}
