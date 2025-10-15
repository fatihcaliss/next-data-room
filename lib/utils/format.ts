import { format } from 'date-fns';

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function formatDate(dateString: string): string {
  return format(new Date(dateString), 'MM/dd/yyyy hh:mm a');
}

export function formatDateShort(dateString: string): string {
  return format(new Date(dateString), 'MM/dd/yyyy');
}
