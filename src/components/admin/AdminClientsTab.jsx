import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  RotateCcw, 
  MessageCircle, 
  Phone, 
  MapPin, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Building2, 
  User, 
  UserCheck,
  Handshake,
  Store,
  Tag, 
  FolderPlus, 
  Receipt, 
  ArrowRight, 
  RefreshCw,
  Copy,
  Check,
  Send,
  ExternalLink,
  X,
  Megaphone,
  BarChart3,
  Image as ImageIcon,
  Film,
  Upload,
  Globe,
  Share2,
  Radio,
  Key,
  Mic,
  CreditCard,
  Landmark
} from 'lucide-react';
import Emoji3D from '../Emoji3D';
import ClientAdReportModal from './ClientAdReportModal';
import SectionTrashToggle from './SectionTrashToggle';
import AdminClientPortalManager from './AdminClientPortalManager';
import AdminStaffPortalManager from './AdminStaffPortalManager';
import { toggleClientAdStatus } from '../../services/clientPortalService';
import { getAllStaffUsers } from '../../services/staffPortalService';
import { 
  getAllClients, 
  saveClient, 
  trashClient, 
  restoreClient, 
  deleteClientPermanently, 
  emptyClientsTrash,
  getAllGenres, 
  addGenre, 
  deleteGenre,
  recordClientPayment,
  getAllBankProfiles,
  saveBankProfile,
  deleteBankProfile,
  AD_PACKAGES,
  getDefaultClientServices,
  derivePackageTypeFromServices
} from '../../services/radioClientsService';
import { 
  fetchLiveBcvRates, 
  getCachedBcvRates, 
  convertCurrencyToBs, 
  generateBillingWhatsAppMessage 
} from '../../services/bcvService';

export default function AdminClientsTab({ onShowToast, onNavigateToBanners }) {
  const [mainView, setMainView] = useState('crm'); // 'crm' | 'portal_manager'
  const [clients, setClients] = useState(() => getAllClients());
  const [genres, setGenres] = useState(() => getAllGenres());
  const [bankProfiles, setBankProfiles] = useState(() => getAllBankProfiles());
  const [showTrash, setShowTrash] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'paid' | 'pending' | 'overdue'
  const [genreFilter, setGenreFilter] = useState('all');

  // Tasas en vivo del BCV
  const [bcvRates, setBcvRates] = useState(() => getCachedBcvRates());
  const [isLoadingBcv, setIsLoadingBcv] = useState(false);

  // Widget Calculadora BCV
  const [calcAmount, setCalcAmount] = useState('40');
  const [calcCurrency, setCalcCurrency] = useState('USD');
  const [calcCopied, setCalcCopied] = useState(false);

  // Modal de Crear / Editar Cliente
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportClientId, setReportClientId] = useState(null);
  const [clientForm, setClientForm] = useState({
    ownerName: '',
    ownerCedula: '',
    ownerPhone: '',
    businessName: '',
    businessRif: '',
    businessDescription: '',
    logoUrl: '',
    address: '',
    adminContactName: '',
    adminContactPhone: '',
    genreId: 'gen_restaurantes',
    packageType: ['en_vivo', 'rotativas'],
    services: getDefaultClientServices(['en_vivo', 'rotativas']),
    paymentFrequency: 'mensual',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    billingDay: 15,
    amountUsd: 50,
    paymentStatus: 'pending',
    locutorId: '',
    locutorName: '',
    notes: ''
  });

  // Función para scroll suave a sub-paneles inline
  const scrollToSubpanel = (id) => {
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 60);
  };

  // Modal Gestor de Géneros / Categorías
  const [isGenreModalOpen, setIsGenreModalOpen] = useState(false);
  const [newGenreName, setNewGenreName] = useState('');

  // Sub-panel Gestor de Perfiles Bancarios / Pago Móvil
  const [isBankProfilesOpen, setIsBankProfilesOpen] = useState(false);
  const [editingBankProfileId, setEditingBankProfileId] = useState('');
  const [bankForm, setBankForm] = useState({
    label: '',
    bankName: '',
    accountNumber: '',
    accountType: 'Corriente / Pago Móvil',
    phone: '',
    cedulaRif: '',
    holderName: '',
    ownerType: 'admin'
  });

  // Modal Recordatorio de Cobro WhatsApp
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [selectedClientForReminder, setSelectedClientForReminder] = useState(null);
  const [reminderRecipient, setReminderRecipient] = useState('owner'); // 'owner' | 'admin'
  const [reminderType, setReminderType] = useState('due'); // 'upcoming' | 'due' | 'overdue'
  const [reminderCurrency, setReminderCurrency] = useState('USD');
  const [reminderCustomAmount, setReminderCustomAmount] = useState('');
  const [reminderBankProfileId, setReminderBankProfileId] = useState(() => getAllBankProfiles()[0]?.id || '');

  // Modal Registrar Pago
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedClientForPayment, setSelectedClientForPayment] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    amountUsd: '',
    amountBs: '',
    paymentMethod: 'pago_movil_bcv',
    bankProfileId: getAllBankProfiles()[0]?.id || '',
    reference: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Cargar tasas BCV al montar
  useEffect(() => {
    refreshBcvRates();
    const handleUpdate = () => {
      setClients(getAllClients());
      setGenres(getAllGenres());
      setBankProfiles(getAllBankProfiles());
    };
    window.addEventListener('neblina_clients_updated', handleUpdate);
    return () => window.removeEventListener('neblina_clients_updated', handleUpdate);
  }, []);

  const refreshBcvRates = async () => {
    setIsLoadingBcv(true);
    try {
      const data = await fetchLiveBcvRates();
      setBcvRates(data);
      if (onShowToast) onShowToast('Tasas oficiales BCV actualizadas');
    } catch (e) {
      console.warn('Error refrescando tasas:', e);
    } finally {
      setIsLoadingBcv(false);
    }
  };

  // Cálculo de conversión reactiva
  const currentConversion = convertCurrencyToBs(
    parseFloat(calcAmount) || 0, 
    calcCurrency, 
    calcCurrency === 'EUR' ? bcvRates.eur : bcvRates.usd
  );

  // Filtrado de clientes
  const activeClients = clients.filter(c => showTrash ? c.trashed : !c.trashed);
  const filteredClients = activeClients.filter(c => {
    const matchesSearch = 
      c.businessName?.toLowerCase().includes(search.toLowerCase()) ||
      c.ownerName?.toLowerCase().includes(search.toLowerCase()) ||
      c.businessRif?.toLowerCase().includes(search.toLowerCase()) ||
      c.ownerCedula?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || c.paymentStatus === statusFilter;
    const matchesGenre = genreFilter === 'all' || c.genreId === genreFilter;

    return matchesSearch && matchesStatus && matchesGenre;
  });

  const trashedCount = clients.filter(c => c.trashed).length;

  // Manejador de subida del logo comercial del cliente
  const handleLogoFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Por favor seleccione un archivo de imagen válido (PNG, JPG, SVG, WebP).');
      return;
    }
    if (file.size > 2.5 * 1024 * 1024) {
      alert('El archivo no debe superar los 2.5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setClientForm(prev => ({ ...prev, logoUrl: ev.target?.result || '' }));
    };
    reader.readAsDataURL(file);
  };

  // Abrir modal de creación
  const handleOpenCreateClient = () => {
    setEditingClient(null);
    setClientForm({
      ownerName: '',
      ownerCedula: '',
      ownerPhone: '',
      businessName: '',
      businessRif: '',
      businessDescription: '',
      logoUrl: '',
      address: '',
      adminContactName: '',
      adminContactPhone: '',
      genreId: genres[0]?.id || 'gen_restaurantes',
      packageType: ['en_vivo', 'rotativas'],
      services: getDefaultClientServices(['en_vivo', 'rotativas']),
      paymentFrequency: 'mensual',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      billingDay: 15,
      amountUsd: 50,
      paymentStatus: 'pending',
      locutorId: '',
      locutorName: '',
      notes: ''
    });
    setIsClientModalOpen(true);
    setIsGenreModalOpen(false);
    setIsReminderModalOpen(false);
    setIsPaymentModalOpen(false);
    scrollToSubpanel('client-form-inline');
  };

  // Abrir modal de edición
  const handleOpenEditClient = (client) => {
    setEditingClient(client);
    const existingServices = client.services || getDefaultClientServices(client.packageType || ['en_vivo']);
    setClientForm({
      ownerName: client.ownerName || '',
      ownerCedula: client.ownerCedula || '',
      ownerPhone: client.ownerPhone || '',
      businessName: client.businessName || '',
      businessRif: client.businessRif || '',
      businessDescription: client.businessDescription || '',
      logoUrl: client.logoUrl || '',
      address: client.address || '',
      adminContactName: client.adminContactName || '',
      adminContactPhone: client.adminContactPhone || '',
      genreId: client.genreId || genres[0]?.id || 'gen_restaurantes',
      packageType: Array.isArray(client.packageType) ? client.packageType : derivePackageTypeFromServices(existingServices),
      services: existingServices,
      paymentFrequency: client.paymentFrequency || 'mensual',
      startDate: client.startDate || new Date().toISOString().split('T')[0],
      endDate: client.endDate || '',
      billingDay: client.billingDay || 15,
      amountUsd: client.amountUsd || 50,
      paymentStatus: client.paymentStatus || 'pending',
      locutorId: client.locutorId || '',
      locutorName: client.locutorName || '',
      notes: client.notes || ''
    });
    setIsClientModalOpen(true);
    setIsGenreModalOpen(false);
    setIsReminderModalOpen(false);
    setIsPaymentModalOpen(false);
    scrollToSubpanel('client-form-inline');
  };

  // Guardar cliente
  const handleSaveClientSubmit = (e) => {
    e.preventDefault();
    if (!clientForm.businessName.trim() || !clientForm.ownerName.trim()) {
      alert('Por favor ingrese el nombre comercial del establecimiento y el nombre del dueño.');
      return;
    }

    const derivedPackage = derivePackageTypeFromServices(clientForm.services);
    const payload = {
      ...(editingClient ? { id: editingClient.id } : {}),
      ...clientForm,
      packageType: derivedPackage,
      amountUsd: parseFloat(clientForm.amountUsd) || 0,
      billingDay: parseInt(clientForm.billingDay, 10) || 15
    };

    saveClient(payload);
    setClients(getAllClients());
    setIsClientModalOpen(false);
    if (onShowToast) onShowToast(editingClient ? 'Cliente actualizado con éxito' : 'Cliente registrado exitosamente');
  };

  // Papelera y eliminación
  const handleTrash = (id) => {
    trashClient(id);
    setClients(getAllClients());
    if (onShowToast) onShowToast('Cliente movido a la papelera');
  };

  const handleRestore = (id) => {
    restoreClient(id);
    setClients(getAllClients());
    if (onShowToast) onShowToast('Cliente restaurado');
  };

  const handleDeletePermanently = (id) => {
    if (window.confirm('¿Está seguro de eliminar este cliente de forma definitiva?')) {
      deleteClientPermanently(id);
      setClients(getAllClients());
      if (onShowToast) onShowToast('Cliente eliminado permanentemente');
    }
  };

  const handleEmptyTrash = () => {
    if (window.confirm('¿Está seguro de vaciar toda la papelera de clientes?')) {
      emptyClientsTrash();
      setClients(getAllClients());
      if (onShowToast) onShowToast('Papelera vaciada');
    }
  };

  // Gestión de géneros
  const handleAddGenre = (e) => {
    e.preventDefault();
    if (!newGenreName.trim()) return;
    addGenre(newGenreName.trim());
    setGenres(getAllGenres());
    setNewGenreName('');
    if (onShowToast) onShowToast('Categoría creada exitosamente');
  };

  const handleDeleteGenre = (id) => {
    if (window.confirm('¿Desea eliminar esta categoría de establecimiento?')) {
      deleteGenre(id);
      setGenres(getAllGenres());
      if (onShowToast) onShowToast('Categoría eliminada');
    }
  };

  // Gestión de Perfiles Bancarios / Pago Móvil
  const handleSaveBankProfileSubmit = (e) => {
    e.preventDefault();
    if (!bankForm.bankName.trim() || !bankForm.holderName.trim()) {
      alert('Complete el Banco y el Titular de la cuenta.');
      return;
    }
    saveBankProfile({
      ...bankForm,
      id: editingBankProfileId || undefined
    });
    const updated = getAllBankProfiles();
    setBankProfiles(updated);
    setEditingBankProfileId('');
    setBankForm({
      label: '',
      bankName: '',
      accountNumber: '',
      accountType: 'Corriente / Pago Móvil',
      phone: '',
      cedulaRif: '',
      holderName: '',
      ownerType: 'admin'
    });
    if (onShowToast) onShowToast('Perfil de cuenta bancaria guardado');
  };

  const handleEditBankProfile = (bp) => {
    setEditingBankProfileId(bp.id);
    setBankForm({
      label: bp.label || '',
      bankName: bp.bankName || '',
      accountNumber: bp.accountNumber || '',
      accountType: bp.accountType || 'Corriente / Pago Móvil',
      phone: bp.phone || '',
      cedulaRif: bp.cedulaRif || '',
      holderName: bp.holderName || '',
      ownerType: bp.ownerType || 'admin'
    });
  };

  const handleDeleteBankProfileClick = (id) => {
    if (window.confirm('¿Eliminar este perfil de cuenta bancaria?')) {
      const updated = deleteBankProfile(id);
      setBankProfiles(updated);
      if (onShowToast) onShowToast('Perfil bancario eliminado');
    }
  };

  // Abrir modal de WhatsApp
  const handleOpenWhatsAppReminder = (client) => {
    setSelectedClientForReminder(client);
    setReminderRecipient('owner');
    setReminderType(client.paymentStatus === 'overdue' ? 'overdue' : client.paymentStatus === 'pending' ? 'due' : 'upcoming');
    setReminderCurrency('USD');
    setReminderCustomAmount(String(client.amountUsd || ''));
    setReminderBankProfileId(bankProfiles[0]?.id || '');
    setIsReminderModalOpen(true);
    setIsClientModalOpen(false);
    setIsGenreModalOpen(false);
    setIsBankProfilesOpen(false);
    setIsPaymentModalOpen(false);
    scrollToSubpanel('reminder-form-inline');
  };

  // Abrir modal de registro de pago
  const handleOpenPaymentModal = (client) => {
    setSelectedClientForPayment(client);
    const amountUsd = client.amountUsd || 0;
    const conv = convertCurrencyToBs(amountUsd, 'USD', bcvRates.usd);
    setPaymentForm({
      amountUsd: String(amountUsd),
      amountBs: conv.amountBs.toFixed(2),
      paymentMethod: 'pago_movil_bcv',
      bankProfileId: bankProfiles[0]?.id || '',
      reference: '',
      notes: '',
      date: new Date().toISOString().split('T')[0]
    });
    setIsPaymentModalOpen(true);
    setIsClientModalOpen(false);
    setIsGenreModalOpen(false);
    setIsBankProfilesOpen(false);
    setIsReminderModalOpen(false);
    scrollToSubpanel('payment-form-inline');
  };

  const handleSavePaymentSubmit = (e) => {
    e.preventDefault();
    if (!selectedClientForPayment) return;

    const chosenBank = bankProfiles.find(b => b.id === paymentForm.bankProfileId) || null;

    recordClientPayment({
      clientId: selectedClientForPayment.id,
      clientName: selectedClientForPayment.ownerName,
      businessName: selectedClientForPayment.businessName,
      amountUsd: parseFloat(paymentForm.amountUsd) || 0,
      amountBs: parseFloat(paymentForm.amountBs) || 0,
      rateBcv: bcvRates.usd,
      paymentMethod: paymentForm.paymentMethod,
      bankProfileId: paymentForm.bankProfileId || '',
      paymentDetails: chosenBank,
      reference: paymentForm.reference,
      notes: paymentForm.notes,
      date: paymentForm.date
    });

    setClients(getAllClients());
    setIsPaymentModalOpen(false);
    if (onShowToast) onShowToast('¡Pago registrado y cliente marcado como al día!');
  };

  // Generar mensaje de WhatsApp para el modal de recordatorio
  const selectedReminderBank = bankProfiles.find(b => b.id === reminderBankProfileId) || bankProfiles[0] || null;
  const currentReminderGenerated = selectedClientForReminder ? generateBillingWhatsAppMessage({
    client: selectedClientForReminder,
    reminderType: reminderType,
    currency: reminderCurrency,
    amount: parseFloat(reminderCustomAmount) || selectedClientForReminder.amountUsd,
    recipientType: reminderRecipient,
    bankProfile: selectedReminderBank
  }) : null;

  // Resumen financiero
  const totalAmountBilledUsd = clients.filter(c => !c.trashed).reduce((acc, c) => acc + (c.amountUsd || 0), 0);
  const pendingAmountUsd = clients.filter(c => !c.trashed && c.paymentStatus !== 'paid').reduce((acc, c) => acc + (c.amountUsd || 0), 0);
  const activeCount = clients.filter(c => !c.trashed).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* ============================================================== */}
      {/* SELECTOR SUPERIOR: CRM & DIRECTORIO VS VENTAS E INGRESOS POR LOCUTOR */}
      {/* ============================================================== */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-100 dark:bg-white/5 p-1 rounded-2xl max-w-max border border-slate-200 dark:border-white/10">
        <button
          type="button"
          onClick={() => setMainView('crm')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            mainView === 'crm'
              ? 'bg-[#001E4D] text-[#00DD9E] shadow-sm dark:bg-[#00DD9E] dark:text-[#001E4D]'
              : 'text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Directorio & Cobranzas ({activeCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setMainView('staff_manager')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            mainView === 'staff_manager'
              ? 'bg-[#001E4D] text-[#00DD9E] shadow-sm dark:bg-[#00DD9E] dark:text-[#001E4D]'
              : 'text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>Ventas e Ingresos por Locutor</span>
        </button>
      </div>

      {mainView === 'staff_manager' ? (
        <AdminStaffPortalManager 
          mode="sales_only"
          onShowToast={onShowToast}
        />
      ) : (
        <>
          {/* ============================================================== */}
          {/* BLOQUE SUPERIOR: WIDGET TASAS BCV + CALCULADORA OFICIAL */}
          {/* ============================================================== */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/05 to-sky-500/10 dark:from-[#00DD9E]/15 dark:via-transparent dark:to-teal-900/20 border border-emerald-500/30 dark:border-[#00DD9E]/30 shadow-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          {/* Tasas Oficiales en Vivo */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2.5">
              <Emoji3D name="chart" className="w-8 h-8 drop-shadow-md flex-shrink-0" alt="BCV" />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-emerald-600 text-white shadow-xs">
                    Tasas Oficiales BCV
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Fecha Valor: <strong className="text-slate-800 dark:text-slate-200">{bcvRates.fechaValor || 'Hoy'}</strong>
                  </span>
                </div>
                <h3 className="font-display font-black text-lg text-slate-900 dark:text-white">
                  Referencia de Facturación en Bolívares
                </h3>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="px-4 py-2 rounded-2xl bg-white dark:bg-[#001E4D]/80 border border-slate-200 dark:border-[#00DD9E]/25 shadow-xs flex items-center space-x-3">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Dólar (USD):</span>
                <span className="font-display font-black text-base text-emerald-600 dark:text-[#00DD9E]">
                  {bcvRates.usd.toFixed(2)} Bs.
                </span>
              </div>

              <div className="px-4 py-2 rounded-2xl bg-white dark:bg-[#001E4D]/80 border border-slate-200 dark:border-[#00DD9E]/25 shadow-xs flex items-center space-x-3">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Euro (EUR):</span>
                <span className="font-display font-black text-base text-sky-600 dark:text-sky-400">
                  {bcvRates.eur.toFixed(2)} Bs.
                </span>
              </div>

              <button
                onClick={refreshBcvRates}
                disabled={isLoadingBcv}
                className="px-3 py-2 rounded-2xl bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-white/10 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                title="Actualizar tasas en vivo"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingBcv ? 'animate-spin' : ''}`} />
                <span>{isLoadingBcv ? 'Actualizando...' : 'Recargar Tasas'}</span>
              </button>
            </div>
          </div>

          {/* Calculadora Rápida Integrada */}
          <div className="w-full lg:w-auto bg-white dark:bg-[#19222e] p-3.5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">Calcular:</span>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(e.target.value)}
                  placeholder="Monto"
                  className="w-24 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-black/30 border border-slate-300 dark:border-white/15 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#00DD9E]"
                />
              </div>

              <select
                value={calcCurrency}
                onChange={(e) => setCalcCurrency(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-black/30 border border-slate-300 dark:border-white/15 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20">
              <span className="text-xs text-slate-500 dark:text-slate-400">Total:</span>
              <span className="font-mono font-black text-sm sm:text-base text-emerald-700 dark:text-[#00DD9E]">
                {currentConversion.formattedBs}
              </span>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(`Monto: ${calcAmount} ${calcCurrency} = ${currentConversion.formattedBs} (Tasa Oficial BCV: ${(calcCurrency === 'EUR' ? bcvRates.eur : bcvRates.usd).toFixed(2)} Bs.)`);
                setCalcCopied(true);
                setTimeout(() => setCalcCopied(false), 2000);
              }}
              className="p-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 transition cursor-pointer"
              title="Copiar desglose al portapapeles"
            >
              {calcCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </div>

      {/* ============================================================== */}
      {/* TARJETAS RESUMEN DE COBRANZAS */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Clientes Comerciales</span>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="font-display font-black text-2xl text-slate-900 dark:text-white mt-1">
            {activeCount}
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-[#00DD9E] font-bold">Activos en la radio</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Monto Mensual Facturado</span>
            <DollarSign className="w-4 h-4 text-[#00DD9E]" />
          </div>
          <p className="font-display font-black text-2xl text-emerald-600 dark:text-[#00DD9E] mt-1 font-mono">
            ${totalAmountBilledUsd.toFixed(2)} USD
          </p>
          <span className="text-[11px] text-slate-400">
            Aprox. {(totalAmountBilledUsd * bcvRates.usd).toLocaleString('es-VE', { maximumFractionDigits: 0 })} Bs.
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Saldo Pendiente / En Mora</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="font-display font-black text-2xl text-amber-500 dark:text-amber-400 mt-1 font-mono">
            ${pendingAmountUsd.toFixed(2)} USD
          </p>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">Por cobrar este ciclo</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* BARRA DE HERRAMIENTAS Y FILTROS */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenCreateClient}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#001E4D] to-teal-800 dark:from-[#00DD9E] dark:to-teal-400 text-white dark:text-[#001E4D] text-xs font-black transition shadow-sm hover:opacity-90 active:scale-95 duration-200 flex items-center space-x-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Cliente de la Radio</span>
          </button>

          <button
            onClick={() => {
              const nextState = !isGenreModalOpen;
              setIsGenreModalOpen(nextState);
              setIsClientModalOpen(false);
              setIsBankProfilesOpen(false);
              setIsReminderModalOpen(false);
              setIsPaymentModalOpen(false);
              if (nextState) scrollToSubpanel('genre-form-inline');
            }}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 text-slate-800 dark:text-white border border-slate-300 dark:border-white/15 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Gestionar Categorías ({genres.length})</span>
          </button>

          <button
            onClick={() => {
              const nextState = !isBankProfilesOpen;
              setIsBankProfilesOpen(nextState);
              setIsClientModalOpen(false);
              setIsGenreModalOpen(false);
              setIsReminderModalOpen(false);
              setIsPaymentModalOpen(false);
              if (nextState) scrollToSubpanel('bank-profiles-inline');
            }}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 text-slate-800 dark:text-white border border-slate-300 dark:border-white/15 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Landmark className="w-4 h-4" />
            <span>Cuentas & Pago Móvil ({bankProfiles.length})</span>
          </button>

          <SectionTrashToggle
            showTrash={showTrash}
            onToggleTrash={() => setShowTrash(!showTrash)}
            trashedCount={trashedCount}
            onEmptyTrash={handleEmptyTrash}
            sectionName="clientes"
          />
        </div>

        {/* Buscador y Filtros */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar cliente, RIF o cédula..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-2xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#00DD9E]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-2xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">Todos los Estados</option>
            <option value="paid">Al día (Pagado)</option>
            <option value="pending">Cobro Pendiente</option>
            <option value="overdue">Vencido / En Mora</option>
          </select>

          <select
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-2xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none hidden md:block"
          >
            <option value="all">Todas las Categorías</option>
            {genres.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: REGISTRAR / EDITAR CLIENTE */}
      {/* ============================================================== */}
      {isClientModalOpen && (
        <div id="client-form-inline" className="p-5 sm:p-6 rounded-2xl bg-slate-100 dark:bg-[#1c2633] border-2 border-emerald-500/30 shadow-xl space-y-4 animate-fadeIn my-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center space-x-3">
                <Emoji3D name="handshake" className="w-8 h-8" alt="Cliente" />
                <h3 className="font-display font-black text-lg text-slate-900 dark:text-white">
                  {editingClient ? 'Modificar Ficha del Cliente' : 'Registrar Nuevo Cliente Publicitario'}
                </h3>
              </div>
              <button
                onClick={() => setIsClientModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClientSubmit} className="space-y-4">
              
              {/* Sección 1: Datos del Establecimiento */}
              <div className="space-y-3">
                <h5 className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-[#00DD9E]">
                  1. Datos del Comercio o Negocio
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre Comercial / Local *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Restaurante Los Frailes"
                      value={clientForm.businessName}
                      onChange={(e) => setClientForm({ ...clientForm, businessName: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#00DD9E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">RIF del Comercio *</label>
                    <input
                      type="text"
                      placeholder="Ej: J-12345678-9"
                      value={clientForm.businessRif}
                      onChange={(e) => setClientForm({ ...clientForm, businessRif: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#00DD9E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tipo o Género del Local *</label>
                    <select
                      value={clientForm.genreId}
                      onChange={(e) => setClientForm({ ...clientForm, genreId: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none"
                    >
                      {genres.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Dirección Física</label>
                    <input
                      type="text"
                      placeholder="Ej: Calle Principal, Santo Domingo"
                      value={clientForm.address}
                      onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#00DD9E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1">
                      <Mic className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Locutor / Asesor Comercial</span>
                    </label>
                    <select
                      value={clientForm.locutorId || ''}
                      onChange={(e) => {
                        const sId = e.target.value;
                        const staffList = getAllStaffUsers();
                        const foundStaff = staffList.find(s => s.id === sId);
                        setClientForm({
                          ...clientForm,
                          locutorId: sId,
                          locutorName: foundStaff ? foundStaff.name : ''
                        });
                      }}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                    >
                      <option value="">(Sin locutor asignado / Dirección)</option>
                      {getAllStaffUsers().map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.programName || s.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Descripción completa del Negocio */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Descripción Completa del Negocio / Establecimiento (Sincronizada con Portal del Cliente)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Describe los productos, servicios, trayectoria, platos especiales o promociones para locuciones y pautas..."
                      value={clientForm.businessDescription || ''}
                      onChange={(e) => setClientForm({ ...clientForm, businessDescription: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#00DD9E]"
                    />
                    <span className="text-[11px] text-slate-400">
                      Esta descripción se sincroniza en tiempo real con el portal del cliente para facilitar la información comercial.
                    </span>
                  </div>

                  {/* Logo Oficial del Local (Adaptable, sin recortar en círculo ni cuadrado) */}
                  <div className="sm:col-span-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-black/25 border border-slate-200 dark:border-white/10 space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Logo del Establecimiento / Comercio (Formato Adaptable)</span>
                      </label>
                      <span className="text-[11px] text-slate-400">
                        PNG transparente, JPG, SVG o WebP • No se distorsiona ni se encierra en círculos
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      {/* Vista previa limpia sin marcos rígidos circulares o cuadrados */}
                      <div className="h-16 w-36 flex items-center justify-center p-2 rounded-xl bg-white/60 dark:bg-white/5 border border-dashed border-slate-300 dark:border-white/15 overflow-hidden flex-shrink-0">
                        {clientForm.logoUrl ? (
                          <img 
                            src={clientForm.logoUrl} 
                            alt="Logo cliente" 
                            className="max-h-14 max-w-[120px] w-auto h-auto object-contain filter drop-shadow-xs"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="text-center text-slate-400 text-[11px] font-semibold flex flex-col items-center">
                            <Store className="w-5 h-5 mb-0.5 opacity-40" />
                            <span>Sin Logo cargado</span>
                          </div>
                        )}
                      </div>

                      {/* Controles de Subida */}
                      <div className="flex-1 w-full space-y-2">
                        <div className="flex items-center gap-2">
                          <label className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-white/10 border border-slate-300 dark:border-white/15 text-xs font-bold text-slate-800 dark:text-white flex items-center justify-center space-x-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/15 transition shadow-xs">
                            <Upload className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Subir imagen de logo</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleLogoFileUpload} 
                              className="hidden" 
                            />
                          </label>

                          {clientForm.logoUrl && (
                            <button
                              type="button"
                              onClick={() => setClientForm(prev => ({ ...prev, logoUrl: '' }))}
                              className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold transition cursor-pointer"
                              title="Quitar logo"
                            >
                              Quitar
                            </button>
                          )}
                        </div>

                        <input
                          type="url"
                          placeholder="O pegar URL web directa del logo (ej: https://.../logo.png)"
                          value={clientForm.logoUrl}
                          onChange={(e) => setClientForm(prev => ({ ...prev, logoUrl: e.target.value }))}
                          className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-black/30 border border-slate-300 dark:border-white/10 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-[#00DD9E]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección 2: Contacto del Dueño y Administrador */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-white/5">
                <h5 className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-[#00DD9E]">
                  2. Contactos Oficiales
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre del Dueño *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: José Gregorio Pérez"
                      value={clientForm.ownerName}
                      onChange={(e) => setClientForm({ ...clientForm, ownerName: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#00DD9E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Cédula del Dueño</label>
                    <input
                      type="text"
                      placeholder="Ej: V-15.420.910"
                      value={clientForm.ownerCedula}
                      onChange={(e) => setClientForm({ ...clientForm, ownerCedula: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#00DD9E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Teléfono / WhatsApp Dueño</label>
                    <input
                      type="text"
                      placeholder="Ej: +58 424 745 9774"
                      value={clientForm.ownerPhone}
                      onChange={(e) => setClientForm({ ...clientForm, ownerPhone: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#00DD9E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre del Administrador</label>
                    <input
                      type="text"
                      placeholder="Ej: María Ramírez (Encargada)"
                      value={clientForm.adminContactName}
                      onChange={(e) => setClientForm({ ...clientForm, adminContactName: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#00DD9E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Teléfono del Administrador</label>
                    <input
                      type="text"
                      placeholder="Ej: +58 414 756 8921"
                      value={clientForm.adminContactPhone}
                      onChange={(e) => setClientForm({ ...clientForm, adminContactPhone: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#00DD9E]"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 3: Pauta Comercial y Facturación */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-white/5">
                <h5 className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-[#00DD9E]">
                  3. Pauta Comercial y Condiciones de Cobro
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Frecuencia de Pago</label>
                    <select
                      value={clientForm.paymentFrequency}
                      onChange={(e) => setClientForm({ ...clientForm, paymentFrequency: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="mensual">Mensual</option>
                      <option value="quincenal">Quincenal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Día de Cobro (Corte)</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={clientForm.billingDay}
                      onChange={(e) => setClientForm({ ...clientForm, billingDay: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#00DD9E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Monto Acordado ($ USD)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={clientForm.amountUsd}
                      onChange={(e) => setClientForm({ ...clientForm, amountUsd: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#00DD9E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Inicio de Publicidad</label>
                    <input
                      type="date"
                      value={clientForm.startDate}
                      onChange={(e) => setClientForm({ ...clientForm, startDate: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Culminación de Publicidad</label>
                    <input
                      type="date"
                      value={clientForm.endDate}
                      onChange={(e) => setClientForm({ ...clientForm, endDate: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Estado del Pago</label>
                    <select
                      value={clientForm.paymentStatus}
                      onChange={(e) => setClientForm({ ...clientForm, paymentStatus: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="paid">Al día (Pagado)</option>
                      <option value="pending">Cobro Pendiente</option>
                      <option value="overdue">Vencido / En Mora</option>
                    </select>
                  </div>
                </div>

                {/* ============================================================== */}
                {/* CANALES PUBLICITARIOS Y MEDIOS CONTRATADOS GRANULARES */}
                {/* ============================================================== */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white">
                      Canales Publicitarios & Medios Contratados
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Seleccione todos los servicios que aplican a este cliente
                    </span>
                  </div>

                  {/* 1. PUBLICIDAD EN RADIO (EN VIVO & ROTATIVA) */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-black/25 border border-slate-200 dark:border-white/10 space-y-2.5">
                    <div className="flex items-center space-x-2">
                      <Radio className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                        Publicidad en Radio (105.5 FM)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* En Vivo */}
                      <label className={`p-3 rounded-xl border flex items-start space-x-3 cursor-pointer transition ${
                        clientForm.services?.enVivo 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-white' 
                          : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'
                      }`}>
                        <input 
                          type="checkbox"
                          checked={!!clientForm.services?.enVivo}
                          onChange={(e) => setClientForm(prev => ({
                            ...prev,
                            services: { ...prev.services, enVivo: e.target.checked }
                          }))}
                          className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <div className="text-xs">
                          <p className="font-bold flex items-center space-x-1.5">
                            <Mic className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>Publicidad en Vivo</span>
                          </p>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            Menciones del locutor en programas en vivo
                          </span>
                        </div>
                      </label>

                      {/* Rotativa */}
                      <label className={`p-3 rounded-xl border flex items-start space-x-3 cursor-pointer transition ${
                        clientForm.services?.rotativa 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-white' 
                          : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'
                      }`}>
                        <input 
                          type="checkbox"
                          checked={!!clientForm.services?.rotativa}
                          onChange={(e) => setClientForm(prev => ({
                            ...prev,
                            services: { ...prev.services, rotativa: e.target.checked }
                          }))}
                          className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <div className="text-xs">
                          <p className="font-bold flex items-center space-x-1.5">
                            <RefreshCw className="w-3.5 h-3.5 text-[#00DD9E] shrink-0" />
                            <span>Publicidad Rotativa</span>
                          </p>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            Cuñas comerciales rotativas en la programación diaria
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* 2. PUBLICIDAD EN REDES SOCIALES */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-black/25 border border-slate-200 dark:border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Share2 className="w-4 h-4 text-blue-500" />
                        <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                          Publicidad en Redes Sociales
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">WhatsApp, Instagram, Facebook y TikTok</span>
                    </div>

                    <div className="space-y-2.5">
                      {/* WHATSAPP */}
                      <div className="p-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Emoji3D name="whatsapp" className="w-4 h-4" />
                            <span className="text-xs font-bold text-slate-900 dark:text-white">WhatsApp Oficial</span>
                          </div>
                          <span className="text-[11px] text-slate-400">Difusión, Publicitarios e Historias</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                          {/* Grupos de Difusión */}
                          <label className="flex items-start space-x-2 p-2 rounded-lg bg-slate-50 dark:bg-black/20 text-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-black/30 transition">
                            <input 
                              type="checkbox"
                              checked={!!clientForm.services?.redes?.whatsapp?.difusion}
                              onChange={(e) => {
                                const val = e.target.checked;
                                setClientForm(prev => ({
                                  ...prev,
                                  services: {
                                    ...prev.services,
                                    redes: {
                                      ...prev.services?.redes,
                                      enabled: true,
                                      whatsapp: {
                                        ...prev.services?.redes?.whatsapp,
                                        enabled: true,
                                        difusion: val
                                      }
                                    }
                                  }
                                }));
                              }}
                              className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <div>
                              <span className="font-bold text-slate-800 dark:text-slate-200">Grupos de Difusión</span>
                              <p className="text-[11px] text-slate-500">Listas directas a contactos</p>
                            </div>
                          </label>

                          {/* Grupos Publicitarios (Más NO informativos) */}
                          <label className="flex items-start space-x-2 p-2 rounded-lg bg-slate-50 dark:bg-black/20 text-xs cursor-pointer border border-emerald-500/20 hover:bg-slate-100 dark:hover:bg-black/30 transition">
                            <input 
                              type="checkbox"
                              checked={!!clientForm.services?.redes?.whatsapp?.publicitarios}
                              onChange={(e) => {
                                const val = e.target.checked;
                                setClientForm(prev => ({
                                  ...prev,
                                  services: {
                                    ...prev.services,
                                    redes: {
                                      ...prev.services?.redes,
                                      enabled: true,
                                      whatsapp: {
                                        ...prev.services?.redes?.whatsapp,
                                        enabled: true,
                                        publicitarios: val
                                      }
                                    }
                                  }
                                }));
                              }}
                              className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <div>
                              <span className="font-bold text-slate-800 dark:text-slate-200">Grupos Publicitarios</span>
                              <p className="text-[9.5px] text-amber-600 dark:text-amber-400 font-semibold leading-tight">
                                * Más no grupos informativos
                              </p>
                            </div>
                          </label>

                          {/* Historias / Estados */}
                          <label className="flex items-start space-x-2 p-2 rounded-lg bg-slate-50 dark:bg-black/20 text-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-black/30 transition">
                            <input 
                              type="checkbox"
                              checked={!!clientForm.services?.redes?.whatsapp?.historias}
                              onChange={(e) => {
                                const val = e.target.checked;
                                setClientForm(prev => ({
                                  ...prev,
                                  services: {
                                    ...prev.services,
                                    redes: {
                                      ...prev.services?.redes,
                                      enabled: true,
                                      whatsapp: {
                                        ...prev.services?.redes?.whatsapp,
                                        enabled: true,
                                        historias: val
                                      }
                                    }
                                  }
                                }));
                              }}
                              className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <div>
                              <span className="font-bold text-slate-800 dark:text-slate-200">Historias / Estados</span>
                              <p className="text-[11px] text-slate-500">Estados oficiales de la radio</p>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* INSTAGRAM, FACEBOOK & TIKTOK (HISTORIAS) */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {/* Instagram */}
                        <label className={`p-3 rounded-xl border flex items-start space-x-2.5 cursor-pointer transition ${
                          clientForm.services?.redes?.instagram?.historias
                            ? 'bg-rose-500/10 border-rose-500/30'
                            : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10'
                        }`}>
                          <input 
                            type="checkbox"
                            checked={!!clientForm.services?.redes?.instagram?.historias}
                            onChange={(e) => {
                              const val = e.target.checked;
                              setClientForm(prev => ({
                                ...prev,
                                services: {
                                  ...prev.services,
                                  redes: {
                                    ...prev.services?.redes,
                                    enabled: true,
                                    instagram: { enabled: val, historias: val }
                                  }
                                }
                              }));
                            }}
                            className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                          />
                          <div className="text-xs">
                            <div className="flex items-center space-x-1.5 font-bold text-slate-900 dark:text-white">
                              <Emoji3D name="instagram" className="w-3.5 h-3.5" />
                              <span>Instagram</span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">
                              Historias en @neblina105fm
                            </p>
                          </div>
                        </label>

                        {/* Facebook */}
                        <label className={`p-3 rounded-xl border flex items-start space-x-2.5 cursor-pointer transition ${
                          clientForm.services?.redes?.facebook?.historias
                            ? 'bg-blue-500/10 border-blue-500/30'
                            : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10'
                        }`}>
                          <input 
                            type="checkbox"
                            checked={!!clientForm.services?.redes?.facebook?.historias}
                            onChange={(e) => {
                              const val = e.target.checked;
                              setClientForm(prev => ({
                                ...prev,
                                services: {
                                  ...prev.services,
                                  redes: {
                                    ...prev.services?.redes,
                                    enabled: true,
                                    facebook: { enabled: val, historias: val }
                                  }
                                }
                              }));
                            }}
                            className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                          />
                          <div className="text-xs">
                            <div className="flex items-center space-x-1.5 font-bold text-slate-900 dark:text-white">
                              <Emoji3D name="facebook" className="w-3.5 h-3.5" />
                              <span>Facebook</span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">
                              Historias en página oficial
                            </p>
                          </div>
                        </label>

                        {/* TikTok */}
                        <label className={`p-3 rounded-xl border flex items-start space-x-2.5 cursor-pointer transition ${
                          clientForm.services?.redes?.tiktok?.historias
                            ? 'bg-purple-500/10 border-purple-500/30'
                            : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10'
                        }`}>
                          <input 
                            type="checkbox"
                            checked={!!clientForm.services?.redes?.tiktok?.historias}
                            onChange={(e) => {
                              const val = e.target.checked;
                              setClientForm(prev => ({
                                ...prev,
                                services: {
                                  ...prev.services,
                                  redes: {
                                    ...prev.services?.redes,
                                    enabled: true,
                                    tiktok: { enabled: val, historias: val }
                                  }
                                }
                              }));
                            }}
                            className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                          />
                          <div className="text-xs">
                            <div className="flex items-center space-x-1.5 font-bold text-slate-900 dark:text-white">
                              <Emoji3D name="tiktok" className="w-3.5 h-3.5" />
                              <span>TikTok</span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">
                              Historias en cuenta oficial
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* 3. PÁGINA WEB & APP STREAMING */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-black/25 border border-slate-200 dark:border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-teal-500" />
                        <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                          Página Web & Plataforma Streaming
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">Banners Publicitarios en Inicio y Notas de Prensa</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* Banners de Imágenes */}
                      <label className={`p-3 rounded-xl border flex items-start space-x-3 cursor-pointer transition ${
                        clientForm.services?.web?.imagenes
                          ? 'bg-teal-500/10 border-teal-500/30 text-teal-950 dark:text-white'
                          : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'
                      }`}>
                        <input 
                          type="checkbox"
                          checked={!!clientForm.services?.web?.imagenes}
                          onChange={(e) => {
                            const val = e.target.checked;
                            setClientForm(prev => ({
                              ...prev,
                              services: {
                                ...prev.services,
                                web: {
                                  ...prev.services?.web,
                                  enabled: val || !!prev.services?.web?.videos,
                                  imagenes: val
                                }
                              }
                            }));
                          }}
                          className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                        />
                        <div className="text-xs">
                          <p className="font-bold flex items-center space-x-1.5">
                            <ImageIcon className="w-3.5 h-3.5 text-teal-500" />
                            <span>Banners de Imágenes</span>
                          </p>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            Formatos JPG, PNG y WebP rotativos
                          </span>
                        </div>
                      </label>

                      {/* Banners de Videos */}
                      <label className={`p-3 rounded-xl border flex items-start space-x-3 cursor-pointer transition ${
                        clientForm.services?.web?.videos
                          ? 'bg-teal-500/10 border-teal-500/30 text-teal-950 dark:text-white'
                          : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'
                      }`}>
                        <input 
                          type="checkbox"
                          checked={!!clientForm.services?.web?.videos}
                          onChange={(e) => {
                            const val = e.target.checked;
                            setClientForm(prev => ({
                              ...prev,
                              services: {
                                ...prev.services,
                                web: {
                                  ...prev.services?.web,
                                  enabled: val || !!prev.services?.web?.imagenes,
                                  videos: val
                                }
                              }
                            }));
                          }}
                          className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                        />
                        <div className="text-xs">
                          <p className="font-bold flex items-center space-x-1.5">
                            <Film className="w-3.5 h-3.5 text-purple-500" />
                            <span>Banners de Videos</span>
                          </p>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            Formatos MP4 y WebM con reproducción integrada
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Notas Internas</label>
                  <textarea
                    rows="2"
                    placeholder="Menciones en programas específicos, horarios o acuerdos particulares..."
                    value={clientForm.notes}
                    onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#00DD9E]"
                  />
                </div>

              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 text-xs font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-md transition"
                >
                  {editingClient ? 'Guardar Cambios' : 'Registrar Cliente'}
                </button>
              </div>

            </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: GESTOR DE GÉNEROS / CATEGORÍAS */}
      {/* ============================================================== */}
      {isGenreModalOpen && (
        <div id="genre-form-inline" className="p-5 sm:p-6 rounded-2xl bg-slate-100 dark:bg-[#1c2633] border-2 border-emerald-500/30 shadow-xl space-y-4 animate-fadeIn my-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center space-x-2.5">
                <FolderPlus className="w-6 h-6 text-emerald-500" />
                <h4 className="font-display font-black text-base text-slate-900 dark:text-white">
                  Tipos y Géneros de Establecimientos
                </h4>
              </div>
              <button
                onClick={() => setIsGenreModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Crea nuevas categorías o elimina las que ya no utilices para organizar tus clientes de la radio.
            </p>

            <form onSubmit={handleAddGenre} className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Ej: Billares, Discotecas, Ropa..."
                value={newGenreName}
                onChange={(e) => setNewGenreName(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#00DD9E]"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Añadir</span>
              </button>
            </form>

            <div className="max-h-60 overflow-y-auto space-y-2 pt-2">
              {genres.map(g => (
                <div key={g.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {g.name}
                  </span>
                  <button
                    onClick={() => handleDeleteGenre(g.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 transition"
                    title="Eliminar categoría"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setIsGenreModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-bold"
              >
                Listo
              </button>
            </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-PANEL INLINE: PERFILES DE CUENTAS BANCARIAS Y PAGO MÓVIL   */}
      {/* ============================================================== */}
      {isBankProfilesOpen && (
        <div id="bank-profiles-inline" className="p-5 sm:p-6 rounded-xl bg-slate-100 dark:bg-[#1c2633] border-2 border-emerald-500/30 shadow-xl space-y-4 animate-fadeIn my-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
            <div className="flex items-center space-x-2.5">
              <Landmark className="w-6 h-6 text-emerald-500" />
              <div>
                <h4 className="font-display font-black text-base text-slate-900 dark:text-white">
                  Perfiles de Cuentas Bancarias y Pago Móvil para Facturación
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Administre múltiples cuentas receptoras para asociarlas a recordatorios de cobro, pagos y facturas.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsBankProfilesOpen(false)}
              className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSaveBankProfileSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white dark:bg-black/25 p-4 rounded-xl border border-slate-200 dark:border-white/10">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Etiqueta del Perfil *</label>
              <input
                type="text"
                required
                placeholder="Ej: Cuenta Principal BDV"
                value={bankForm.label}
                onChange={(e) => setBankForm({ ...bankForm, label: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Banco y Código *</label>
              <input
                type="text"
                required
                placeholder="Ej: Banco de Venezuela (0102)"
                value={bankForm.bankName}
                onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white font-semibold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">N° de Cuenta (20 dígitos o alias)</label>
              <input
                type="text"
                placeholder="0102-0000-00-0000000000"
                value={bankForm.accountNumber}
                onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Teléfono Pago Móvil *</label>
              <input
                type="text"
                required
                placeholder="0424-7459774"
                value={bankForm.phone}
                onChange={(e) => setBankForm({ ...bankForm, phone: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Cédula / RIF *</label>
              <input
                type="text"
                required
                placeholder="J-31489201-4"
                value={bankForm.cedulaRif}
                onChange={(e) => setBankForm({ ...bankForm, cedulaRif: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Titular / Beneficiario *</label>
              <input
                type="text"
                required
                placeholder="Neblina Stereo 105.5 FM C.A."
                value={bankForm.holderName}
                onChange={(e) => setBankForm({ ...bankForm, holderName: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white font-semibold"
              />
            </div>
            <div className="sm:col-span-3 flex items-center justify-end space-x-2 pt-2 border-t border-slate-200 dark:border-white/10">
              {editingBankProfileId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingBankProfileId('');
                    setBankForm({ label: '', bankName: '', accountNumber: '', accountType: 'Corriente / Pago Móvil', phone: '', cedulaRif: '', holderName: '', ownerType: 'admin' });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-200 font-bold cursor-pointer"
                >
                  Cancelar Edición
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-[#00DD9E] text-[#001E4D] font-black uppercase tracking-wider cursor-pointer shadow-xs"
              >
                {editingBankProfileId ? 'Actualizar Cuenta Bancaria' : '+ Guardar Perfil Bancario'}
              </button>
            </div>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto">
            {bankProfiles.map(bp => (
              <div key={bp.id} className="p-3 rounded-xl bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 flex items-start justify-between gap-2 text-xs">
                <div className="space-y-0.5 min-w-0">
                  <span className="font-black text-emerald-600 dark:text-[#00DD9E] block truncate">{bp.label}</span>
                  <p className="font-bold text-slate-900 dark:text-white">{bp.bankName} · {bp.holderName}</p>
                  <p className="text-[11px] font-mono text-slate-500">
                    Tel: {bp.phone || 'N/A'} · RIF/CI: {bp.cedulaRif || 'N/A'} {bp.accountNumber ? `· Cta: ${bp.accountNumber}` : ''}
                  </p>
                </div>
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleEditBankProfile(bp)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 cursor-pointer"
                    title="Editar perfil bancario"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteBankProfileClick(bp.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-500/15 text-rose-500 cursor-pointer"
                    title="Eliminar perfil bancario"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: RECORDATORIO DE COBRO POR WHATSAPP CON TASA BCV */}
      {/* ============================================================== */}
      {isReminderModalOpen && selectedClientForReminder && currentReminderGenerated && (
        <div id="reminder-form-inline" className="p-5 sm:p-6 rounded-2xl bg-slate-100 dark:bg-[#1c2633] border-2 border-emerald-500/30 shadow-xl space-y-4 animate-fadeIn my-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center space-x-2.5">
                <Emoji3D name="whatsapp" className="w-7 h-7" alt="WhatsApp" />
                <div>
                  <h4 className="font-display font-black text-base text-slate-900 dark:text-white">
                    Enviar Recordatorio de Cobro
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {selectedClientForReminder.businessName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsReminderModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Opciones de Envío */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Destinatario:</label>
                <select
                  value={reminderRecipient}
                  onChange={(e) => setReminderRecipient(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-black/30 border border-slate-300 dark:border-white/10 font-bold text-slate-900 dark:text-white"
                >
                  <option value="owner">Dueño: {selectedClientForReminder.ownerName}</option>
                  {selectedClientForReminder.adminContactName && (
                    <option value="admin">Administrador: {selectedClientForReminder.adminContactName}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tono del Mensaje:</label>
                <select
                  value={reminderType}
                  onChange={(e) => setReminderType(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-black/30 border border-slate-300 dark:border-white/10 font-bold text-slate-900 dark:text-white"
                >
                  <option value="upcoming">Recordatorio Previo</option>
                  <option value="due">Día de Cobro (Formal)</option>
                  <option value="overdue">Notificación de Mora</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Moneda Referencia:</label>
                <select
                  value={reminderCurrency}
                  onChange={(e) => setReminderCurrency(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-black/30 border border-slate-300 dark:border-white/10 font-bold text-slate-900 dark:text-white"
                >
                  <option value="USD">Dólar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Cuenta Bancaria Receptora:</label>
                <select
                  value={reminderBankProfileId}
                  onChange={(e) => setReminderBankProfileId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-black/30 border border-slate-300 dark:border-white/10 font-bold text-slate-900 dark:text-white"
                >
                  {bankProfiles.map(bp => (
                    <option key={bp.id} value={bp.id}>
                      {bp.label} ({bp.bankName})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Monto Personalizado si se desea ajustar */}
            <div className="flex items-center space-x-3 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20">
              <div className="flex-1">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Monto Acordado en {reminderCurrency}:</span>
                <input
                  type="number"
                  step="0.01"
                  value={reminderCustomAmount}
                  onChange={(e) => setReminderCustomAmount(e.target.value)}
                  className="w-full px-2 py-1 rounded-lg bg-white dark:bg-black/40 border border-emerald-500/30 text-sm font-black text-slate-900 dark:text-white"
                />
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Total en Bolívares (Tasa BCV):</span>
                <p className="font-mono font-black text-base text-emerald-700 dark:text-[#00DD9E]">
                  {currentReminderGenerated.conversion.formattedBs}
                </p>
              </div>
            </div>

            {/* Previsualización del Mensaje */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-500">Vista Previa del Mensaje Oficial:</span>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 max-h-52 overflow-y-auto font-mono text-[11px] text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                {currentReminderGenerated.rawMessage}
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(currentReminderGenerated.rawMessage);
                  if (onShowToast) onShowToast('Mensaje copiado al portapapeles');
                }}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Texto</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsReminderModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-bold"
                >
                  Cerrar
                </button>

                <a
                  href={currentReminderGenerated.encodedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md transition flex items-center space-x-2 cursor-pointer"
                >
                  <Emoji3D name="whatsapp" className="w-4 h-4" alt="WhatsApp" />
                  <span>Abrir en WhatsApp</span>
                </a>
              </div>
            </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: REGISTRAR PAGO RECIBIDO */}
      {/* ============================================================== */}
      {isPaymentModalOpen && selectedClientForPayment && (
        <div id="payment-form-inline" className="p-5 sm:p-6 rounded-2xl bg-slate-100 dark:bg-[#1c2633] border-2 border-emerald-500/30 shadow-xl space-y-4 animate-fadeIn my-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center space-x-2.5">
                <Receipt className="w-6 h-6 text-emerald-500" />
                <div>
                  <h4 className="font-display font-black text-base text-slate-900 dark:text-white">
                    Registrar Cobranza / Pago
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {selectedClientForPayment.businessName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePaymentSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Monto en $ USD</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={paymentForm.amountUsd}
                    onChange={(e) => {
                      const val = e.target.value;
                      const conv = convertCurrencyToBs(parseFloat(val) || 0, 'USD', bcvRates.usd);
                      setPaymentForm({
                        ...paymentForm,
                        amountUsd: val,
                        amountBs: conv.amountBs.toFixed(2)
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 font-black text-slate-900 dark:text-white focus:outline-none focus:border-[#00DD9E]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Equivalente en Bs. (BCV)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentForm.amountBs}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amountBs: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 font-mono font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Método de Pago</label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 font-bold text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="pago_movil_bcv">Pago Móvil / Transferencia en Bolívares (Tasa BCV)</option>
                    <option value="efectivo_usd">Efectivo Divisas ($ USD)</option>
                    <option value="transferencia_usd">Transferencia en Divisas (Zelle / Cuenta Externa)</option>
                    <option value="efectivo_bs">Efectivo en Bolívares</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Cuenta Bancaria Receptora</label>
                  <select
                    value={paymentForm.bankProfileId}
                    onChange={(e) => setPaymentForm({ ...paymentForm, bankProfileId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 font-bold text-slate-900 dark:text-white focus:outline-none"
                  >
                    {bankProfiles.map(bp => (
                      <option key={bp.id} value={bp.id}>
                        {bp.label} — {bp.bankName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">N° de Referencia / Comprobante</label>
                  <input
                    type="text"
                    placeholder="Ej: Ref 089123"
                    value={paymentForm.reference}
                    onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 font-semibold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Fecha del Pago</label>
                  <input
                    type="date"
                    value={paymentForm.date}
                    onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 font-semibold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Observaciones</label>
                <input
                  type="text"
                  placeholder="Ej: Pago mensualidad completa mes de octubre..."
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-md transition"
                >
                  Confirmar Pago
                </button>
              </div>
            </form>

        </div>
      )}

      
      {/* ============================================================== */}
      {/* LISTADO DE TARJETAS DE CLIENTES */}
      {/* ============================================================== */}
      {filteredClients.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10">
          <Emoji3D name="folder" className="w-12 h-12 mx-auto mb-3 opacity-60" />
          <h4 className="font-display font-bold text-slate-900 dark:text-white text-base">
            No se encontraron clientes comerciales
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            {showTrash ? 'La papelera de clientes está vacía.' : 'Registra un nuevo cliente con el botón superior.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredClients.map((client) => {
            const genreObj = genres.find(g => g.id === client.genreId);
            const conversion = convertCurrencyToBs(client.amountUsd || 0, 'USD', bcvRates.usd);

            let statusBadge = {
              text: 'Al día',
              color: 'bg-emerald-500/10 text-emerald-600 dark:text-[#00DD9E] border-emerald-500/20'
            };
            if (client.paymentStatus === 'pending') {
              statusBadge = {
                text: 'Pendiente',
                color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
              };
            } else if (client.paymentStatus === 'overdue') {
              statusBadge = {
                text: 'Vencido / En Mora',
                color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
              };
            }

            return (
              <div 
                key={client.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm hover:border-[#00DD9E]/40 transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Encabezado de la Tarjeta */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      {client.logoUrl ? (
                        <div className="h-11 sm:h-12 w-auto max-w-[110px] min-w-[40px] flex items-center justify-center flex-shrink-0 bg-transparent">
                          <img 
                            src={client.logoUrl} 
                            alt={client.businessName}
                            className="max-h-11 sm:max-h-12 max-w-[110px] w-auto h-auto object-contain filter drop-shadow-xs transition-transform duration-200 hover:-translate-y-0.5"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        </div>
                      ) : (
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#001E4D] to-[#00DD9E] text-white flex items-center justify-center font-display font-black text-sm flex-shrink-0 shadow-xs">
                          {client.businessName?.[0]?.toUpperCase() || 'C'}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border ${statusBadge.color}`}>
                            {statusBadge.text}
                          </span>
                          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                            {genreObj?.name || 'Comercio'}
                          </span>
                        </div>
                        <h4 className="font-display font-black text-base text-slate-900 dark:text-white mt-0.5">
                          {client.businessName}
                        </h4>
                        <span className="text-[11px] font-mono text-slate-400">
                          RIF: {client.businessRif || 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-display font-black text-lg text-emerald-600 dark:text-[#00DD9E] font-mono">
                        ${client.amountUsd || 0} USD
                      </span>
                      <p className="text-[11px] text-slate-500 font-mono">
                        ≈ {conversion.formattedBs}
                      </p>
                    </div>
                  </div>

                  {/* Datos del Dueño & Administrador */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-black/20 border border-slate-200/80 dark:border-white/5 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Dueño:</span>
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {client.ownerName} ({client.ownerCedula || 'S/C'})
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Teléfono Dueño:</span>
                      <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        {client.ownerPhone || 'N/A'}
                      </span>
                    </div>

                    {client.adminContactName && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-white/5">
                        <span className="text-slate-500 dark:text-slate-400">Administrador(a):</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                          {client.adminContactName} ({client.adminContactPhone || 'S/T'})
                        </span>
                      </div>
                    )}

                    {client.address && (
                      <div className="flex items-start space-x-1.5 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <MapPin className="w-3 h-3 text-slate-400 mt-0.5 flex-shrink-0" />
                        <span className="truncate">{client.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Datos del Plan & Fechas */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/10 font-bold text-slate-700 dark:text-slate-300">
                        {client.paymentFrequency === 'quincenal' ? 'Quincenal' : 'Mensual'}
                      </span>
                      <span>Día de cobro: <strong>{client.billingDay}</strong></span>
                    </div>

                    {client.lastPaymentDate && (
                      <span>Último pago: <strong>{client.lastPaymentDate}</strong></span>
                    )}
                  </div>

                  {/* Canales y Servicios Publicitarios Contratados */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Pauta & Canales Activos:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {/* En Vivo */}
                      {(client.services?.enVivo || client.packageType?.includes('en_vivo') || client.packageType?.includes('combo')) && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center space-x-1">
                          <Mic className="w-3 h-3 shrink-0" />
                          <span>En Vivo</span>
                        </span>
                      )}

                      {/* Rotativa */}
                      {(client.services?.rotativa || client.packageType?.includes('rotativas') || client.packageType?.includes('combo')) && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-teal-500/10 text-teal-700 dark:text-[#00DD9E] border border-teal-500/20 flex items-center space-x-1">
                          <RefreshCw className="w-3 h-3 shrink-0" />
                          <span>Rotativa</span>
                        </span>
                      )}

                      {/* WhatsApp */}
                      {(client.services?.redes?.whatsapp?.difusion || client.services?.redes?.whatsapp?.publicitarios || client.services?.redes?.whatsapp?.historias) && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 flex items-center space-x-1">
                          <Emoji3D name="whatsapp" className="w-3 h-3" />
                          <span>
                            WhatsApp ({[
                              client.services?.redes?.whatsapp?.difusion && 'Difusión',
                              client.services?.redes?.whatsapp?.publicitarios && 'Publicitarios',
                              client.services?.redes?.whatsapp?.historias && 'Historias'
                            ].filter(Boolean).join(', ')})
                          </span>
                        </span>
                      )}

                      {/* Instagram */}
                      {client.services?.redes?.instagram?.historias && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 flex items-center space-x-1">
                          <Emoji3D name="instagram" className="w-3 h-3" />
                          <span>IG Historias</span>
                        </span>
                      )}

                      {/* Facebook */}
                      {client.services?.redes?.facebook?.historias && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 flex items-center space-x-1">
                          <Emoji3D name="facebook" className="w-3 h-3" />
                          <span>FB Historias</span>
                        </span>
                      )}

                      {/* TikTok */}
                      {client.services?.redes?.tiktok?.historias && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20 flex items-center space-x-1">
                          <Emoji3D name="tiktok" className="w-3 h-3" />
                          <span>TikTok Historias</span>
                        </span>
                      )}

                      {/* Web Banners Imágenes */}
                      {(client.services?.web?.imagenes || (!client.services && (client.packageType?.includes('web') || client.packageType?.includes('combo')))) && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20 flex items-center space-x-1">
                          <ImageIcon className="w-3 h-3 text-cyan-500" />
                          <span>Web: Imágenes</span>
                        </span>
                      )}

                      {/* Web Banners Videos */}
                      {client.services?.web?.videos && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 flex items-center space-x-1">
                          <Film className="w-3 h-3 text-indigo-500" />
                          <span>Web: Videos</span>
                        </span>
                      )}

                      {/* Locutor / Asesor Comercial Asignado */}
                      {client.locutorName && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-[#00DD9E] border border-emerald-500/20 flex items-center space-x-1">
                          <Mic className="w-3 h-3 text-emerald-500" />
                          <span>Locutor: {client.locutorName}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Acciones de la Tarjeta */}
                <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                  {!client.trashed ? (
                    <>
                      <div className="flex items-center flex-wrap gap-1.5">
                        {/* Enviar Recordatorio por WhatsApp */}
                        <button
                          onClick={() => handleOpenWhatsAppReminder(client)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                          title="Enviar recordatorio de cobro por WhatsApp con cálculo oficial BCV"
                        >
                          <Emoji3D name="whatsapp" className="w-3.5 h-3.5" alt="WhatsApp" />
                          <span>Cobro WhatsApp</span>
                        </button>

                        {/* Registrar Pago */}
                        <button
                          onClick={() => handleOpenPaymentModal(client)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-800 dark:text-white text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                          title="Registrar pago recibido"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Pagar</span>
                        </button>

                        {/* Generar Informe Publicitario */}
                        <button
                          onClick={() => {
                            setReportClientId(client.id);
                            setIsReportModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                          title="Generar informe publicitario detallado para este cliente"
                        >
                          <BarChart3 className="w-3.5 h-3.5" />
                          <span>Informe</span>
                        </button>
                      </div>

                      <div className="flex items-center space-x-1 self-end sm:self-auto shrink-0">
                        {/* Gestionar Portal, Material & Claves de este cliente */}
                        <button
                          onClick={() => setMainView('portal_manager')}
                          className="p-1.5 rounded-xl hover:bg-emerald-500/10 text-emerald-600 dark:text-[#00DD9E] transition cursor-pointer"
                          title="Gestionar Portal de Cliente, Material Publicitario y Claves"
                        >
                          <Key className="w-3.5 h-3.5" />
                        </button>

                        {/* Gestionar Equipo de Locutores y Ventas */}
                        <button
                          onClick={() => setMainView('staff_manager')}
                          className="p-1.5 rounded-xl hover:bg-emerald-500/10 text-emerald-600 dark:text-[#00DD9E] transition cursor-pointer"
                          title="Gestionar Equipo de Locutores y Ventas"
                        >
                          <Mic className="w-3.5 h-3.5" />
                        </button>

                        {onNavigateToBanners && (
                          <button
                            onClick={() => onNavigateToBanners(client.id)}
                            className="p-1.5 rounded-xl hover:bg-teal-500/10 text-teal-600 dark:text-[#00DD9E] transition cursor-pointer"
                            title="Gestionar Banners y Spots de este Cliente"
                          >
                            <Megaphone className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenEditClient(client)}
                          className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                          title="Editar Cliente"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleTrash(client.id)}
                          className="p-1.5 rounded-xl hover:bg-rose-500/10 text-rose-500 transition cursor-pointer"
                          title="Mover a papelera"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs text-rose-500 font-bold">En papelera</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleRestore(client.id)}
                          className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-[#00DD9E] text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restaurar</span>
                        </button>
                        <button
                          onClick={() => handleDeletePermanently(client.id)}
                          className="px-3 py-1 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Borrar definitivo</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
      </>
    )}

      {/* ============================================================== */}
      {/* MODAL DE INFORME DETALLADO DE CLIENTE */}
      {/* ============================================================== */}
      <ClientAdReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        clientId={reportClientId}
        onShowToast={onShowToast}
      />

    </div>
  );
}
