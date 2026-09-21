/**
 * Helpers para formateo y resolución del peso (tamaño) de archivos descargables.
 */

export function formatearBytes(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return '';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const valor = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
  return `${valor} ${sizes[i]}`;
}
