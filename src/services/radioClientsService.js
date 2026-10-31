// Neblina Stereo 105.5 FM - CRM de Clientes Publicitarios y Sistema de Cobranzas Radial
// Control de pautas en vivo, cuñas rotativas, redes sociales, banners web y conciliación con Tasa BCV

const STORAGE_CLIENTS_KEY = 'neblina_radio_clients_db';
const STORAGE_GENRES_KEY = 'neblina_client_genres_db';
const STORAGE_PAYMENTS_KEY = 'neblina_client_payments_db';
const STORAGE_BANK_PROFILES_KEY = 'neblina_bank_profiles_db';

// Perfiles de Cuentas Bancarias y Pago Móvil predeterminados para Facturación y Cobranzas
export const INITIAL_BANK_PROFILES = [
  {
    id: 'bank_admin_bdv',
    label: 'Cuenta Oficial Dirección - Banco de Venezuela',
    bankName: 'Banco de Venezuela (0102)',
    accountNumber: '0102-0123-45-0000987654',
    accountType: 'Corriente / Pago Móvil',
    phone: '0424-7459774',
    cedulaRif: 'J-31489201-4',
    holderName: 'Neblina Stereo 105.5 FM C.A.',
    ownerType: 'admin',
    staffId: ''
  },
  {
    id: 'bank_admin_banesco',
    label: 'Cuenta Oficial Dirección - Banesco',
    bankName: 'Banesco Banco Universal (0134)',
    accountNumber: '0134-0345-67-3451098231',
    accountType: 'Corriente / Pago Móvil',
    phone: '0424-7459774',
    cedulaRif: 'J-31489201-4',
    holderName: 'Neblina Stereo 105.5 FM C.A.',
    ownerType: 'admin',
    staffId: ''
  },
  {
    id: 'bank_admin_mercantil',
    label: 'Cuenta Oficial Dirección - Mercantil',
    bankName: 'Banco Mercantil (0105)',
    accountNumber: '0105-0089-12-1089456321',
    accountType: 'Corriente / Pago Móvil',
    phone: '0414-7521098',
    cedulaRif: 'J-31489201-4',
    holderName: 'Administración Neblina 105.5 FM',
    ownerType: 'admin',
    staffId: ''
  },
  {
    id: 'bank_staff_carlos',
    label: 'Pago Móvil Locutor - Carlos Rondón',
    bankName: 'Banco Provincial (0108)',
    accountNumber: '0108-0098-76-0100234567',
    accountType: 'Pago Móvil / Corriente',
    phone: '0424-7459774',
    cedulaRif: 'V-14.821.904',
    holderName: 'Carlos "El Oso" Rondón',
    ownerType: 'staff',
    staffId: 'staff_carlos_rondon'
  }
];

export function getAllBankProfiles(filterStaffId = null) {
  let list = INITIAL_BANK_PROFILES;
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_BANK_PROFILES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed;
        }
      }
    } catch (e) {}
  }
  if (filterStaffId) {
    return list.filter(b => b.ownerType === 'admin' || String(b.staffId) === String(filterStaffId));
  }
  return list;
}

export function saveAllBankProfiles(profiles) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_BANK_PROFILES_KEY, JSON.stringify(profiles));
    notifyClientsChanged();
  } catch (e) {}
}

export function saveBankProfile(profileData) {
  const current = getAllBankProfiles();
  const clean = {
    id: profileData.id || `bank_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    label: (profileData.label || profileData.bankName || 'Cuenta Receptora').trim(),
    bankName: (profileData.bankName || '').trim(),
    accountNumber: (profileData.accountNumber || '').trim(),
    accountType: (profileData.accountType || 'Pago Móvil / Transferencia').trim(),
    phone: (profileData.phone || '').trim(),
    cedulaRif: (profileData.cedulaRif || '').trim(),
    holderName: (profileData.holderName || '').trim(),
    ownerType: profileData.ownerType || 'admin',
    staffId: profileData.staffId || ''
  };

  const exists = current.some(b => b.id === clean.id);
  const updated = exists
    ? current.map(b => b.id === clean.id ? clean : b)
    : [clean, ...current];

  saveAllBankProfiles(updated);
  return clean;
}

export function deleteBankProfile(profileId) {
  const current = getAllBankProfiles();
  const updated = current.filter(b => b.id !== profileId);
  saveAllBankProfiles(updated);
  return updated;
}

// Categorías / Géneros de establecimientos iniciales (modificables, eliminables y extensibles)
export const INITIAL_GENRES = [
  { id: 'gen_restaurantes', name: 'Restaurantes & Gastronomía', emoji: 'plate' },
  { id: 'gen_discotecas', name: 'Discotecas, Bares & Lounges', emoji: 'sparkles' },
  { id: 'gen_billares', name: 'Billares, Bowling & Recreación', emoji: 'fire' },
  { id: 'gen_ropa', name: 'Tiendas de Ropa, Calzado & Moda', emoji: 'star' },
  { id: 'gen_internet', name: 'Servicios de Internet & Telecomunicaciones', emoji: 'radio' },
  { id: 'gen_hoteles', name: 'Hoteles, Cabañas & Posadas Turísticas', emoji: 'building' },
  { id: 'gen_supermercados', name: 'Supermercados, Fruterías & Abastos', emoji: 'check' },
  { id: 'gen_salud', name: 'Salud, Farmacias & Clínicas', emoji: 'shield' },
  { id: 'gen_automotriz', name: 'Talleres, Autoperiquitos & Repuestos', emoji: 'settings' }
];

// Opciones de tipo de publicidad (compatibilidad)
export const AD_PACKAGES = [
  { id: 'en_vivo', label: 'En Vivo en Programas (Menciones)', badge: 'En Vivo' },
  { id: 'rotativas', label: 'Cuñas Rotativas (Pauta Diaria)', badge: 'Rotativa' },
  { id: 'redes', label: 'Redes Sociales (WhatsApp, IG, FB, TikTok)', badge: 'Redes' },
  { id: 'web', label: 'Página Web (Banners Imágenes / Videos)', badge: 'Web' },
  { id: 'combo', label: 'Combo Total (Radio + Web + Redes)', badge: 'Full Pack' }
];

// Generador de estructura de servicios publicitarios detallados
export function getDefaultClientServices(legacyPackageType = []) {
  const hasEnVivo = legacyPackageType.includes('en_vivo') || legacyPackageType.includes('combo');
  const hasRotativas = legacyPackageType.includes('rotativas') || legacyPackageType.includes('combo');
  const hasRedes = legacyPackageType.includes('redes') || legacyPackageType.includes('combo');
  const hasWeb = legacyPackageType.includes('web') || legacyPackageType.includes('combo');

  return {
    enVivo: hasEnVivo,
    rotativa: hasRotativas,
    redes: {
      enabled: hasRedes,
      whatsapp: {
        enabled: hasRedes,
        difusion: hasRedes,       // Grupos de difusión
        publicitarios: hasRedes,  // Grupos publicitarios (más no informativos)
        historias: hasRedes       // Historias / Estados
      },
      instagram: {
        enabled: hasRedes,
        historias: hasRedes       // Historias de Instagram
      },
      facebook: {
        enabled: false,
        historias: false          // Historias de Facebook
      },
      tiktok: {
        enabled: false,
        historias: false          // Historias de TikTok
      }
    },
    web: {
      enabled: hasWeb,
      imagenes: hasWeb,           // Banners de imágenes
      videos: false               // Banners de videos
    }
  };
}

// Extraer tags resumen para retrocompatibilidad
export function derivePackageTypeFromServices(services) {
  if (!services) return [];
  const tags = [];
  if (services.enVivo) tags.push('en_vivo');
  if (services.rotativa) tags.push('rotativas');
  if (
    services.redes?.enabled || 
    services.redes?.whatsapp?.enabled || 
    services.redes?.instagram?.enabled || 
    services.redes?.facebook?.enabled || 
    services.redes?.tiktok?.enabled
  ) {
    tags.push('redes');
  }
  if (services.web?.enabled || services.web?.imagenes || services.web?.videos) {
    tags.push('web');
  }
  return tags;
}

// Clientes semilla de muestra realistas para demostración y verificación
export const INITIAL_CLIENTS = [];

// Notificar cambios globales en el CRM de clientes
function notifyClientsChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('neblina_clients_updated', { detail: { timestamp: Date.now() } }));
  }
}

// ==========================================
// GESTIÓN DE GÉNEROS / CATEGORÍAS DE LOCALES
// ==========================================
export function getAllGenres() {
  if (typeof window === 'undefined') return INITIAL_GENRES;
  try {
    const raw = localStorage.getItem(STORAGE_GENRES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return INITIAL_GENRES;
}

export function saveAllGenres(genres) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_GENRES_KEY, JSON.stringify(genres));
    notifyClientsChanged();
  } catch (e) {}
}

export function addGenre(name, emoji = 'folder') {
  if (!name || !name.trim()) return null;
  const current = getAllGenres();
  const slug = 'gen_' + name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '_').substring(0, 20);
  const newGenre = {
    id: `${slug}_${Date.now().toString(36)}`,
    name: name.trim(),
    emoji
  };
  const updated = [...current, newGenre];
  saveAllGenres(updated);
  return newGenre;
}

export function deleteGenre(genreId) {
  const current = getAllGenres();
  const updated = current.filter(g => g.id !== genreId);
  saveAllGenres(updated);
  return updated;
}

// ==========================================
// GESTIÓN DE CLIENTES DE LA RADIO
// ==========================================
export function getAllClients() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_CLIENTS_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map(c => ({
          ...c,
          archived: Boolean(c.archived)
        }));
      }
    }
  } catch (e) {}
  return [];
}

export function saveAllClients(clients) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_CLIENTS_KEY, JSON.stringify(clients));
    notifyClientsChanged();
  } catch (e) {}
}

export function saveClient(clientData) {
  const current = getAllClients();
  let updated;

  const services = clientData.services || getDefaultClientServices(clientData.packageType || []);
  const packageType = derivePackageTypeFromServices(services);
  const normalizedData = {
    ...clientData,
    services,
    packageType,
    logoUrl: clientData.logoUrl || '',
    businessDescription: clientData.businessDescription || '',
    locutorId: clientData.locutorId || '',
    locutorName: clientData.locutorName || '',
    archived: Boolean(clientData.archived)
  };

  if (normalizedData.id) {
    const exists = current.some(c => String(c.id) === String(normalizedData.id));
    if (exists) {
      updated = current.map(c => String(c.id) === String(normalizedData.id) ? { ...c, ...normalizedData, updatedAt: new Date().toISOString() } : c);
    } else {
      updated = [normalizedData, ...current];
    }
  } else {
    const newClient = {
      ...normalizedData,
      id: `cli_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      paymentStatus: normalizedData.paymentStatus || 'pending',
      trashed: false,
      createdAt: new Date().toISOString()
    };
    updated = [newClient, ...current];
  }

  saveAllClients(updated);
  return updated;
}

export function archiveClient(clientId) {
  const current = getAllClients();
  const updated = current.map(c => {
    if (String(c.id) === String(clientId)) {
      return { ...c, archived: true, archivedAt: new Date().toISOString() };
    }
    return c;
  });
  saveAllClients(updated);
  return updated;
}

export function unarchiveClient(clientId) {
  const current = getAllClients();
  const updated = current.map(c => {
    if (String(c.id) === String(clientId)) {
      return { ...c, archived: false, archivedAt: null };
    }
    return c;
  });
  saveAllClients(updated);
  return updated;
}

export function trashClient(clientId) {
  const current = getAllClients();
  const updated = current.map(c => {
    if (String(c.id) === String(clientId)) {
      return { ...c, trashed: true, trashedAt: new Date().toISOString() };
    }
    return c;
  });
  saveAllClients(updated);
  return updated;
}

export function restoreClient(clientId) {
  const current = getAllClients();
  const updated = current.map(c => {
    if (String(c.id) === String(clientId)) {
      return { ...c, trashed: false, trashedAt: null };
    }
    return c;
  });
  saveAllClients(updated);
  return updated;
}

export function deleteClientPermanently(clientId) {
  const current = getAllClients();
  const updated = current.filter(c => String(c.id) !== String(clientId));
  saveAllClients(updated);
  return updated;
}

export function emptyClientsTrash() {
  const current = getAllClients();
  const updated = current.filter(c => !c.trashed);
  saveAllClients(updated);
  return updated;
}

// ==========================================
// HISTORIAL DE PAGOS Y COBRANZAS
// ==========================================
export function getAllPayments() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_PAYMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function recordClientPayment({
  clientId,
  clientName,
  businessName,
  amountUsd,
  amountBs,
  rateBcv,
  paymentMethod = 'pago_movil_bcv',
  reference = '',
  notes = '',
  date = null,
  locutorId = '',
  locutorName = '',
  paymentType = 'cobro', // 'cobro' (ingreso recibido de cliente) | 'pago' (egreso, abono o liquidación)
  bankProfileId = '',
  paymentDetails = null
}) {
  const allPayments = getAllPayments();
  const newPayment = {
    id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    clientId,
    clientName,
    businessName,
    amountUsd: Number(amountUsd) || 0,
    amountBs: Number(amountBs) || 0,
    rateBcv: Number(rateBcv) || 0,
    paymentMethod,
    reference: reference.trim(),
    notes: notes.trim(),
    locutorId: locutorId || '',
    locutorName: locutorName || '',
    paymentType,
    bankProfileId: bankProfileId || '',
    paymentDetails: paymentDetails || null,
    date: date || new Date().toISOString()
  };

  const updatedPayments = [newPayment, ...allPayments];
  try {
    localStorage.setItem(STORAGE_PAYMENTS_KEY, JSON.stringify(updatedPayments));
  } catch (e) {}

  // Si es un cobro a cliente, actualizar estado del cliente a 'paid'
  if (paymentType === 'cobro' && clientId) {
    const allClients = getAllClients();
    const updatedClients = allClients.map(c => {
      if (String(c.id) === String(clientId)) {
        return {
          ...c,
          paymentStatus: 'paid',
          lastPaymentDate: newPayment.date.split('T')[0]
        };
      }
      return c;
    });
    saveAllClients(updatedClients);
  }

  return newPayment;
}
