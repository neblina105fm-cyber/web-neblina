import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Phone, 
  MessageCircle, 
  MapPin, 
  Calendar, 
  Plus, 
  Download, 
  Upload, 
  Trash2, 
  RotateCcw, 
  Edit3, 
  Check, 
  Clock, 
  FileSpreadsheet, 
  ShieldCheck, 
  Sparkles,
  X,
  Send,
  History
} from 'lucide-react';
import SectionTrashToggle from './SectionTrashToggle';
import {
  getAllUnifiedContacts,
  getActiveUnifiedContacts,
  getTrashedUnifiedContacts,
  addUnifiedContact,
  trashContact,
  restoreContact,
  deleteContactPermanently,
  emptyContactsTrash,
  updateContactNotes,
  exportContactsCSV,
  exportContactsJSON
} from '../../services/unifiedContactsService';

export default function AdminContactsTab({ triggerToast = () => {} }) {
  const [contacts, setContacts] = useState([]);
  const [isTrashView, setIsTrashView] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [originFilter, setOriginFilter] = useState('Todas');
  
  // Modal de Crear / Editar contacto manual
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    cedula: '',
    location: '',
    origin: 'Registro Administrativo',
    details: '',
    notes: ''
  });

  // Modal de Historial de Interacciones de un contacto
  const [viewingHistoryContact, setViewingHistoryContact] = useState(null);

  // Carga reactiva de contactos
  const reloadContacts = () => {
    setContacts(getAllUnifiedContacts());
  };

  useEffect(() => {
    reloadContacts();
    const handleUpdate = () => reloadContacts();
    window.addEventListener('neblina_contacts_updated', handleUpdate);
    return () => window.removeEventListener('neblina_contacts_updated', handleUpdate);
  }, []);

  // Conteos
  const activeContacts = contacts.filter(c => !c.trashed);
  const trashedContacts = contacts.filter(c => c.trashed);

  // Filtrado
  const displayedContacts = (isTrashView ? trashedContacts : activeContacts).filter(c => {
    const q = searchQuery.toLowerCase().trim();
    const matchOrigin = originFilter === 'Todas' || (c.origin || '').toLowerCase().includes(originFilter.toLowerCase());
    
    if (!q) return matchOrigin;

    const matchQuery = 
      (c.name || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q) ||
      (c.cedula || '').toLowerCase().includes(q) ||
      (c.location || '').toLowerCase().includes(q) ||
      (c.details || '').toLowerCase().includes(q) ||
      (c.notes || '').toLowerCase().includes(q);

    return matchOrigin && matchQuery;
  });

  // Acciones de Formulario
  const handleOpenCreate = () => {
    setEditingContact(null);
    setFormData({
      name: '',
      phone: '',
      cedula: '',
      location: '',
      origin: 'Registro Administrativo',
      details: '',
      notes: ''
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name || '',
      phone: contact.phone || '',
      cedula: contact.cedula || '',
      location: contact.location || '',
      origin: contact.origin || 'Registro Administrativo',
      details: contact.details || '',
      notes: contact.notes || ''
    });
    setIsFormOpen(true);
  };

  const handleSaveContact = (e) => {
    e.preventDefault();
    if (!formData.name.trim() && !formData.phone.trim()) {
      alert('Por favor introduce al menos el nombre o el teléfono del contacto.');
      return;
    }

    addUnifiedContact(formData);
    reloadContacts();
    setIsFormOpen(false);
    triggerToast(editingContact ? 'Contacto actualizado correctamente' : 'Nuevo contacto guardado en la base de datos');
  };

  // Acciones de Papelera
  const handleTrash = (id, name) => {
    trashContact(id);
    reloadContacts();
    triggerToast(`"${name}" movido a la papelera`);
  };

  const handleRestore = (id, name) => {
    restoreContact(id);
    reloadContacts();
    triggerToast(`"${name}" restaurado a la lista activa`);
  };

  const handlePermanentDelete = (id, name) => {
    if (window.confirm(`¿Eliminar definitivamente a "${name}" de la base de datos? Esta acción es irreversible.`)) {
      deleteContactPermanently(id);
      reloadContacts();
      triggerToast('Contacto eliminado definitivamente');
    }
  };

  const handleEmptyTrash = () => {
    if (window.confirm('¿Deseas vaciar la papelera de contactos? Se eliminarán definitivamente todos los registros.')) {
      emptyContactsTrash();
      reloadContacts();
      triggerToast('Papelera de contactos vaciada');
    }
  };

  // Exportaciones
  const handleExportCSV = () => {
    const csvData = exportContactsCSV();
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Neblina_Base_Contactos_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    triggerToast('Base de datos exportada en formato Excel (CSV)');
  };

  const handleExportJSON = () => {
    const jsonData = exportContactsJSON();
    const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Neblina_Base_Contactos_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    triggerToast('Base de datos exportada en formato JSON');
  };

  // Métricas rápidas
  const totalComments = activeContacts.filter(c => (c.origin || '').includes('Comentario')).length;
  const totalReports = activeContacts.filter(c => (c.origin || '').includes('Denuncia')).length;
  const totalCabina = activeContacts.filter(c => (c.origin || '').includes('Cabina')).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* TARJETAS DE MÉTRICAS GENERALES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold mb-1">
            <span>Total Contactos</span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{activeContacts.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Audiencia registrada</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold mb-1">
            <span>Denuncias</span>
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400">{totalReports}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Vecinos con reportes</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold mb-1">
            <span>Cabina WhatsApp</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-[#00DD9E]">{totalCabina}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Mensajes y peticiones</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold mb-1">
            <span>Lectores Prensa</span>
            <span className="w-2 h-2 rounded-full bg-sky-500" />
          </div>
          <p className="text-2xl font-black text-sky-600 dark:text-sky-400">{totalComments}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Comentarios de noticias</p>
        </div>
      </div>

      {/* BARRA DE PAPELERA SECCIONAL */}
      <SectionTrashToggle 
        isTrashView={isTrashView}
        onToggleView={setIsTrashView}
        activeCount={activeContacts.length}
        trashCount={trashedContacts.length}
        onEmptyTrash={handleEmptyTrash}
        activeLabel="Contactos Activos"
        trashLabel="Papelera de Contactos"
      />

      {/* BARRA DE HERRAMIENTAS Y BÚSQUEDA */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#19222e] border border-slate-200 dark:border-white/10">
        
        {/* Buscador y Filtro por Canal de Origen */}
        <div className="flex-1 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, teléfono, cédula, sector o notas..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00DD9E]"
            />
          </div>

          <select
            value={originFilter}
            onChange={(e) => setOriginFilter(e.target.value)}
            className="text-xs font-bold px-3 py-2 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white focus:outline-none cursor-pointer"
          >
            <option value="Todas">Todos los Orígenes</option>
            <option value="Denuncia">Denuncias Ciudadanas</option>
            <option value="Cabina">Contacto a Cabina</option>
            <option value="Comentario">Comentarios de Noticias</option>
            <option value="Formulario">Formulario Web</option>
            <option value="Administrativo">Registro Administrativo</option>
          </select>
        </div>

        {/* Botones de Acción (Exportar y Agregar) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-white/10 transition cursor-pointer"
            title="Exportar base completa a formato Excel (CSV con UTF-8 BOM)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Excel (CSV)</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-white/10 transition cursor-pointer"
            title="Exportar respaldo completo en formato JSON"
          >
            <Download className="w-3.5 h-3.5 text-sky-500" />
            <span>JSON</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#00DD9E] hover:bg-[#00c98f] text-[#001E4D] font-black text-xs transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Contacto</span>
          </button>
        </div>

      </div>

      {/* MODAL / FORMULARIO PARA REGISTRAR O EDITAR CONTACTO MANUAL */}
      {isFormOpen && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1c2633] border-2 border-emerald-500/40 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
            <h4 className="font-display font-black text-base text-slate-900 dark:text-white flex items-center space-x-2">
              <Users className="w-4 h-4 text-[#00DD9E]" />
              <span>{editingContact ? 'Editar Datos del Contacto' : 'Registrar Nuevo Contacto u Oyente'}</span>
            </h4>
            <button 
              onClick={() => setIsFormOpen(false)}
              className="p-1 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSaveContact} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre y Apellido *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Carlos Ramírez"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00DD9E]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Teléfono / WhatsApp *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: +58 414 756 8890"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00DD9E]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Cédula de Identidad</label>
                <input
                  type="text"
                  placeholder="Ej: V-18.452.910"
                  value={formData.cedula}
                  onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00DD9E]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Ubicación / Sector / Municipio</label>
                <input
                  type="text"
                  placeholder="Ej: Sector El Arbolito, Santo Domingo - Mérida"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00DD9E]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Canal de Entrada / Origen</label>
                <select
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="Registro Administrativo">Registro Administrativo</option>
                  <option value="Denuncia Ciudadana">Denuncia Ciudadana</option>
                  <option value="Contacto a Cabina">Contacto a Cabina</option>
                  <option value="Comentario de Noticia">Comentario de Noticia</option>
                  <option value="Formulario Web">Formulario Web</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Detalle del Mensaje o Motivo de Contacto</label>
              <textarea
                rows="2"
                placeholder="Detalle o resumen de la última interacción..."
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00DD9E]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Notas Internas Confidenciales (Solo visibles para la Dirección)</label>
              <input
                type="text"
                placeholder="Ej: Líder comunitario de la zona alta, colaborador habitual..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00DD9E]"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-[#00DD9E] hover:bg-[#00c98f] text-[#001E4D] font-black text-xs transition shadow-sm cursor-pointer"
              >
                Guardar Contacto
              </button>
            </div>
          </form>
        </div>
      )}

      {/* LISTA DE CONTACTOS EN TARJETAS RESPONSIVAS */}
      <div className="space-y-3">
        {displayedContacts.length === 0 ? (
          <div className="p-10 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-[#19222e] rounded-2xl border border-dashed border-slate-300 dark:border-white/10">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-30 text-[#00DD9E]" />
            <p className="text-sm font-bold">No se encontraron contactos en esta sección.</p>
            <p className="text-xs text-slate-500 mt-1">
              {isTrashView ? 'La papelera de contactos está limpia.' : 'Cualquier persona que comente, denuncie o escriba por la web aparecerá aquí automáticamente.'}
            </p>
          </div>
        ) : (
          displayedContacts.map((c) => {
            const rawDigits = (c.phone || '').replace(/\D/g, '');
            const waUrl = rawDigits ? `https://api.whatsapp.com/send?phone=${rawDigits}` : null;
            const telUrl = rawDigits ? `tel:${rawDigits}` : null;

            return (
              <div
                key={c.id}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-[#00DD9E]/40 transition"
              >
                {/* Información Principal del Contacto */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-display font-black text-base text-slate-900 dark:text-white truncate">
                      {c.name || 'Sin Nombre'}
                    </h4>
                    {c.cedula && c.cedula !== 'No especificada' && (
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-bold border border-slate-200 dark:border-white/5">
                        {c.cedula}
                      </span>
                    )}
                    <span className={`text-[11px] font-black uppercase px-2 py-0.5 rounded-lg border ${
                      (c.origin || '').includes('Denuncia')
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25'
                        : (c.origin || '').includes('Cabina')
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25'
                        : 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/25'
                    }`}>
                      {c.origin || 'Web'}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500">
                      {c.interactionCount || 1} {c.interactionCount === 1 ? 'contacto' : 'contactos'}
                    </span>
                  </div>

                  {/* Teléfono y Ubicación */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
                    <span className="flex items-center space-x-1 font-bold">
                      <Phone className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{c.phone || 'Sin teléfono'}</span>
                    </span>
                    <span className="flex items-center space-x-1 text-slate-500 dark:text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{c.location || 'Santo Domingo - Mérida'}</span>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Último: {new Date(c.lastContactDate || c.firstContactDate).toLocaleDateString('es-VE')}
                    </span>
                  </div>

                  {/* Último Mensaje o Detalle */}
                  {c.details && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-black/20 p-2 rounded-xl border border-slate-100 dark:border-white/5">
                      "{c.details}"
                    </p>
                  )}

                  {/* Notas Internas Confidenciales */}
                  {c.notes && (
                    <div className="text-[11px] text-amber-800 dark:text-amber-300 font-semibold flex items-center space-x-1">
                      <span>Nota:</span>
                      <span>{c.notes}</span>
                    </div>
                  )}
                </div>

                {/* Botones de Comunicación y Gestión */}
                <div className="flex flex-wrap items-center gap-2 self-end md:self-auto shrink-0">
                  {/* WhatsApp directo */}
                  {waUrl && !isTrashView && (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-700 dark:text-emerald-400 hover:text-white text-xs font-bold border border-emerald-500/25 transition cursor-pointer"
                      title="Abrir chat directo en WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </a>
                  )}

                  {/* Llamar por teléfono */}
                  {telUrl && !isTrashView && (
                    <a
                      href={telUrl}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                      title="Llamar directamente"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {/* Ver Historial de Interacciones */}
                  {Array.isArray(c.history) && c.history.length > 0 && (
                    <button
                      onClick={() => setViewingHistoryContact(c)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                      title="Ver historial de interacciones de este ciudadano"
                    >
                      <History className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Editar */}
                  {!isTrashView && (
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-sky-500 hover:text-white text-slate-600 dark:text-slate-300 transition cursor-pointer"
                      title="Editar datos y notas"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Acciones de Papelera */}
                  {isTrashView ? (
                    <>
                      <button
                        onClick={() => handleRestore(c.id, c.name)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 text-emerald-700 dark:text-emerald-300 hover:text-white text-xs font-bold border border-emerald-500/30 transition cursor-pointer"
                        title="Restaurar a la lista activa"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restaurar</span>
                      </button>

                      <button
                        onClick={() => handlePermanentDelete(c.id, c.name)}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white transition cursor-pointer"
                        title="Eliminar definitivamente de la base de datos"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleTrash(c.id, c.name)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-rose-500 hover:text-white text-slate-600 dark:text-slate-300 transition cursor-pointer"
                      title="Mover contacto a la papelera"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL DE HISTORIAL DE INTERACCIONES DE UN CONTACTO */}
      {viewingHistoryContact && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
          onClick={() => setViewingHistoryContact(null)}
        >
          <div 
            className="relative w-full max-w-lg bg-white dark:bg-[#19222e] rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-white/10 space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5 text-[#00DD9E]" />
                <h4 className="font-display font-black text-base text-slate-900 dark:text-white">
                  Historial: {viewingHistoryContact.name}
                </h4>
              </div>
              <button 
                onClick={() => setViewingHistoryContact(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {(viewingHistoryContact.history || []).map((h, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#00DD9E]">{h.origin || 'Interacción'}</span>
                    <span className="text-slate-400">{new Date(h.date).toLocaleString('es-VE')}</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300">{h.details}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setViewingHistoryContact(null)}
                className="px-5 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
