import { MenuItem } from './gemini';

export interface PendingScan {
  id: string;
  imageData: string;
  timestamp: number;
}

export interface CachedTranslation {
  id: string;
  originalText: string;
  translatedText: string;
  menuItems: MenuItem[];
  imageData: string;
  timestamp: number;
}

const PENDING_SCANS_KEY = 'restroGuide_pendingScans';
const CACHED_TRANSLATIONS_KEY = 'restroGuide_cachedTranslations';

export function savePendingScan(imageData: string): void {
  const scans = getPendingScans();
  const newScan: PendingScan = {
    id: Date.now().toString(),
    imageData,
    timestamp: Date.now(),
  };
  localStorage.setItem(PENDING_SCANS_KEY, JSON.stringify([newScan, ...scans]));
}

export function getPendingScans(): PendingScan[] {
  const stored = localStorage.getItem(PENDING_SCANS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function removePendingScan(id: string): void {
  const scans = getPendingScans().filter(s => s.id !== id);
  localStorage.setItem(PENDING_SCANS_KEY, JSON.stringify(scans));
}

export function saveCachedTranslation(menuItems: MenuItem[], imageData: string, originalText: string, translatedText: string): void {
  const cache = getCachedTranslations();
  const newCache: CachedTranslation = {
    id: Date.now().toString(),
    menuItems,
    imageData,
    originalText,
    translatedText,
    timestamp: Date.now(),
  };
  // Keep only last 10 to avoid quota limits
  const updatedCache = [newCache, ...cache].slice(0, 10);
  localStorage.setItem(CACHED_TRANSLATIONS_KEY, JSON.stringify(updatedCache));
}

export function getCachedTranslations(): CachedTranslation[] {
  const stored = localStorage.getItem(CACHED_TRANSLATIONS_KEY);
  return stored ? JSON.parse(stored) : [];
}
