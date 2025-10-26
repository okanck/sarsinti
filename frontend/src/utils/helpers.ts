import { format, formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

// Deprem büyüklüğüne göre renk döndür
export const getMagnitudeColor = (magnitude: number): string => {
  if (magnitude < 2) return '#10b981'; // green-500
  if (magnitude < 3) return '#84cc16'; // lime-500
  if (magnitude < 4) return '#eab308'; // yellow-500
  if (magnitude < 5) return '#f97316'; // orange-500
  if (magnitude < 6) return '#ef4444'; // red-500
  if (magnitude < 7) return '#dc2626'; // red-600
  return '#991b1b'; // red-800
};

// Deprem büyüklüğüne göre marker boyutu
export const getMagnitudeSize = (magnitude: number): number => {
  if (magnitude < 2) return 4;
  if (magnitude < 3) return 6;
  if (magnitude < 4) return 8;
  if (magnitude < 5) return 12;
  if (magnitude < 6) return 16;
  if (magnitude < 7) return 20;
  return 24;
};

// Deprem büyüklüğüne göre kategori
export const getMagnitudeCategory = (magnitude: number): string => {
  if (magnitude < 2) return 'Mikroskobik';
  if (magnitude < 3) return 'Çok Küçük';
  if (magnitude < 4) return 'Küçük';
  if (magnitude < 5) return 'Hafif';
  if (magnitude < 6) return 'Orta';
  if (magnitude < 7) return 'Güçlü';
  if (magnitude < 8) return 'Büyük';
  return 'Çok Büyük';
};

// Tarih formatlama
export const formatDate = (date: string): string => {
  return format(new Date(date), 'dd MMMM yyyy HH:mm', { locale: tr });
};

// Göreceli tarih (Örn: "2 saat önce")
export const formatRelativeDate = (date: string): string => {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: tr });
};

// Sayı formatlama
export const formatNumber = (num: number, decimals: number = 0): string => {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

// Derinlik kategorisi
export const getDepthCategory = (depth: number): string => {
  if (depth < 10) return 'Sığ';
  if (depth < 70) return 'Orta';
  return 'Derin';
};
