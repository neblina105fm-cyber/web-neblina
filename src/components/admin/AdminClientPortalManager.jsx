import React, { useState, useEffect, useRef } from 'react';
import { 
  Key, 
  Lock, 
  User, 
  ShieldCheck, 
  Music, 
  Image as ImageIcon, 
  Film, 
  Calendar, 
  FileText, 
  MessageSquare, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Building2, 
  DollarSign, 
  Download, 
  Play, 
  Pause, 
  ExternalLink, 
  Copy, 
  Check, 
  Send, 
  RefreshCw, 
  Eye, 
  Archive, 
  ArrowRight,
  Radio,
  Share2,
  Printer,
  Bell,
  Receipt,
  X
} from 'lucide-react';
import Emoji3D from '../Emoji3D';
import { 
  getAllClientUsers, 
  saveAllClientUsers, 
  setClientCredentials,
  getAllClientAssets,
  saveAllClientAssets,
  addClientAsset,
  toggleAssetValidity,
  deleteClientAsset,
  getAllRequests,
  updateRequestStep,
  approveClientProfileRequest,
  getAllInvoices,
  createInvoice,
  markInvoicePaid,
  deleteInvoice,
  getAllInternalMessages,
  sendInternalMessage,
  markMessagesReadForClient,
  toggleClientAdStatus,
  getClientNotifications,
  createClientNotification,
  runAutomatedPaymentNotifications,
  REQUEST_STEPS
} from '../../services/clientPortalService';
import { getAllClients, saveClient, getAllBankProfiles } from '../../services/radioClientsService';
import { getCachedBcvRates } from '../../services/bcvService';

export default function AdminClientPortalManager({ onShowToast, onOpenClientPortalForClient }) {
  // Sub-pestaña activa en el gestor:
  // 'accesos' | 'material' | 'solicitudes' | 'facturacion' | 'mensajeria'
  const [subTab, setSubTab] = useState('accesos');

  const [clients, setClients] = useState(() => getAllClients().filter(c => !c.trashed));
  const [users, setUsers] = useState(() => getAllClientUsers());
  const [assets, setAssets] = useState(() => getAllClientAssets());
  const [requests, setRequests] = useState(() => getAllRequests());
  const [invoices, setInvoices] = useState(() => getAllInvoices());
  const [messages, setMessages] = useState(() => getAllInternalMessages());
  const [notifications, setNotifications] = useState(() => getClientNotifications());
  const [bankProfiles, setBankProfiles] = useState(() => getAllBankProfiles());
  const [bcvRates, setBcvRates] = useState(() => getCachedBcvRates());

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('all');
  const [selectedChannelType, setSelectedChannelType] = useState('all'); // 'all' | 'web' | 'radial' | 'redes'

  // Scroll suave para sub-paneles inline
  const scrollToSubpanel = (id) => {
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 60);
  };

  // Modal para editar / asignar credenciales
  const [isCredModalOpen, setIsCredModalOpen] = useState(false);
  const [editingCred, setEditingCred] = useState({
    clientId: '',
    businessName: '',
    username: '',
    password: '',
    accessActive: true
  });
  const [copiedKeyId, setCopiedKeyId] = useState(null);

  // Modal para registrar nuevo cliente comercial
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [newClientData, setNewClientData] = useState({
    businessName: '',
    businessRif: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    username: '',
    password: ''
  });

  // Modal para anexar material publicitario (Audio, Foto, Video)
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [assetForm, setAssetForm] = useState({
    clientId: '',
    type: 'audio', // 'audio' | 'photo' | 'video'
    channelType: 'radial', // 'web' | 'radial' | 'redes'
    name: '',
    url: '',
    thumbnailUrl: '',
    uploadedAt: new Date().toISOString().split('T')[0],
    status: 'vigente',
    duration: '0:30',
    category: 'Cuña Rotativa',
    notes: ''
  });

  // Reproductor de audio para el director
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const audioRef = useRef(null);

  // Modal para emitir nueva factura
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    clientId: '',
    concept: 'Pauta Publicitaria Mensual: Cuñas Rotativas + Redes',
    amountUsd: 50,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    bankProfileId: getAllBankProfiles()[0]?.id || '',
    notes: ''
  });

  // Chat con cliente
  const [chatClientId, setChatClientId] = useState('');
  const [directorChatText, setDirectorChatText] = useState('');
  const chatBottomRef = useRef(null);

  // Modal comprobante
  const [viewingReceipt, setViewingReceipt] = useState(null);

  const refreshAll = () => {
    setClients(getAllClients().filter(c => !c.trashed));
    setUsers(getAllClientUsers());
    setAssets(getAllClientAssets());
    setRequests(getAllRequests());
    setInvoices(getAllInvoices());
    setMessages(getAllInternalMessages());
    setNotifications(getClientNotifications());
    setBankProfiles(getAllBankProfiles());
    setBcvRates(getCachedBcvRates());
  };

  useEffect(() => {
    const handleUpdate = () => refreshAll();
    window.addEventListener('neblina_portal_updated', handleUpdate);
    window.addEventListener('neblina_clients_updated', handleUpdate);
    return () => {
      window.removeEventListener('neblina_portal_updated', handleUpdate);
      window.removeEventListener('neblina_clients_updated', handleUpdate);
    };
  }, []);

  // Seleccionar primer cliente por defecto para el chat
  useEffect(() => {
    if (!chatClientId && clients.length > 0) {
      setChatClientId(clients[0].id);
    }
  }, [clients]);

  // Scroll en el chat
  useEffect(() => {
    if (subTab === 'mensajeria' && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, chatClientId, subTab]);

  // Manejar apertura de credenciales
  const handleOpenCredentials = (client) => {
    const userObj = users.find(u => String(u.clientId) === String(client.id));
    const autoUser = (client.businessName || 'cliente')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 15);

    setEditingCred({
      clientId: client.id,
      businessName: client.businessName,
      username: userObj?.username || autoUser || `cli_${client.id}`,
      password: userObj?.password || 'neblina105',
      accessActive: userObj?.accessActive !== false
    });
    setIsCredModalOpen(true);
    scrollToSubpanel('cred-form-inline');
  };

  // Abrir modal de creación de cliente
  const handleOpenCreateClient = () => {
    setNewClientData({
      businessName: '',
      businessRif: '',
      phone: '',
      whatsapp: '',
      email: '',
      address: '',
      username: '',
      password: 'cli' + Math.floor(1000 + Math.random() * 9000)
    });
    setIsNewClientModalOpen(true);
  };

  // Guardar nuevo cliente comercial y asignarle credenciales inmediatas
  const handleSaveNewClient = (e) => {
    e.preventDefault();
    if (!newClientData.businessName.trim()) {
      alert('Por favor introduce el nombre del comercio o cliente.');
      return;
    }

    const clientId = `cli_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const uName = newClientData.username.trim() || newClientData.businessName.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 15);
    const uPass = newClientData.password.trim() || 'neblina105';

    saveClient({
      id: clientId,
      businessName: newClientData.businessName.trim(),
      businessRif: newClientData.businessRif.trim(),
      phone: newClientData.phone.trim(),
      whatsapp: newClientData.whatsapp.trim() || newClientData.phone.trim(),
      email: newClientData.email.trim(),
      address: newClientData.address.trim(),
      adStatus: 'active',
      status: 'active'
    });

    setClientCredentials(clientId, {
      username: uName,
      password: uPass,
      accessActive: true,
      businessName: newClientData.businessName.trim()
    });

    setIsNewClientModalOpen(false);
    refreshAll();
    if (onShowToast) onShowToast(`¡Cliente "${newClientData.businessName}" creado con credenciales activas!`);
  };

  // Guardar credenciales
  const handleSaveCredentials = (e) => {
    e.preventDefault();
    setClientCredentials(editingCred.clientId, {
      username: editingCred.username,
      password: editingCred.password,
      accessActive: editingCred.accessActive,
      businessName: editingCred.businessName
    });
    setIsCredModalOpen(false);
    refreshAll();
    if (onShowToast) onShowToast('Credenciales del cliente guardadas con éxito');
  };

  // Copiar mensaje para WhatsApp con claves
  const handleCopyWhatsAppCredentials = (client) => {
    const userObj = users.find(u => String(u.clientId) === String(client.id));
    const uName = userObj?.username || 'Asignado';
    const uPass = userObj?.password || 'Asignado';
    const siteUrl = window.location.origin;

    const message = `🎙️ *Neblina Stereo 105.5 FM - Acceso a su Portal de Cliente*\n\nEstimado aliado comercial de *${client.businessName}*:\nYa puede ingresar a su portal exclusivo para escuchar y descargar sus cuñas radiales, revisar facturas en Bolívares y Dólares y solicitar cambios de pauta.\n\n🌐 *Portal:* ${siteUrl}\n👤 *Usuario:* ${uName}\n🔑 *Contraseña:* ${uPass}\n\nAnte cualquier duda estamos a su orden por esta vía.`;

    navigator.clipboard.writeText(message);
    setCopiedKeyId(client.id);
    setTimeout(() => setCopiedKeyId(null), 2500);
    if (onShowToast) onShowToast('Mensaje de acceso copiado para WhatsApp');
  };

  // Conmutar Pauta Activa / Inactiva
  const handleToggleAdStatus = (client) => {
    const newStatus = toggleClientAdStatus(client.id);
    refreshAll();
    if (onShowToast) onShowToast(`Publicidad de ${client.businessName}: ${newStatus === 'active' ? 'ACTIVA' : 'PAUSADA'}`);
  };

  // Guardar nuevo material
  const handleSaveAsset = (e) => {
    e.preventDefault();
    if (!assetForm.clientId || !assetForm.name || !assetForm.url) {
      if (onShowToast) onShowToast('Complete los campos obligatorios del archivo');
      return;
    }

    addClientAsset(assetForm.clientId, {
      type: assetForm.type,
      channelType: assetForm.channelType,
      name: assetForm.name,
      url: assetForm.url,
      thumbnailUrl: assetForm.thumbnailUrl,
      uploadedAt: assetForm.uploadedAt ? new Date(assetForm.uploadedAt).toISOString() : new Date().toISOString(),
      status: assetForm.status,
      duration: assetForm.duration,
      category: assetForm.category,
      notes: assetForm.notes
    });

    setIsAssetModalOpen(false);
    setAssetForm({
      clientId: clients[0]?.id || '',
      type: 'audio',
      channelType: 'radial',
      name: '',
      url: '',
      thumbnailUrl: '',
      uploadedAt: new Date().toISOString().split('T')[0],
      status: 'vigente',
      duration: '0:30',
      category: 'Cuña Rotativa',
      notes: ''
    });
    refreshAll();
    if (onShowToast) onShowToast('Archivo publicitario anexado con éxito');
  };

  // Reproducir audio
  const handleToggleDirectorAudio = (asset) => {
    if (playingAudioId === asset.id) {
      if (audioRef.current) {
        if (audioRef.current.paused) {
          audioRef.current.play();
        } else {
          audioRef.current.pause();
        }
      }
    } else {
      setPlayingAudioId(asset.id);
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.src = asset.url;
          audioRef.current.play().catch(e => console.warn('Audio play error:', e));
        }
      }, 50);
    }
  };

  // Emitir Factura
  const handleCreateInvoiceSubmit = (e) => {
    e.preventDefault();
    const targetCli = clients.find(c => String(c.id) === String(invoiceForm.clientId));
    if (!targetCli) return;

    const selectedBank = bankProfiles.find(b => b.id === invoiceForm.bankProfileId) || bankProfiles[0] || null;

    createInvoice({
      clientId: targetCli.id,
      businessName: targetCli.businessName,
      businessRif: targetCli.businessRif,
      concept: invoiceForm.concept,
      amountUsd: Number(invoiceForm.amountUsd),
      issueDate: invoiceForm.issueDate,
      dueDate: invoiceForm.dueDate,
      bankProfileId: selectedBank ? selectedBank.id : '',
      paymentDetails: selectedBank,
      notes: invoiceForm.notes
    });

    setIsInvoiceModalOpen(false);
    refreshAll();
    if (onShowToast) onShowToast('Factura emitida y notificada al cliente');
  };

  // Enviar notificación manual de pago / cobro a un cliente
  const handleSendManualPaymentNotification = (client, type) => {
    if (!client) return;
    createClientNotification({
      clientId: client.id,
      businessName: client.businessName,
      type,
      amountUsd: client.amountUsd || 50,
      dueDate: new Date().toISOString().split('T')[0],
      autoGenerated: false,
      postToChat: true
    });
    refreshAll();
    const labelMap = {
      upcoming: 'Pronto Vencimiento',
      due_today: 'Día de Pago Hoy',
      overdue: 'Pago Atrasado / En Mora'
    };
    if (onShowToast) onShowToast(`Alerta "${labelMap[type]}" enviada a ${client.businessName}`);
  };

  // Ejecutar chequeo automático de vencimientos de todos los clientes
  const handleRunAutoNotificationsCheck = () => {
    const generated = runAutomatedPaymentNotifications();
    refreshAll();
    if (onShowToast) {
      onShowToast(
        generated.length > 0
          ? `Se emitieron ${generated.length} alerta(s) automática(s) de vencimiento`
          : 'Chequeo completado: Todas las alertas del día ya fueron emitidas'
      );
    }
  };

  // Marcar Factura como Pagada
  
  // Eliminar Factura definitivamente
  const handleDeleteInvoice = (inv) => {
    if (window.confirm(`¿Eliminar definitivamente la factura ${inv.id} de ${inv.businessName}? Esta acción no se puede deshacer.`)) {
      deleteInvoice(inv.id);
      refreshAll();
      if (onShowToast) onShowToast(`Factura ${inv.id} eliminada permanentemente`);
    }
  };

  const handleMarkInvoicePaid = (inv) => {
    const ref = prompt('Ingrese el número de referencia bancaria o detalle de pago:', 'Pago Móvil BCV');
    if (ref !== null) {
      markInvoicePaid(inv.id, { reference: ref });
      refreshAll();
      if (onShowToast) onShowToast(`Factura ${inv.id} marcada como COBRADA`);
    }
  };

  // Enviar mensaje del Director al cliente
  const handleSendDirectorMessage = (e) => {
    e.preventDefault();
    if (!directorChatText.trim() || !chatClientId) return;

    sendInternalMessage({
      clientId: chatClientId,
      sender: 'director',
      senderName: 'Director de Neblina 105.5 FM',
      text: directorChatText.trim()
    });

    setDirectorChatText('');
    setMessages(getAllInternalMessages());
  };

  // Filtrado de materiales
  const filteredAssets = assets.filter(a => {
    if (selectedClientId !== 'all' && String(a.clientId) !== String(selectedClientId)) return false;
    if (selectedChannelType !== 'all') {
      const ch = a.channelType || (a.type === 'audio' ? 'radial' : 'web');
      if (ch !== selectedChannelType) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (a.name || '').toLowerCase().includes(q) || (a.category || '').toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Audio oculto */}
      <audio ref={audioRef} onEnded={() => setPlayingAudioId(null)} className="hidden" />

      {/* ============================================================== */}
      {/* TARJETA / BANNER UNIFICADO INTEGRADO SUPERIOR                  */}
      {/* ============================================================== */}
      <div className="rounded-3xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
        {/* PARTE SUPERIOR: CONTROL DE ACCESOS, DESCRIPCIÓN Y BOTONES DE ACCIÓN */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Key className="w-5 h-5 text-emerald-500" />
              <h4 className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-white">
                Control de Accesos al Portal de Clientes
              </h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Administre cuentas de aliados comerciales, asigne credenciales directas para su ingreso, gestione material publicitario, atienda solicitudes y coordine facturación con tasa BCV.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0 self-start md:self-center">
            {/* Botón "+ Crear Nuevo Cliente" */}
            <button
              type="button"
              onClick={handleOpenCreateClient}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00DD9E] hover:opacity-95 text-slate-950 font-black text-xs transition cursor-pointer shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Crear Nuevo Cliente</span>
            </button>

            {/* Botón "Abrir Portal de Aliados" */}
            <button
              type="button"
              onClick={() => {
                window.open(`${window.location.origin}${window.location.pathname}#clientes`, '_blank', 'noopener,noreferrer');
              }}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#001E4D] text-[#00DD9E] dark:bg-[#00DD9E] dark:text-[#001E4D] text-xs font-black uppercase tracking-wider hover:brightness-105 active:scale-95 transition cursor-pointer shadow-xs whitespace-nowrap"
              title="Abrir portal público de clientes en nueva pestaña"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir Portal de Aliados</span>
            </button>
          </div>
        </div>

        {/* PARTE INFERIOR: SUB-PESTAÑAS / FILTROS INTEGRADAS */}
        <div className="p-2 bg-slate-50/80 dark:bg-black/20 flex flex-wrap gap-1">
          <button
            onClick={() => setSubTab('accesos')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'accesos'
                ? 'bg-[#001E4D] text-[#00DD9E] shadow-sm dark:bg-[#00DD9E] dark:text-[#001E4D]'
                : 'text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Accesos & Claves ({users.length})</span>
          </button>

          <button
            onClick={() => setSubTab('material')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'material'
                ? 'bg-[#001E4D] text-[#00DD9E] shadow-sm dark:bg-[#00DD9E] dark:text-[#001E4D]'
                : 'text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Material Publicitario ({assets.length})</span>
          </button>

          <button
            onClick={() => setSubTab('solicitudes')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'solicitudes'
                ? 'bg-[#001E4D] text-[#00DD9E] shadow-sm dark:bg-[#00DD9E] dark:text-[#001E4D]'
                : 'text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Solicitudes & Eventos ({requests.length})</span>
          </button>

          <button
            onClick={() => setSubTab('facturacion')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'facturacion'
                ? 'bg-[#001E4D] text-[#00DD9E] shadow-sm dark:bg-[#00DD9E] dark:text-[#001E4D]'
                : 'text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Facturación ({invoices.length})</span>
          </button>

          <button
            onClick={() => setSubTab('mensajeria')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'mensajeria'
                ? 'bg-[#001E4D] text-[#00DD9E] shadow-sm dark:bg-[#00DD9E] dark:text-[#001E4D]'
                : 'text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Mensajería Directa ({messages.filter(m => m.sender === 'cliente' && !m.read).length} nuevos)</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. SUB-PESTAÑA: ACCESOS, CLAVES Y ESTADO DE PAUTA             */}
      {/* ============================================================== */}
      {subTab === 'accesos' && (
        <div className="space-y-4">
          {/* INLINE SUB-PANEL: CREAR NUEVO CLIENTE */}
          {isNewClientModalOpen && (
            <div id="new-client-form-inline" className="p-5 sm:p-6 rounded-2xl bg-slate-100 dark:bg-[#1c2633] border-2 border-emerald-500/40 shadow-xl space-y-4 animate-fadeIn my-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center space-x-2.5">
                  <Building2 className="w-5 h-5 text-emerald-500" />
                  <div>
                    <h4 className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-white">
                      Registrar Nuevo Cliente Comercial & Aliado
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Crea la ficha del negocio y asígnale de inmediato su usuario y clave para ingresar al portal
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewClientModalOpen(false)}
                  className="p-1 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveNewClient} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre Comercial del Negocio *</label>
                    <input
                      type="text"
                      placeholder="Ej: Inversiones El Páramo C.A."
                      value={newClientData.businessName}
                      onChange={(e) => setNewClientData(prev => ({ ...prev, businessName: e.target.value }))}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">RIF o Cédula</label>
                    <input
                      type="text"
                      placeholder="Ej: J-12345678-9"
                      value={newClientData.businessRif}
                      onChange={(e) => setNewClientData(prev => ({ ...prev, businessRif: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Teléfono / Celular</label>
                    <input
                      type="text"
                      placeholder="Ej: 0424-7459774"
                      value={newClientData.phone}
                      onChange={(e) => setNewClientData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">WhatsApp Comercial</label>
                    <input
                      type="text"
                      placeholder="Ej: 584247459774"
                      value={newClientData.whatsapp}
                      onChange={(e) => setNewClientData(prev => ({ ...prev, whatsapp: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Correo Electrónico (Opcional)</label>
                    <input
                      type="email"
                      placeholder="contacto@negocio.com"
                      value={newClientData.email}
                      onChange={(e) => setNewClientData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-white/10">
                  <p className="font-bold text-[11px] text-emerald-600 dark:text-[#00DD9E] uppercase tracking-wider mb-2">
                    Credenciales Iniciales de Ingreso al Portal
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Usuario de Acceso</label>
                      <input
                        type="text"
                        placeholder="Autogenerado o personalizado..."
                        value={newClientData.username}
                        onChange={(e) => setNewClientData(prev => ({ ...prev, username: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-white font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Contraseña</label>
                      <input
                        type="text"
                        placeholder="Contraseña inicial..."
                        value={newClientData.password}
                        onChange={(e) => setNewClientData(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-white font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsNewClientModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white font-bold cursor-pointer hover:bg-slate-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#00DD9E] text-[#001E4D] font-black uppercase tracking-wider cursor-pointer shadow-sm hover:brightness-105 active:scale-95 transition"
                  >
                    Guardar y Activar Cliente
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* INLINE SUB-PANEL: CREAR / EDITAR CREDENCIALES */}
          {isCredModalOpen && (
            <div id="cred-form-inline" className="p-5 sm:p-6 rounded-2xl bg-slate-100 dark:bg-[#1c2633] border-2 border-emerald-500/30 shadow-xl space-y-4 animate-fadeIn my-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center space-x-2.5">
                  <Key className="w-5 h-5 text-emerald-500" />
                  <div>
                    <h4 className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-white">
                      Credenciales de Acceso: {editingCred.businessName}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Asigna usuario y contraseña para que el cliente ingrese a su portal
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCredModalOpen(false)}
                  className="p-1 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveCredentials} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Usuario de Acceso *</label>
                    <input
                      type="text"
                      value={editingCred.username}
                      onChange={(e) => setEditingCred(prev => ({ ...prev, username: e.target.value }))}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-white font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Contraseña de Acceso *</label>
                    <input
                      type="text"
                      value={editingCred.password}
                      onChange={(e) => setEditingCred(prev => ({ ...prev, password: e.target.value }))}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-white font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="accActive"
                    checked={editingCred.accessActive}
                    onChange={(e) => setEditingCred(prev => ({ ...prev, accessActive: e.target.checked }))}
                    className="w-4 h-4 text-emerald-500 rounded"
                  />
                  <label htmlFor="accActive" className="font-bold text-slate-700 dark:text-slate-300">
                    Permitir acceso activo al portal para este cliente comercial
                  </label>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsCredModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white font-bold cursor-pointer hover:bg-slate-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#00DD9E] text-[#001E4D] font-black uppercase tracking-wider cursor-pointer shadow-sm hover:brightness-105 active:scale-95 transition"
                  >
                    Guardar Credenciales
                  </button>
                </div>
              </form>
            </div>
          )}

          
          {/* Tabla de Clientes con sus Credenciales */}
          {clients.length === 0 ? (
            <div className="p-10 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 bg-white/50 dark:bg-[#19222e]/50 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-[#00DD9E] mx-auto flex items-center justify-center">
                <Building2 className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto">
                <h4 className="font-display font-black text-base text-slate-900 dark:text-white">
                  No hay clientes registrados aún
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Comienza registrando tu primer cliente publicitario para generarle credenciales y brindarle acceso exclusivo a su portal.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenCreateClient}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00DD9E] hover:opacity-95 text-slate-950 font-black text-xs transition cursor-pointer shadow-sm active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ Crear Primer Cliente</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#19222e]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3">Comercio / Cliente</th>
                    <th className="p-3">Usuario</th>
                    <th className="p-3">Contraseña</th>
                    <th className="p-3">Pauta en Aire</th>
                    <th className="p-3">Acceso Portal</th>
                    <th className="p-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {clients.map((client) => {
                    const userObj = users.find(u => String(u.clientId) === String(client.id));
                    const isAdActive = client.adStatus !== 'inactive';
                    const isAccessActive = userObj?.accessActive !== false;

                    return (
                      <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition">
                        <td className="p-3">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center font-bold text-slate-800 dark:text-white flex-shrink-0">
                              {client.businessName?.[0] || 'C'}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white block">
                                {client.businessName}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                RIF: {client.businessRif || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                          {userObj?.username || <span className="text-slate-400">Sin configurar</span>}
                        </td>

                        <td className="p-3 font-mono font-bold text-emerald-600 dark:text-[#00DD9E]">
                          {userObj?.password ? '••••••••' : <span className="text-slate-400">Sin clave</span>}
                        </td>

                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() => handleToggleAdStatus(client)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider border transition cursor-pointer ${
                              isAdActive
                                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-[#00DD9E]'
                                : 'bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-400'
                            }`}
                            title="Haga clic para alternar pauta Activa / Inactiva"
                          >
                            {isAdActive ? '• Activa en Aire' : '• Pausada / Inactiva'}
                          </button>
                        </td>

                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${
                            isAccessActive 
                              ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400' 
                              : 'bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-400'
                          }`}>
                            {isAccessActive ? 'Permitido' : 'Pausado'}
                          </span>
                        </td>

                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {/* Copiar para WhatsApp */}
                            <button
                              type="button"
                              onClick={() => handleCopyWhatsAppCredentials(client)}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition flex items-center space-x-1 cursor-pointer"
                              title="Copiar credenciales formateadas para enviar por WhatsApp"
                            >
                              {copiedKeyId === client.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>WhatsApp</span>
                            </button>

                            {/* Configurar Clave */}
                            <button
                              type="button"
                              onClick={() => handleOpenCredentials(client)}
                              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white transition cursor-pointer"
                              title="Editar usuario y contraseña"
                            >
                              <Key className="w-3.5 h-3.5" />
                            </button>

                            {/* Abrir portal como este cliente */}
                            <button
                              type="button"
                              onClick={() => {
                                const userObj = users.find(u => String(u.clientId) === String(client.id));
                                if (userObj) {
                                  localStorage.setItem('neblina_client_session_auth', JSON.stringify({
                                    clientId: client.id,
                                    username: userObj.username,
                                    businessName: client.businessName,
                                    loggedInAt: new Date().toISOString()
                                  }));
                                  sessionStorage.setItem('neblina_client_session_auth', JSON.stringify({
                                    clientId: client.id,
                                    username: userObj.username,
                                    businessName: client.businessName,
                                    loggedInAt: new Date().toISOString()
                                  }));
                                  window.open(`${window.location.origin}${window.location.pathname}#clientes`, '_blank', 'noopener,noreferrer');
                                } else {
                                  handleOpenCredentials(client);
                                }
                              }}
                              className="p-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-[#00DD9E] transition cursor-pointer"
                              title="Entrar al Portal como este Cliente"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* ============================================================== */}
      {/* 2. SUB-PESTAÑA: MATERIAL PUBLICITARIO (FOTOS, VIDEOS, AUDIOS)  */}
      {/* ============================================================== */}
      {subTab === 'material' && (
        <div className="space-y-4">
          {/* INLINE SUB-PANEL: ANEXAR MATERIAL PUBLICITARIO */}
          {isAssetModalOpen && (
            <div id="asset-form-inline" className="p-5 sm:p-6 rounded-2xl bg-slate-100 dark:bg-[#1c2633] border-2 border-emerald-500/30 shadow-xl space-y-4 animate-fadeIn my-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center space-x-2.5">
                  <Music className="w-5 h-5 text-emerald-500" />
                  <div>
                    <h4 className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-white">
                      Anexar Material Publicitario para el Cliente
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Carga spots de audio, fotos, videos o artes con fecha de subida y vigencia
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAssetModalOpen(false)}
                  className="p-1 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveAsset} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Cliente Comercial</label>
                    <select
                      value={assetForm.clientId}
                      onChange={(e) => setAssetForm(prev => ({ ...prev, clientId: e.target.value }))}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-white font-bold"
                    >
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.businessName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Destino Publicitario *</label>
                    <select
                      value={assetForm.channelType || 'radial'}
                      onChange={(e) => {
                        const ch = e.target.value;
                        setAssetForm(prev => ({
                          ...prev,
                          channelType: ch,
                          type: ch === 'radial' ? 'audio' : prev.type === 'audio' ? 'photo' : prev.type
                        }));
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-emerald-500/40 text-slate-900 dark:text-[#00DD9E] font-black text-xs"
                    >
                      <option value="web">🌐 Material Publicitario de Página Web</option>
                      <option value="radial">📻 Material Publicitario Radial (Cuñas / Audios)</option>
                      <option value="redes">📱 Material Publicitario para Redes Sociales</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tipo de Archivo</label>
                    <select
                      value={assetForm.type}
                      onChange={(e) => setAssetForm(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-white font-bold"
                    >
                      <option value="audio">Audio Radial (Cuña / Spot / Mención)</option>
                      <option value="photo">Fotografía (Banner / Menú / Arte)</option>
                      <option value="video">Video (Reel / Spot comercial)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre / Título del Archivo *</label>
                  <input
                    type="text"
                    value={assetForm.name}
                    onChange={(e) => setAssetForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="ej: Cuña 30s Promoción Fin de Semana"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">URL del Archivo (MP3, MP4 o Imagen)</label>
                  <input
                    type="url"
                    value={assetForm.url}
                    onChange={(e) => setAssetForm(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://ejemplo.com/spot.mp3"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Fecha de Subida</label>
                    <input
                      type="date"
                      value={assetForm.uploadedAt}
                      onChange={(e) => setAssetForm(prev => ({ ...prev, uploadedAt: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Vigencia del Archivo</label>
                    <select
                      value={assetForm.status}
                      onChange={(e) => setAssetForm(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-white font-bold"
                    >
                      <option value="vigente">Vigente (Al Aire / Activo)</option>
                      <option value="no_vigente">No vigente (Histórico / Finalizado)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsAssetModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white font-bold cursor-pointer hover:bg-slate-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#00DD9E] text-[#001E4D] font-black uppercase tracking-wider cursor-pointer shadow-sm hover:brightness-105 active:scale-95 transition"
                  >
                    Guardar Material
                  </button>
                </div>
              </form>
            </div>
          )}

          
          {/* BARRA DE SEGMENTACIÓN POR COMERCIO Y CANALES (WEB, RADIAL, REDES SOCIALES, SOLICITUDES DE EVENTOS) */}
          <div className="space-y-3 p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-3">
              <div className="flex items-center space-x-2.5">
                <Store className="w-4 h-4 text-[#00DD9E]" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Comercio Seleccionado:
                </span>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/15 text-xs font-black text-slate-900 dark:text-[#00DD9E] cursor-pointer focus:outline-none"
                >
                  <option value="all">🏢 Todos los Comercios ({clients.length})</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.businessName}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2 self-start md:self-auto">
                <div className="relative w-48">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar en material..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAssetForm(prev => ({ 
                      ...prev, 
                      clientId: selectedClientId !== 'all' ? selectedClientId : (clients[0]?.id || ''),
                      channelType: selectedChannelType !== 'all' ? selectedChannelType : 'web'
                    }));
                    setIsAssetModalOpen(true);
                    scrollToSubpanel('asset-form-inline');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#00DD9E] text-[#001E4D] text-xs font-black uppercase tracking-wider hover:brightness-105 active:scale-95 transition shadow-xs flex items-center space-x-1 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Subir Material</span>
                </button>
              </div>
            </div>

            {/* Pestañas de Canales por Comercio: Web, Radial, Redes Sociales y Solicitudes de Eventos */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedChannelType('all')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                  selectedChannelType === 'all'
                    ? 'bg-[#001E4D] text-[#00DD9E] dark:bg-white dark:text-slate-900 font-black shadow-xs'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                <span>📂 Todo el Material</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/15 font-mono">
                  {assets.filter(a => selectedClientId === 'all' || String(a.clientId) === String(selectedClientId)).length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedChannelType('web')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                  selectedChannelType === 'web'
                    ? 'bg-sky-600 text-white font-black shadow-xs'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                <span>🌐 Banners & Web</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/15 font-mono">
                  {assets.filter(a => (selectedClientId === 'all' || String(a.clientId) === String(selectedClientId)) && (a.channelType || (a.type === 'audio' ? 'radial' : 'web')) === 'web').length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedChannelType('radial')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                  selectedChannelType === 'radial'
                    ? 'bg-emerald-600 text-white font-black shadow-xs'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                <span>📻 Publicidad Radial</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/15 font-mono">
                  {assets.filter(a => (selectedClientId === 'all' || String(a.clientId) === String(selectedClientId)) && (a.channelType || (a.type === 'audio' ? 'radial' : 'web')) === 'radial').length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedChannelType('redes')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                  selectedChannelType === 'redes'
                    ? 'bg-purple-600 text-white font-black shadow-xs'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                <span>📱 Publicidad para Redes Sociales</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/15 font-mono">
                  {assets.filter(a => (selectedClientId === 'all' || String(a.clientId) === String(selectedClientId)) && (a.channelType || (a.type === 'audio' ? 'radial' : 'web')) === 'redes').length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSubTab('solicitudes')}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition cursor-pointer shrink-0"
                title="Ver solicitudes de cambio y eventos de los clientes"
              >
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                <span>📅 Solicitudes de Eventos ({requests.length})</span>
              </button>
            </div>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredAssets.map((asset) => {
              const isAudio = asset.type === 'audio';
              const isPhoto = asset.type === 'photo';
              const isVideo = asset.type === 'video';
              const isVigente = asset.status === 'vigente';
              const clientObj = clients.find(c => String(c.id) === String(asset.clientId));
              const isPlaying = playingAudioId === asset.id;

              return (
                <div 
                  key={asset.id}
                  className={`p-4 rounded-2xl border transition ${
                    isVigente
                      ? 'bg-white dark:bg-[#19222e] border-slate-200 dark:border-white/10'
                      : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200/50 dark:border-white/5 opacity-65'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        {clientObj?.businessName || 'Cliente'}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-white/10 text-emerald-600 dark:text-[#00DD9E]">
                        {asset.channelType === 'web' ? '🌐 Web' : asset.channelType === 'redes' ? '📱 Redes' : '📻 Radial'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        toggleAssetValidity(asset.id);
                        refreshAll();
                      }}
                      className={`text-[11px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider cursor-pointer border ${
                        isVigente
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-[#00DD9E]'
                          : 'bg-slate-200 border-slate-300 text-slate-600 dark:bg-white/10 dark:text-slate-400'
                      }`}
                      title="Haga clic para alternar entre Vigente y No Vigente"
                    >
                      {isVigente ? 'Vigente' : 'No vigente'}
                    </button>
                  </div>

                  <h5 className="font-display font-bold text-xs text-slate-900 dark:text-white leading-tight">
                    {asset.name}
                  </h5>

                  {/* Previsualización */}
                  {isPhoto && asset.url && (
                    <img 
                      src={asset.url} 
                      alt={asset.name} 
                      className="w-full h-32 object-cover rounded-xl my-2" 
                    />
                  )}

                  {isVideo && asset.url && (
                    <video 
                      src={asset.url} 
                      controls 
                      className="w-full max-h-36 rounded-xl my-2 bg-black" 
                    />
                  )}

                  {isAudio && (
                    <div className="my-2 p-2.5 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleToggleDirectorAudio(asset)}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#001E4D] text-[#00DD9E] dark:bg-[#00DD9E] dark:text-[#001E4D] text-xs font-bold cursor-pointer"
                      >
                        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        <span>{isPlaying ? 'Pausar' : 'Escuchar Cuña'}</span>
                      </button>
                      <span className="text-[11px] font-mono text-slate-500">{asset.duration || '0:30'}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Subido: {new Date(asset.uploadedAt).toLocaleDateString('es-VE')}</span>

                    <div className="flex items-center space-x-2">
                      <a 
                        href={asset.url} 
                        download 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-emerald-600 dark:text-[#00DD9E] hover:underline"
                        title="Descargar archivo"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('¿Eliminar este material publicitario?')) {
                            deleteClientAsset(asset.id);
                            refreshAll();
                          }
                        }}
                        className="text-rose-500 hover:text-rose-600 cursor-pointer"
                        title="Eliminar archivo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* 3. SUB-PESTAÑA: SOLICITUDES & EVENTOS EN 4 PASOS               */}
      {/* ============================================================== */}
      {subTab === 'solicitudes' && (
        <div className="space-y-4">
          
          <div className="p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10">
            <h4 className="font-display font-black text-sm text-slate-900 dark:text-white">
              Gestor de Solicitudes y Notificaciones de Clientes
            </h4>
            <p className="text-xs text-slate-500">
              Controle los 4 pasos de cada requerimiento publicitario o evento notificado: Pendiente ➜ En Revisión ➜ Atendido ➜ Archivado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {requests.map((req) => {
              const clientObj = clients.find(c => String(c.id) === String(req.clientId));
              return (
                <div 
                  key={req.id}
                  className="p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800 dark:text-white">
                      {clientObj?.businessName || req.businessName}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase">
                      {req.type === 'ficha_establecimiento' ? (
                        <>
                          <Building2 className="w-3 h-3 text-emerald-500" />
                          <span>Ficha del Establecimiento</span>
                        </>
                      ) : req.type === 'evento_promocion' ? (
                        <>
                          <Calendar className="w-3 h-3 text-amber-500" />
                          <span>Evento/Promo</span>
                        </>
                      ) : (
                        <>
                          <Radio className="w-3 h-3 text-[#00DD9E]" />
                          <span>Cambio Radial</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div>
                    <h5 className="font-display font-black text-sm text-slate-900 dark:text-white">
                      {req.title}
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 whitespace-pre-wrap">
                      {req.description}
                    </p>
                    {req.targetDate && (
                      <p className="text-[11px] font-bold text-emerald-600 dark:text-[#00DD9E] mt-1">
                        Fecha Programada: {req.targetDate}
                      </p>
                    )}

                    {/* Si es una solicitud de Ficha del Establecimiento, mostrar botón directo de Aprobar y Aplicar */}
                    {req.type === 'ficha_establecimiento' && req.proposedProfile && (
                      <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 text-xs">
                        <span className="font-black text-emerald-700 dark:text-[#00DD9E] block">
                          Datos Propuestos por el Cliente para su Ficha Oficial:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-700 dark:text-slate-200">
                          <p><strong>Nombre Registro:</strong> {req.proposedProfile.registeredName}</p>
                          <p><strong>Marca Comercial:</strong> {req.proposedProfile.businessName}</p>
                          <p><strong>RIF:</strong> {req.proposedProfile.businessRif}</p>
                          <p className="sm:col-span-2"><strong>Descripción:</strong> {req.proposedProfile.businessDescription}</p>
                        </div>
                        {req.status !== 'atendido' && (
                          <button
                            type="button"
                            onClick={() => {
                              approveClientProfileRequest(req.id);
                              refreshAll();
                              if (onShowToast) onShowToast('Ficha del establecimiento aprobada y actualizada en el sistema');
                            }}
                            className="w-full py-2 px-3 rounded-xl bg-[#00DD9E] text-[#001E4D] font-black text-xs uppercase tracking-wider shadow-xs hover:brightness-105 transition cursor-pointer inline-flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Aprobar y Actualizar Ficha del Cliente</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Selector de los 4 Pasos */}
                  <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                      Avanzar Estado del Requerimiento:
                    </span>
                    <div className="grid grid-cols-4 gap-1 text-[11px]">
                      {REQUEST_STEPS.map((step) => {
                        const isCurrent = req.status === step.id;
                        return (
                          <button
                            key={step.id}
                            type="button"
                            onClick={() => {
                              updateRequestStep(req.id, step.id);
                              refreshAll();
                              if (onShowToast) onShowToast(`Estado actualizado a: ${step.label}`);
                            }}
                            className={`py-1.5 rounded-lg font-bold text-center transition cursor-pointer border ${
                              isCurrent
                                ? step.badgeClass + ' shadow-xs font-black'
                                : 'bg-slate-100 dark:bg-white/5 border-transparent text-slate-600 dark:text-slate-400 hover:border-slate-300'
                            }`}
                          >
                            {step.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Campo de Respuesta del Director */}
                  <div className="pt-1">
                    <input
                      type="text"
                      placeholder="Escribir respuesta para el cliente..."
                      defaultValue={req.adminNotes || ''}
                      onBlur={(e) => {
                        if (e.target.value !== req.adminNotes) {
                          updateRequestStep(req.id, req.status, e.target.value);
                          refreshAll();
                          if (onShowToast) onShowToast('Respuesta guardada y visible para el cliente');
                        }
                      }}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-xs text-slate-800 dark:text-white"
                    />
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* 4. SUB-PESTAÑA: FACTURACIÓN & COMPROBANTES                     */}
      {/* ============================================================== */}
      {subTab === 'facturacion' && (
        <div className="space-y-4">
          {/* INLINE SUB-PANEL: EMITIR FACTURA */}
          {isInvoiceModalOpen && (
            <div id="invoice-form-inline" className="p-5 sm:p-6 rounded-2xl bg-slate-100 dark:bg-[#1c2633] border-2 border-emerald-500/30 shadow-xl space-y-4 animate-fadeIn my-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center space-x-2.5">
                  <Receipt className="w-5 h-5 text-emerald-500" />
                  <div>
                    <h4 className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-white">
                      Emitir Factura al Cliente
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Genera el comprobante pendiente que se reflejará en el portal del cliente
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="p-1 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateInvoiceSubmit} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Cliente *</label>
                    <select
                      value={invoiceForm.clientId}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, clientId: e.target.value }))}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-white font-bold"
                    >
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.businessName} (${c.amountUsd || 0} USD)</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Monto en Divisa ($ USD) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={invoiceForm.amountUsd}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, amountUsd: e.target.value }))}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-white font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Concepto de la Pauta *</label>
                  <input
                    type="text"
                    value={invoiceForm.concept}
                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, concept: e.target.value }))}
                    required
                    placeholder="Ej: Pauta radial en vivo 3 menciones diarias - Mes de Noviembre"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-white font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Fecha Emisión</label>
                    <input
                      type="date"
                      value={invoiceForm.issueDate}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, issueDate: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Fecha Límite Pago</label>
                    <input
                      type="date"
                      value={invoiceForm.dueDate}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Cuenta Bancaria / Pago Móvil Receptor Adjunto a la Factura *
                  </label>
                  <select
                    value={invoiceForm.bankProfileId}
                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, bankProfileId: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-white font-bold"
                  >
                    {bankProfiles.map(bp => (
                      <option key={bp.id} value={bp.id}>
                        {bp.label} — {bp.bankName} ({bp.phone || bp.accountNumber})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>El cliente verá estos datos en su factura junto a la alerta roja de verificación obligatoria.</span>
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsInvoiceModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white font-bold cursor-pointer hover:bg-slate-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#00DD9E] text-[#001E4D] font-black uppercase tracking-wider cursor-pointer shadow-sm hover:brightness-105 active:scale-95 transition"
                  >
                    Emitir Factura
                  </button>
                </div>
              </form>
            </div>
          )}

          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-display font-black text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                <span>Emisión de Facturas, Alertas de Cobro y Control de Cobranzas</span>
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="px-2 py-0.5 rounded-lg bg-rose-500 text-white text-[11px] font-black">
                    {notifications.filter(n => !n.read).length} alertas sin leer
                  </span>
                )}
              </h4>
              <p className="text-xs text-slate-500">
                Emita facturas con perfil bancario receptor y envíe alertas directas al portal y chat del cliente.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleRunAutoNotificationsCheck}
                className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                title="Verificar clientes próximos a vencer, del día o en mora y notificarles automáticamente"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Ejecutar Chequeo Automático</span>
              </button>

              <button
                onClick={() => {
                  setInvoiceForm(prev => ({
                    ...prev,
                    clientId: clients[0]?.id || '',
                    bankProfileId: bankProfiles[0]?.id || ''
                  }));
                  setIsInvoiceModalOpen(true);
                  scrollToSubpanel('invoice-form-inline');
                }}
                className="px-4 py-2 rounded-xl bg-[#00DD9E] text-[#001E4D] text-xs font-black uppercase tracking-wider hover:brightness-105 active:scale-95 transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Emitir Factura al Cliente</span>
              </button>
            </div>
          </div>

          {/* Panel de Envío Rápido de Alertas de Pago y Vencimiento por Cliente */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white">
                  Notificaciones de Pago Directas al Dispositivo & Chat del Cliente
                </span>
              </div>
              <span className="text-[11px] text-slate-500">
                Envía alerta al portal + notificación push + mensaje automático al chat
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {clients.map(cli => {
                const unreadNotifs = notifications.filter(n => String(n.clientId) === String(cli.id) && !n.read).length;
                const unreadChats = messages.filter(m => String(m.clientId) === String(cli.id) && m.sender === 'cliente' && !m.read).length;
                return (
                  <div key={cli.id} className="p-3 rounded-xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 flex flex-col justify-between gap-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{cli.businessName}</p>
                        <p className="text-[11px] text-slate-500">
                          Día corte: {cli.billingDay || 15} · ${cli.amountUsd || 0} USD
                        </p>
                      </div>
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        {unreadNotifs > 0 && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-300 text-[11px] font-black" title="Alertas de cobro activas">
                            <Bell className="w-3 h-3" />
                            <span>{unreadNotifs}</span>
                          </span>
                        )}
                        {unreadChats > 0 && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-[#00DD9E] text-[11px] font-black" title="Mensajes sin leer del cliente">
                            <MessageSquare className="w-3 h-3" />
                            <span>{unreadChats}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1 text-[11px]">
                      <button
                        type="button"
                        onClick={() => handleSendManualPaymentNotification(cli, 'upcoming')}
                        className="py-1.5 px-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-700 dark:text-sky-300 font-bold transition cursor-pointer inline-flex items-center justify-center gap-1"
                        title="Notificar Pronto Vencimiento (1-3 días antes)"
                      >
                        <Clock className="w-3 h-3 shrink-0" />
                        <span>Pronto Venc.</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSendManualPaymentNotification(cli, 'due_today')}
                        className="py-1.5 px-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 font-bold transition cursor-pointer inline-flex items-center justify-center gap-1"
                        title="Notificar Día de Pago Hoy"
                      >
                        <Calendar className="w-3 h-3 shrink-0" />
                        <span>Pago Hoy</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSendManualPaymentNotification(cli, 'overdue')}
                        className="py-1.5 px-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-700 dark:text-rose-400 font-bold transition cursor-pointer inline-flex items-center justify-center gap-1"
                        title="Notificar Pago Atrasado / En Mora"
                      >
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>En Mora</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#19222e]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3">Factura N°</th>
                  <th className="p-3">Cliente</th>
                  <th className="p-3">Concepto</th>
                  <th className="p-3">Monto USD / Bs.</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {invoices.map((inv) => {
                  const isPaid = inv.status === 'cobrada';
                  const bsAmount = (inv.amountUsd * bcvRates.usd).toLocaleString('es-VE', { maximumFractionDigits: 1 });

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition">
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                        {inv.id}
                      </td>
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-200">
                        {inv.businessName}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                        {inv.concept}
                      </td>
                      <td className="p-3 font-mono">
                        <span className="font-bold text-emerald-600 dark:text-[#00DD9E] block">
                          ${inv.amountUsd.toFixed(2)} USD
                        </span>
                        <span className="text-[11px] text-slate-400">
                          ≈ {bsAmount} Bs.
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-lg text-[11px] font-black uppercase tracking-wider ${
                          isPaid ? 'bg-emerald-500/20 text-emerald-600 dark:text-[#00DD9E]' : 'bg-amber-500/20 text-amber-600'
                        }`}>
                          {isPaid ? 'Cobrada' : 'Por Cobrar'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {!isPaid && (
                            <button
                              type="button"
                              onClick={() => handleMarkInvoicePaid(inv)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition cursor-pointer"
                            >
                              Marcar Cobrada
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setViewingReceipt(inv)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-white transition cursor-pointer"
                            title="Ver e Imprimir Comprobante"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteInvoice(inv)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition cursor-pointer"
                            title="Eliminar Factura Permanentemente"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {viewingReceipt && (
            <div className="p-5 sm:p-6 rounded-xl bg-white dark:bg-[#19222e] border-2 border-emerald-500/40 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
                <div>
                  <span className="font-mono font-black text-xs text-emerald-600 dark:text-[#00DD9E]">{viewingReceipt.id}</span>
                  <h5 className="font-display font-black text-sm text-slate-900 dark:text-white">{viewingReceipt.businessName}</h5>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingReceipt(null)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/10 text-xs font-bold cursor-pointer"
                >
                  Cerrar Vista
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-slate-500">Concepto:</p>
                  <p className="font-bold text-slate-900 dark:text-white">{viewingReceipt.concept}</p>
                </div>
                <div>
                  <p className="text-slate-500">Monto Facturado:</p>
                  <p className="font-mono font-black text-sm text-emerald-600 dark:text-[#00DD9E]">
                    ${viewingReceipt.amountUsd.toFixed(2)} USD (≈ {(viewingReceipt.amountUsd * bcvRates.usd).toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.)
                  </p>
                </div>
              </div>
              {viewingReceipt.paymentDetails && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/25 border border-slate-200 dark:border-white/10 text-xs space-y-1">
                  <span className="font-black text-slate-800 dark:text-white block">
                    Cuenta Bancaria Receptora Asociada ({viewingReceipt.paymentDetails.label}):
                  </span>
                  <p className="text-slate-600 dark:text-slate-300">
                    <strong>Banco:</strong> {viewingReceipt.paymentDetails.bankName} · <strong>Cuenta:</strong> {viewingReceipt.paymentDetails.accountNumber} · <strong>Pago Móvil:</strong> {viewingReceipt.paymentDetails.phone} · <strong>RIF/CI:</strong> {viewingReceipt.paymentDetails.cedulaRif} · <strong>Titular:</strong> {viewingReceipt.paymentDetails.holderName}
                  </p>
                </div>
              )}
              <div className="p-3 rounded-xl bg-rose-600/15 border-2 border-rose-500 text-rose-700 dark:text-rose-300 text-xs font-black flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>ALERTA IMPORTANTE: Verifique siempre los datos de pago antes de realizar su transferencia o Pago Móvil, ya que las cuentas receptoras pueden variar.</span>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ============================================================== */}
      {/* 5. SUB-PESTAÑA: MENSAJERÍA DIRECTA CON CLIENTES                */}
      {/* ============================================================== */}
      {subTab === 'mensajeria' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[520px] rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#19222e] overflow-hidden">
          
          {/* Lista de Clientes a la Izquierda */}
          <div className="md:col-span-4 border-r border-slate-200 dark:border-white/10 flex flex-col h-full bg-slate-50/50 dark:bg-black/20">
            <div className="p-3 border-b border-slate-200 dark:border-white/10">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Conversaciones con Clientes
              </span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
              {clients.map((client) => {
                const clientMsgs = messages.filter(m => String(m.clientId) === String(client.id));
                const unread = clientMsgs.filter(m => m.sender === 'cliente' && !m.read).length;
                const isSelected = String(client.id) === String(chatClientId);

                return (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => {
                      setChatClientId(client.id);
                      markMessagesReadForClient(client.id, 'director');
                      refreshAll();
                    }}
                    className={`w-full p-3 text-left transition cursor-pointer flex items-center justify-between ${
                      isSelected 
                        ? 'bg-emerald-500/10 dark:bg-white/10 border-l-4 border-[#00DD9E]' 
                        : 'hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {client.businessName}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {clientMsgs[clientMsgs.length - 1]?.text || 'Sin mensajes'}
                      </p>
                    </div>

                    {unread > 0 && (
                      <span className="w-5 h-5 rounded-full bg-[#00DD9E] text-[#001E4D] font-black text-[11px] flex items-center justify-center flex-shrink-0">
                        {unread}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ventana de Chat a la Derecha */}
          <div className="md:col-span-8 flex flex-col h-full p-4">
            
            <div className="pb-3 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <div>
                <h5 className="font-display font-black text-xs text-slate-900 dark:text-white">
                  Chat con {clients.find(c => String(c.id) === String(chatClientId))?.businessName || 'Cliente'}
                </h5>
                <span className="text-[11px] text-emerald-600 dark:text-[#00DD9E]">Canal Privado de Cabina</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
              {messages.filter(m => String(m.clientId) === String(chatClientId)).map((msg) => {
                const isDirector = msg.sender === 'director';
                return (
                  <div key={msg.id} className={`flex flex-col ${isDirector ? 'items-end' : 'items-start'}`}>
                    <span className="text-[11px] text-slate-400 mb-0.5">
                      {msg.senderName} · {new Date(msg.timestamp).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div className={`p-2.5 rounded-2xl max-w-sm text-xs ${
                      isDirector
                        ? 'bg-[#001E4D] text-[#00DD9E] dark:bg-[#00DD9E] dark:text-[#001E4D] rounded-tr-xs font-bold'
                        : 'bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white rounded-tl-xs'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              <div ref={chatBottomRef} />
            </div>

            <form onSubmit={handleSendDirectorMessage} className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center space-x-2">
              <input
                type="text"
                value={directorChatText}
                onChange={(e) => setDirectorChatText(e.target.value)}
                placeholder="Escriba como Director de Neblina..."
                className="flex-1 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={!directorChatText.trim()}
                className="px-4 py-2 rounded-xl bg-[#00DD9E] text-[#001E4D] font-bold text-xs hover:brightness-105 active:scale-95 transition cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

          </div>

        </div>
      )}

    </div>
  );
}