import React, { useState, useEffect } from 'react';
import { 
  Newspaper, 
  FileText, 
  Plus, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  LogOut, 
  User, 
  ArrowLeft, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  Eye, 
  EyeOff,
  Image as ImageIcon, 
  Calendar, 
  Lock, 
  Key, 
  ExternalLink,
  Upload,
  Layers,
  Sparkles,
  Share2,
  Copy,
  Check,
  Feather,
  ShieldCheck,
  Edit3,
  BarChart3,
  TrendingUp,
  Activity,
  Award,
  Hash,
  Compass,
  Video,
  Trash2
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import Emoji3D from '../Emoji3D';
import SystemInstallButton from '../SystemInstallButton';
import AvatarWithFallback from '../AvatarWithFallback';
import AnimatedBackground from '../AnimatedBackground';
import { 
  loginJournalist, 
  getActiveJournalistSession, 
  logoutJournalist, 
  publishPressNote, 
  getNotesByJournalist, 
  getJournalistMetrics,
  saveJournalist 
} from '../../services/journalistsService';
import { NEWS_CATEGORIES } from '../../services/newsData';

export default function JournalistPortalModal({ isOpen, onClose, isStandalonePage = false }) {
  const { theme, toggleTheme } = useTheme();
  const [session, setSession] = useState(() => getActiveJournalistSession());

  // Formulario de Inicio de Sesión (por defecto con usuario y clave admin para demostración)
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Pestañas del Sistema Interno de Periodistas: 'mis_notas' | 'nueva_nota' | 'perfil'
  const [activeTab, setActiveTab] = useState('mis_notas');
  const [notes, setNotes] = useState([]);
  const [metrics, setMetrics] = useState({ totalNotes: 0, publishedCount: 0, pendingCount: 0, totalViews: 0 });

  // Formulario de Nueva Nota de Prensa
  const [noteForm, setNoteForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'Noticias',
    image: '',
    images: [],
    videoUrl: '',
    socialEmbedUrl: '',
    featuredInCarousel: true
  });
  const [extraImageUrl, setExtraImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Modal de Compartir Nota en Redes Sociales
  const [previewNote, setPreviewNote] = useState(null);
  const [sharingNote, setSharingNote] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Formulario de Firma y Créditos del Periodista
  const [profileForm, setProfileForm] = useState({
    signatureText: '',
    instagramHandle: '',
    twitterHandle: '',
    carruselCard: '',
    role: '',
    department: '',
    phone: '',
    bio: ''
  });
  const [profileSaved, setProfileSaved] = useState(false);

  // Sincronizar formulario de perfil al cambiar de sesión
  useEffect(() => {
    if (session) {
      setProfileForm({
        signatureText: session.signatureText || '',
        instagramHandle: session.instagramHandle || '',
        twitterHandle: session.twitterHandle || '',
        carruselCard: session.carruselCard || '',
        role: session.role || 'Corresponsal',
        department: session.department || 'Información General',
        phone: session.phone || '',
        bio: session.bio || ''
      });
    }
  }, [session]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!session?.id) return;
    const updated = {
      ...session,
      ...profileForm
    };
    saveJournalist(updated);
    setSession(updated);
    localStorage.setItem('neblina_journalist_session', JSON.stringify(updated));
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  // Generar enlaces y formatos de compartición en Redes Sociales
  const getNoteShareLinks = (note) => {
    if (!note) return {};
    const baseUrl = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : 'https://neblina105fm.com';
    const noteUrl = `${baseUrl}#news?id=${note.id}`;
    const cleanHeadline = (note.title || '').replace(/<[^>]+>/g, '').trim();
    const cleanExcerpt = (note.excerpt || note.content || '').replace(/<[^>]+>/g, '').trim().substring(0, 320);
    const signature = note.journalistSignature || session?.signatureText || (session?.name ? `Nota de prensa por ${session.name} · Neblina Stereo 105.5 FM` : 'Neblina 105.5 FM');

    const whatsappText = `*${cleanHeadline}*\n\n${cleanExcerpt}…\n\n✍️ *Créditos:* ${signature}\n\n👉 *Más detalles en vivo:* ${noteUrl}`;
    const telegramText = `**${cleanHeadline}**\n\n${cleanExcerpt}…\n\n✍️ *Créditos:* ${signature}\n\n👉 *Leer nota completa:* ${noteUrl}`;
    const twitterText = `${cleanHeadline.substring(0, 160)}…\n\n✍️ ${note.journalistTwitter || session?.twitterHandle || '@neblina105fm'}\n${noteUrl}`;

    return {
      noteUrl,
      whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappText)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(noteUrl)}&text=${encodeURIComponent(`**${cleanHeadline}**\n\n${cleanExcerpt}…\n\n✍️ ${signature}`)}`,
      x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(noteUrl)}`,
      copyText: `${cleanHeadline}\n\n${cleanExcerpt}…\n\nCréditos: ${signature}\n\nLeer completa: ${noteUrl}`
    };
  };

  // Cargar notas y métricas del periodista autenticado
  const refreshJournalistData = () => {
    const current = getActiveJournalistSession();
    if (current?.id) {
      const myNotes = getNotesByJournalist(current.id);
      setNotes(myNotes);
      setMetrics(getJournalistMetrics(current.id));
    }
  };

  useEffect(() => {
    refreshJournalistData();
    const handleAuth = (e) => {
      setSession(e.detail);
      refreshJournalistData();
    };
    window.addEventListener('neblina_journalist_auth_changed', handleAuth);
    window.addEventListener('neblina_press_notes_updated', refreshJournalistData);
    return () => {
      window.removeEventListener('neblina_journalist_auth_changed', handleAuth);
      window.removeEventListener('neblina_press_notes_updated', refreshJournalistData);
    };
  }, []);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');
    const res = loginJournalist(loginUsername, loginPassword);
    if (res.success) {
      setSession(res.session);
      setLoginUsername('');
      setLoginPassword('');
      refreshJournalistData();
    } else {
      setLoginError(res.error || 'Credenciales no válidas');
    }
  };

  const handleLogout = () => {
    logoutJournalist();
    setSession(null);
  };

  // Manejar subida de archivo para foto principal
  const handleMainPhotoFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setNoteForm(prev => ({ ...prev, image: ev.target?.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Manejar subida de archivo para foto adicional
  const handleExtraPhotoFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result;
        if (dataUrl) {
          setNoteForm(prev => ({ ...prev, images: [...(prev.images || []), dataUrl] }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Agregar foto adicional vía URL
  const handleAddExtraImageUrl = () => {
    if (!extraImageUrl.trim()) return;
    setNoteForm(prev => ({
      ...prev,
      images: [...(prev.images || []), extraImageUrl.trim()]
    }));
    setExtraImageUrl('');
  };

  // Eliminar foto adicional
  const handleRemoveExtraImage = (indexToRemove) => {
    setNoteForm(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleSubmitNote = (e) => {
    e.preventDefault();
    if (!noteForm.title.trim() || !noteForm.content.trim()) {
      alert('Por favor ingrese el titular y el contenido de la nota de prensa.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Si se proporcionó un enlace de publicación de red social, se anexa al final del contenido
      let finalContent = noteForm.content.trim();
      const socialUrl = (noteForm.socialEmbedUrl || '').trim();
      if (socialUrl) {
        finalContent += `\n\n<p>${socialUrl}</p>`;
      }

      // Preparar consolidado de imágenes: [fotoPrincipal, ...fotosAdicionales]
      const mainImg = (noteForm.image || '').trim();
      const extraImgs = Array.isArray(noteForm.images) 
        ? noteForm.images.filter(img => typeof img === 'string' && img.trim().length > 0)
        : [];
      const consolidatedImages = mainImg ? [mainImg, ...extraImgs] : extraImgs;

      const noteToSave = {
        ...noteForm,
        image: mainImg || consolidatedImages[0] || '',
        images: consolidatedImages,
        videoUrl: (noteForm.videoUrl || '').trim(),
        content: finalContent,
        status: 'published' // Publicación directa autorizada
      };

      publishPressNote(noteToSave, session);
      setSubmitSuccess(true);
      setNoteForm({
        title: '',
        excerpt: '',
        content: '',
        category: 'Noticias',
        image: '',
        images: [],
        videoUrl: '',
        socialEmbedUrl: '',
        featuredInCarousel: true
      });
      setExtraImageUrl('');
      setTimeout(() => {
        setSubmitSuccess(false);
        setActiveTab('mis_notas');
        refreshJournalistData();
      }, 1500);
    } catch (err) {
      alert('Error publicando la nota de prensa.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

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
            : "relative z-10 w-full max-w-6xl max-h-[94vh] aeroglass-panel rounded-2xl overflow-hidden flex flex-col shadow-2xl transition-colors duration-300"
        }
      >
                {/* 1. Header Oficial de la Barra Superior */}
        {/* CABECERA SUPERIOR (Solo visible en pantalla de login si no está autenticado) */}
        {!session && (
          <header className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5 border-b border-slate-200/80 dark:border-white/10 aeroglass-nav">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#001E4D] to-[#00DD9E] p-0.5 shadow-md flex items-center justify-center overflow-hidden shrink-0">
              <div className="w-full h-full bg-[#001438] rounded-[14px] flex items-center justify-center text-white">
                <Newspaper className="w-5 h-5 text-[#00DD9E]" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-md">
                  Portal de Periodistas
                </h1>
                <span className="hidden sm:inline-block text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-[#00DD9E]/15 text-emerald-800 dark:text-[#00DD9E] border border-[#00DD9E]/30">
                  105.5 FM
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate max-w-[280px] sm:max-w-md font-medium">
                Neblina Stereo 105.5 FM · Sistema Editorial de Noticias
              </p>
            </div>
          </div>

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

        {/* 2. Pantalla de Inicio de Sesión si no está autenticado */}
        {!session ? (
          <div className="flex-1 overflow-y-auto p-6 sm:p-12 flex flex-col items-center justify-center text-center">
            <div className="panel-aeroglass max-w-md w-full p-6 sm:p-8 rounded-2xl border border-white/70 dark:border-white/15 shadow-lg space-y-6 my-auto text-center">
              
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#00DD9E]/20 to-[#FEDC01]/20 text-[#008f7a] dark:text-[#00DD9E] mx-auto flex items-center justify-center border border-[#00DD9E]/30 shadow-inner">
                <FileText className="w-8 h-8 text-[#00DD9E]" />
              </div>

              <div>
                <h4 className="font-display font-black text-xl text-slate-900 dark:text-white">
                  Acceso para Periodistas
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Ingrese sus credenciales de redacción para publicar notas de prensa, crónicas, reportajes o coberturas especiales.
                </p>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 text-xs font-bold flex items-center space-x-2 text-left">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Usuario o Correo Institucional
                  </label>
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={e => { setLoginUsername(e.target.value); setLoginError(''); }}
                    placeholder="Usuario o correo..."
                    className="w-full text-sm font-semibold px-4 py-2.5 rounded-2xl bg-white dark:bg-[#0c131c] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00DD9E]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Contraseña de Redactor
                  </label>
                  <div className="input-password-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={e => { setLoginPassword(e.target.value); setLoginError(''); }}
                      placeholder="••••••••"
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
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-[#00DD9E] hover:brightness-105 text-[#001E4D] font-bold text-sm transition border border-white/60 cursor-pointer"
                >
                  Iniciar Sesión en Redacción
                </button>
              </form>

              <div className="pt-2 border-t border-slate-200 dark:border-white/10 text-[11px] text-slate-400">
                ¿No tienes una cuenta de periodista autorizada? Contacta a la Dirección de Neblina 105.5 FM.
              </div>
            </div>
          </div>
        ) : (
          /* 3. Panel Principal de Trabajo del Periodista */
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-[calc(100vh-65px)]">
            
            {/* SIDEBAR FIJO PARA MONITORES Y COMPUTADORA (LG+) */}
            <aside className="hidden lg:flex w-72 bg-white/80 dark:bg-[#0c141f]/90 backdrop-blur-xl border-r border-slate-200 dark:border-white/10 flex-col justify-between p-4 shrink-0 overflow-y-auto">
              <div className="space-y-4">
                {/* Cabecera del Sidebar: Perfil Oficial del Periodista */}
                <div className="p-3.5 rounded-2xl bg-slate-100/90 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 space-y-2.5">
                  <div className="flex items-center space-x-3">
                    <AvatarWithFallback
                      src={session?.avatar}
                      alt={session?.name || 'Periodista'}
                      containerClassName="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#001E4D] to-slate-800 border-2 border-[#00DD9E] shrink-0 flex items-center justify-center overflow-hidden"
                      iconClassName="w-6 h-6 text-[#00DD9E]"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display font-black text-xs text-slate-900 dark:text-white truncate" title={session?.name}>
                        {session?.name}
                      </h3>
                      <p className="text-[10px] text-emerald-600 dark:text-[#00DD9E] font-bold truncate mt-0.5">
                        {session?.role || 'Periodista'}
                      </p>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-white/10 pt-2 flex justify-between">
                    <span>Permiso:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {session?.canAutoPublish ? 'Publicación Directa' : 'Revisión Editorial'}
                    </span>
                  </div>
                </div>

                <div className="px-3 py-1 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Módulos de Prensa
                </div>

                {/* Botones de Navegación del Periodista */}
                <nav className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('mis_notas')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                      activeTab === 'mis_notas'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md scale-[1.02]'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Newspaper className="w-4 h-4 text-emerald-600 dark:text-[#00DD9E]" />
                      <span>Mis Notas de Prensa</span>
                    </div>
                    <span className="text-[11px] px-1.5 py-0.2 rounded-lg font-bold bg-slate-200 dark:bg-white/10 text-slate-500">
                      {notes.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('nueva_nota')}
                    className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                      activeTab === 'nueva_nota'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md scale-[1.02]'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Plus className="w-4 h-4 text-sky-500" />
                    <span>Redactar Nueva Nota</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('estadisticas')}
                    className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                      activeTab === 'estadisticas'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md scale-[1.02]'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 text-amber-500" />
                    <span>Rendimiento & Métricas</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('perfil_firma')}
                    className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                      activeTab === 'perfil_firma'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md scale-[1.02]'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Feather className="w-4 h-4 text-purple-500" />
                    <span>Firma & Créditos</span>
                  </button>
                </nav>
              </div>

              {/* Pie del Sidebar Desktop: Acciones de Utilidad (Instalar, Tema, Salir, Volver) */}
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
                  <SystemInstallButton appName="Portal Periodistas" className="w-full justify-center" />
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
                        <Newspaper className="w-4 h-4 text-[#00DD9E]" />
                        <span className="font-display font-black text-sm text-slate-900 dark:text-white">Menú de Prensa</span>
                      </div>
                      <button 
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                        aria-label="Cerrar menú"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Tarjeta Móvil del Periodista */}
                    <div className="p-3 rounded-2xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 space-y-2">
                      <div className="flex items-center space-x-2.5">
                        <AvatarWithFallback
                          src={session?.avatar}
                          alt={session?.name || 'Periodista'}
                          containerClassName="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#001E4D] to-slate-800 border border-[#00DD9E] shrink-0 flex items-center justify-center overflow-hidden"
                          iconClassName="w-5 h-5 text-[#00DD9E]"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-display font-black text-xs text-slate-900 dark:text-white truncate">{session?.name}</h4>
                          <p className="text-[10px] text-emerald-600 dark:text-[#00DD9E] font-bold truncate">{session?.role}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-200/60 dark:border-white/10">
                        <SystemInstallButton appName="Portal Periodistas" />
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
                      <button
                        type="button"
                        onClick={() => { setActiveTab('mis_notas'); setMobileMenuOpen(false); }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          activeTab === 'mis_notas'
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <Newspaper className="w-4 h-4 text-emerald-600 dark:text-[#00DD9E]" />
                          <span>Mis Notas de Prensa</span>
                        </div>
                        <span className="text-[11px] px-1.5 py-0.2 rounded-lg font-bold bg-slate-200 dark:bg-white/10">
                          {notes.length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setActiveTab('nueva_nota'); setMobileMenuOpen(false); }}
                        className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          activeTab === 'nueva_nota'
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                        }`}
                      >
                        <Plus className="w-4 h-4 text-sky-500" />
                        <span>Redactar Nueva Nota</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setActiveTab('estadisticas'); setMobileMenuOpen(false); }}
                        className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          activeTab === 'estadisticas'
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                        }`}
                      >
                        <BarChart3 className="w-4 h-4 text-amber-500" />
                        <span>Rendimiento & Métricas</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setActiveTab('perfil_firma'); setMobileMenuOpen(false); }}
                        className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          activeTab === 'perfil_firma'
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                        }`}
                      >
                        <Feather className="w-4 h-4 text-purple-500" />
                        <span>Firma & Créditos</span>
                      </button>
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

            {/* Área de Contenido Principal (Workspace) */}
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
                <button
                  onClick={() => setActiveTab('mis_notas')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition cursor-pointer ${
                    activeTab === 'mis_notas'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                      : 'bg-white/80 dark:bg-[#111923] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10'
                  }`}
                >
                  <Newspaper className="w-3.5 h-3.5 text-emerald-600 dark:text-[#00DD9E]" />
                  <span>Mis Notas</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-slate-200 dark:bg-white/10 text-slate-500">
                    {notes.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('nueva_nota')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition cursor-pointer ${
                    activeTab === 'nueva_nota'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                      : 'bg-white/80 dark:bg-[#111923] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5 text-sky-500" />
                  <span>Redactar</span>
                </button>
                <button
                  onClick={() => setActiveTab('estadisticas')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition cursor-pointer ${
                    activeTab === 'estadisticas'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                      : 'bg-white/80 dark:bg-[#111923] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-amber-500" />
                  <span>Métricas</span>
                </button>
                <button
                  onClick={() => setActiveTab('perfil_firma')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition cursor-pointer ${
                    activeTab === 'perfil_firma'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                      : 'bg-white/80 dark:bg-[#111923] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10'
                  }`}
                >
                  <Feather className="w-3.5 h-3.5 text-purple-500" />
                  <span>Firma</span>
                </button>
              </div>

              <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
            
            {/* VISTA 1: LISTADO DE MIS NOTAS */}
            {activeTab === 'mis_notas' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">Mis Notas de Prensa</h2>
                    <p className="text-xs text-slate-500">Historial de notas enviadas, publicadas y en revisión editorial.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('nueva_nota')}
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Redactar Nota</span>
                  </button>
                </div>

                {notes.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl aeroglass-card border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-[#001E4D]/60 space-y-3">
                    <FileText className="w-12 h-12 mx-auto text-slate-400 opacity-60" />
                    <p className="font-bold text-sm text-slate-700 dark:text-slate-300">Aún no has redactado notas de prensa</p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('nueva_nota')}
                      className="px-4 py-2 rounded-xl bg-[#001E4D] text-[#00DD9E] dark:bg-[#00DD9E] dark:text-[#001E4D] font-bold text-xs"
                    >
                      Comenzar mi primera nota
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notes.map(note => (
                      <div key={note.id} className="p-4 rounded-2xl aeroglass-card border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-[#001E4D]/90 backdrop-blur-xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-start space-x-3 min-w-0 flex-1">
                          {note.image && (
                            <img
                              src={note.image}
                              alt={note.title}
                              className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-white/10 flex-shrink-0"
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-[#00DD9E]">
                                {note.category || 'Noticia'}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                note.status === 'published' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-slate-950 font-black'
                              }`}>
                                {note.status === 'published' ? 'Publicada en la Web' : 'En Revisión'}
                              </span>
                              <span className="text-[11px] text-slate-400">{note.date}</span>
                            </div>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1 line-clamp-1">{note.title}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{note.excerpt || note.content?.substring(0, 100)}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setSharingNote(note)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-800 dark:text-[#00DD9E] text-xs font-bold flex items-center space-x-1 cursor-pointer border border-emerald-500/30"
                            title="Compartir en Redes Sociales"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>Compartir</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setPreviewNote(note)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white text-xs font-bold flex items-center space-x-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Ver</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* VISTA 2: REDACTAR NUEVA NOTA */}
            {activeTab === 'nueva_nota' && (
              <div className="max-w-3xl mx-auto space-y-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">Redactor de Noticias & Notas de Prensa</h2>
                  <p className="text-xs text-slate-500">
                    {session.canAutoPublish 
                      ? 'Tu cuenta tiene permisos de publicación inmediata. La nota saldrá directamente en neblina105fm.com.' 
                      : 'Esta nota será enviada a la Dirección para su revisión antes de ser publicada en la web.'}
                  </p>
                </div>

                {submitSuccess && (
                  <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500 text-emerald-800 dark:text-[#00DD9E] text-xs font-bold flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>¡Nota de prensa guardada exitosamente! {session.canAutoPublish ? 'Ya está disponible en la web.' : 'Ha sido enviada a revisión editorial.'}</span>
                  </div>
                )}

                <form onSubmit={handleSubmitNote} className="p-5 sm:p-6 rounded-2xl aeroglass-card border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#001E4D]/95 space-y-4 shadow-lg text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Titular de la Noticia *
                    </label>
                    <input
                      type="text"
                      required
                      value={noteForm.title}
                      onChange={e => setNoteForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Escribe un titular llamativo y preciso..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-bold text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Categoría de la Nota
                      </label>
                      <select
                        value={noteForm.category}
                        onChange={e => setNoteForm(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-bold"
                      >
                        {NEWS_CATEGORIES.filter(c => c !== 'Todas').map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-bold text-slate-700 dark:text-slate-300">
                          Fotografía Principal (Portada) *
                        </label>
                        <label className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-600 dark:text-[#00DD9E] cursor-pointer hover:underline">
                          <Upload className="w-3 h-3" />
                          <span>Subir archivo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleMainPhotoFile}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <input
                        type="text"
                        value={noteForm.image}
                        onChange={e => setNoteForm(prev => ({ ...prev, image: e.target.value }))}
                        placeholder="https://ejemplo.com/foto-principal.jpg o sube archivo"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* VISTA PREVIA Y GESTIÓN DE FOTOGRAFÍAS ADICIONALES DEL EVENTO / SUCESO */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-1.5 font-bold text-slate-800 dark:text-slate-200">
                          <ImageIcon className="w-4 h-4 text-emerald-500" />
                          <span>Galería de Fotografías Adicionales del Hecho ({(noteForm.images || []).length})</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Agrega fotos complementarias del accidente, evento o lugar para que se muestren en el carrusel interactivo
                        </p>
                      </div>

                      <label className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-[#00DD9E] border border-emerald-500/30 text-xs font-bold cursor-pointer hover:bg-emerald-500/25 transition self-start sm:self-auto shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <span>+ Subir Foto Local</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleExtraPhotoFile}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Input para agregar por URL */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="url"
                        value={extraImageUrl}
                        onChange={(e) => setExtraImageUrl(e.target.value)}
                        placeholder="O pega URL de foto adicional (https://...)"
                        className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-black/40 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleAddExtraImageUrl}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shrink-0 cursor-pointer"
                      >
                        + Agregar URL
                      </button>
                    </div>

                    {/* Vistas previas en miniatura con botón de eliminar */}
                    {Array.isArray(noteForm.images) && noteForm.images.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 pt-1">
                        {noteForm.images.map((imgSrc, idx) => (
                          <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-white/15 bg-black group shadow-xs">
                            <img src={imgSrc} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveExtraImage(idx)}
                                className="p-1.5 rounded-full bg-rose-500 text-white hover:bg-rose-600 transition cursor-pointer shadow-md"
                                title="Eliminar foto"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <span className="absolute bottom-1 left-1 px-1.5 py-0.2 rounded bg-black/70 text-[9px] font-bold text-white">
                              #{idx + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ENLACE DE VIDEO DEL HECHO (OPCIONAL) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                        <Video className="w-3.5 h-3.5 text-sky-500" />
                        <span>Enlace de Video del Hecho (YouTube, MP4 o Streaming)</span>
                      </label>
                      <span className="text-[10px] text-slate-400 font-medium">Opcional</span>
                    </div>
                    <input
                      type="url"
                      value={noteForm.videoUrl || ''}
                      onChange={e => setNoteForm(prev => ({ ...prev, videoUrl: e.target.value }))}
                      placeholder="Ej: https://youtube.com/watch?v=... o https://ejemplo.com/video.mp4"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Resumen Breve (Entradilla / Copete)
                    </label>
                    <textarea
                      rows="2"
                      value={noteForm.excerpt}
                      onChange={e => setNoteForm(prev => ({ ...prev, excerpt: e.target.value }))}
                      placeholder="Breve introducción de 1 a 2 párrafos para enganchar al lector..."
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Cuerpo Completo de la Noticia * (Permite párrafos y detalles)
                    </label>
                    <textarea
                      rows="8"
                      required
                      value={noteForm.content}
                      onChange={e => setNoteForm(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Escribe el cuerpo completo del reportaje o nota de prensa..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-sans text-xs leading-relaxed"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-slate-700 dark:text-slate-300">
                        Anexar Publicación de Red Social (Opcional)
                      </label>
                      <span className="text-[10px] text-emerald-600 dark:text-[#00DD9E] font-semibold">
                        Instagram, X (Twitter), Facebook, TikTok o YouTube
                      </span>
                    </div>
                    <input
                      type="url"
                      value={noteForm.socialEmbedUrl}
                      onChange={e => setNoteForm(prev => ({ ...prev, socialEmbedUrl: e.target.value }))}
                      placeholder="Ej: https://www.instagram.com/p/... o https://x.com/... o https://youtube.com/watch?v=..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white text-xs font-mono"
                    />
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      Este link se anexará automáticamente al final de la nota de prensa y se integrará de forma interactiva en la web.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 pt-1">
                    <input
                      type="checkbox"
                      id="carousel_check"
                      checked={noteForm.featuredInCarousel}
                      onChange={e => setNoteForm(prev => ({ ...prev, featuredInCarousel: e.target.checked }))}
                      className="rounded accent-emerald-500"
                    />
                    <label htmlFor="carousel_check" className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                      Destacar esta nota en el Carrusel Superior de la Página Web
                    </label>
                  </div>

                  <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => setActiveTab('mis_notas')}
                      className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-white/10 text-slate-800 dark:text-white font-bold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Publicar Nota de Prensa Directamente</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* VISTA 3: PERFIL, FIRMA & CRÉDITOS OFICIALES DEL PERIODISTA */}
            {activeTab === 'perfil_firma' && (
              <div className="max-w-2xl mx-auto space-y-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">Firma & Créditos Editoriales</h2>
                  <p className="text-xs text-slate-500">
                    Configura tu firma personalizada y redes sociales. Estos datos aparecerán automáticamente en el pie de cada nota de prensa que publiques en Neblina Stereo 105.5 FM.
                  </p>
                </div>

                {profileSaved && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500 text-emerald-800 dark:text-[#00DD9E] text-xs font-bold flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>¡Firma y créditos actualizados correctamente!</span>
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="p-5 sm:p-6 rounded-2xl aeroglass-card border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#001E4D]/95 space-y-4 shadow-lg text-xs">
                  
                  {/* Vista Previa de la Tarjeta de Créditos */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Vista Previa de tu Firma en las Notas de Prensa:
                    </label>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#001438] border border-slate-200 dark:border-[#00DD9E]/30 flex items-center space-x-3.5">
                      {session?.avatar ? (
                        <img src={session.avatar} alt="" className="w-12 h-12 rounded-xl object-cover border-2 border-[#00DD9E]/40" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-[#001E4D] text-[#00DD9E] font-black flex items-center justify-center text-lg border border-[#00DD9E]/40">
                          {session?.name?.charAt(0) || 'P'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-black text-sm text-slate-900 dark:text-white truncate">{session?.name}</h4>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-700 dark:text-[#00DD9E]">
                            {profileForm.carruselCard || 'CNP Acreditado'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 whitespace-pre-line mt-0.5 line-clamp-2">
                          {profileForm.signatureText || `${profileForm.role || 'Periodista'} · ${profileForm.department || 'Información General'} · Neblina Stereo 105.5 FM`}
                        </p>
                        {(profileForm.instagramHandle || profileForm.twitterHandle) && (
                          <div className="flex items-center gap-3 mt-1 text-[11px] font-bold text-[#001E4D] dark:text-[#00DD9E]">
                            {profileForm.instagramHandle && <span>IG: {profileForm.instagramHandle}</span>}
                            {profileForm.twitterHandle && <span>X: {profileForm.twitterHandle}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Acreditación / CNP
                      </label>
                      <input
                        type="text"
                        value={profileForm.carruselCard}
                        onChange={e => setProfileForm(prev => ({ ...prev, carruselCard: e.target.value }))}
                        placeholder="Ej: CNP 18.421"
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Cargo / Rol Periodístico
                      </label>
                      <input
                        type="text"
                        value={profileForm.role}
                        onChange={e => setProfileForm(prev => ({ ...prev, role: e.target.value }))}
                        placeholder="Ej: Corresponsal Jefe, Redactor Especial"
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Usuario Instagram (@)
                      </label>
                      <input
                        type="text"
                        value={profileForm.instagramHandle}
                        onChange={e => setProfileForm(prev => ({ ...prev, instagramHandle: e.target.value }))}
                        placeholder="@tu_usuario_instagram"
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Usuario X / Twitter (@)
                      </label>
                      <input
                        type="text"
                        value={profileForm.twitterHandle}
                        onChange={e => setProfileForm(prev => ({ ...prev, twitterHandle: e.target.value }))}
                        placeholder="@tu_usuario_x"
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Texto de la Firma Oficial para las Notas de Prensa *
                    </label>
                    <textarea
                      rows="3"
                      required
                      value={profileForm.signatureText}
                      onChange={e => setProfileForm(prev => ({ ...prev, signatureText: e.target.value }))}
                      placeholder="Ej: Iván Alfonso Rivera | Corresponsal Jefe · CNP 18.421&#10;Cobertura e investigación para Neblina Stereo 105.5 FM."
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white leading-relaxed"
                    />
                    <span className="text-[10px] text-slate-500">
                      Este pie de firma acompañará tu nombre e imagen en el visor de lectura de todas tus notas publicadas.
                    </span>
                  </div>

                  <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-white/10">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-[#001E4D] text-[#00DD9E] dark:bg-[#00DD9E] dark:text-[#001E4D] font-bold text-xs transition flex items-center space-x-2 cursor-pointer hover:opacity-90 active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Guardar Firma & Créditos</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* VISTA 4: ESTADÍSTICAS Y RENDIMIENTO DE NOTAS DE PRENSA */}
            {activeTab === 'estadisticas' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">Estadísticas & Rendimiento de Prensa</h2>
                  <p className="text-xs text-slate-500">
                    Métricas de audiencia, lecturas acumuladas, viralidad y tasa de interacción de cada una de tus notas de prensa publicadas en Neblina Stereo 105.5 FM.
                  </p>
                </div>

                {/* Tarjetas de Métricas Globales del Periodista */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div className="p-4 rounded-2xl aeroglass-card border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#001E4D]/90 backdrop-blur-xl shadow-xs">
                    <div className="flex items-center justify-between text-slate-500 mb-1">
                      <span className="text-[11px] font-bold">Total Lecturas</span>
                      <Eye className="w-4 h-4 text-[#00DD9E]" />
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
                      {metrics.totalViews.toLocaleString('es-VE')}
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-[#00DD9E] font-bold">Visualizaciones en web</span>
                  </div>

                  <div className="p-4 rounded-2xl aeroglass-card border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#001E4D]/90 backdrop-blur-xl shadow-xs">
                    <div className="flex items-center justify-between text-slate-500 mb-1">
                      <span className="text-[11px] font-bold">Compartidos</span>
                      <Share2 className="w-4 h-4 text-sky-400" />
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
                      {(metrics.totalShares || 0).toLocaleString('es-VE')}
                    </div>
                    <span className="text-[10px] text-sky-600 dark:text-sky-300 font-bold">En redes sociales</span>
                  </div>

                  <div className="p-4 rounded-2xl aeroglass-card border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#001E4D]/90 backdrop-blur-xl shadow-xs">
                    <div className="flex items-center justify-between text-slate-500 mb-1">
                      <span className="text-[11px] font-bold">Promedio / Nota</span>
                      <TrendingUp className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
                      {(metrics.avgViewsPerNote || 0).toLocaleString('es-VE')}
                    </div>
                    <span className="text-[10px] text-amber-600 dark:text-amber-300 font-bold">Lectores promedio</span>
                  </div>

                  <div className="p-4 rounded-2xl aeroglass-card border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#001E4D]/90 backdrop-blur-xl shadow-xs">
                    <div className="flex items-center justify-between text-slate-500 mb-1">
                      <span className="text-[11px] font-bold">Efectividad Editorial</span>
                      <Award className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
                      {metrics.totalNotes > 0 ? `${Math.round((metrics.publishedCount / metrics.totalNotes) * 100)}%` : '100%'}
                    </div>
                    <span className="text-[10px] text-purple-600 dark:text-purple-300 font-bold">Aprobación y publicación</span>
                  </div>
                </div>

                {/* Tabla Detallada de Rendimiento por Nota */}
                <div className="rounded-2xl aeroglass-card border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#001E4D]/95 overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-[#00DD9E]" />
                      <h3 className="font-black text-sm text-slate-900 dark:text-white">Rendimiento Detallado por Publicación</h3>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500">
                      {notes.length} publicaciones analizadas
                    </span>
                  </div>

                  {(!metrics.notesStats || metrics.notesStats.length === 0) ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      No hay datos estadísticos para mostrar aún. Redacta tu primera nota para empezar el monitoreo.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-black/20 text-slate-500 border-b border-slate-200 dark:border-white/10">
                          <tr>
                            <th className="p-3.5 font-bold">Nota de Prensa</th>
                            <th className="p-3.5 font-bold text-center">Estado</th>
                            <th className="p-3.5 font-bold text-right">Lecturas</th>
                            <th className="p-3.5 font-bold text-right">Compartidos</th>
                            <th className="p-3.5 font-bold text-center">Difusión Redes</th>
                            <th className="p-3.5 font-bold text-center">Acción</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                          {metrics.notesStats.map((item, idx) => (
                            <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-white/5 transition">
                              <td className="p-3.5 max-w-xs">
                                <div className="flex items-center space-x-2.5">
                                  <span className="font-mono text-slate-400 font-bold text-xs w-4">#{idx + 1}</span>
                                  {item.image && (
                                    <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-slate-200 dark:border-white/10" />
                                  )}
                                  <div className="min-w-0">
                                    <h4 className="font-bold text-slate-900 dark:text-white truncate text-xs">{item.title}</h4>
                                    <p className="text-[10px] text-slate-400">{item.category} · {item.date}</p>
                                  </div>
                                </div>
                              </td>

                              <td className="p-3.5 text-center">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  item.status === 'published' ? 'bg-emerald-500/15 text-emerald-700 dark:text-[#00DD9E]' : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                                }`}>
                                  {item.status === 'published' ? 'Publicada' : 'En Revisión'}
                                </span>
                              </td>

                              <td className="p-3.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                                {item.statsViews.toLocaleString('es-VE')}
                              </td>

                              <td className="p-3.5 text-right font-mono font-bold text-sky-600 dark:text-sky-300">
                                {item.statsShares.toLocaleString('es-VE')}
                              </td>

                              <td className="p-3.5 text-center">
                                <div className="flex items-center justify-center space-x-2 text-[10px] font-bold">
                                  <span className="text-emerald-600 dark:text-emerald-400" title="WhatsApp">WA: {item.platforms?.whatsapp || 0}</span>
                                  <span className="text-sky-500" title="Telegram">TG: {item.platforms?.telegram || 0}</span>
                                  <span className="text-slate-800 dark:text-slate-200" title="X / Twitter">X: {item.platforms?.x || 0}</span>
                                </div>
                              </td>

                              <td className="p-3.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => setSharingNote(item)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-[#00DD9E] text-[11px] font-bold transition inline-flex items-center space-x-1 cursor-pointer"
                                  title="Compartir en Redes"
                                >
                                  <Share2 className="w-3 h-3" />
                                  <span>Difundir</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Cierre del Workspace y del Wrapper Principal */}
              </main>
            </div>
          </div>
        )}

      {/* Modal de Previsualización */}
      {previewNote && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl max-h-[85vh] bg-white dark:bg-[#001E4D] rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-slate-200 dark:border-white/10">
            <div className="p-4 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
              <span className="font-bold text-xs text-slate-500">Vista Previa de la Nota</span>
              <button onClick={() => setPreviewNote(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-3">
              {previewNote.image && (
                <img src={previewNote.image} alt={previewNote.title} className="w-full max-h-56 object-cover rounded-xl" />
              )}
              <h3 className="text-lg font-black text-slate-900 dark:text-white">{previewNote.title}</h3>
              <p className="text-xs text-slate-500">Por: {previewNote.journalistName || session?.name} · {previewNote.date}</p>
              <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed space-y-2" dangerouslySetInnerHTML={{ __html: previewNote.content || previewNote.excerpt }} />

              {/* Firma y Créditos del Periodista en Vista Previa */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-[#00DD9E]/20 flex items-center space-x-3 text-xs mt-4">
                {session?.avatar ? (
                  <img src={session.avatar} alt="" className="w-10 h-10 rounded-xl object-cover border border-[#00DD9E]/40" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-[#001E4D] text-[#00DD9E] font-black flex items-center justify-center">
                    {session?.name?.charAt(0) || 'P'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-slate-900 dark:text-white">{previewNote.journalistName || session?.name}</span>
                    <span className="text-[10px] text-slate-500 font-semibold">· {session?.carruselCard || 'CNP Activo'}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 whitespace-pre-line mt-0.5">
                    {session?.signatureText || 'Periodista y Corresponsal de Neblina Stereo 105.5 FM'}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-3 border-t border-slate-200 dark:border-white/10 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  const toShare = previewNote;
                  setPreviewNote(null);
                  setSharingNote(toShare);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-sm"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Compartir en Redes</span>
              </button>

              <button onClick={() => setPreviewNote(null)} className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-white/10 text-xs font-bold">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dedicado para Compartir en Redes Sociales */}
      {sharingNote && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-[#001E4D] rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-[#00DD9E]/30 flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-black/20">
              <div className="flex items-center space-x-2">
                <Share2 className="w-4 h-4 text-[#00DD9E]" />
                <h3 className="font-black text-sm text-slate-900 dark:text-white">Compartir Nota de Prensa en Redes</h3>
              </div>
              <button
                onClick={() => setSharingNote(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#00DD9E] bg-[#001E4D] dark:bg-[#00DD9E]/20 px-2 py-0.5 rounded">
                  {sharingNote.category || 'Noticia'}
                </span>
                <h4 className="font-black text-base text-slate-900 dark:text-white mt-1.5 line-clamp-2">
                  {sharingNote.title}
                </h4>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Por {sharingNote.journalistName || session?.name} · Incluye firma y créditos oficiales
                </p>
              </div>

              {/* Botonera de Redes Sociales Oficiales */}
              <div className="space-y-2">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">
                  Enviar directo a:
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {/* WhatsApp */}
                  <a
                    href={getNoteShareLinks(sharingNote).whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-sm"
                  >
                    <Emoji3D name="whatsapp" className="w-4 h-4 flex-shrink-0" alt="WhatsApp" />
                    <span>WhatsApp</span>
                  </a>

                  {/* Telegram */}
                  <a
                    href={getNoteShareLinks(sharingNote).telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 p-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold transition shadow-sm"
                  >
                    <Emoji3D name="telegram" className="w-4 h-4 flex-shrink-0" alt="Telegram" />
                    <span>Telegram</span>
                  </a>

                  {/* X / Twitter */}
                  <a
                    href={getNoteShareLinks(sharingNote).x}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 p-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold transition border border-white/20 shadow-sm"
                  >
                    <Emoji3D name="x" className="w-4 h-4 flex-shrink-0" alt="X" />
                    <span>X / Twitter</span>
                  </a>

                  {/* Facebook */}
                  <a
                    href={getNoteShareLinks(sharingNote).facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition shadow-sm"
                  >
                    <Emoji3D name="facebook" className="w-4 h-4 flex-shrink-0" alt="Facebook" />
                    <span>Facebook</span>
                  </a>

                  {/* Instagram Direct / Copiar para Stories */}
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(getNoteShareLinks(sharingNote).copyText);
                      setCopiedSummary(true);
                      setTimeout(() => setCopiedSummary(false), 2500);
                    }}
                    className="flex items-center justify-center space-x-2 p-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white font-bold transition shadow-sm cursor-pointer sm:col-span-2"
                  >
                    <Emoji3D name="instagram" className="w-4 h-4 flex-shrink-0" alt="Instagram" />
                    <span>{copiedSummary ? '¡Texto Copiado para IG!' : 'Copiar para Instagram Stories'}</span>
                  </button>
                </div>
              </div>

              {/* Copiar Enlace Directo */}
              <div className="pt-3 border-t border-slate-200 dark:border-white/10 space-y-2">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">
                  Enlace público de la nota:
                </span>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={getNoteShareLinks(sharingNote).noteUrl || ''}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-black/30 border border-slate-300 dark:border-white/15 text-[11px] text-slate-700 dark:text-slate-300 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(getNoteShareLinks(sharingNote).noteUrl);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2500);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#001E4D] text-[#00DD9E] dark:bg-[#00DD9E] dark:text-[#001E4D] font-bold text-xs flex items-center space-x-1.5 shadow-sm cursor-pointer shrink-0"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-[#00DD9E]" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? '¡Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 flex justify-end">
              <button
                type="button"
                onClick={() => setSharingNote(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-white/10 text-xs font-bold text-slate-800 dark:text-white"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
