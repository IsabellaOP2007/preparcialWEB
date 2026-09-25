/**
 * Genera un avatar en formato SVG (data URI) con las iniciales del actor y colores distintivos.
 * No requiere peticiones externas y nunca falla por bloqueos de red o adblockers.
 */
export function getInitialsAvatarSvg(name: string): string {
  const cleanName = (name || 'Actor').trim();
  const initials = cleanName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');

  const palette = [
    { bg: '#1e3a8a', fg: '#ffffff' },
    { bg: '#065f46', fg: '#ffffff' },
    { bg: '#831843', fg: '#ffffff' },
    { bg: '#701a75', fg: '#ffffff' },
    { bg: '#9a3412', fg: '#ffffff' },
    { bg: '#155e75', fg: '#ffffff' },
    { bg: '#374151', fg: '#ffffff' },
  ];

  let hash = 0;
  for (let i = 0; i < cleanName.length; i++) {
    hash = (cleanName.charCodeAt(i) + ((hash << 5) - hash)) % palette.length;
  }
  const color = palette[Math.abs(hash)];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="220" viewBox="0 0 300 220">
    <rect width="100%" height="100%" fill="${color.bg}"/>
    <circle cx="150" cy="80" r="45" fill="rgba(255,255,255,0.15)"/>
    <text x="150" y="93" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="36" font-weight="700" fill="${color.fg}" text-anchor="middle">${initials || 'A'}</text>
    <text x="150" y="155" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="rgba(255,255,255,0.9)" text-anchor="middle">${cleanName.length > 24 ? cleanName.substring(0, 22) + '...' : cleanName}</text>
    <text x="150" y="180" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="rgba(255,255,255,0.6)" text-anchor="middle">Fotografía no disponible</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Normaliza la URL de la imagen del actor.
 * Convierte enlaces http://dummyimage.com a https:// para evitar bloqueos por contenido mixto.
 */
export function normalizePhotoUrl(url: string | undefined, name: string): string {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return getInitialsAvatarSvg(name);
  }

  const trimmed = url.trim();

  // Si viene con http:// en dummyimage, forzar https://
  if (trimmed.startsWith('http://dummyimage.com')) {
    return trimmed.replace('http://', 'https://');
  }

  return trimmed;
}
