// Utilidad de detección de dispositivo para PWA Neblina Stereo 105.5 FM

export function detectDevice() {
  if (typeof window === 'undefined') {
    return { type: 'desktop', os: 'Desktop', isApple: false, isAndroid: false, isWindows: false, isMac: false, isIOS: false, isSmartTV: false };
  }

  const ua = navigator.userAgent || navigator.vendor || window.opera || '';
  const platform = navigator.platform || '';

  // 1. Detección de Smart TV (Tizen, webOS, Android TV, Apple TV, Roku, etc.)
  const isSmartTV = /SmartTV|Tizen|webOS|AppleTV|Android.*TV|BRAVIA|NetCast|Roku|HbbTV|GoogleTV/i.test(ua);
  if (isSmartTV) {
    const isAppleTV = /AppleTV/i.test(ua);
    const isAndroidTV = /Android.*TV|GoogleTV|BRAVIA/i.test(ua) || (!isAppleTV && /Android/i.test(ua));
    return {
      type: 'tv',
      os: isAppleTV ? 'Apple TV' : isAndroidTV ? 'Android TV' : 'Smart TV',
      isApple: isAppleTV,
      isAndroid: !isAppleTV,
      isWindows: false,
      isMac: false,
      isIOS: false,
      isSmartTV: true,
      isAppleTV,
      isAndroidTV: isAndroidTV || !isAppleTV
    };
  }

  // 2. Detección de Apple (iOS / iPadOS / macOS)
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isMac = /Macintosh|Mac OS X/.test(ua) && !isIOS;
  if (isIOS || isMac) {
    return {
      type: isIOS ? 'mobile' : 'desktop',
      os: isIOS ? 'Apple iOS' : 'Apple macOS',
      isApple: true,
      isAndroid: false,
      isWindows: false,
      isMac,
      isIOS,
      isSmartTV: false
    };
  }

  // 3. Detección de Android
  const isAndroid = /Android/i.test(ua);
  if (isAndroid) {
    return {
      type: 'mobile',
      os: 'Android',
      isApple: false,
      isAndroid: true,
      isWindows: false,
      isMac: false,
      isIOS: false,
      isSmartTV: false
    };
  }

  // 4. Otros Sistemas de Escritorio (Windows / Linux)
  const isWindows = /Windows|Win32|Win64/i.test(ua) || /Win/i.test(platform);
  return {
    type: 'desktop',
    os: isWindows ? 'Windows' : 'PC',
    isApple: false,
    isAndroid: false,
    isWindows,
    isMac: false,
    isIOS: false,
    isSmartTV: false
  };
}

// Verifica si la aplicación ya se encuentra ejecutándose como app instalada (standalone)
export function isAppInstalled() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://')
  );
}
