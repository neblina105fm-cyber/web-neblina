import React from 'react';
import { Headphones, Play, Pause, Clock, User, Radio, Sparkles } from 'lucide-react';
import Emoji3D from './Emoji3D';
import { PODCASTS_DATA } from '../services/api';
import { useAudioPlayer } from '../context/AudioPlayerContext';

export default function PodcastsSection() {
  const { 
    playbackType, 
    activePodcast, 
    isPlaying, 
    playPodcast, 
    returnToLive 
  } = useAudioPlayer();

  return (
    <section className="py-8">
      {/* Encabezado */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 text-[#00DD9E] dark:text-[#00DD9E] text-xs font-black uppercase tracking-widest mb-1">
          <Emoji3D name="headphones" className="w-4 h-4 inline-block" alt="Podcasts" />
          <span>Contenido a la Carta</span>
        </div>
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
          Podcasts y Entrevistas Exclusivas
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Escucha reportajes especiales, entrevistas de salud y programas grabados en el reproductor principal.
        </p>
      </div>

      {/* Grid de Podcasts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PODCASTS_DATA.map((pod) => {
          const isCurrentPodcast = playbackType === 'podcast' && activePodcast?.id === pod.id;
          const isThisPlaying = isCurrentPodcast && isPlaying;

          return (
            <div
              key={pod.id}
              className={`p-6 rounded-2xl glass-card border transition-all duration-300 flex flex-col sm:flex-row gap-6 items-center ${
                isCurrentPodcast
                  ? 'border-[#00DD9E] dark:border-[#00DD9E] ring-2 ring-[#00DD9E]/30 dark:ring-[#00DD9E]/30 shadow-xl shadow-[#00DD9E]/10 bg-teal-500/10 dark:bg-[#0d1611]'
                  : 'border-slate-200 dark:border-neblina-border/80 hover:border-[#00DD9E]/40 dark:hover:border-white/20'
              }`}
            >
              {/* Imagen del podcast */}
              <div className="relative w-36 h-36 rounded-2xl overflow-hidden flex-shrink-0 bg-neblina-dark border border-white/10 group">
                <img
                  src={pod.cover_url}
                  alt={pod.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:-translate-y-0.5 transition duration-500"
                />
                
                {/* Botón Play flotante sobre la imagen que activa el reproductor unificado */}
                <button
                  onClick={() => playPodcast(pod)}
                  className={`absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/20 transition cursor-pointer ${
                    isThisPlaying ? 'opacity-100' : 'opacity-90'
                  }`}
                  aria-label={isThisPlaying ? 'Pausar Podcast' : 'Reproducir Podcast'}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#00DD9E] to-[#00b4d8] text-[#001E4D] flex items-center justify-center shadow-lg shadow-[#00DD9E]/30 transform hover:scale-110 transition">
                    {isThisPlaying ? (
                      <Pause className="w-6 h-6 fill-current" />
                    ) : (
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    )}
                  </div>
                </button>
              </div>

              {/* Información */}
              <div className="flex-1 flex flex-col justify-between space-y-2 text-center sm:text-left">
                <div>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                    <span className="bg-[#00DD9E]/15 text-[#001E4D] dark:text-[#00DD9E] px-2.5 py-0.5 rounded-lg font-bold border border-[#00DD9E]/30">
                      {pod.category}
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-[#00DD9E]" />
                      <span>{pod.duration} min</span>
                    </span>
                    <span>• {pod.date}</span>
                  </div>

                  <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white leading-snug">
                    {pod.title}
                  </h3>

                  <p className="text-xs text-[#001E4D] dark:text-[#00DD9E] font-bold">
                    {pod.show} • Con {pod.author}
                  </p>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {pod.description}
                </p>

                <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <button
                    onClick={() => playPodcast(pod)}
                    className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-black transition cursor-pointer ${
                      isThisPlaying
                        ? 'bg-gradient-to-r from-[#00DD9E] to-[#00b4d8] text-[#001E4D] shadow-md shadow-[#00DD9E]/30'
                        : 'bg-slate-200/80 dark:bg-neblina-card text-slate-800 dark:text-white hover:bg-slate-300 dark:hover:bg-white/10 border border-slate-300 dark:border-white/10'
                    }`}
                  >
                    {isThisPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>Pausar Episodio</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Reproducir en Reproductor</span>
                      </>
                    )}
                  </button>

                  {/* Botón rápido para volver a la radio en vivo si este podcast está activo */}
                  {isCurrentPodcast && (
                    <button
                      onClick={returnToLive}
                      className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold transition shadow-sm"
                    >
                      <Radio className="w-3.5 h-3.5" />
                      <span>Volver a En Vivo</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </section>
  );
}
