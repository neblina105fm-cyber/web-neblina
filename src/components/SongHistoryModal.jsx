import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { History, X, Music, Radio } from 'lucide-react';
import Emoji3D from './Emoji3D';
import { useAudioPlayer } from '../context/AudioPlayerContext';

export default function SongHistoryModal({ isOpen, onClose }) {
  const { metadata } = useAudioPlayer();

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = (originalOverflow && originalOverflow !== 'hidden') ? originalOverflow : '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const historyList = (metadata && Array.isArray(metadata.history)) ? metadata.history : [];

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 pt-3 sm:pt-4 pb-28 sm:pb-32 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg max-h-[calc(100dvh-130px)] sm:max-h-[calc(100dvh-140px)] bg-white dark:bg-[#1d1d1f] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-lg transition-colors duration-300 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40">
          <div className="flex items-center space-x-3">
            <Emoji3D name="history" className="w-8 h-8 drop-shadow-md flex-shrink-0" alt="Historial" />
            <div>
              <h3 className="font-display font-bold text-base text-[#1d1d1f] dark:text-[#f5f5f7]">Historial de Canciones</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Temas emitidos recientemente en la 105.5 FM</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista de temas */}
        <div className="overflow-y-auto p-4 sm:p-6 divide-y divide-slate-100 dark:divide-white/5 space-y-1">
          {historyList.length === 0 ? (
            <div className="text-center py-10">
              <Emoji3D name="musical-notes" className="w-10 h-10 mx-auto mb-2 drop-shadow-md" alt="Música" />
              <p className="text-sm text-slate-600 dark:text-slate-300">Cargando historial de canciones...</p>
            </div>
          ) : (
            historyList.map((item, idx) => {
              const song = item?.song || item || {};
              const rawTitle = typeof song === 'object' ? (song.title || song.song || 'Tema Musical') : song;
              const title = typeof rawTitle === 'string' ? rawTitle : 'Tema Musical';
              const rawArtist = typeof song === 'object' ? (song.artist || 'Neblina 105.5 FM') : 'Neblina 105.5 FM';
              const artist = typeof rawArtist === 'string' ? rawArtist : 'Neblina 105.5 FM';

              return (
                <div key={idx} className="flex items-center space-x-3 py-3 first:pt-0">
                  <span className="w-6 text-center font-mono text-xs font-bold text-slate-400 dark:text-slate-500">
                    {idx + 1}
                  </span>
                  
                  <Emoji3D name="musical-note" className="w-7 h-7 flex-shrink-0 drop-shadow-sm" alt="Canción" />

                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-bold text-[#1d1d1f] dark:text-[#f5f5f7] truncate">
                      {title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {artist}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-full bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/15 text-[#1d1d1f] dark:text-white text-xs font-bold transition border border-slate-300 dark:border-white/10 cursor-pointer"
          >
            Cerrar Historial
          </button>
        </div>

      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? ReactDOM.createPortal(modalContent, document.body)
    : modalContent;
}
