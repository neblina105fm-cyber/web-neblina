import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Send, Megaphone, Camera, MapPin, Calendar, Clock, AlertTriangle, ShieldCheck, Upload, Trash2, Film, Image as ImageIcon } from 'lucide-react';
import Emoji3D from './Emoji3D';
import { getCitizenReportUrl, STATION_INFO } from '../services/api';
import { addCitizenReport } from '../services/reportsService';
import { upsertCitizenContact } from '../services/citizensDirectoryService';
import { addUnifiedContact } from '../services/unifiedContactsService';

export default function CitizenReportModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    citizenName: '',
    citizenId: '',
    phone: '',
    residenceSector: '',
    eventLocation: '',
    referencePoint: '',
    eventDate: new Date().toLocaleDateString('es-VE'),
    eventTime: new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }),
    description: ''
  });
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = (originalOverflow && originalOverflow !== 'hidden') ? originalOverflow : '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEvidenceUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploadError('');

    files.slice(0, 4).forEach((file) => {
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      if (!isVideo && !isImage) {
        setUploadError('Solo se permiten fotografías (JPG, PNG, WEBP) o videos (MP4, WEBM, MOV).');
        return;
      }
      // Límite razonable para guardar en el sistema interno (localStorage)
      if (file.size > 8 * 1024 * 1024) {
        setUploadError(`El archivo "${file.name}" supera los 8 MB. Elige una foto o video más corto.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result;
        if (!dataUrl) return;
        setEvidenceFiles((prev) => [
          ...prev.slice(0, 3),
          {
            id: `ev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            name: file.name,
            type: isVideo ? 'video' : 'image',
            mimeType: file.type,
            sizeKb: Math.round(file.size / 1024),
            dataUrl
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleRemoveEvidence = (id) => {
    setEvidenceFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSend = () => {
    const reportPayload = {
      ...formData,
      hasMedia: evidenceFiles.length > 0,
      evidenceFiles
    };
    try {
      addCitizenReport(reportPayload);
      upsertCitizenContact(reportPayload);
      addUnifiedContact({
        name: formData.citizenName,
        phone: formData.phone,
        cedula: formData.citizenId,
        location: formData.residenceSector || formData.eventLocation,
        origin: 'Denuncia Ciudadana',
        details: formData.description
      });
    } catch (e) {
      console.warn('Error registrando reporte internamente:', e);
    }
    const url = getCitizenReportUrl(reportPayload);
    window.open(url, '_blank', 'noopener,noreferrer');
    setEvidenceFiles([]);
    onClose();
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 pt-3 sm:pt-4 pb-28 sm:pb-32 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-xl max-h-[calc(100dvh-130px)] sm:max-h-[calc(100dvh-140px)] bg-white dark:bg-[#1d1d1f] border border-[#e6e6e8] dark:border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-lg transition-colors duration-300 my-auto">
        
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e6e6e8] dark:border-white/10 bg-[#f5f5f7]/95 dark:bg-[#1d1d1f]/95">
          <div className="flex items-center space-x-2.5">
            <Emoji3D name="siren" className="w-9 h-9 sm:w-10 sm:h-10 object-contain drop-shadow-[0_8px_16px_rgba(244,63,94,0.35)] flex-shrink-0" alt="Denuncia" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-lg border border-rose-500/20">
                  SALA DE REDACCIÓN 105.5 FM
                </span>
              </div>
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-[#f5f5f7] mt-0.5">
                Reporte de Denuncia Ciudadana
              </h3>
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

        {/* Contenido scrolleable del formulario */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-4">
          
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 leading-relaxed flex items-start space-x-2.5">
            <Emoji3D name="warning" className="w-5 h-5 flex-shrink-0 drop-shadow-sm mt-0.5" />
            <div>
              <p className="font-bold">Tu reporte llega directamente a nuestros periodistas y locutores al número oficial <span className="font-mono">{STATION_INFO.whatsapp}</span>.</p>
              <p className="mt-0.5 text-[11px] opacity-90">Al pulsar "Enviar Denuncia", tu reporte y evidencia se registran en la Sala de Prensa y se abrirá WhatsApp automáticamente.</p>
            </div>
          </div>

          {/* Nota Oficial de Privacidad y Confidencialidad Estricta */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed flex items-start space-x-2.5 shadow-sm">
            <Emoji3D name="shield" className="w-5 h-5 flex-shrink-0 drop-shadow-sm mt-0.5" />
            <div>
              <p className="font-black text-slate-900 dark:text-white flex items-center space-x-1.5">
                <span>Garantía de Confidencialidad y Privacidad</span>
              </p>
              <p className="mt-1 text-[11px] text-slate-700 dark:text-slate-300 leading-normal">
                Tus datos de identidad, número de teléfono y residencia <strong>no serán difundidos públicamente</strong>; son única y exclusivamente para la recepción, verificación y seguimiento de la denuncia por parte de nuestra sala interna de redacción. <strong>Estos datos no serán compartidos con ninguna persona ni con ninguna autoridad.</strong> Tu privacidad y anonimato al aire están 100% garantizados.
              </p>
            </div>
          </div>

          {/* Datos del Ciudadano */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
              <Emoji3D name="user" className="w-4 h-4 drop-shadow-xs" />
              <span>1. Identificación del Denunciante</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Nombre y Apellido</label>
                <input
                  type="text"
                  name="citizenName"
                  placeholder="Ej: Juan Pérez"
                  value={formData.citizenName}
                  onChange={handleChange}
                  className="w-full bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#001E4D] dark:focus:border-[#00DD9E]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Cédula de Identidad</label>
                <input
                  type="text"
                  name="citizenId"
                  placeholder="Ej: V-12.345.678"
                  value={formData.citizenId}
                  onChange={handleChange}
                  className="w-full bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#001E4D] dark:focus:border-[#00DD9E]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Número de Teléfono / WhatsApp</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Ej: +58 412 1234567 o 0412 1234567"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#001E4D] dark:focus:border-[#00DD9E]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Sector o Comunidad donde resides</label>
                <input
                  type="text"
                  name="residenceSector"
                  placeholder="Ej: Sector Las Piedras, Santo Domingo"
                  value={formData.residenceSector}
                  onChange={handleChange}
                  className="w-full bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#001E4D] dark:focus:border-[#00DD9E]"
                />
              </div>
            </div>
          </div>

          {/* Lugar y Fecha */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
              <Emoji3D name="pin" className="w-4 h-4 drop-shadow-xs" />
              <span>2. Lugar y Momento del Acontecimiento</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Lugar exacto del hecho</label>
                <input
                  type="text"
                  name="eventLocation"
                  placeholder="Ej: Carretera Trasandina, km 4"
                  value={formData.eventLocation}
                  onChange={handleChange}
                  className="w-full bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#001E4D] dark:focus:border-[#00DD9E]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Punto de referencia</label>
                <input
                  type="text"
                  name="referencePoint"
                  placeholder="Ej: Cerca del puente o la escuela"
                  value={formData.referencePoint}
                  onChange={handleChange}
                  className="w-full bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#001E4D] dark:focus:border-[#00DD9E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Fecha</label>
                <input
                  type="text"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleChange}
                  className="w-full bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Hora aproximada</label>
                <input
                  type="text"
                  name="eventTime"
                  value={formData.eventTime}
                  onChange={handleChange}
                  className="w-full bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Descripción y Evidencia Fotográfica / Video */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
              <Emoji3D name="megaphone" className="w-4 h-4 drop-shadow-xs" />
              <span>3. Descripción de la Denuncia</span>
            </h4>

            <textarea
              rows="3"
              name="description"
              placeholder="Explica qué ocurrió, qué servicios están fallando, derrumbes, averías o situación que amerite atención..."
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#001E4D] dark:focus:border-[#00DD9E]"
            ></textarea>

            {/* Carga de Evidencia Fotográfica o en Video para el Sistema Interno */}
            <div className="p-3.5 rounded-xl bg-slate-100/90 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 dark:text-white">
                  <Emoji3D name="camera" className="w-4 h-4 flex-shrink-0 drop-shadow-xs" />
                  <span>4. Anexar Evidencia Fotográfica o en Video (Opcional)</span>
                </div>

                <label className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#001E4D]/85 hover:bg-[#001E4D] dark:bg-[#00DD9E]/20 dark:hover:bg-[#00DD9E]/30 text-white dark:text-[#00DD9E] text-xs font-bold border border-[#001E4D]/25 dark:border-[#00DD9E]/40 cursor-pointer transition shadow-2xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Subir Foto o Video</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleEvidenceUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                La evidencia subida se guardará de forma confidencial en el sistema interno de la Sala de Prensa y también podrás adjuntarla en WhatsApp al enviar.
              </p>

              {uploadError && (
                <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                  {uploadError}
                </p>
              )}

              {evidenceFiles.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  {evidenceFiles.map((ev) => (
                    <div
                      key={ev.id}
                      className="relative group rounded-xl overflow-hidden border border-slate-300 dark:border-white/15 bg-black aspect-video flex flex-col justify-end"
                    >
                      {ev.type === 'video' ? (
                        <video
                          src={ev.dataUrl}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                        />
                      ) : (
                        <img
                          src={ev.dataUrl}
                          alt={ev.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-black/70 px-2 py-1 flex items-center justify-between text-[11px] text-white">
                        <span className="truncate flex items-center gap-1">
                          {ev.type === 'video' ? <Film className="w-3 h-3 text-[#00DD9E] shrink-0" /> : <ImageIcon className="w-3 h-3 text-[#00DD9E] shrink-0" />}
                          <span className="truncate">{ev.name}</span>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveEvidence(ev.id)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-rose-600 text-white hover:bg-rose-500 shadow-md cursor-pointer"
                        title="Quitar archivo"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Único Botón de Acción: Enviar Denuncia (Guarda en sistema interno y abre WhatsApp +584247459774) */}
        <div className="p-4 sm:p-5 border-t border-[#e6e6e8] dark:border-white/10 bg-[#f5f5f7]/95 dark:bg-[#1d1d1f]/95 flex items-center justify-end">
          <button
            type="button"
            onClick={handleSend}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-rose-600/85 hover:bg-rose-600 dark:bg-rose-600/80 dark:hover:bg-rose-500 backdrop-blur-xl text-white text-xs sm:text-sm font-black border border-rose-400/50 transition shadow-md shadow-rose-600/20 cursor-pointer"
          >
            <Emoji3D name="whatsapp" className="w-4 h-4 flex-shrink-0" alt="WhatsApp" />
            <span>Enviar Denuncia</span>
          </button>
        </div>

      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? ReactDOM.createPortal(modalContent, document.body)
    : modalContent;
}
