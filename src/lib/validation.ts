export type ExternalUrlKind = 'facebook' | 'youtube' | 'drive';

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

function normalizeUrl(raw: string): URL | null {
  const value = raw.trim();
  if (!value) return null;

  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  try {
    const url = new URL(withProtocol);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    url.protocol = 'https:';
    url.username = '';
    url.password = '';
    return url;
  } catch {
    return null;
  }
}

function isAllowedHost(hostname: string, kind: ExternalUrlKind): boolean {
  const host = hostname.toLowerCase();

  switch (kind) {
    case 'facebook':
      return ['facebook.com', 'www.facebook.com', 'm.facebook.com', 'fb.watch'].includes(host);
    case 'youtube':
      return ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'].includes(host);
    case 'drive':
      return host === 'drive.google.com';
  }
}

export function validateOptionalExternalUrl(raw: string, kind: ExternalUrlKind): { normalized: string; error?: string } {
  if (!raw.trim()) return { normalized: '' };

  const url = normalizeUrl(raw);
  if (!url || !isAllowedHost(url.hostname, kind)) {
    const label = kind === 'drive' ? 'Google Drive' : kind === 'youtube' ? 'YouTube' : 'Facebook';
    return { normalized: '', error: `Invalid ${label} URL.` };
  }

  return { normalized: url.toString() };
}

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return 'Only JPG, PNG, WEBP, and GIF images are allowed.';
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return 'Image must be 10MB or smaller.';
  }

  return null;
}

export function validateRequiredText(value: string, label: string): string | null {
  if (!value.trim()) {
    return `${label} is required.`;
  }

  return null;
}

export function validateDateInput(value: string, label = 'Date'): string | null {
  if (!value.trim()) {
    return `${label} is required.`;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `${label} must use YYYY-MM-DD format.`;
  }

  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return `${label} is invalid.`;
  }

  return null;
}

export function getYouTubeEmbedUrl(raw: string | undefined): string | null {
  if (!raw) return null;

  const { normalized } = validateOptionalExternalUrl(raw, 'youtube');
  if (!normalized) return null;

  const url = new URL(normalized);
  const host = url.hostname.toLowerCase();
  let videoId = '';

  if (host === 'youtu.be') {
    videoId = url.pathname.replace(/^\/+/, '').split('/')[0] || '';
  } else if (url.pathname.startsWith('/embed/')) {
    videoId = url.pathname.split('/embed/')[1]?.split('/')[0] || '';
  } else if (url.pathname.startsWith('/shorts/')) {
    videoId = url.pathname.split('/shorts/')[1]?.split('/')[0] || '';
  } else {
    videoId = url.searchParams.get('v') || '';
  }

  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}

export function getGoogleDriveEmbedUrl(raw: string | undefined): string | null {
  if (!raw) return null;

  const { normalized } = validateOptionalExternalUrl(raw, 'drive');
  if (!normalized) return null;

  const url = new URL(normalized);
  const match = url.pathname.match(/\/file\/d\/([^/]+)/);
  const fileId = match?.[1];

  if (fileId) {
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }

  if (url.pathname.endsWith('/preview')) {
    return url.toString();
  }

  return null;
}

export function getFacebookPluginUrl(raw: string | undefined): string | null {
  if (!raw) return null;

  const { normalized } = validateOptionalExternalUrl(raw, 'facebook');
  if (!normalized) return null;

  const url = new URL(normalized);
  const path = url.pathname.toLowerCase();
  const isVideo = url.hostname.toLowerCase() === 'fb.watch' || path.includes('/videos/') || path.includes('/watch');
  const pluginType = isVideo ? 'video' : 'post';

  return `https://www.facebook.com/plugins/${pluginType}.php?href=${encodeURIComponent(normalized)}&show_text=true&width=500`;
}
