import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Lock, 
  User, 
  LogOut, 
  Download, 
  Play, 
  Pause, 
  Volume2, 
  Image as ImageIcon, 
  Film, 
  Music, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MessageSquare, 
  Send, 
  RefreshCw, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  Building2, 
  Tag, 
  FileText, 
  Printer, 
  Megaphone,
  Radio,
  Eye,
  EyeOff,
  Archive,
  ArrowRight,
  ArrowLeft,
  Menu,
  Sun,
  Moon,
  Edit3,
  Bell,
  Landmark,
  Calculator,
  Globe,
  Share2,
  Maximize2
} from 'lucide-react';
import Emoji3D from '../Emoji3D';
import SystemInstallButton from '../SystemInstallButton';
import AnimatedBackground from '../AnimatedBackground';
import { useTheme } from '../../context/ThemeContext';
import { 
  loginClient, 
  getLoggedClientSession, 
  logoutClient,
  getAssetsByClientId,
  getRequestsByClientId,
  submitClientRequest,
  getInvoicesByClientId,
  getMessagesByClientId,
  sendInternalMessage,
  markMessagesReadForClient,
  getClientNotifications,
  markClientNotificationsRead,
  runAutomatedPaymentNotifications,
  REQUEST_STEPS,
  getAllClientUsers
} from '../../services/clientPortalService';
import { getAllClients, saveClient, getAllBankProfiles } from '../../services/radioClientsService';
import { getCachedBcvRates, fetchLiveBcvRates, convertCurrencyToBs } from '../../services/bcvService';
import { requestNotificationPermission, getNotificationPermission, showPortalPushNotification } from '../../services/notificationService';

export default function ClientPortalModal({ isOpen, onClose, isStandalonePage = false }) {
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

  const [session, setSession] = useState(() => getLoggedClientSession());
  const [clientData, setClientData] = useState(null);

  // Formulario de login
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Pestaña activa en el dashboard del cliente
  // 'material' | 'solicitudes' | 'eventos' | 'facturacion' | 'mensajes'
  const [activeTab, setActiveTab] = useState('material');

  // Datos del cliente autenticado
  const [assets, setAssets] = useState([]);
  const [requests, setRequests] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [bankProfiles, setBankProfiles] = useState(() => getAllBankProfiles());
  const [isNotifPanelOpen, setIsNotifPanelOpen] = useState(false);
  const [notifPermission, setNotifPermission] = useState(() => getNotificationPermission());
  const [liveAlertBanner, setLiveAlertBanner] = useState('');

  // Filtros de material publicitario
  const [assetChannelFilter, setAssetChannelFilter] = useState('all'); // 'all' | 'web' | 'radial' | 'redes'
  const [assetTypeFilter, setAssetTypeFilter] = useState('all'); // 'all' | 'audio' | 'photo' | 'video'
  const [assetStatusFilter, setAssetStatusFilter] = useState('all'); // 'all' | 'vigente' | 'no_vigente'

  // Modal para ver imagen en gran tamaño
  const [imagePreviewModal, setImagePreviewModal] = useState(null); // { url, name, category }

  // Reproductor de audio embebido para cuñas
  const [currentlyPlayingAudio, setCurrentlyPlayingAudio] = useState(null);
  const [isAudioPaused, setIsAudioPaused] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef(null);

  // Tasas de cambio BCV
  const [bcvRates, setBcvRates] = useState(() => getCachedBcvRates());
  const [calcAmount, setCalcAmount] = useState('65');
  const [calcCurrency, setCalcCurrency] = useState('USD');
  const [copiedCalc, setCopiedCalc] = useState(false);
  const [copiedField, setCopiedField] = useState(null); // 'account-ID', 'pago-ID', 'holder-ID'

  const handleCopyText = (text, fieldKey) => {
    if (!text) return;
    navigator.clipboard.writeText(String(text).trim());
    setCopiedField(fieldKey);
    setTimeout(() => {
      setCopiedField(prev => (prev === fieldKey ? null : prev));
    }, 2000);
  };

  // Modal para nueva solicitud de cambio publicitario
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestChannel, setRequestChannel] = useState('publicidad_radial');
  const [requestTitle, setRequestTitle] = useState('');
  const [requestDesc, setRequestDesc] = useState('');
  const [requestSuccessMsg, setRequestSuccessMsg] = useState('');

  // Modal para notificar Evento, Jornada o Promoción
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventType, setEventType] = useState('promocion'); // 'evento' | 'jornada' | 'promocion'
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventSuccessMsg, setEventSuccessMsg] = useState('');

  // Chat interno con el Director
  const [chatInput, setChatInput] = useState('');
  const chatBottomRef = useRef(null);

  // Modal visualizador de factura / recibo digital imprimible
  const [viewingInvoice, setViewingInvoice] = useState(null);

  // Editor de Ficha del Establecimiento (con solicitud de aprobación al Director)
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [profileForm, setProfileForm] = useState({
    registeredName: '',
    businessName: '',
    businessRif: '',
    businessDescription: '',
    address: '',
    ownerPhone: ''
  });

  const handleOpenEditProfile = () => {
    setProfileForm({
      registeredName: clientData?.registeredName || clientData?.businessName || '',
      businessName: clientData?.businessName || session?.businessName || '',
      businessRif: clientData?.businessRif || '',
      businessDescription: clientData?.businessDescription || '',
      address: clientData?.address || '',
      ownerPhone: clientData?.ownerPhone || ''
    });
    setIsEditingDescription(true);
  };

  const handleRequestProfileChanges = (e) => {
    if (e) e.preventDefault();
    if (!session?.clientId) return;
    if (!profileForm.businessName.trim() || !profileForm.businessRif.trim()) {
      alert('Por favor indique al menos el nombre comercial de la marca y los datos del RIF.');
      return;
    }

    const summaryText = `Solicitud de actualización de Ficha del Establecimiento:\n• Nombre de Registro: ${profileForm.registeredName.trim() || 'N/A'}\n• Nombre Comercial de la Marca: ${profileForm.businessName.trim()}\n• RIF: ${profileForm.businessRif.trim()}\n• Ficha Descriptiva: ${profileForm.businessDescription.trim() || 'Sin descripción'}`;

    submitClientRequest({
      clientId: session.clientId,
      businessName: profileForm.businessName.trim() || clientData?.businessName || session.businessName,
      type: 'ficha_establecimiento',
      channel: 'ambas',
      title: `Actualización de Ficha Comercial: ${profileForm.businessName.trim()}`,
      description: summaryText,
      proposedProfile: {
        registeredName: profileForm.registeredName.trim(),
        businessName: profileForm.businessName.trim(),
        businessRif: profileForm.businessRif.trim(),
        businessDescription: profileForm.businessDescription.trim(),
        address: profileForm.address.trim(),
        ownerPhone: profileForm.ownerPhone.trim()
      }
    });

    setIsEditingDescription(false);
    setRequestSuccessMsg('Solicitud de cambios en la Ficha del Establecimiento enviada al Sistema Interno para aprobación de la Dirección.');
    setRequests(getRequestsByClientId(session.clientId));
    setTimeout(() => setRequestSuccessMsg(''), 6000);
  };

  // Cargar datos del cliente al estar autenticado
  const refreshClientData = () => {
    const sess = getLoggedClientSession();
    setSession(sess);
    setNotifPermission(getNotificationPermission());
    setBankProfiles(getAllBankProfiles());
    if (sess && sess.clientId) {
      const allC = getAllClients();
      const current = allC.find(c => String(c.id) === String(sess.clientId));
      setClientData(current || null);
      setAssets(getAssetsByClientId(sess.clientId));
      setRequests(getRequestsByClientId(sess.clientId));
      setInvoices(getInvoicesByClientId(sess.clientId));
      setMessages(getMessagesByClientId(sess.clientId));
      setNotifications(getClientNotifications(sess.clientId));
      if (activeTab === 'mensajes') {
        markMessagesReadForClient(sess.clientId, 'cliente');
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      runAutomatedPaymentNotifications();
      refreshClientData();
      fetchLiveBcvRates().then(rates => setBcvRates(rates));
    }
  }, [isOpen]);

  useEffect(() => {
    const handlePortalUpdates = () => {
      refreshClientData();
    };
    const handleNewChatMsg = (e) => {
      const msg = e.detail;
      if (msg && session?.clientId && String(msg.clientId) === String(session.clientId) && msg.sender === 'director') {
        setLiveAlertBanner(`Nuevo mensaje del Director: "${msg.text.slice(0, 90)}${msg.text.length > 90 ? '...' : ''}"`);
        setTimeout(() => setLiveAlertBanner(''), 7000);
        refreshClientData();
      }
    };
    window.addEventListener('neblina_portal_updated', handlePortalUpdates);
    window.addEventListener('neblina_clients_updated', handlePortalUpdates);
    window.addEventListener('neblina_chat_notification', handleNewChatMsg);
    return () => {
      window.removeEventListener('neblina_portal_updated', handlePortalUpdates);
      window.removeEventListener('neblina_clients_updated', handlePortalUpdates);
      window.removeEventListener('neblina_chat_notification', handleNewChatMsg);
    };
  }, [session?.clientId, activeTab]);

  // Scroll al final del chat cuando se envían mensajes
  useEffect(() => {
    if (activeTab === 'mensajes' && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  if (!isOpen) return null;

  // Manejar Login
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    const res = loginClient(loginUser, loginPass);
    setIsLoggingIn(false);

    if (res.success) {
      setSession(getLoggedClientSession());
      refreshClientData();
    } else {
      setLoginError(res.error || 'Credenciales inválidas.');
    }
  };

  // Login de demostración rápido
  const handleDemoLogin = (demoUser, demoPass) => {
    setLoginUser(demoUser);
    setLoginPass(demoPass);
    const res = loginClient(demoUser, demoPass);
    if (res.success) {
      setSession(getLoggedClientSession());
      refreshClientData();
    }
  };

  // Manejar Logout
  const handleLogout = () => {
    logoutClient();
    setSession(null);
    setClientData(null);
    setCurrentlyPlayingAudio(null);
    setIsAudioPaused(false);
  };

  // Control de Audio Robusto con Pausa y Barra de Navegación
  const togglePlayAudio = (asset) => {
    if (currentlyPlayingAudio?.id === asset.id) {
      if (audioRef.current) {
        if (audioRef.current.paused) {
          audioRef.current.play().then(() => {
            setIsAudioPaused(false);
          }).catch(e => console.warn('Error audio:', e));
        } else {
          audioRef.current.pause();
          setIsAudioPaused(true);
        }
      }
    } else {
      setCurrentlyPlayingAudio(asset);
      setIsAudioPaused(false);
      setAudioCurrentTime(0);
      setAudioDuration(0);
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.src = asset.url;
          audioRef.current.currentTime = 0;
          audioRef.current.play().then(() => {
            setIsAudioPaused(false);
          }).catch(e => console.warn('Error audio:', e));
        }
      }, 60);
    }
  };

  const handleSeekAudio = (e) => {
    const newTime = parseFloat(e.target.value);
    setAudioCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  // Enviar mensaje al Director
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !session?.clientId) return;

    sendInternalMessage({
      clientId: session.clientId,
      sender: 'cliente',
      senderName: clientData?.businessName || session.businessName,
      text: chatInput.trim()
    });

    setChatInput('');
    setMessages(getMessagesByClientId(session.clientId));
  };

  // Enviar Solicitud de Cambio Publicitario
  const handleCreateRequest = (e) => {
    e.preventDefault();
    if (!requestTitle.trim() || !requestDesc.trim() || !session?.clientId) return;

    submitClientRequest({
      clientId: session.clientId,
      businessName: clientData?.businessName || session.businessName,
      type: 'cambio_publicitario',
      channel: requestChannel,
      title: requestTitle,
      description: requestDesc
    });

    setRequestTitle('');
    setRequestDesc('');
    setIsRequestModalOpen(false);
    setRequestSuccessMsg('Solicitud enviada con éxito. El Director la revisará a la brevedad.');
    setRequests(getRequestsByClientId(session.clientId));
    setTimeout(() => setRequestSuccessMsg(''), 5000);
  };

  // Enviar Notificación de Evento / Jornada / Promoción
  const handleCreateEvent = (e) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDesc.trim() || !session?.clientId) return;

    submitClientRequest({
      clientId: session.clientId,
      businessName: clientData?.businessName || session.businessName,
      type: 'evento_promocion',
      channel: 'ambas',
      title: `[${eventType.toUpperCase()}] ${eventTitle.trim()}`,
      description: eventDesc.trim(),
      targetDate: eventDate
    });

    setEventTitle('');
    setEventDate('');
    setEventDesc('');
    setIsEventModalOpen(false);
    setEventSuccessMsg('Evento / Promoción notificado con éxito a la dirección de Neblina 105.5 FM.');
    setRequests(getRequestsByClientId(session.clientId));
    setTimeout(() => setEventSuccessMsg(''), 5000);
  };

  // Filtrado de materiales por Canal (Web, Radial, Redes) y Vigencia
  const filteredAssets = assets.filter(a => {
    const ch = a.channelType || (a.type === 'audio' ? 'radial' : 'web');
    if (assetChannelFilter !== 'all' && ch !== assetChannelFilter) return false;
    if (assetTypeFilter !== 'all' && a.type !== assetTypeFilter) return false;
    if (assetStatusFilter !== 'all' && a.status !== assetStatusFilter) return false;
    return true;
  });

  // Cálculo en Bolívares
  const calcResult = convertCurrencyToBs(calcAmount, calcCurrency, calcCurrency === 'EUR' ? bcvRates.eur : bcvRates.usd);

  // Estado de Pauta Publicitaria (Activa por defecto)
  const isAdActive = clientData?.adStatus !== 'inactive';

  const clientModules = [
    { id: 'material', label: 'Material Publicitario', emoji: 'musical_note', icon: Music, count: assets.length },
    { id: 'ficha', label: 'Ficha del Comercio', emoji: 'id_card', icon: Building2 },
    { id: 'solicitudes', label: 'Solicitudes de Cambio', emoji: 'memo', icon: Clock, count: requests.filter(r => r.type === 'cambio_publicitario').length },
    { id: 'eventos', label: 'Eventos & Promociones', emoji: 'calendar', icon: Calendar, count: requests.filter(r => r.type === 'evento_promocion').length },
    { id: 'facturacion', label: 'Facturación & Pagos', emoji: 'receipt', icon: FileText, count: invoices.length },
    { id: 'mensajes', label: 'Chat con Dirección', emoji: 'speech_balloon', icon: MessageSquare, alertCount: messages.filter(m => m.sender === 'director' && !m.read).length, count: messages.length },
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
        {/* CABECERA PRINCIPAL SUPERIOR (COMPACTA, ESTILO APPLE HIG - SIN DUPLICACIÓN) */}
        {/* CABECERA SUPERIOR (Solo visible en pantalla de login si no está autenticado) */}
        {!session && (
          <header className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 border-b border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c141f]/80 backdrop-blur-2xl shrink-0">
          <div className="flex items-center space-x-3">
            {/* Botón Menú Móvil */}
            {session && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
                aria-label="Abrir menú de navegación"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <Emoji3D name="handshake" className="w-9 h-9 drop-shadow-md shrink-0" alt="Portal de Aliados Comerciales" />

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display font-black text-sm text-slate-900 dark:text-white">
                  Neblina Stereo 105.5 FM
                </span>
                <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-[#00DD9E] border border-emerald-500/25">
                  Portal Aliados
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Pautas Radiales, Material Publicitario & Facturación
              </p>
            </div>
          </div>

          {/* Acciones de la Cabecera Superior */}
          <div className="flex items-center space-x-2">
            {/* Conmutador de Tema Claro / Oscuro */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer"
              title={`Cambiar a tema ${theme === 'dark' ? 'claro' : 'oscuro'}`}
              aria-label="Cambiar tema de color"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Botón Volver a la Web Principal */}
            <button
              onClick={onClose}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black hover:opacity-90 active:scale-95 transition cursor-pointer"
              title="Volver a la Web Pública de Neblina Stereo"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Volver a la Web</span>
              <span className="sm:hidden">Salir</span>
            </button>
          </div>
        </header>
        )}

        {/* ========================================================================= */}
        {/* CASO A: CLIENTE NO AUTENTICADO (FORMULARIO DE ACCESO CON USUARIO Y CLAVE) */}
        {/* ========================================================================= */}
        {!session ? (
          <div className="flex-1 overflow-y-auto p-6 sm:p-12 flex flex-col items-center justify-center text-center">
            
            <div className="panel-aeroglass max-w-md w-full p-6 sm:p-8 rounded-2xl border border-white/70 dark:border-white/15 shadow-lg space-y-6 my-auto text-center">
              
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#00DD9E]/20 to-[#FEDC01]/20 text-[#008f7a] dark:text-[#00DD9E] mx-auto flex items-center justify-center border border-[#00DD9E]/30 shadow-inner">
                <Emoji3D name="handshake" className="w-8 h-8" alt="Portal para Aliados Comerciales" />
              </div>

              <div>
                <h4 className="font-display font-black text-xl text-slate-900 dark:text-white">
                  Portal para Aliados Comerciales
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Ingrese las credenciales asignadas a su comercio para consultar pautas, descargar audios, revisar facturas oficiales y estado de cuenta.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Usuario
                  </label>
                  <input
                    type="text"
                    value={loginUser}
                    onChange={(e) => { setLoginUser(e.target.value); setLoginError(''); }}
                    placeholder="Usuario comercial asignado..."
                    autoFocus
                    required
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
                      value={loginPass}
                      onChange={(e) => { setLoginPass(e.target.value); setLoginError(''); }}
                      placeholder="Contraseña..."
                      required
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
                  disabled={isLoggingIn}
                  className="w-full py-3 rounded-2xl bg-[#00DD9E] hover:brightness-105 text-[#001E4D] font-bold text-sm transition border border-white/60 cursor-pointer disabled:opacity-50"
                >
                  {isLoggingIn ? 'Verificando...' : 'Ingresar al Portal'}
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
            <aside className="hidden lg:flex w-72 bg-white/80 dark:bg-[#0c141f]/80 backdrop-blur-xl border-r border-slate-200 dark:border-white/10 flex-col justify-between p-4 shrink-0 overflow-y-auto">
              <div className="space-y-4">
                
                {/* Perfil del Comercio en Cabecera del Sidebar */}
                <div className="p-3 rounded-2xl bg-slate-100/90 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-14 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-[#00DD9E]/30 p-1 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                      {clientData?.logoUrl ? (
                        <img
                          src={clientData.logoUrl}
                          alt={clientData.businessName}
                          className="max-h-full max-w-full w-auto h-auto object-contain filter drop-shadow-xs"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <Building2 className="w-5 h-5 text-[#00DD9E]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display font-black text-xs text-slate-900 dark:text-white truncate" title={clientData?.businessName || session.businessName}>
                        {clientData?.businessName || session.businessName}
                      </h3>
                      <p className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 truncate">
                        {clientData?.businessRif || 'Cliente Oficial'}
                      </p>
                    </div>
                  </div>

                  {/* Estado de Publicidad en Aire */}
                  <div className={`p-2 rounded-xl border flex items-center space-x-2 text-[11px] font-bold ${
                    isAdActive 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-[#00DD9E]' 
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                  }`}>
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      isAdActive ? 'bg-[#00DD9E] shadow-[0_0_8px_rgba(0,221,158,0.8)]' : 'bg-rose-500'
                    }`} />
                    <span className="truncate">
                      {isAdActive ? 'Publicidad en Aire: Activa' : 'Publicidad: Pausada'}
                    </span>
                  </div>

                  {/* Botones de Utilidad: Instalar App, Alertas y Cerrar Sesión */}
                  <div className="pt-2 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between gap-1.5 flex-wrap">
                    <SystemInstallButton appName="Portal Aliados" />

                    <button
                      type="button"
                      onClick={async () => {
                        const perm = await requestNotificationPermission();
                        setNotifPermission(perm);
                        if (perm === 'granted') {
                          showPortalPushNotification({
                            title: 'Notificaciones del Portal Activadas',
                            body: `Recibirás alertas de pagos y mensajes para ${clientData?.businessName || session.businessName}.`,
                            tag: 'portal-perm-ok'
                          });
                        }
                      }}
                      className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                        notifPermission === 'granted'
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-[#00DD9E]'
                          : 'bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-300'
                      }`}
                      title={notifPermission === 'granted' ? 'Alertas Push Activas' : 'Activar Alertas Push'}
                    >
                      <Bell className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const nextOpen = !isNotifPanelOpen;
                        setIsNotifPanelOpen(nextOpen);
                        if (nextOpen && session?.clientId) {
                          markClientNotificationsRead(session.clientId);
                          setNotifications(getClientNotifications(session.clientId));
                        }
                      }}
                      className="relative p-2 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-white transition cursor-pointer"
                      title="Centro de Notificaciones"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      {notifications.filter(n => !n.read).length > 0 && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                          {notifications.filter(n => !n.read).length}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={handleLogout}
                      className="p-2 rounded-xl border border-rose-300/40 bg-rose-500/10 hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white transition cursor-pointer"
                      title="Cerrar Sesión del Comercio"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="px-3 py-1 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Módulos del Aliado
                </div>
                <nav className="space-y-1">
                  {clientModules.map((mod) => {
                    const Icon = mod.icon;
                    const isActive = activeTab === mod.id;
                    return (
                      <button
                        key={mod.id}
                        onClick={() => {
                          setActiveTab(mod.id);
                          if (mod.id === 'mensajes' && session?.clientId) {
                            markMessagesReadForClient(session.clientId, 'cliente');
                            setMessages(getMessagesByClientId(session.clientId));
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
                  <SystemInstallButton appName="Portal Aliados" className="w-full justify-center" />
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
                <div className="relative w-80 max-w-[85vw] bg-white dark:bg-[#0c141f] h-full shadow-lg flex flex-col justify-between p-5 z-10 animate-fadeIn overflow-y-auto">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-[#00DD9E]" />
                        <span className="font-display font-black text-sm text-slate-900 dark:text-white">Menú del Aliado</span>
                      </div>
                      <button 
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Perfil del Comercio en Mobile Drawer */}
                    <div className="p-3 rounded-2xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 space-y-2.5">
                      <div className="flex items-center space-x-2.5">
                        <div className="h-10 w-12 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-[#00DD9E]/30 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                          {clientData?.logoUrl ? (
                            <img
                              src={clientData.logoUrl}
                              alt={clientData.businessName}
                              className="max-h-full max-w-full object-contain"
                            />
                          ) : (
                            <Building2 className="w-5 h-5 text-[#00DD9E]" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-display font-black text-xs text-slate-900 dark:text-white truncate">
                            {clientData?.businessName || session.businessName}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            {clientData?.businessRif || 'Cliente Oficial'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-200/60 dark:border-white/10">
                        <SystemInstallButton appName="Portal Aliados" />
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
                      {clientModules.map((mod) => {
                        const Icon = mod.icon;
                        const isActive = activeTab === mod.id;
                        return (
                          <button
                            key={mod.id}
                            onClick={() => {
                              setActiveTab(mod.id);
                              setMobileMenuOpen(false);
                              if (mod.id === 'mensajes' && session?.clientId) {
                                markMessagesReadForClient(session.clientId, 'cliente');
                                setMessages(getMessagesByClientId(session.clientId));
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

                  <div className="pt-4 border-t border-slate-200 dark:border-white/10">
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
                  <span>Aliados</span>
                </button>
                {clientModules.map((mod) => {
                  const Icon = mod.icon;
                  const isActive = activeTab === mod.id;
                  return (
                    <button
                      key={mod.id}
                      onClick={() => {
                        setActiveTab(mod.id);
                        if (mod.id === 'mensajes' && session?.clientId) {
                          markMessagesReadForClient(session.clientId, 'cliente');
                          setMessages(getMessagesByClientId(session.clientId));
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
                        <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Contenedor del Espacio de Trabajo */}
              <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
            
            {/* Mensajes de Éxito Globales */}
            {(requestSuccessMsg || eventSuccessMsg) && (
              <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-[#00DD9E] text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{requestSuccessMsg || eventSuccessMsg}</span>
              </div>
            )}

            {/* 4. CONTENIDO DE LAS PESTAÑAS */}
            <div className="space-y-6">

              {/* ================================================================= */}
              {/* TAB 1: MATERIAL PUBLICITARIO (FOTOS, VIDEOS, AUDIOS RADIALES)      */}
              {/* ================================================================= */}
              {activeTab === 'material' && (
                <div className="space-y-4">
                  
                  {/* Canales de Material Publicitario: Web, Radial, Redes */}
                  <div className="space-y-3 pb-3 border-b border-slate-200 dark:border-white/10">
                    <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
                      <button
                        type="button"
                        onClick={() => setAssetChannelFilter('all')}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer shrink-0 ${
                          assetChannelFilter === 'all'
                            ? 'bg-[#001E4D] text-[#00DD9E] dark:bg-white dark:text-slate-900 shadow-sm'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                        }`}
                      >
                        <span>📁 Todos los Canales</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10 font-bold">
                          {assets.length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAssetChannelFilter('web')}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer shrink-0 ${
                          assetChannelFilter === 'web'
                            ? 'bg-sky-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                        }`}
                      >
                        <span>🌐 Material Página Web</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10 font-bold">
                          {assets.filter(a => (a.channelType || (a.type === 'audio' ? 'radial' : 'web')) === 'web').length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAssetChannelFilter('radial')}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer shrink-0 ${
                          assetChannelFilter === 'radial'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                        }`}
                      >
                        <span>📻 Material Radial</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10 font-bold">
                          {assets.filter(a => (a.channelType || (a.type === 'audio' ? 'radial' : 'web')) === 'radial').length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAssetChannelFilter('redes')}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer shrink-0 ${
                          assetChannelFilter === 'redes'
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                        }`}
                      >
                        <span>📱 Redes Sociales</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10 font-bold">
                          {assets.filter(a => (a.channelType || (a.type === 'audio' ? 'radial' : 'web')) === 'redes').length}
                        </span>
                      </button>
                    </div>

                    {/* Subfiltros por formato y vigencia */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1.5 text-xs">
                        <span className="font-bold text-slate-500">Formato:</span>
                        <button
                          type="button"
                          onClick={() => setAssetTypeFilter('all')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                            assetTypeFilter === 'all'
                              ? 'bg-[#001E4D] text-[#00DD9E] dark:bg-white/20 dark:text-white'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                          }`}
                        >
                          Todos
                        </button>
                        <button
                          type="button"
                          onClick={() => setAssetTypeFilter('audio')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                            assetTypeFilter === 'audio'
                              ? 'bg-[#001E4D] text-[#00DD9E] dark:bg-white/20 dark:text-white'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                          }`}
                        >
                          Audios Radiales
                        </button>
                        <button
                          type="button"
                          onClick={() => setAssetTypeFilter('photo')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                            assetTypeFilter === 'photo'
                              ? 'bg-[#001E4D] text-[#00DD9E] dark:bg-white/20 dark:text-white'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                          }`}
                        >
                          Fotos / Banners
                        </button>
                        <button
                          type="button"
                          onClick={() => setAssetTypeFilter('video')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                            assetTypeFilter === 'video'
                              ? 'bg-[#001E4D] text-[#00DD9E] dark:bg-white/20 dark:text-white'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                          }`}
                        >
                          Videos / Reels
                        </button>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-500">Vigencia:</span>
                        <select
                          value={assetStatusFilter}
                          onChange={(e) => setAssetStatusFilter(e.target.value)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/10 border border-slate-300 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-white cursor-pointer"
                        >
                          <option value="all">Todas las Vigencias</option>
                          <option value="vigente">Solo Vigentes</option>
                          <option value="no_vigente">No Vigentes / Históricos</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  ${newAudioTag}

                  {/* Listado de Materiales */}
                  {filteredAssets.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                      <p className="text-sm font-bold">No hay archivos en esta categoría de filtro.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {filteredAssets.map((asset) => {
                        const isAudio = asset.type === 'audio';
                        const isPhoto = asset.type === 'photo';
                        const isVideo = asset.type === 'video';
                        const isVigente = asset.status === 'vigente';
                        const isPlaying = currentlyPlayingAudio?.id === asset.id;

                        const dateFormatted = new Date(asset.uploadedAt).toLocaleDateString('es-VE', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        });

                        return (
                          <div 
                            key={asset.id}
                            className={`p-4 rounded-2xl border transition-all ${
                              isVigente
                                ? 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 shadow-xs'
                                : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200/60 dark:border-white/5 opacity-70'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="p-2 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white">
                                  {isAudio && <Music className="w-4 h-4 text-emerald-500" />}
                                  {isPhoto && <ImageIcon className="w-4 h-4 text-sky-500" />}
                                  {isVideo && <Film className="w-4 h-4 text-amber-500" />}
                                </span>
                                <div>
                                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    {asset.category}
                                  </span>
                                  <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white leading-tight">
                                    {asset.name}
                                  </h4>
                                </div>
                              </div>

                              <span className={`text-[11px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider flex-shrink-0 ${
                                isVigente
                                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-[#00DD9E]'
                                  : 'bg-slate-400/20 text-slate-500 dark:text-slate-400'
                              }`}>
                                {isVigente ? 'Vigente' : 'No vigente'}
                              </span>
                            </div>

                            {/* Previsualización Según el Tipo */}
                            {isPhoto && asset.url && (
                              <div
                                onClick={() => setImagePreviewModal(asset)}
                                className="my-2.5 rounded-xl overflow-hidden max-h-44 bg-black/10 cursor-pointer relative group border border-slate-200 dark:border-white/10"
                                title="Haga clic para previsualizar en gran tamaño"
                              >
                                <img 
                                  src={asset.url} 
                                  alt={asset.name} 
                                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" 
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2 text-white text-xs font-black">
                                  <Eye className="w-4 h-4" />
                                  <span>Ver en Gran Tamaño</span>
                                </div>
                              </div>
                            )}

                            {isVideo && asset.url && (
                              <div className="my-2.5 rounded-xl overflow-hidden max-h-44 bg-black">
                                <video 
                                  src={asset.url} 
                                  controls 
                                  poster={asset.thumbnailUrl}
                                  className="w-full max-h-44" 
                                />
                              </div>
                            )}

                            {isAudio && (
                              <div className="my-2.5 p-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                  <button
                                    type="button"
                                    onClick={() => togglePlayAudio(asset)}
                                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                                      isPlaying && !isAudioPaused
                                        ? 'bg-emerald-500 text-white shadow-md'
                                        : 'bg-[#001E4D] text-[#00DD9E] dark:bg-[#00DD9E] dark:text-[#001E4D]'
                                    }`}
                                  >
                                    {isPlaying && !isAudioPaused ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                                    <span>{isPlaying && !isAudioPaused ? 'Pausar Cuña' : isPlaying && isAudioPaused ? 'Reanudar Cuña' : 'Reproducir Cuña Radial'}</span>
                                  </button>
                                  <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                                    {isPlaying
                                      ? `${Math.floor(audioCurrentTime / 60)}:${String(Math.floor(audioCurrentTime % 60)).padStart(2, '0')} / ${Math.floor(audioDuration / 60)}:${String(Math.floor(audioDuration % 60)).padStart(2, '0')}`
                                      : asset.duration || '0:30'}
                                  </span>
                                </div>

                                {/* Barra interactiva para navegar / adelantar dentro del audio */}
                                {isPlaying && (
                                  <div className="pt-1 flex items-center space-x-2">
                                    <input
                                      type="range"
                                      min="0"
                                      max={audioDuration || 100}
                                      step="0.1"
                                      value={audioCurrentTime}
                                      onChange={handleSeekAudio}
                                      className="w-full h-1.5 bg-slate-300 dark:bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#00DD9E]"
                                      title="Deslizar para avanzar o retroceder en el audio"
                                    />
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Metadatos y Botón de Descarga */}
                            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-500">
                              <span title={`Subido el: ${asset.uploadedAt}`}>
                                Subido: {dateFormatted}
                              </span>

                              <a
                                href={asset.url}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-1 font-bold text-emerald-600 dark:text-[#00DD9E] hover:underline cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Descargar Archivo</span>
                              </a>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              )}

              
              {/* ================================================================= */}
              {/* TAB: FICHA OFICIAL DEL ESTABLECIMIENTO                            */}
              {/* ================================================================= */}
              {activeTab === 'ficha' && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-white/10">
                      <div>
                        <div className="flex items-center space-x-2 flex-wrap">
                          <span className="inline-flex items-center space-x-1.5 text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-[#00DD9E]">
                            <Building2 className="w-4 h-4" />
                            <span>Ficha Oficial del Establecimiento</span>
                          </span>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-[#00DD9E] border border-emerald-500/25">
                            Sincronizada con el Sistema Interno de Dirección
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Nombre de registro, marca comercial, datos de RIF y ficha descriptiva para pautas al aire, web y facturación.
                        </p>
                      </div>

                      {!isEditingDescription && (
                        <button
                          type="button"
                          onClick={handleOpenEditProfile}
                          className="self-start sm:self-center flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#001E4D] text-[#00DD9E] dark:bg-[#00DD9E] dark:text-[#001E4D] hover:brightness-105 text-xs font-black transition cursor-pointer flex-shrink-0"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Crear / Solicitar Cambios en la Ficha</span>
                        </button>
                      )}
                    </div>

                    {isEditingDescription ? (
                      <form onSubmit={handleRequestProfileChanges} className="p-4 rounded-xl bg-slate-50 dark:bg-[#001438] border border-emerald-500/30 space-y-3 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Nombre de Registro (Razón Social) *
                            </label>
                            <input
                              type="text"
                              value={profileForm.registeredName}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, registeredName: e.target.value }))}
                              placeholder="Ej: Inversiones El Fogón C.A."
                              required
                              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-semibold"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Nombre Comercial de la Marca *
                            </label>
                            <input
                              type="text"
                              value={profileForm.businessName}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, businessName: e.target.value }))}
                              placeholder="Ej: Restaurante El Fogón del Páramo"
                              required
                              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-semibold"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                              RIF del Establecimiento *
                            </label>
                            <input
                              type="text"
                              value={profileForm.businessRif}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, businessRif: e.target.value }))}
                              placeholder="Ej: J-31489201-4"
                              required
                              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-mono font-semibold"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Ficha Descriptiva del Establecimiento (Detalle para locutores, cuñas y promociones) *
                          </label>
                          <textarea
                            rows={3}
                            value={profileForm.businessDescription}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, businessDescription: e.target.value }))}
                            placeholder="Describa su negocio, especialidades, ubicación exacta, horario y diferenciales para la pauta radial..."
                            required
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white text-xs font-normal"
                          />
                        </div>

                        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200 dark:border-white/10">
                          <button
                            type="button"
                            onClick={() => setIsEditingDescription(false)}
                            className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-white/15 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-1.5 rounded-xl bg-[#00DD9E] text-[#001E4D] font-black hover:brightness-105 cursor-pointer"
                          >
                            Enviar a Revisión de Dirección
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/25 border border-slate-200/80 dark:border-white/10">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                            Nombre de Registro
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white block mt-0.5">
                            {clientData?.registeredName || clientData?.businessName || 'No registrado'}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/25 border border-slate-200/80 dark:border-white/10">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                            Nombre Comercial de la Marca
                          </span>
                          <span className="font-bold text-emerald-600 dark:text-[#00DD9E] block mt-0.5">
                            {clientData?.businessName || session.businessName}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/25 border border-slate-200/80 dark:border-white/10">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                            Datos del RIF
                          </span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white block mt-0.5">
                            {clientData?.businessRif || 'No indicado'}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/25 border border-slate-200/80 dark:border-white/10">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                            Estado de Ficha
                          </span>
                          <span className="font-bold text-emerald-600 dark:text-[#00DD9E] flex items-center space-x-1 mt-0.5">
                            {clientData?.profileStatus === 'pending_review' ? (
                              <>
                                <Clock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                                <span>Cambios en revisión por Dirección</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                <span>Verificada en Sistema</span>
                              </>
                            )}
                          </span>
                        </div>

                        <div className="sm:col-span-2 md:col-span-4 p-3.5 rounded-xl bg-slate-50 dark:bg-black/25 border border-slate-200/80 dark:border-white/10">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                            <FileText className="w-3.5 h-3.5 text-slate-400" />
                            <span>Ficha Descriptiva del Establecimiento</span>
                          </span>
                          <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed mt-1">
                            {clientData?.businessDescription || 'Aún no ha completado la ficha descriptiva de su establecimiento. Pulse en "Crear / Solicitar Cambios en la Ficha" para registrarla.'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ================================================================= */}
              {/* TAB 2: SOLICITUDES DE CAMBIO PUBLICITARIO (RADIAL / REDES)         */}
              {/* ================================================================= */}
              {activeTab === 'solicitudes' && (
                <div className="space-y-4">
                  
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                    <div>
                      <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
                        Solicitudes de Cambio Publicitario
                      </h3>
                      <p className="text-xs text-slate-500">
                        Pida modificaciones en locución de cuñas, horarios radiales o artes para redes.
                      </p>
                    </div>

                    <button
                      onClick={() => setIsRequestModalOpen(!isRequestModalOpen)}
                      className="px-4 py-2 rounded-xl bg-[#00DD9E] text-[#001E4D] text-xs font-black uppercase tracking-wider hover:brightness-105 active:scale-95 transition shadow-sm cursor-pointer flex items-center space-x-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isRequestModalOpen ? 'Cerrar Formulario' : 'Nueva Solicitud'}</span>
                    </button>
                  </div>

                  {/* SUB-PANEL INLINE: SOLICITAR CAMBIO PUBLICITARIO (SIN MODAL SUPERPUESTO) */}
                  {isRequestModalOpen && (
                    <div className="p-5 rounded-2xl bg-slate-100 dark:bg-[#001a45] border-2 border-emerald-500/35 shadow-lg space-y-3.5">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
                        <h4 className="font-display font-black text-sm text-slate-900 dark:text-white">
                          Solicitar Cambio Publicitario al Sistema Interno
                        </h4>
                        <button onClick={() => setIsRequestModalOpen(false)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer">
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <form onSubmit={handleCreateRequest} className="space-y-3 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Medio / Canal</label>
                            <select
                              value={requestChannel}
                              onChange={(e) => setRequestChannel(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-800 dark:text-white font-bold"
                            >
                              <option value="publicidad_radial">Radio 105.5 FM (Cuñas y Menciones)</option>
                              <option value="publicidad_redes">Redes Sociales (WhatsApp, IG, FB, TikTok)</option>
                              <option value="ambas">Ambos Canales (Radio + Redes)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Título de la Solicitud</label>
                            <input
                              type="text"
                              value={requestTitle}
                              onChange={(e) => setRequestTitle(e.target.value)}
                              placeholder="ej: Actualización de precios en cuña radial"
                              required
                              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-800 dark:text-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Descripción y Detalles del Cambio</label>
                          <textarea
                            value={requestDesc}
                            onChange={(e) => setRequestDesc(e.target.value)}
                            placeholder="Especifique el texto, horarios o cambios exactos que desea realizar..."
                            rows={3}
                            required
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-800 dark:text-white resize-none"
                          />
                        </div>

                        <div className="pt-1 flex justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => setIsRequestModalOpen(false)}
                            className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white font-bold cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 rounded-xl bg-[#00DD9E] text-[#001E4D] font-black uppercase tracking-wider cursor-pointer"
                          >
                            Enviar Solicitud al Director
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Listado de Solicitudes con los 4 Pasos (Incluyendo cambios de Ficha Comercial) */}
                  {requests.filter(r => r.type === 'cambio_publicitario' || r.type === 'ficha_establecimiento').length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                      <p className="text-sm font-bold">No tiene solicitudes de cambio registradas actualmente.</p>
                      <p className="text-xs mt-1">Pulse en "Nueva Solicitud" para solicitar ajustes al Director.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {requests.filter(r => r.type === 'cambio_publicitario' || r.type === 'ficha_establecimiento').map((req) => {
                        const stepInfo = REQUEST_STEPS.find(s => s.id === req.status) || REQUEST_STEPS[0];
                        return (
                          <div 
                            key={req.id}
                            className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-xs space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                                {req.type === 'ficha_establecimiento' ? (
                                  <>
                                    <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>Actualización de Ficha Comercial</span>
                                  </>
                                ) : (
                                  <>
                                    <Radio className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>{`Canal: ${req.channel === 'publicidad_radial' ? 'Radio 105.5 FM' : req.channel === 'publicidad_redes' ? 'Redes Sociales' : 'Radio & Redes'}`}</span>
                                  </>
                                )}
                              </span>
                              <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-lg uppercase tracking-wider border ${stepInfo.badgeClass}`}>
                                Paso: {stepInfo.label}
                              </span>
                            </div>

                            <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                              {req.title}
                            </h4>

                            <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line">
                              {req.description}
                            </p>

                            {req.adminNotes && (
                              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs">
                                <span className="font-bold text-emerald-600 dark:text-[#00DD9E] block mb-0.5">
                                  Respuesta del Director de Neblina:
                                </span>
                                <p className="text-slate-700 dark:text-slate-300">{req.adminNotes}</p>
                              </div>
                            )}

                            <div className="text-[11px] text-slate-400 pt-1">
                              Registrado el {new Date(req.createdAt).toLocaleDateString('es-VE')} a las {new Date(req.createdAt).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              )}

              {/* ================================================================= */}
              {/* TAB 3: NOTIFICACIÓN DE EVENTOS / JORNADAS / PROMOCIONES           */}
              {/* ================================================================= */}
              {activeTab === 'eventos' && (
                <div className="space-y-4">
                  
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                    <div>
                      <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
                        Notificación de Eventos, Jornadas y Promociones
                      </h3>
                      <p className="text-xs text-slate-500">
                        Infórmenos sobre fechas especiales o promociones para mencionarlas al aire y en redes.
                      </p>
                    </div>

                    <button
                      onClick={() => setIsEventModalOpen(!isEventModalOpen)}
                      className="px-4 py-2 rounded-xl bg-[#00DD9E] text-[#001E4D] text-xs font-black uppercase tracking-wider hover:brightness-105 active:scale-95 transition shadow-sm cursor-pointer flex items-center space-x-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{isEventModalOpen ? 'Cerrar Formulario' : 'Notificar Evento / Promo'}</span>
                    </button>
                  </div>

                  {/* SUB-PANEL INLINE: NOTIFICAR EVENTO / PROMOCIÓN (SIN MODAL SUPERPUESTO) */}
                  {isEventModalOpen && (
                    <div className="p-5 rounded-2xl bg-slate-100 dark:bg-[#001a45] border-2 border-emerald-500/35 shadow-lg space-y-3.5">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
                        <h4 className="font-display font-black text-sm text-slate-900 dark:text-white">
                          Notificar Evento, Jornada o Promoción Especial
                        </h4>
                        <button onClick={() => setIsEventModalOpen(false)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer">
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tipo de Notificación</label>
                            <select
                              value={eventType}
                              onChange={(e) => setEventType(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-800 dark:text-white font-bold"
                            >
                              <option value="promocion">Promoción Especial</option>
                              <option value="evento">Evento / Concierto</option>
                              <option value="jornada">Jornada de Descuentos</option>
                            </select>
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Fecha Programada</label>
                            <input
                              type="date"
                              value={eventDate}
                              onChange={(e) => setEventDate(e.target.value)}
                              required
                              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-800 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Título del Evento o Promo</label>
                            <input
                              type="text"
                              value={eventTitle}
                              onChange={(e) => setEventTitle(e.target.value)}
                              placeholder="ej: Gran Noche Llanera / 2x1"
                              required
                              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-800 dark:text-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Descripción Completa</label>
                          <textarea
                            value={eventDesc}
                            onChange={(e) => setEventDesc(e.target.value)}
                            placeholder="Detalles del evento, artistas, promociones y condiciones para anunciarlo al aire..."
                            rows={3}
                            required
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-800 dark:text-white resize-none"
                          />
                        </div>

                        <div className="pt-1 flex justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => setIsEventModalOpen(false)}
                            className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white font-bold cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 rounded-xl bg-[#00DD9E] text-[#001E4D] font-black uppercase tracking-wider cursor-pointer"
                          >
                            Notificar a Neblina
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Listado de Eventos / Promociones Notificados */}
                  {requests.filter(r => r.type === 'evento_promocion').length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                      <p className="text-sm font-bold">No ha notificado eventos o promociones especiales aún.</p>
                      <p className="text-xs mt-1">Avísenos con anticipación para incluirlo en la pauta de transmisión.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {requests.filter(r => r.type === 'evento_promocion').map((ev) => {
                        const stepInfo = REQUEST_STEPS.find(s => s.id === ev.status) || REQUEST_STEPS[0];
                        return (
                          <div 
                            key={ev.id}
                            className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-xs space-y-2.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-slate-500 flex items-center space-x-1">
                                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                                <span>Fecha: {ev.targetDate || 'A convenir'}</span>
                              </span>
                              <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-lg uppercase tracking-wider border ${stepInfo.badgeClass}`}>
                                {stepInfo.label}
                              </span>
                            </div>

                            <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                              {ev.title}
                            </h4>

                            <p className="text-xs text-slate-600 dark:text-slate-300">
                              {ev.description}
                            </p>

                            {ev.adminNotes && (
                              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs">
                                <span className="font-bold text-emerald-600 dark:text-[#00DD9E] block mb-0.5">
                                  Respuesta de Cabina:
                                </span>
                                <p className="text-slate-700 dark:text-slate-300">{ev.adminNotes}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              )}

              {/* ================================================================= */}
              {/* TAB 4: FACTURACIÓN & PAGOS (PENDIENTES Y COBRADAS)                  */}
              {/* ================================================================= */}
              {activeTab === 'facturacion' && (
                <div className="space-y-5 animate-fadeIn">

                  {/* Banner de Tasas Oficiales BCV con Calculadora Interactiva de Conversión */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-slate-100/80 to-sky-500/10 dark:from-emerald-500/10 dark:via-white/5 dark:to-sky-500/10 border border-emerald-500/30 backdrop-blur-md flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-[#00DD9E]">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            Tasas Oficiales BCV del Día ({bcvRates.fechaValor || 'Hoy'})
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-[#00DD9E]">
                            Oficial
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 text-xs font-black text-slate-900 dark:text-white mt-1">
                          <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-[#00DD9E] border border-emerald-500/20 font-mono">
                            USD $: {bcvRates.usd.toFixed(2)} Bs.
                          </span>
                          <span className="px-2.5 py-0.5 rounded-lg bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/20 font-mono">
                            EUR €: {bcvRates.eur.toFixed(2)} Bs.
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Calculadora Interactiva con Conversión a Bolívares */}
                    <div className="flex items-center flex-wrap gap-2 bg-white dark:bg-[#001438] p-2 rounded-xl border border-slate-200 dark:border-white/15">
                      <span className="text-[11px] font-bold text-slate-500">Calcular:</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={calcAmount}
                        onChange={(e) => setCalcAmount(e.target.value)}
                        className="w-20 px-2 py-1 text-xs font-bold rounded-lg bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white focus:outline-none focus:border-[#00DD9E]"
                        placeholder="Monto"
                        title="Monto en divisas"
                      />
                      <select
                        value={calcCurrency}
                        onChange={(e) => setCalcCurrency(e.target.value)}
                        className="px-2 py-1 text-xs font-black rounded-lg bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-[#00DD9E] cursor-pointer focus:outline-none"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                      </select>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-xs font-mono font-black text-emerald-700 dark:text-[#00DD9E] border border-emerald-500/25">
                        = {calcResult.amountBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs.
                      </span>
                    </div>
                  </div>

                  {/* Aviso Oficial de Cálculo en Bolívares a Tasa BCV del Día de Pago */}
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border-2 border-[#00DD9E]/40 text-xs space-y-2 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-start space-x-2.5">
                        <Calculator className="w-5 h-5 text-emerald-600 dark:text-[#00DD9E] flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-display font-black text-slate-900 dark:text-white block text-sm">
                            Cálculo Automático en Bolívares a Tasa Oficial BCV del Día de Pago
                          </span>
                          <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                            El monto en <strong>Bolívares (Bs.)</strong> a transferir o pagar por Pago Móvil se calcula automáticamente según la <strong>tasa oficial vigente del Banco Central de Venezuela (BCV) el día en que se realice el pago</strong> ({bcvRates.date || 'Hoy'}).
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-black/30 border border-emerald-500/30 font-mono font-black text-emerald-700 dark:text-[#00DD9E]">
                          USD: {Number(bcvRates.usd).toFixed(2)} Bs.
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-black/30 border border-sky-500/30 font-mono font-black text-sky-700 dark:text-sky-300">
                          EUR: {Number(bcvRates.eur).toFixed(2)} Bs.
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Resumen de Facturación */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(() => {
                      const pendingUsd = invoices.filter(i => i.status === 'pendiente').reduce((acc, curr) => acc + curr.amountUsd, 0);
                      const pendingBs = (pendingUsd * bcvRates.usd).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                      const paidUsd = invoices.filter(i => i.status === 'cobrada').reduce((acc, curr) => acc + curr.amountUsd, 0);
                      const paidBs = (paidUsd * bcvRates.usd).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                      return (
                        <>
                          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                              Facturas Pendientes por Cancelar
                            </span>
                            <p className="font-display font-black text-2xl text-slate-900 dark:text-white mt-0.5">
                              ${pendingUsd.toFixed(2)} USD
                            </p>
                            <p className="text-xs font-black text-amber-700 dark:text-amber-300 mt-0.5">
                              Monto a Transferir Hoy (Tasa BCV): {pendingBs} Bs.
                            </p>
                            <p className="text-[11px] text-slate-500 mt-1">
                              {invoices.filter(i => i.status === 'pendiente').length} factura(s) pendiente(s)
                            </p>
                          </div>

                          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-[#00DD9E]">
                              Facturas Canceladas / Al Día
                            </span>
                            <p className="font-display font-black text-2xl text-slate-900 dark:text-white mt-0.5">
                              ${paidUsd.toFixed(2)} USD
                            </p>
                            <p className="text-xs font-bold text-emerald-700 dark:text-[#00DD9E] mt-0.5">
                              Equivalente Ref. BCV: {paidBs} Bs.
                            </p>
                            <p className="text-[11px] text-slate-500 mt-1">
                              {invoices.filter(i => i.status === 'cobrada').length} recibo(s) cancelado(s)
                            </p>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Panel Inline de Recibo / Comprobante Digital */}
                  {viewingInvoice && (
                    <div className="p-5 sm:p-6 rounded-2xl bg-white text-slate-900 border-2 border-[#00DD9E] shadow-xl space-y-4 animate-fadeIn">
                      {/* Cabecera del Recibo */}
                      <div className="flex items-center justify-between border-b pb-4">
                        <div className="flex items-center space-x-2">
                          <img src="./logo-tight.svg" alt="Neblina 105.5 FM" className="h-8 w-auto" />
                          <div>
                            <h4 className="font-display font-black text-sm text-slate-900">Neblina Stereo 105.5 FM</h4>
                            <p className="text-[11px] text-slate-500">Santo Domingo - Mérida, Venezuela</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-xs text-emerald-700 block">{viewingInvoice.id}</span>
                          <span className="text-[11px] text-slate-400">Emisión: {viewingInvoice.issueDate}</span>
                        </div>
                      </div>

                      {/* Datos del Cliente */}
                      <div className="p-3 rounded-xl bg-slate-50 border text-xs space-y-0.5">
                        <p className="font-bold text-slate-800">{viewingInvoice.businessName}</p>
                        <p className="text-slate-500">RIF: {viewingInvoice.businessRif || 'No indicado'}</p>
                        <p className="text-slate-500">Concepto: {viewingInvoice.concept}</p>
                      </div>

                      {/* Desglose de Ítems */}
                      <div className="space-y-1.5 text-xs">
                        <span className="font-bold text-slate-700 block">Detalle de la Pauta:</span>
                        {viewingInvoice.items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between border-b border-slate-100 py-1">
                            <span>{item.description}</span>
                            <span className="font-bold">${item.totalUsd?.toFixed(2)} USD ({(item.totalUsd * bcvRates.usd).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs.)</span>
                          </div>
                        ))}
                      </div>

                      {/* Totalización */}
                      <div className="pt-2 border-t flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <div>
                          <span className="text-xs text-slate-500 block">Estado de Factura:</span>
                          <span className={`text-xs font-black uppercase ${viewingInvoice.status === 'cobrada' ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {viewingInvoice.status === 'cobrada' ? 'Factura Cancelada' : 'Factura Pendiente por Pagar'}
                          </span>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            * El monto en Bolívares se calcula a la tasa BCV del día en que realice su pago ({Number(bcvRates.usd).toFixed(2)} Bs/$).
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-display font-black text-lg text-slate-900 block">
                            ${viewingInvoice.amountUsd.toFixed(2)} USD
                          </span>
                          <span className="text-sm font-black text-emerald-700 block">
                            Monto en Bs. Hoy (Tasa USD BCV): {(viewingInvoice.amountUsd * bcvRates.usd).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs.
                          </span>
                          <span className="text-[11px] font-bold text-sky-700 block">
                            Ref. si aplica Tasa EUR BCV: {(viewingInvoice.amountUsd * bcvRates.eur).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs.
                          </span>
                        </div>
                      </div>

                      {/* Datos Bancarios Asociados a esta Factura con Botones de Copiar */}
                      {(() => {
                        const invBank = viewingInvoice.paymentDetails || bankProfiles[0];
                        if (!invBank) return null;
                        const isAccCopied = copiedField === `inv-acc-${invBank.id}`;
                        const isPmCopied = copiedField === `inv-pm-${invBank.id}`;
                        const isHoldCopied = copiedField === `inv-hold-${invBank.id}`;

                        return (
                          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                            <span className="font-black text-slate-900 block border-b border-slate-200 pb-1">
                              Datos de Cuenta Receptora para esta Factura ({invBank.label}):
                            </span>
                            
                            <p className="text-slate-800 font-bold">
                              {invBank.bankName}
                            </p>

                            {/* Número de cuenta */}
                            {invBank.accountNumber && (
                              <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-white border border-slate-200">
                                <div>
                                  <span className="text-[10px] uppercase font-bold text-slate-400 block">N° de Cuenta (Transferencia)</span>
                                  <span className="font-mono text-xs font-black text-slate-900">{invBank.accountNumber}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleCopyText(invBank.accountNumber, `inv-acc-${invBank.id}`)}
                                  className={`flex items-center space-x-1 px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                                    isAccCopied ? 'bg-emerald-500 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                  }`}
                                >
                                  {isAccCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                  <span>{isAccCopied ? 'Copiado' : 'Copiar Cuenta'}</span>
                                </button>
                              </div>
                            )}

                            {/* Pago Móvil */}
                            <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-white border border-slate-200">
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Pago Móvil (Teléfono y Documento)</span>
                                <span className="font-mono text-xs font-black text-slate-900">{invBank.phone} · {invBank.cedulaRif}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopyText(`${invBank.phone} ${invBank.cedulaRif}`, `inv-pm-${invBank.id}`)}
                                className={`flex items-center space-x-1 px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                                  isPmCopied ? 'bg-emerald-500 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                }`}
                              >
                                {isPmCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                <span>{isPmCopied ? 'Copiado' : 'Copiar Pago Móvil'}</span>
                              </button>
                            </div>

                            {/* Titular */}
                            <div className="flex items-center justify-between gap-2 pt-0.5">
                              <span className="text-slate-600 text-[11px]">
                                <strong>Titular:</strong> {invBank.holderName}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyText(invBank.holderName, `inv-hold-${invBank.id}`)}
                                className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                                  isHoldCopied ? 'bg-emerald-500 text-white' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
                                }`}
                              >
                                {isHoldCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                <span>{isHoldCopied ? 'Copiado' : 'Copiar'}</span>
                              </button>
                            </div>

                          </div>
                        );
                      })()}

                      {/* Alerta Roja Obligatoria */}
                      <div className="p-3 rounded-xl bg-rose-50 border-2 border-rose-500 text-rose-700 text-xs font-black leading-snug flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                        <span>ALERTA IMPORTANTE: Verifique siempre los datos de pago antes de realizar su transferencia o Pago Móvil, ya que las cuentas receptoras pueden variar. El pago en Bolívares se calcula a la tasa oficial del BCV del día en que se efectúe el pago.</span>
                      </div>

                      {/* Botones de Acción */}
                      <div className="pt-2 flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 transition cursor-pointer flex items-center space-x-1"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Imprimir / PDF</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewingInvoice(null)}
                          className="px-4 py-2 rounded-xl bg-[#001E4D] text-white text-xs font-bold transition cursor-pointer"
                        >
                          Cerrar Recibo
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Listado de Facturas */}
                  <div className="space-y-3">
                    <h4 className="font-display font-black text-sm text-slate-900 dark:text-white">
                      Registro Detallado de Facturas (Cálculo Automático a Tasa BCV del Día)
                    </h4>

                    {invoices.length === 0 ? (
                      <div className="p-8 text-center text-slate-500">
                        <p className="text-sm font-bold">No tiene facturas emitidas por los momentos.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {invoices.map((inv) => {
                          const isPaid = inv.status === 'cobrada';
                          const isCurrencyEur = inv.currency === 'EUR';
                          const activeRate = isCurrencyEur ? bcvRates.eur : bcvRates.usd;
                          const approxBs = (inv.amountUsd * activeRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                          const approxBsEur = (inv.amountUsd * bcvRates.eur).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                          return (
                            <div 
                              key={inv.id}
                              className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <span className="font-display font-black text-sm text-slate-900 dark:text-white">
                                    {inv.id}
                                  </span>
                                  <span className={`text-[11px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider ${
                                    isPaid 
                                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-[#00DD9E]' 
                                      : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                                  }`}>
                                    {isPaid ? 'Cancelada / Cobrada' : 'Pendiente por Pagar'}
                                  </span>
                                </div>
                                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                  {inv.concept}
                                </p>
                                <p className="text-[11px] text-slate-500">
                                  Emisión: {inv.issueDate} · Vence: {inv.dueDate} {isPaid && `· Pagada: ${inv.paymentReference || 'Conciliada'}`}
                                </p>
                                <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                                  * Monto en Bolívares calculado a la tasa oficial del BCV del día de pago ({Number(activeRate).toFixed(2)} Bs.).
                                </p>
                              </div>

                              <div className="flex items-center space-x-3 self-end md:self-center">
                                <div className="text-right">
                                  <span className="font-display font-black text-base text-slate-900 dark:text-white block">
                                    ${inv.amountUsd.toFixed(2)} {isCurrencyEur ? 'EUR' : 'USD'}
                                  </span>
                                  <span className="text-xs font-black text-emerald-600 dark:text-[#00DD9E] block">
                                    Monto a Transferir Hoy: {approxBs} Bs. (BCV)
                                  </span>
                                  <span className="text-[11px] font-semibold text-slate-400 block">
                                    Ref. Tasa EUR BCV: {approxBsEur} Bs.
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setViewingInvoice(viewingInvoice?.id === inv.id ? null : inv)}
                                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-xs font-bold text-slate-800 dark:text-white transition cursor-pointer"
                                  title="Ver y Descargar Factura / Comprobante"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>{viewingInvoice?.id === inv.id ? 'Ocultar Recibo' : 'Ver Recibo'}</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Alerta Roja Obligatoria de Variación de Cuentas Bancarias */}
                  <div className="p-4 rounded-xl bg-rose-600/15 border-2 border-rose-500 text-rose-700 dark:text-rose-300 text-xs font-black flex items-start space-x-2.5 shadow-sm">
                    <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                    <span>
                      ALERTA IMPORTANTE: Verifique siempre los datos de pago antes de realizar su transferencia o Pago Móvil, ya que las cuentas receptoras pueden variar.
                    </span>
                  </div>

                  {/* Perfiles Oficiales de Cuentas Bancarias y Pago Móvil con Botones de Copiado Individuales */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-xs space-y-3">
                    <span className="font-black text-slate-900 dark:text-white flex items-center space-x-1.5">
                      <Landmark className="w-4 h-4 text-emerald-500" />
                      <span>Cuentas Oficiales Habilitadas para Pago Móvil & Transferencia:</span>
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {bankProfiles.map(bp => {
                        const isAccountCopied = copiedField === `account-${bp.id}`;
                        const isPagoCopied = copiedField === `pago-${bp.id}`;
                        const isHolderCopied = copiedField === `holder-${bp.id}`;

                        return (
                          <div key={bp.id} className="p-3.5 rounded-xl bg-white dark:bg-black/25 border border-slate-200 dark:border-white/10 space-y-2 relative shadow-xs">
                            <span className="font-black text-emerald-600 dark:text-[#00DD9E] block text-xs border-b border-slate-100 dark:border-white/10 pb-1">
                              {bp.label}
                            </span>
                            
                            <p className="font-bold text-slate-900 dark:text-white text-xs">
                              {bp.bankName}
                            </p>

                            {/* Número de Cuenta con Botón de Copiar */}
                            {bp.accountNumber && (
                              <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
                                <div className="min-w-0">
                                  <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">
                                    N° de Cuenta (Transferencia)
                                  </span>
                                  <span className="font-mono text-xs font-black text-slate-800 dark:text-slate-100 truncate block">
                                    {bp.accountNumber}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleCopyText(bp.accountNumber, `account-${bp.id}`)}
                                  className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition flex-shrink-0 cursor-pointer ${
                                    isAccountCopied
                                      ? 'bg-emerald-500 text-white shadow-xs'
                                      : 'bg-slate-200/80 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200'
                                  }`}
                                  title="Copiar número de cuenta bancaria"
                                >
                                  {isAccountCopied ? (
                                    <>
                                      <Check className="w-3 h-3 text-white" />
                                      <span>Copiado</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>Copiar Cuenta</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            )}

                            {/* Datos de Pago Móvil con Botón de Copiar */}
                            <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
                              <div className="min-w-0">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">
                                  Pago Móvil (Teléfono + Cédula/RIF)
                                </span>
                                <span className="font-mono text-xs font-black text-slate-800 dark:text-slate-100 truncate block">
                                  {bp.phone} · {bp.cedulaRif}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopyText(`${bp.phone} ${bp.cedulaRif}`, `pago-${bp.id}`)}
                                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition flex-shrink-0 cursor-pointer ${
                                  isPagoCopied
                                    ? 'bg-emerald-500 text-white shadow-xs'
                                    : 'bg-slate-200/80 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200'
                                }`}
                                title="Copiar teléfono y documento para Pago Móvil"
                              >
                                {isPagoCopied ? (
                                  <>
                                    <Check className="w-3 h-3 text-white" />
                                    <span>Copiado</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copiar Pago Móvil</span>
                                  </>
                                )}
                              </button>
                            </div>

                            {/* Titular con Botón de Copiar */}
                            <div className="flex items-center justify-between gap-2 pt-0.5">
                              <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                                <span className="text-slate-400 font-semibold">Titular:</span> <strong className="text-slate-800 dark:text-slate-100">{bp.holderName}</strong>
                              </p>
                              <button
                                type="button"
                                onClick={() => handleCopyText(bp.holderName, `holder-${bp.id}`)}
                                className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold transition flex-shrink-0 cursor-pointer ${
                                  isHolderCopied
                                    ? 'bg-emerald-500 text-white'
                                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
                                }`}
                                title="Copiar nombre del titular de la cuenta"
                              >
                                {isHolderCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                <span>{isHolderCopied ? 'Copiado' : 'Copiar'}</span>
                              </button>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                    
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                      Una vez realizado su pago, puede notificar la referencia por el chat interno con el Director.
                    </p>
                  </div>

                </div>
              )}

              {/* ================================================================= */}
              {/* TAB 5: CHAT INTERNO DIRECTO CON EL DIRECTOR                       */}
              {/* ================================================================= */}
              {activeTab === 'mensajes' && (
                <div className="flex flex-col h-[480px]">
                  
                  {/* Encabezado del Chat */}
                  <div className="pb-3 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#00DD9E] shadow-[0_0_8px_rgba(0,221,158,0.6)]" />
                      <div>
                        <h4 className="font-display font-black text-xs text-slate-900 dark:text-white">
                          Dirección General Neblina Stereo 105.5 FM
                        </h4>
                        <p className="text-[11px] text-slate-500">Enlace directo privado de cabina</p>
                      </div>
                    </div>
                  </div>

                  {/* Lista de Mensajes con Scroll */}
                  <div className="flex-1 overflow-y-auto py-4 space-y-3">
                    {messages.length === 0 ? (
                      <div className="text-center text-slate-500 py-12 text-xs font-medium">
                        No hay mensajes registrados. Escriba un mensaje para comunicarse con el Director.
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isMe = msg.sender === 'cliente';
                        return (
                          <div 
                            key={msg.id}
                            className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                          >
                            <span className="text-[11px] font-bold text-slate-400 mb-0.5 px-1">
                              {msg.senderName} · {new Date(msg.timestamp).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <div className={`p-3 rounded-2xl max-w-sm sm:max-w-md text-xs font-medium whitespace-pre-wrap ${
                              isMe 
                                ? 'bg-[#001E4D] text-[#00DD9E] dark:bg-[#00DD9E] dark:text-[#001E4D] rounded-tr-xs' 
                                : 'bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-100 rounded-tl-xs'
                            }`}>
                              {msg.text}
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Input de Mensaje */}
                  <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center space-x-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Escriba su mensaje al Director de Neblina..."
                      className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#00DD9E]"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim()}
                      className="px-4 py-2.5 rounded-2xl bg-[#00DD9E] text-[#001E4D] hover:brightness-105 active:scale-95 transition cursor-pointer disabled:opacity-50"
                      aria-label="Enviar mensaje"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>

                </div>
              )}

            </div>

              </div>
            </div>


        {/* MODAL / LIGHTBOX DE PREVISUALIZACIÓN DE IMÁGENES EN GRAN TAMAÑO */}
        {imagePreviewModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
            <div 
              className="fixed inset-0"
              onClick={() => setImagePreviewModal(null)}
            />
            <div className="relative z-10 max-w-4xl max-h-[90vh] bg-slate-900 border border-white/20 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
              <div className="p-3 sm:p-4 bg-slate-950/80 border-b border-white/10 flex items-center justify-between gap-3 text-white">
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#00DD9E] block">
                    {imagePreviewModal.category || 'Material Publicitario'} · {imagePreviewModal.channelType ? imagePreviewModal.channelType.toUpperCase() : 'WEB'}
                  </span>
                  <h3 className="font-display font-bold text-sm truncate">
                    {imagePreviewModal.name}
                  </h3>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <a
                    href={imagePreviewModal.url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-[#001E4D] font-black text-xs transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar Original</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setImagePreviewModal(null)}
                    className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-3 sm:p-5 flex items-center justify-center bg-black/50 overflow-auto max-h-[75vh]">
                <img
                  src={imagePreviewModal.url}
                  alt={imagePreviewModal.name}
                  className="max-h-[70vh] max-w-full w-auto h-auto object-contain rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        )}

          </div>
        )}

      </div>

    </div>
  );
}
