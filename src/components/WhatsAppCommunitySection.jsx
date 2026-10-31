import React from 'react';
import { ExternalLink, Users, Bell } from 'lucide-react';
import { STATION_INFO } from '../services/api';
import { trackConversionAction } from '../services/analyticsLogger';
import Emoji3D from './Emoji3D';

export default function WhatsAppCommunitySection() {
  return (
    <section className="py-2 select-none">
      {/* Contenedor Integrado sin marco rígido (estilo Aliados Comerciales) */}
      <div className="relative rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] backdrop-blur-md p-5 sm:p-7 transition-colors duration-300 overflow-hidden">
        
        {/* Glow de degradado sutil iOS */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-emerald-500/10 dark:bg-[#00DD9E]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-teal-500/10 dark:bg-[#00DD9E]/08 blur-3xl pointer-events-none" />

        {/* PARTE 1 SUPERIOR: Conéctate con Neblina 105.5 FM + Redes Sociales Oficiales */}
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-black/[0.06] dark:border-white/[0.08]">
          <div>
            <h4 className="font-display font-black text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
              Conéctate con Neblina 105.5 FM
            </h4>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-200 mt-0.5">
              Síguenos en nuestras redes oficiales y comparte la señal con tus amigos.
            </p>
          </div>

          {/* Iconos 3D estilo iOS sin bordes ni contenedores rígidos */}
          <div className="flex items-center space-x-2.5">
            <a
              href={STATION_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:scale-115 active:scale-95 transition-transform duration-200 cursor-pointer p-0.5"
              title="WhatsApp Cabina"
              aria-label="WhatsApp"
            >
              <Emoji3D name="whatsapp" className="w-9 h-9 sm:w-10 sm:h-10 drop-shadow-md" />
            </a>

            <a
              href={STATION_INFO.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:scale-115 active:scale-95 transition-transform duration-200 cursor-pointer p-0.5"
              title="Instagram"
              aria-label="Instagram"
            >
              <Emoji3D name="instagram" className="w-9 h-9 sm:w-10 sm:h-10 drop-shadow-md" />
            </a>

            <a
              href={STATION_INFO.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:scale-115 active:scale-95 transition-transform duration-200 cursor-pointer p-0.5"
              title="Facebook"
              aria-label="Facebook"
            >
              <Emoji3D name="facebook" className="w-9 h-9 sm:w-10 sm:h-10 drop-shadow-md" />
            </a>

            <a
              href={STATION_INFO.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:scale-115 active:scale-95 transition-transform duration-200 cursor-pointer p-0.5"
              title="YouTube"
              aria-label="YouTube"
            >
              <Emoji3D name="youtube" className="w-9 h-9 sm:w-10 sm:h-10 drop-shadow-md" />
            </a>

            <a
              href="https://t.me/neblina105fm"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:scale-115 active:scale-95 transition-transform duration-200 cursor-pointer p-0.5"
              title="Telegram"
              aria-label="Telegram"
            >
              <Emoji3D name="telegram" className="w-9 h-9 sm:w-10 sm:h-10 drop-shadow-md" />
            </a>
          </div>
        </div>

        {/* PARTE 2 INFERIOR: Cabecera Comunidad WhatsApp */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 pb-5 border-b border-black/[0.04] dark:border-white/[0.06]">
          <div className="flex items-start sm:items-center space-x-3.5">
            <Emoji3D 
              name="whatsapp" 
              className="w-12 h-12 sm:w-13 sm:h-13 flex-shrink-0 drop-shadow-[0_10px_20px_rgba(37,211,102,0.35)] hover:scale-110 transition-transform duration-300" 
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-2.5 py-0.5 rounded-lg border border-emerald-500/30">
                  Comunidad Oficial
                </span>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 hidden sm:inline">• Santo Domingo & Mérida</span>
              </div>
              <h3 className="font-display font-black text-lg sm:text-xl text-slate-900 dark:text-white mt-0.5 tracking-tight">
                Canal y Grupos de WhatsApp
              </h3>
            </div>
          </div>

          <p className="text-xs font-medium text-slate-700 dark:text-slate-200 max-w-sm sm:text-right leading-relaxed">
            Noticias al instante, reportes viales del Páramo y comunicación directa con la radio.
          </p>
        </div>

        {/* Las 3 opciones con diseño integrado y alto contraste */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-5">
          
          {/* Opción 1: Canal de WhatsApp */}
          <div className="flex flex-col justify-between p-4.5 rounded-2xl bg-white/60 dark:bg-white/[0.04] hover:bg-white/80 dark:hover:bg-white/[0.08] transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Emoji3D name="bell" className="w-4 h-4 inline-block" alt="Avisos" />
                  <span>Canal Oficial</span>
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              </div>
              <h4 className="font-display font-black text-sm text-slate-900 dark:text-white mb-1.5">
                Canal de Noticias y Avisos
              </h4>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-200 leading-relaxed mb-4">
                Recibe reportes informativos directos sin compartir tu número telefónico.
              </p>
            </div>

            <a
              href={STATION_INFO.whatsappChannel}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackConversionAction('whatsapp_canal', 'Canal Oficial WhatsApp')}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition duration-200 shadow-sm cursor-pointer"
            >
              <Emoji3D name="whatsapp" className="w-4.5 h-4.5" />
              <span>Seguir Canal de WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
            </a>
          </div>

          {/* Opción 2: Grupo Informativo 1 */}
          <div className="flex flex-col justify-between p-4.5 rounded-2xl bg-white/60 dark:bg-white/[0.04] hover:bg-white/80 dark:hover:bg-white/[0.08] transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black text-[#0066cc] dark:text-[#00DD9E] uppercase tracking-wider flex items-center space-x-1.5">
                  <Emoji3D name="users" className="w-4 h-4 inline-block" alt="Comunidad" />
                  <span>Comunidad 1</span>
                </span>
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Interacción</span>
              </div>
              <h4 className="font-display font-black text-sm text-slate-900 dark:text-white mb-1.5">
                Grupo Informativo 1
              </h4>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-200 leading-relaxed mb-4">
                Comunidad de oyentes para reportes ciudadanos, eventos y sintonía en vivo.
              </p>
            </div>

            <a
              href={STATION_INFO.whatsappGroup1}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackConversionAction('whatsapp_grupo', 'Grupo Informativo 1')}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 text-slate-900 dark:text-white border border-slate-300 dark:border-white/20 font-bold text-xs transition duration-200 cursor-pointer shadow-xs"
            >
              <Emoji3D name="whatsapp" className="w-4.5 h-4.5" />
              <span>Unirse a Grupo 1</span>
              <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
            </a>
          </div>

          {/* Opción 3: Grupo Informativo 2 */}
          <div className="flex flex-col justify-between p-4.5 rounded-2xl bg-white/60 dark:bg-white/[0.04] hover:bg-white/80 dark:hover:bg-white/[0.08] transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black text-[#0066cc] dark:text-[#00DD9E] uppercase tracking-wider flex items-center space-x-1.5">
                  <Emoji3D name="users" className="w-4 h-4 inline-block" alt="Comunidad" />
                  <span>Comunidad 2</span>
                </span>
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Participación</span>
              </div>
              <h4 className="font-display font-black text-sm text-slate-900 dark:text-white mb-1.5">
                Grupo Informativo 2
              </h4>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-200 leading-relaxed mb-4">
                Espacio informativo alternativo para oyentes de Mérida, Barinas y el exterior.
              </p>
            </div>

            <a
              href={STATION_INFO.whatsappGroup2}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackConversionAction('whatsapp_grupo', 'Grupo Informativo 2')}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 text-slate-900 dark:text-white border border-slate-300 dark:border-white/20 font-bold text-xs transition duration-200 cursor-pointer shadow-xs"
            >
              <Emoji3D name="whatsapp" className="w-4.5 h-4.5" />
              <span>Unirse a Grupo 2</span>
              <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
            </a>
          </div>

        </div>

      </div>
    </section>
  );
}
