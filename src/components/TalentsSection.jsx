import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  Radio, 
  Clock, 
  Calendar, 
  Sparkles, 
  ExternalLink, 
  Share2, 
  Search, 
  X, 
  Info,
  Check
} from 'lucide-react';
import { getActiveTalents } from '../services/talentsData';
import { STATION_INFO } from '../services/api';
import Emoji3D from './Emoji3D';
import TalentDetailModal from './TalentDetailModal';

export default function TalentsSection() {
  const [talents, setTalents] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedTalent, setSelectedTalent] = useState(null);

  const loadTalents = () => {
    setTalents(getActiveTalents());
  };

  useEffect(() => {
    loadTalents();
    const handleUpdate = () => loadTalents();
    window.addEventListener('neblina_talents_updated', handleUpdate);
    return () => window.removeEventListener('neblina_talents_updated', handleUpdate);
  }, []);

  const filteredTalents = talents.filter(t => {
    const term = search.toLowerCase().trim();
    if (!term) return true;
    return (
      t.name.toLowerCase().includes(term) ||
      (t.role && t.role.toLowerCase().includes(term)) ||
      (t.showName && t.showName.toLowerCase().includes(term)) ||
      (t.bio && t.bio.toLowerCase().includes(term))
    );
  });

  return (
    <section className="py-4 space-y-6">
      
      {/* Cabecera Principal Inspirada en Mix Radio Locutores & Apple Media */}
      <div className="relative rounded-2xl glass-card p-6 sm:p-10 overflow-hidden shadow-sm">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-cyan-500/10 dark:bg-[#00DD9E]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-teal-500/10 dark:bg-[#00DD9E]/08 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-emerald-500/10 dark:bg-[#00DD9E]/15 text-emerald-700 dark:text-[#00DD9E] text-xs font-black uppercase tracking-wider mb-3 border border-emerald-500/20">
              <Emoji3D name="microphone" className="w-4 h-4 inline-block" alt="Micrófono" />
              <span>Voces & Staff Oficial</span>
            </div>
            
            <h2 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-slate-900 dark:text-white tracking-tight">
              Nuestros Talentos
            </h2>
            
            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 mt-2 leading-relaxed font-medium">
              Conoce a los locutores, periodistas, animadores y DJs que le dan vida y ritmo a cada momento en <strong>Neblina Stereo 105.5 FM</strong> desde Santo Domingo para todo el Páramo merideño.
            </p>
          </div>

          {/* Barra de Búsqueda Rápida */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar locutor o programa..."
              className="w-full pl-9 pr-8 py-2.5 rounded-full text-xs bg-slate-100/90 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00DD9E]/40 transition"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid de Talentos con Formato de Tarjetas Apple Glass Squircle */}
      {filteredTalents.length === 0 ? (
        <div className="rounded-2xl glass-card p-12 text-center text-slate-500 dark:text-slate-400 space-y-3">
          <Mic className="w-10 h-10 mx-auto text-slate-400 opacity-60" />
          <p className="text-base font-bold">No se encontraron locutores que coincidan con la búsqueda.</p>
          <button 
            onClick={() => setSearch('')}
            className="text-xs text-[#0066cc] dark:text-[#00DD9E] font-semibold underline cursor-pointer"
          >
            Ver todos los talentos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTalents.map((talent) => (
            <article 
              key={talent.id}
              className="group rounded-2xl glass-card overflow-hidden border border-slate-200/90 dark:border-white/10 hover:border-emerald-500/40 dark:hover:border-[#00DD9E]/40 transition-all duration-300 shadow-sm flex flex-col justify-between"
            >
              <div>
                {/* Contenedor de la Foto HD */}
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-900">
                  <img 
                    src={talent.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80'} 
                    alt={talent.name}
                    className="w-full h-full object-cover object-top group-hover:-translate-y-0.5 transition-transform duration-500"
                    loading="lazy"
                    decoding="async"
                  />
                  
                  {/* Degradado para legibilidad */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Badge de Programa en Vivo / Horario sobre la Foto */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                    <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-white/20 text-[#00DD9E] flex items-center space-x-1">
                      <Radio className="w-3 h-3 text-[#00DD9E]" />
                      <span className="truncate max-w-[150px]">{talent.showName}</span>
                    </span>

                    {talent.featuredInHome && (
                      <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-lg bg-amber-500 text-slate-950 shadow-xs">
                        Destacado
                      </span>
                    )}
                  </div>
                </div>

                {/* Contenido de la Tarjeta */}
                <div className="p-5 sm:p-6 space-y-3">
                  <div>
                    <h3 className="font-display font-black text-lg sm:text-xl text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight group-hover:text-emerald-600 dark:group-hover:text-[#00DD9E] transition-colors">
                      {talent.name}
                    </h3>
                    
                    <p className="text-xs font-bold text-emerald-600 dark:text-[#00DD9E] uppercase tracking-wide mt-0.5">
                      {talent.role || 'Locutor & Productor'}
                    </p>
                  </div>

                  {/* Horario del Programa */}
                  <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-100/80 dark:bg-white/5 px-3 py-2 rounded-xl border border-slate-200/60 dark:border-white/5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="font-medium text-[11px] sm:text-xs truncate">{talent.showSchedule}</span>
                  </div>

                  {/* Pequeña Biografía */}
                  <p className="text-xs text-slate-700 dark:text-slate-200 line-clamp-3 leading-relaxed font-medium">
                    {talent.bio}
                  </p>
                </div>
              </div>

              {/* Barra Inferior: Redes Sociales & Botón de Perfil */}
              <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2">
                
                {/* Redes Sociales Oficiales del Locutor en Formato 3D Estilo iOS */}
                <div className="flex items-center space-x-2">
                  {/* WhatsApp */}
                  {talent.socialLinks?.whatsapp && (
                    <a
                      href={`https://wa.me/${talent.socialLinks.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${talent.name}, te escucho a través de Neblina Stereo 105.5 FM!`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:scale-120 active:scale-95 transition-transform duration-200 cursor-pointer p-0.5"
                      title={`WhatsApp de ${talent.name}`}
                      aria-label="WhatsApp"
                    >
                      <Emoji3D name="whatsapp" className="w-6 h-6 sm:w-6.5 sm:h-6.5 drop-shadow-sm" />
                    </a>
                  )}

                  {/* Instagram */}
                  {talent.socialLinks?.instagram && (
                    <a
                      href={talent.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:scale-120 active:scale-95 transition-transform duration-200 cursor-pointer p-0.5"
                      title={`Instagram de ${talent.name}`}
                      aria-label="Instagram"
                    >
                      <Emoji3D name="instagram" className="w-6 h-6 sm:w-6.5 sm:h-6.5 drop-shadow-sm" />
                    </a>
                  )}

                  {/* Facebook */}
                  {talent.socialLinks?.facebook && (
                    <a
                      href={talent.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:scale-120 active:scale-95 transition-transform duration-200 cursor-pointer p-0.5"
                      title={`Facebook de ${talent.name}`}
                      aria-label="Facebook"
                    >
                      <Emoji3D name="facebook" className="w-6 h-6 sm:w-6.5 sm:h-6.5 drop-shadow-sm" />
                    </a>
                  )}

                  {/* Twitter / X */}
                  {talent.socialLinks?.twitter && (
                    <a
                      href={talent.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:scale-120 active:scale-95 transition-transform duration-200 cursor-pointer p-0.5"
                      title={`X de ${talent.name}`}
                      aria-label="Twitter"
                    >
                      <Emoji3D name="x" className="w-6 h-6 sm:w-6.5 sm:h-6.5 drop-shadow-sm" />
                    </a>
                  )}
                </div>

                {/* Botón Píldora Ver Perfil */}
                <button
                  onClick={() => setSelectedTalent(talent)}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white dark:bg-white/10 dark:text-white hover:bg-emerald-600 dark:hover:bg-[#00DD9E] dark:hover:text-slate-950 transition-all cursor-pointer shadow-xs"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Ver Perfil</span>
                </button>
              </div>

            </article>
          ))}
        </div>
      )}

      {/* Modal Detallado de Perfil del Talento con Portal al Body */}
      {selectedTalent && (
        <TalentDetailModal 
          talent={selectedTalent} 
          onClose={() => setSelectedTalent(null)} 
        />
      )}

    </section>
  );
}
