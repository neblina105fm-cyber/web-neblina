import React from 'react';
import { Lock as LockIcon, Building2, Mic, Newspaper } from 'lucide-react';
import Emoji3D from './Emoji3D';
import { STATION_INFO } from '../services/api';
import { trackConversionAction } from '../services/analyticsLogger';

export default function Footer({ setActiveTab, onOpenAdmin }) {
  return (
    <footer className="border-t border-slate-200 dark:border-[#00DD9E]/20 bg-gradient-to-b from-[#f5f5f7]/90 via-[#edf2f6]/95 to-[#e6ecf2] dark:from-[#001E4D]/95 dark:via-[#001438]/95 dark:to-[#000d24] backdrop-blur-xl mt-16 pb-28 pt-12 text-slate-700 dark:text-slate-300 text-xs transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Logo y resumen */}
          <div className="md:col-span-2 space-y-4">
            <div 
              className="relative inline-flex items-center cursor-pointer select-none active:scale-95 transition-transform duration-150"
              onClick={() => { setActiveTab('live'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              title="Neblina 105.5 FM - Inicio"
            >
              <img 
                src="./logo-tight.svg" 
                alt="Neblina 105.5 FM" 
                width="160"
                height="56"
                loading="lazy"
                decoding="async"
                className="h-14 w-auto object-contain relative z-10 transition-transform duration-200"
              />
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-200 max-w-md leading-relaxed font-medium">
              La estación de radio líder en información, entretenimiento y la mejor selección musical para Santo Domingo, Mérida y los Andes venezolanos. Transmitiendo en 105.5 MHz FM y para todo el mundo vía streaming HD continuo.
            </p>
          </div>

          {/* Enlaces de navegación con Emojis 3D */}
          <div>
            <h5 className="font-display font-bold text-slate-900 dark:text-white text-sm mb-3">Secciones</h5>
            <ul className="space-y-2">
              <li>
                <button onClick={() => { setActiveTab('live'); window.scrollTo({top:0, behavior:'smooth'}); }} className="hover:text-[#00DD9E] dark:hover:text-[#00DD9E] transition cursor-pointer inline-flex items-center space-x-2">
                  <Emoji3D name="house" className="w-4 h-4" alt="Inicio" />
                  <span>Inicio / En Vivo</span>
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('sponsors'); window.scrollTo({top:0, behavior:'smooth'}); }} className="hover:text-[#00DD9E] dark:hover:text-[#00DD9E] transition cursor-pointer font-bold text-[#001E4D] dark:text-[#00DD9E] inline-flex items-center space-x-2">
                  <Emoji3D name="building" className="w-4 h-4" alt="Aliados" />
                  <span>Aliados Comerciales</span>
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('events'); window.scrollTo({top:0, behavior:'smooth'}); }} className="hover:text-[#00DD9E] dark:hover:text-[#00DD9E] transition cursor-pointer inline-flex items-center space-x-2">
                  <Emoji3D name="calendar" className="w-4 h-4" alt="Eventos" />
                  <span>Cartelera de Eventos</span>
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('news'); window.scrollTo({top:0, behavior:'smooth'}); }} className="hover:text-[#00DD9E] dark:hover:text-[#00DD9E] transition cursor-pointer inline-flex items-center space-x-2">
                  <Emoji3D name="newspaper" className="w-4 h-4" alt="Noticias" />
                  <span>Noticias & Sala de Prensa</span>
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('ranking'); window.scrollTo({top:0, behavior:'smooth'}); }} className="hover:text-[#00DD9E] dark:hover:text-[#00DD9E] transition cursor-pointer inline-flex items-center space-x-2">
                  <Emoji3D name="trophy" className="w-4 h-4" alt="Ranking de Neblina" />
                  <span>Ranking de Neblina</span>
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('schedule'); window.scrollTo({top:0, behavior:'smooth'}); }} className="hover:text-[#00DD9E] dark:hover:text-[#00DD9E] transition cursor-pointer inline-flex items-center space-x-2">
                  <Emoji3D name="clock" className="w-4 h-4" alt="Parrilla" />
                  <span>Parrilla de Programación</span>
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('talents'); window.scrollTo({top:0, behavior:'smooth'}); }} className="hover:text-[#00DD9E] dark:hover:text-[#00DD9E] transition cursor-pointer inline-flex items-center space-x-2">
                  <Emoji3D name="headphones" className="w-4 h-4" alt="Talentos" />
                  <span>Nuestros Talentos (Locutores)</span>
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('podcasts'); window.scrollTo({top:0, behavior:'smooth'}); }} className="hover:text-[#00DD9E] dark:hover:text-[#00DD9E] transition cursor-pointer inline-flex items-center space-x-2">
                  <Emoji3D name="microphone" className="w-4 h-4" alt="Podcasts" />
                  <span>Podcasts y Entrevistas</span>
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('contact'); window.scrollTo({top:0, behavior:'smooth'}); }} className="hover:text-[#00DD9E] dark:hover:text-[#00DD9E] transition cursor-pointer inline-flex items-center space-x-2">
                  <Emoji3D name="chat" className="w-4 h-4" alt="Contacto" />
                  <span>Contacto y Cabina</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Redes Sociales Oficiales en Formato 3D Estilo iOS + Botones de Portales */}
          <div>
            <h5 className="font-display font-bold text-slate-900 dark:text-white text-sm mb-3">Síguenos en Redes</h5>
            <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium mb-3.5">
              Conéctate a nuestras transmisiones y contenidos multimedia oficiales:
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={STATION_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackConversionAction('whatsapp_cabina', 'WhatsApp Cabina Directo')}
                className="hover:scale-120 active:scale-95 transition-transform duration-200 cursor-pointer p-0.5"
                title="WhatsApp Cabina"
                aria-label="WhatsApp Cabina"
              >
                <Emoji3D name="whatsapp" className="w-8 h-8 sm:w-9 sm:h-9 drop-shadow-md" />
              </a>

              <a
                href={STATION_INFO.instagram}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackConversionAction('social_instagram', 'Instagram @neblina105fm')}
                className="hover:scale-120 active:scale-95 transition-transform duration-200 cursor-pointer p-0.5"
                title="Instagram @neblina105fm"
                aria-label="Instagram"
              >
                <Emoji3D name="instagram" className="w-8 h-8 sm:w-9 sm:h-9 drop-shadow-md" />
              </a>

              <a
                href={STATION_INFO.facebook}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackConversionAction('social_facebook', 'Facebook Neblina Stereo')}
                className="hover:scale-120 active:scale-95 transition-transform duration-200 cursor-pointer p-0.5"
                title="Facebook Neblina Stereo"
                aria-label="Facebook"
              >
                <Emoji3D name="facebook" className="w-8 h-8 sm:w-9 sm:h-9 drop-shadow-md" />
              </a>

              <a
                href={STATION_INFO.whatsappChannel}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackConversionAction('whatsapp_canal', 'Canal Oficial WhatsApp')}
                className="hover:scale-120 active:scale-95 transition-transform duration-200 cursor-pointer p-0.5"
                title="Canal Oficial de WhatsApp"
                aria-label="Canal de WhatsApp"
              >
                <Emoji3D name="whatsapp" className="w-8 h-8 sm:w-9 sm:h-9 drop-shadow-md" />
              </a>

              <a
                href={STATION_INFO.youtubeShorts}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackConversionAction('social_youtube', 'Canal YouTube Shorts')}
                className="hover:scale-120 active:scale-95 transition-transform duration-200 cursor-pointer p-0.5"
                title="Canal de YouTube @neblina105fm"
                aria-label="YouTube"
              >
                <Emoji3D name="youtube" className="w-8 h-8 sm:w-9 sm:h-9 drop-shadow-md" />
              </a>

              <a
                href="https://twitter.com/neblina105fm"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackConversionAction('social_x', 'X / Twitter @neblina105fm')}
                className="hover:scale-120 active:scale-95 transition-transform duration-200 cursor-pointer p-0.5"
                title="X / Twitter"
                aria-label="X Twitter"
              >
                <Emoji3D name="x" className="w-8 h-8 sm:w-9 sm:h-9 drop-shadow-md" />
              </a>

              <a
                href="https://t.me/neblina105fm"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackConversionAction('social_telegram', 'Telegram Oficial')}
                className="hover:scale-120 active:scale-95 transition-transform duration-200 cursor-pointer p-0.5"
                title="Telegram Oficial"
                aria-label="Telegram"
              >
                <Emoji3D name="telegram" className="w-8 h-8 sm:w-9 sm:h-9 drop-shadow-md" />
              </a>
            </div>

            {/* Dos botones separados debajo de los iconos de redes sociales (para todos los dispositivos) */}
            <div className="mt-4 pt-3 border-t border-slate-200/70 dark:border-white/10 flex flex-col sm:flex-row md:flex-col gap-2">
              <a
                href="#clientes"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.hash = '#clientes';
                }}
                className="inline-flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl bg-[#001E4D]/12 hover:bg-[#001E4D]/22 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-xl border border-[#001E4D]/25 dark:border-white/20 text-[#001E4D] dark:text-[#00DD9E] text-xs font-bold shadow-xs hover:scale-[1.01] active:scale-95 transition-all cursor-pointer"
              >
                <Building2 className="w-4 h-4 flex-shrink-0" />
                <span>Portal para Aliados Comerciales</span>
              </a>

              <a
                href="#locutores"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.hash = '#locutores';
                }}
                className="inline-flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl bg-[#001E4D]/12 hover:bg-[#001E4D]/22 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-xl border border-[#001E4D]/25 dark:border-white/20 text-[#001E4D] dark:text-[#00DD9E] text-xs font-bold shadow-xs hover:scale-[1.01] active:scale-95 transition-all cursor-pointer"
              >
                <Mic className="w-4 h-4 flex-shrink-0" />
                <span>Portal para Locutores</span>
              </a>

              <a
                href="#periodistas"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.hash = '#periodistas';
                }}
                className="inline-flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl bg-[#001E4D]/12 hover:bg-[#001E4D]/22 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-xl border border-[#001E4D]/25 dark:border-white/20 text-[#001E4D] dark:text-[#00DD9E] text-xs font-bold shadow-xs hover:scale-[1.01] active:scale-95 transition-all cursor-pointer"
              >
                <Newspaper className="w-4 h-4 flex-shrink-0" />
                <span>Portal para Periodistas</span>
              </a>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-slate-700 dark:text-slate-300 font-medium">© {new Date().getFullYear()} Neblina Stereo 105.5 FM. Todos los derechos reservados.</p>
          <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-300 font-medium">
            <button
              onClick={() => {
                if (onOpenAdmin) onOpenAdmin();
                else window.location.hash = '#admin';
              }}
              className="inline-flex items-center space-x-1.5 opacity-60 hover:opacity-100 transition cursor-pointer text-[11px] text-slate-500 hover:text-[#00DD9E]"
              title="Sistema Interno de Gestión"
            >
              <LockIcon className="w-3.5 h-3.5" />
              <span>Gestión Interna</span>
            </button>
            <span>•</span>
            <span>Santo Domingo - Mérida, Venezuela · En la Cima</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
