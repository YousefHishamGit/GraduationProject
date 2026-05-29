import { environment } from '../../environments/environment';

export function resolveMediaUrl(path?: string | null): string {
  if (!path) {
    return '';
  }

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const baseUrl = environment.apiUrl.replace('/api', '');
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}
