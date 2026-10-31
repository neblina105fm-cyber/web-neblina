import React, { useState, useEffect, lazy, Suspense } from 'react';
import { createPortal } from 'react-dom';
import {
  Archive,
  LogOut,
  Building2, 
  Newspaper, 
  Megaphone, 
  Calendar, 
  BarChart3, 
  Sliders, 
  Lock, 
  Unlock, 
  Key, 
  Eye, 
  EyeOff, 
  Plus, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Upload, 
  RotateCcw, 
  Search, 
  ExternalLink, 
  Globe, 
  Phone, 
  MessageCircle, 
  MapPin, 
  Sparkles, 
  Clock, 
  User, 
  X, 
  Layers, 
  ShieldCheck,
  Send,
  Radio,
  FileText,
  Users,
  Mic,
  RefreshCw,
  Menu,
  Sun,
  Moon,
  ArrowLeft,
  Settings,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Image as ImageIcon,
  Images,
  ImagePlus,
  Tag,
  FolderPlus,
  FolderX,
  MessageSquare,
  UserCheck,
  Handshake,
  HeartHandshake,
  Store,
  AlertTriangle,
  KeyRound,
  Wrench,
  Bell
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import NewsImageCarousel from '../NewsImageCarousel';
import { 
  getAllCategories, 
  addCategory, 
  updateCategory, 
  deleteCategory, 
  recalculateCategoryCounts 
} from '../../services/newsCategoriesService';
import SectionTrashToggle from './SectionTrashToggle';
const AdminContactsTab = lazy(() => import('./AdminContactsTab'));
const AdminClientsTab = lazy(() => import('./AdminClientsTab'));
const AdminBannersTab = lazy(() => import('./AdminBannersTab'));
const AdminAnalyticsTab = lazy(() => import('./AdminAnalyticsTab'));
const AdminClientPortalManager = lazy(() => import('./AdminClientPortalManager'));
const AdminStaffPortalManager = lazy(() => import('./AdminStaffPortalManager'));
const AdminJournalistsTab = lazy(() => import('./AdminJournalistsTab'));
const AdminAiRepostTab = lazy(() => import('./AdminAiRepostTab'));
const AdminPublicServiceTab = lazy(() => import('./AdminPublicServiceTab'));
import SystemInstallButton from '../SystemInstallButton';
import { getAllPublicServices } from '../../services/publicServiceData';
import { getAllClients } from '../../services/radioClientsService';
import { getAllBanners } from '../../services/adBannerService';
import { getAllStaffUsers } from '../../services/staffPortalService';
import { getAllJournalists, getAllPressNotes } from '../../services/journalistsService';
import { getAllUnifiedContacts } from '../../services/unifiedContactsService';
import { 
  getWordPressConfig, 
  saveWordPressConfig, 
  testWordPressConnection, 
  publishPostToWordPress,
  migrateWordPressAllData
} from '../../services/wordpressService';
import { 
  loginAdmin, 
  logoutAdmin, 
  isSessionAuthenticated, 
  getStoredUsername, 
  updateAdminCredentials, 
  resetDefaultCredentials, 
  DEFAULT_CREDENTIALS 
} from '../../services/authService';
import { 
  getAllNews, 
  saveNewsItem, 
  saveAllNews,
  deleteNewsItem, 
  trashNewsItem,
  restoreNewsItem,
  deleteNewsItemPermanently,
  emptyNewsTrash,
  toggleNewsFeatured, 
  toggleNewsPublished, 
  NEWS_CATEGORIES, 
  exportNewsJSON, 
  importNewsJSON, 
  resetDefaultNews 
} from '../../services/newsData';
import { fetchWordPressNews } from '../../services/api';
import { 
  getAllSponsors, 
  saveSponsor, 
  deleteSponsor, 
  trashSponsor,
  restoreSponsor,
  emptySponsorsTrash,
  toggleSponsorActive, 
  toggleSponsorFeaturedInHome, 
  SPONSOR_CATEGORIES, 
  exportSponsorsJSON, 
  importSponsorsJSON, 
  resetDefaultSponsors 
} from '../../services/sponsorsData';
import { 
  getAllReports, 
  saveAllReports, 
  updateReportStatus, 
  deleteCitizenReport, 
  trashReport,
  restoreReport,
  emptyReportsTrash,
  exportReportsJSON, 
  exportReportsCSV, 
  REPORT_STATUSES 
} from '../../services/reportsService';
import { 
  getAllCitizens, 
  saveAllCitizens, 
  deleteCitizen, 
  exportCitizensJSON, 
  exportCitizensCSV 
} from '../../services/citizensDirectoryService';
import { 
  getAllSchedule, 
  saveScheduleShow, 
  deleteScheduleShow, 
  trashScheduleShow,
  restoreScheduleShow,
  emptyScheduleTrash,
  toggleScheduleShowActive, 
  exportScheduleJSON, 
  resetDefaultSchedule 
} from '../../services/scheduleData';
import {
  getAllNewsComments,
  updateNewsCommentStatus,
  deleteNewsComment,
  trashNewsComment,
  restoreNewsComment,
  deleteNewsCommentPermanently,
  emptyNewsCommentsTrash,
  getPendingCommentsCount,
  exportNewsCommentsJSON,
  exportNewsCommentsCSV,
  resetDefaultNewsComments,
  saveAllNewsComments
} from '../../services/newsCommentsService';
import { 
  getAllTalents,
  archiveTalent,
  unarchiveTalent, 
  saveAllTalents, 
  saveTalent, 
  deleteTalent, 
  trashTalent,
  restoreTalent,
  emptyTalentsTrash,
  toggleTalentActive, 
  resetDefaultTalents, 
  exportTalentsJSON, 
  importTalentsJSON 
} from '../../services/talentsData';
import { saveAllClients } from '../../services/radioClientsService';
import { saveAllInvoices, saveAllClientUsers, saveAllClientAssets, saveAllRequests, saveAllInternalMessages, saveAllClientNotifications } from '../../services/clientPortalService';
import { saveAllStaffUsers, saveAllStaffTasks, saveAllStaffInterviews, saveAllStaffNotes, saveAllStaffMessages } from '../../services/staffPortalService';
import { saveAllUnifiedContacts } from '../../services/unifiedContactsService';
import { 
  getAllEvents, 
  saveAllEvents, 
  saveEvent, 
  deleteEvent, 
  trashEvent,
  restoreEvent,
  emptyEventsTrash,
  toggleEventActive, 
  resetDefaultEvents, 
  exportEventsJSON, 
  importEventsJSON, 
  EVENT_CATEGORIES 
} from '../../services/eventsData';
import { 
  getPrivateAnalyticsSummary, 
  getPrivateAnalyticsLogs, 
  exportAnalyticsDatabase 
} from '../../services/analyticsLogger';
import {
  getRankingYoutubePlaylist,
  saveRankingYoutubePlaylist,
  promoteQueuedPlaylistNow,
  getPlaylistAdminReminderStatus,
  PLAYLIST_SCHEDULE_SLOTS,
  checkAndPromoteQueuedPlaylist
} from '../../services/rankingService';
import Emoji3D from '../Emoji3D';
import AnimatedBackground from '../AnimatedBackground';

export default function AdminModal({ isOpen, onClose, isStandalonePage = false }) {
  // Manejo de Tema Claro / Oscuro
  let theme = 'dark';
  let toggleTheme = () => {};
  try {
    const themeContext = useTheme();
    theme = themeContext.theme;
    toggleTheme = themeContext.toggleTheme;
  } catch (e) {}

  // Estado de Autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(() => isSessionAuthenticated());
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // Navegación de Pestañas
  const [activeTab, setActiveTab] = useState('news'); // 'news' | 'sponsors' | 'reports' | 'schedule' | 'talents' | 'events' | 'analytics' | 'wordpress' | 'tools'
  const [selectedBannerClientId, setSelectedBannerClientId] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // ========== ESTADOS DE INTEGRACIÓN WORDPRESS REST API ==========
  const [wpConfig, setWpConfig] = useState(() => getWordPressConfig());
  const [isTestingWp, setIsTestingWp] = useState(false);
  const [wpTestResult, setWpTestResult] = useState(null);
  const [showWpPassword, setShowWpPassword] = useState(false);
  const [isMigratingWp, setIsMigratingWp] = useState(false);
  const [wpMigrationProgress, setWpMigrationProgress] = useState('');
  const [wpMigrationResult, setWpMigrationResult] = useState(null);
  const [wpFormState, setWpFormState] = useState({
    apiUrl: wpConfig.apiUrl || 'https://neblina105fm.com/wp-json/wp/v2',
    username: wpConfig.username || '',
    appPassword: wpConfig.appPassword || ''
  });

  // ========== ESTADOS DE NOTICIAS ==========
  const [newsList, setNewsList] = useState([]);
  const [newsSearch, setNewsSearch] = useState('');
  const [newsCategoryFilter, setNewsCategoryFilter] = useState('Todas');
  const [isNewsFormOpen, setIsNewsFormOpen] = useState(false);
  const [isSyncingNews, setIsSyncingNews] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [categoriesList, setCategoriesList] = useState(() => getAllCategories());
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  const [adminNewsPage, setAdminNewsPage] = useState(1);
  const ADMIN_NEWS_PER_PAGE = 10; // Lotes estrictos de 10 notas en el sistema

  const [newsFormData, setNewsFormData] = useState({
    id: '',
    title: '',
    excerpt: '',
    content: '',
    category: 'Noticias',
    author: 'Redacción Neblina 105.5 FM',
    date: '',
    image: '',
    images: ['', '', ''], // 1 a 3 fotos para carrusel
    socialEmbedUrl: '',
    featuredInCarousel: true,
    status: 'published',
    publishToWordPress: true
  });

  // ========== ESTADOS DE ALIADOS COMERCIALES ==========
  const [sponsorsList, setSponsorsList] = useState([]);
  const [sponsorSearch, setSponsorSearch] = useState('');
  const [sponsorCategoryFilter, setSponsorCategoryFilter] = useState('Todas');
  const [isSponsorFormOpen, setIsSponsorFormOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState(null);
  const [sponsorFormData, setSponsorFormData] = useState({
    id: '',
    name: '',
    rif: '',
    category: 'Hospedaje & Hoteles',
    tag: '',
    slogan: '',
    description: '',
    location: '',
    locationDetails: '',
    googleMapsUrl: '',
    menuUrl: '',
    whatsapp: '584247459774',
    instagram: '',
    facebook: '',
    tiktok: '',
    web: '',
    phone: '',
    logo: '',
    photos: [],
    featuredInHome: true,
    active: true
  });

  // ========== ESTADOS DE COMENTARIOS CIUDADANOS (NOTAS DE PRENSA) ==========
  const [commentsList, setCommentsList] = useState([]);
  const [commentStatusFilter, setCommentStatusFilter] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected'
  const [commentSearch, setCommentSearch] = useState('');

  // ========== ESTADOS DE DENUNCIAS CIUDADANAS Y BASE DE DATOS PARALELA ==========
  const [reportsList, setReportsList] = useState([]);
  const [reportStatusFilter, setReportStatusFilter] = useState('Todas');
  const [reportSearch, setReportSearch] = useState('');
  const [reportsSubTab, setReportsSubTab] = useState('reports'); // 'reports' | 'citizens'
  const [citizensList, setCitizensList] = useState([]);
  const [citizenSearch, setCitizenSearch] = useState('');

  // ========== ESTADOS DE PARRILLA RADIAL & PLAYLIST YOUTUBE SEMANAL ==========
  const [scheduleList, setScheduleList] = useState([]);
  const [scheduleSearch, setScheduleSearch] = useState('');
  const [isScheduleFormOpen, setIsScheduleFormOpen] = useState(false);
  const [editingShow, setEditingShow] = useState(null);
  const [ytPlaylistCfg, setYtPlaylistCfg] = useState(() => checkAndPromoteQueuedPlaylist());
  const [ytPlaylistReminder, setYtPlaylistReminder] = useState(() => getPlaylistAdminReminderStatus());
  const [scheduleFormData, setScheduleFormData] = useState({
    id: '',
    title: '',
    host: '',
    description: '',
    startTime: '08:00',
    endTime: '10:00',
    days: [1, 2, 3, 4, 5],
    color: '#00DD9E',
    image: '',
    active: true
  });

  // ========== ESTADOS DE NUESTROS TALENTOS (LOCUTORES & STAFF) ==========
  const [talentsList, setTalentsList] = useState([]);
  const [talentSearch, setTalentSearch] = useState('');
  const [isTalentFormOpen, setIsTalentFormOpen] = useState(false);
  const [editingTalent, setEditingTalent] = useState(null);
  const [talentFormData, setTalentFormData] = useState({
    id: '',
    name: '',
    role: 'Locutor & Productor',
    photo: '',
    bio: '',
    showName: '',
    showSchedule: '',
    whatsapp: '',
    instagram: '',
    facebook: '',
    twitter: '',
    tiktok: '',
    status: 'active',
    featuredInHome: true,
    order: 1,
    isTransparentPng: false
  });

  // ========== ESTADOS DE EVENTOS & CARTELERA REGIONAL ==========
  const [eventsList, setEventsList] = useState([]);
  const [eventSearch, setEventSearch] = useState('');
  const [eventCategoryFilter, setEventCategoryFilter] = useState('Todas');
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventFormData, setEventFormData] = useState({
    id: '',
    title: '',
    category: 'Ferias & Fiestas Patronales',
    date: '',
    dateDisplay: '',
    time: '',
    location: '',
    googleMapsUrl: '',
    flyer: '',
    description: '',
    admissionPrice: 'Entrada Libre',
    isFree: true,
    coordinatorName: '',
    coordinatorPhone: '',
    coordinatorWhatsApp: '',
    eventUrl: '',
    instagram: '',
    facebook: '',
    status: 'upcoming',
    featuredInHome: true,
    active: true
  });

  // ========== ESTADOS DE ANALÍTICA ==========
  const [analyticsSummary, setAnalyticsSummary] = useState(null);
  const [analyticsLogs, setAnalyticsLogs] = useState([]);

  // ========== ESTADOS DE PAPELERA SECCIONAL ESTILO APPLE ==========
  const [newsTrashView, setNewsTrashView] = useState(false);
  const [commentsTrashView, setCommentsTrashView] = useState(false);
  const [talentsTabFilter, setTalentsTabFilter] = useState('active'); // 'active' | 'archived' | 'trash'
  const [talentsTrashView, setTalentsTrashView] = useState(false);
  const [eventsTrashView, setEventsTrashView] = useState(false);
  const [sponsorsTrashView, setSponsorsTrashView] = useState(false);
  const [scheduleTrashView, setScheduleTrashView] = useState(false);
  const [reportsTrashView, setReportsTrashView] = useState(false);
  const [contactsCount, setContactsCount] = useState(() => getAllUnifiedContacts().filter(c => !c.trashed).length);

  // ========== ESTADOS DE SEGURIDAD ==========
  const [currentPassInput, setCurrentPassInput] = useState('');
  const [newUserInput, setNewUserInput] = useState('');
  const [newPassInput, setNewPassInput] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');
  const [securityError, setSecurityError] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Mostrar mensaje toast temporal
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Cargar todos los datos al abrir o autenticar
  const reloadAllData = () => {
    setNewsList(getAllNews());
    setCategoriesList(getAllCategories());
    setSponsorsList(getAllSponsors());
    setReportsList(getAllReports());
    setCitizensList(getAllCitizens());
    setScheduleList(getAllSchedule());
    setCommentsList(getAllNewsComments());
    setTalentsList(getAllTalents());
    setEventsList(getAllEvents());
    setAnalyticsSummary(getPrivateAnalyticsSummary());
    setAnalyticsLogs(getPrivateAnalyticsLogs());
    setContactsCount(getAllUnifiedContacts().filter(c => !c.trashed).length);
    setYtPlaylistCfg(checkAndPromoteQueuedPlaylist());
    setYtPlaylistReminder(getPlaylistAdminReminderStatus());
  };

  // Resetear la paginación a la página 1 si cambian los filtros de búsqueda o categoría
  useEffect(() => {
    setAdminNewsPage(1);
  }, [newsSearch, newsCategoryFilter, newsTrashView]);

  // Bloquear el scroll del fondo cuando el modal está abierto en modo sobreventana (no página completa)
  useEffect(() => {
    if (!isOpen || isStandalonePage) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = (prevOverflow && prevOverflow !== 'hidden') ? prevOverflow : '';
    };
  }, [isOpen, isStandalonePage]);

  useEffect(() => {
    if (!isOpen) return;
    const isAuth = isSessionAuthenticated();
    setIsAuthenticated(isAuth);
    if (isAuth) {
      reloadAllData();
    }

    const handleCommentsUpdate = () => {
      setCommentsList(getAllNewsComments());
    };
    const handleCategoriesUpdate = () => {
      setCategoriesList(getAllCategories());
    };
    const handleNewsUpdate = () => {
      setNewsList(getAllNews());
    };

    window.addEventListener('neblina_comments_updated', handleCommentsUpdate);
    window.addEventListener('neblina_categories_updated', handleCategoriesUpdate);
    window.addEventListener('neblina_news_updated', handleNewsUpdate);
    return () => {
      window.removeEventListener('neblina_comments_updated', handleCommentsUpdate);
      window.removeEventListener('neblina_categories_updated', handleCategoriesUpdate);
      window.removeEventListener('neblina_news_updated', handleNewsUpdate);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleUpdate = () => {
      setReportsList(getAllReports());
      setCitizensList(getAllCitizens());
    };
    const handleContactsUpdate = () => {
      setContactsCount(getAllUnifiedContacts().filter(c => !c.trashed).length);
    };
    window.addEventListener('neblina_reports_updated', handleUpdate);
    window.addEventListener('neblina_citizens_updated', handleUpdate);
    window.addEventListener('neblina_contacts_updated', handleContactsUpdate);
    return () => {
      window.removeEventListener('neblina_reports_updated', handleUpdate);
      window.removeEventListener('neblina_citizens_updated', handleUpdate);
      window.removeEventListener('neblina_contacts_updated', handleContactsUpdate);
    };
  }, []);

  // Manejar Login
  const handleLogin = (e) => {
    e.preventDefault();
    const res = loginAdmin(loginUser, loginPass);
    if (res.success) {
      setIsAuthenticated(true);
      setAuthError('');
      setLoginPass('');
      reloadAllData();
      triggerToast('¡Bienvenido al Sistema Interno de Neblina 105.5 FM!');
    } else {
      setAuthError(res.error);
    }
  };

  // Manejar Logout
  const handleLogout = () => {
    logoutAdmin();
    setIsAuthenticated(false);
    triggerToast('Sesión cerrada con seguridad');
  };

  // Copiar link privado
  const handleCopyPrivateLink = () => {
    const privateUrl = `${window.location.origin}${window.location.pathname}#admin`;
    navigator.clipboard.writeText(privateUrl);
    setCopiedLink(true);
    triggerToast('Enlace privado copiado al portapapeles');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // ==========================================
  // OPERACIONES DE NOTICIAS
  // ==========================================
  const handleOpenCreateNews = () => {
    setNewsFormData({
      id: '',
      title: '',
      excerpt: '',
      content: '',
      category: categoriesList[0]?.name || 'Noticias',
      author: 'Redacción Neblina 105.5 FM',
      date: new Date().toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' }),
      image: '',
      images: ['', '', ''],
      socialEmbedUrl: '',
      featuredInCarousel: true,
      status: 'published',
      publishToWordPress: true
    });
    setEditingNews(null);
    setIsNewsFormOpen(true);
  };

  // Probar Conexión con WordPress REST API
  const handleTestWordPress = async () => {
    setIsTestingWp(true);
    setWpTestResult(null);
    try {
      const res = await testWordPressConnection({
        apiUrl: wpFormState.apiUrl,
        username: wpFormState.username,
        appPassword: wpFormState.appPassword
      });
      setWpTestResult(res);
      setWpConfig(getWordPressConfig());
      if (res.ok) {
        triggerToast('¡Conexión con WordPress verificada con éxito!');
      }
    } catch (e) {
      setWpTestResult({ ok: false, message: e.message });
    } finally {
      setIsTestingWp(false);
    }
  };

  // Guardar Credenciales de WordPress
  const handleSaveWordPressConfig = (e) => {
    if (e) e.preventDefault();
    const updated = saveWordPressConfig({
      apiUrl: wpFormState.apiUrl,
      username: wpFormState.username,
      appPassword: wpFormState.appPassword
    });
    setWpConfig(updated);
    triggerToast('Credenciales de WordPress guardadas exitosamente');
  };

  // Migración Completa de Noticias y Comentarios de WordPress
  const handleMigrateWordPressData = async () => {
    setIsMigratingWp(true);
    setWpMigrationProgress('Conectando con WordPress neblina105fm.com...');
    setWpMigrationResult(null);
    try {
      const res = await migrateWordPressAllData({
        onProgress: (msg) => setWpMigrationProgress(msg)
      });
      setWpMigrationResult(res);
      setNewsList(getAllNews());
      setCategoriesList(getAllCategories());
      setCommentsList(getAllNewsComments());
      setContactsCount(getAllUnifiedContacts().filter(c => !c.trashed).length);
      triggerToast(`¡Migración completada! ${res.postsMigrated} notas, ${res.categoriesMigrated} categorías y ${res.commentsMigrated} comentarios.`);
    } catch (err) {
      setWpMigrationResult({ ok: false, errors: [err.message] });
    } finally {
      setIsMigratingWp(false);
    }
  };

  const handleOpenEditNews = (item) => {
    let initialImgs = ['', '', ''];
    if (Array.isArray(item.images) && item.images.length > 0) {
      initialImgs = [
        item.images[0] || '',
        item.images[1] || '',
        item.images[2] || ''
      ];
    } else if (item.image) {
      initialImgs = [item.image, '', ''];
    }

    setNewsFormData({
      ...item,
      image: initialImgs[0] || '',
      images: initialImgs,
      socialEmbedUrl: item.socialEmbedUrl || '',
      featuredInCarousel: item.featuredInCarousel !== false,
      status: item.status || 'published',
      publishToWordPress: item.publishToWordPress !== false
    });
    setEditingNews(item);
    setIsNewsFormOpen(true);
  };

  const handleMultiPhotoUpload = (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      alert('La imagen seleccionada supera los 4MB. Por favor elija una imagen más ligera.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setNewsFormData(prev => {
        const nextImgs = [...(prev.images || ['', '', ''])];
        nextImgs[index] = dataUrl;
        return {
          ...prev,
          images: nextImgs,
          image: nextImgs.find(Boolean) || ''
        };
      });
    };
    reader.readAsDataURL(file);
  };

  const handleMultiPhotoUrlChange = (index, url) => {
    setNewsFormData(prev => {
      const nextImgs = [...(prev.images || ['', '', ''])];
      nextImgs[index] = url;
      return {
        ...prev,
        images: nextImgs,
        image: nextImgs.find(Boolean) || ''
      };
    });
  };

  const handleRemovePhoto = (index) => {
    setNewsFormData(prev => {
      const nextImgs = [...(prev.images || ['', '', ''])];
      nextImgs[index] = '';
      return {
        ...prev,
        images: nextImgs,
        image: nextImgs.find(Boolean) || ''
      };
    });
  };

  
  const handleStartEditCategory = (cat) => {
    setEditingCategoryId(cat.id || cat.name);
    setEditingCategoryName(cat.name);
  };

  const handleSaveEditCategory = (cat) => {
    if (!editingCategoryName.trim()) return;
    const oldName = cat.name;
    const updated = updateCategory(cat.id || oldName, editingCategoryName.trim());
    if (updated) {
      // Actualizar notas que tenían esta categoría
      const all = getAllNews().map(item => {
        if (item.category === oldName) {
          return { ...item, category: updated.name };
        }
        return item;
      });
      saveAllNews(all);
      setNewsList(all);
      setCategoriesList(getAllCategories());
      setEditingCategoryId(null);
      setEditingCategoryName('');
      triggerToast(`Categoría renombrada a "${updated.name}" exitosamente`);
    }
  };

  const handleAddCategory = (e) => {
    if (e) e.preventDefault();
    if (!newCategoryName.trim()) return;
    const added = addCategory(newCategoryName.trim());
    if (added) {
      setCategoriesList(getAllCategories());
      setNewCategoryName('');
      triggerToast(`Categoría "${added.name}" añadida exitosamente`);
    }
  };

  const handleDeleteCategory = (cat) => {
    if (categoriesList.length <= 1) {
      alert('Debe existir al menos una categoría en el sistema.');
      return;
    }
    const catName = cat.name;
    if (window.confirm(`¿Está seguro de eliminar la categoría "${catName}"?\n\nLas notas que pertenezcan a esta categoría se reasignarán automáticamente a la categoría principal para no perder ninguna nota de prensa.`)) {
      const updatedCats = deleteCategory(cat.id || catName);
      setCategoriesList(updatedCats);
      
      const all = getAllNews().map(item => {
        if (item.category === catName) {
          return { ...item, category: updatedCats[0]?.name || 'Noticias' };
        }
        return item;
      });
      saveAllNews(all);
      setNewsList(all);
      triggerToast(`Categoría "${catName}" eliminada y notas reasignadas`);
    }
  };

  const handleSaveNews = async (e) => {
    e.preventDefault();
    if (!newsFormData.title.trim()) {
      alert('Por favor ingrese el título de la noticia.');
      return;
    }

    const cleanImages = (newsFormData.images || []).filter(img => typeof img === 'string' && img.trim().length > 0);
    const primaryImg = cleanImages[0] || newsFormData.image || '';

    let processedContent = newsFormData.content;
    // Si se especificó una URL de red social y no está incluida en el cuerpo, anexarla
    if (newsFormData.socialEmbedUrl?.trim() && !processedContent.includes(newsFormData.socialEmbedUrl.trim())) {
      processedContent += `\n\n<p>${newsFormData.socialEmbedUrl.trim()}</p>`;
    }

    let wpPostResult = null;
    if (newsFormData.publishToWordPress) {
      const currentWp = getWordPressConfig();
      if (currentWp.username && currentWp.appPassword) {
        try {
          setIsSyncingNews(true);
          wpPostResult = await publishPostToWordPress({
            title: newsFormData.title,
            content: processedContent,
            excerpt: newsFormData.excerpt,
            status: newsFormData.status === 'published' ? 'publish' : 'draft'
          });
        } catch (wpErr) {
          console.warn('Error al publicar en WordPress:', wpErr);
          if (!window.confirm(`No se pudo publicar en WordPress (${wpErr.message}). ¿Desea guardarla localmente en el sistema interno de todos modos?`)) {
            setIsSyncingNews(false);
            return;
          }
        } finally {
          setIsSyncingNews(false);
        }
      }
    }

    saveNewsItem({
      ...newsFormData,
      image: primaryImg,
      images: cleanImages.length > 0 ? cleanImages : (primaryImg ? [primaryImg] : []),
      content: processedContent,
      wpPostId: wpPostResult?.id || newsFormData.wpPostId,
      link: wpPostResult?.link || newsFormData.link
    });

    setNewsList(getAllNews());
    setIsNewsFormOpen(false);
    setEditingNews(null);
    triggerToast(wpPostResult 
      ? `¡Noticia publicada en WordPress (ID: ${wpPostResult.id}) y en la Web App!` 
      : '¡Noticia guardada y sincronizada exitosamente!');
  };

  const handleTrashNews = (id, title) => {
    if (window.confirm(`¿Mover la noticia "${title}" a la papelera? Podrás restaurarla en cualquier momento.`)) {
      trashNewsItem(id);
      setNewsList(getAllNews());
      triggerToast('Noticia enviada a la papelera');
    }
  };

  const handleRestoreNews = (id) => {
    restoreNewsItem(id);
    setNewsList(getAllNews());
    triggerToast('Noticia restaurada exitosamente');
  };

  const handlePermanentDeleteNews = (id, title) => {
    if (window.confirm(`¿Eliminar definitivamente la noticia "${title}"? Esta acción no se puede deshacer.`)) {
      deleteNewsItemPermanently(id);
      setNewsList(getAllNews());
      triggerToast('Noticia eliminada permanentemente');
    }
  };

  const handleEmptyNewsTrash = () => {
    if (window.confirm('¿Vaciar toda la papelera de noticias? Se eliminarán de forma definitiva todas las notas enviadas a la papelera.')) {
      emptyNewsTrash();
      setNewsList(getAllNews());
      triggerToast('Papelera de noticias vaciada');
    }
  };

  const handleDeleteNews = (id, title) => {
    handleTrashNews(id, title);
  };

  const handleToggleNewsFeatured = (id) => {
    toggleNewsFeatured(id);
    setNewsList(getAllNews());
  };

  const handleToggleNewsPublished = (id) => {
    toggleNewsPublished(id);
    setNewsList(getAllNews());
  };

  const handleNewsImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert('La imagen seleccionada supera los 3MB. Por favor elija una imagen más ligera.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setNewsFormData(prev => ({ ...prev, image: event.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSyncFromWordPress = async () => {
    try {
      setIsSyncingNews(true);
      triggerToast('Conectando con neblina105fm.com para sincronizar noticias...');
      const wpPosts = await fetchWordPressNews(1, 15);
      if (wpPosts && wpPosts.length > 0) {
        saveAllNews(wpPosts);
        setNewsList(getAllNews());
        triggerToast(`¡Éxito! Se sincronizaron ${wpPosts.length} noticias reales de neblina105fm.com`);
      } else {
        triggerToast('No se recibieron noticias o el servidor demoró en responder.');
      }
    } catch (err) {
      triggerToast('Error de conexión con neblina105fm.com');
    } finally {
      setIsSyncingNews(false);
    }
  };

  // ==========================================
  // OPERACIONES DE ALIADOS COMERCIALES
  // ==========================================
  const handleOpenCreateSponsor = () => {
    setSponsorFormData({
      id: '',
      name: '',
      rif: '',
      category: 'Hospedaje & Hoteles',
      tag: '',
      slogan: '',
      description: '',
      location: '',
      locationDetails: '',
      googleMapsUrl: '',
      menuUrl: '',
      whatsapp: '584247459774',
      instagram: '',
      facebook: '',
      tiktok: '',
      web: '',
      phone: '',
      logo: '',
      photos: [],
      featuredInHome: true,
      active: true
    });
    setEditingSponsor(null);
    setIsSponsorFormOpen(true);
  };

  const handleOpenEditSponsor = (sponsor) => {
    setSponsorFormData({
      ...sponsor,
      whatsapp: sponsor.whatsapp || '584247459774',
      instagram: sponsor.instagram || '',
      facebook: sponsor.facebook || '',
      tiktok: sponsor.tiktok || '',
      web: sponsor.web || '',
      phone: sponsor.phone || '',
      logo: sponsor.logo || '',
      rif: sponsor.rif || '',
      googleMapsUrl: sponsor.googleMapsUrl || '',
      locationDetails: sponsor.locationDetails || '',
      menuUrl: sponsor.menuUrl || '',
      photos: Array.isArray(sponsor.photos) ? sponsor.photos : (sponsor.logo ? [sponsor.logo] : []),
      featuredInHome: sponsor.featuredInHome !== false,
      active: sponsor.active !== false
    });
    setEditingSponsor(sponsor);
    setIsSponsorFormOpen(true);
  };

  const handleSaveSponsor = (e) => {
    e.preventDefault();
    if (!sponsorFormData.name.trim()) {
      alert('Por favor ingrese el nombre del negocio o aliado.');
      return;
    }

    saveSponsor(sponsorFormData);
    setSponsorsList(getAllSponsors());
    setIsSponsorFormOpen(false);
    setEditingSponsor(null);
    triggerToast('¡Aliado comercial guardado exitosamente!');
  };

  const handleTrashSponsor = (id, name) => {
    if (window.confirm(`¿Mover el aliado "${name}" a la papelera?`)) {
      trashSponsor(id);
      setSponsorsList(getAllSponsors());
      triggerToast('Aliado comercial enviado a la papelera');
    }
  };

  const handleRestoreSponsor = (id) => {
    restoreSponsor(id);
    setSponsorsList(getAllSponsors());
    triggerToast('Aliado comercial restaurado');
  };

  const handlePermanentDeleteSponsor = (id, name) => {
    if (window.confirm(`¿Eliminar definitivamente al aliado "${name}"? Esta acción no se puede deshacer.`)) {
      deleteSponsor(id);
      setSponsorsList(getAllSponsors());
      triggerToast('Aliado comercial eliminado definitivamente');
    }
  };

  const handleEmptySponsorsTrash = () => {
    if (window.confirm('¿Vaciar la papelera de aliados comerciales? Se eliminarán de forma permanente.')) {
      emptySponsorsTrash();
      setSponsorsList(getAllSponsors());
      triggerToast('Papelera de aliados vaciada');
    }
  };

  const handleDeleteSponsor = (id, name) => {
    handleTrashSponsor(id, name);
  };

  const handleToggleSponsorHome = (id) => {
    toggleSponsorFeaturedInHome(id);
    setSponsorsList(getAllSponsors());
  };

  const handleToggleSponsorDirectory = (id) => {
    toggleSponsorActive(id);
    setSponsorsList(getAllSponsors());
  };

  const handleSponsorLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('El logo supera los 2MB. Por favor sube una imagen de menor peso.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setSponsorFormData(prev => ({ ...prev, logo: event.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSponsorPhotosUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    
    files.forEach(file => {
      if (file.size > 3 * 1024 * 1024) {
        alert(`La imagen "${file.name}" supera los 3MB.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setSponsorFormData(prev => ({
          ...prev,
          photos: [...(prev.photos || []), event.target.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveSponsorPhoto = (idx) => {
    setSponsorFormData(prev => ({
      ...prev,
      photos: (prev.photos || []).filter((_, i) => i !== idx)
    }));
  };

  // ==========================================
  // OPERACIONES DE DENUNCIAS CIUDADANAS
  // ==========================================
  const handleUpdateReportStatus = (id, newStatus) => {
    updateReportStatus(id, newStatus);
    setReportsList(getAllReports());
    triggerToast(`Reporte marcado como "${newStatus}"`);
  };

  const handleTrashReport = (id) => {
    if (window.confirm('¿Mover este reporte ciudadano a la papelera? Podrás recuperarlo cuando lo desees.')) {
      trashReport(id);
      setReportsList(getAllReports());
      triggerToast('Reporte enviado a la papelera');
    }
  };

  const handleRestoreReport = (id) => {
    restoreReport(id);
    setReportsList(getAllReports());
    triggerToast('Reporte restaurado');
  };

  const handlePermanentDeleteReport = (id) => {
    if (window.confirm('¿Eliminar definitivamente este reporte? Esta acción no se puede deshacer.')) {
      deleteCitizenReport(id);
      setReportsList(getAllReports());
      triggerToast('Reporte eliminado permanentemente');
    }
  };

  const handleEmptyReportsTrash = () => {
    if (window.confirm('¿Vaciar la papelera de reportes ciudadanos? Se eliminarán de forma permanente.')) {
      emptyReportsTrash();
      setReportsList(getAllReports());
      triggerToast('Papelera de reportes vaciada');
    }
  };

  const handleDeleteReport = (id) => {
    handleTrashReport(id);
  };

  // OPERACIONES DE DIRECTORIO PARALELO DE CIUDADANOS
  const handleDeleteCitizen = (id, name) => {
    if (window.confirm(`¿Deseas eliminar a "${name}" de la base de datos de ciudadanos?`)) {
      deleteCitizen(id);
      setCitizensList(getAllCitizens());
      triggerToast('Contacto eliminado del directorio ciudadano');
    }
  };

  const handleExportCitizensCSV = () => {
    const csv = exportCitizensCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Neblina1055_Directorio_Ciudadanos_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast('Directorio de ciudadanos descargado en CSV (Excel)');
  };

  const handleExportCitizensJSON = () => {
    const json = exportCitizensJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Neblina1055_Directorio_Ciudadanos_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast('Directorio de ciudadanos exportado en JSON');
  };

  const handleExportReportsCSV = () => {
    const csv = exportReportsCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Neblina1055_Denuncias_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast('Denuncias ciudadanas descargadas en CSV (Excel)');
  };

  const handleExportReportsJSON = () => {
    const json = exportReportsJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Neblina1055_Denuncias_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast('Denuncias ciudadanas exportadas en JSON');
  };

  // ==========================================
  // OPERACIONES DE PARRILLA RADIAL
  // ==========================================
  const handleOpenCreateShow = () => {
    setScheduleFormData({
      id: '',
      title: '',
      host: '',
      description: '',
      startTime: '08:00',
      endTime: '10:00',
      days: [1, 2, 3, 4, 5],
      color: '#00DD9E',
      image: '',
      active: true
    });
    setEditingShow(null);
    setIsScheduleFormOpen(true);
  };

  const handleOpenEditShow = (show) => {
    setScheduleFormData({
      id: show.id || '',
      title: show.title || '',
      host: show.host || '',
      description: show.description || '',
      startTime: show.startTime || '08:00',
      endTime: show.endTime || '10:00',
      days: Array.isArray(show.days) ? show.days : [1, 2, 3, 4, 5],
      color: show.color || '#00DD9E',
      image: show.image || show.artwork || '',
      active: show.active !== false
    });
    setEditingShow(show);
    setIsScheduleFormOpen(true);
  };

  const handleScheduleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('La carátula no debe superar los 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setScheduleFormData(prev => ({ ...prev, image: event.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleToggleDay = (dayNum) => {
    setScheduleFormData(prev => {
      const currentDays = Array.isArray(prev.days) ? [...prev.days] : [];
      const index = currentDays.indexOf(dayNum);
      if (index >= 0) {
        if (currentDays.length === 1) return prev; // Mantener al menos un día
        return { ...prev, days: currentDays.filter(d => d !== dayNum) };
      } else {
        return { ...prev, days: [...currentDays, dayNum].sort((a, b) => a - b) };
      }
    });
  };

  const handleSetDaysPreset = (preset) => {
    if (preset === 'all') {
      setScheduleFormData(prev => ({ ...prev, days: [1, 2, 3, 4, 5, 6, 7] }));
    } else if (preset === 'weekdays') {
      setScheduleFormData(prev => ({ ...prev, days: [1, 2, 3, 4, 5] }));
    } else if (preset === 'weekends') {
      setScheduleFormData(prev => ({ ...prev, days: [6, 7] }));
    }
  };

  const handleResetSchedule = () => {
    if (window.confirm('¿Restablecer la programación a los valores originales de fábrica? Se perderán las modificaciones personalizadas no respaldadas.')) {
      const def = resetDefaultSchedule();
      setScheduleList(def);
      triggerToast('Parrilla radial restablecida a valores por defecto');
    }
  };

  const handleExportSchedule = () => {
    const json = exportScheduleJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Neblina1055_Programacion_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast('Parrilla exportada en JSON');
  };

  const isShowOnAirNow = (show) => {
    if (!show || show.active === false) return false;
    try {
      const now = new Date();
      const caracasTimeStr = now.toLocaleTimeString('en-US', { timeZone: 'America/Caracas', hour12: false, hour: '2-digit', minute: '2-digit' });
      const [currentH, currentM] = caracasTimeStr.split(':').map(Number);
      const currentMinutes = currentH * 60 + currentM;
      const caracasDayStr = now.toLocaleDateString('en-US', { timeZone: 'America/Caracas', weekday: 'short' });
      const daysMap = { 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6, 'Sun': 7 };
      const currentDay = daysMap[caracasDayStr] || 1;

      if (!show.days || !Array.isArray(show.days) || !show.days.includes(currentDay)) return false;
      const [startH, startM] = (show.startTime || '00:00').split(':').map(Number);
      const [endH, endM] = (show.endTime || '23:59').split(':').map(Number);
      const startMin = startH * 60 + startM;
      const endMin = endH * 60 + endM;
      return currentMinutes >= startMin && currentMinutes < endMin;
    } catch (e) {
      return false;
    }
  };

  const handleSaveShow = (e) => {
    e.preventDefault();
    if (!scheduleFormData.title.trim()) {
      alert('Por favor ingrese el nombre del programa.');
      return;
    }
    saveScheduleShow(scheduleFormData);
    setScheduleList(getAllSchedule());
    setIsScheduleFormOpen(false);
    setEditingShow(null);
    triggerToast('¡Parrilla radial actualizada!');
  };

  const handleTrashShow = (id, title) => {
    if (window.confirm(`¿Mover el programa "${title}" a la papelera?`)) {
      trashScheduleShow(id);
      setScheduleList(getAllSchedule());
      triggerToast('Programa movido a la papelera');
    }
  };

  const handleRestoreShow = (id) => {
    restoreScheduleShow(id);
    setScheduleList(getAllSchedule());
    triggerToast('Programa restaurado en la parrilla');
  };

  const handlePermanentDeleteShow = (id, title) => {
    if (window.confirm(`¿Eliminar definitivamente el programa "${title}"? Esta acción es irreversible.`)) {
      deleteScheduleShow(id);
      setScheduleList(getAllSchedule());
      triggerToast('Programa eliminado definitivamente');
    }
  };

  const handleEmptyScheduleTrash = () => {
    if (window.confirm('¿Vaciar la papelera de programas radiales? Se eliminarán de forma permanente.')) {
      emptyScheduleTrash();
      setScheduleList(getAllSchedule());
      triggerToast('Papelera de programación vaciada');
    }
  };

  const handleDeleteShow = (id, title) => {
    handleTrashShow(id, title);
  };

  const handleToggleShowActive = (id) => {
    toggleScheduleShowActive(id);
    setScheduleList(getAllSchedule());
  };

  // ==========================================
  // OPERACIONES DE COMENTARIOS DE NOTAS DE PRENSA
  // ==========================================
  const handleApproveComment = (id) => {
    updateNewsCommentStatus(id, 'approved');
    setCommentsList(getAllNewsComments());
    triggerToast('¡Comentario aprobado y publicado en la noticia!');
  };

  const handleRejectComment = (id) => {
    updateNewsCommentStatus(id, 'rejected');
    setCommentsList(getAllNewsComments());
    triggerToast('Comentario marcado como rechazado');
  };

  const handleResetCommentStatus = (id) => {
    updateNewsCommentStatus(id, 'pending');
    setCommentsList(getAllNewsComments());
    triggerToast('Comentario devuelto a estado pendiente');
  };

  const handleTrashComment = (id, author) => {
    if (window.confirm(`¿Mover el comentario de "${author}" a la papelera?`)) {
      trashNewsComment(id);
      setCommentsList(getAllNewsComments());
      triggerToast('Comentario enviado a la papelera');
    }
  };

  const handleRestoreComment = (id) => {
    restoreNewsComment(id);
    setCommentsList(getAllNewsComments());
    triggerToast('Comentario restaurado');
  };

  const handlePermanentDeleteComment = (id, author) => {
    if (window.confirm(`¿Eliminar definitivamente el comentario de "${author}"? Esta acción no se puede deshacer.`)) {
      deleteNewsCommentPermanently(id);
      setCommentsList(getAllNewsComments());
      triggerToast('Comentario eliminado definitivamente');
    }
  };

  const handleEmptyCommentsTrash = () => {
    if (window.confirm('¿Vaciar la papelera de comentarios? Se eliminarán de forma permanente.')) {
      emptyNewsCommentsTrash();
      setCommentsList(getAllNewsComments());
      triggerToast('Papelera de comentarios vaciada');
    }
  };

  const handleDeleteComment = (id, author) => {
    handleTrashComment(id, author);
  };

  const handleExportCommentsCSV = () => {
    const csv = exportNewsCommentsCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Neblina1055_Comentarios_Prensa_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast('Comentarios exportados para Excel (CSV)');
  };

  const handleExportCommentsJSON = () => {
    const json = exportNewsCommentsJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Neblina1055_Comentarios_Prensa_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast('Comentarios exportados en JSON');
  };

  const handleResetComments = () => {
    if (window.confirm('¿Deseas restablecer los comentarios a los valores iniciales de prueba? Se perderán comentarios no respaldados.')) {
      const def = resetDefaultNewsComments();
      setCommentsList(def);
      triggerToast('Comentarios restablecidos a valores por defecto');
    }
  };

  // ==========================================
  // HANDLERS DE TALENTOS (LOCUTORES & STAFF)
  // ==========================================
  const handleOpenCreateTalent = () => {
    setEditingTalent(null);
    setTalentFormData({
      id: '',
      name: '',
      role: 'Locutor & Productor',
      photo: '',
      bio: '',
      showName: '',
      showSchedule: 'Lunes a Viernes • 9:00 AM - 12:00 PM',
      whatsapp: '+584247459774',
      instagram: 'https://instagram.com/neblina105fm',
      facebook: '',
      twitter: '',
      tiktok: '',
      status: 'active',
      featuredInHome: true,
      order: talentsList.length + 1,
      isTransparentPng: false
    });
    setIsTalentFormOpen(true);
  };

  const handleEditTalent = (talent) => {
    setEditingTalent(talent);
    setTalentFormData({
      id: talent.id,
      name: talent.name || '',
      role: talent.role || '',
      photo: talent.photo || '',
      bio: talent.bio || '',
      showName: talent.showName || '',
      showSchedule: talent.showSchedule || '',
      whatsapp: talent.socialLinks?.whatsapp || '',
      instagram: talent.socialLinks?.instagram || '',
      facebook: talent.socialLinks?.facebook || '',
      twitter: talent.socialLinks?.twitter || '',
      tiktok: talent.socialLinks?.tiktok || '',
      status: talent.status || 'active',
      featuredInHome: talent.featuredInHome ?? true,
      order: talent.order || 1,
      isTransparentPng: talent.isTransparentPng ?? (talent.photo ? (/\.png($|\?)/i.test(talent.photo) || talent.photo.includes('format=png')) : false)
    });
    setIsTalentFormOpen(true);
  };

  const handleSaveTalent = (e) => {
    e.preventDefault();
    if (!talentFormData.name.trim()) {
      alert('Por favor introduce el nombre del locutor o talento.');
      return;
    }

    const payload = {
      ...talentFormData,
      socialLinks: {
        whatsapp: talentFormData.whatsapp,
        instagram: talentFormData.instagram,
        facebook: talentFormData.facebook,
        twitter: talentFormData.twitter,
        tiktok: talentFormData.tiktok
      }
    };

    saveTalent(payload);
    setTalentsList(getAllTalents());
    setIsTalentFormOpen(false);
    setEditingTalent(null);
    triggerToast('¡Talento guardado con éxito!');
  };

  const handleTrashTalent = (id, name) => {
    if (window.confirm(`¿Mover a "${name}" a la papelera?`)) {
      trashTalent(id);
      setTalentsList(getAllTalents());
      triggerToast('Talento enviado a la papelera');
    }
  };

  const handleArchiveTalent = (id, name) => {
    if (window.confirm(`¿Archivar al locutor "${name}"? No aparecerá en la grilla pública principal pero mantendrá su historial.`)) {
      archiveTalent(id);
      setTalentsList(getAllTalents());
      triggerToast('Locutor archivado');
    }
  };

  const handleUnarchiveTalent = (id) => {
    unarchiveTalent(id);
    setTalentsList(getAllTalents());
    triggerToast('Locutor desarchivado y reincorporado');
  };

  const handleRestoreTalent = (id) => {
    restoreTalent(id);
    setTalentsList(getAllTalents());
    triggerToast('Talento restaurado');
  };

  const handlePermanentDeleteTalent = (id, name) => {
    if (window.confirm(`¿Eliminar definitivamente a "${name}" de la emisora? Esta acción no se puede deshacer.`)) {
      deleteTalent(id);
      setTalentsList(getAllTalents());
      triggerToast('Talento eliminado definitivamente');
    }
  };

  const handleEmptyTalentsTrash = () => {
    if (window.confirm('¿Vaciar la papelera de talentos? Se eliminarán de forma permanente.')) {
      emptyTalentsTrash();
      setTalentsList(getAllTalents());
      triggerToast('Papelera de talentos vaciada');
    }
  };

  const handleDeleteTalent = (id, name) => {
    handleTrashTalent(id, name);
  };

  const handleToggleTalentActive = (id) => {
    toggleTalentActive(id);
    setTalentsList(getAllTalents());
  };

  const handleExportTalents = () => {
    exportTalentsJSON();
    triggerToast('Base de datos de talentos exportada');
  };

  const handleImportTalents = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const res = importTalentsJSON(event.target.result);
      if (res.success) {
        setTalentsList(getAllTalents());
        triggerToast(`¡Se importaron ${res.count} talentos exitosamente!`);
      } else {
        alert('Error al importar talentos: ' + res.error);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetTalents = () => {
    if (window.confirm('¿Deseas restablecer los talentos predeterminados de la emisora?')) {
      resetDefaultTalents();
      setTalentsList(getAllTalents());
      triggerToast('Talentos predeterminados restablecidos');
    }
  };

  // ==========================================
  // HANDLERS DE EVENTOS Y CARTELERA REGIONAL
  // ==========================================
  const handleOpenCreateEvent = () => {
    setEditingEvent(null);
    setEventFormData({
      id: '',
      title: '',
      category: 'Ferias & Fiestas Patronales',
      date: new Date().toISOString().slice(0, 10),
      dateDisplay: '',
      time: '7:00 PM',
      location: 'Santo Domingo, Mérida',
      googleMapsUrl: '',
      flyer: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
      description: '',
      admissionPrice: 'Entrada Libre',
      isFree: true,
      coordinatorName: '',
      coordinatorPhone: '+584247459774',
      coordinatorWhatsApp: '584247459774',
      eventUrl: '',
      instagram: '',
      facebook: '',
      status: 'upcoming',
      featuredInHome: true,
      active: true
    });
    setIsEventFormOpen(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setEventFormData({
      id: event.id,
      title: event.title || '',
      category: event.category || 'Ferias & Fiestas Patronales',
      date: event.date || '',
      dateDisplay: event.dateDisplay || '',
      time: event.time || '',
      location: event.location || '',
      googleMapsUrl: event.googleMapsUrl || '',
      flyer: event.flyer || '',
      description: event.description || '',
      admissionPrice: event.admissionPrice || 'Entrada Libre',
      isFree: event.isFree ?? true,
      coordinatorName: event.coordinatorName || '',
      coordinatorPhone: event.coordinatorPhone || '',
      coordinatorWhatsApp: event.coordinatorWhatsApp || '',
      eventUrl: event.eventUrl || '',
      instagram: event.instagram || '',
      facebook: event.facebook || '',
      status: event.status || 'upcoming',
      featuredInHome: event.featuredInHome ?? true,
      active: event.active ?? true
    });
    setIsEventFormOpen(true);
  };

  const handleSaveEvent = (e) => {
    e.preventDefault();
    if (!eventFormData.title.trim()) {
      alert('Por favor introduce el título del evento.');
      return;
    }

    saveEvent(eventFormData);
    setEventsList(getAllEvents());
    setIsEventFormOpen(false);
    setEditingEvent(null);
    triggerToast('¡Evento guardado con éxito!');
  };

  const handleTrashEvent = (id, title) => {
    if (window.confirm(`¿Mover el evento "${title}" a la papelera?`)) {
      trashEvent(id);
      setEventsList(getAllEvents());
      triggerToast('Evento enviado a la papelera');
    }
  };

  const handleRestoreEvent = (id) => {
    restoreEvent(id);
    setEventsList(getAllEvents());
    triggerToast('Evento restaurado');
  };

  const handlePermanentDeleteEvent = (id, title) => {
    if (window.confirm(`¿Eliminar definitivamente el evento "${title}"? Esta acción no se puede revertir.`)) {
      deleteEvent(id);
      setEventsList(getAllEvents());
      triggerToast('Evento eliminado definitivamente');
    }
  };

  const handleEmptyEventsTrash = () => {
    if (window.confirm('¿Vaciar la papelera de eventos? Se eliminarán de forma permanente.')) {
      emptyEventsTrash();
      setEventsList(getAllEvents());
      triggerToast('Papelera de eventos vaciada');
    }
  };

  const handleDeleteEvent = (id, title) => {
    handleTrashEvent(id, title);
  };

  const handleToggleEventActive = (id) => {
    toggleEventActive(id);
    setEventsList(getAllEvents());
  };

  const handleExportEvents = () => {
    exportEventsJSON();
    triggerToast('Base de datos de eventos exportada');
  };

  const handleImportEvents = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const res = importEventsJSON(event.target.result);
      if (res.success) {
        setEventsList(getAllEvents());
        triggerToast(`¡Se importaron ${res.count} eventos exitosamente!`);
      } else {
        alert('Error al importar eventos: ' + res.error);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetEvents = () => {
    if (window.confirm('¿Deseas restablecer los eventos predeterminados de la emisora?')) {
      resetDefaultEvents();
      setEventsList(getAllEvents());
      triggerToast('Eventos predeterminados restablecidos');
    }
  };

  // ==========================================
  // RESPALDO TOTAL Y RESTAURACIÓN (1 SOLO JSON)
  // ==========================================
  
  // ==========================================
  // LIMPIEZA TOTAL DEL SISTEMA (PURGA DE DATOS FICTICIOS)
  // ==========================================
  const handleTotalSystemPurge = () => {
    const confirmation = window.prompt(
      '⚠️ ATENCIÓN: Esta acción eliminará permanentemente todos los clientes ficticios, facturas, comentarios de prueba, denuncias de prueba, locutores y contactos de prueba, dejando el sistema en blanco y limpio para producción.\n\nPara confirmar, escribe exactamente: LIMPIAR'
    );

    if (confirmation === 'LIMPIAR') {
      // 1. Clientes comerciales y facturación
      saveAllClients([]);
      saveAllInvoices([]);
      saveAllClientUsers([]);
      saveAllClientAssets([]);
      saveAllRequests([]);
      saveAllInternalMessages([]);
      saveAllClientNotifications([]);

      // 2. Comentarios de noticias
      saveAllNewsComments([]);
      setCommentsList([]);

      // 3. Denuncias y Directorio de ciudadanos
      saveAllReports([]);
      setReportsList([]);
      saveAllCitizens([]);
      setCitizensList([]);
      saveAllUnifiedContacts([]);

      // 4. Locutores y Staff
      saveAllTalents([]);
      setTalentsList([]);
      saveAllStaffUsers([]);
      saveAllStaffTasks([]);
      saveAllStaffInterviews([]);
      saveAllStaffNotes([]);
      saveAllStaffMessages([]);

      reloadAllData();
      triggerToast('¡Limpieza total completada! Sistema 100% limpio y listo para operar.');
    }
  };

  const handleExportFullStationBackup = () => {
    const fullBackup = {
      system: 'Neblina Stereo 105.5 FM - Sistema Interno de Gestión',
      version: '2026.1',
      exportedAt: new Date().toISOString(),
      station: 'Santo Domingo - Mérida, Venezuela',
      news: getAllNews(),
      sponsors: getAllSponsors(),
      reports: getAllReports(),
      citizens: getAllCitizens(),
      schedule: getAllSchedule(),
      talents: getAllTalents(),
      events: getAllEvents(),
      analytics: exportAnalyticsDatabase()
    };

    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neblina-105-respaldo-integral-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast('Respaldo integral exportado exitosamente');
  };

  const handleImportFullStationBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.news) {
          importNewsJSON(JSON.stringify(parsed.news));
        }
        if (parsed.sponsors) {
          importSponsorsJSON(JSON.stringify(parsed.sponsors));
        }
        if (parsed.citizens && Array.isArray(parsed.citizens)) {
          saveAllCitizens(parsed.citizens);
        }
        if (parsed.reports && Array.isArray(parsed.reports)) {
          saveAllReports(parsed.reports);
        }
        if (parsed.talents && Array.isArray(parsed.talents)) {
          saveAllTalents(parsed.talents);
        }
        if (parsed.events && Array.isArray(parsed.events)) {
          saveAllEvents(parsed.events);
        }
        reloadAllData();
        triggerToast('¡Sistema restaurado integralmente con éxito!');
      } catch (err) {
        alert('Error al leer archivo de respaldo: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Cambio de Credenciales
  const handleChangeCredentials = (e) => {
    e.preventDefault();
    setSecurityError('');
    setSecuritySuccess('');

    const res = updateAdminCredentials(currentPassInput, newUserInput, newPassInput);
    if (res.success) {
      setSecuritySuccess('¡Credenciales actualizadas exitosamente! Anótalas en un lugar seguro.');
      setCurrentPassInput('');
      setNewUserInput('');
      setNewPassInput('');
      triggerToast('Usuario y contraseña modificados');
    } else {
      setSecurityError(res.error);
    }
  };

  if (!isOpen) return null;

  // Filtrado de noticias (con soporte para papelera)
  const filteredNews = newsList.filter(item => {
    const isTrash = !!item.trashed;
    if (newsTrashView ? !isTrash : isTrash) return false;
    const matchCat = newsCategoryFilter === 'Todas' || item.category === newsCategoryFilter;
    const q = newsSearch.toLowerCase().trim();
    if (!q) return matchCat;
    return matchCat && (
      item.title?.toLowerCase().includes(q) ||
      item.excerpt?.toLowerCase().includes(q) ||
      item.author?.toLowerCase().includes(q)
    );
  });

  // Paginación en lotes de 10 noticias para el sistema administrativo
  const adminTotalNewsCount = filteredNews.length;
  const adminTotalNewsPages = Math.max(1, Math.ceil(adminTotalNewsCount / ADMIN_NEWS_PER_PAGE));
  const paginatedNews = filteredNews.slice(
    (adminNewsPage - 1) * ADMIN_NEWS_PER_PAGE,
    adminNewsPage * ADMIN_NEWS_PER_PAGE
  );

  // Filtrado de patrocinantes (con soporte para papelera)
  const filteredSponsors = sponsorsList.filter(item => {
    const isTrash = !!item.trashed;
    if (sponsorsTrashView ? !isTrash : isTrash) return false;
    const matchCat = sponsorCategoryFilter === 'Todas' || item.category === sponsorCategoryFilter;
    const q = sponsorSearch.toLowerCase().trim();
    if (!q) return matchCat;
    return matchCat && (
      item.name?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.location?.toLowerCase().includes(q)
    );
  });

  // Filtrado de reportes (con soporte para papelera)
  const filteredReports = reportsList.filter(item => {
    const isTrash = !!item.trashed;
    if (reportsTrashView ? !isTrash : isTrash) return false;
    const matchStatus = reportStatusFilter === 'Todas' || item.status === reportStatusFilter;
    const q = reportSearch.toLowerCase().trim();
    if (!q) return matchStatus;
    return matchStatus && (
      item.citizenName?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.residenceSector?.toLowerCase().includes(q) ||
      item.eventLocation?.toLowerCase().includes(q)
    );
  });

  // Filtrado de directorio paralelo de ciudadanos
  const filteredCitizens = citizensList.filter(item => {
    const q = citizenSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      item.name?.toLowerCase().includes(q) ||
      item.phone?.toLowerCase().includes(q) ||
      item.residenceSector?.toLowerCase().includes(q) ||
      item.citizenId?.toLowerCase().includes(q) ||
      item.notes?.toLowerCase().includes(q)
    );
  });

  const pendingCommentsCount = commentsList.filter(c => !c.trashed && c.status === 'pending').length;
  const clientsCount = getAllClients().filter(c => !c.trashed).length;
  const bannersCount = getAllBanners().length;
  const staffTeamCount = getAllStaffUsers().length;
  const journalistsCount = getAllJournalists().length;
  const publicServicesCount = getAllPublicServices().filter(it => it.status !== 'trashed').length;
  const pendingPressNotesCount = getAllPressNotes().filter(n => !n.trashed && n.status === 'in_review').length;

  const totalSystemAlerts = (ytPlaylistReminder?.shouldRemind ? 1 : 0) + pendingCommentsCount + pendingPressNotesCount;

  const adminModules = [
    { id: 'notifications', label: 'Notificaciones', emoji: 'bell', icon: Bell, alertCount: totalSystemAlerts },
    { id: 'clients', label: 'Clientes & Cobranzas', emoji: 'handshake', icon: UserCheck, count: clientsCount },
    { id: 'client_portal', label: 'Portal de Clientes (Aliados)', emoji: 'building', icon: Key, count: clientsCount },
    { id: 'staff_team', label: 'Equipo de Locutores y Ventas', emoji: 'headphones', icon: Mic, count: staffTeamCount },
    { id: 'journalists', label: 'Periodistas & Prensa', emoji: 'newspaper', icon: Newspaper, alertCount: pendingPressNotesCount, count: journalistsCount },
    { id: 'banners', label: 'Banners Publicitarios', emoji: 'megaphone', icon: Megaphone, count: bannersCount },
    { id: 'ai_repost', label: 'Reposteo de Prensa con IA', emoji: 'sparkles', icon: Sparkles, statusPill: 'Nuevo' },
    { id: 'news', label: 'Noticias & Sala de Prensa', emoji: 'newspaper', icon: Newspaper, count: newsList.filter(n => !n.trashed).length },
    { id: 'comments', label: 'Comentarios Prensa', emoji: 'chat', icon: MessageSquare, alertCount: pendingCommentsCount, count: commentsList.filter(c => !c.trashed).length },
    { id: 'contacts', label: 'Directorio de Usuarios', emoji: 'users', icon: Users, count: contactsCount },
    { id: 'talents', label: 'Nuestros Talentos', emoji: 'microphone', icon: Mic, count: talentsList.filter(t => !t.trashed).length },
    { id: 'youtube_playlist', label: 'Playlists de YouTube', emoji: 'musical_note', icon: Radio, statusPill: ytPlaylistReminder?.shouldRemind ? 'Por cambiar' : undefined },
    { id: 'events', label: 'Eventos & Cartelera', emoji: 'calendar', icon: Calendar, count: eventsList.filter(e => !e.trashed).length },
    { id: 'sponsors', label: 'Aliados Comerciales', emoji: 'store', icon: Store, count: sponsorsList.filter(s => !s.trashed).length },
    { id: 'public_service', label: 'Servicio Público & Ayudas', emoji: 'hands_folded', icon: HeartHandshake, count: publicServicesCount },
    { id: 'schedule', label: 'Parrilla Radial', emoji: 'clock', icon: Radio, count: scheduleList.filter(s => !s.trashed).length },
    { id: 'reports', label: 'Denuncias & Vecinos', emoji: 'siren', icon: AlertTriangle, alertCount: reportsList.filter(r => !r.trashed && r.status === 'Pendiente').length },
    { id: 'analytics', label: 'Analítica & Métricas', emoji: 'chart', icon: BarChart3 },
    { id: 'wordpress', label: 'WordPress API & Migración', emoji: 'globe', icon: Globe, statusPill: wpConfig.status === 'connected' ? 'En línea' : 'Configurar' },
    { id: 'tools', label: 'Seguridad & Gestión del Sistema', emoji: 'shield', icon: KeyRound }
  ];

  const modalContent = (
    <div className={
      isStandalonePage
        ? "min-h-screen w-full bg-transparent text-slate-900 dark:text-white flex flex-col font-sans transition-colors duration-300 selection:bg-[#00DD9E] selection:text-[#001E4D] relative overflow-x-hidden"
        : "fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-md animate-fadeIn"
    }>
      {/* Fondo Animado de Aros Oficial en Modo Standalone */}
      {isStandalonePage && <AnimatedBackground />}

      <div className={
        isStandalonePage
          ? "relative z-10 w-full min-h-screen flex flex-col flex-1"
          : "relative z-10 w-full max-w-6xl max-h-[94vh] bg-white/90 dark:bg-[#141b24]/90 backdrop-blur-2xl border border-white/60 dark:border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-lg transition-colors duration-300"
      }>
        
        {/* TOAST DE FEEDBACK INMEDIATO */}
        {toastMessage && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-xl bg-[#001E4D]/90 dark:bg-white/95 text-white dark:text-[#001E4D] text-xs font-bold shadow-xl flex items-center space-x-2 border border-white/20 backdrop-blur-md anim-tab-enter">
            <CheckCircle2 className="w-4 h-4 text-[#00DD9E]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* CABECERA PRINCIPAL SUPERIOR (DESKTOP & MOBILE) */}
        {/* CABECERA SUPERIOR (Solo visible en pantalla de login si no está autenticado) */}
        {!isAuthenticated && (
          <header className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5 border-b border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c141f]/80 backdrop-blur-2xl">
          <div className="flex items-center space-x-3">
            {/* Botón Menú Móvil en Standalone */}
            {isStandalonePage && isAuthenticated && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
                aria-label="Abrir menú de navegación"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <Emoji3D name="key" className="w-10 h-10 drop-shadow-md shrink-0" alt="Sistema Interno de Gestión" />

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-white">
                  Sistema Interno de Gestión
                </h1>
                <span className="hidden sm:inline-block text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
                  105.5 FM
                </span>
                {isAuthenticated && (
                  <button
                    onClick={() => { setActiveTab('wordpress'); setMobileMenuOpen(false); }}
                    className={`hidden md:inline-flex items-center space-x-1 text-[11px] font-black uppercase px-2 py-0.5 rounded-lg border transition cursor-pointer ${
                      wpConfig.status === 'connected'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/25 hover:bg-emerald-500/25'
                        : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/25 hover:bg-amber-500/25'
                    }`}
                    title="Estado de la conexión con neblina105fm.com"
                  >
                    {wpConfig.status === 'connected' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    <span>{wpConfig.status === 'connected' ? 'WP Conectado' : 'Configurar WP API'}</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[280px] sm:max-w-md">
                Panel Privado de Publicación, Directorio Comercial & Sala de Prensa
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

            {isAuthenticated && (
              <>
                <SystemInstallButton appName="Sistema Interno" />

                <button
                  onClick={handleCopyPrivateLink}
                  className="hidden xl:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-slate-200 dark:bg-white/10 hover:bg-[#00DD9E] hover:text-slate-950 text-slate-700 dark:text-slate-300 transition"
                  title="Copiar URL privada (#admin)"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copiado' : 'Link Privado'}</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-rose-500/10 hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white transition cursor-pointer"
                >
                  Cerrar Sesión
                </button>
              </>
            )}

            {/* Botón Volver a la Web Principal */}
            <button
              onClick={onClose}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black hover:opacity-90 active:scale-95 transition cursor-pointer"
              title="Volver a la Web Pública de Neblina Stereo"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Volver a la Web</span>
              <span className="sm:hidden">Web</span>
            </button>
          </div>
        </header>
        )}

        {/* ============================================================== */}
        {/* PANTALLA 1: FORMULARIO DE ACCESO (SI NO ESTÁ AUTENTICADO) */}
        {/* ============================================================== */}
        {!isAuthenticated ? (
          <div className="flex-1 overflow-y-auto p-6 sm:p-12 flex flex-col items-center justify-center text-center">
            <div className="panel-aeroglass max-w-md w-full p-6 sm:p-8 rounded-2xl border border-white/70 dark:border-white/15 shadow-lg space-y-6 my-auto">
              
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#00DD9E]/20 to-[#FEDC01]/20 text-[#008f7a] dark:text-[#00DD9E] mx-auto flex items-center justify-center border border-[#00DD9E]/30 shadow-inner">
                <Key className="w-8 h-8" />
              </div>

              <div>
                <h4 className="font-display font-black text-xl text-slate-900 dark:text-white">
                  Acceso al Sistema Interno
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Ingrese las credenciales privadas asignadas para administrar noticias, aliados comerciales, denuncias y parrilla radial.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4 text-left">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Usuario
                  </label>
                  <input
                    type="text"
                    value={loginUser}
                    onChange={(e) => { setLoginUser(e.target.value); setAuthError(''); }}
                    placeholder="Usuario asignado..."
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
                      onChange={(e) => { setLoginPass(e.target.value); setAuthError(''); }}
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

                  {authError && (
                    <p className="text-xs text-rose-500 font-semibold mt-2 flex items-center space-x-1.5">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{authError}</span>
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-[#00DD9E] hover:brightness-105 text-[#001E4D] font-bold text-sm transition border border-white/60 cursor-pointer"
                >
                  Ingresar al Sistema
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
            <aside className="hidden lg:flex w-72 max-h-[calc(100vh-65px)] bg-white/80 dark:bg-[#0c141f]/90 backdrop-blur-xl border-r border-slate-200 dark:border-white/10 flex-col justify-between p-4 shrink-0 overflow-y-auto scroll-smooth overscroll-contain">
              <div className="space-y-4">
                {/* Cabecera del Sidebar: Logo Oficial & Sistema Interno */}
                <div className="p-3.5 rounded-2xl bg-slate-100/90 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 space-y-2">
                  <div className="flex items-center space-x-3">
                    <Emoji3D name="key" className="w-10 h-10 drop-shadow-md shrink-0" alt="Sistema Interno" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-1.5">
                        <h3 className="font-display font-black text-xs text-slate-900 dark:text-white truncate">
                          Sistema Interno
                        </h3>
                        <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-700 dark:text-[#00DD9E]">
                          105.5 FM
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        Dirección & Administración
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-3 py-1 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Módulos de Control
                </div>
                <nav className="space-y-1">
                  {adminModules.map((mod) => {
                    const Icon = mod.icon;
                    const isActive = activeTab === mod.id;
                    return (
                      <button
                        key={mod.id}
                        onClick={() => setActiveTab(mod.id)}
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
                        ) : mod.statusPill ? (
                          <span className={`text-[11px] font-black px-1.5 py-0.2 rounded-lg ${
                            mod.id === 'youtube_playlist' && ytPlaylistReminder?.shouldRemind
                              ? 'bg-amber-500 text-slate-950 animate-pulse'
                              : wpConfig.status === 'connected' 
                              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' 
                              : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                          }`}>
                            {mod.statusPill}
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
                  <SystemInstallButton appName="Neblina Admin" className="w-full justify-center" />
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
                <div className="relative w-72 max-w-[80vw] bg-white dark:bg-[#0c141f] h-full shadow-lg flex flex-col justify-between p-5 z-10 animate-fadeIn">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                      <div className="flex items-center space-x-2">
                        <Lock className="w-4 h-4 text-[#00DD9E]" />
                        <span className="font-display font-black text-sm text-slate-900 dark:text-white">Menú Administrativo</span>
                      </div>
                      <button 
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <nav className="space-y-1">
                      {adminModules.map((mod) => {
                        const Icon = mod.icon;
                        const isActive = activeTab === mod.id;
                        return (
                          <button
                            key={mod.id}
                            onClick={() => {
                              setActiveTab(mod.id);
                              setMobileMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
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
                  <span>Módulos</span>
                </button>
                {adminModules.map((mod) => {
                  const Icon = mod.icon;
                  const isActive = activeTab === mod.id;
                  return (
                    <button
                      key={mod.id}
                      onClick={() => setActiveTab(mod.id)}
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
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Contenedor Interior Scrolleable */}
              <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
                <Suspense fallback={
                  <div className="py-20 flex flex-col items-center justify-center space-y-3">
                    <div className="w-8 h-8 rounded-full border-2 border-slate-300 dark:border-white/10 border-t-[#00DD9E] animate-spin" />
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-bold tracking-wider uppercase animate-pulse">Cargando módulo...</span>
                  </div>
                }>

              {/* ============================================================== */}
              {/* TAB 0: NOTIFICACIONES & ALERTAS OPERATIVAS DEL SISTEMA */}
              {/* ============================================================== */}
              {activeTab === 'notifications' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
                    <div className="flex items-center space-x-3 pb-3 border-b border-slate-100 dark:border-white/5">
                      <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                        <Bell className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-display font-black text-base sm:text-lg text-slate-900 dark:text-white">
                          Centro de Notificaciones y Alertas Operativas
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Supervisa en tiempo real las tareas pendientes de la emisora, programación y avisos prioritarios.
                        </p>
                      </div>
                    </div>

                    {/* ALERTA PLAYLIST YOUTUBE */}
                    {ytPlaylistReminder?.shouldRemind ? (
                      <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start space-x-3">
                          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-black text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                              Recordatorio Programado: Faltan {ytPlaylistReminder.daysRemaining} día(s) para el cambio de Playlist YouTube ({ytPlaylistReminder.nextSwitchFormatted})
                            </p>
                            <p className="text-xs text-amber-800/90 dark:text-amber-300/90 mt-1 leading-relaxed">
                              Aún no has dejado un enlace en cola para la próxima semana en la sección de Recomendaciones del Ranking. Configúralo ahora para que el cambio se realice automáticamente.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTab('youtube_playlist')}
                          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shrink-0 transition cursor-pointer shadow-sm active:scale-95"
                        >
                          Programar Playlist en Cola
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center space-x-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-emerald-800 dark:text-[#00DD9E]">
                            Playlist de YouTube al día
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            La lista de reproducción semanal se encuentra activa y sin alertas de vencimiento inmediato.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* OTRAS ALERTAS OPERATIVAS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <MessageSquare className="w-4 h-4 text-sky-500" />
                          <div>
                            <span className="text-xs font-bold text-slate-800 dark:text-white block">Comentarios de Prensa</span>
                            <span className="text-[11px] text-slate-500">{pendingCommentsCount} por moderar</span>
                          </div>
                        </div>
                        {pendingCommentsCount > 0 && (
                          <button
                            type="button"
                            onClick={() => setActiveTab('comments')}
                            className="px-3 py-1 rounded-lg bg-sky-500 text-white font-bold text-[11px]"
                          >
                            Revisar
                          </button>
                        )}
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Newspaper className="w-4 h-4 text-emerald-500" />
                          <div>
                            <span className="text-xs font-bold text-slate-800 dark:text-white block">Notas de Periodistas</span>
                            <span className="text-[11px] text-slate-500">{pendingPressNotesCount} en revisión</span>
                          </div>
                        </div>
                        {pendingPressNotesCount > 0 && (
                          <button
                            type="button"
                            onClick={() => setActiveTab('journalists')}
                            className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-[11px]"
                          >
                            Revisar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* TAB: CLIENTES DE LA RADIO & COBRANZAS (CRM) */}
              {/* ============================================================== */}
              {activeTab === 'clients' && (
                <AdminClientsTab 
                  onShowToast={triggerToast} 
                  onNavigateToBanners={(cId) => {
                    setSelectedBannerClientId(cId);
                    setActiveTab('banners');
                  }}
                />
              )}

              {/* ============================================================== */}
              {/* TAB: PORTAL DE CLIENTES / ALIADOS COMERCIALES */}
              {/* ============================================================== */}
              {activeTab === 'client_portal' && (
                <AdminClientPortalManager
                  onShowToast={triggerToast}
                />
              )}

              {/* ============================================================== */}
              {/* TAB: EQUIPO DE LOCUTORES Y VENTAS (ACCESOS, TAREAS, ENTREVISTAS, CHAT) */}
              {/* ============================================================== */}
              {activeTab === 'staff_team' && (
                <AdminStaffPortalManager
                  mode="team_only"
                  onShowToast={triggerToast}
                />
              )}

              {/* ============================================================== */}
              {/* TAB: PERIODISTAS & NOTAS DE PRENSA (EQUIPO, ACCESOS, NOTAS, REVISIÓN) */}
              {/* ============================================================== */}
              {activeTab === 'journalists' && (
                <AdminJournalistsTab
                  onShowToast={triggerToast}
                />
              )}

              {/* ============================================================== */}
              {/* TAB: BANNERS PUBLICITARIOS (IMÁGENES Y VIDEOS) */}
              {/* ============================================================== */}
              {activeTab === 'banners' && (
                <AdminBannersTab 
                  onShowToast={triggerToast} 
                  selectedClientId={selectedBannerClientId}
                />
              )}

              {/* ============================================================== */}
              {/* TAB 1: NOTICIAS & SALA DE PRENSA */}
              {/* ============================================================== */}
              
              {/* ============================================================== */}
              {/* TAB REPOSTEO DE NOTAS DE PRENSA CON IA                         */}
              {/* ============================================================== */}
              {activeTab === 'ai_repost' && (
                <AdminAiRepostTab 
                  onShowToast={triggerToast}
                  onNewsPublished={() => {
                    setNewsList(getAllNews());
                    setCategoriesList(getAllCategories());
                  }}
                />
              )}

              {activeTab === 'news' && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* PAPELERA SECCIONAL DE NOTICIAS ESTILO APPLE */}
                  <SectionTrashToggle
                    isTrashView={newsTrashView}
                    onToggleView={setNewsTrashView}
                    activeCount={newsList.filter(n => !n.trashed).length}
                    trashCount={newsList.filter(n => !!n.trashed).length}
                    onEmptyTrash={handleEmptyNewsTrash}
                    activeLabel="Noticias Publicadas"
                    trashLabel="Papelera"
                  />

                  {/* BARRA DE HERRAMIENTAS DE NOTICIAS */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 dark:bg-[#19222e] p-3.5 rounded-2xl border border-slate-200 dark:border-white/10">
                    
                    <div className="flex-1 flex flex-wrap items-center gap-2">
                      <div className="relative flex-1 min-w-[200px]">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={newsSearch}
                          onChange={(e) => setNewsSearch(e.target.value)}
                          placeholder="Buscar por título, contenido o autor..."
                          className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00DD9E]"
                        />
                      </div>

                      <select
                        value={newsCategoryFilter}
                        onChange={(e) => setNewsCategoryFilter(e.target.value)}
                        className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                      >
                        <option value="Todas">Todas las Categorías ({newsList.filter(n => newsTrashView ? !!n.trashed : !n.trashed).length})</option>
                        {categoriesList.map(cat => (
                          <option key={cat.id || cat.name} value={cat.name}>
                            {cat.name} ({cat.count || 0})
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => setIsCategoryModalOpen(!isCategoryModalOpen)}
                        className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold text-xs border transition shadow-sm cursor-pointer ${
                          isCategoryModalOpen
                            ? 'bg-purple-600 text-white border-purple-500'
                            : 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30'
                        }`}
                        title="Gestionar y eliminar categorías"
                      >
                        <Tag className="w-3.5 h-3.5" />
                        <span>Categorías ({categoriesList.length})</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSyncFromWordPress}
                        disabled={isSyncingNews}
                        className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 font-bold text-xs border border-sky-500/30 transition cursor-pointer disabled:opacity-50"
                        title="Obtener las noticias más recientes del portal oficial neblina105fm.com"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncingNews ? 'animate-spin' : ''}`} />
                        <span>{isSyncingNews ? 'Sincronizando...' : 'Sincronizar WordPress'}</span>
                      </button>

                      <button
                        onClick={handleOpenCreateNews}
                        className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Redactar Noticia</span>
                      </button>
                    </div>
                  </div>

                  {/* PANEL DE GESTIÓN Y ELIMINACIÓN DE CATEGORÍAS */}
                  {isCategoryModalOpen && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-purple-500/5 dark:bg-purple-950/20 border border-purple-500/30 shadow-md space-y-3 animate-fadeIn">
                      <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
                        <div className="flex items-center space-x-2">
                          <Tag className="w-4 h-4 text-purple-500" />
                          <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                            Gestión de Categorías de Notas de Prensa
                          </h5>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsCategoryModalOpen(false)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Elige en qué categoría publicar tus notas, crea nuevas categorías al instante o elimina las que ya no uses. Al eliminar una categoría, sus notas se reasignarán automáticamente a la categoría principal para no perder ninguna nota de prensa.
                      </p>

                      {/* Formulario para añadir nueva categoría */}
                      <form onSubmit={handleAddCategory} className="flex gap-2">
                        <input
                          type="text"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="Nombre de la nueva categoría (Ej: Opinión, Regionales, Tecnología)..."
                          className="flex-1 text-xs px-3 py-2 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                        <button
                          type="submit"
                          disabled={!newCategoryName.trim()}
                          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold text-xs transition cursor-pointer"
                        >
                          <FolderPlus className="w-3.5 h-3.5" />
                          <span>Añadir Categoría</span>
                        </button>
                      </form>

                      {/* Lista de Categorías con Botón de Eliminar */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {categoriesList.map(cat => (
                          <div 
                            key={cat.id || cat.name}
                            className="flex items-center space-x-2 pl-3 pr-2 py-1.5 rounded-xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm text-xs font-semibold text-slate-800 dark:text-slate-200"
                          >
                            {editingCategoryId === (cat.id || cat.name) ? (
                              <div className="flex items-center space-x-1">
                                <input
                                  type="text"
                                  value={editingCategoryName}
                                  onChange={(e) => setEditingCategoryName(e.target.value)}
                                  className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-black/40 border border-purple-500 text-slate-900 dark:text-white"
                                  autoFocus
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditCategory(cat)}
                                  className="p-1 text-emerald-500 hover:text-emerald-400 cursor-pointer"
                                  title="Guardar nombre"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingCategoryId(null)}
                                  className="p-1 text-slate-400 hover:text-slate-300 cursor-pointer"
                                  title="Cancelar"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <span>{cat.name}</span>
                                <span className="text-[11px] px-1.5 py-0.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 font-bold">
                                  {cat.count || 0}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleStartEditCategory(cat)}
                                  className="p-1 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 transition cursor-pointer"
                                  title={`Renombrar categoría "${cat.name}"`}
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCategory(cat)}
                                  className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                                  title={`Eliminar categoría "${cat.name}"`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* FORMULARIO DESPLEGABLE / MODAL DE REDACCIÓN DE NOTICIA */}
                  {isNewsFormOpen && (
                    <div className="p-5 sm:p-6 rounded-2xl bg-slate-100/80 dark:bg-[#1c2633] border-2 border-emerald-500/30 shadow-xl space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
                        <h4 className="font-display font-black text-base text-slate-900 dark:text-white flex items-center space-x-2">
                          <Newspaper className="w-4 h-4 text-emerald-500" />
                          <span>{editingNews ? 'Editar Noticia de Prensa' : 'Nueva Noticia de Prensa'}</span>
                        </h4>
                        <button 
                          onClick={() => setIsNewsFormOpen(false)}
                          className="p-1 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <form onSubmit={handleSaveNews} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="md:col-span-2">
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Título de la Noticia *
                            </label>
                            <input
                              type="text"
                              value={newsFormData.title}
                              onChange={(e) => setNewsFormData({...newsFormData, title: e.target.value})}
                              placeholder="Ej: Santo Domingo celebra fiesta patronal con masiva asistencia..."
                              required
                              className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00DD9E]"
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                Categoría de la Noticia *
                              </label>
                              <button
                                type="button"
                                onClick={() => setIsCategoryModalOpen(true)}
                                className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline font-bold"
                              >
                                + Gestionar
                              </button>
                            </div>
                            <select
                              value={newsFormData.category}
                              onChange={(e) => setNewsFormData({...newsFormData, category: e.target.value})}
                              className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00DD9E]"
                            >
                              {categoriesList.map(c => (
                                <option key={c.id || c.name} value={c.name}>{c.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Autor / Periodista / Fuente
                            </label>
                            <input
                              type="text"
                              value={newsFormData.author}
                              onChange={(e) => setNewsFormData({...newsFormData, author: e.target.value})}
                              placeholder="Ej: Redacción Neblina 105.5 FM / Jhonas Toro"
                              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Enlace de Red Social Embebida (Instagram, YouTube, Threads, Facebook, X)
                            </label>
                            <input
                              type="url"
                              value={newsFormData.socialEmbedUrl}
                              onChange={(e) => setNewsFormData({...newsFormData, socialEmbedUrl: e.target.value})}
                              placeholder="https://www.instagram.com/p/... o link de YouTube / Threads"
                              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* GESTIÓN MULTI-FOTO DE 1 A 3 FOTOGRAFÍAS PARA EL CARRUSEL */}
                        <div className="space-y-3 p-4 rounded-2xl bg-white dark:bg-[#0c131c] border border-slate-200 dark:border-white/10 shadow-sm">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <div>
                              <label className="block text-xs font-black text-slate-800 dark:text-white flex items-center space-x-1.5">
                                <Images className="w-4 h-4 text-emerald-500" />
                                <span>Fotografías de la Nota de Prensa (1 a 3 fotos para el Carrusel)</span>
                              </label>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                La primera foto es la portada oficial. Si añades 2 o 3 fotos, correrán en un carrusel interactivo tanto en el portal web como en la app móvil.
                              </p>
                            </div>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-[#00DD9E] self-start sm:self-auto">
                              {(newsFormData.images || []).filter(Boolean).length} de 3 fotos cargadas
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {[0, 1, 2].map((idx) => {
                              const currentUrl = (newsFormData.images && newsFormData.images[idx]) || (idx === 0 ? newsFormData.image : '') || '';
                              const isPrimary = idx === 0;

                              return (
                                <div 
                                  key={idx}
                                  className={`p-3 rounded-2xl border transition-all ${
                                    currentUrl 
                                      ? 'border-emerald-500/40 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.05]' 
                                      : 'border-dashed border-slate-300 dark:border-white/15 bg-slate-50/50 dark:bg-white/[0.02]'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                                      <span>Foto {idx + 1}</span>
                                      {isPrimary ? (
                                        <span className="text-[11px] px-1.5 py-0.2 rounded-md bg-emerald-500 text-slate-950 font-black">
                                          Portada Principal
                                        </span>
                                      ) : (
                                        <span className="text-[11px] px-1.5 py-0.2 rounded-md bg-slate-200 dark:bg-white/10 text-slate-500">
                                          Opcional
                                        </span>
                                      )}
                                    </span>

                                    {currentUrl && (
                                      <button
                                        type="button"
                                        onClick={() => handleRemovePhoto(idx)}
                                        className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/15 transition cursor-pointer"
                                        title="Quitar esta foto"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>

                                  {currentUrl ? (
                                    <div className="relative h-28 rounded-xl overflow-hidden border border-slate-200 dark:border-white/15 group">
                                      <img 
                                        src={currentUrl} 
                                        alt={`Foto ${idx + 1}`} 
                                        className="w-full h-full object-cover" 
                                      />
                                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                                        <button
                                          type="button"
                                          onClick={() => handleRemovePhoto(idx)}
                                          className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-bold shadow"
                                        >
                                          Cambiar / Quitar
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      <label className="flex flex-col items-center justify-center h-20 rounded-xl border border-dashed border-slate-300 dark:border-white/15 bg-white dark:bg-[#0c131c] hover:border-emerald-500/50 cursor-pointer transition">
                                        <ImagePlus className="w-5 h-5 text-slate-400 group-hover:text-emerald-500" />
                                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1">
                                          Subir archivo local
                                        </span>
                                        <input
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) => handleMultiPhotoUpload(idx, e)}
                                          className="hidden"
                                        />
                                      </label>

                                      <input
                                        type="text"
                                        placeholder="o pegar URL https://..."
                                        value={currentUrl}
                                        onChange={(e) => handleMultiPhotoUrlChange(idx, e.target.value)}
                                        className="w-full text-[11px] px-2.5 py-1 rounded-lg bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white focus:outline-none"
                                      />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Vista previa en vivo del carrusel interactivo en el formulario si hay fotos */}
                          {((newsFormData.images || []).filter(Boolean).length > 0 || newsFormData.image) && (
                            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/10">
                              <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-2 flex items-center space-x-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                <span>Vista previa en vivo del carrusel para esta nota de prensa:</span>
                              </div>
                              <div className="max-w-md mx-auto">
                                <NewsImageCarousel
                                  images={(newsFormData.images || []).filter(Boolean).length > 0 ? (newsFormData.images || []).filter(Boolean) : [newsFormData.image]}
                                  title={newsFormData.title || 'Vista previa'}
                                  className="h-44 rounded-2xl shadow-md border border-slate-200 dark:border-white/15"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Resumen breve */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Resumen / Bajada de la Noticia (Texto corto para tarjetas y carrusel)
                          </label>
                          <textarea
                            rows={2}
                            value={newsFormData.excerpt}
                            onChange={(e) => setNewsFormData({...newsFormData, excerpt: e.target.value})}
                            placeholder="Breve resumen informativo de 1 a 2 líneas..."
                            className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white focus:outline-none"
                          />
                        </div>

                        {/* Contenido Completo */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Cuerpo Completo de la Noticia (Párrafos, notas de prensa y enlaces)
                          </label>
                          <textarea
                            rows={6}
                            value={newsFormData.content}
                            onChange={(e) => setNewsFormData({...newsFormData, content: e.target.value})}
                            placeholder="Escribe la nota completa aquí. Soporta texto normal, saltos de línea y enlaces a redes sociales..."
                            required
                            className="w-full text-xs font-mono px-3 py-2 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white focus:outline-none"
                          />
                        </div>

                        {/* Casillas de Verificación de Publicación */}
                        <div className="flex flex-wrap items-center gap-6 pt-2">
                          <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newsFormData.featuredInCarousel}
                              onChange={(e) => setNewsFormData({...newsFormData, featuredInCarousel: e.target.checked})}
                              className="rounded text-emerald-500 focus:ring-emerald-400 w-4 h-4"
                            />
                            <span>Destacar en el Carrusel de 6 Noticias de Inicio</span>
                          </label>

                          <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newsFormData.status === 'published'}
                              onChange={(e) => setNewsFormData({
                                ...newsFormData, 
                                status: e.target.checked ? 'published' : 'draft'
                              })}
                              className="rounded text-emerald-500 focus:ring-emerald-400 w-4 h-4"
                            />
                            <span>Publicar inmediatamente (si se desmarca, queda en Borrador)</span>
                          </label>

                          <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newsFormData.publishToWordPress !== false}
                              onChange={(e) => setNewsFormData({
                                ...newsFormData, 
                                publishToWordPress: e.target.checked
                              })}
                              className="rounded text-[#00DD9E] focus:ring-[#00DD9E] w-4 h-4"
                            />
                            <span className="flex items-center space-x-1.5">
                              <span>Publicar también en WordPress (neblina105fm.com)</span>
                              <span className="text-[11px] px-1.5 py-0.2 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
                                REST API
                              </span>
                            </span>
                          </label>
                        </div>

                        <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-white/10">
                          <button
                            type="button"
                            onClick={() => setIsNewsFormOpen(false)}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            disabled={isSyncingNews}
                            className="flex items-center space-x-2 px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00DD9E] hover:opacity-95 text-slate-950 font-black text-xs transition disabled:opacity-50 cursor-pointer"
                          >
                            {isSyncingNews ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Publicando en WordPress...</span>
                              </>
                            ) : (
                              <span>Guardar Noticia</span>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* LISTADO DE NOTICIAS CON CONTROLES RÁPIDOS (EN LOTES DE 10) */}
                  <div className="grid grid-cols-1 gap-3">
                    {adminTotalNewsCount === 0 ? (
                      <div className="p-8 text-center text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-dashed border-slate-300 dark:border-white/10">
                        <Newspaper className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="text-xs">No se encontraron noticias con los filtros aplicados.</p>
                      </div>
                    ) : (
                      paginatedNews.map((item) => (
                        <div 
                          key={item.id}
                          className="p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm hover:border-emerald-500/40 transition"
                        >
                          <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                            {item.image ? (
                              <div className="relative flex-shrink-0">
                                <img 
                                  src={item.image} 
                                  alt={item.title} 
                                  className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-white/10"
                                />
                                {item.images && item.images.length > 1 && (
                                  <span className="absolute -bottom-1 -right-1 bg-black/80 text-[#00DD9E] text-[11px] font-black px-1 rounded-md border border-white/20">
                                    {item.images.length}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="w-16 h-16 rounded-xl bg-slate-200 dark:bg-white/10 flex items-center justify-center flex-shrink-0 text-slate-400">
                                <FileText className="w-6 h-6" />
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                <span className="text-[11px] font-black uppercase px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-[#00DD9E]">
                                  {item.category}
                                </span>
                                {item.images && item.images.length > 1 && (
                                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/25 flex items-center space-x-1">
                                    <Images className="w-3 h-3" />
                                    <span>{item.images.length} fotos</span>
                                  </span>
                                )}
                                <span className="text-[11px] text-slate-400">· {item.date}</span>
                                <span className="text-[11px] text-slate-400">· {item.author}</span>
                              </div>

                              <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                                {item.title}
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                {item.excerpt || item.content?.replace(/<[^>]*>?/gm, '')}
                              </p>
                            </div>
                          </div>

                          {/* INTERRUPTORES RÁPIDOS Y ACCIONES */}
                          <div className="flex flex-wrap items-center gap-2 self-end md:self-auto">
                            {newsTrashView ? (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleRestoreNews(item.id)}
                                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-[#00DD9E] text-emerald-600 dark:text-[#00DD9E] hover:text-[#001E4D] font-bold text-xs transition cursor-pointer border border-emerald-500/30"
                                  title="Restaurar noticia"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Restaurar</span>
                                </button>
                                <button
                                  onClick={() => handlePermanentDeleteNews(item.id, item.title)}
                                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white font-bold text-xs transition cursor-pointer border border-rose-500/30"
                                  title="Eliminar de forma permanente"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Eliminar</span>
                                </button>
                              </div>
                            ) : (
                              <>
                                {/* Toggle Carrusel Inicio */}
                                <button
                                  onClick={() => handleToggleNewsFeatured(item.id)}
                                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition flex items-center space-x-1.5 cursor-pointer ${
                                    item.featuredInCarousel
                                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                      : 'bg-slate-100 dark:bg-white/5 text-slate-400 border-transparent hover:border-slate-300'
                                  }`}
                                  title="Destacar en el carrusel de 6 noticias de Inicio"
                                >
                                  <Emoji3D name="star" className="w-3.5 h-3.5" alt="Carrusel" />
                                  <span>{item.featuredInCarousel ? 'En Carrusel' : 'No Carrusel'}</span>
                                </button>

                                {/* Toggle Estado Publicada vs Borrador */}
                                <button
                                  onClick={() => handleToggleNewsPublished(item.id)}
                                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition flex items-center space-x-1.5 cursor-pointer ${
                                    item.status === 'published'
                                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                      : 'bg-slate-200 dark:bg-white/10 text-slate-500 border-slate-300 dark:border-white/10'
                                  }`}
                                >
                                  <Emoji3D name={item.status === 'published' ? 'eyes' : 'pencil'} className="w-3.5 h-3.5" alt="Estado" />
                                  <span>{item.status === 'published' ? 'Publicada' : 'Borrador'}</span>
                                </button>

                                {/* Editar */}
                                <button
                                  onClick={() => handleOpenEditNews(item)}
                                  className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-blue-500 hover:text-white text-slate-600 dark:text-slate-300 transition cursor-pointer"
                                  title="Editar noticia"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>

                                {/* Eliminar temporal (Mover a papelera) */}
                                <button
                                  onClick={() => handleDeleteNews(item.id, item.title)}
                                  className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-rose-500 hover:text-white text-slate-600 dark:text-slate-300 transition cursor-pointer"
                                  title="Mover a la papelera"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* BARRA DE PAGINACIÓN EN LOTES DE 10 PARA EL SISTEMA */}
                  {adminTotalNewsPages > 1 && (
                    <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 text-center sm:text-left">
                        Mostrando lote de 10 notas · Página <span className="font-black text-slate-900 dark:text-white">{adminNewsPage}</span> de <span className="font-black text-slate-900 dark:text-white">{adminTotalNewsPages}</span> ({adminTotalNewsCount} notas en total)
                      </div>

                      <div className="flex items-center space-x-1.5 overflow-x-auto max-w-full pb-1">
                        <button
                          type="button"
                          onClick={() => setAdminNewsPage(1)}
                          disabled={adminNewsPage === 1}
                          className="p-2 rounded-xl bg-white dark:bg-[#19222e] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                          title="Primera página"
                        >
                          <ChevronsLeft className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setAdminNewsPage(prev => Math.max(1, prev - 1))}
                          disabled={adminNewsPage === 1}
                          className="p-2 rounded-xl bg-white dark:bg-[#19222e] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                          title="Lote anterior"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>

                        <span className="px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-[#00DD9E] font-black text-xs border border-emerald-500/30">
                          Lote {adminNewsPage} / {adminTotalNewsPages}
                        </span>

                        <button
                          type="button"
                          onClick={() => setAdminNewsPage(prev => Math.min(adminTotalNewsPages, prev + 1))}
                          disabled={adminNewsPage === adminTotalNewsPages}
                          className="p-2 rounded-xl bg-white dark:bg-[#19222e] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                          title="Siguiente lote"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setAdminNewsPage(adminTotalNewsPages)}
                          disabled={adminNewsPage === adminTotalNewsPages}
                          className="p-2 rounded-xl bg-white dark:bg-[#19222e] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                          title="Última página"
                        >
                          <ChevronsRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* CARGADOR RÁPIDO DE SIGUIENTE LOTE DE 10 NOTAS */}
                  {adminNewsPage < adminTotalNewsPages && (
                    <div className="flex justify-center pt-2">
                      <button
                        type="button"
                        onClick={() => setAdminNewsPage(prev => Math.min(adminTotalNewsPages, prev + 1))}
                        className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-[#00DD9E]/20 hover:from-emerald-500/30 hover:to-[#00DD9E]/30 text-emerald-800 dark:text-[#00DD9E] font-black text-xs border border-emerald-500/30 transition shadow-sm cursor-pointer"
                      >
                        <span>Cargar Siguiente Página de 10 Notas (Lote #{adminNewsPage + 1})</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ============================================================== */}
              {/* TAB COMENTARIOS DE PRENSA: MODERACIÓN & REGISTRO CIUDADANO */}
              {/* ============================================================== */}
              {activeTab === 'comments' && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* PAPELERA SECCIONAL DE COMENTARIOS */}
                  {/* CONTENEDOR UNIFICADO: GESTIÓN DE COMENTARIOS, PESTAÑAS (TODOS, PENDIENTES, APROBADOS, RECHAZADOS, PAPELERA), BUSCADOR Y ACCIONES (EXCEL, JSON, RESTABLECER) */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-3">
                      <div>
                        <h4 className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-white flex items-center space-x-2">
                          <MessageSquare className="w-4 h-4 text-[#00DD9E]" />
                          <span>Gestión y Moderación de Comentarios en Prensa</span>
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Aprueba o rechaza los comentarios ciudadanos antes de su publicación web. Cédula y teléfono son de uso exclusivo interno.
                        </p>
                      </div>

                      {/* Botones de Acción Unificados: Restablecer, Excel CSV y JSON */}
                      <div className="flex items-center flex-wrap gap-2 self-start md:self-auto shrink-0">
                        <button
                          type="button"
                          onClick={handleResetComments}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
                          title="Restablecer comentarios de prueba por defecto"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restablecer</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleExportCommentsCSV}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
                          title="Exportar comentarios para Excel en formato CSV"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Excel (CSV)</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleExportCommentsJSON}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
                          title="Exportar respaldo JSON completo"
                        >
                          <span>JSON</span>
                        </button>
                      </div>
                    </div>

                    {/* Barra de Filtros: Pestañas de Estado (Comentarios Activos, Por Revisar/Pendientes, Aprobados, Papelera) y Buscador */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-white/10 overflow-x-auto scrollbar-none">
                        {[
                          { id: 'all', label: 'Comentarios Activos', isTrash: false, count: commentsList.filter(c => !c.trashed).length },
                          { id: 'pending', label: 'Por Revisar', isTrash: false, count: commentsList.filter(c => !c.trashed && c.status === 'pending').length, alert: true },
                          { id: 'approved', label: 'Aprobados', isTrash: false, count: commentsList.filter(c => !c.trashed && c.status === 'approved').length },
                          { id: 'trash', label: 'Papelera', isTrash: true, count: commentsList.filter(c => !!c.trashed).length }
                        ].map((tab) => {
                          const isCurrent = tab.isTrash ? commentsTrashView : (!commentsTrashView && commentStatusFilter === tab.id);
                          return (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => {
                                if (tab.isTrash) {
                                  setCommentsTrashView(true);
                                } else {
                                  setCommentsTrashView(false);
                                  setCommentStatusFilter(tab.id);
                                }
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                                isCurrent
                                  ? tab.isTrash
                                    ? 'bg-rose-500 text-white shadow-sm font-black'
                                    : tab.id === 'pending'
                                    ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                                    : 'bg-emerald-500 text-slate-950 shadow-sm font-black'
                                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                              }`}
                            >
                              <span>{tab.label}</span>
                              <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                                isCurrent
                                  ? 'bg-black/15 text-current'
                                  : tab.alert && tab.count > 0
                                  ? 'bg-amber-500 text-slate-950 font-black animate-pulse'
                                  : 'bg-black/10 dark:bg-white/10 text-slate-500'
                              }`}>
                                {tab.count}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Buscador en Tiempo Real */}
                      <div className="relative flex-1 max-w-sm">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Buscar por ciudadano, cédula, teléfono..."
                          value={commentSearch}
                          onChange={(e) => setCommentSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#00DD9E]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* LISTADO DE COMENTARIOS (CARDS) */}
                  <div className="space-y-4">
                    {(() => {
                      const filtered = commentsList.filter(c => {
                        const isTrash = !!c.trashed;
                        if (commentsTrashView ? !isTrash : isTrash) return false;
                        if (commentStatusFilter !== 'all' && c.status !== commentStatusFilter) return false;
                        if (!commentSearch.trim()) return true;
                        const q = commentSearch.toLowerCase().trim();
                        return (
                          (c.authorName || '').toLowerCase().includes(q) ||
                          (c.authorCedula || '').toLowerCase().includes(q) ||
                          (c.authorPhone || '').toLowerCase().includes(q) ||
                          (c.authorLocation || '').toLowerCase().includes(q) ||
                          (c.newsTitle || '').toLowerCase().includes(q) ||
                          (c.comment || '').toLowerCase().includes(q)
                        );
                      });

                      if (filtered.length === 0) {
                        return (
                          <div className="p-12 text-center rounded-2xl bg-slate-50 dark:bg-[#19222e] border border-slate-200 dark:border-white/10 space-y-2">
                            <MessageSquare className="w-8 h-8 mx-auto text-slate-400 opacity-40" />
                            <p className="font-display font-bold text-sm text-slate-800 dark:text-slate-200">
                              {commentsTrashView ? 'La papelera de comentarios está vacía' : 'No hay comentarios que coincidan con el filtro'}
                            </p>
                            <p className="text-xs text-slate-400">
                              {commentsTrashView ? 'Los comentarios eliminados temporalmente aparecerán en esta papelera.' : 'Selecciona otra pestaña de estado o modifica los términos de búsqueda.'}
                            </p>
                          </div>
                        );
                      }

                      return filtered.map((c) => {
                        const cleanPhone = (c.authorPhone || '').replace(/[^0-9]/g, '');
                        const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : null;

                        return (
                          <div
                            key={c.id}
                            className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#19222e] border transition shadow-sm space-y-3.5 ${
                              c.status === 'pending'
                                ? 'border-amber-500/40 ring-1 ring-amber-500/20'
                                : c.status === 'approved'
                                  ? 'border-emerald-500/30'
                                  : 'border-slate-200 dark:border-white/10 opacity-75'
                            }`}
                          >
                            {/* Fila 1: Encabezado con Estados y Metadatos de la Noticia */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200 dark:border-white/10">
                              <div className="flex flex-wrap items-center gap-2">
                                {c.status === 'pending' && (
                                  <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center space-x-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                    <span>Pendiente de Aprobación</span>
                                  </span>
                                )}

                                {c.status === 'approved' && (
                                  <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-[#00DD9E] border border-emerald-500/30 flex items-center space-x-1.5">
                                    <CheckCircle2 className="w-3 h-3 text-[#00DD9E]" />
                                    <span>Aprobado (Visible en Web)</span>
                                  </span>
                                )}

                                {c.status === 'rejected' && (
                                  <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-black uppercase tracking-wider bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center space-x-1.5">
                                    <X className="w-3 h-3" />
                                    <span>Rechazado (No visible)</span>
                                  </span>
                                )}

                                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                                  <Clock className="w-3 h-3 text-[#00DD9E]" />
                                  <span>{c.formattedDate}</span>
                                </span>
                              </div>

                              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-sm">
                                <span className="font-bold text-slate-800 dark:text-slate-200">Nota:</span>{' '}
                                <span className="italic">"{c.newsTitle}"</span>
                              </div>
                            </div>

                            {/* Fila 2: Ficha Interna de Registro Privado (Cédula, Teléfono, Ubicación) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-[#0c131c] border border-slate-200 dark:border-white/5 text-xs">
                              <div>
                                <span className="text-[11px] uppercase font-bold text-slate-400 block mb-0.5">
                                  Nombre y Apellido
                                </span>
                                <strong className="text-slate-900 dark:text-white font-bold block">
                                  {c.authorName}
                                </strong>
                                <span className="text-[11px] text-[#00DD9E] font-bold block mt-0.5">
                                  Visible al público
                                </span>
                              </div>

                              <div>
                                <span className="text-[11px] uppercase font-bold text-slate-400 block mb-0.5">
                                  Cédula de Identidad
                                </span>
                                <strong className="text-slate-800 dark:text-slate-200 font-mono font-bold block">
                                  {c.authorCedula || 'No registrada'}
                                </strong>
                                <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                                  Privado (Solo admin)
                                </span>
                              </div>

                              <div>
                                <span className="text-[11px] uppercase font-bold text-slate-400 block mb-0.5">
                                  Procedencia / Sector
                                </span>
                                <strong className="text-slate-800 dark:text-slate-200 font-medium block truncate" title={c.authorLocation}>
                                  {c.authorLocation || 'No indicada'}
                                </strong>
                                <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                                  Privado (Solo admin)
                                </span>
                              </div>

                              <div>
                                <span className="text-[11px] uppercase font-bold text-slate-400 block mb-0.5">
                                  Teléfono / WhatsApp
                                </span>
                                <div className="flex items-center space-x-1.5">
                                  <strong className="text-slate-800 dark:text-slate-200 font-mono font-bold">
                                    {c.authorPhone || 'Sin teléfono'}
                                  </strong>
                                  {waUrl && (
                                    <a
                                      href={waUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-[#00DD9E] hover:bg-emerald-500 hover:text-white transition"
                                      title="Abrir chat directo de WhatsApp"
                                    >
                                      <MessageCircle className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                </div>
                                <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                                  Privado (Solo admin)
                                </span>
                              </div>
                            </div>

                            {/* Fila 3: Contenido del Comentario */}
                            <div className="space-y-1">
                              <span className="text-[11px] uppercase font-bold text-slate-400">
                                Mensaje del Comentario:
                              </span>
                              <div className="p-3.5 rounded-xl bg-slate-100/70 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
                                {c.comment}
                              </div>
                            </div>

                            {/* Fila 4: Barra de Acciones de Moderación */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200 dark:border-white/10">
                              <div className="text-[11px] text-slate-400">
                                ID Registro: <code className="font-mono text-[11px] bg-slate-100 dark:bg-white/5 px-1 py-0.5 rounded">{c.id}</code>
                              </div>

                              <div className="flex items-center space-x-2">
                                {commentsTrashView ? (
                                  <>
                                    <button
                                      onClick={() => handleRestoreComment(c.id)}
                                      className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-[#00DD9E] text-emerald-600 dark:text-[#00DD9E] hover:text-[#001E4D] font-bold text-xs transition cursor-pointer border border-emerald-500/30"
                                      title="Restaurar comentario de la papelera"
                                    >
                                      <RotateCcw className="w-3.5 h-3.5" />
                                      <span>Restaurar</span>
                                    </button>
                                    <button
                                      onClick={() => handlePermanentDeleteComment(c.id, c.authorName)}
                                      className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white font-bold text-xs transition cursor-pointer border border-rose-500/30"
                                      title="Eliminar definitivamente"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span>Eliminar Definitivamente</span>
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    {c.status !== 'approved' && (
                                      <button
                                        onClick={() => handleApproveComment(c.id)}
                                        className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#00DD9E] hover:bg-[#00DD9E]/90 text-[#001E4D] font-black text-xs transition shadow-sm cursor-pointer"
                                        title="Aprobar comentario para que sea visible en la web"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Aprobar y Publicar</span>
                                      </button>
                                    )}

                                    {c.status === 'approved' && (
                                      <button
                                        onClick={() => handleResetCommentStatus(c.id)}
                                        className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
                                        title="Devolver a estado pendiente"
                                      >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        <span>Pasar a Pendiente</span>
                                      </button>
                                    )}

                                    {c.status !== 'rejected' && (
                                      <button
                                        onClick={() => handleRejectComment(c.id)}
                                        className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white font-bold text-xs transition cursor-pointer"
                                        title="Rechazar comentario"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                        <span>Rechazar</span>
                                      </button>
                                    )}

                                    <button
                                      onClick={() => handleDeleteComment(c.id, c.authorName)}
                                      className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-rose-500 hover:text-white text-slate-500 dark:text-slate-400 transition cursor-pointer"
                                      title="Mover a la papelera"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* TAB: DIRECTORIO DE USUARIOS / CONTACTOS UNIFICADOS */}
              {/* ============================================================== */}
              {activeTab === 'contacts' && (
                <div className="space-y-6 animate-fadeIn">
                  <AdminContactsTab triggerToast={triggerToast} />
                </div>
              )}

              {/* ============================================================== */}
              {/* TAB 2: ALIADOS COMERCIALES & PATROCINANTES (DOBLE VISIBILIDAD) */}
              {/* ============================================================== */}
              {/* ============================================================== */}
              {/* TAB SERVICIO PÚBLICO & AYUDAS                                 */}
              {/* ============================================================== */}
              {activeTab === 'public_service' && (
                <AdminPublicServiceTab onShowToast={triggerToast} />
              )}

              {activeTab === 'sponsors' && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* PAPELERA SECCIONAL DE ALIADOS COMERCIALES */}
                  <SectionTrashToggle
                    isTrashView={sponsorsTrashView}
                    onToggleView={setSponsorsTrashView}
                    activeCount={sponsorsList.filter(s => !s.trashed).length}
                    trashCount={sponsorsList.filter(s => !!s.trashed).length}
                    onEmptyTrash={handleEmptySponsorsTrash}
                    activeLabel="Aliados Activos"
                    trashLabel="Papelera"
                  />

                  {/* BARRA DE HERRAMIENTAS DE ALIADOS */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 dark:bg-[#19222e] p-3.5 rounded-2xl border border-slate-200 dark:border-white/10">
                    
                    <div className="flex-1 flex flex-wrap items-center gap-2">
                      <div className="relative flex-1 min-w-[200px]">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={sponsorSearch}
                          onChange={(e) => setSponsorSearch(e.target.value)}
                          placeholder="Buscar por nombre, rubro o ubicación..."
                          className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00DD9E]"
                        />
                      </div>

                      <select
                        value={sponsorCategoryFilter}
                        onChange={(e) => setSponsorCategoryFilter(e.target.value)}
                        className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                      >
                        {SPONSOR_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={handleOpenCreateSponsor}
                      className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Nuevo Aliado Comercial</span>
                    </button>
                  </div>

                  {/* FORMULARIO DE ALIADO COMERCIAL */}
                  {isSponsorFormOpen && (
                    <div className="p-5 sm:p-6 rounded-2xl bg-slate-100/80 dark:bg-[#1c2633] border-2 border-emerald-500/30 shadow-xl space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
                        <h4 className="font-display font-black text-base text-slate-900 dark:text-white flex items-center space-x-2">
                          <Building2 className="w-4 h-4 text-emerald-500" />
                          <span>{editingSponsor ? 'Editar Aliado Comercial' : 'Registrar Nuevo Aliado Comercial'}</span>
                        </h4>
                        <button 
                          onClick={() => setIsSponsorFormOpen(false)}
                          className="p-1 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <form onSubmit={handleSaveSponsor} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre del Comercio / Empresa *</label>
                            <input
                              type="text"
                              value={sponsorFormData.name}
                              onChange={(e) => setSponsorFormData({...sponsorFormData, name: e.target.value})}
                              placeholder="Ej: Hotel & Cabañas Los Virios"
                              required
                              className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00DD9E]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">RIF o Registro Comercial</label>
                            <input
                              type="text"
                              value={sponsorFormData.rif}
                              onChange={(e) => setSponsorFormData({...sponsorFormData, rif: e.target.value})}
                              placeholder="Ej: J-40192834-5"
                              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Categoría / Rubro *</label>
                            <select
                              value={sponsorFormData.category}
                              onChange={(e) => setSponsorFormData({...sponsorFormData, category: e.target.value})}
                              className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white focus:outline-none"
                            >
                              {SPONSOR_CATEGORIES.filter(c => c !== 'Todas').map(c => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Slogan o Frase Promocional</label>
                            <input
                              type="text"
                              value={sponsorFormData.slogan}
                              onChange={(e) => setSponsorFormData({...sponsorFormData, slogan: e.target.value})}
                              placeholder="Ej: El refugio perfecto con el clima privilegiado de Santo Domingo"
                              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Ubicación / Dirección Física</label>
                            <input
                              type="text"
                              value={sponsorFormData.location}
                              onChange={(e) => setSponsorFormData({...sponsorFormData, location: e.target.value})}
                              placeholder="Ej: Sector El Arbolito, Vía Trasandina, Santo Domingo"
                              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                            />
                          </div>
                        </div>

                        {/* Canales de Contacto y Redes Sociales */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">WhatsApp (con código)</label>
                            <input
                              type="text"
                              value={sponsorFormData.whatsapp}
                              onChange={(e) => setSponsorFormData({...sponsorFormData, whatsapp: e.target.value})}
                              placeholder="584247459774"
                              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Instagram (@usuario o link)</label>
                            <input
                              type="text"
                              value={sponsorFormData.instagram}
                              onChange={(e) => setSponsorFormData({...sponsorFormData, instagram: e.target.value})}
                              placeholder="@losvirios"
                              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Facebook (link o página)</label>
                            <input
                              type="text"
                              value={sponsorFormData.facebook || ''}
                              onChange={(e) => setSponsorFormData({...sponsorFormData, facebook: e.target.value})}
                              placeholder="https://facebook.com/..."
                              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">TikTok (@usuario o link)</label>
                            <input
                              type="text"
                              value={sponsorFormData.tiktok || ''}
                              onChange={(e) => setSponsorFormData({...sponsorFormData, tiktok: e.target.value})}
                              placeholder="@losvirios"
                              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Teléfono Directo de Llamadas</label>
                            <input
                              type="text"
                              value={sponsorFormData.phone || ''}
                              onChange={(e) => setSponsorFormData({...sponsorFormData, phone: e.target.value})}
                              placeholder="+58 424 745 9774"
                              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Sitio Web Oficial</label>
                            <input
                              type="text"
                              value={sponsorFormData.web}
                              onChange={(e) => setSponsorFormData({...sponsorFormData, web: e.target.value})}
                              placeholder="https://..."
                              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Google Maps (Enlace directo)</label>
                            <input
                              type="text"
                              value={sponsorFormData.googleMapsUrl}
                              onChange={(e) => setSponsorFormData({...sponsorFormData, googleMapsUrl: e.target.value})}
                              placeholder="https://maps.google.com/..."
                              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-amber-600 dark:text-amber-400 mb-1 flex items-center justify-between">
                              <span>Menú Digital (URL)</span>
                              <span className="text-[11px] bg-amber-500/20 px-1.5 py-0.5 rounded font-black text-amber-700 dark:text-amber-300">Gastronomía</span>
                            </label>
                            <input
                              type="text"
                              value={sponsorFormData.menuUrl || ''}
                              onChange={(e) => setSponsorFormData({...sponsorFormData, menuUrl: e.target.value})}
                              placeholder="https://.../menu o enlace PDF"
                              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-[#0c131c] border border-amber-500/40 dark:border-amber-500/30 text-slate-900 dark:text-white"
                            />
                          </div>
                        </div>

                        {/* Descripción de la Ubicación / Puntos de Referencia */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Breve Descripción de la Ubicación / Puntos de Referencia
                          </label>
                          <textarea
                            rows={2}
                            value={sponsorFormData.locationDetails || ''}
                            onChange={(e) => setSponsorFormData({...sponsorFormData, locationDetails: e.target.value})}
                            placeholder="Ej: Ubicado en pleno centro de Santo Domingo, a 20 metros de la Plaza Bolívar, al lado del Centro Artesanal..."
                            className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                          />
                        </div>

                        {/* Descripción Completa */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Descripción del Negocio</label>
                          <textarea
                            rows={3}
                            value={sponsorFormData.description}
                            onChange={(e) => setSponsorFormData({...sponsorFormData, description: e.target.value})}
                            placeholder="Descripción de servicios, habitaciones, especialidades gastronómicas o traslados..."
                            className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                          />
                        </div>

                        {/* Logo / Imagen Principal */}
                        <div className="space-y-2 p-3.5 rounded-2xl bg-white dark:bg-[#0c131c] border border-slate-200 dark:border-white/10">
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            Logo Oficial del Comercio (Sube un archivo local o pega una URL)
                          </label>
                          <div className="flex flex-wrap items-center gap-3">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleSponsorLogoUpload}
                              className="text-xs file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-500/20 file:text-emerald-700 dark:file:text-[#00DD9E] cursor-pointer"
                            />
                            <span className="text-xs text-slate-400">o URL:</span>
                            <input
                              type="text"
                              value={sponsorFormData.logo}
                              onChange={(e) => setSponsorFormData({...sponsorFormData, logo: e.target.value})}
                              placeholder="https://..."
                              className="flex-1 min-w-[200px] text-xs px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                            />
                          </div>
                          {sponsorFormData.logo && (
                            <div className="mt-2 w-28 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-white/20 bg-slate-100 dark:bg-black">
                              <img src={sponsorFormData.logo} alt="Logo" className="w-full h-full object-contain" />
                            </div>
                          )}
                        </div>

                        {/* Marco de Fotos Deslizante de la Ficha Técnica */}
                        <div className="space-y-3 p-4 rounded-2xl bg-white dark:bg-[#0c131c] border border-slate-200 dark:border-white/10">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                                Fotos del Marco Deslizante (Ficha Técnica)
                              </label>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Estas fotos se mostrarán en la ficha técnica deslizándose automáticamente cada 3.5 segundos.
                              </p>
                            </div>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-[#00DD9E]">
                              {(sponsorFormData.photos || []).length} fotos añadidas
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleSponsorPhotosUpload}
                              className="text-xs file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-500/20 file:text-emerald-700 dark:file:text-[#00DD9E] cursor-pointer"
                            />
                            <div className="flex-1 min-w-[240px] flex items-center space-x-2">
                              <input
                                type="text"
                                id="new-sponsor-photo-url-input"
                                placeholder="O pega una URL de foto..."
                                className="flex-1 text-xs px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const val = e.target.value.trim();
                                    if (val) {
                                      setSponsorFormData(prev => ({
                                        ...prev,
                                        photos: [...(prev.photos || []), val]
                                      }));
                                      e.target.value = '';
                                    }
                                  }
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const input = document.getElementById('new-sponsor-photo-url-input');
                                  if (input && input.value.trim()) {
                                    setSponsorFormData(prev => ({
                                      ...prev,
                                      photos: [...(prev.photos || []), input.value.trim()]
                                    }));
                                    input.value = '';
                                  }
                                }}
                                className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-xs font-bold text-slate-800 dark:text-white cursor-pointer"
                              >
                                Añadir Foto
                              </button>
                            </div>
                          </div>

                          {/* Miniaturas de Fotos con Botón de Eliminar */}
                          {(sponsorFormData.photos || []).length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 pt-2">
                              {sponsorFormData.photos.map((photo, pIdx) => (
                                <div key={pIdx} className="relative group/thumb rounded-xl overflow-hidden border border-slate-200 dark:border-white/15 aspect-[16/10] bg-black">
                                  <img src={photo} alt={`Foto ${pIdx + 1}`} className="w-full h-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSponsorPhoto(pIdx)}
                                    className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white opacity-80 hover:opacity-100 transition cursor-pointer shadow-md"
                                    title="Eliminar esta foto"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                  <span className="absolute bottom-1 left-1 px-1.5 py-0.2 rounded bg-black/60 text-[11px] font-mono text-white">
                                    #{pIdx + 1}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* REQUERIMIENTO CLAVE: CASILLAS DE VISIBILIDAD DUAL (INICIO vs DIRECTORIO) */}
                        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-2">
                          <p className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-[#00DD9E]">
                            Opciones de Visualización en Neblina 105.5 FM
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <label className="flex items-center space-x-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={sponsorFormData.featuredInHome}
                                onChange={(e) => setSponsorFormData({...sponsorFormData, featuredInHome: e.target.checked})}
                                className="rounded text-emerald-500 focus:ring-emerald-400 w-4 h-4"
                              />
                              <span>Mostrar en Inicio (Carrusel Continuo Automático)</span>
                            </label>

                            <label className="flex items-center space-x-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={sponsorFormData.active}
                                onChange={(e) => setSponsorFormData({...sponsorFormData, active: e.target.checked})}
                                className="rounded text-emerald-500 focus:ring-emerald-400 w-4 h-4"
                              />
                              <span>Mostrar en Pestaña "Aliados Comerciales" (Directorio)</span>
                            </label>
                          </div>
                        </div>

                        <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-white/10">
                          <button
                            type="button"
                            onClick={() => setIsSponsorFormOpen(false)}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition"
                          >
                            Guardar Aliado Comercial
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* LISTADO DE ALIADOS CON CONTROLES DUALES */}
                  <div className="grid grid-cols-1 gap-3">
                    {filteredSponsors.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-dashed border-slate-300 dark:border-white/10">
                        <Building2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="text-xs">No se encontraron aliados comerciales con los filtros aplicados.</p>
                      </div>
                    ) : (
                      filteredSponsors.map((item) => (
                        <div 
                          key={item.id}
                          className="p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm hover:border-emerald-500/40 transition"
                        >
                          <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                            {item.logo ? (
                              <img 
                                src={item.logo} 
                                alt={item.name} 
                                className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-slate-200 dark:border-white/10 bg-white"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-xl bg-slate-200 dark:bg-white/10 flex items-center justify-center flex-shrink-0 text-slate-400">
                                <Building2 className="w-6 h-6" />
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                <span className="text-[11px] font-black uppercase px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-[#00DD9E]">
                                  {item.category}
                                </span>
                                {item.rif && <span className="text-[11px] text-slate-400 font-mono">· {item.rif}</span>}
                              </div>

                              <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                                {item.name}
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                                {item.slogan || item.description || item.location}
                              </p>
                            </div>
                          </div>

                          {/* INTERRUPTORES DUALES CLAVE: INICIO & DIRECTORIO */}
                          <div className="flex flex-wrap items-center gap-2 self-end md:self-auto">
                            {sponsorsTrashView ? (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleRestoreSponsor(item.id)}
                                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-[#00DD9E] text-emerald-600 dark:text-[#00DD9E] hover:text-[#001E4D] font-bold text-xs transition cursor-pointer border border-emerald-500/30"
                                  title="Restaurar aliado comercial"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Restaurar</span>
                                </button>
                                <button
                                  onClick={() => handlePermanentDeleteSponsor(item.id, item.name)}
                                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white font-bold text-xs transition cursor-pointer border border-rose-500/30"
                                  title="Eliminar de forma permanente"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Eliminar</span>
                                </button>
                              </div>
                            ) : (
                              <>
                                {/* Toggle 1: Mostrar en Inicio (Carrusel) */}
                                <button
                                  onClick={() => handleToggleSponsorHome(item.id)}
                                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition flex items-center space-x-1.5 cursor-pointer ${
                                    item.featuredInHome !== false
                                      ? 'bg-[#FEDC01]/20 text-amber-700 dark:text-[#FEDC01] border-amber-500/30'
                                      : 'bg-slate-100 dark:bg-white/5 text-slate-400 border-transparent hover:border-slate-300'
                                  }`}
                                  title="Mostrar en el carrusel continuo de la página de Inicio"
                                >
                                  <Emoji3D name="house" className="w-3.5 h-3.5" alt="Inicio" />
                                  <span>En Inicio: {item.featuredInHome !== false ? 'Sí' : 'No'}</span>
                                </button>

                                {/* Toggle 2: Mostrar en Directorio */}
                                <button
                                  onClick={() => handleToggleSponsorDirectory(item.id)}
                                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition flex items-center space-x-1.5 cursor-pointer ${
                                    item.active !== false
                                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                      : 'bg-slate-200 dark:bg-white/10 text-slate-500 border-slate-300 dark:border-white/10'
                                  }`}
                                  title="Mostrar en la pestaña de Directorio de Aliados"
                                >
                                  <Emoji3D name="building" className="w-3.5 h-3.5" alt="Directorio" />
                                  <span>Directorio: {item.active !== false ? 'Sí' : 'No'}</span>
                                </button>

                                {/* Editar */}
                                <button
                                  onClick={() => handleOpenEditSponsor(item)}
                                  className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-blue-500 hover:text-white text-slate-600 dark:text-slate-300 transition cursor-pointer"
                                  title="Editar datos del aliado"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>

                                {/* Eliminar temporal (Mover a papelera) */}
                                <button
                                  onClick={() => handleDeleteSponsor(item.id, item.name)}
                                  className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-rose-500 hover:text-white text-slate-600 dark:text-slate-300 transition cursor-pointer"
                                  title="Mover a la papelera"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* TAB 3: BUZÓN DE DENUNCIAS & DIRECTORIO PARALELO DE CIUDADANOS */}
              {/* ============================================================== */}
              {activeTab === 'reports' && (
                <div className="space-y-5 animate-fadeIn">
                  
                  {/* SUB-NAVEGACIÓN ESTILO SEGMENTED CONTROL: DENUNCIAS VS DIRECTORIO PARALELO */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 rounded-2xl bg-slate-100 dark:bg-[#0c131c] border border-slate-200 dark:border-white/10">
                    <div className="inline-flex p-1 rounded-xl bg-white/70 dark:bg-black/40 border border-slate-200/80 dark:border-white/5 w-full sm:w-auto">
                      <button
                        onClick={() => setReportsSubTab('reports')}
                        className={`flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                          reportsSubTab === 'reports'
                            ? 'bg-rose-500 text-white shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <Megaphone className="w-3.5 h-3.5" />
                        <span>Denuncias Recibidas ({reportsList.length})</span>
                      </button>

                      <button
                        onClick={() => setReportsSubTab('citizens')}
                        className={`flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                          reportsSubTab === 'citizens'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Directorio Ciudadano ({citizensList.length})</span>
                      </button>
                    </div>

                    {/* BOTONES DE EXPORTACIÓN SEGÚN LA SUB-PESTAÑA */}
                    <div className="flex items-center space-x-2 self-end sm:self-auto">
                      {reportsSubTab === 'reports' ? (
                        <>
                          <button
                            onClick={handleExportReportsCSV}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/20 text-slate-800 dark:text-white text-xs font-bold transition border border-slate-300 dark:border-white/10 cursor-pointer"
                            title="Exportar denuncias para Excel en formato CSV"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Exportar Excel (CSV)</span>
                          </button>
                          <button
                            onClick={handleExportReportsJSON}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/20 text-slate-800 dark:text-white text-xs font-bold transition border border-slate-300 dark:border-white/10 cursor-pointer"
                            title="Exportar archivo JSON de denuncias"
                          >
                            <span>JSON</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={handleExportCitizensCSV}
                            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer"
                            title="Descargar directorio de ciudadanos y teléfonos para Excel"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Descargar Directorio (Excel)</span>
                          </button>
                          <button
                            onClick={handleExportCitizensJSON}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/20 text-slate-800 dark:text-white text-xs font-bold transition border border-slate-300 dark:border-white/10 cursor-pointer"
                            title="Exportar archivo JSON del directorio de ciudadanos"
                          >
                            <span>JSON</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* VISTA 1: LISTADO DE DENUNCIAS CIUDADANAS */}
                  {reportsSubTab === 'reports' && (
                    <div className="space-y-4">
                      {/* PAPELERA SECCIONAL DE DENUNCIAS */}
                      <SectionTrashToggle
                        isTrashView={reportsTrashView}
                        onToggleView={setReportsTrashView}
                        activeCount={reportsList.filter(r => !r.trashed).length}
                        trashCount={reportsList.filter(r => !!r.trashed).length}
                        onEmptyTrash={handleEmptyReportsTrash}
                        activeLabel="Denuncias Recibidas"
                        trashLabel="Papelera"
                      />

                      {/* BARRA DE HERRAMIENTAS DE DENUNCIAS */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 dark:bg-[#19222e] p-3.5 rounded-2xl border border-slate-200 dark:border-white/10">
                        <div className="flex-1 flex flex-wrap items-center gap-2">
                          <div className="relative flex-1 min-w-[200px]">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              value={reportSearch}
                              onChange={(e) => setReportSearch(e.target.value)}
                              placeholder="Buscar por ciudadano, sector, teléfono o suceso..."
                              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none"
                            />
                          </div>

                          <select
                            value={reportStatusFilter}
                            onChange={(e) => setReportStatusFilter(e.target.value)}
                            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                          >
                            <option value="Todas">Todos los Estados</option>
                            {REPORT_STATUSES.map(st => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        </div>

                        <span className="text-xs text-slate-500 dark:text-slate-400 font-bold self-center">
                          Total: {filteredReports.length} reportes
                        </span>
                      </div>

                      {/* LISTADO DE REPORTES RECIBIDOS */}
                      <div className="grid grid-cols-1 gap-4">
                        {filteredReports.length === 0 ? (
                          <div className="p-8 text-center text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-dashed border-slate-300 dark:border-white/10">
                            <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-40" />
                            <p className="text-xs">No hay denuncias con los filtros actuales.</p>
                          </div>
                        ) : (
                          filteredReports.map((rep) => {
                            const statusColors = {
                              'Pendiente': 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
                              'En Revisión': 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30',
                              'Atendido': 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
                              'Archivado': 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-white/10'
                            };

                            const cleanPhone = (rep.phone || '').replace(/\D/g, '');
                            const citizenWhatsAppUrl = cleanPhone ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent('Hola, nos comunicamos desde la cabina y sala de prensa de Neblina Stereo 105.5 FM con respecto a su reporte ciudadano.')}` : null;

                            return (
                              <div
                                key={rep.id}
                                className="p-5 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm space-y-3"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-white/5 pb-2.5">
                                  <div className="flex items-center space-x-2">
                                    <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg border ${statusColors[rep.status] || statusColors['Pendiente']}`}>
                                      {rep.status}
                                    </span>
                                    <span className="font-display font-bold text-sm text-slate-900 dark:text-white">
                                      {rep.citizenName || 'Ciudadano Anónimo'}
                                    </span>
                                    {rep.citizenId && (
                                      <span className="text-xs text-slate-400 font-mono">({rep.citizenId})</span>
                                    )}
                                  </div>

                                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{rep.eventDate} · {rep.eventTime}</span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-400">
                                  <div>
                                    <span className="font-bold text-slate-800 dark:text-slate-200">Teléfono: </span>
                                    {rep.phone ? (
                                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{rep.phone}</span>
                                    ) : (
                                      <span className="text-slate-400 italic">No especificado</span>
                                    )}
                                  </div>
                                  <div>
                                    <span className="font-bold text-slate-800 dark:text-slate-200">Residencia: </span>
                                    <span>{rep.residenceSector || 'No especificado'}</span>
                                  </div>
                                  <div>
                                    <span className="font-bold text-slate-800 dark:text-slate-200">Lugar del Hecho: </span>
                                    <span>{rep.eventLocation || 'No especificado'}</span>
                                  </div>
                                  {rep.referencePoint && (
                                    <div className="sm:col-span-2 md:col-span-3">
                                      <span className="font-bold text-slate-800 dark:text-slate-200">Punto de Referencia: </span>
                                      <span>{rep.referencePoint}</span>
                                    </div>
                                  )}
                                </div>

                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0c131c] border border-slate-200/60 dark:border-white/5 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                                  {rep.description}
                                </div>

                                {/* EVIDENCIA FOTOGRÁFICA O EN VIDEO ADJUNTA A LA DENUNCIA */}
                                {Array.isArray(rep.evidenceFiles) && rep.evidenceFiles.length > 0 && (
                                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0c131c] border border-slate-200/80 dark:border-white/10 space-y-2">
                                    <div className="flex items-center space-x-1.5 text-[11px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                                      <Images className="w-3.5 h-3.5" />
                                      <span>Evidencia Adjunta ({rep.evidenceFiles.length} {rep.evidenceFiles.length === 1 ? 'archivo' : 'archivos'})</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                                      {rep.evidenceFiles.map((ev, evIdx) => (
                                        <div
                                          key={ev.id || evIdx}
                                          className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/15 bg-black flex flex-col"
                                        >
                                          {ev.type === 'video' ? (
                                            <video
                                              src={ev.dataUrl}
                                              controls
                                              className="w-full h-36 object-cover bg-black"
                                            />
                                          ) : (
                                            <a href={ev.dataUrl} target="_blank" rel="noopener noreferrer" title="Abrir imagen completa">
                                              <img
                                                src={ev.dataUrl}
                                                alt={ev.name || `Evidencia ${evIdx + 1}`}
                                                className="w-full h-36 object-cover hover:opacity-90 transition"
                                              />
                                            </a>
                                          )}
                                          <div className="px-2.5 py-1.5 bg-slate-900 text-white text-[11px] flex items-center justify-between gap-2">
                                            <span className="truncate font-medium">{ev.name || `Archivo #${evIdx + 1}`}</span>
                                            <a
                                              href={ev.dataUrl}
                                              download={ev.name || `evidencia-denuncia-${rep.id}-${evIdx + 1}`}
                                              className="text-[#00DD9E] hover:underline font-bold shrink-0"
                                            >
                                              Descargar
                                            </a>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* ACCIONES DE ESTADO Y CONTACTO */}
                                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs text-slate-500 font-bold">Cambiar estado:</span>
                                    <select
                                      value={rep.status}
                                      onChange={(e) => handleUpdateReportStatus(rep.id, e.target.value)}
                                      className="text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-white/10 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white"
                                    >
                                      {REPORT_STATUSES.map(st => (
                                        <option key={st} value={st}>{st}</option>
                                      ))}
                                    </select>
                                  </div>

                                  <div className="flex items-center space-x-2">
                                    {citizenWhatsAppUrl && (
                                      <a
                                        href={citizenWhatsAppUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition"
                                      >
                                        <MessageCircle className="w-3.5 h-3.5" />
                                        <span>Contactar por WhatsApp</span>
                                      </a>
                                    )}

                                    {reportsTrashView ? (
                                      <div className="flex items-center space-x-2">
                                        <button
                                          onClick={() => handleRestoreReport(rep.id)}
                                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-[#00DD9E] text-emerald-600 dark:text-[#00DD9E] hover:text-[#001E4D] font-bold text-xs transition cursor-pointer border border-emerald-500/30"
                                          title="Restaurar reporte ciudadano"
                                        >
                                          <RotateCcw className="w-3.5 h-3.5" />
                                          <span>Restaurar</span>
                                        </button>
                                        <button
                                          onClick={() => handlePermanentDeleteReport(rep.id)}
                                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white font-bold text-xs transition cursor-pointer border border-rose-500/30"
                                          title="Eliminar de forma permanente"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                          <span>Eliminar</span>
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => handleDeleteReport(rep.id)}
                                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                                        title="Mover a la papelera"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}

                  {/* VISTA 2: BASE DE DATOS PARALELA DE CIUDADANOS, TELÉFONOS Y LUGARES DE RESIDENCIA */}
                  {reportsSubTab === 'citizens' && (
                    <div className="space-y-4">
                      
                      {/* NOTA DE PRIVACIDAD Y SEGURIDAD INTERNA */}
                      <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed flex items-start space-x-2.5">
                        <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600 dark:text-[#00DD9E]" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">
                            Base de Datos Privada de Ciudadanos y Contactos Comunitarios
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-300">
                            Registro paralelo exclusivo de la emisora para proyecciones, estadísticas de cobertura geográfica y enlace informativo directo con la comunidad. <strong>No accesible al público ni compartido con terceros.</strong>
                          </p>
                        </div>
                      </div>

                      {/* BUSCADOR DE CIUDADANOS */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 dark:bg-[#19222e] p-3 rounded-2xl border border-slate-200 dark:border-white/10">
                        <div className="relative flex-1 min-w-[220px]">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={citizenSearch}
                            onChange={(e) => setCitizenSearch(e.target.value)}
                            placeholder="Buscar ciudadano por nombre, teléfono, cédula o sector..."
                            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none"
                          />
                        </div>

                        <span className="text-xs text-slate-500 dark:text-slate-400 font-bold self-center">
                          Total Contactos: <strong>{filteredCitizens.length}</strong> ciudadanos
                        </span>
                      </div>

                      {/* TABLA DEL DIRECTORIO CIUDADANO */}
                      <div className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white dark:bg-[#19222e] shadow-sm">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-[#0c131c] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-white/10">
                              <tr>
                                <th className="py-3 px-4">Ciudadano</th>
                                <th className="py-3 px-4">Cédula</th>
                                <th className="py-3 px-4">Teléfono / WhatsApp</th>
                                <th className="py-3 px-4">Lugar donde vive (Sector)</th>
                                <th className="py-3 px-4 text-center">Reportes</th>
                                <th className="py-3 px-4">Última Actividad</th>
                                <th className="py-3 px-4 text-right">Acciones</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                              {filteredCitizens.length === 0 ? (
                                <tr>
                                  <td colSpan="7" className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                                    No se encontraron registros de ciudadanos con ese criterio de búsqueda.
                                  </td>
                                </tr>
                              ) : (
                                filteredCitizens.map((cit) => {
                                  const cleanPhone = (cit.phone || '').replace(/\D/g, '');
                                  const hasPhone = cleanPhone.length > 6;
                                  const waUrl = hasPhone ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent('Hola, nos comunicamos desde la cabina y sala de prensa de Neblina Stereo 105.5 FM.')}` : null;

                                  return (
                                    <tr key={cit.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition">
                                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                                        {cit.name}
                                      </td>
                                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                                        {cit.citizenId || 'N/A'}
                                      </td>
                                      <td className="py-3 px-4">
                                        {waUrl ? (
                                          <a
                                            href={waUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition font-mono font-bold text-xs"
                                            title="Abrir chat en WhatsApp"
                                          >
                                            <MessageCircle className="w-3.5 h-3.5" />
                                            <span>{cit.phone}</span>
                                          </a>
                                        ) : (
                                          <span className="text-slate-400 italic">{cit.phone || 'No registrado'}</span>
                                        )}
                                      </td>
                                      <td className="py-3 px-4 text-slate-800 dark:text-slate-200">
                                        <span className="inline-flex items-center space-x-1.5">
                                          <Emoji3D name="pin" className="w-3.5 h-3.5 inline-block" />
                                          <span>{cit.residenceSector}</span>
                                        </span>
                                      </td>
                                      <td className="py-3 px-4 text-center">
                                        <span className="inline-block px-2 py-0.5 rounded-lg text-[11px] font-black bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/25">
                                          {cit.reportCount || 1} {cit.reportCount === 1 ? 'denuncia' : 'denuncias'}
                                        </span>
                                      </td>
                                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                                        {new Date(cit.lastReportDate || Date.now()).toLocaleDateString('es-VE')}
                                      </td>
                                      <td className="py-3 px-4 text-right">
                                        <button
                                          onClick={() => handleDeleteCitizen(cit.id, cit.name)}
                                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                                          title="Eliminar de la base de datos de ciudadanos"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              )}

              {/* ============================================================== */}
              {/* TAB 4: PARRILLA RADIAL & PROGRAMACIÓN */}
              {/* ============================================================== */}
              
              {/* ============================================================== */}
              {/* TAB EXCLUSIVO: GESTIÓN DE PLAYLISTS DE YOUTUBE                  */}
              {/* ============================================================== */}
              {activeTab === 'youtube_playlist' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
                      <div>
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md bg-red-600 text-white text-[11px] font-black uppercase tracking-wider mb-1">
                          <span>YouTube Oficial · Sección Ranking & Música</span>
                        </span>
                        <h4 className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-white">
                          Playlist Semanal Recomendada & Cola de Cambio Automático
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Programa el link de la semana siguiente en cola para que se active automáticamente en el horario elegido. El sistema te recordará 3 días antes si la cola está vacía.
                        </p>
                      </div>
                      <div className="text-right text-[11px] font-bold text-slate-600 dark:text-slate-300">
                        Próximo cambio: <span className="text-[#008f7a] dark:text-[#00DD9E]">{ytPlaylistReminder.nextSwitchFormatted}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Playlist Activa Actual */}
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0c131c] border border-slate-200 dark:border-white/10 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-[#00DD9E]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Playlist Activa Esta Semana</span>
                          </span>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">Título Visible en Recomendaciones</label>
                          <input
                            type="text"
                            value={ytPlaylistCfg.currentTitle || ''}
                            onChange={(e) => setYtPlaylistCfg({ ...ytPlaylistCfg, currentTitle: e.target.value })}
                            placeholder="Ej: Selección Oficial de la Semana · Neblina 105.5 FM"
                            className="w-full text-xs px-3 py-2 rounded-lg bg-white dark:bg-[#141d28] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">URL de Playlist o Video de YouTube Activo</label>
                          <input
                            type="url"
                            value={ytPlaylistCfg.currentUrl || ''}
                            onChange={(e) => setYtPlaylistCfg({ ...ytPlaylistCfg, currentUrl: e.target.value })}
                            placeholder="https://www.youtube.com/watch?v=...&list=..."
                            className="w-full text-xs font-mono px-3 py-2 rounded-lg bg-white dark:bg-[#141d28] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>

                      {/* Playlist en Cola para la Próxima Semana */}
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0c131c] border border-slate-200 dark:border-white/10 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Playlist en Cola (Próxima Semana)</span>
                          </span>
                          {ytPlaylistCfg.queuedUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm('¿Deseas activar esta playlist ahora mismo sin esperar a la fecha programada?')) {
                                  const updated = promoteQueuedPlaylistNow();
                                  setYtPlaylistCfg(updated);
                                  setYtPlaylistReminder(getPlaylistAdminReminderStatus());
                                  triggerToast('¡Playlist en cola promovida como activa inmediatamente!');
                                }
                              }}
                              className="text-[11px] font-bold text-emerald-600 dark:text-[#00DD9E] hover:underline cursor-pointer"
                            >
                              Activar Ahora
                            </button>
                          )}
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">Título de la Próxima Playlist (Opcional)</label>
                          <input
                            type="text"
                            value={ytPlaylistCfg.queuedTitle || ''}
                            onChange={(e) => setYtPlaylistCfg({ ...ytPlaylistCfg, queuedTitle: e.target.value })}
                            placeholder="Ej: Especial Éxitos de Fin de Mes · Neblina 105.5 FM"
                            className="w-full text-xs px-3 py-2 rounded-lg bg-white dark:bg-[#141d28] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">URL de YouTube en Cola (Se activará automáticamente)</label>
                          <input
                            type="url"
                            value={ytPlaylistCfg.queuedUrl || ''}
                            onChange={(e) => setYtPlaylistCfg({ ...ytPlaylistCfg, queuedUrl: e.target.value })}
                            placeholder="Deja aquí el link de la siguiente semana..."
                            className="w-full text-xs font-mono px-3 py-2 rounded-lg bg-white dark:bg-[#141d28] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Selector de Horario de Transición y Botón Guardar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
                      <div className="flex items-center space-x-2">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Horario de Cambio Automático:</label>
                        <select
                          value={ytPlaylistCfg.scheduledSlot || 'lunes_12'}
                          onChange={(e) => setYtPlaylistCfg({ ...ytPlaylistCfg, scheduledSlot: e.target.value })}
                          className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#141d28] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-semibold cursor-pointer"
                        >
                          <option value="lunes_06">Lunes 6:00 AM (Apertura de Semana)</option>
                          <option value="lunes_12">Lunes 12:00 PM (Mediodía - Recomendado)</option>
                          <option value="viernes_18">Viernes 6:00 PM (Fin de Semana)</option>
                          <option value="domingo_23">Domingo 11:59 PM (Medianoche)</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const saved = saveRankingYoutubePlaylist(ytPlaylistCfg);
                          setYtPlaylistCfg(saved);
                          setYtPlaylistReminder(getPlaylistAdminReminderStatus());
                          triggerToast('¡Configuración y cola de Playlist de YouTube guardada!');
                        }}
                        className="px-5 py-2 rounded-xl bg-[#00DD9E] text-[#001E4D] font-black text-xs hover:brightness-105 active:scale-95 transition shadow-sm cursor-pointer"
                      >
                        Guardar Playlist & Cola Semanal
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'schedule' && (
                <div className="space-y-6 animate-fadeIn">

                  {/* PAPELERA SECCIONAL DE PARRILLA RADIAL */}
                  <SectionTrashToggle
                    isTrashView={scheduleTrashView}
                    onToggleView={setScheduleTrashView}
                    activeCount={scheduleList.filter(s => !s.trashed).length}
                    trashCount={scheduleList.filter(s => !!s.trashed).length}
                    onEmptyTrash={handleEmptyScheduleTrash}
                    activeLabel="Programas Activos"
                    trashLabel="Papelera"
                  />

                  {/* BARRA SUPERIOR DE PARRILLA */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 dark:bg-[#19222e] p-4 rounded-2xl border border-slate-200 dark:border-white/10">
                    <div>
                      <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                        <Radio className="w-4 h-4 text-[#00DD9E]" />
                        <span>Parrilla y Programación Radial 105.5 FM</span>
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Configura los programas, locutores, horarios y carátulas personalizadas. Al estar al aire, su carátula se proyecta automáticamente en el reproductor.
                      </p>
                    </div>

                    <div className="flex items-center flex-wrap gap-2">
                      <button
                        onClick={handleResetSchedule}
                        className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
                        title="Restablecer parrilla original de fábrica"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Restablecer</span>
                      </button>

                      <button
                        onClick={handleExportSchedule}
                        className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
                        title="Exportar copia de seguridad en JSON"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Exportar</span>
                      </button>

                      <button
                        onClick={handleOpenCreateShow}
                        className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-[#00DD9E] hover:bg-[#00DD9E]/90 text-[#001E4D] font-black text-xs transition cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Nuevo Programa</span>
                      </button>
                    </div>
                  </div>

                  {/* BARRA DE FILTRO Y BÚSQUEDA */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-md">
                      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Buscar programa por título, locutor o descripción..."
                        value={scheduleSearch}
                        onChange={(e) => setScheduleSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#00DD9E]"
                      />
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center space-x-2">
                      <span>Total programas: <strong>{scheduleList.length}</strong></span>
                      <span>•</span>
                      <span>Activos: <strong className="text-emerald-500">{scheduleList.filter(s => s.active !== false).length}</strong></span>
                    </div>
                  </div>

                  {/* FORMULARIO DE PROGRAMA */}
                  {isScheduleFormOpen && (
                    <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-[#141d28] border-2 border-[#00DD9E]/40 shadow-lg space-y-5 animate-fadeIn">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
                        <div className="flex items-center space-x-2.5">
                          <Emoji3D name="radio" className="w-9 h-9 drop-shadow-sm flex-shrink-0" alt="Programa" />
                          <div>
                            <h4 className="font-display font-black text-base text-slate-900 dark:text-white">
                              {editingShow ? `Editar: ${editingShow.title}` : 'Crear Nuevo Programa Radial'}
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              Asigna locución, franja horaria y carátula para la transmisión en vivo.
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setIsScheduleFormOpen(false)} 
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <form onSubmit={handleSaveShow} className="space-y-4">
                        {/* FILA 1: DATOS PRINCIPALES */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Nombre del Programa *
                            </label>
                            <input
                              type="text"
                              value={scheduleFormData.title}
                              onChange={(e) => setScheduleFormData({...scheduleFormData, title: e.target.value})}
                              placeholder="Ej: El Monstruo de la Mañana"
                              required
                              className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white focus:outline-none focus:border-[#00DD9E]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Locutor / Conductor
                            </label>
                            <input
                              type="text"
                              value={scheduleFormData.host}
                              onChange={(e) => setScheduleFormData({...scheduleFormData, host: e.target.value})}
                              placeholder="Ej: Jhonas Toro"
                              className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white focus:outline-none focus:border-[#00DD9E]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Color Distintivo
                            </label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="color"
                                value={scheduleFormData.color || '#00DD9E'}
                                onChange={(e) => setScheduleFormData({...scheduleFormData, color: e.target.value})}
                                className="w-10 h-9 p-0.5 rounded-xl bg-transparent border border-slate-300 dark:border-white/15 cursor-pointer"
                              />
                              <input
                                type="text"
                                value={scheduleFormData.color || '#00DD9E'}
                                onChange={(e) => setScheduleFormData({...scheduleFormData, color: e.target.value})}
                                className="w-full text-xs font-mono px-2.5 py-2 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                              />
                            </div>
                          </div>
                        </div>

                        {/* FILA 2: HORARIO (INICIO - FIN) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1.5">
                              <Clock className="w-3.5 h-3.5 text-[#00DD9E]" />
                              <span>Hora de Inicio (24h) *</span>
                            </label>
                            <input
                              type="text"
                              value={scheduleFormData.startTime}
                              onChange={(e) => setScheduleFormData({...scheduleFormData, startTime: e.target.value})}
                              placeholder="08:00"
                              required
                              className="w-full text-xs px-3.5 py-2 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-mono text-center font-bold"
                            />
                            <span className="text-[11px] text-slate-400 mt-0.5 block">Formato HH:mm (Ej: 08:00, 14:30)</span>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1.5">
                              <Clock className="w-3.5 h-3.5 text-[#00DD9E]" />
                              <span>Hora de Culminación (24h) *</span>
                            </label>
                            <input
                              type="text"
                              value={scheduleFormData.endTime}
                              onChange={(e) => setScheduleFormData({...scheduleFormData, endTime: e.target.value})}
                              placeholder="10:00"
                              required
                              className="w-full text-xs px-3.5 py-2 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-mono text-center font-bold"
                            />
                            <span className="text-[11px] text-slate-400 mt-0.5 block">Formato HH:mm (Ej: 10:00, 16:00)</span>
                          </div>
                        </div>

                        {/* FILA 3: DÍAS DE TRANSMISIÓN */}
                        <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              Días de Transmisión Semanal:
                            </label>
                            <div className="flex items-center space-x-1.5">
                              <button
                                type="button"
                                onClick={() => handleSetDaysPreset('weekdays')}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-700 dark:text-slate-300 transition"
                              >
                                Lun a Vie
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSetDaysPreset('weekends')}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-700 dark:text-slate-300 transition"
                              >
                                Fin de Semana
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSetDaysPreset('all')}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-700 dark:text-slate-300 transition"
                              >
                                Toda la Semana (7d)
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-7 gap-1.5 pt-1">
                            {[
                              { id: 1, label: 'Lun', full: 'Lunes' },
                              { id: 2, label: 'Mar', full: 'Martes' },
                              { id: 3, label: 'Mié', full: 'Miércoles' },
                              { id: 4, label: 'Jue', full: 'Jueves' },
                              { id: 5, label: 'Vie', full: 'Viernes' },
                              { id: 6, label: 'Sáb', full: 'Sábado' },
                              { id: 7, label: 'Dom', full: 'Domingo' }
                            ].map((day) => {
                              const isSelected = Array.isArray(scheduleFormData.days) && scheduleFormData.days.includes(day.id);
                              return (
                                <button
                                  type="button"
                                  key={day.id}
                                  onClick={() => handleToggleDay(day.id)}
                                  className={`py-2 px-1 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center cursor-pointer ${
                                    isSelected 
                                      ? 'bg-[#00DD9E] text-[#001E4D] shadow-sm font-black' 
                                      : 'bg-white dark:bg-[#0c131c] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:border-[#00DD9E]/50'
                                  }`}
                                  title={day.full}
                                >
                                  <span>{day.label}</span>
                                  {isSelected && <span className="w-1 h-1 rounded-full bg-[#001E4D] mt-0.5" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* FILA 4: GESTIÓN DE CARÁTULA DEL PROGRAMA (PARA EL REPRODUCTOR) */}
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-100 to-emerald-500/5 dark:from-[#001E4D]/30 dark:to-[#00DD9E]/10 border-2 border-dashed border-[#00DD9E]/30 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-display font-bold text-xs text-slate-900 dark:text-white flex items-center space-x-1.5">
                                <ImageIcon className="w-4 h-4 text-[#00DD9E]" />
                                <span>Carátula del Programa (Visible en el Reproductor)</span>
                              </h5>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Esta carátula se mostrará automáticamente en el reproductor de radio cuando el programa esté al aire.
                              </p>
                            </div>

                            {scheduleFormData.image && (
                              <button
                                type="button"
                                onClick={() => setScheduleFormData({...scheduleFormData, image: ''})}
                                className="text-[11px] font-bold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 px-2 py-1 rounded-lg bg-rose-500/10 transition cursor-pointer"
                              >
                                Quitar carátula
                              </button>
                            )}
                          </div>

                          <div className="flex flex-col sm:flex-row items-center gap-4">
                            {/* PREVIEW DE CARÁTULA */}
                            <div className="w-28 h-28 rounded-2xl bg-white dark:bg-[#0c131c] border-2 border-[#00DD9E]/40 overflow-hidden shrink-0 flex items-center justify-center shadow-md relative group">
                              {scheduleFormData.image ? (
                                <img
                                  src={scheduleFormData.image}
                                  alt="Carátula"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="text-center p-2 text-slate-400">
                                  <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-40 text-[#00DD9E]" />
                                  <span className="text-[11px] block font-semibold">Sin Carátula</span>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[11px] font-bold">
                                Vista Previa
                              </div>
                            </div>

                            {/* OPCIONES DE CARGA */}
                            <div className="flex-1 w-full space-y-2">
                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                                  Subir desde tu equipo (JPG, PNG, WebP)
                                </label>
                                <label className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 hover:border-[#00DD9E] text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer transition shadow-sm">
                                  <Upload className="w-4 h-4 text-[#00DD9E]" />
                                  <span>Seleccionar archivo local</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleScheduleImageUpload}
                                    className="hidden"
                                  />
                                </label>
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                                  O pegar URL directa de la carátula
                                </label>
                                <input
                                  type="url"
                                  value={scheduleFormData.image || ''}
                                  onChange={(e) => setScheduleFormData({...scheduleFormData, image: e.target.value})}
                                  placeholder="https://ejemplo.com/caratula-programa.jpg"
                                  className="w-full text-xs px-3.5 py-2 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white focus:outline-none focus:border-[#00DD9E]"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* FILA 5: DESCRIPCIÓN Y ESTADO ACTIVO */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Descripción breve del programa
                          </label>
                          <input
                            type="text"
                            value={scheduleFormData.description}
                            onChange={(e) => setScheduleFormData({...scheduleFormData, description: e.target.value})}
                            placeholder="Música variada, noticias y notas del páramo..."
                            className="w-full text-xs px-3.5 py-2 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white focus:outline-none focus:border-[#00DD9E]"
                          />
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <label className="inline-flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={scheduleFormData.active !== false}
                              onChange={(e) => setScheduleFormData({...scheduleFormData, active: e.target.checked})}
                              className="w-4 h-4 rounded text-[#00DD9E] focus:ring-[#00DD9E]"
                            />
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              Programa activo en la parrilla oficial
                            </span>
                          </label>

                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => setIsScheduleFormOpen(false)}
                              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-white transition"
                            >
                              Cancelar
                            </button>
                            <button
                              type="submit"
                              className="px-6 py-2.5 rounded-xl bg-[#00DD9E] hover:bg-[#00DD9E]/90 text-[#001E4D] font-black text-xs transition cursor-pointer"
                            >
                              {editingShow ? 'Actualizar Programa' : 'Guardar Programa'}
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* LISTADO DE PROGRAMAS (CARDS) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {scheduleList
                      .filter(show => {
                        const isTrash = !!show.trashed;
                        if (scheduleTrashView ? !isTrash : isTrash) return false;
                        if (!scheduleSearch.trim()) return true;
                        const q = scheduleSearch.toLowerCase();
                        return (show.title || '').toLowerCase().includes(q) ||
                               (show.host || '').toLowerCase().includes(q) ||
                               (show.description || '').toLowerCase().includes(q);
                      })
                      .map((show) => {
                        const isLiveNow = isShowOnAirNow(show);
                        const daysMap = { 1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue', 5: 'Vie', 6: 'Sáb', 7: 'Dom' };
                        const daysArray = Array.isArray(show.days) ? show.days : [1, 2, 3, 4, 5];

                        return (
                          <div 
                            key={show.id}
                            className={`p-4 rounded-2xl bg-white dark:bg-[#19222e] border transition shadow-sm flex flex-col sm:flex-row items-start gap-4 ${
                              isLiveNow 
                                ? 'border-[#00DD9E] shadow-lg shadow-[#00DD9E]/10 ring-1 ring-[#00DD9E]/40' 
                                : 'border-slate-200 dark:border-white/10'
                            }`}
                          >
                            {/* CARÁTULA THUMBNAIL */}
                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 bg-slate-100 dark:bg-[#001E4D]/40 border border-slate-200 dark:border-white/10 relative flex items-center justify-center">
                              {show.image || show.artwork ? (
                                <img
                                  src={show.image || show.artwork}
                                  alt={show.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="text-center p-2 text-slate-400">
                                  <Radio className="w-8 h-8 mx-auto opacity-30 text-[#00DD9E]" />
                                  <span className="text-[11px] block font-semibold mt-1">Sin carátula</span>
                                </div>
                              )}

                              {isLiveNow && (
                                <span className="absolute bottom-1 left-1 right-1 px-1.5 py-0.5 rounded-lg bg-[#00DD9E] text-[#001E4D] text-[11px] font-black uppercase text-center flex items-center justify-center space-x-1 shadow">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#001E4D] animate-ping" />
                                  <span>En Reproductor</span>
                                </span>
                              )}
                            </div>

                            {/* CONTENIDO DEL PROGRAMA */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                                <span className="text-[11px] font-mono font-black px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white flex items-center space-x-1">
                                  <Clock className="w-3 h-3 text-[#00DD9E]" />
                                  <span>{show.startTime} - {show.endTime}</span>
                                </span>

                                {isLiveNow && (
                                  <span className="text-[11px] font-black px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-[#00DD9E] border border-[#00DD9E]/40 flex items-center space-x-1 animate-pulse">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#00DD9E]" />
                                    <span>¡AL AIRE AHORA!</span>
                                  </span>
                                )}

                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${
                                  show.active !== false 
                                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' 
                                    : 'bg-slate-200 dark:bg-white/10 text-slate-400'
                                }`}>
                                  {show.active !== false ? 'Activo' : 'Pausado'}
                                </span>
                              </div>

                              <h5 className="font-display font-bold text-sm text-slate-900 dark:text-white truncate">
                                {show.title}
                              </h5>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Locución: <strong className="text-slate-700 dark:text-slate-300">{show.host || 'Neblina Stereo'}</strong>
                              </p>

                              {/* PILLS DE DÍAS */}
                              <div className="flex items-center flex-wrap gap-1 mt-2">
                                {daysArray.map(d => (
                                  <span key={d} className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/5">
                                    {daysMap[d] || d}
                                  </span>
                                ))}
                              </div>

                              {show.description && (
                                <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2">
                                  {show.description}
                                </p>
                              )}
                            </div>

                            {/* ACCIONES */}
                            <div className="flex sm:flex-col items-center space-x-1 sm:space-x-0 sm:space-y-1.5 self-end sm:self-start">
                              {scheduleTrashView ? (
                                <>
                                  <button
                                    onClick={() => handleRestoreShow(show.id)}
                                    className="p-2 rounded-xl bg-emerald-500/15 hover:bg-[#00DD9E] text-emerald-600 dark:text-[#00DD9E] hover:text-[#001E4D] transition cursor-pointer"
                                    title="Restaurar programa"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handlePermanentDeleteShow(show.id, show.title)}
                                    className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white transition cursor-pointer"
                                    title="Eliminar de forma permanente"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleToggleShowActive(show.id)}
                                    className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                                    title={show.active !== false ? 'Pausar programa' : 'Activar programa'}
                                  >
                                    <Radio className={`w-3.5 h-3.5 ${show.active !== false ? 'text-[#00DD9E]' : 'text-slate-400'}`} />
                                  </button>
                                  <button
                                    onClick={() => handleOpenEditShow(show)}
                                    className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-blue-500 hover:text-white text-slate-600 dark:text-slate-300 transition cursor-pointer"
                                    title="Editar programa y carátula"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteShow(show.id, show.title)}
                                    className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-rose-500 hover:text-white text-slate-600 dark:text-slate-300 transition cursor-pointer"
                                    title="Mover a la papelera"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* TAB TALENTOS: GESTIÓN DE LOCUTORES & STAFF */}
              {/* ============================================================== */}
              {activeTab === 'talents' && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* PAPELERA SECCIONAL DE TALENTOS */}
                  {/* CONTENEDOR UNIFICADO: GESTIÓN DE TALENTOS, PESTAÑAS (ACTIVOS / ARCHIVADOS / PAPELERA), BUSCADOR Y BOTÓN NUEVO */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-3">
                      <div>
                        <h4 className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-white flex items-center space-x-2">
                          <Mic className="w-4 h-4 text-emerald-500" />
                          <span>Gestión de Locutores y Staff ("Nuestros Talentos")</span>
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Agrega, archiva o modifica los locutores oficiales de la emisora, fotos, biografías y horarios.
                        </p>
                      </div>

                      <button
                        onClick={handleOpenCreateTalent}
                        className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition cursor-pointer self-start md:self-auto shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Agregar Locutor / Talento</span>
                      </button>
                    </div>

                    {/* Barra de Filtros por Estado (Activos, Archivados, Papelera) y Buscador Integrado */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-black/30 p-1 rounded-xl border border-slate-200 dark:border-white/10 overflow-x-auto scrollbar-none">
                        <button
                          type="button"
                          onClick={() => { setTalentsTabFilter('active'); setTalentsTrashView(false); }}
                          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                            talentsTabFilter === 'active'
                              ? 'bg-emerald-500 text-slate-950 shadow-sm font-black'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Locutores Activos</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/15">
                            {talentsList.filter(t => !t.trashed && !t.archived).length}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => { setTalentsTabFilter('archived'); setTalentsTrashView(false); }}
                          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                            talentsTabFilter === 'archived'
                              ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <Archive className="w-3.5 h-3.5" />
                          <span>Locutores Archivados</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/15">
                            {talentsList.filter(t => !t.trashed && !!t.archived).length}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => { setTalentsTabFilter('trash'); setTalentsTrashView(true); }}
                          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                            talentsTabFilter === 'trash'
                              ? 'bg-rose-500 text-white shadow-sm font-black'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Papelera</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/15">
                            {talentsList.filter(t => !!t.trashed).length}
                          </span>
                        </button>
                      </div>

                      {/* Buscador Integrado */}
                      <div className="relative flex-1 max-w-sm">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={talentSearch}
                          onChange={(e) => setTalentSearch(e.target.value)}
                          placeholder="Buscar locutor por nombre, programa..."
                          className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#00DD9E]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* FORMULARIO MODAL / EN LÍNEA DE TALENTO */}
                  {isTalentFormOpen && (
                    <div className="p-5 rounded-2xl bg-slate-100 dark:bg-[#1c2633] border-2 border-emerald-500/30 shadow-xl space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
                        <h4 className="font-display font-black text-base text-slate-900 dark:text-white flex items-center space-x-2">
                          <Mic className="w-4 h-4 text-emerald-500" />
                          <span>{editingTalent ? `Editar Locutor: ${editingTalent.name}` : 'Registrar Nuevo Locutor o Talento'}</span>
                        </h4>
                        <button onClick={() => setIsTalentFormOpen(false)} className="p-1 text-slate-400 hover:text-white">
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <form onSubmit={handleSaveTalent} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          
                          {/* Nombre Completo */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Nombre Completo del Locutor *
                            </label>
                            <input
                              type="text"
                              value={talentFormData.name}
                              onChange={(e) => setTalentFormData({...talentFormData, name: e.target.value})}
                              placeholder="Ej: Carlos 'El Oso' Rondón"
                              required
                              className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/40"
                            />
                          </div>

                          {/* Rol / Cargo */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Cargo o Rol en la Radio
                            </label>
                            <input
                              type="text"
                              value={talentFormData.role}
                              onChange={(e) => setTalentFormData({...talentFormData, role: e.target.value})}
                              placeholder="Ej: Locutor Principal / DJ Residente"
                              className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                            />
                          </div>

                          {/* Foto URL y Carga de Archivo PNG Transparente */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                Foto del Locutor (URL o PNG Transparente)
                              </label>
                              <label className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-[#00DD9E] cursor-pointer hover:underline">
                                <Upload className="w-3 h-3" />
                                <span>Subir desde dispositivo</span>
                                <input
                                  type="file"
                                  accept="image/png,image/jpeg,image/webp,image/svg+xml,.svg"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (ev) => {
                                        const res = ev.target?.result;
                                        setTalentFormData({
                                          ...talentFormData,
                                          photo: res,
                                          isTransparentPng: file.type === 'image/png' || file.type === 'image/svg+xml' || /\.(png|svg)$/i.test(file.name)
                                        });
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </label>
                            </div>
                            <input
                              type="text"
                              value={talentFormData.photo}
                              onChange={(e) => {
                                const val = e.target.value;
                                const looksLikePng = /\.(png|svg)($|\?)/i.test(val) || val.includes('format=png') || val.startsWith('data:image/svg+xml');
                                setTalentFormData({
                                  ...talentFormData, 
                                  photo: val,
                                  isTransparentPng: looksLikePng ? true : talentFormData.isTransparentPng
                                });
                              }}
                              placeholder="https://... o carga un archivo PNG"
                              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-mono"
                            />

                            {/* Casilla de verificación para Silueta Transparente PNG */}
                            <label className="flex items-center space-x-2 text-[11px] text-slate-600 dark:text-slate-300 cursor-pointer pt-0.5 select-none">
                              <input
                                type="checkbox"
                                checked={Boolean(talentFormData.isTransparentPng)}
                                onChange={(e) => setTalentFormData({...talentFormData, isTransparentPng: e.target.checked})}
                                className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-[#00DD9E]"
                              />
                              <span className="font-medium">
                                Silueta transparente recortada (formato PNG sin fondo para fundir con el aeroglass)
                              </span>
                            </label>

                            {/* Previsualización en Vivo de la Foto / PNG */}
                            {talentFormData.photo && (
                              <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                                <div className="w-16 h-20 rounded-xl bg-gradient-to-tr from-[#001E4D]/40 to-[#00DD9E]/20 flex items-end justify-center overflow-hidden p-1">
                                  <img 
                                    src={talentFormData.photo} 
                                    alt="Preview" 
                                    className={`max-h-full max-w-full ${talentFormData.isTransparentPng ? 'object-contain object-bottom drop-shadow-md' : 'object-cover rounded-lg'}`}
                                  />
                                </div>
                                <div className="text-[11px] min-w-0">
                                  <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                    {talentFormData.isTransparentPng ? (
                                      <>
                                        <Sparkles className="w-3.5 h-3.5 text-[#00DD9E] shrink-0" />
                                        <span>Silueta PNG transparente activada</span>
                                      </>
                                    ) : (
                                      <>
                                        <ImageIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                        <span>Fotografía rectangular estándar</span>
                                      </>
                                    )}
                                  </p>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                    Se mostrará agrandada en la ficha técnica del locutor
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Nombre del Programa */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Programa Radial que Realiza *
                            </label>
                            <input
                              type="text"
                              value={talentFormData.showName}
                              onChange={(e) => setTalentFormData({...talentFormData, showName: e.target.value})}
                              placeholder="Ej: Amanecer Paramero & Noticias"
                              required
                              className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                            />
                          </div>

                          {/* Horario del Programa */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Horario del Programa *
                            </label>
                            <input
                              type="text"
                              value={talentFormData.showSchedule}
                              onChange={(e) => setTalentFormData({...talentFormData, showSchedule: e.target.value})}
                              placeholder="Ej: Lunes a Viernes • 6:00 AM - 9:00 AM"
                              required
                              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                            />
                          </div>

                          {/* Orden */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Orden de Aparición
                            </label>
                            <input
                              type="number"
                              value={talentFormData.order}
                              onChange={(e) => setTalentFormData({...talentFormData, order: Number(e.target.value)})}
                              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-mono"
                            />
                          </div>

                        </div>

                        {/* Biografía */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Pequeña Biografía / Reseña del Locutor
                          </label>
                          <textarea
                            rows={3}
                            value={talentFormData.bio}
                            onChange={(e) => setTalentFormData({...talentFormData, bio: e.target.value})}
                            placeholder="Breve trayectoria, estilo de animación o mensaje a los oyentes de Neblina Stereo..."
                            className="w-full text-xs p-3 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white leading-relaxed resize-none"
                          />
                        </div>

                        {/* Enlaces de Redes Sociales y Contacto */}
                        <div className="p-3.5 rounded-2xl bg-white/60 dark:bg-[#121922] border border-slate-200/80 dark:border-white/10 space-y-3">
                          <h5 className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-[#00DD9E]">
                            Redes Sociales y Enlaces de Contacto
                          </h5>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                                WhatsApp (Número o Link)
                              </label>
                              <input
                                type="text"
                                value={talentFormData.whatsapp}
                                onChange={(e) => setTalentFormData({...talentFormData, whatsapp: e.target.value})}
                                placeholder="+584247459774"
                                className="w-full text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                                Instagram (URL o usuario)
                              </label>
                              <input
                                type="text"
                                value={talentFormData.instagram}
                                onChange={(e) => setTalentFormData({...talentFormData, instagram: e.target.value})}
                                placeholder="https://instagram.com/..."
                                className="w-full text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                                Facebook (URL)
                              </label>
                              <input
                                type="text"
                                value={talentFormData.facebook}
                                onChange={(e) => setTalentFormData({...talentFormData, facebook: e.target.value})}
                                placeholder="https://facebook.com/..."
                                className="w-full text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                                Twitter / X (URL)
                              </label>
                              <input
                                type="text"
                                value={talentFormData.twitter}
                                onChange={(e) => setTalentFormData({...talentFormData, twitter: e.target.value})}
                                placeholder="https://x.com/..."
                                className="w-full text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                                TikTok (URL)
                              </label>
                              <input
                                type="text"
                                value={talentFormData.tiktok}
                                onChange={(e) => setTalentFormData({...talentFormData, tiktok: e.target.value})}
                                placeholder="https://tiktok.com/@..."
                                className="w-full text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Opciones y Switches */}
                        <div className="flex flex-wrap items-center gap-6 pt-2">
                          <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
                            <input
                              type="checkbox"
                              checked={talentFormData.status === 'active'}
                              onChange={(e) => setTalentFormData({...talentFormData, status: e.target.checked ? 'active' : 'inactive'})}
                              className="rounded text-emerald-500 focus:ring-emerald-500 w-4 h-4"
                            />
                            <span>Talento Activo (Visible en la Web)</span>
                          </label>

                          <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
                            <input
                              type="checkbox"
                              checked={talentFormData.featuredInHome}
                              onChange={(e) => setTalentFormData({...talentFormData, featuredInHome: e.target.checked})}
                              className="rounded text-amber-500 focus:ring-amber-500 w-4 h-4"
                            />
                            <span>Destacar Locutor</span>
                          </label>
                        </div>

                        {/* Botones de Acción */}
                        <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-white/10">
                          <button
                            type="button"
                            onClick={() => setIsTalentFormOpen(false)}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                          >
                            Cancelar
                          </button>

                          <button
                            type="submit"
                            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition cursor-pointer"
                          >
                            {editingTalent ? 'Guardar Cambios' : 'Registrar Locutor'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* LISTADO DE TALENTOS REGISTRADOS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {talentsList
                      .filter(t => {
                        const isTrash = !!t.trashed;
                        const isArchived = !!t.archived;
                        if (talentsTabFilter === 'trash') {
                          if (!isTrash) return false;
                        } else if (talentsTabFilter === 'archived') {
                          if (isTrash || !isArchived) return false;
                        } else {
                          // active
                          if (isTrash || isArchived) return false;
                        }
                        const term = talentSearch.toLowerCase().trim();
                        if (!term) return true;
                        return (
                          t.name.toLowerCase().includes(term) ||
                          (t.role && t.role.toLowerCase().includes(term)) ||
                          (t.showName && t.showName.toLowerCase().includes(term))
                        );
                      })
                      .map((talent) => (
                        <div
                          key={talent.id}
                          className="flex flex-col justify-between p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm hover:border-emerald-500/30 transition"
                        >
                          <div>
                            <div className="flex items-start space-x-3 mb-3">
                              <img
                                src={talent.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80'}
                                alt={talent.name}
                                className="w-14 h-14 rounded-xl object-cover object-top border border-slate-200 dark:border-white/10 flex-shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <h5 className="font-display font-black text-sm text-slate-900 dark:text-white truncate">
                                  {talent.name}
                                </h5>
                                <p className="text-[11px] font-bold text-emerald-600 dark:text-[#00DD9E] uppercase tracking-wide truncate">
                                  {talent.role}
                                </p>
                                <span className={`inline-block mt-1 text-[11px] font-black uppercase px-2 py-0.5 rounded-lg ${
                                  talent.status === 'active' 
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                                    : 'bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-400'
                                }`}>
                                  {talent.status === 'active' ? 'Activo' : 'Inactivo'}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#121922] p-2.5 rounded-xl border border-slate-200/60 dark:border-white/5">
                              <p className="font-bold text-[11px] text-slate-900 dark:text-white flex items-center space-x-1 truncate">
                                <Radio className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                                <span>{talent.showName}</span>
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center space-x-1 truncate">
                                <Clock className="w-3 h-3 flex-shrink-0" />
                                <span>{talent.showSchedule}</span>
                              </p>
                            </div>

                            {talent.bio && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                                {talent.bio}
                              </p>
                            )}
                          </div>

                          {/* Botones de Control */}
                          <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-white/5">
                            {talentsTrashView ? (
                              <div className="w-full flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => handleRestoreTalent(talent.id)}
                                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-[#00DD9E] text-emerald-600 dark:text-[#00DD9E] hover:text-[#001E4D] font-bold text-xs transition cursor-pointer border border-emerald-500/30"
                                  title="Restaurar locutor"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Restaurar</span>
                                </button>
                                <button
                                  onClick={() => handlePermanentDeleteTalent(talent.id, talent.name)}
                                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white font-bold text-xs transition cursor-pointer border border-rose-500/30"
                                  title="Eliminar de forma permanente"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Eliminar</span>
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleToggleTalentActive(talent.id)}
                                  className={`text-[11px] font-extrabold px-2 py-1 rounded-lg transition cursor-pointer ${
                                    talent.status === 'active'
                                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-slate-300'
                                      : 'bg-emerald-500 text-slate-950 font-black'
                                  }`}
                                >
                                  {talent.status === 'active' ? 'Desactivar' : 'Activar'}
                                </button>

                                <div className="flex items-center space-x-1">
                                  <button
                                    onClick={() => handleEditTalent(talent)}
                                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-blue-500 hover:text-white text-slate-600 dark:text-slate-300 transition cursor-pointer"
                                    title="Editar locutor"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTalent(talent.id, talent.name)}
                                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-rose-500 hover:text-white text-slate-600 dark:text-slate-300 transition cursor-pointer"
                                    title="Mover a la papelera"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* BOTONES DE RESPALDO Y RESTAURACIÓN DE TALENTOS */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-white/10 text-xs">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleExportTalents}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-white font-bold transition cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Exportar Talentos (JSON)</span>
                      </button>

                      <label className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-white font-bold transition cursor-pointer">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Importar Talentos</span>
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImportTalents}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <button
                      onClick={handleResetTalents}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-rose-500 hover:bg-rose-500/10 font-bold transition cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restablecer Locutores Predeterminados</span>
                    </button>
                  </div>

                </div>
              )}

              {/* ============================================================== */}
              {/* TAB EVENTOS & CARTELERA REGIONAL */}
              {/* ============================================================== */}
              {activeTab === 'events' && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* TARJETA / BANNER UNIFICADO INTEGRADO DE EVENTOS */}
                  <div className="rounded-3xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
                    {/* PARTE SUPERIOR: TÍTULO, DESCRIPCIÓN Y BOTÓN AGREGAR EVENTO */}
                    <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="font-display font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-emerald-500" />
                          <span>Gestión de Eventos y Cartelera Regional</span>
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Publica afiches/flyers, fechas, lugares, enlaces y datos de contacto de coordinadores para ferias y eventos.
                        </p>
                      </div>

                      <button
                        onClick={handleOpenCreateEvent}
                        className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition cursor-pointer self-start sm:self-auto shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                        <span>+ Agregar Nuevo Evento</span>
                      </button>
                    </div>

                    {/* PARTE INFERIOR: SELECTOR DE EVENTOS ACTIVOS / PAPELERA Y VACIAR PAPELERA */}
                    <div className="p-3 bg-slate-50/80 dark:bg-black/20 flex flex-wrap items-center justify-between gap-2.5">
                      <div className="flex items-center space-x-1.5 bg-slate-200/60 dark:bg-white/5 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setEventsTrashView(false)}
                          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                            !eventsTrashView
                              ? 'bg-white dark:bg-[#001E4D] text-slate-900 dark:text-[#00DD9E] shadow-xs font-black'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Eventos Activos</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-white/10 font-bold">
                            {eventsList.filter(e => !e.trashed).length}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setEventsTrashView(true)}
                          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                            eventsTrashView
                              ? 'bg-rose-500 text-white shadow-xs font-black'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Papelera</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-white/10 font-bold">
                            {eventsList.filter(e => !!e.trashed).length}
                          </span>
                        </button>
                      </div>

                      {eventsTrashView && eventsList.filter(e => !!e.trashed).length > 0 && (
                        <button
                          type="button"
                          onClick={handleEmptyEventsTrash}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white text-xs font-bold transition cursor-pointer border border-rose-500/30 flex items-center space-x-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Vaciar Papelera de Eventos</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* FORMULARIO DE EVENTO */}
                  {isEventFormOpen && (
                    <div className="p-5 rounded-2xl bg-slate-100 dark:bg-[#1c2633] border-2 border-emerald-500/30 shadow-xl space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
                        <h4 className="font-display font-black text-base text-slate-900 dark:text-white flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-emerald-500" />
                          <span>{editingEvent ? `Editar Evento: ${editingEvent.title}` : 'Registrar Nuevo Evento en Cartelera'}</span>
                        </h4>
                        <button onClick={() => setIsEventFormOpen(false)} className="p-1 text-slate-400 hover:text-white">
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <form onSubmit={handleSaveEvent} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          
                          {/* Título del Evento */}
                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Título del Evento *
                            </label>
                            <input
                              type="text"
                              value={eventFormData.title}
                              onChange={(e) => setEventFormData({...eventFormData, title: e.target.value})}
                              placeholder="Ej: Gran Fiesta Patronal Santo Domingo 2026"
                              required
                              className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/40"
                            />
                          </div>

                          {/* Categoría */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Categoría *
                            </label>
                            <select
                              value={eventFormData.category}
                              onChange={(e) => setEventFormData({...eventFormData, category: e.target.value})}
                              className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                            >
                              {EVENT_CATEGORIES.filter(c => c !== 'Todas').map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                          </div>

                          {/* Flyer del Evento (URL) */}
                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                              URL del Flyer / Afiche del Evento (HD) *
                            </label>
                            <input
                              type="url"
                              value={eventFormData.flyer}
                              onChange={(e) => setEventFormData({...eventFormData, flyer: e.target.value})}
                              placeholder="https://..."
                              required
                              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-mono"
                            />
                          </div>

                          {/* Estado del Evento */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Estado del Evento
                            </label>
                            <select
                              value={eventFormData.status}
                              onChange={(e) => setEventFormData({...eventFormData, status: e.target.value})}
                              className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                            >
                              <option value="upcoming">Próximo</option>
                              <option value="ongoing">En Curso / Hoy</option>
                              <option value="completed">Finalizado</option>
                            </select>
                          </div>

                          {/* Fecha Calendario */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Fecha Calendario (AAAA-MM-DD) *
                            </label>
                            <input
                              type="date"
                              value={eventFormData.date}
                              onChange={(e) => setEventFormData({...eventFormData, date: e.target.value})}
                              required
                              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-mono"
                            />
                          </div>

                          {/* Fecha en Texto Amigable */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Fecha Amigable (Ej: Sábado 15 de Noviembre)
                            </label>
                            <input
                              type="text"
                              value={eventFormData.dateDisplay}
                              onChange={(e) => setEventFormData({...eventFormData, dateDisplay: e.target.value})}
                              placeholder="Ej: Sábado 15 de Noviembre, 2026"
                              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                            />
                          </div>

                          {/* Hora del Evento */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Hora de Inicio / Rango
                            </label>
                            <input
                              type="text"
                              value={eventFormData.time}
                              onChange={(e) => setEventFormData({...eventFormData, time: e.target.value})}
                              placeholder="Ej: 7:00 PM"
                              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                            />
                          </div>

                          {/* Lugar / Ubicación */}
                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Lugar / Ubicación del Evento *
                            </label>
                            <input
                              type="text"
                              value={eventFormData.location}
                              onChange={(e) => setEventFormData({...eventFormData, location: e.target.value})}
                              placeholder="Ej: Plaza Bolívar y Complejo Cultural, Santo Domingo, Mérida"
                              required
                              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                            />
                          </div>

                          {/* Precio / Modalidad */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Precio de Entrada / Admisión
                            </label>
                            <input
                              type="text"
                              value={eventFormData.admissionPrice}
                              onChange={(e) => setEventFormData({...eventFormData, admissionPrice: e.target.value})}
                              placeholder="Ej: Entrada Libre / Preventa $10"
                              className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                            />
                          </div>

                        </div>

                        {/* Descripción del Evento */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Descripción e Información Detallada del Evento *
                          </label>
                          <textarea
                            rows={3}
                            value={eventFormData.description}
                            onChange={(e) => setEventFormData({...eventFormData, description: e.target.value})}
                            placeholder="Detalla actividades, artistas invitados, programa del día o recomendaciones para los asistentes..."
                            required
                            className="w-full text-xs p-3 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white leading-relaxed resize-none"
                          />
                        </div>

                        {/* DATOS DEL COORDINADOR Y ENLACES (Requerimiento especial del usuario) */}
                        <div className="p-4 rounded-2xl bg-white/70 dark:bg-[#121922] border border-slate-200/80 dark:border-white/10 space-y-3">
                          <h5 className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-[#00DD9E]">
                            Datos del Coordinador y Enlaces de Contacto
                          </h5>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                                Nombre del Coordinador / Organización
                              </label>
                              <input
                                type="text"
                                value={eventFormData.coordinatorName}
                                onChange={(e) => setEventFormData({...eventFormData, coordinatorName: e.target.value})}
                                placeholder="Ej: Comité de Festejos / CATUREM"
                                className="w-full text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                                WhatsApp del Coordinador (Para botón directo)
                              </label>
                              <input
                                type="text"
                                value={eventFormData.coordinatorWhatsApp}
                                onChange={(e) => setEventFormData({...eventFormData, coordinatorWhatsApp: e.target.value})}
                                placeholder="584247459774"
                                className="w-full text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-mono"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                                Página Web Oficial o Boletería (URL)
                              </label>
                              <input
                                type="url"
                                value={eventFormData.eventUrl}
                                onChange={(e) => setEventFormData({...eventFormData, eventUrl: e.target.value})}
                                placeholder="https://..."
                                className="w-full text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-mono"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                                Instagram del Evento (@usuario)
                              </label>
                              <input
                                type="text"
                                value={eventFormData.instagram}
                                onChange={(e) => setEventFormData({...eventFormData, instagram: e.target.value})}
                                placeholder="@nombredelacuecta"
                                className="w-full text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                                Ubicación en Google Maps (URL)
                              </label>
                              <input
                                type="url"
                                value={eventFormData.googleMapsUrl}
                                onChange={(e) => setEventFormData({...eventFormData, googleMapsUrl: e.target.value})}
                                placeholder="https://maps.google.com/..."
                                className="w-full text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-mono"
                              />
                            </div>

                            <div className="flex items-center pt-4">
                              <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
                                <input
                                  type="checkbox"
                                  checked={eventFormData.isFree}
                                  onChange={(e) => setEventFormData({...eventFormData, isFree: e.target.checked})}
                                  className="rounded text-emerald-500 focus:ring-emerald-500 w-4 h-4"
                                />
                                <span>Evento de Entrada Libre</span>
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Switches de Visibilidad */}
                        <div className="flex flex-wrap items-center gap-6 pt-2">
                          <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
                            <input
                              type="checkbox"
                              checked={eventFormData.active}
                              onChange={(e) => setEventFormData({...eventFormData, active: e.target.checked})}
                              className="rounded text-emerald-500 focus:ring-emerald-500 w-4 h-4"
                            />
                            <span>Evento Activo (Visible en la Web)</span>
                          </label>

                          <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
                            <input
                              type="checkbox"
                              checked={eventFormData.featuredInHome}
                              onChange={(e) => setEventFormData({...eventFormData, featuredInHome: e.target.checked})}
                              className="rounded text-amber-500 focus:ring-amber-500 w-4 h-4"
                            />
                            <span>Destacar Evento</span>
                          </label>
                        </div>

                        {/* Botones de Acción */}
                        <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-white/10">
                          <button
                            type="button"
                            onClick={() => setIsEventFormOpen(false)}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                          >
                            Cancelar
                          </button>

                          <button
                            type="submit"
                            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition cursor-pointer"
                          >
                            {editingEvent ? 'Guardar Cambios' : 'Publicar Evento'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* BUSCADOR DE EVENTOS */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={eventSearch}
                        onChange={(e) => setEventSearch(e.target.value)}
                        placeholder="Buscar evento por título, lugar..."
                        className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-white dark:bg-[#141b24] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400"
                      />
                    </div>

                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      Total: {eventsList.length} eventos en cartelera
                    </span>
                  </div>

                  {/* LISTADO DE EVENTOS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {eventsList
                      .filter(e => {
                        const isTrash = !!e.trashed;
                        if (eventsTrashView ? !isTrash : isTrash) return false;
                        const term = eventSearch.toLowerCase().trim();
                        if (!term) return true;
                        return (
                          e.title.toLowerCase().includes(term) ||
                          (e.location && e.location.toLowerCase().includes(term)) ||
                          (e.category && e.category.toLowerCase().includes(term))
                        );
                      })
                      .map((event) => (
                        <div
                          key={event.id}
                          className="flex flex-col justify-between p-4 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 shadow-sm hover:border-emerald-500/30 transition"
                        >
                          <div>
                            <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-3 bg-slate-900">
                              <img
                                src={event.flyer || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80'}
                                alt={event.title}
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute top-2 left-2 text-[11px] font-black uppercase px-2 py-0.5 rounded-lg bg-slate-950/80 text-[#00DD9E] border border-white/20">
                                {event.category}
                              </span>
                              <span className={`absolute top-2 right-2 text-[11px] font-black uppercase px-2 py-0.5 rounded-lg ${
                                event.status === 'upcoming' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-white'
                              }`}>
                                {event.status === 'upcoming' ? 'Próximo' : event.status}
                              </span>
                            </div>

                            <h5 className="font-display font-black text-sm text-slate-900 dark:text-white line-clamp-1">
                              {event.title}
                            </h5>

                            <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                              <p className="flex items-center space-x-1.5 truncate">
                                <Calendar className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                                <span>{event.dateDisplay || event.date}</span>
                              </p>
                              <p className="flex items-center space-x-1.5 truncate">
                                <MapPin className="w-3 h-3 text-red-500 flex-shrink-0" />
                                <span>{event.location}</span>
                              </p>
                              {event.coordinatorName && (
                                <p className="flex items-center space-x-1.5 truncate">
                                  <User className="w-3 h-3 text-sky-500 flex-shrink-0" />
                                  <span>{event.coordinatorName}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Botones de Control */}
                          <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-white/5">
                            {eventsTrashView ? (
                              <div className="w-full flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => handleRestoreEvent(event.id)}
                                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-[#00DD9E] text-emerald-600 dark:text-[#00DD9E] hover:text-[#001E4D] font-bold text-xs transition cursor-pointer border border-emerald-500/30"
                                  title="Restaurar evento"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Restaurar</span>
                                </button>
                                <button
                                  onClick={() => handlePermanentDeleteEvent(event.id, event.title)}
                                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white font-bold text-xs transition cursor-pointer border border-rose-500/30"
                                  title="Eliminar de forma permanente"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Eliminar</span>
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleToggleEventActive(event.id)}
                                  className={`text-[11px] font-extrabold px-2 py-1 rounded-lg transition cursor-pointer ${
                                    event.active
                                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-slate-300'
                                      : 'bg-emerald-500 text-slate-950 font-black'
                                  }`}
                                >
                                  {event.active ? 'Desactivar' : 'Activar'}
                                </button>

                                <div className="flex items-center space-x-1">
                                  <button
                                    onClick={() => handleEditEvent(event)}
                                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-blue-500 hover:text-white text-slate-600 dark:text-slate-300 transition cursor-pointer"
                                    title="Editar evento"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteEvent(event.id, event.title)}
                                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-rose-500 hover:text-white text-slate-600 dark:text-slate-300 transition cursor-pointer"
                                    title="Mover a la papelera"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* BOTONES DE RESPALDO Y RESTAURACIÓN DE EVENTOS */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-white/10 text-xs">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleExportEvents}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-white font-bold transition cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Exportar Eventos (JSON)</span>
                      </button>

                      <label className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-white font-bold transition cursor-pointer">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Importar Eventos</span>
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImportEvents}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <button
                      onClick={handleResetEvents}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-rose-500 hover:bg-rose-500/10 font-bold transition cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restablecer Eventos Predeterminados</span>
                    </button>
                  </div>

                </div>
              )}

              {/* ============================================================== */}
              {/* TAB 5: ANALÍTICA, MÉTRICAS Y CONVERSIONES */}
              {/* ============================================================== */}
              {activeTab === 'analytics' && (
                <AdminAnalyticsTab onShowToast={triggerToast} />
              )}

              {/* ============================================================== */}
              {/* TAB: CONEXIÓN OFICIAL WORDPRESS REST API */}
              {/* ============================================================== */}
              {activeTab === 'wordpress' && (
                <div className="space-y-6 animate-fadeIn max-w-5xl">
                  {/* Cabecera del Módulo */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#19222e] p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                    <div className="flex items-center space-x-3.5">
                      <Emoji3D name="newspaper" className="w-12 h-12 drop-shadow-md shrink-0" alt="WordPress" />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-display font-black text-lg text-slate-900 dark:text-white">
                            Conexión Oficial WordPress REST API
                          </h3>
                          <span className={`inline-flex items-center gap-1 text-[11px] font-black uppercase px-2 py-0.5 rounded-lg border ${
                            wpConfig.status === 'connected'
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/25'
                              : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/25'
                          }`}>
                            {wpConfig.status === 'connected' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            <span>{wpConfig.status === 'connected' ? 'Conectado' : 'Configuración Requerida'}</span>
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Sincronización bi-direccional y publicación directa en <span className="font-bold text-slate-700 dark:text-slate-200">neblina105fm.com</span>
                        </p>
                      </div>
                    </div>

                    <a
                      href="https://neblina105fm.com/wp-admin/profile.php"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-800 dark:text-white text-xs font-bold transition border border-slate-200 dark:border-white/10 self-start sm:self-auto"
                    >
                      <span>Abrir wp-admin</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Tarjeta de Estado Actual */}
                  <div className={`p-5 rounded-2xl border transition-all ${
                    wpConfig.status === 'connected'
                      ? 'bg-emerald-500/[0.04] border-emerald-500/30'
                      : 'bg-amber-500/[0.04] border-amber-500/30'
                  }`}>
                    <div className="flex items-start space-x-3.5">
                      {wpConfig.status === 'connected' ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-1">
                        <h4 className="font-display font-black text-sm text-slate-900 dark:text-white">
                          {wpConfig.status === 'connected'
                            ? `Conectado exitosamente como "${wpConfig.userNameDisplay || wpConfig.username}"`
                            : 'Conexión con WordPress pendiente o no configurada'}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {wpConfig.status === 'connected'
                            ? `La Web App tiene permisos activos para consultar noticias, sincronizar comentarios y publicar nuevas notas de prensa directamente en neblina105fm.com mediante la REST API oficial.`
                            : 'Para publicar noticias desde este sistema hacia neblina105fm.com de forma automática, ingresa tus credenciales abajo.'}
                        </p>
                        {wpConfig.lastTestedAt && (
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 pt-1">
                            Última verificación en vivo: {new Date(wpConfig.lastTestedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* SECCIÓN DESTACADA: MIGRACIÓN COMPLETA DE DATOS (NOTAS DE PRENSA Y COMENTARIOS) */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900/10 via-purple-900/05 to-emerald-900/10 dark:from-[#001E4D] dark:to-teal-950/70 border border-indigo-500/25 dark:border-[#00DD9E]/30 shadow-md space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center space-x-3.5">
                        <Emoji3D name="database" className="w-10 h-10 drop-shadow-md shrink-0" alt="Migración" />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-emerald-600 text-white shadow-xs">
                              Sincronización Total
                            </span>
                            <span className="text-xs text-slate-500">Servidor neblina105fm.com</span>
                          </div>
                          <h4 className="font-display font-black text-base text-slate-900 dark:text-white mt-0.5">
                            Migrar Notas de Prensa y Comentarios a esta Plataforma
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                            Descarga y migra de forma segura todos los artículos, comentarios de oyentes y autores directamente a la base de datos interna.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleMigrateWordPressData}
                        disabled={isMigratingWp || wpConfig.status !== 'connected'}
                        className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shrink-0 cursor-pointer"
                      >
                        {isMigratingWp ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>{wpMigrationProgress || 'Migrando datos...'}</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            <span>Iniciar Migración Completa</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Feedback o Resultado de Migración */}
                    {wpMigrationResult && (
                      <div className={`p-4 rounded-2xl border text-xs ${
                        wpMigrationResult.ok 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300' 
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300'
                      }`}>
                        {wpMigrationResult.ok ? (
                          <div className="space-y-1">
                            <p className="font-black text-sm flex items-center space-x-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              <span>¡Migración completada con éxito!</span>
                            </p>
                            <p>
                              • <strong>{wpMigrationResult.postsMigrated}</strong> notas de prensa completas importadas con carrusel multi-foto.<br />
                              • <strong>{wpMigrationResult.categoriesMigrated || categoriesList.length}</strong> categorías oficiales sincronizadas y clasificadas.<br />
                              • <strong>{wpMigrationResult.commentsMigrated}</strong> comentarios de lectores y oyentes importados con estadísticas.<br />
                              • <strong>{wpMigrationResult.contactsMigrated}</strong> autores incorporados al directorio unificado de usuarios.
                            </p>
                          </div>
                        ) : (
                          <p className="font-bold flex items-center space-x-1.5">
                            <AlertCircle className="w-4 h-4 text-rose-500" />
                            <span>Ocurrió un error en la migración: {wpMigrationResult.errors?.join(', ') || 'Error de red'}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Formulario de Configuración de Credenciales */}
                  <div className="bg-white dark:bg-[#19222e] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-5">
                    <div className="flex items-center space-x-2 pb-3 border-b border-slate-200 dark:border-white/10">
                      <Key className="w-4 h-4 text-[#00DD9E]" />
                      <h4 className="font-display font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                        Credenciales de la API REST de WordPress
                      </h4>
                    </div>

                    <form onSubmit={handleSaveWordPressConfig} className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          URL Base de la REST API *
                        </label>
                        <input
                          type="url"
                          value={wpFormState.apiUrl}
                          onChange={(e) => setWpFormState({ ...wpFormState, apiUrl: e.target.value })}
                          placeholder="https://neblina105fm.com/wp-json/wp/v2"
                          required
                          className="w-full text-xs font-semibold px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0c141f] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00DD9E]"
                        />
                        <span className="text-[11px] text-slate-400 mt-1 block">
                          Por defecto: <code className="font-mono">https://neblina105fm.com/wp-json/wp/v2</code>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Usuario de WordPress *
                          </label>
                          <input
                            type="text"
                            value={wpFormState.username}
                            onChange={(e) => setWpFormState({ ...wpFormState, username: e.target.value })}
                            placeholder="Ej: admin o redaccion"
                            required
                            className="w-full text-xs font-semibold px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0c141f] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00DD9E]"
                          />
                          <span className="text-[11px] text-slate-400 mt-1 block">
                            Tu nombre de usuario con el que inicias en wp-admin
                          </span>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Contraseña de Aplicación (Application Password) *
                          </label>
                          <div className="relative">
                            <input
                              type={showWpPassword ? 'text' : 'password'}
                              value={wpFormState.appPassword}
                              onChange={(e) => setWpFormState({ ...wpFormState, appPassword: e.target.value })}
                              placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
                              required
                              className="w-full text-xs font-mono font-semibold px-4 py-2.5 pr-10 rounded-xl bg-slate-50 dark:bg-[#0c141f] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00DD9E]"
                            />
                            <button
                              type="button"
                              onClick={() => setShowWpPassword(!showWpPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
                            >
                              {showWpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          <span className="text-[11px] text-slate-400 mt-1 block">
                            Clave de 24 caracteres generada en WordPress (ver guía abajo)
                          </span>
                        </div>
                      </div>

                      {wpTestResult && (
                        <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center space-x-2 ${
                          wpTestResult.ok
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                            : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                        }`}>
                          {wpTestResult.ok ? (
                            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                          )}
                          <span>{wpTestResult.message}</span>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={handleTestWordPress}
                          disabled={isTestingWp}
                          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black text-xs hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
                        >
                          {isTestingWp ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Verificando conexión...</span>
                            </>
                          ) : (
                            <>
                              <Radio className="w-3.5 h-3.5" />
                              <span>Probar Conexión en Vivo</span>
                            </>
                          )}
                        </button>

                        <button
                          type="submit"
                          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00DD9E] text-slate-950 font-black text-xs hover:opacity-95 transition cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>Guardar Credenciales</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Guía Interactiva: Cómo generar la Contraseña de Aplicación */}
                  <div className="bg-slate-100/70 dark:bg-[#19222e] p-6 rounded-2xl border border-slate-200 dark:border-white/10 space-y-4">
                    <div className="flex items-center space-x-2 pb-2 border-b border-slate-200 dark:border-white/10">
                      <Sparkles className="w-4 h-4 text-[#FEDC01]" />
                      <h4 className="font-display font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                        Guía Rápida: Cómo obtener tu Contraseña de Aplicación (Sin instalar plugins)
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                      <div className="p-4 rounded-2xl bg-white dark:bg-[#0c141f] border border-slate-200 dark:border-white/10 space-y-2">
                        <div className="w-7 h-7 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-black text-xs">
                          1
                        </div>
                        <h5 className="font-bold text-slate-900 dark:text-white">Inicia sesión</h5>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                          Entra a tu panel habitual en <strong className="text-slate-700 dark:text-slate-300">neblina105fm.com/wp-admin</strong> con tu usuario y contraseña.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-white dark:bg-[#0c141f] border border-slate-200 dark:border-white/10 space-y-2">
                        <div className="w-7 h-7 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-black text-xs">
                          2
                        </div>
                        <h5 className="font-bold text-slate-900 dark:text-white">Ve a Tu Perfil</h5>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                          En el menú lateral izquierdo de WordPress, pulsa en <strong className="text-slate-700 dark:text-slate-300">Usuarios &gt; Tu Perfil</strong>.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-white dark:bg-[#0c141f] border border-slate-200 dark:border-white/10 space-y-2">
                        <div className="w-7 h-7 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-black text-xs">
                          3
                        </div>
                        <h5 className="font-bold text-slate-900 dark:text-white">Crea la Contraseña</h5>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                          Baja hasta la sección <strong className="text-slate-700 dark:text-slate-300">"Contraseñas de aplicación"</strong>, escribe el nombre <code className="font-mono text-[#008f7a] dark:text-[#00DD9E]">Neblina Web App</code> y haz clic en "Añadir nueva".
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-white dark:bg-[#0c141f] border border-slate-200 dark:border-white/10 space-y-2">
                        <div className="w-7 h-7 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-black text-xs">
                          4
                        </div>
                        <h5 className="font-bold text-slate-900 dark:text-white">Pégala aquí</h5>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                          Copia la contraseña de 24 letras que WordPress genera (ej: <code className="font-mono text-[11px]">abcd efgh ijkl mnop</code>) y pégala arriba.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* TAB 6: HERRAMIENTAS, RESPALDO TOTAL & SEGURIDAD */}
              {/* ============================================================== */}
              {activeTab === 'tools' && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* ENLACE PRIVADO DE ACCESO */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-[#FEDC01]/10 border border-emerald-500/30 space-y-3">
                    <div className="flex items-center space-x-2.5">
                      <Key className="w-5 h-5 text-emerald-600 dark:text-[#00DD9E]" />
                      <h4 className="font-display font-black text-base text-slate-900 dark:text-white">
                        Enlace Privado de Acceso (Sin Botón Visible en el Sitio)
                      </h4>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Por motivos de seguridad y estética, este sistema no tiene un botón visible en la página pública. Para acceder tú o tu equipo, debes utilizar el siguiente link privado directo (añádelo a tus marcadores favoritos o en la pantalla de inicio de tu teléfono):
                    </p>

                    <div className="flex items-center space-x-2 pt-1">
                      <input
                        type="text"
                        readOnly
                        value={`${window.location.origin}${window.location.pathname}#admin`}
                        className="flex-1 text-xs font-mono font-bold px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/20 text-emerald-700 dark:text-[#00DD9E]"
                      />
                      <button
                        onClick={handleCopyPrivateLink}
                        className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition flex items-center space-x-1.5 cursor-pointer"
                      >
                        {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span>{copiedLink ? 'Copiado' : 'Copiar'}</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center space-x-1.5 flex-wrap">
                      <Emoji3D name="lightbulb" className="w-3.5 h-3.5 inline-block" alt="Atajo" />
                      <span><em>Atajo secreto de teclado:</em> También puedes abrir o cerrar este panel pulsando <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 font-mono text-[11px]">Ctrl + Shift + A</kbd> o <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 font-mono text-[11px]">Alt + A</kbd>.</span>
                    </p>
                  </div>

                  
                  {/* LIMPIEZA TOTAL Y PUESTA A CERO DEL SISTEMA */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-3">
                    <div className="flex items-center space-x-2.5">
                      <Trash2 className="w-5 h-5 text-rose-500" />
                      <h4 className="font-display font-black text-base text-rose-600 dark:text-rose-400">
                        Limpieza Total del Sistema (Puesta a Cero para Producción)
                      </h4>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Elimina de forma irreversible todos los <strong>clientes ficticios</strong>, <strong>facturas</strong>, <strong>comentarios de prueba</strong>, <strong>denuncias ciudadanas de prueba</strong>, <strong>locutores de prueba</strong> y <strong>contactos</strong>, dejando los módulos limpios para el inicio oficial de operaciones. Las noticias reales de WordPress y las credenciales de administración se conservan intactas.
                    </p>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleTotalSystemPurge}
                        className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition cursor-pointer active:scale-95"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Ejecutar Limpieza Total del Sistema</span>
                      </button>
                    </div>
                  </div>

                  {/* CENTRO DE RESPALDO Y RESTAURACIÓN INTEGRAL */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 space-y-4">
                    <div className="flex items-center space-x-2.5">
                      <Download className="w-5 h-5 text-emerald-500" />
                      <h4 className="font-display font-black text-base text-slate-900 dark:text-white">
                        Copia de Seguridad y Restauración Total de la Estación
                      </h4>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Exporta o restaura en un único archivo <code className="font-mono font-bold">.json</code> todas las noticias publicadas, patrocinantes, programación radial, reportes ciudadanos y estadísticas.
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        onClick={handleExportFullStationBackup}
                        className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black text-xs hover:opacity-90 transition cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>Exportar Respaldo Completo (.json)</span>
                      </button>

                      <label className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-900 dark:text-white font-black text-xs transition border border-slate-300 dark:border-white/15 cursor-pointer">
                        <Upload className="w-4 h-4" />
                        <span>Restaurar Respaldo (.json)</span>
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImportFullStationBackup}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* MODIFICACIÓN DE CREDENCIALES DE ACCESO */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#19222e] border border-slate-200 dark:border-white/10 space-y-4">
                    <div className="flex items-center space-x-2.5">
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                      <h4 className="font-display font-black text-base text-slate-900 dark:text-white">
                        Modificar Usuario y Contraseña de Acceso
                      </h4>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Usuario actual configurado: <strong className="text-slate-800 dark:text-slate-200">{getStoredUsername()}</strong>
                    </p>

                    <form onSubmit={handleChangeCredentials} className="max-w-md space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Contraseña Actual *
                        </label>
                        <input
                          type="password"
                          value={currentPassInput}
                          onChange={(e) => setCurrentPassInput(e.target.value)}
                          placeholder="Ingrese contraseña actual..."
                          required
                          className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Nuevo Usuario
                          </label>
                          <input
                            type="text"
                            value={newUserInput}
                            onChange={(e) => setNewUserInput(e.target.value)}
                            placeholder="Nuevo usuario..."
                            required
                            className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Nueva Contraseña
                          </label>
                          <input
                            type="password"
                            value={newPassInput}
                            onChange={(e) => setNewPassInput(e.target.value)}
                            placeholder="Mínimo 6 caracteres..."
                            required
                            className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>

                      {securityError && (
                        <p className="text-xs text-rose-500 font-bold flex items-center space-x-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{securityError}</span>
                        </p>
                      )}

                      {securitySuccess && (
                        <p className="text-xs text-emerald-500 font-bold flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{securitySuccess}</span>
                        </p>
                      )}

                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition cursor-pointer"
                      >
                        Actualizar Credenciales
                      </button>
                    </form>
                  </div>

                </div>
              )}

                </Suspense>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );

  if (isStandalonePage || typeof document === 'undefined') {
    return modalContent;
  }

  return createPortal(modalContent, document.body);
}
