import React, { useState, useEffect, useRef } from 'react';
import {
  User, 
  X, 
  Mic, 
  DollarSign, 
  Users, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Archive, 
  Radio, 
  Megaphone, 
  MessageSquare, 
  Send, 
  Calculator, 
  Copy, 
  Check, 
  FileText, 
  Sparkles, 
  LogOut, 
  ArrowRight, 
  Phone, 
  Building2, 
  Tag, 
  Eye,
  EyeOff,
  RotateCcw,
  Receipt,
  CreditCard,
  TrendingUp,
  Award,
  Landmark,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  Menu,
  Sun,
  Moon,
  ListOrdered,
  Volume2
} from 'lucide-react';
import Emoji3D from '../Emoji3D';
import SystemInstallButton from '../SystemInstallButton';
import AvatarWithFallback from '../AvatarWithFallback';
import AnimatedBackground from '../AnimatedBackground';
import { useTheme } from '../../context/ThemeContext';
import { 
  getActiveStaffSession, 
  clearStaffSession, 
  loginStaff, 
  getAllStaffUsers,
  getTasksByStaffId,
  updateStaffTaskStatus,
  getInterviewsByStaffId,
  saveStaffInterview,
  deleteStaffInterview,
  getNotesByStaffId,
  saveStaffNote,
  updateStaffNoteStatus,
  reorderStaffNote,
  trashStaffNote,
  restoreStaffNote,
  deleteStaffNote,
  getStaffMessages,
  sendStaffMessage,
  markStaffMessagesAsRead,
  getStaffSalesMetrics
} from '../../services/staffPortalService';
import { getAllSchedule } from '../../services/scheduleData';
import { 
  getAllClients, 
  saveClient, 
  archiveClient, 
  unarchiveClient, 
  deleteClientPermanently, 
  getAllGenres, 
  recordClientPayment,
  getAllPayments,
  getAllBankProfiles,
  saveBankProfile,
  deleteBankProfile,
  getDefaultClientServices
} from '../../services/radioClientsService';
import { 
  getCachedBcvRates, 
  fetchLiveBcvRates, 
  convertCurrencyToBs 
} from '../../services/bcvService';

export default function StaffPortalModal({ isOpen, onClose, isStandalonePage = false }) {
  // Manejo de Tema Claro / Oscuro
  let theme = 'dark';
  let toggleTheme = () => {};
  try {
    const themeContext = useTheme();
    theme = themeContext.theme;
    toggleTheme = themeContext.toggleTheme;
  } catch (e) {
    // Si no está dentro de ThemeProvider
  }

  const [currentStaff, setCurrentStaff] = useState(() => getActiveStaffSession());
  const [activeTab, setActiveTab] = useState('clientes'); // 'clientes' | 'tareas' | 'entrevistas' | 'notas' | 'chat'

  // Formulario de Login
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Tasas oficiales BCV
  const [bcvRates, setBcvRates] = useState(() => getCachedBcvRates());
  const [calcAmount, setCalcAmount] = useState('50');
  const [calcCurrency, setCalcCurrency] = useState('USD');
  const [calcCopied, setCalcCopied] = useState(false);

  // Datos locales del locutor
  const [clients, setClients] = useState(() => getAllClients());
  const [genres, setGenres] = useState(() => getAllGenres());
  const [bankProfiles, setBankProfiles] = useState(() => getAllBankProfiles());
  const [isBankManagerOpen, setIsBankManagerOpen] = useState(false);
  const [editingBankId, setEditingBankId] = useState('');
  const [staffBankForm, setStaffBankForm] = useState({
    label: '',
    bankName: '',
    accountNumber: '',
    accountType: 'Pago Móvil / Corriente',
    phone: '',
    cedulaRif: '',
    holderName: ''
  });
  const [tasks, setTasks] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [notes, setNotes] = useState([]);
  const [messages, setMessages] = useState([]);

  // Filtros de clientes
  const [clientSearch, setClientSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('all'); // 'all' | 'paid' | 'pending' | 'overdue' | 'archived'

  // Modales de Clientes
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [clientForm, setClientForm] = useState({
    businessName: '',
    businessRif: '',
    ownerName: '',
    ownerCedula: '',
    ownerPhone: '',
    address: '',
    adminContactName: '',
    adminContactPhone: '',
    genreId: 'gen_restaurantes',
    packageType: ['en_vivo'],
    amountUsd: 50,
    paymentFrequency: 'mensual',
    billingDay: 15,
    notes: ''
  });

  // Modal Botón de Cobro (Ingreso recibido de cliente)
  const [isCobroModalOpen, setIsCobroModalOpen] = useState(false);
  const [cobroTargetClient, setCobroTargetClient] = useState(null);
  const [cobroForm, setCobroForm] = useState({
    amountUsd: '',
    amountBs: '',
    paymentMethod: 'pago_movil_bcv',
    bankProfileId: getAllBankProfiles()[0]?.id || '',
    reference: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Modal Botón de Pago (Egreso, anticipo, liquidación a emisora)
  const [isPagoModalOpen, setIsPagoModalOpen] = useState(false);
  const [pagoForm, setPagoForm] = useState({
    concept: 'Comisión de ventas por pauta publicitaria',
    clientId: '',
    amountUsd: '',
    amountBs: '',
    paymentMethod: 'pago_movil_bcv',
    bankProfileId: getAllBankProfiles()[0]?.id || '',
    reference: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Modal Entrevista
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    intervieweeName: '',
    intervieweeRoleOrg: '',
    topic: '',
    programName: '',
    date: new Date().toISOString().split('T')[0],
    time: '08:00 AM',
    audioUrl: '',
    observations: ''
  });

  // Modal Notas / Esquema Diario del Programa
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteStatusFilter, setNoteStatusFilter] = useState('queued'); // 'queued' | 'spoken' | 'draft' | 'trashed' | 'all'
  const [selectedProgramDay, setSelectedProgramDay] = useState('Todos');
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    programDate: new Date().toISOString().split('T')[0],
    dayOfWeek: 'Lunes',
    segmentTime: '07:00 AM',
    sortOrder: 1,
    status: 'queued'
  });

  // Chat con Dirección
  const [chatMessage, setChatMessage] = useState('');
  const chatMessagesEndRef = useRef(null);

  // Escuchar sesión y actualizaciones
  useEffect(() => {
    const handleUpdate = () => {
      const session = getActiveStaffSession();
      setCurrentStaff(session);
      if (session) {
        setClients(getAllClients());
        setTasks(getTasksByStaffId(session.id));
        setInterviews(getInterviewsByStaffId(session.id));
        setNotes(getNotesByStaffId(session.id));
        setMessages(getStaffMessages(session.id));
      }
    };

    window.addEventListener('neblina_staff_updated', handleUpdate);
    window.addEventListener('neblina_clients_updated', handleUpdate);
    return () => {
      window.removeEventListener('neblina_staff_updated', handleUpdate);
      window.removeEventListener('neblina_clients_updated', handleUpdate);
    };
  }, []);

  // Cargar datos al cambiar de locutor logueado
  useEffect(() => {
    if (currentStaff) {
      setClients(getAllClients());
      setTasks(getTasksByStaffId(currentStaff.id));
      setInterviews(getInterviewsByStaffId(currentStaff.id));
      setNotes(getNotesByStaffId(currentStaff.id));
      setMessages(getStaffMessages(currentStaff.id));
      markStaffMessagesAsRead(currentStaff.id, 'staff');
    }
  }, [currentStaff]);

  // Actualizar tasas BCV
  useEffect(() => {
    fetchLiveBcvRates().then(rates => setBcvRates(rates)).catch(() => {});
  }, []);

  // Scroll chat
  useEffect(() => {
    if (activeTab === 'chat') {
      chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  if (!isOpen) return null;

  // Manejo de Login
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    const result = loginStaff(loginUsername, loginPassword);
    setLoginLoading(false);

    if (result.success) {
      setCurrentStaff(result.staff);
      setLoginUsername('');
      setLoginPassword('');
    } else {
      setLoginError(result.error);
    }
  };

  const handleQuickDemoLogin = (user, pass) => {
    setLoginUsername(user);
    setLoginPassword(pass);
    const result = loginStaff(user, pass);
    if (result.success) {
      setCurrentStaff(result.staff);
    } else {
      setLoginError(result.error);
    }
  };

  const handleLogout = () => {
    clearStaffSession();
    setCurrentStaff(null);
  };

  // Métricas de ventas y comisiones del locutor logueado
  const staffMetrics = currentStaff 
    ? getStaffSalesMetrics(currentStaff.id, clients, getAllPayments(), bcvRates.usd)
    : null;

  // Filtrado de clientes correspondientes a este locutor
  const myClients = clients.filter(c => !c.trashed && String(c.locutorId) === String(currentStaff?.id));
  const filteredMyClients = myClients.filter(c => {
    const matchesSearch = 
      c.businessName?.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.ownerName?.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.businessRif?.toLowerCase().includes(clientSearch.toLowerCase());

    if (!matchesSearch) return false;
    if (clientFilter === 'archived') return Boolean(c.archived);
    if (c.archived) return false; // si está archivado y no estamos en la pestaña archivados, ocultar
    if (clientFilter === 'all') return true;
    return c.paymentStatus === clientFilter;
  });

  // Calculadora BCV
  const calcRate = calcCurrency === 'EUR' ? bcvRates.eur : bcvRates.usd;
  const calcResultBs = (parseFloat(calcAmount) || 0) * (calcRate || 1);

  const handleCopyCalc = () => {
    navigator.clipboard.writeText(`${calcResultBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.`);
    setCalcCopied(true);
    setTimeout(() => setCalcCopied(false), 2000);
  };

  // Guardar Cliente (Crear / Editar)
  const handleSaveClientSubmit = (e) => {
    e.preventDefault();
    if (!clientForm.businessName.trim()) {
      alert('Por favor ingrese el nombre comercial del negocio.');
      return;
    }

    const payload = {
      ...clientForm,
      id: editingClient?.id || undefined,
      locutorId: currentStaff.id,
      locutorName: currentStaff.name,
      amountUsd: Number(clientForm.amountUsd) || 0,
      billingDay: Number(clientForm.billingDay) || 15,
      services: getDefaultClientServices(clientForm.packageType || ['en_vivo'])
    };

    saveClient(payload);
    setClients(getAllClients());
    setIsClientModalOpen(false);
    setEditingClient(null);
  };

  const openNewClientModal = () => {
    setEditingClient(null);
    setClientForm({
      businessName: '',
      businessRif: '',
      ownerName: '',
      ownerCedula: '',
      ownerPhone: '',
      address: '',
      adminContactName: '',
      adminContactPhone: '',
      genreId: 'gen_restaurantes',
      packageType: ['en_vivo'],
      amountUsd: 50,
      paymentFrequency: 'mensual',
      billingDay: 15,
      notes: ''
    });
    setIsClientModalOpen(true);
  };

  const openEditClientModal = (client) => {
    setEditingClient(client);
    setClientForm({
      businessName: client.businessName || '',
      businessRif: client.businessRif || '',
      ownerName: client.ownerName || '',
      ownerCedula: client.ownerCedula || '',
      ownerPhone: client.ownerPhone || '',
      address: client.address || '',
      adminContactName: client.adminContactName || '',
      adminContactPhone: client.adminContactPhone || '',
      genreId: client.genreId || 'gen_restaurantes',
      packageType: client.packageType || ['en_vivo'],
      amountUsd: client.amountUsd || 50,
      paymentFrequency: client.paymentFrequency || 'mensual',
      billingDay: client.billingDay || 15,
      notes: client.notes || ''
    });
    setIsClientModalOpen(true);
  };

  const handleArchiveToggle = (client) => {
    if (client.archived) {
      unarchiveClient(client.id);
    } else {
      if (confirm(`¿Deseas archivar el cliente "${client.businessName}"? Podrás consultarlo en la pestaña de Archivados.`)) {
        archiveClient(client.id);
      }
    }
    setClients(getAllClients());
  };

  const handleDeleteClient = (client) => {
    if (confirm(`¿Estás seguro de eliminar permanentemente a "${client.businessName}"? Esta acción no se puede deshacer.`)) {
      deleteClientPermanently(client.id);
      setClients(getAllClients());
    }
  };

  // Abrir Botón de Cobro
  const openCobroModal = (client) => {
    setCobroTargetClient(client);
    const amountUsd = client.amountUsd || 50;
    const amountBs = (amountUsd * (bcvRates.usd || 884.75)).toFixed(2);
    const staffBanks = getAllBankProfiles(currentStaff?.id);
    setBankProfiles(staffBanks);
    setCobroForm({
      amountUsd: String(amountUsd),
      amountBs: String(amountBs),
      paymentMethod: 'pago_movil_bcv',
      bankProfileId: staffBanks[0]?.id || '',
      reference: '',
      notes: `Cobro pauta publicitaria en ${currentStaff.programName || 'emisora'}`,
      date: new Date().toISOString().split('T')[0]
    });
    setIsCobroModalOpen(true);
  };

  const handleCobroSubmit = (e) => {
    e.preventDefault();
    if (!cobroTargetClient) return;

    const chosenBank = bankProfiles.find(b => b.id === cobroForm.bankProfileId) || null;

    recordClientPayment({
      clientId: cobroTargetClient.id,
      clientName: cobroTargetClient.ownerName,
      businessName: cobroTargetClient.businessName,
      amountUsd: Number(cobroForm.amountUsd) || 0,
      amountBs: Number(cobroForm.amountBs) || 0,
      rateBcv: bcvRates.usd || 884.75,
      paymentMethod: cobroForm.paymentMethod,
      bankProfileId: cobroForm.bankProfileId || '',
      paymentDetails: chosenBank,
      reference: cobroForm.reference,
      notes: cobroForm.notes,
      date: cobroForm.date,
      locutorId: currentStaff.id,
      locutorName: currentStaff.name,
      paymentType: 'cobro'
    });

    setClients(getAllClients());
    setIsCobroModalOpen(false);
    setCobroTargetClient(null);
  };

  // Abrir Botón de Pago
  const openPagoModal = (client = null) => {
    const amountUsd = client ? client.amountUsd : '30';
    const amountBs = (Number(amountUsd) * (bcvRates.usd || 884.75)).toFixed(2);
    const staffBanks = getAllBankProfiles(currentStaff?.id);
    setBankProfiles(staffBanks);
    setPagoForm({
      concept: client ? `Liquidación de comisión por ${client.businessName}` : 'Liquidación / Pago comercial de pauta',
      clientId: client ? client.id : '',
      amountUsd: String(amountUsd),
      amountBs: String(amountBs),
      paymentMethod: 'pago_movil_bcv',
      bankProfileId: staffBanks[0]?.id || '',
      reference: '',
      notes: '',
      date: new Date().toISOString().split('T')[0]
    });
    setIsPagoModalOpen(true);
  };

  const handlePagoSubmit = (e) => {
    e.preventDefault();
    const chosenBank = bankProfiles.find(b => b.id === pagoForm.bankProfileId) || null;
    recordClientPayment({
      clientId: pagoForm.clientId || undefined,
      clientName: currentStaff.name,
      businessName: pagoForm.concept,
      amountUsd: Number(pagoForm.amountUsd) || 0,
      amountBs: Number(pagoForm.amountBs) || 0,
      rateBcv: bcvRates.usd || 884.75,
      paymentMethod: pagoForm.paymentMethod,
      bankProfileId: pagoForm.bankProfileId || '',
      paymentDetails: chosenBank,
      reference: pagoForm.reference,
      notes: pagoForm.notes,
      date: pagoForm.date,
      locutorId: currentStaff.id,
      locutorName: currentStaff.name,
      paymentType: 'pago'
    });

    setIsPagoModalOpen(false);
  };

  // Guardar Perfil Bancario del Locutor
  const handleSaveStaffBankProfile = (e) => {
    e.preventDefault();
    if (!staffBankForm.bankName.trim() || !staffBankForm.holderName.trim()) {
      alert('Por favor complete el Banco y el Titular.');
      return;
    }
    saveBankProfile({
      ...staffBankForm,
      id: editingBankId || undefined,
      ownerType: 'staff',
      staffId: currentStaff.id
    });
    setBankProfiles(getAllBankProfiles(currentStaff.id));
    setEditingBankId('');
    setStaffBankForm({
      label: '',
      bankName: '',
      accountNumber: '',
      accountType: 'Pago Móvil / Corriente',
      phone: '',
      cedulaRif: '',
      holderName: currentStaff.name || ''
    });
  };

  // Guardar Entrevista
  const handleSaveInterviewSubmit = (e) => {
    e.preventDefault();
    if (!interviewForm.intervieweeName.trim() || !interviewForm.topic.trim()) {
      alert('Por favor complete el nombre del entrevistado y el tema conversado.');
      return;
    }

    saveStaffInterview({
      ...interviewForm,
      staffId: currentStaff.id,
      staffName: currentStaff.name,
      programName: interviewForm.programName || currentStaff.programName || 'Programación General'
    });

    setInterviews(getInterviewsByStaffId(currentStaff.id));
    setIsInterviewModalOpen(false);
    setInterviewForm({
      intervieweeName: '',
      intervieweeRoleOrg: '',
      topic: '',
      programName: currentStaff.programName || '',
      date: new Date().toISOString().split('T')[0],
      time: '08:00 AM',
      audioUrl: '',
      observations: ''
    });
  };

  // Guardar Nota / Punto del Esquema del Programa
  const handleSaveNoteSubmit = (e) => {
    e.preventDefault();
    if (!noteForm.title.trim() && !noteForm.content.trim()) return;

    saveStaffNote({
      ...noteForm,
      id: editingNote?.id || undefined,
      staffId: currentStaff.id
    });

    setNotes(getNotesByStaffId(currentStaff.id));
    setIsNoteModalOpen(false);
    setEditingNote(null);
    setNoteForm({
      title: '',
      content: '',
      programDate: new Date().toISOString().split('T')[0],
      dayOfWeek: currentStaff.assignedDays?.[0] || 'Lunes',
      segmentTime: '07:00 AM',
      sortOrder: notes.filter(n => !n.trashed).length + 1,
      status: 'queued'
    });
  };

  // Enviar Mensaje a Dirección
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || !currentStaff) return;
    sendStaffMessage({
      staffId: currentStaff.id,
      sender: 'staff',
      text: chatMessage
    });
    setChatMessage('');
    setMessages(getStaffMessages(currentStaff.id));
  };

  const staffModules = [
    { id: 'clientes', label: 'Mis Clientes & Cobranzas', emoji: 'handshake', icon: Building2, count: myClients.length },
    { id: 'tareas', label: 'Tareas & Pautas Asignadas', emoji: 'megaphone', icon: Megaphone, alertCount: tasks.filter(t => t.status === 'pendiente').length, count: tasks.length },
    { id: 'entrevistas', label: 'Registro de Entrevistas', emoji: 'microphone', icon: Mic, count: interviews.length },
    { id: 'notas', label: 'Notas & Esquema del Programa', emoji: 'memo', icon: FileText, count: notes.filter(n => !n.trashed).length },
    { id: 'chat', label: 'Chat con Dirección', emoji: 'speech_balloon', icon: MessageSquare, alertCount: messages.filter(m => m.sender === 'director' && !m.read).length, count: messages.length },
  ];

  return (
    <div 
      className={
        isStandalonePage
          ? "min-h-screen w-full bg-transparent text-slate-900 dark:text-white flex flex-col font-sans transition-colors duration-300 selection:bg-[#00DD9E] selection:text-[#001E4D] relative overflow-x-hidden"
          : "fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-md animate-fadeIn"
      }
      role="main"
    >
      {/* Fondo Animado de Aros Oficial en Modo Standalone */}
      {isStandalonePage && <AnimatedBackground />}

      <div 
        className={
          isStandalonePage
            ? "relative z-10 w-full min-h-screen flex flex-col flex-1"
            : "relative z-10 w-full max-w-6xl max-h-[94vh] bg-white/90 dark:bg-[#141b24]/90 backdrop-blur-2xl border border-white/60 dark:border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-lg transition-colors duration-300"
        }
      >
        {/* CABECERA PRINCIPAL SUPERIOR (DESKTOP & MOBILE) */}
        {/* CABECERA SUPERIOR (Solo visible en pantalla de login si no está autenticado) */}
        {!currentStaff && (
          <header className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5 border-b border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c141f]/80 backdrop-blur-2xl">
          <div className="flex items-center space-x-3">
            {/* Botón Menú Móvil */}
            {currentStaff && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
                aria-label="Abrir menú de navegación"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <AvatarWithFallback
              src={currentStaff?.avatar}
              alt={currentStaff?.name || 'Locutor'}
              containerClassName="w-10 h-10 rounded-2xl bg-[#001E4D] border-2 border-[#00DD9E] p-0.5 shadow-none flex items-center justify-center overflow-hidden shrink-0"
              iconClassName="w-5 h-5 text-[#00DD9E]"
            />

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-md">
                  {currentStaff ? currentStaff.name : 'Portal de Locutores & Ventas'}
                </h1>
                <span className="hidden sm:inline-block text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
                  105.5 FM
                </span>
                {currentStaff?.showName && (
                  <span className="hidden md:inline-block text-[11px] font-bold px-2 py-0.5 rounded-lg bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                    {currentStaff.showName}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[280px] sm:max-w-md">
                Gestión de Clientes, Cobranzas, Pautas Radiales, Entrevistas & Guion
              </p>
            </div>
          </div>

          {/* Acciones de la Cabecera Superior: solo cerrar en modal */}
          <div className="flex items-center space-x-2">
            {!isStandalonePage && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-slate-700 dark:text-white flex items-center justify-center transition cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </header>
        )}

        {/* =========================================================================
            PANTALLA DE LOGIN SI NO ESTÁ AUTENTICADO
        ========================================================================= */}
        {!currentStaff ? (
          <div className="flex-1 overflow-y-auto p-6 sm:p-12 flex flex-col items-center justify-center text-center my-auto">
            <div className="panel-aeroglass max-w-md w-full p-6 sm:p-8 rounded-2xl border border-white/70 dark:border-white/15 shadow-lg space-y-6 my-auto text-center">
              
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#001E4D] to-emerald-600 p-1 mx-auto shadow-lg flex items-center justify-center border border-[#00DD9E]/30">
                <div className="w-full h-full bg-[#001438] rounded-xl flex items-center justify-center">
                  <Mic className="w-8 h-8 text-[#00DD9E]" />
                </div>
              </div>

              <div>
                <h4 className="font-display font-black text-xl text-slate-900 dark:text-white">
                  Acceso para Locutores & Ventas
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Ingrese las credenciales privadas asignadas para gestionar su cartera comercial, cobranzas, pautas al aire, entrevistas y notas de cabina.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Usuario
                  </label>
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => { setLoginUsername(e.target.value); setLoginError(''); }}
                    required
                    placeholder="Usuario asignado..."
                    autoFocus
                    className="w-full text-sm font-semibold px-4 py-2.5 rounded-2xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00DD9E]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Contraseña
                  </label>
                  <div className="input-password-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => { setLoginPassword(e.target.value); setLoginError(''); }}
                      required
                      placeholder="Contraseña..."
                      className="w-full text-sm font-semibold px-4 py-2.5 pr-11 rounded-2xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00DD9E]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="input-password-toggle-btn text-slate-400 hover:text-slate-600 dark:hover:text-white"
                      aria-label="Ver u ocultar contraseña"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {loginError && (
                    <p className="text-xs text-rose-500 font-semibold mt-2 flex items-center space-x-1.5">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{loginError}</span>
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-[#00DD9E] hover:opacity-95 text-slate-950 font-black text-sm transition -emerald-500/20 cursor-pointer disabled:opacity-50"
                >
                  {loginLoading ? 'Verificando...' : 'Entrar a mi Portal'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* PANTALLA 2: DASHBOARD INTEGRAL AUTENTICADO */
          /* ============================================================== */
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-[calc(100vh-65px)]">

            {/* SIDEBAR FIJO PARA MONITORES Y COMPUTADORA (LG+) */}
            <aside className="hidden lg:flex w-72 bg-white/80 dark:bg-[#0c141f]/90 backdrop-blur-xl border-r border-slate-200 dark:border-white/10 flex-col justify-between p-4 shrink-0 overflow-y-auto">
              <div className="space-y-4">
                {/* Cabecera del Sidebar: Perfil Oficial del Locutor */}
                <div className="p-3.5 rounded-2xl bg-slate-100/90 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 space-y-3">
                  <div className="flex items-center space-x-3">
                    <AvatarWithFallback
                      src={currentStaff?.avatar}
                      alt={currentStaff?.name || 'Locutor'}
                      containerClassName="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#001E4D] to-slate-800 border-2 border-[#00DD9E] shrink-0 flex items-center justify-center overflow-hidden"
                      iconClassName="w-6 h-6 text-[#00DD9E]"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display font-black text-xs text-slate-900 dark:text-white truncate" title={currentStaff?.name}>
                        {currentStaff?.name}
                      </h3>
                      <div className="flex items-center space-x-1.5 mt-0.5 flex-wrap">
                        <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-700 dark:text-[#00DD9E]">
                          {currentStaff?.role || 'Locutor'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">
                          {currentStaff?.commissionRate}% com.
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-white/80 dark:bg-black/30 border border-slate-200/60 dark:border-white/10 text-[11px] leading-tight">
                    <p className="font-bold text-emerald-700 dark:text-[#00DD9E] flex items-center space-x-1">
                      <Radio className="w-3 h-3 shrink-0" />
                      <span className="truncate">{currentStaff?.programName}</span>
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {currentStaff?.programSchedule}
                    </p>
                  </div>
                </div>

                <div className="px-3 py-1 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Módulos de Cabina & Ventas
                </div>
                <nav className="space-y-1">
                  {staffModules.map((mod) => {
                    const Icon = mod.icon;
                    const isActive = activeTab === mod.id;
                    return (
                      <button
                        key={mod.id}
                        onClick={() => {
                          setActiveTab(mod.id);
                          if (mod.id === 'chat' && currentStaff?.id) {
                            markStaffMessagesAsRead(currentStaff.id, 'staff');
                            setMessages(getStaffMessages(currentStaff.id));
                          }
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                          isActive
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md scale-[1.02]'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          {mod.emoji ? (
                            <Emoji3D name={mod.emoji} className="w-4 h-4 shrink-0 drop-shadow-xs" />
                          ) : (
                            <Icon className={`w-4 h-4 ${isActive ? 'text-[#00DD9E] dark:text-[#008f7a]' : 'text-slate-400'}`} />
                          )}
                          <span>{mod.label}</span>
                        </div>
                        {mod.alertCount > 0 ? (
                          <span className="text-[11px] font-black px-1.5 py-0.2 rounded-lg bg-amber-500 text-slate-950">
                            {mod.alertCount}
                          </span>
                        ) : mod.count !== undefined ? (
                          <span className={`text-[11px] px-1.5 py-0.2 rounded-lg font-bold ${
                            isActive ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900' : 'bg-slate-200 dark:bg-white/10 text-slate-500'
                          }`}>
                            {mod.count}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Pie del Sidebar Desktop: Acciones de Utilidad */}
              <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-2.5">
                {/* 1. Botón Superior: Cerrar Sesión */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl border border-rose-300/40 bg-rose-500/10 hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white font-bold text-xs transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>

                {/* 2. Botones de la Mitad: Instalar App y Cambiar Tema */}
                <div className="grid grid-cols-2 gap-2">
                  <SystemInstallButton appName="Portal Locutores" className="w-full justify-center" />
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/15 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-bold transition cursor-pointer"
                    title={`Cambiar a tema ${theme === 'dark' ? 'claro' : 'oscuro'}`}
                  >
                    {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
                    <span>{theme === 'dark' ? 'Claro' : 'Oscuro'}</span>
                  </button>
                </div>

                {/* 3. Botón Inferior: Volver a la Web */}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Volver a la Web</span>
                </button>
              </div>
            </aside>

            {/* DRAWER FLOTANTE PARA DISPOSITIVOS MÓVILES */}
            {mobileMenuOpen && (
              <div className="lg:hidden fixed inset-0 z-50 flex">
                <div 
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                  onClick={() => setMobileMenuOpen(false)}
                />
                <div className="relative w-80 max-w-[85vw] bg-white dark:bg-[#0c141f] h-full shadow-2xl flex flex-col justify-between p-5 z-10 animate-fadeIn overflow-y-auto">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                      <div className="flex items-center space-x-2">
                        <Mic className="w-4 h-4 text-[#00DD9E]" />
                        <span className="font-display font-black text-sm text-slate-900 dark:text-white">Menú de Cabina</span>
                      </div>
                      <button 
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Tarjeta del Locutor en Mobile Drawer */}
                    <div className="p-3 rounded-2xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 space-y-2">
                      <div className="flex items-center space-x-2.5">
                        <AvatarWithFallback
                          src={currentStaff?.avatar}
                          alt={currentStaff?.name || 'Locutor'}
                          containerClassName="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#001E4D] to-slate-800 border border-[#00DD9E] shrink-0 flex items-center justify-center overflow-hidden"
                          iconClassName="w-5 h-5 text-[#00DD9E]"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-display font-black text-xs text-slate-900 dark:text-white truncate">
                            {currentStaff?.name}
                          </h4>
                          <p className="text-[10px] text-emerald-600 dark:text-[#00DD9E] font-bold truncate">
                            {currentStaff?.role} · {currentStaff?.programName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-200/60 dark:border-white/10">
                        <SystemInstallButton appName="Portal Locutores" />
                        <button
                          onClick={handleLogout}
                          className="px-2.5 py-1.5 rounded-lg border border-rose-300/40 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center space-x-1"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Salir</span>
                        </button>
                      </div>
                    </div>

                    <nav className="space-y-1">
                      {staffModules.map((mod) => {
                        const Icon = mod.icon;
                        const isActive = activeTab === mod.id;
                        return (
                          <button
                            key={mod.id}
                            onClick={() => {
                              setActiveTab(mod.id);
                              setMobileMenuOpen(false);
                              if (mod.id === 'chat' && currentStaff?.id) {
                                markStaffMessagesAsRead(currentStaff.id, 'staff');
                                setMessages(getStaffMessages(currentStaff.id));
                              }
                            }}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                              isActive
                                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5">
                              {mod.emoji ? (
                                <Emoji3D name={mod.emoji} className="w-4 h-4 shrink-0 drop-shadow-xs" />
                              ) : (
                                <Icon className="w-4 h-4" />
                              )}
                              <span>{mod.label}</span>
                            </div>
                            {mod.alertCount > 0 ? (
                              <span className="text-[11px] font-black px-1.5 py-0.2 rounded-lg bg-amber-500 text-slate-950">
                                {mod.alertCount}
                              </span>
                            ) : mod.count !== undefined ? (
                              <span className="text-[11px] px-1.5 py-0.2 rounded-lg font-bold bg-slate-200 dark:bg-white/10">
                                {mod.count}
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </nav>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-2">
                    <button
                      onClick={onClose}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Volver a la Web</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ÁREA DE TRABAJO PRINCIPAL (WORKSPACE) */}
            <div className="flex-1 flex flex-col overflow-y-auto">
              {/* Barra de Tabs Móvil (Pills estilo Apple) */}
              <div className="lg:hidden flex items-center space-x-1.5 px-3 py-2 overflow-x-auto scrollbar-none border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#0c141f]/80 backdrop-blur-xl shrink-0">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="p-1.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10 shrink-0 flex items-center space-x-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold"
                  title="Abrir Menú"
                >
                  <Menu className="w-4 h-4" />
                  <span>Menú</span>
                </button>
                {staffModules.map((mod) => {
                  const Icon = mod.icon;
                  const isActive = activeTab === mod.id;
                  return (
                    <button
                      key={mod.id}
                      onClick={() => {
                        setActiveTab(mod.id);
                        if (mod.id === 'chat' && currentStaff?.id) {
                          markStaffMessagesAsRead(currentStaff.id, 'staff');
                          setMessages(getStaffMessages(currentStaff.id));
                        }
                      }}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition cursor-pointer ${
                        isActive
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                          : 'bg-white/80 dark:bg-[#111923] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10'
                      }`}
                    >
                      {mod.emoji ? (
                        <Emoji3D name={mod.emoji} className="w-3.5 h-3.5 shrink-0 drop-shadow-xs" />
                      ) : (
                        <Icon className="w-3.5 h-3.5" />
                      )}
                      <span>{mod.label}</span>
                      {mod.alertCount > 0 && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Contenedor del Espacio de Trabajo */}
              <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
            
            {/* =====================================================================
                PESTAÑA 1: CLIENTES & COBRANZAS (BOTÓN DE COBRO Y BOTÓN DE PAGO)
            ===================================================================== */}
            {activeTab === 'clientes' && (
              <div className="space-y-4">
                {/* Métricas Resumidas del Locutor con Alto Contraste */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center animate-fadeIn">
                  <div className="p-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 shadow-xs">
                    <span className="flex items-center justify-center space-x-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <Users className="w-3.5 h-3.5 text-[#00DD9E]" />
                      <span>Mis Clientes</span>
                    </span>
                    <span className="text-lg font-black text-slate-900 dark:text-white block mt-0.5">{staffMetrics?.activeClientsCount || 0}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 shadow-xs">
                    <span className="flex items-center justify-center space-x-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Total Pautas</span>
                    </span>
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 block mt-0.5">${staffMetrics?.totalBilledUsd || 0}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 shadow-xs">
                    <span className="flex items-center justify-center space-x-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-300" />
                      <span>Cobrado</span>
                    </span>
                    <span className="text-lg font-black text-teal-600 dark:text-teal-300 block mt-0.5">${staffMetrics?.totalCollectedUsd || 0}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 shadow-xs">
                    <span className="flex items-center justify-center space-x-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-300" />
                      <span>Pendiente</span>
                    </span>
                    <span className="text-lg font-black text-amber-600 dark:text-amber-300 block mt-0.5">${staffMetrics?.totalPendingUsd || 0}</span>
                  </div>
                </div>

                {/* Banner Oficial de Cobranzas con Tasas BCV y Calculadora Rápida */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-slate-100/90 to-sky-500/10 dark:from-emerald-500/10 dark:via-white/5 dark:to-sky-500/10 border border-emerald-500/30 shadow-xs">
                  <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                    
                    {/* Cintillo Tasas BCV */}
                    <div className="flex-1 flex flex-wrap items-center gap-2.5">
                      <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-[#00DD9E]">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-wider">Tasas Oficiales BCV</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">USD $:</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
                          {(bcvRates.usd || 884.75).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs.
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">EUR €:</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
                          {(bcvRates.eur || 993.21).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs.
                        </span>
                      </div>

                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 hidden sm:inline">
                        • Fecha: {bcvRates.fechaValor || 'Hoy'}
                      </span>
                    </div>

                    {/* Calculadora Cambiaria Rápida */}
                    <div className="flex items-center space-x-2 bg-white dark:bg-[#001438] p-1.5 rounded-2xl border border-slate-200 dark:border-white/15 shadow-xs">
                      <div className="flex items-center space-x-1 pl-2">
                        <Calculator className="w-4 h-4 text-emerald-600 dark:text-[#00DD9E]" />
                        <select
                          value={calcCurrency}
                          onChange={(e) => setCalcCurrency(e.target.value)}
                          className="text-xs font-black bg-transparent text-slate-800 dark:text-white focus:outline-none cursor-pointer"
                        >
                          <option value="USD">USD $</option>
                          <option value="EUR">EUR €</option>
                        </select>
                      </div>

                      <input
                        type="number"
                        value={calcAmount}
                        onChange={(e) => setCalcAmount(e.target.value)}
                        className="w-20 px-2 py-1 text-xs font-bold rounded-xl bg-slate-100 dark:bg-black/40 text-slate-900 dark:text-white text-right focus:outline-none focus:ring-1 focus:ring-[#00DD9E]"
                        placeholder="Monto"
                      />

                      <div className="px-2 py-1 text-xs font-mono font-black text-emerald-600 dark:text-[#00DD9E] whitespace-nowrap">
                        = {calcResultBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs.
                      </div>

                      <button
                        type="button"
                        onClick={handleCopyCalc}
                        className="p-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-[#00DD9E] transition cursor-pointer"
                        title="Copiar monto en Bs."
                      >
                        {calcCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                  </div>
                </div>

                
                {/* Barra de herramientas: Búsqueda, Filtros y Acciones */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex-1 flex items-center space-x-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
                      <input
                        type="text"
                        value={clientSearch}
                        onChange={(e) => setClientSearch(e.target.value)}
                        placeholder="Buscar entre mis clientes..."
                        className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00DD9E]"
                      />
                    </div>

                    <select
                      value={clientFilter}
                      onChange={(e) => setClientFilter(e.target.value)}
                      className="px-3 py-2 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                    >
                      <option value="all">Todos los Clientes</option>
                      <option value="paid">Al Día / Pagados</option>
                      <option value="pending">Pendientes</option>
                      <option value="overdue">Vencidos</option>
                      <option value="archived">Archivados</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        setBankProfiles(getAllBankProfiles(currentStaff?.id));
                        setStaffBankForm(prev => ({ ...prev, holderName: prev.holderName || currentStaff?.name || '' }));
                        setIsBankManagerOpen(!isBankManagerOpen);
                      }}
                      className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white text-xs font-bold shadow-xs transition cursor-pointer"
                      title="Configurar mis cuentas bancarias y Pago Móvil para cobros"
                    >
                      <Landmark className="w-3.5 h-3.5" />
                      <span>Cuentas & Pago Móvil</span>
                    </button>

                    {/* Botón de Pago General */}
                    <button
                      type="button"
                      onClick={() => openPagoModal()}
                      className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
                      title="Registrar un pago o liquidación comercial"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Botón de Pago</span>
                    </button>

                    {/* Botón Nuevo Cliente */}
                    <button
                      type="button"
                      onClick={openNewClientModal}
                      className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#001E4D] text-[#00DD9E] dark:bg-[#00DD9E] dark:text-[#001E4D] text-xs font-black hover:brightness-110 active:scale-[0.98] transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Nuevo Cliente</span>
                    </button>
                  </div>
                </div>

                {/* Sub-panel inline de Cuentas Bancarias del Locutor */}
                {isBankManagerOpen && (
                  <div className="p-4 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-emerald-500/30 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900 dark:text-white flex items-center space-x-1.5">
                        <Landmark className="w-4 h-4 text-emerald-500" />
                        <span>Perfiles de Cuentas Bancarias y Pago Móvil para Cobros</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsBankManagerOpen(false)}
                        className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold cursor-pointer"
                        aria-label="Cerrar gestor bancario"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveStaffBankProfile} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-white dark:bg-black/25 p-3 rounded-xl border border-slate-200 dark:border-white/10">
                      <input
                        type="text"
                        required
                        placeholder="Etiqueta (ej: Pago Móvil Personal)"
                        value={staffBankForm.label}
                        onChange={(e) => setStaffBankForm({ ...staffBankForm, label: e.target.value })}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Banco (ej: Banesco 0134)"
                        value={staffBankForm.bankName}
                        onChange={(e) => setStaffBankForm({ ...staffBankForm, bankName: e.target.value })}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="N° de Cuenta (Opcional)"
                        value={staffBankForm.accountNumber}
                        onChange={(e) => setStaffBankForm({ ...staffBankForm, accountNumber: e.target.value })}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-mono"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Teléfono Pago Móvil"
                        value={staffBankForm.phone}
                        onChange={(e) => setStaffBankForm({ ...staffBankForm, phone: e.target.value })}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-mono font-bold"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Cédula / RIF"
                        value={staffBankForm.cedulaRif}
                        onChange={(e) => setStaffBankForm({ ...staffBankForm, cedulaRif: e.target.value })}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-mono font-bold"
                      />
                      <div className="flex items-center space-x-1.5">
                        <input
                          type="text"
                          required
                          placeholder="Titular"
                          value={staffBankForm.holderName}
                          onChange={(e) => setStaffBankForm({ ...staffBankForm, holderName: e.target.value })}
                          className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                        />
                        <button
                          type="submit"
                          className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-black cursor-pointer whitespace-nowrap"
                        >
                          {editingBankId ? 'Guardar' : '+ Añadir'}
                        </button>
                      </div>
                    </form>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {getAllBankProfiles(currentStaff?.id).map(bp => (
                        <div key={bp.id} className="p-2.5 rounded-lg bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white truncate">{bp.label} — {bp.bankName}</p>
                            <p className="text-[11px] font-mono text-slate-500">Tel: {bp.phone} · CI/RIF: {bp.cedulaRif} · {bp.holderName}</p>
                          </div>
                          {bp.ownerType === 'staff' && (
                            <div className="flex items-center space-x-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingBankId(bp.id);
                                  setStaffBankForm({
                                    label: bp.label,
                                    bankName: bp.bankName,
                                    accountNumber: bp.accountNumber,
                                    accountType: bp.accountType,
                                    phone: bp.phone,
                                    cedulaRif: bp.cedulaRif,
                                    holderName: bp.holderName
                                  });
                                }}
                                className="p-1 text-slate-500 hover:text-emerald-500 cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  deleteBankProfile(bp.id);
                                  setBankProfiles(getAllBankProfiles(currentStaff?.id));
                                }}
                                className="p-1 text-rose-500 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SUB-PANEL INLINE: CREAR / EDITAR CLIENTE */}
                {isClientModalOpen && (
                  <div className="p-5 sm:p-6 rounded-2xl bg-slate-100 dark:bg-[#1c2633] border-2 border-emerald-500/30 shadow-xl space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        {editingClient ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsClientModalOpen(false)}
                        className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveClientSubmit} className="space-y-3 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre Comercial del Negocio *</label>
                        <input
                          type="text"
                          value={clientForm.businessName}
                          onChange={(e) => setClientForm({ ...clientForm, businessName: e.target.value })}
                          required
                          placeholder="Ej. Parrillera Andina"
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-medium"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">RIF del Comercio</label>
                          <input
                            type="text"
                            value={clientForm.businessRif}
                            onChange={(e) => setClientForm({ ...clientForm, businessRif: e.target.value })}
                            placeholder="J-12345678-9"
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-medium"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Rubro / Género</label>
                          <select
                            value={clientForm.genreId}
                            onChange={(e) => setClientForm({ ...clientForm, genreId: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-medium cursor-pointer"
                          >
                            {genres.map(g => (
                              <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre del Dueño / Contacto</label>
                          <input
                            type="text"
                            value={clientForm.ownerName}
                            onChange={(e) => setClientForm({ ...clientForm, ownerName: e.target.value })}
                            placeholder="Ej. Roberto Méndez"
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-medium"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Teléfono WhatsApp</label>
                          <input
                            type="text"
                            value={clientForm.ownerPhone}
                            onChange={(e) => setClientForm({ ...clientForm, ownerPhone: e.target.value })}
                            placeholder="+58 424-1234567"
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-medium"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Monto Pauta (USD $)</label>
                          <input
                            type="number"
                            value={clientForm.amountUsd}
                            onChange={(e) => setClientForm({ ...clientForm, amountUsd: e.target.value })}
                            placeholder="50"
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-bold"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Frecuencia</label>
                          <select
                            value={clientForm.paymentFrequency}
                            onChange={(e) => setClientForm({ ...clientForm, paymentFrequency: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-medium cursor-pointer"
                          >
                            <option value="mensual">Mensual</option>
                            <option value="quincenal">Quincenal</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Día de Cobro</label>
                          <input
                            type="number"
                            min="1"
                            max="31"
                            value={clientForm.billingDay}
                            onChange={(e) => setClientForm({ ...clientForm, billingDay: e.target.value })}
                            placeholder="15"
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Notas de Pauta / Acuerdos</label>
                        <textarea
                          value={clientForm.notes}
                          onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
                          rows={2}
                          placeholder="Detalles de menciones en vivo, horarios, etc."
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-medium"
                        />
                      </div>

                      <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200 dark:border-white/10">
                        <button
                          type="button"
                          onClick={() => setIsClientModalOpen(false)}
                          className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-200 dark:hover:bg-white/10 cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black cursor-pointer"
                        >
                          {editingClient ? 'Guardar Cambios' : 'Registrar Cliente'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* SUB-PANEL INLINE: BOTÓN DE COBRO */}
                {isCobroModalOpen && (
                  <div className="p-5 sm:p-6 rounded-2xl bg-slate-100 dark:bg-[#1c2633] border-2 border-emerald-500/40 shadow-xl space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-500">
                          <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-900 dark:text-white">Botón de Cobro — {cobroTargetClient?.businessName}</h3>
                          <p className="text-[11px] text-slate-500">Cálculo automático a la tasa oficial BCV del día de pago ({Number(bcvRates.usd).toFixed(2)} Bs/$)</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsCobroModalOpen(false)}
                        className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleCobroSubmit} className="space-y-3 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Monto en USD $</label>
                          <input
                            type="number"
                            step="0.01"
                            value={cobroForm.amountUsd}
                            onChange={(e) => {
                              const val = e.target.value;
                              const bs = (parseFloat(val) || 0) * (bcvRates.usd || 884.75);
                              setCobroForm({ ...cobroForm, amountUsd: val, amountBs: bs.toFixed(2) });
                            }}
                            required
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-black text-sm"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Equivalente en Bs (Tasa BCV del Día)</label>
                          <input
                            type="text"
                            value={cobroForm.amountBs}
                            onChange={(e) => setCobroForm({ ...cobroForm, amountBs: e.target.value })}
                            required
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-emerald-600 dark:text-[#00DD9E] font-black text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Método de Cobro</label>
                          <select
                            value={cobroForm.paymentMethod}
                            onChange={(e) => setCobroForm({ ...cobroForm, paymentMethod: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-medium cursor-pointer"
                          >
                            <option value="pago_movil_bcv">Pago Móvil (Tasa BCV)</option>
                            <option value="transferencia">Transferencia Bancaria</option>
                            <option value="efectivo_usd">Efectivo Divisas ($)</option>
                            <option value="efectivo_bs">Efectivo Bolívares (Bs)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Cuenta Bancaria Receptora</label>
                          <select
                            value={cobroForm.bankProfileId}
                            onChange={(e) => setCobroForm({ ...cobroForm, bankProfileId: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-bold cursor-pointer"
                          >
                            {bankProfiles.map(bp => (
                              <option key={bp.id} value={bp.id}>
                                {bp.label} ({bp.bankName})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-[11px] font-bold flex items-start space-x-1.5">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        <span>ALERTA IMPORTANTE: Verifique siempre los datos de pago antes de realizar su transferencia o Pago Móvil, ya que las cuentas receptoras pueden variar.</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Referencia Bancaria</label>
                          <input
                            type="text"
                            value={cobroForm.reference}
                            onChange={(e) => setCobroForm({ ...cobroForm, reference: e.target.value })}
                            placeholder="Últimos 4 o 6 dígitos"
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-medium"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Fecha</label>
                          <input
                            type="date"
                            value={cobroForm.date}
                            onChange={(e) => setCobroForm({ ...cobroForm, date: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Concepto / Observación</label>
                        <input
                          type="text"
                          value={cobroForm.notes}
                          onChange={(e) => setCobroForm({ ...cobroForm, notes: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-medium"
                        />
                      </div>

                      <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200 dark:border-white/10">
                        <button
                          type="button"
                          onClick={() => setIsCobroModalOpen(false)}
                          className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-200 dark:hover:bg-white/10 cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black cursor-pointer"
                        >
                          Confirmar Cobro
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* SUB-PANEL INLINE: BOTÓN DE PAGO */}
                {isPagoModalOpen && (
                  <div className="p-5 sm:p-6 rounded-2xl bg-slate-100 dark:bg-[#1c2633] border-2 border-blue-500/40 shadow-xl space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 rounded-xl bg-blue-500/20 text-blue-500">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-900 dark:text-white">Botón de Pago / Liquidación</h3>
                          <p className="text-[11px] text-slate-500">Registro de pago, liquidación o abono comercial</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsPagoModalOpen(false)}
                        className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handlePagoSubmit} className="space-y-3 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Concepto del Pago / Liquidación</label>
                        <input
                          type="text"
                          value={pagoForm.concept}
                          onChange={(e) => setPagoForm({ ...pagoForm, concept: e.target.value })}
                          required
                          placeholder="Ej. Liquidación de comisión comercial"
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-medium"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Monto en USD $</label>
                          <input
                            type="number"
                            step="0.01"
                            value={pagoForm.amountUsd}
                            onChange={(e) => {
                              const val = e.target.value;
                              const bs = (parseFloat(val) || 0) * (bcvRates.usd || 884.75);
                              setPagoForm({ ...pagoForm, amountUsd: val, amountBs: bs.toFixed(2) });
                            }}
                            required
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-black text-sm"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Monto en Bs (BCV)</label>
                          <input
                            type="text"
                            value={pagoForm.amountBs}
                            onChange={(e) => setPagoForm({ ...pagoForm, amountBs: e.target.value })}
                            required
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-blue-600 dark:text-blue-400 font-black text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Método</label>
                          <select
                            value={pagoForm.paymentMethod}
                            onChange={(e) => setPagoForm({ ...pagoForm, paymentMethod: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-medium cursor-pointer"
                          >
                            <option value="pago_movil_bcv">Pago Móvil</option>
                            <option value="transferencia">Transferencia</option>
                            <option value="efectivo_usd">Efectivo Divisas</option>
                            <option value="efectivo_bs">Efectivo Bolívares</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Referencia</label>
                          <input
                            type="text"
                            value={pagoForm.reference}
                            onChange={(e) => setPagoForm({ ...pagoForm, reference: e.target.value })}
                            placeholder="Ref. de pago"
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Observaciones</label>
                        <input
                          type="text"
                          value={pagoForm.notes}
                          onChange={(e) => setPagoForm({ ...pagoForm, notes: e.target.value })}
                          placeholder="Notas adicionales..."
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-medium"
                        />
                      </div>

                      <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200 dark:border-white/10">
                        <button
                          type="button"
                          onClick={() => setIsPagoModalOpen(false)}
                          className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-200 dark:hover:bg-white/10 cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black cursor-pointer"
                        >
                          Registrar Pago
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Tarjetas de Clientes del Locutor */}
                {filteredMyClients.length === 0 ? (
                  <div className="p-12 text-center rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5">
                    <Emoji3D name="radio" className="w-12 h-12 mx-auto mb-3" />
                    <h4 className="text-sm font-black text-slate-800 dark:text-white">No tienes clientes registrados en este filtro</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Registra los negocios que patrocinan tu programa para controlar tus cobranzas y ventas.
                    </p>
                    <button
                      type="button"
                      onClick={openNewClientModal}
                      className="mt-4 inline-flex items-center space-x-2 px-4 py-2 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xs cursor-pointer hover:bg-emerald-400"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Registrar Mi Primer Cliente</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMyClients.map(client => {
                      const amountUsd = Number(client.amountUsd) || 0;
                      const amountBs = amountUsd * (bcvRates.usd || 884.75);
                      const isPaid = client.paymentStatus === 'paid';
                      const isOverdue = client.paymentStatus === 'overdue';

                      return (
                        <div
                          key={client.id}
                          className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                        >
                          <div>
                            {/* Encabezado del Cliente */}
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                                  Día de cobro: {client.billingDay || 15}
                                </span>
                                <h4 className="text-sm font-black text-slate-900 dark:text-white mt-1 leading-snug">
                                  {client.businessName}
                                </h4>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                  RIF: {client.businessRif || 'N/A'} • {client.ownerName}
                                </p>
                              </div>

                              <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-lg border ${
                                isPaid
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-[#00DD9E] border-emerald-500/20'
                                  : isOverdue
                                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                              }`}>
                                {isPaid ? 'Al Día' : isOverdue ? 'Vencido' : 'Pendiente'}
                              </span>
                            </div>

                            {/* Contacto y Paquete */}
                            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 my-3">
                              <div className="flex items-center space-x-1.5">
                                <Phone className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                <span>{client.ownerPhone || 'Sin teléfono'}</span>
                              </div>
                              {client.notes && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 italic line-clamp-2">
                                  "{client.notes}"
                                </p>
                              )}
                            </div>

                            {/* Monto de la Pauta */}
                            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-between mb-3">
                              <div>
                                <span className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">Monto Pauta</span>
                                <span className="text-base font-black text-slate-900 dark:text-white">
                                  ${amountUsd} <span className="text-xs font-semibold text-slate-500">/{client.paymentFrequency || 'mes'}</span>
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">A Tasa BCV</span>
                                <span className="text-xs font-black text-emerald-600 dark:text-[#00DD9E]">
                                  {amountBs.toLocaleString('es-VE', { maximumFractionDigits: 0 })} Bs.
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Acciones del Cliente: BOTÓN DE COBRO Y BOTÓN DE PAGO */}
                          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5">
                            <div className="grid grid-cols-2 gap-2">
                              {/* Botón de Cobro */}
                              <button
                                type="button"
                                onClick={() => openCobroModal(client)}
                                className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs shadow-xs transition cursor-pointer"
                                title="Registrar cobro recibido de este cliente"
                              >
                                <DollarSign className="w-3.5 h-3.5" />
                                <span>Botón de Cobro</span>
                              </button>

                              {/* Botón de Pago */}
                              <button
                                type="button"
                                onClick={() => openPagoModal(client)}
                                className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-xs transition cursor-pointer"
                                title="Registrar liquidación o pago relacionado"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>Botón de Pago</span>
                              </button>
                            </div>

                            {/* Acciones de Edición, Archivar y Eliminar */}
                            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 pt-1">
                              <button
                                type="button"
                                onClick={() => openEditClientModal(client)}
                                className="hover:text-slate-900 dark:hover:text-white flex items-center space-x-1 cursor-pointer"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Editar</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleArchiveToggle(client)}
                                className="hover:text-amber-500 flex items-center space-x-1 cursor-pointer"
                              >
                                <Archive className="w-3 h-3" />
                                <span>{client.archived ? 'Desarchivar' : 'Archivar'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteClient(client)}
                                className="hover:text-rose-500 flex items-center space-x-1 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Eliminar</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* =====================================================================
                PESTAÑA 2: TAREAS & ACTIVIDADES ASIGNADAS POR DIRECCIÓN
            ===================================================================== */}
            {activeTab === 'tareas' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Pautas y Actividades Asignadas por Dirección</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Menciones en vivo pautadas, activaciones de marcas o enlaces de programación que debes emitir.
                    </p>
                  </div>
                </div>

                {tasks.length === 0 ? (
                  <div className="p-10 text-center rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">¡Al día! No tienes tareas pendientes asignadas.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tasks.map(task => {
                      const isPublicitaria = task.type === 'publicitaria';
                      const isCompleted = task.status === 'completada';
                      const isInProgress = task.status === 'en_curso';

                      return (
                        <div
                          key={task.id}
                          className={`p-4 rounded-2xl border transition ${
                            isCompleted
                              ? 'bg-slate-50/50 dark:bg-white/[0.02] border-slate-200/50 dark:border-white/5 opacity-80'
                              : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-white/10 shadow-sm'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <div className="flex items-center space-x-2">
                              <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-lg uppercase tracking-wider flex items-center space-x-1 ${
                                isPublicitaria
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-[#00DD9E]'
                                  : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                              }`}>
                                {isPublicitaria ? <Megaphone className="w-3 h-3" /> : <Radio className="w-3 h-3" />}
                                <span>{isPublicitaria ? 'Pauta Publicitaria' : 'Programación'}</span>
                              </span>

                              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${
                                task.priority === 'alta' ? 'bg-rose-500/10 text-rose-600' : 'bg-slate-100 dark:bg-white/10 text-slate-600'
                              }`}>
                                Prioridad {task.priority}
                              </span>
                            </div>

                            <span className={`text-xs font-black px-2.5 py-0.5 rounded-lg border inline-flex items-center space-x-1 ${
                              isCompleted
                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                : isInProgress
                                ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                                : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                            }`}>
                              {isCompleted ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Completada</span>
                                </>
                              ) : isInProgress ? (
                                <>
                                  <Radio className="w-3.5 h-3.5" />
                                  <span>En Curso</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>Pendiente</span>
                                </>
                              )}
                            </span>
                          </div>

                          <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1">{task.title}</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">{task.description}</p>

                          <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-3 border-t border-slate-100 dark:border-white/5">
                            <span className="text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Pautado para: {new Date(task.scheduledDate).toLocaleString('es-VE')}</span>
                            </span>

                            {/* Controles del Locutor sobre la Tarea */}
                            <div className="flex items-center space-x-2">
                              {!isCompleted && !isInProgress && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateStaffTaskStatus(task.id, 'en_curso');
                                    setTasks(getTasksByStaffId(currentStaff.id));
                                  }}
                                  className="px-3 py-1 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold transition cursor-pointer"
                                >
                                  Iniciar Pauta
                                </button>
                              )}

                              {!isCompleted && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const note = prompt('¿Alguna nota de cabina para la Dirección? (Opcional, ej: Emitido a las 7:45 am con éxito)', task.locutorNotes || '');
                                    updateStaffTaskStatus(task.id, 'completada', note || 'Emitido correctamente');
                                    setTasks(getTasksByStaffId(currentStaff.id));
                                  }}
                                  className="inline-flex items-center space-x-1 px-3 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold transition cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Marcar Emitida</span>
                                </button>
                              )}

                              {isCompleted && task.locutorNotes && (
                                <span className="text-[11px] text-emerald-600 dark:text-[#00DD9E] italic">
                                  Nota: "{task.locutorNotes}"
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* =====================================================================
                PESTAÑA 3: REGISTRO DE ENTREVISTAS EN CABINA / PROGRAMA
            ===================================================================== */}
            {activeTab === 'entrevistas' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Registro de Entrevistas Realizadas</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Lleva una bitácora formal de a quién entrevistaste en tu programa y sobre qué conversaron.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setInterviewForm({
                        intervieweeName: '',
                        intervieweeRoleOrg: '',
                        topic: '',
                        programName: currentStaff.programName || '',
                        date: new Date().toISOString().split('T')[0],
                        time: '08:00 AM',
                        audioUrl: '',
                        observations: ''
                      });
                      setIsInterviewModalOpen(!isInterviewModalOpen);
                    }}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-sm transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isInterviewModalOpen ? 'Cerrar Formulario' : 'Registrar Entrevista'}</span>
                  </button>
                </div>

                {/* SUB-PANEL INLINE: REGISTRAR ENTREVISTA */}
                {isInterviewModalOpen && (
                  <div className="p-5 sm:p-6 rounded-2xl bg-slate-100 dark:bg-[#1c2633] border-2 border-emerald-500/30 shadow-xl space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-black text-slate-900 dark:text-white">Registrar Entrevista en Cabina</h3>
                      <button
                        type="button"
                        onClick={() => setIsInterviewModalOpen(false)}
                        className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveInterviewSubmit} className="space-y-3 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">¿A quién entrevistaste? *</label>
                          <input
                            type="text"
                            value={interviewForm.intervieweeName}
                            onChange={(e) => setInterviewForm({ ...interviewForm, intervieweeName: e.target.value })}
                            required
                            placeholder="Nombre y apellido del invitado"
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-medium"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Cargo / Organización / Representación</label>
                          <input
                            type="text"
                            value={interviewForm.intervieweeRoleOrg}
                            onChange={(e) => setInterviewForm({ ...interviewForm, intervieweeRoleOrg: e.target.value })}
                            placeholder="Ej. Presidente de la Asociación de Productores"
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">¿Sobre qué conversaron? (Tema central y acuerdos) *</label>
                        <textarea
                          value={interviewForm.topic}
                          onChange={(e) => setInterviewForm({ ...interviewForm, topic: e.target.value })}
                          required
                          rows={3}
                          placeholder="Resumen claro de los puntos tocados en la entrevista..."
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-medium"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Fecha</label>
                          <input
                            type="date"
                            value={interviewForm.date}
                            onChange={(e) => setInterviewForm({ ...interviewForm, date: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-medium"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Hora de Transmisión</label>
                          <input
                            type="text"
                            value={interviewForm.time}
                            onChange={(e) => setInterviewForm({ ...interviewForm, time: e.target.value })}
                            placeholder="Ej. 07:45 AM"
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-medium"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Observaciones adicionales</label>
                          <input
                            type="text"
                            value={interviewForm.observations}
                            onChange={(e) => setInterviewForm({ ...interviewForm, observations: e.target.value })}
                            placeholder="Detalles o compromisos..."
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-medium"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200 dark:border-white/10">
                        <button
                          type="button"
                          onClick={() => setIsInterviewModalOpen(false)}
                          className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-200 dark:hover:bg-white/10 cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black cursor-pointer"
                        >
                          Guardar Entrevista
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {interviews.length === 0 ? (
                  <div className="p-10 text-center rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5">
                    <Mic className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No has registrado entrevistas aún</p>
                    <p className="text-xs text-slate-500 mt-1">Registra cada entrevista para que Dirección tenga el histórico de voceros y temas tratados.</p>
                  </div>
                ) : (
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
                              <h4 className="text-base font-black text-slate-900 dark:text-white mt-1">
                                {intw.intervieweeName}
                              </h4>
                              {intw.intervieweeRoleOrg && (
                                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                  {intw.intervieweeRoleOrg}
                                </p>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`¿Eliminar el registro de entrevista con ${intw.intervieweeName}?`)) {
                                  deleteStaffInterview(intw.id);
                                  setInterviews(getInterviewsByStaffId(currentStaff.id));
                                }
                              }}
                              className="p-1.5 rounded-xl hover:bg-rose-500/10 text-rose-500 transition cursor-pointer"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="my-2 p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                              Sobre qué conversaron:
                            </span>
                            <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                              {intw.topic}
                            </p>
                          </div>

                          {intw.observations && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                              Observaciones: {intw.observations}
                            </p>
                          )}
                        </div>

                        <div className="pt-2 mt-2 border-t border-slate-100 dark:border-white/5 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                          <span>Programa: {intw.programName}</span>
                          <span className="text-emerald-600 dark:text-[#00DD9E] font-bold">Emitido en vivo</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* =====================================================================
                PESTAÑA 4: NOTAS PARA EL PROGRAMA & PROGRAMACIÓN DIARIA POR DÍAS
            ===================================================================== */}
            {activeTab === 'notas' && (() => {
              const ALL_DAYS_WEEK = [
                { id: 1, name: 'Lunes', short: 'Lun' },
                { id: 2, name: 'Martes', short: 'Mar' },
                { id: 3, name: 'Miércoles', short: 'Mié' },
                { id: 4, name: 'Jueves', short: 'Jue' },
                { id: 5, name: 'Viernes', short: 'Vie' },
                { id: 6, name: 'Sábado', short: 'Sáb' },
                { id: 7, name: 'Domingo', short: 'Dom' }
              ];

              const rawDays = Array.isArray(currentStaff.assignedDays) ? currentStaff.assignedDays : [1, 2, 3, 4, 5];
              const staffAssignedDayNames = rawDays.map(d => {
                if (typeof d === 'number') {
                  const found = ALL_DAYS_WEEK.find(item => item.id === d);
                  return found ? found.name : String(d);
                }
                return String(d);
              });
              const staffAssignedDayIds = rawDays.map(d => {
                if (typeof d === 'number') return d;
                const found = ALL_DAYS_WEEK.find(item => item.name.toLowerCase() === String(d).toLowerCase() || item.short.toLowerCase() === String(d).toLowerCase());
                return found ? found.id : null;
              }).filter(Boolean);

              const staffAssignedDays = staffAssignedDayNames;

              const filteredNotes = notes.filter(n => {
                if (noteStatusFilter === 'trashed') return Boolean(n.trashed);
                if (n.trashed) return false;
                if (selectedProgramDay !== 'Todos') {
                  const selectedObj = ALL_DAYS_WEEK.find(d => d.name === selectedProgramDay);
                  const isMatching = typeof n.dayOfWeek === 'number'
                    ? (selectedObj && n.dayOfWeek === selectedObj.id)
                    : (String(n.dayOfWeek).toLowerCase() === selectedProgramDay.toLowerCase());
                  if (!isMatching) return false;
                }
                if (noteStatusFilter === 'all') return true;
                return (n.status || 'queued') === noteStatusFilter;
              });

              return (
                <div className="space-y-5">
                  
                  {/* Bloque de Programación Diaria según los Días Asignados al Programa */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-emerald-500/25 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600 dark:text-[#00DD9E] flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Programación Diaria Asignada: {currentStaff.programName || 'Mi Programa'}</span>
                        </span>
                        <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                          {currentStaff.programName} ({currentStaff.programSchedule})
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingNote(null);
                          setNoteForm({
                            title: '',
                            content: '',
                            programDate: new Date().toISOString().split('T')[0],
                            dayOfWeek: selectedProgramDay !== 'Todos' ? selectedProgramDay : (staffAssignedDays[0] || 'Lunes'),
                            segmentTime: '07:00 AM',
                            sortOrder: notes.filter(n => !n.trashed).length + 1,
                            status: 'queued'
                          });
                          setIsNoteModalOpen(!isNoteModalOpen);
                        }}
                        className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#001E4D] text-[#00DD9E] dark:bg-[#00DD9E] dark:text-[#001E4D] font-black text-xs shadow-sm transition cursor-pointer self-start sm:self-center"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{isNoteModalOpen ? 'Cerrar Formulario' : 'Añadir Nota / Punto al Esquema'}</span>
                      </button>
                    </div>

                    {/* Selector de Días Asignados al Programa del Locutor */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1">
                        Días de tu Programa:
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedProgramDay('Todos')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer border ${
                          selectedProgramDay === 'Todos'
                            ? 'bg-[#00DD9E] text-[#001E4D] border-[#00DD9E] shadow-xs'
                            : 'bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-100'
                        }`}
                      >
                        Todos ({notes.filter(n => !n.trashed).length})
                      </button>
                      {ALL_DAYS_WEEK.map(dayObj => {
                        const isAssigned = staffAssignedDayNames.includes(dayObj.name) || staffAssignedDayIds.includes(dayObj.id);
                        const countForDay = notes.filter(n => {
                          if (n.trashed) return false;
                          if (typeof n.dayOfWeek === 'number') return n.dayOfWeek === dayObj.id;
                          return String(n.dayOfWeek).toLowerCase() === dayObj.name.toLowerCase() || String(n.dayOfWeek).toLowerCase() === dayObj.short.toLowerCase();
                        }).length;

                        return (
                          <button
                            key={dayObj.id}
                            type="button"
                            onClick={() => setSelectedProgramDay(dayObj.name)}
                            title={isAssigned ? `Día asignado a ${currentStaff.programName}` : 'Día sin transmisión programada'}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer border flex items-center space-x-1.5 ${
                              selectedProgramDay === dayObj.name
                                ? 'bg-[#001E4D] text-[#00DD9E] dark:bg-[#00DD9E] dark:text-[#001E4D] border-[#00DD9E] shadow-md ring-2 ring-[#00DD9E]/40'
                                : isAssigned
                                ? 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-800 dark:text-[#00DD9E] border-emerald-500/40 hover:bg-emerald-500/25'
                                : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-white/5 hover:bg-slate-200/60'
                            }`}
                          >
                            <span>{dayObj.name}</span>
                            {countForDay > 0 && (
                              <span className="px-1.5 py-0.2 rounded-md bg-black/10 dark:bg-white/15 text-[11px] font-mono">{countForDay}</span>
                            )}
                            {isAssigned && selectedProgramDay !== dayObj.name && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* SUB-PANEL INLINE: CREAR / EDITAR NOTA DE PROGRAMA */}
                  {isNoteModalOpen && (
                    <div className="p-5 sm:p-6 rounded-2xl bg-slate-100 dark:bg-[#1c2633] border-2 border-emerald-500/35 shadow-xl space-y-4 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-black text-slate-900 dark:text-white">
                            {editingNote ? 'Editar Nota del Programa' : 'Nueva Nota / Punto en el Esquema Diario'}
                          </h3>
                          <p className="text-xs text-slate-500">
                            Organiza la fecha, día del programa, hora del bloque, orden de salida y estado en vivo.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsNoteModalOpen(false)}
                          className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <form onSubmit={handleSaveNoteSubmit} className="space-y-3 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Día del Programa</label>
                            <select
                              value={noteForm.dayOfWeek}
                              onChange={(e) => setNoteForm({ ...noteForm, dayOfWeek: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-bold cursor-pointer"
                            >
                              {staffAssignedDays.map(day => (
                                <option key={day} value={day}>{day}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Fecha de Emisión</label>
                            <input
                              type="date"
                              value={noteForm.programDate}
                              onChange={(e) => setNoteForm({ ...noteForm, programDate: e.target.value })}
                              required
                              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-bold"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Hora / Segmento</label>
                            <input
                              type="text"
                              value={noteForm.segmentTime}
                              onChange={(e) => setNoteForm({ ...noteForm, segmentTime: e.target.value })}
                              placeholder="Ej. 07:15 AM - Bloque 2"
                              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-medium"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Orden de Salida (#)</label>
                            <input
                              type="number"
                              min="1"
                              value={noteForm.sortOrder}
                              onChange={(e) => setNoteForm({ ...noteForm, sortOrder: Number(e.target.value) || 1 })}
                              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-black"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <div className="sm:col-span-2">
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Título de la Nota o Segmento *</label>
                            <input
                              type="text"
                              value={noteForm.title}
                              onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                              required
                              placeholder="Ej. Mención oficial Supermercado La Cima / Efemérides"
                              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-bold"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Estado en el Programa</label>
                            <select
                              value={noteForm.status}
                              onChange={(e) => setNoteForm({ ...noteForm, status: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-bold cursor-pointer"
                            >
                              <option value="queued">En Cola (Por decir en vivo)</option>
                              <option value="spoken">Ya dicho en vivo</option>
                              <option value="draft">Borrador</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Guion / Texto Completo de la Nota *</label>
                          <textarea
                            value={noteForm.content}
                            onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                            rows={4}
                            required
                            placeholder="Escribe aquí el texto para leer al aire, puntos clave o recordatorios del bloque..."
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-medium"
                          />
                        </div>

                        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200 dark:border-white/10">
                          <button
                            type="button"
                            onClick={() => setIsNoteModalOpen(false)}
                            className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-200 dark:hover:bg-white/10 cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black cursor-pointer"
                          >
                            {editingNote ? 'Actualizar Nota' : 'Guardar en Esquema'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Filtros por Estado de la Nota: En Cola, Ya Dicho en Vivo, Borradores, Papelera */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[
                        { id: 'queued', label: 'En Cola (Esquema)', icon: Clock, count: notes.filter(n => !n.trashed && (n.status || 'queued') === 'queued').length },
                        { id: 'spoken', label: 'Ya Dicho en Vivo', icon: Mic, count: notes.filter(n => !n.trashed && n.status === 'spoken').length },
                        { id: 'draft', label: 'Borradores', icon: Edit3, count: notes.filter(n => !n.trashed && n.status === 'draft').length },
                        { id: 'all', label: 'Todas Activas', icon: ListOrdered, count: notes.filter(n => !n.trashed).length },
                        { id: 'trashed', label: 'Papelera', icon: Trash2, count: notes.filter(n => n.trashed).length }
                      ].map(tab => {
                        const TabIcon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setNoteStatusFilter(tab.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                              noteStatusFilter === tab.id
                                ? 'bg-[#001E4D] text-[#00DD9E] dark:bg-[#00DD9E] dark:text-[#001E4D] shadow-xs'
                                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                            }`}
                          >
                            <TabIcon className="w-3.5 h-3.5" />
                            <span>{tab.label}</span>
                            <span className="px-1.5 py-0.2 rounded-md bg-black/10 dark:bg-white/15 text-[11px] font-black">{tab.count}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Listado Ordenado de Notas / Esquema del Programa */}
                  {filteredNotes.length === 0 ? (
                    <div className="p-10 text-center rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5">
                      <FileText className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        No hay notas en esta vista ({selectedProgramDay}).
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Añade notas para organizar el orden de salida de tu programa diario.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredNotes.map((note, idx) => {
                        const isSpoken = note.status === 'spoken';
                        const isDraft = note.status === 'draft';
                        return (
                          <div
                            key={note.id}
                            className={`p-4 rounded-2xl border transition flex flex-col justify-between gap-3 ${
                              isSpoken
                                ? 'bg-emerald-500/10 border-emerald-500/30'
                                : isDraft
                                ? 'bg-slate-100/80 dark:bg-white/[0.03] border-slate-300 dark:border-white/10'
                                : 'bg-amber-50/60 dark:bg-amber-950/15 border-amber-300/70 dark:border-amber-500/30 shadow-xs'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                              <div className="flex items-start space-x-3">
                                {/* Número de Orden de Salida */}
                                <div className="flex flex-col items-center space-y-1">
                                  <span className="w-8 h-8 rounded-xl bg-[#001E4D] text-[#00DD9E] font-display font-black text-xs flex items-center justify-center shadow-xs">
                                    #{note.sortOrder || idx + 1}
                                  </span>
                                  {!note.trashed && (
                                    <div className="flex items-center space-x-0.5">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          reorderStaffNote(note.id, 'up');
                                          setNotes(getNotesByStaffId(currentStaff.id));
                                        }}
                                        className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-slate-500 cursor-pointer"
                                        title="Subir en el orden de salida"
                                      >
                                        <ArrowUp className="w-3 h-3" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          reorderStaffNote(note.id, 'down');
                                          setNotes(getNotesByStaffId(currentStaff.id));
                                        }}
                                        className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-slate-500 cursor-pointer"
                                        title="Bajar en el orden de salida"
                                      >
                                        <ArrowDown className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )}
                                </div>

                                <div className="space-y-1">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="text-[11px] font-black px-2 py-0.5 rounded-lg bg-[#001E4D]/10 dark:bg-white/10 text-slate-800 dark:text-white">
                                      {note.dayOfWeek || 'Programa'} · {note.programDate || 'Hoy'}
                                    </span>
                                    {note.segmentTime && (
                                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-[#00DD9E] inline-flex items-center space-x-1">
                                        <Clock className="w-3 h-3" />
                                        <span>{note.segmentTime}</span>
                                      </span>
                                    )}
                                    <span className={`text-[11px] font-black px-2 py-0.5 rounded-lg uppercase inline-flex items-center space-x-1 ${
                                      isSpoken
                                        ? 'bg-emerald-500 text-slate-950'
                                        : isDraft
                                        ? 'bg-slate-300 dark:bg-white/15 text-slate-800 dark:text-slate-200'
                                        : 'bg-amber-500 text-slate-950'
                                    }`}>
                                      {isSpoken ? (
                                        <>
                                          <Check className="w-3 h-3" />
                                          <span>Ya dicho en vivo</span>
                                        </>
                                      ) : isDraft ? (
                                        <span>Borrador</span>
                                      ) : (
                                        <span>En Cola de Salida</span>
                                      )}
                                    </span>
                                  </div>

                                  <h4 className={`text-sm font-black ${isSpoken ? 'line-through opacity-80 text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                                    {note.title}
                                  </h4>

                                  <p className="text-xs text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                                    {note.content}
                                  </p>
                                </div>
                              </div>

                              {/* Botones rápidos de Estado en Vivo y Edición */}
                              <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-start shrink-0">
                                {!note.trashed ? (
                                  <>
                                    {note.status !== 'spoken' ? (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          updateStaffNoteStatus(note.id, 'spoken');
                                          setNotes(getNotesByStaffId(currentStaff.id));
                                        }}
                                        className="px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-black transition cursor-pointer flex items-center space-x-1 shadow-xs"
                                        title="Marcar que ya fue dicho al aire en vivo"
                                      >
                                        <Volume2 className="w-3.5 h-3.5" />
                                        <span>Ya dicho en vivo</span>
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          updateStaffNoteStatus(note.id, 'queued');
                                          setNotes(getNotesByStaffId(currentStaff.id));
                                        }}
                                        className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 text-[11px] font-bold transition cursor-pointer"
                                      >
                                        Volver a Cola
                                      </button>
                                    )}

                                    {note.status !== 'draft' && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          updateStaffNoteStatus(note.id, 'draft');
                                          setNotes(getNotesByStaffId(currentStaff.id));
                                        }}
                                        className="px-2.5 py-1.5 rounded-xl bg-slate-200/80 dark:bg-white/10 hover:bg-slate-300 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition cursor-pointer"
                                      >
                                        A Borrador
                                      </button>
                                    )}

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingNote(note);
                                        setNoteForm({
                                          title: note.title,
                                          content: note.content,
                                          programDate: note.programDate || new Date().toISOString().split('T')[0],
                                          dayOfWeek: note.dayOfWeek || staffAssignedDays[0] || 'Lunes',
                                          segmentTime: note.segmentTime || '07:00 AM',
                                          sortOrder: note.sortOrder || 1,
                                          status: note.status || 'queued'
                                        });
                                        setIsNoteModalOpen(true);
                                      }}
                                      className="p-1.5 rounded-xl bg-white/80 dark:bg-white/10 hover:bg-white text-slate-700 dark:text-slate-200 transition cursor-pointer"
                                      title="Editar Nota"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        trashStaffNote(note.id);
                                        setNotes(getNotesByStaffId(currentStaff.id));
                                      }}
                                      className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition cursor-pointer"
                                      title="Enviar a Papelera"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        restoreStaffNote(note.id);
                                        setNotes(getNotesByStaffId(currentStaff.id));
                                      }}
                                      className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-[#00DD9E] text-[11px] font-bold cursor-pointer"
                                    >
                                      Restaurar
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        deleteStaffNote(note.id);
                                        setNotes(getNotesByStaffId(currentStaff.id));
                                      }}
                                      className="px-2.5 py-1.5 rounded-xl bg-rose-500 text-white text-[11px] font-bold cursor-pointer"
                                    >
                                      Eliminar Definitivo
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* =====================================================================
                PESTAÑA 5: CHAT CON DIRECCIÓN
            ===================================================================== */}
            {activeTab === 'chat' && (
              <div className="flex flex-col h-[460px] rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 overflow-hidden">
                <div className="px-4 py-3 bg-white dark:bg-white/5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-black text-slate-800 dark:text-white">Dirección General — Neblina Stereo</span>
                  </div>
                  <span className="text-[11px] text-slate-600 dark:text-slate-400">Canal Directo Interno</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-600 dark:text-slate-400">
                      No hay mensajes previos. Escríbele a la Dirección de la radio para coordinar pautas o requerimientos.
                    </div>
                  ) : (
                    messages.map(msg => {
                      const isMe = msg.sender === 'staff';
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div className={`max-w-[80%] p-3.5 rounded-2xl text-xs font-medium ${
                            isMe
                              ? 'bg-emerald-600 text-white rounded-br-none shadow-sm'
                              : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-bl-none shadow-xs'
                          }`}>
                            <p className="leading-relaxed">{msg.text}</p>
                          </div>
                          <span className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 px-1">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatMessagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-white/5 border-t border-slate-200 dark:border-white/10 flex items-center space-x-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Escribe un mensaje para la Dirección..."
                    className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00DD9E]"
                  />
                  <button
                    type="submit"
                    className="p-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer"
                    title="Enviar Mensaje"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
