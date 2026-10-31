import React, { useState } from 'react';
import { 
  MessageCircle, 
  Radio, 
  MapPin, 
  Phone, 
  Send, 
  Sparkles,
  Heart
} from 'lucide-react';
import Emoji3D from './Emoji3D';
import { STATION_INFO, WHATSAPP_CONFIG, getSongRequestUrl, getCitizenReportUrl } from '../services/api';
import { addUnifiedContact } from '../services/unifiedContactsService';
import { trackConversionAction } from '../services/analyticsLogger';

export default function ContactSection() {
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userLocation, setUserLocation] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('Pedir Canción');
  const [userMessage, setUserMessage] = useState('');

  const handleRecordContact = () => {
    try {
      addUnifiedContact({
        name: userName,
        phone: userPhone,
        location: userLocation,
        origin: `Contacto Cabina: ${selectedTopic}`,
        details: userMessage || selectedTopic
      });
    } catch (e) {
      console.warn('Error registrando contacto:', e);
    }
  };

  const generateWhatsAppUrl = () => {
    handleRecordContact();
    trackConversionAction('whatsapp_cabina', 'Mensaje a Cabina');
    if (selectedTopic === 'Denuncia Ciudadana') {
      return getCitizenReportUrl({
        citizenName: userName,
        phone: userPhone,
        residenceSector: userLocation,
        eventLocation: userLocation,
        description: userMessage
      });
    }

    if (selectedTopic === 'Pedir Canción' || selectedTopic === 'Reporte de Sintonía') {
      return getSongRequestUrl(userMessage, '', userName, userLocation);
    }

    // Caso publicidad o saludo general
    let msg = `¡Hola, Neblina Stereo 105.5 FM! 🎙️\n\n`;
    if (userName) msg += `Mi nombre es: ${userName}\n`;
    if (userLocation) msg += `Los escucho desde: ${userLocation}\n`;
    msg += `Motivo: ${selectedTopic}\n`;
    if (userMessage) msg += `Mensaje: ${userMessage}\n`;
    msg += `\n(Enviado desde la Web App Oficial)`;
    return `https://api.whatsapp.com/send?phone=${WHATSAPP_CONFIG.phoneRaw}&text=${encodeURIComponent(msg)}`;
  };

  return (
    <section className="py-8">
      {/* Encabezado */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 text-[#001E4D] dark:text-[#00DD9E] text-xs font-black uppercase tracking-widest mb-1">
          <Emoji3D name="chat" className="w-4 h-4" />
          <span>Interacción con la Cabina</span>
        </div>
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
          Contáctanos y Envía tu Mensaje
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Comunícate directamente con nuestros locutores en Santo Domingo - Mérida y sé parte de la programación en vivo.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Formulario rápido para WhatsApp Cabina con Alto Contraste */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-neblina-border">
          <div className="flex items-center space-x-3.5 mb-6">
            <Emoji3D name="chat" className="w-10 h-10 sm:w-11 sm:h-11 drop-shadow-md flex-shrink-0" />
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">Mensaje Directo a Cabina</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Llega al instante al teléfono en vivo de los locutores</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Tu Nombre o Apodo</label>
                <input
                  type="text"
                  placeholder="Ej: Carlos Márquez"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full aeroglass-subcard border border-white/30 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00DD9E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">¿Desde dónde nos escuchas?</label>
                <input
                  type="text"
                  placeholder="Ej: Santo Domingo, Mérida, Ejido..."
                  value={userLocation}
                  onChange={(e) => setUserLocation(e.target.value)}
                  className="w-full aeroglass-subcard border border-white/30 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00DD9E]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Tu Número de Teléfono o WhatsApp (Opcional)</label>
                <input
                  type="tel"
                  placeholder="Ej: 0414 756 8890"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  className="w-full aeroglass-subcard border border-white/30 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00DD9E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Motivo del Mensaje</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Pedir Canción', 'Reporte de Sintonía', 'Denuncia Ciudadana', 'Publicidad'].map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => setSelectedTopic(topic)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      selectedTopic === topic
                        ? 'bg-[#00DD9E] text-[#001E4D] border-white/60 font-bold shadow-sm'
                        : 'aeroglass-subcard text-slate-700 dark:text-slate-300 border-white/20 dark:border-white/10 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {selectedTopic === 'Pedir Canción' ? 'Canción y Dedicatoria' : selectedTopic === 'Denuncia Ciudadana' ? 'Detalle de la Denuncia' : 'Mensaje o Comentario'}
              </label>
              <textarea
                rows="3"
                placeholder={selectedTopic === 'Pedir Canción' ? 'Escribe aquí el tema que deseas solicitar y para quién va dedicado...' : selectedTopic === 'Denuncia Ciudadana' ? 'Describe detalladamente la situación o acontecimiento (recuerda adjuntar fotos en WhatsApp)...' : 'Escribe aquí tu saludo o comentario...'}
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                className="w-full aeroglass-subcard border border-white/30 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00DD9E]"
              ></textarea>
            </div>

            <a
              href={generateWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3.5 px-6 rounded-lg shadow-lg shadow-emerald-900/40 transition duration-300 transform hover:scale-[1.01]"
            >
              <Emoji3D name="whatsapp" className="w-5 h-5 flex-shrink-0" alt="WhatsApp" />
              <span>Enviar por WhatsApp a Cabina</span>
            </a>
          </div>
        </div>

        {/* Tarjetas de Redes Sociales y Datos de la Radio */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          
          {/* Ficha de Transmisión con Contraste */}
          <div className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-neblina-border">
            <h4 className="font-display font-bold text-base text-slate-900 dark:text-white mb-4 flex items-center space-x-2.5">
              <Emoji3D name="radio" className="w-6 h-6 flex-shrink-0" alt="Radio" />
              <span>Datos de Transmisión</span>
            </h4>

            <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400">Frecuencia Modulada:</span>
                <span className="font-black text-slate-900 dark:text-white font-mono bg-slate-200/80 dark:bg-black/40 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-white/10">105.5 MHz</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400">Ubicación Central:</span>
                <span className="font-bold text-[#001E4D] dark:text-[#00DD9E]">Santo Domingo - Mérida</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400">Cobertura:</span>
                <span className="font-medium text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <Emoji3D name="pin" className="w-4 h-4 inline-block" alt="Ubicación" />
                  <span>Andes venezolanos & Streaming Global</span>
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500 dark:text-slate-400">WhatsApp Oficial:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">+58 424 745 9774</span>
              </div>
            </div>
          </div>

          {/* Redes Sociales Oficiales en Formato 3D Estilo iOS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a
              href={STATION_INFO.instagram}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackConversionAction('social_instagram', 'Perfil Instagram')}
              className="flex flex-col items-center justify-center p-4 rounded-2xl glass-card border border-slate-200 dark:border-neblina-border hover:bg-pink-500/10 transition group shadow-sm"
            >
              <Emoji3D name="instagram" className="w-10 h-10 drop-shadow-md group-hover:scale-115 transition" />
              <span className="text-xs font-bold text-slate-900 dark:text-white mt-2">Instagram</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">@neblina105fm</span>
            </a>

            <a
              href={STATION_INFO.facebook}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackConversionAction('social_facebook', 'Página Facebook')}
              className="flex flex-col items-center justify-center p-4 rounded-2xl glass-card border border-slate-200 dark:border-neblina-border hover:bg-blue-500/10 transition group shadow-sm"
            >
              <Emoji3D name="facebook" className="w-10 h-10 drop-shadow-md group-hover:scale-115 transition" />
              <span className="text-xs font-bold text-slate-900 dark:text-white mt-2">Facebook</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Neblina Stereo</span>
            </a>

            <a
              href={STATION_INFO.youtube}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackConversionAction('social_youtube', 'Canal YouTube')}
              className="flex flex-col items-center justify-center p-4 rounded-2xl glass-card border border-slate-200 dark:border-neblina-border hover:bg-red-500/10 transition group shadow-sm"
            >
              <Emoji3D name="youtube" className="w-10 h-10 drop-shadow-md group-hover:scale-115 transition" />
              <span className="text-xs font-bold text-slate-900 dark:text-white mt-2">YouTube</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Canal Oficial</span>
            </a>
          </div>

        </div>

      </div>
    </section>
  );
}
