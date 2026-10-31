import React, { useState, useEffect, useRef } from 'react';
import AvatarWithFallback from '../AvatarWithFallback';
import { 
  Users, 
  Mic, 
  DollarSign, 
  TrendingUp, 
  Key, 
  Lock, 
  User, 
  ShieldCheck, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Copy, 
  Check, 
  Send, 
  Eye, 
  ExternalLink, 
  Megaphone, 
  Radio, 
  MessageSquare, 
  Calendar, 
  FileText, 
  Award, 
  Building2, 
  ChevronDown, 
  ChevronUp,
  CreditCard,
  Share2,
  Phone,
  Upload,
  X
} from 'lucide-react';
import Emoji3D from '../Emoji3D';
import { 
  getAllStaffUsers, 
  saveStaffUser, 
  toggleStaffActive, 
  deleteStaffUser, 
  generateStaffWhatsAppMessage,
  setStaffSession,
  getAllStaffTasks,
  saveStaffTask,
  updateStaffTaskStatus,
  deleteStaffTask,
  getAllStaffInterviews,
  deleteStaffInterview,
  getAllStaffMessages,
  sendStaffMessage,
  markStaffMessagesAsRead,
  getStaffSalesMetrics
} from '../../services/staffPortalService';
import { getAllClients, getAllPayments } from '../../services/radioClientsService';
import { getCachedBcvRates } from '../../services/bcvService';

export default function AdminStaffPortalManager({ onShowToast, onOpenStaffPortalAs, mode = 'full' }) {
  const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  // Scroll suave para sub-paneles inline
  const scrollToSubpanel = (id) => {
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 60);
  };

  // Subir foto de perfil de locutor
  const handleAvatarFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2.5 * 1024 * 1024) {
      if (onShowToast) onShowToast('La foto debe ser menor a 2.5 MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setStaffForm(prev => ({ ...prev, avatar: event.target.result }));
      if (onShowToast) onShowToast('Foto de perfil cargada');
    };
    reader.readAsDataURL(file);
  };

  // Sub-pestañas: 'rendimiento' | 'accesos' | 'tareas' | 'entrevistas' | 'mensajeria'
  const [subTab, setSubTab] = useState(mode === 'team_only' ? 'accesos' : 'rendimiento');

  const [staffUsers, setStaffUsers] = useState(() => getAllStaffUsers());
  const [clients, setClients] = useState(() => getAllClients().filter(c => !c.trashed));
  const [payments, setPayments] = useState(() => getAllPayments());
  const [tasks, setTasks] = useState(() => getAllStaffTasks());
  const [interviews, setInterviews] = useState(() => getAllStaffInterviews());
  const [messages, setMessages] = useState(() => getAllStaffMessages());
  const [bcvRates, setBcvRates] = useState(() => getCachedBcvRates());

  // Búsqueda y filtros
  const [searchStaff, setSearchStaff] = useState('');
  const [selectedStaffDetailId, setSelectedStaffDetailId] = useState(null);
  const [copiedKeyId, setCopiedKeyId] = useState(null);

  // Modal para Crear / Editar Acceso de Locutor
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [staffForm, setStaffForm] = useState({
    name: '',
    role: 'Locutor & Productor',
    programName: '',
    programSchedule: '',
    assignedDays: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
    phone: '',
    username: '',
    password: '',
    commissionRate: 20,
    avatar: '',
    accessActive: true
  });

  // Modal para Asignar Nueva Tarea / Pauta
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    staffId: '',
    type: 'publicitaria', // 'publicitaria' | 'programacion'
    title: '',
    description: '',
    programName: '',
    scheduledDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    priority: 'alta'
  });

  // Chat con Locutores
  const [chatStaffId, setChatStaffId] = useState(() => staffUsers[0]?.id || '');
  const [chatText, setChatText] = useState('');
  const chatBottomRef = useRef(null);

  // Escuchar actualizaciones
  useEffect(() => {
    const handleUpdate = () => {
      setStaffUsers(getAllStaffUsers());
      setClients(getAllClients().filter(c => !c.trashed));
      setPayments(getAllPayments());
      setTasks(getAllStaffTasks());
      setInterviews(getAllStaffInterviews());
      setMessages(getAllStaffMessages());
    };

    window.addEventListener('neblina_staff_updated', handleUpdate);
    window.addEventListener('neblina_clients_updated', handleUpdate);
    return () => {
      window.removeEventListener('neblina_staff_updated', handleUpdate);
      window.removeEventListener('neblina_clients_updated', handleUpdate);
    };
  }, []);

  useEffect(() => {
    if (subTab === 'mensajeria') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, subTab, chatStaffId]);

  // Cálculos consolidados globales
  const totalStaffCount = staffUsers.length;
  const activeStaffCount = staffUsers.filter(s => s.accessActive).length;

  // Totalizar ventas sumando todos los clientes de locutores
  const staffClients = clients.filter(c => c.locutorId);
  const totalBilledUsd = staffClients.reduce((acc, c) => acc + (Number(c.amountUsd) || 0), 0);
  const totalBilledBs = totalBilledUsd * (bcvRates.usd || 884.75);

  const totalCollectedUsd = staffClients
    .filter(c => c.paymentStatus === 'paid')
    .reduce((acc, c) => acc + (Number(c.amountUsd) || 0), 0);
  const totalCollectedBs = totalCollectedUsd * (bcvRates.usd || 884.75);

  const totalPendingUsd = staffClients
    .filter(c => c.paymentStatus === 'pending' || c.paymentStatus === 'overdue')
    .reduce((acc, c) => acc + (Number(c.amountUsd) || 0), 0);

  // Guardar Locutor / Acceso
  const handleSaveStaffSubmit = (e) => {
    e.preventDefault();
    if (!staffForm.name.trim() || !staffForm.username.trim()) {
      alert('Por favor ingrese el nombre del locutor y el usuario.');
      return;
    }

    saveStaffUser({
      ...staffForm,
      id: editingStaff?.id || undefined,
      commissionRate: Number(staffForm.commissionRate) || 20
    });

    setStaffUsers(getAllStaffUsers());
    setIsStaffModalOpen(false);
    setEditingStaff(null);
    if (onShowToast) onShowToast(editingStaff ? 'Locutor actualizado' : 'Nuevo locutor registrado con acceso');
  };

  const openNewStaffModal = () => {
    setEditingStaff(null);
    setStaffForm({
      name: '',
      role: 'Locutor & Productor',
      programName: '',
      programSchedule: 'Lunes a Viernes • 9:00 AM - 12:00 PM',
      assignedDays: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
      phone: '+58 ',
      username: '',
      password: 'neblina105',
      commissionRate: 20,
      avatar: '',
      accessActive: true
    });
    setIsStaffModalOpen(true);
    scrollToSubpanel('staff-form-inline');
  };

  const openEditStaffModal = (staff) => {
    setEditingStaff(staff);
    setStaffForm({
      name: staff.name || '',
      role: staff.role || 'Locutor & Productor',
      programName: staff.programName || '',
      programSchedule: staff.programSchedule || '',
      assignedDays: Array.isArray(staff.assignedDays) && staff.assignedDays.length > 0
        ? staff.assignedDays
        : ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
      phone: staff.phone || '',
      username: staff.username || '',
      password: staff.password || '',
      commissionRate: staff.commissionRate || 20,
      avatar: staff.avatar || '',
      accessActive: staff.accessActive !== false
    });
    setIsStaffModalOpen(true);
    scrollToSubpanel('staff-form-inline');
  };

  const toggleDayInStaffForm = (day) => {
    setStaffForm(prev => {
      const current = Array.isArray(prev.assignedDays) ? prev.assignedDays : [];
      const exists = current.includes(day);
      const next = exists ? current.filter(d => d !== day) : [...current, day];
      return {
        ...prev,
        assignedDays: next.length > 0 ? next : [day]
      };
    });
  };

  const handleCopyWhatsApp = (staff) => {
    const text = generateStaffWhatsAppMessage(staff);
    navigator.clipboard.writeText(text);
    setCopiedKeyId(staff.id);
    if (onShowToast) onShowToast(`Datos de acceso para ${staff.name} copiados para WhatsApp`);
    setTimeout(() => setCopiedKeyId(null), 2500);
  };

  // Asignar Tarea
  const handleSaveTaskSubmit = (e) => {
    e.preventDefault();
    if (!taskForm.title.trim() || !taskForm.staffId) {
      alert('Por favor complete el título de la tarea y seleccione al locutor.');
      return;
    }

    const selectedStaff = staffUsers.find(s => s.id === taskForm.staffId);

    saveStaffTask({
      ...taskForm,
      staffName: selectedStaff?.name || 'Locutor',
      programName: taskForm.programName || selectedStaff?.programName || 'Programación General',
      status: 'pendiente'
    });

    setTasks(getAllStaffTasks());
    setIsTaskModalOpen(false);
    if (onShowToast) onShowToast('Tarea y pauta asignada al locutor');
  };

  // Enviar mensaje de Director a Locutor
  const handleSendDirectorMessage = (e) => {
    e.preventDefault();
    if (!chatText.trim() || !chatStaffId) return;

    sendStaffMessage({
      staffId: chatStaffId,
      sender: 'director',
      text: chatText
    });

    setChatText('');
    setMessages(getAllStaffMessages());
  };

  // Entrar al portal como este locutor (en pestaña independiente)
  const handleEnterAsStaff = (staff) => {
    setStaffSession(staff);
    if (onOpenStaffPortalAs) {
      onOpenStaffPortalAs(staff);
    } else {
      window.open(`${window.location.origin}${window.location.pathname}#locutores`, '_blank', 'noopener,noreferrer');
    }
  };

  const activeChatMessages = messages.filter(m => m.staffId === chatStaffId);
  const activeChatStaff = staffUsers.find(s => s.id === chatStaffId);

  return (
    <div className="space-y-5">
      
      {/* Banner Superior de Métricas Consolidadas por Locutor (Adaptable a Modo Claro y Oscuro con Alto Contraste) */}
      <div className="p-5 rounded-2xl aeroglass-card border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-[#001E4D]/90 backdrop-blur-2xl shadow-sm relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#00DD9E]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-[#00DD9E]">Gestión Comercial de Cabina</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-[#00DD9E] border border-emerald-500/20">
                {activeStaffCount} Locutores Activos
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">Control de Ventas & Pautas por Locutor</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
              Monitorea los clientes ingresados por cada locutor, las cobranzas recibidas, comisiones calculadas y asignación de pautas en vivo.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="p-3 rounded-xl bg-slate-100/90 dark:bg-white/[0.07] border border-slate-200/80 dark:border-white/10 backdrop-blur-md">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"><Users className="inline w-3 h-3 mr-1 -mt-0.5 text-[#00DD9E]" />Clientes Totales</span>
              <span className="text-lg font-black text-slate-900 dark:text-white">{staffClients.length}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-100/90 dark:bg-white/[0.07] border border-slate-200/80 dark:border-white/10 backdrop-blur-md">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"><TrendingUp className="inline w-3 h-3 mr-1 -mt-0.5 text-emerald-600 dark:text-emerald-400" />Ventas ($)</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">${totalBilledUsd}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-100/90 dark:bg-white/[0.07] border border-slate-200/80 dark:border-white/10 backdrop-blur-md">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"><CheckCircle2 className="inline w-3 h-3 mr-1 -mt-0.5 text-teal-600 dark:text-teal-300" />Cobrado ($)</span>
              <span className="text-lg font-black text-teal-600 dark:text-teal-300">${totalCollectedUsd}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-100/90 dark:bg-white/[0.07] border border-slate-200/80 dark:border-white/10 backdrop-blur-md">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"><Clock className="inline w-3 h-3 mr-1 -mt-0.5 text-amber-600 dark:text-amber-300" />Pendiente ($)</span>
              <span className="text-lg font-black text-amber-600 dark:text-amber-300">${totalPendingUsd}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navegación por Sub-Pestañas del Director */}
      {mode !== 'sales_only' && (
        <div className="flex items-center space-x-1 p-1.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 overflow-x-auto">
          {mode !== 'team_only' && (
            <button
              type="button"
              onClick={() => setSubTab('rendimiento')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                subTab === 'rendimiento'
                  ? 'bg-[#001E4D] text-[#00DD9E] shadow-sm dark:bg-[#00DD9E] dark:text-[#001E4D]'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Ventas & Ingresos por Locutor</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setSubTab('accesos')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              subTab === 'accesos'
                ? 'bg-[#001E4D] text-[#00DD9E] shadow-sm dark:bg-[#00DD9E] dark:text-[#001E4D]'
                : 'text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Accesos & Credenciales</span>
            <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[11px] font-black">{staffUsers.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('tareas')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              subTab === 'tareas'
                ? 'bg-[#001E4D] text-[#00DD9E] shadow-sm dark:bg-[#00DD9E] dark:text-[#001E4D]'
                : 'text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>Asignar Tareas & Pautas</span>
            <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[11px] font-black">{tasks.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('entrevistas')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              subTab === 'entrevistas'
                ? 'bg-[#001E4D] text-[#00DD9E] shadow-sm dark:bg-[#00DD9E] dark:text-[#001E4D]'
                : 'text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>Bitácora de Entrevistas</span>
            <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[11px] font-black">{interviews.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('mensajeria')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              subTab === 'mensajeria'
                ? 'bg-[#001E4D] text-[#00DD9E] shadow-sm dark:bg-[#00DD9E] dark:text-[#001E4D]'
                : 'text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat con Locutores</span>
          </button>
        </div>
      )}

      {/* =========================================================================
          SUB-PESTAÑA 1: VENTAS & RENDIMIENTO POR LOCUTOR
      ========================================================================= */}
      {subTab === 'rendimiento' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <h4 className="text-sm font-black text-slate-900 dark:text-white">
              Desglose Individual de Ventas y Cobranzas por Locutor
            </h4>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Tasa Oficial BCV: {(bcvRates.usd || 884.75).toFixed(2)} Bs / $
            </div>
          </div>

          <div className="space-y-4">
            {staffUsers.map(staff => {
              const metrics = getStaffSalesMetrics(staff.id, clients, payments, bcvRates.usd);
              const isSelected = selectedStaffDetailId === staff.id;
              const staffClientsList = clients.filter(c => String(c.locutorId) === String(staff.id));

              return (
                <div
                  key={staff.id}
                  className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 shadow-sm overflow-hidden"
                >
                  <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Información del Locutor */}
                    <div className="flex items-center space-x-3.5">
                      <AvatarWithFallback
                        src={staff.avatar}
                        alt={staff.name}
                        containerClassName="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#001E4D] to-slate-800 border border-slate-200 dark:border-white/10 shrink-0 flex items-center justify-center overflow-hidden"
                        iconClassName="w-6 h-6 text-[#00DD9E]"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-base font-black text-slate-900 dark:text-white">{staff.name}</h4>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${
                            staff.accessActive ? 'bg-emerald-500/10 text-emerald-600 dark:text-[#00DD9E]' : 'bg-rose-500/10 text-rose-600'
                          }`}>
                            {staff.accessActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {staff.programName || 'Sin programa asignado'} • Comisión: {staff.commissionRate || 20}%
                        </p>
                      </div>
                    </div>

                    {/* Resumen de Ventas del Locutor */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center lg:w-1/2 w-full">
                      <div className="p-2 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                        <span className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">Clientes</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white">{metrics.totalClientsCount}</span>
                      </div>
                      <div className="p-2 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                        <span className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">Facturado</span>
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">${metrics.totalBilledUsd}</span>
                      </div>
                      <div className="p-2 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                        <span className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">Cobrado</span>
                        <span className="text-sm font-black text-teal-600 dark:text-teal-400">${metrics.totalCollectedUsd}</span>
                      </div>
                      <div className="p-2 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                        <span className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">Comisión Est.</span>
                        <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">${metrics.estimatedCommissionUsd.toFixed(1)}</span>
                      </div>
                    </div>

                    {/* Botones de Acción */}
                    <div className="flex items-center space-x-2 self-end sm:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEnterAsStaff(staff)}
                        className="px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-[#00DD9E] text-xs font-bold transition cursor-pointer flex items-center space-x-1"
                        title="Abrir el portal del locutor directamente"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Ver Portal</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedStaffDetailId(isSelected ? null : staff.id)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                        title={isSelected ? 'Ocultar clientes' : 'Ver clientes asignados'}
                      >
                        {isSelected ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Detalle Desplegable de Clientes del Locutor */}
                  {isSelected && (
                    <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-white/5 bg-slate-50/70 dark:bg-white/[0.01] space-y-3">
                      <h5 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Clientes Registrados por {staff.name} ({staffClientsList.length})
                      </h5>

                      {staffClientsList.length === 0 ? (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Este locutor aún no ha registrado clientes en su portal.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {staffClientsList.map(c => (
                            <div
                              key={c.id}
                              className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-white/5 text-xs shadow-xs"
                            >
                              <div className="flex items-start justify-between">
                                <h6 className="font-bold text-slate-900 dark:text-white">{c.businessName}</h6>
                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${
                                  c.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                                }`}>
                                  {c.paymentStatus === 'paid' ? 'Al Día' : 'Pendiente'}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">{c.ownerName} • {c.ownerPhone}</p>
                              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between font-bold">
                                <span>Pauta: ${c.amountUsd} / {c.paymentFrequency || 'mes'}</span>
                                <span className="text-emerald-600">
                                  {((Number(c.amountUsd) || 0) * (bcvRates.usd || 884.75)).toLocaleString('es-VE', { maximumFractionDigits: 0 })} Bs.
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-PESTAÑA 2: ACCESOS Y CREDENCIALES DEL PERSONAL
      ========================================================================= */}
      {subTab === 'accesos' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <h4 className="text-sm font-black text-slate-900 dark:text-white">
              Credenciales de Acceso para Locutores y Equipo Comercial
            </h4>

            <button
              type="button"
              onClick={openNewStaffModal}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-2xl bg-[#001E4D] text-[#00DD9E] dark:bg-[#00DD9E] dark:text-[#001E4D] font-black text-xs shadow-sm hover:brightness-110 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Nuevo Acceso</span>
            </button>
          </div>

          {/* SUB-PANEL INLINE: CREAR / EDITAR ACCESO DE LOCUTOR */}
          {isStaffModalOpen && (
            <div id="staff-form-inline" className="p-5 sm:p-6 rounded-2xl bg-slate-100 dark:bg-[#1c2633] border-2 border-emerald-500/30 shadow-xl space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center space-x-2.5">
                  <Key className="w-5 h-5 text-emerald-500" />
                  <div>
                    <h4 className="text-base font-black text-slate-900 dark:text-white">
                      {editingStaff ? `Editar Acceso: ${editingStaff.name}` : 'Crear Nuevo Acceso de Locutor'}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Configura credenciales, programa asignado y días de transmisión al aire
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setIsStaffModalOpen(false); setEditingStaff(null); }}
                  className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveStaffSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      value={staffForm.name}
                      onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                      placeholder="Ej. Carlos Méndez"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Rol en la Emisora</label>
                    <input
                      type="text"
                      value={staffForm.role}
                      onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                      placeholder="Locutor & Productor"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 font-medium text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Teléfono / WhatsApp</label>
                    <input
                      type="text"
                      value={staffForm.phone}
                      onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                      placeholder="+58 414-0000000"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 font-medium text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre del Programa Radial</label>
                    <input
                      type="text"
                      value={staffForm.programName}
                      onChange={(e) => setStaffForm({ ...staffForm, programName: e.target.value })}
                      placeholder="Ej. Mañanas de Neblina"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Horario del Programa</label>
                    <input
                      type="text"
                      value={staffForm.programSchedule}
                      onChange={(e) => setStaffForm({ ...staffForm, programSchedule: e.target.value })}
                      placeholder="Ej. Lunes a Viernes • 9:00 AM - 12:00 PM"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 font-medium text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">% Comisión por Ventas</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={staffForm.commissionRate}
                      onChange={(e) => setStaffForm({ ...staffForm, commissionRate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Días Asignados de Programación */}
                <div className="p-3.5 rounded-xl bg-white/80 dark:bg-black/20 border border-slate-200 dark:border-white/10 space-y-2">
                  <label className="block font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                    Días Asignados a su Programa (Sincroniza con Guion y Programación Diaria del Locutor)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {DAYS_OF_WEEK.map(day => {
                      const active = (staffForm.assignedDays || []).includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDayInStaffForm(day)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                            active
                              ? 'bg-[#001E4D] text-[#00DD9E] border-[#00DD9E]/40 dark:bg-[#00DD9E] dark:text-[#001E4D] shadow-xs'
                              : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10'
                          }`}
                        >
                          <span className="inline-flex items-center gap-1">{active && <Check className="w-3 h-3" />}{day}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Usuario de Acceso *</label>
                    <input
                      type="text"
                      required
                      value={staffForm.username}
                      onChange={(e) => setStaffForm({ ...staffForm, username: e.target.value })}
                      placeholder="Ej. carlos105"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 font-mono font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Contraseña *</label>
                    <input
                      type="text"
                      required
                      value={staffForm.password}
                      onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                      placeholder="Contraseña"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 font-mono font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Foto de Perfil (Opcional)</label>
                    <label className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center space-x-1.5 cursor-pointer hover:border-[#00DD9E]">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{staffForm.avatar ? 'Cambiar Foto' : 'Subir Foto'}</span>
                      <input type="file" accept="image/*" onChange={handleAvatarFileUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => { setIsStaffModalOpen(false); setEditingStaff(null); }}
                    className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-200 font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00DD9E] text-[#001E4D] font-black shadow-md hover:brightness-105 transition cursor-pointer"
                  >
                    {editingStaff ? 'Guardar Cambios' : 'Registrar Locutor'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {staffUsers.map(staff => (
              <div
                key={staff.id}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-3">
                      <AvatarWithFallback
                        src={staff.avatar}
                        alt={staff.name}
                        containerClassName="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#001E4D] to-slate-800 border border-slate-200 dark:border-white/10 shrink-0 flex items-center justify-center overflow-hidden"
                        iconClassName="w-5 h-5 text-[#00DD9E]"
                      />
                      <div>
                        <h4 className="text-base font-black text-slate-900 dark:text-white">{staff.name}</h4>
                        <p className="text-xs text-slate-500">{staff.role}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleStaffActive(staff.id)}
                      className={`text-[11px] font-black px-2.5 py-1 rounded-lg cursor-pointer transition ${
                        staff.accessActive
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-[#00DD9E] border border-emerald-500/20 hover:bg-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-600 border border-rose-500/20 hover:bg-rose-500/20'
                      }`}
                    >
                      {staff.accessActive ? '• Acceso Activo' : '• Pausado'}
                    </button>
                  </div>

                  {/* Credenciales */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-bold">Usuario:</span>
                      <span className="font-mono font-black text-slate-900 dark:text-white bg-white dark:bg-white/10 px-2 py-0.5 rounded-md">
                        {staff.username}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-bold">Contraseña:</span>
                      <span className="font-mono font-black text-slate-900 dark:text-white bg-white dark:bg-white/10 px-2 py-0.5 rounded-md">
                        {staff.password}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-bold">Programa:</span>
                      <span className="text-slate-800 dark:text-slate-200 font-medium">
                        {staff.programName || 'General'}
                      </span>
                    </div>
                    {Array.isArray(staff.assignedDays) && staff.assignedDays.length > 0 && (
                      <div className="pt-1 border-t border-slate-200/60 dark:border-white/5 flex flex-wrap gap-1">
                        {staff.assignedDays.map(d => (
                          <span key={d} className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-[#00DD9E]">
                            {d}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-white/5 text-xs">
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopyWhatsApp(staff)}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-[#00DD9E] font-bold transition cursor-pointer"
                    >
                      {copiedKeyId === staff.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copiar WhatsApp</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEnterAsStaff(staff)}
                      className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold transition cursor-pointer"
                      title="Abrir portal de este locutor en nueva pestaña"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Portal</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => openEditStaffModal(staff)}
                      className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 cursor-pointer"
                      title="Editar"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`¿Eliminar las credenciales de ${staff.name}?`)) {
                          deleteStaffUser(staff.id);
                          setStaffUsers(getAllStaffUsers());
                        }
                      }}
                      className="p-1.5 rounded-xl hover:bg-rose-500/10 text-rose-500 cursor-pointer"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-PESTAÑA 3: ASIGNAR TAREAS Y PAUTAS A LOCUTORES
      ========================================================================= */}
      {subTab === 'tareas' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                Pautas Publicitarias y Actividades de Programación Asignadas
              </h4>
              <p className="text-xs text-slate-500">
                Pauta menciones comerciales, coberturas y enlaces en vivo que los locutores deben emitir.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setTaskForm({
                  staffId: staffUsers[0]?.id || '',
                  type: 'publicitaria',
                  title: '',
                  description: '',
                  programName: '',
                  scheduledDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
                  priority: 'alta'
                });
                setIsTaskModalOpen(true);
                scrollToSubpanel('task-form-inline');
              }}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Asignar Nueva Pauta</span>
            </button>
          </div>

          {/* INLINE SUB-PANEL: ASIGNAR TAREA */}
          {isTaskModalOpen && (
            <div id="task-form-inline" className="p-5 sm:p-6 rounded-2xl bg-slate-100 dark:bg-[#1c2633] border-2 border-emerald-500/30 shadow-xl space-y-4 animate-fadeIn my-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center space-x-2.5">
                  <Calendar className="w-5 h-5 text-emerald-500" />
                  <div>
                    <h4 className="text-base font-black text-slate-900 dark:text-white">
                      Asignar Nueva Tarea o Pauta al Locutor
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Pautas publicitarias, menciones en vivo o actividades pautadas
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="p-1 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveTaskSubmit} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Locutor Responsable *</label>
                    <select
                      value={taskForm.staffId}
                      onChange={(e) => setTaskForm({ ...taskForm, staffId: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 font-bold text-slate-900 dark:text-white"
                    >
                      {staffUsers.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.programName || s.role})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tipo de Actividad</label>
                    <select
                      value={taskForm.type}
                      onChange={(e) => setTaskForm({ ...taskForm, type: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 font-bold text-slate-900 dark:text-white"
                    >
                      <option value="publicitaria">Pauta Publicitaria / Mención Comercial</option>
                      <option value="programacion">Actividad de Programación / Producción</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Título de la Actividad *</label>
                  <input
                    type="text"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    required
                    placeholder="Ej. Transmisión especial Fogón Andino"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Descripción / Instrucciones de la Pauta</label>
                  <textarea
                    rows={3}
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    placeholder="Detalles de la pauta, mención, número de pases en vivo, indicaciones específicas..."
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Fecha y Hora Programada</label>
                    <input
                      type="datetime-local"
                      value={taskForm.scheduledDate}
                      onChange={(e) => setTaskForm({ ...taskForm, scheduledDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Prioridad</label>
                    <select
                      value={taskForm.priority}
                      onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 font-bold text-slate-900 dark:text-white"
                    >
                      <option value="alta">Alta (Prioritaria)</option>
                      <option value="media">Media</option>
                      <option value="baja">Baja</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsTaskModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-300 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00DD9E] text-[#001E4D] font-black shadow-md hover:brightness-105 active:scale-95 transition cursor-pointer"
                  >
                    Asignar Pauta al Locutor
                  </button>
                </div>
              </form>
            </div>
          )}


          <div className="space-y-3">
            {tasks.map(task => {
              const isPub = task.type === 'publicitaria';
              const isDone = task.status === 'completada';

              return (
                <div
                  key={task.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-lg flex items-center space-x-1 ${
                        isPub ? 'bg-emerald-500/10 text-emerald-600 dark:text-[#00DD9E]' : 'bg-indigo-500/10 text-indigo-600'
                      }`}>
                        {isPub ? <Megaphone className="w-3 h-3" /> : <Radio className="w-3 h-3" />}
                        <span>{isPub ? 'Pauta Publicitaria' : 'Programación'}</span>
                      </span>

                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        Para: {task.staffName}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${
                        isDone ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                      }`}>
                        <span className="inline-flex items-center gap-1">{isDone ? <><CheckCircle2 className="w-3 h-3" /> Emitida / Completada</> : <><Clock className="w-3 h-3" /> Pendiente de emisión</>}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          deleteStaffTask(task.id);
                          setTasks(getAllStaffTasks());
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 cursor-pointer"
                        title="Eliminar tarea"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h5 className="text-sm font-black text-slate-900 dark:text-white mb-1">{task.title}</h5>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">{task.description}</p>

                  <div className="text-[11px] text-slate-500 flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5">
                    <span>Pautado para: {new Date(task.scheduledDate).toLocaleString('es-VE')}</span>
                    {task.locutorNotes && (
                      <span className="text-emerald-600 dark:text-[#00DD9E] font-medium">
                        Nota del locutor: "{task.locutorNotes}"
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-PESTAÑA 4: BITÁCORA GENERAL DE ENTREVISTAS
      ========================================================================= */}
      {subTab === 'entrevistas' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                Registro de Entrevistas Realizadas en la Emisora
              </h4>
              <p className="text-xs text-slate-500">
                Historial completo de invitados, autoridades y emprendedores entrevistados al aire por cada programa.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500">
              {interviews.length} entrevistas archivadas
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {interviews.map(intw => (
              <div
                key={intw.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-[#00DD9E]">
                        {intw.date} • {intw.time}
                      </span>
                      <h5 className="text-base font-black text-slate-900 dark:text-white mt-1">
                        {intw.intervieweeName}
                      </h5>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        {intw.intervieweeRoleOrg || 'Sin cargo especificado'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('¿Eliminar esta entrevista?')) {
                          deleteStaffInterview(intw.id);
                          setInterviews(getAllStaffInterviews());
                        }
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-500 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-3 my-2 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Tema Tratado:
                    </span>
                    <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                      {intw.topic}
                    </p>
                  </div>

                  {intw.observations && (
                    <p className="text-[11px] text-slate-500 italic">
                      Obs: {intw.observations}
                    </p>
                  )}
                </div>

                <div className="pt-2 mt-2 border-t border-slate-100 dark:border-white/5 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Locutor: <strong>{intw.staffName}</strong></span>
                  <span>Programa: {intw.programName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-PESTAÑA 5: CHAT CON LOCUTORES
      ========================================================================= */}
      {subTab === 'mensajeria' && (
        <div className="flex flex-col md:flex-row h-[500px] rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 overflow-hidden">
          {/* Lista de Locutores */}
          <div className="w-full md:w-72 border-r border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] flex flex-col">
            <div className="p-3 border-b border-slate-200 dark:border-white/10 text-xs font-black uppercase text-slate-500">
              Personal de Cabina
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
              {staffUsers.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setChatStaffId(s.id);
                    markStaffMessagesAsRead(s.id, 'director');
                  }}
                  className={`w-full p-3 flex items-center space-x-3 text-left transition cursor-pointer ${
                    chatStaffId === s.id ? 'bg-emerald-500/10 border-l-4 border-emerald-500' : 'hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#001E4D] to-slate-800 shrink-0 flex items-center justify-center overflow-hidden">
                      {s.avatar ? (
                        <img
                          src={s.avatar}
                          alt={s.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <User className="w-4 h-4 text-[#00DD9E]" />
                      )}
                    </div>
                  <div className="flex-1 min-w-0">
                    <h6 className="text-xs font-black text-slate-900 dark:text-white truncate">{s.name}</h6>
                    <p className="text-[11px] text-slate-500 truncate">{s.programName || s.role}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Conversación */}
          <div className="flex-1 flex flex-col justify-between bg-white dark:bg-transparent">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  Chat con {activeChatStaff?.name || 'Locutor'}
                </span>
              </div>
              <span className="text-[11px] text-slate-500">{activeChatStaff?.programName}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeChatMessages.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No hay mensajes intercambiados aún con este locutor.
                </div>
              ) : (
                activeChatMessages.map(msg => {
                  const isMe = msg.sender === 'director';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`max-w-[75%] p-3 rounded-2xl text-xs ${
                        isMe
                          ? 'bg-[#001E4D] text-[#00DD9E] rounded-br-none shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-none'
                      }`}>
                        <p>{msg.text}</p>
                      </div>
                      <span className="text-[11px] text-slate-400 mt-1 px-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={chatBottomRef} />
            </div>

            <form onSubmit={handleSendDirectorMessage} className="p-3 border-t border-slate-200 dark:border-white/10 flex items-center space-x-2">
              <input
                type="text"
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                placeholder={`Escribe un mensaje para ${activeChatStaff?.name || 'el locutor'}...`}
                className="flex-1 px-4 py-2 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#00DD9E]"
              />
              <button
                type="submit"
                className="p-2 rounded-2xl bg-[#001E4D] text-[#00DD9E] hover:brightness-110 transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

</div>
  );
}
