import React, { useState, useEffect } from 'react';
import AvatarWithFallback from '../AvatarWithFallback';
import {
  User, 
  Users, 
  UserPlus, 
  Newspaper, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Trash2, 
  Edit3, 
  Eye, 
  ExternalLink, 
  Filter, 
  Search, 
  Key, 
  ShieldCheck, 
  ShieldAlert, 
  Sparkles, 
  Check, 
  X,
  Plus,
  Send,
  Calendar,
  Lock,
  Phone,
  Mail,
  Camera,
  Layers,
  ChevronDown
} from 'lucide-react';
import Emoji3D from '../Emoji3D';
import { 
  getAllJournalists, 
  saveJournalist, 
  deleteJournalist, 
  getAllPressNotes, 
  publishPressNote, 
  setPressNoteStatus, 
  deletePressNote, 
  getNotesByJournalist 
} from '../../services/journalistsService';

export default function AdminJournalistsTab() {
  const [journalists, setJournalists] = useState(() => getAllJournalists());
  const [pressNotes, setPressNotes] = useState(() => getAllPressNotes());
  
  // Pestañas internas: 'journalists' (Equipo de Periodistas) | 'press_notes' (Notas de Prensa y Moderación)
  const [activeSubTab, setActiveSubTab] = useState('press_notes');
  
  // Filtro por periodista específico para notas de prensa
  const [selectedJournalistFilter, setSelectedJournalistFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'published' | 'pending_review'
  const [searchQuery, setSearchQuery] = useState('');

  // Formulario inline para agregar/editar periodista
  const [isJournalistFormOpen, setIsJournalistFormOpen] = useState(false);
  const [editingJournalist, setEditingJournalist] = useState(null);
  const [journalistForm, setJournalistForm] = useState({
    name: '',
    username: '',
    password: '',
    email: '',
    phone: '',
    role: 'Corresponsal',
    department: 'Información General',
    carruselCard: 'CNP Activo',
    avatar: '',
    signatureText: '',
    instagramHandle: '',
    twitterHandle: '',
    canAutoPublish: true,
    status: 'active'
  });

  // Modal / Visualizador de Nota de Prensa
  const [viewingNote, setViewingNote] = useState(null);

  // Recargar datos
  const reloadData = () => {
    setJournalists(getAllJournalists());
    setPressNotes(getAllPressNotes());
  };

  useEffect(() => {
    window.addEventListener('neblina_journalists_updated', reloadData);
    window.addEventListener('neblina_press_notes_updated', reloadData);
    return () => {
      window.removeEventListener('neblina_journalists_updated', reloadData);
      window.removeEventListener('neblina_press_notes_updated', reloadData);
    };
  }, []);

  // Manejar apertura de formulario de periodista
  const handleOpenJournalistForm = (j = null) => {
    if (j) {
      setEditingJournalist(j);
      setJournalistForm({ ...j });
    } else {
      setEditingJournalist(null);
      setJournalistForm({
        name: '',
        username: '',
        password: '',
        email: '',
        phone: '',
        role: 'Corresponsal',
        department: 'Información General',
        carruselCard: 'CNP Activo',
        avatar: '',
        signatureText: '',
        instagramHandle: '',
        twitterHandle: '',
        canAutoPublish: true,
        status: 'active'
      });
    }
    setIsJournalistFormOpen(true);
  };

  const handleSaveJournalistSubmit = (e) => {
    e.preventDefault();
    if (!journalistForm.name || !journalistForm.username || !journalistForm.password) {
      alert('Por favor complete los campos obligatorios: Nombre, Usuario y Contraseña.');
      return;
    }

    saveJournalist({
      ...journalistForm,
      id: editingJournalist ? editingJournalist.id : undefined
    });

    setIsJournalistFormOpen(false);
    setEditingJournalist(null);
    reloadData();
  };

  const handleDeleteJournalist = (id) => {
    if (confirm('¿Está seguro de eliminar este periodista del sistema? Sus notas de prensa ya publicadas se conservarán.')) {
      deleteJournalist(id);
      reloadData();
    }
  };

  const handleApproveNote = (noteId) => {
    setPressNoteStatus(noteId, 'published');
    reloadData();
  };

  const handleRejectNote = (noteId) => {
    setPressNoteStatus(noteId, 'rejected');
    reloadData();
  };

  const handleDeleteNote = (noteId) => {
    if (confirm('¿Desea eliminar permanentemente esta nota de prensa?')) {
      deletePressNote(noteId);
      reloadData();
    }
  };

  // Filtrado de Notas de Prensa
  const filteredNotes = pressNotes.filter(n => {
    const matchJournalist = selectedJournalistFilter === 'all' || n.journalistId === selectedJournalistFilter;
    const matchStatus = statusFilter === 'all' || n.status === statusFilter;
    const matchSearch = !searchQuery || 
      n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.journalistName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchJournalist && matchStatus && matchSearch;
  });

  // Métricas
  const totalNotesCount = pressNotes.length;
  const pendingNotesCount = pressNotes.filter(n => n.status === 'pending_review').length;
  const publishedNotesCount = pressNotes.filter(n => n.status === 'published').length;

  return (
    <div className="space-y-6">
      
      {/* 1. Banner Superior Aero Glass de Gestión de Periodistas & Redacción */}
      <div className="p-5 rounded-2xl aeroglass-card border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-[#001E4D]/90 backdrop-blur-2xl shadow-sm relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#00DD9E]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-[#00DD9E]">
                Sala de Redacción & Periodismo
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-[#00DD9E] border border-emerald-500/20">
                {journalists.length} Periodistas Registrados
              </span>
              {pendingNotesCount > 0 && (
                <span className="text-[11px] font-black px-2 py-0.5 rounded-lg bg-amber-500 text-slate-950 animate-pulse">
                  {pendingNotesCount} por Aprobar
                </span>
              )}
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
              Control de Periodistas & Notas de Prensa
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
              Crea accesos privados para redactores, reporteros y corresponsales. Supervisa y aprueba notas de prensa antes o después de salir al aire en la web oficial.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="p-3 rounded-xl bg-slate-100/90 dark:bg-white/[0.07] border border-slate-200/80 dark:border-white/10 backdrop-blur-md">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                <Users className="inline w-3 h-3 mr-1 text-[#00DD9E]" />Periodistas
              </span>
              <span className="text-lg font-black text-slate-900 dark:text-white">{journalists.length}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-100/90 dark:bg-white/[0.07] border border-slate-200/80 dark:border-white/10 backdrop-blur-md">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                <FileText className="inline w-3 h-3 mr-1 text-sky-500" />Notas Totales
              </span>
              <span className="text-lg font-black text-sky-600 dark:text-sky-400">{totalNotesCount}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-100/90 dark:bg-white/[0.07] border border-slate-200/80 dark:border-white/10 backdrop-blur-md">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="inline w-3 h-3 mr-1 text-emerald-500" />Publicadas
              </span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{publishedNotesCount}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-100/90 dark:bg-white/[0.07] border border-slate-200/80 dark:border-white/10 backdrop-blur-md">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                <Clock className="inline w-3 h-3 mr-1 text-amber-500" />Por Revisar
              </span>
              <span className="text-lg font-black text-amber-600 dark:text-amber-300">{pendingNotesCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Barra de Sub-Navegación y Acciones Rápidas */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
          <button
            type="button"
            onClick={() => setActiveSubTab('press_notes')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'press_notes'
                ? 'bg-[#001E4D] text-[#00DD9E] shadow-sm dark:bg-[#00DD9E] dark:text-[#001E4D]'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>Notas de Prensa ({totalNotesCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('journalists')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'journalists'
                ? 'bg-[#001E4D] text-[#00DD9E] shadow-sm dark:bg-[#00DD9E] dark:text-[#001E4D]'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Equipo de Periodistas ({journalists.length})</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {activeSubTab === 'journalists' && (
            <button
              type="button"
              onClick={() => handleOpenJournalistForm()}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Registrar Nuevo Periodista</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => window.open(`${window.location.origin}${window.location.pathname}#periodistas`, '_blank', 'noopener,noreferrer')}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#001E4D] hover:bg-[#002b66] dark:bg-white/10 dark:hover:bg-white/20 text-white font-bold text-xs transition cursor-pointer"
            title="Abrir la interfaz pública/privada de Periodistas en una pestaña aparte"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#00DD9E]" />
            <span>Abrir Portal de Periodistas</span>
          </button>
        </div>
      </div>

      {/* 3. Formulario Inline para Registrar / Editar Periodista */}
      {isJournalistFormOpen && (
        <form onSubmit={handleSaveJournalistSubmit} className="p-5 rounded-2xl aeroglass-card border border-emerald-500/40 bg-white/95 dark:bg-[#001E4D]/95 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-[#00DD9E] flex items-center justify-center">
                <UserPlus className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                {editingJournalist ? `Editar Periodista: ${editingJournalist.name}` : 'Crear Acceso para Nuevo Periodista'}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setIsJournalistFormOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Nombre Completo *</label>
              <input
                type="text"
                required
                value={journalistForm.name}
                onChange={e => setJournalistForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: Lic. Carlos Andrés Pérez"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Usuario de Acceso *</label>
              <input
                type="text"
                required
                value={journalistForm.username}
                onChange={e => setJournalistForm(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Ej: carlosperez"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Contraseña de Acceso *</label>
              <input
                type="text"
                required
                value={journalistForm.password}
                onChange={e => setJournalistForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Contraseña segura"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Cargo / Especialidad</label>
              <input
                type="text"
                value={journalistForm.role}
                onChange={e => setJournalistForm(prev => ({ ...prev, role: e.target.value }))}
                placeholder="Ej: Corresponsal de Sucesos / Redactor"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Carnet / CNP / Acreditación</label>
              <input
                type="text"
                value={journalistForm.carruselCard}
                onChange={e => setJournalistForm(prev => ({ ...prev, carruselCard: e.target.value }))}
                placeholder="Ej: CNP 25.140"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Teléfono Móvil (WhatsApp)</label>
              <input
                type="text"
                value={journalistForm.phone}
                onChange={e => setJournalistForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+58 414-XXXXXXX"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Correo Electrónico</label>
              <input
                type="email"
                value={journalistForm.email}
                onChange={e => setJournalistForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="correo@neblina105fm.com"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">URL de Foto / Avatar</label>
              <input
                type="text"
                value={journalistForm.avatar}
                onChange={e => setJournalistForm(prev => ({ ...prev, avatar: e.target.value }))}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Permiso de Publicación</label>
              <select
                value={journalistForm.canAutoPublish ? 'true' : 'false'}
                onChange={e => setJournalistForm(prev => ({ ...prev, canAutoPublish: e.target.value === 'true' }))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-semibold"
              >
                <option value="true">Publicación Inmediata (Directo a la Web)</option>
                <option value="false">Requiere Aprobación Previa del Director</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Instagram (@usuario)</label>
              <input
                type="text"
                value={journalistForm.instagramHandle || ''}
                onChange={e => setJournalistForm(prev => ({ ...prev, instagramHandle: e.target.value }))}
                placeholder="@usuario_instagram"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">X / Twitter (@usuario)</label>
              <input
                type="text"
                value={journalistForm.twitterHandle || ''}
                onChange={e => setJournalistForm(prev => ({ ...prev, twitterHandle: e.target.value }))}
                placeholder="@usuario_x"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Firma / Créditos Oficiales del Periodista</label>
              <textarea
                rows="2"
                value={journalistForm.signatureText || ''}
                onChange={e => setJournalistForm(prev => ({ ...prev, signatureText: e.target.value }))}
                placeholder="Ej: Lic. Nombre Apellido | CNP 00.000 · Cobertura Especial para Neblina Stereo 105.5 FM."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200 dark:border-white/10">
            <button
              type="button"
              onClick={() => setIsJournalistFormOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-slate-800 dark:text-white font-bold text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
            >
              {editingJournalist ? 'Actualizar Periodista' : 'Guardar y Dar Acceso'}
            </button>
          </div>
        </form>
      )}

      {/* 4. VISTA: TABLA / LISTA DE PERIODISTAS REGISTRADOS */}
      {activeSubTab === 'journalists' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {journalists.map(j => {
            const jNotes = pressNotes.filter(n => n.journalistId === j.id);
            return (
              <div key={j.id} className="p-4 rounded-2xl aeroglass-card border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#001E4D]/80 backdrop-blur-xl shadow-xs space-y-3 relative group">
                <div className="flex items-center space-x-3">
                  <AvatarWithFallback
                    src={j.avatar}
                    alt={j.name}
                    containerClassName="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#001E4D] to-slate-800 border-2 border-[#00DD9E] shrink-0 flex items-center justify-center overflow-hidden"
                    iconClassName="w-6 h-6 text-[#00DD9E]"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-[#00DD9E]">
                      {j.carruselCard || 'Periodista'}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate mt-0.5">{j.name}</h4>
                    <p className="text-[11px] text-slate-500 truncate">{j.role} · {j.department}</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-xs space-y-1">
                  <p className="text-slate-700 dark:text-slate-300">
                    <span className="text-slate-400">Usuario:</span> <strong className="font-mono">{j.username}</strong>
                  </p>
                  <p className="text-slate-700 dark:text-slate-300">
                    <span className="text-slate-400">Contraseña:</span> <span className="font-mono text-emerald-600 dark:text-[#00DD9E] font-bold">{j.password}</span>
                  </p>
                  <p className="text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span className="text-slate-400">Notas de prensa:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{jNotes.length}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    j.canAutoPublish ? 'bg-emerald-500/15 text-emerald-700 dark:text-[#00DD9E]' : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                  }`}>
                    {j.canAutoPublish ? 'Publicación Directa' : 'Requiere Revisión'}
                  </span>

                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => handleOpenJournalistForm(j)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition"
                      title="Editar periodista"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteJournalist(j.id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition"
                      title="Eliminar acceso"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. VISTA: NOTAS DE PRENSA PUBLICADAS CON FILTRO POR PERIODISTA */}
      {activeSubTab === 'press_notes' && (
        <div className="space-y-4">
          
          {/* Barra de Filtros: Filtro por Periodista, Estado y Buscador */}
          <div className="p-3.5 rounded-2xl aeroglass-card border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#001E4D]/80 backdrop-blur-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            
            {/* Filtro por Periodista */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-[#00DD9E] flex-shrink-0" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">Periodista:</span>
              <select
                value={selectedJournalistFilter}
                onChange={e => setSelectedJournalistFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-black/30 border border-slate-300 dark:border-white/15 text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="all">Todos los Periodistas ({journalists.length})</option>
                {journalists.map(j => (
                  <option key={j.id} value={j.id}>{j.name} ({j.role})</option>
                ))}
              </select>
            </div>

            {/* Filtro por Estado */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">Estado:</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-black/30 border border-slate-300 dark:border-white/15 text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="all">Todos los Estados</option>
                <option value="published">Publicadas en la Web</option>
                <option value="pending_review">Pendientes de Revisión</option>
                <option value="rejected">Rechazadas</option>
              </select>
            </div>

            {/* Buscador de Notas */}
            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar por titular o tema..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-black/30 border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Listado de Notas de Prensa */}
          {filteredNotes.length === 0 ? (
            <div className="p-8 text-center rounded-2xl aeroglass-card border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-[#001E4D]/60 space-y-2">
              <Newspaper className="w-10 h-10 mx-auto text-slate-400 opacity-60" />
              <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">No hay notas de prensa registradas con este filtro</p>
              <p className="text-xs text-slate-500">Los periodistas pueden enviar notas desde su portal o puedes crear una nota directa.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotes.map(note => {
                const isPublished = note.status === 'published';
                const isPending = note.status === 'pending_review';

                return (
                  <div key={note.id} className="p-4 rounded-2xl aeroglass-card border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-[#001E4D]/90 backdrop-blur-xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition hover:border-[#00DD9E]/40">
                    <div className="flex items-start space-x-3.5 min-w-0 flex-1">
                      {note.image ? (
                        <img
                          src={note.image}
                          alt={note.title}
                          className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-white/10 flex-shrink-0"
                          onError={e => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-400 flex-shrink-0">
                          <Newspaper className="w-6 h-6" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-[#00DD9E]">
                            {note.category || 'Nota de Prensa'}
                          </span>
                          
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isPublished ? 'bg-emerald-500 text-white' : isPending ? 'bg-amber-500 text-slate-950 font-black animate-pulse' : 'bg-rose-500 text-white'
                          }`}>
                            {isPublished ? 'Publicada en la Web' : isPending ? 'Pendiente de Aprobación' : 'Rechazada'}
                          </span>

                          <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                            <Calendar className="w-3 h-3 text-[#00DD9E]" />
                            <span>{note.date}</span>
                          </span>
                        </div>

                        <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mt-1 line-clamp-1">
                          {note.title}
                        </h4>

                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          Por: <strong className="text-slate-800 dark:text-slate-200">{note.journalistName}</strong> ({note.journalistRole || 'Corresponsal'})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0 self-end md:self-center">
                      <button
                        type="button"
                        onClick={() => setViewingNote(note)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-800 dark:text-white text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Leer</span>
                      </button>

                      {isPending && (
                        <button
                          type="button"
                          onClick={() => handleApproveNote(note.id)}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow flex items-center space-x-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Aprobar & Publicar</span>
                        </button>
                      )}

                      {isPending && (
                        <button
                          type="button"
                          onClick={() => handleRejectNote(note.id)}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500 hover:text-white text-rose-600 text-xs font-bold transition cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Rechazar</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition cursor-pointer"
                        title="Eliminar nota"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* Modal / Visualizador de la Nota de Prensa Completa */}
      {viewingNote && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-[#001E4D] border border-slate-200 dark:border-white/15 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-[#00DD9E]">
                  Nota de Prensa Oficial
                </span>
                <p className="text-xs text-slate-500 mt-0.5">Por: {viewingNote.journalistName} · {viewingNote.date}</p>
              </div>
              <button
                type="button"
                onClick={() => setViewingNote(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              {viewingNote.image && (
                <img
                  src={viewingNote.image}
                  alt={viewingNote.title}
                  className="w-full max-h-64 object-cover rounded-xl border border-slate-200 dark:border-white/10"
                />
              )}

              <h2 className="text-xl font-black text-slate-900 dark:text-white leading-snug">
                {viewingNote.title}
              </h2>

              <div 
                className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed space-y-2"
                dangerouslySetInnerHTML={{ __html: viewingNote.content || viewingNote.excerpt }}
              />

              {/* Firma y Créditos del Periodista en la Vista Previa */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 flex items-center space-x-3 text-xs">
                {viewingNote.journalistAvatar ? (
                  <img src={viewingNote.journalistAvatar} alt="" className="w-10 h-10 rounded-full object-cover border border-emerald-500/40" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center font-bold text-slate-700 dark:text-white">
                    {viewingNote.journalistName?.charAt(0) || 'P'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-slate-900 dark:text-white">{viewingNote.journalistName}</span>
                    {viewingNote.journalistCnp && <span className="text-[10px] text-slate-500 font-semibold">· {viewingNote.journalistCnp}</span>}
                  </div>
                  <p className="text-[11px] text-slate-500 whitespace-pre-line mt-0.5">
                    {viewingNote.journalistSignature || viewingNote.journalistRole || 'Periodista de Neblina Stereo 105.5 FM'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-white/5">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                viewingNote.status === 'published' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-slate-950 font-black'
              }`}>
                {viewingNote.status === 'published' ? 'En Vivo en la Web' : 'Esperando Aprobación'}
              </span>

              <div className="flex items-center space-x-2">
                {viewingNote.status !== 'published' && (
                  <button
                    type="button"
                    onClick={() => {
                      handleApproveNote(viewingNote.id);
                      setViewingNote(null);
                    }}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    Aprobar & Publicar Ahora
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setViewingNote(null)}
                  className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-white/10 text-slate-800 dark:text-white font-bold text-xs"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
