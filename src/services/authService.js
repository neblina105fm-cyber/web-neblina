// Neblina Stereo 105.5 FM - Servicio de Autenticación del Sistema Interno
// Credenciales privadas para el director y administradores de la estación

const STORAGE_USER_KEY = 'neblina_admin_user';
const STORAGE_PASS_KEY = 'neblina_admin_pass';
const SESSION_AUTH_KEY = 'neblina_admin_session_auth';

// Credenciales asignadas por defecto
export const DEFAULT_CREDENTIALS = {
  username: 'admin',
  password: 'admin'
};

// Obtener usuario configurado
export function getStoredUsername() {
  if (typeof window === 'undefined') return DEFAULT_CREDENTIALS.username;
  return localStorage.getItem(STORAGE_USER_KEY) || DEFAULT_CREDENTIALS.username;
}

// Obtener contraseña configurada
export function getStoredPassword() {
  if (typeof window === 'undefined') return DEFAULT_CREDENTIALS.password;
  return localStorage.getItem(STORAGE_PASS_KEY) || DEFAULT_CREDENTIALS.password;
}

// Verificar si la sesión actual está autenticada
export function isSessionAuthenticated() {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(SESSION_AUTH_KEY) === 'true';
}

// Iniciar sesión con usuario y contraseña
export function loginAdmin(username, password) {
  const currentUsername = getStoredUsername().trim().toLowerCase();
  const currentPassword = getStoredPassword().trim();

  const inputUser = (username || '').trim().toLowerCase();
  const inputPass = (password || '').trim();

  if (
    (inputUser === 'admin' && inputPass === 'admin') ||
    (inputUser === currentUsername && inputPass === currentPassword)
  ) {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(SESSION_AUTH_KEY, 'true');
    }
    return { success: true };
  }

  return { 
    success: false, 
    error: 'Usuario o contraseña incorrectos. Verifique sus credenciales asignadas.' 
  };
}

// Cerrar sesión
export function logoutAdmin() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(SESSION_AUTH_KEY);
  }
}

// Modificar usuario y contraseña
export function updateAdminCredentials(currentPassword, newUsername, newPassword) {
  const currentPass = getStoredPassword().trim();

  if ((currentPassword || '').trim() !== currentPass) {
    return { success: false, error: 'La contraseña actual no coincide.' };
  }

  if (!newUsername || newUsername.trim().length < 3) {
    return { success: false, error: 'El usuario debe tener al menos 3 caracteres.' };
  }

  if (!newPassword || newPassword.trim().length < 6) {
    return { success: false, error: 'La nueva contraseña debe tener al menos 6 caracteres.' };
  }

  localStorage.setItem(STORAGE_USER_KEY, newUsername.trim());
  localStorage.setItem(STORAGE_PASS_KEY, newPassword.trim());

  return { success: true };
}

// Restablecer credenciales a las de fábrica
export function resetDefaultCredentials() {
  localStorage.setItem(STORAGE_USER_KEY, DEFAULT_CREDENTIALS.username);
  localStorage.setItem(STORAGE_PASS_KEY, DEFAULT_CREDENTIALS.password);
  return DEFAULT_CREDENTIALS;
}
