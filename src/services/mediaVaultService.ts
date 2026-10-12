import { WeddingMediaItem, WeddingMediaCategory } from '../types/wedding';
import { GOOGLE_SCRIPT_URL } from '../config/scriptUrl';

const STORAGE_KEY_VAULT = 'openlily_wedding_vault_media';
const STORAGE_KEY_LIKED = 'openlily_vault_liked_items';

/**
 * Convert a File object to a Base64 Data URL string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Extract Google Drive File ID from URL or item ID
 */
export function extractDriveId(url?: string, id?: string): string | null {
  if (url) {
    const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch) return idMatch[1];
    const dMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (dMatch) return dMatch[1];
    const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch) return fileMatch[1];
  }
  if (id && id.startsWith('gs-')) {
    const parts = id.split('-');
    if (parts.length >= 3) return parts.slice(2).join('-');
  }
  return null;
}

/**
 * Fetch all media items from Google Sheet backend, merging with local storage cache
 * and linking with local video stream endpoints when available.
 */
export async function fetchMediaVaultItems(
  defaultItems: WeddingMediaItem[] = []
): Promise<WeddingMediaItem[]> {
  let googleSheetItems: WeddingMediaItem[] = [];
  let localServerItems: WeddingMediaItem[] = [];
  let cachedItems: WeddingMediaItem[] = [];

  // 1. Read cached items from LocalStorage for instant rendering
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VAULT);
    if (raw) {
      cachedItems = JSON.parse(raw).filter((i: WeddingMediaItem) => !i.id?.startsWith('wm-init-'));
    }
  } catch (err) {
    console.warn('Could not read cached media items:', err);
  }

  // 2. Fetch live media from Google Apps Script / Google Sheet
  if (GOOGLE_SCRIPT_URL && !GOOGLE_SCRIPT_URL.includes('placeholder')) {
    try {
      const res = await fetch(`${GOOGLE_SCRIPT_URL}?action=getMemories`);
      if (res.ok) {
        const json = await res.json();
        if (json && json.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {
          googleSheetItems = json.data.filter((i: WeddingMediaItem) => !i.id?.startsWith('wm-init-'));
        }
      }
    } catch (err) {
      console.warn('Could not fetch memories from Google Script:', err);
    }
  }

  // 3. Always check local server endpoint if running in Vite dev to link local files
  try {
    const res = await fetch('/api/memories');
    if (res.ok) {
      const json = await res.json();
      if (json && json.success && Array.isArray(json.data)) {
        localServerItems = json.data.filter((i: WeddingMediaItem) => !i.id?.startsWith('wm-init-'));
      }
    }
  } catch {}

  // Enrich items with driveId, thumbnailUrl, and localUrl
  const enrichItem = (item: WeddingMediaItem): WeddingMediaItem => {
    const driveId = extractDriveId(item.url, item.id) || item.driveId;
    const thumbnailUrl = driveId
      ? `https://lh3.googleusercontent.com/d/${driveId}`
      : item.thumbnailUrl;

    // Check if we can find a matching local file from localServerItems
    let localUrl = item.localUrl;
    if (!localUrl && localServerItems.length > 0) {
      const match = localServerItems.find((l) => {
        if (l.url === item.url) return true;
        if (item.fileName && l.fileName && (l.fileName.includes(item.fileName) || item.fileName.includes(l.fileName))) return true;
        if (l.author && item.author && l.author.trim().toLowerCase() === item.author.trim().toLowerCase() && l.mediaType === item.mediaType) return true;
        return false;
      });
      if (match && match.url) {
        localUrl = match.url;
      }
    }

    return {
      ...item,
      driveId: driveId || undefined,
      thumbnailUrl: thumbnailUrl || undefined,
      localUrl: localUrl || undefined,
    };
  };

  // 4. Combine candidate lists with priority and intelligent deduplication
  const candidateList = [
    ...googleSheetItems,
    ...localServerItems,
    ...cachedItems,
    ...defaultItems,
  ].map(enrichItem);

  const merged = combineUniqueMediaItems(candidateList);

  // Keep localStorage cache updated with deduplicated list
  try {
    localStorage.setItem(STORAGE_KEY_VAULT, JSON.stringify(merged.slice(0, 50)));
  } catch (err) {
    console.warn('Could not update vault cache in localStorage:', err);
  }

  return merged;
}

/**
 * Determines whether two media entries represent the same upload/moment
 * across different sources (Google Drive, local Vite server, or localStorage cache).
 */
export function isSameMediaItem(a: WeddingMediaItem, b: WeddingMediaItem): boolean {
  if (!a || !b) return false;
  if (a.id && b.id && a.id === b.id) return true;

  const urlA = (a.url || '').trim();
  const urlB = (b.url || '').trim();
  if (urlA && urlB && urlA === urlB) return true;

  // 1. Check Google Drive ID match
  const driveA = a.driveId || extractDriveId(a.url, a.id);
  const driveB = b.driveId || extractDriveId(b.url, b.id);
  if (driveA && driveB && driveA === driveB) return true;

  // 2. Check local streaming URL match
  const localA = a.localUrl || (urlA.startsWith('/uploads/') ? urlA : '');
  const localB = b.localUrl || (urlB.startsWith('/uploads/') ? urlB : '');
  if (localA && localB && localA === localB) return true;

  // 3. Match by author and media type
  const authorA = (a.author || '').trim().toLowerCase();
  const authorB = (b.author || '').trim().toLowerCase();
  const mediaTypeA = (a.mediaType || '').toLowerCase();
  const mediaTypeB = (b.mediaType || '').toLowerCase();

  if (authorA && authorB && authorA === authorB && mediaTypeA === mediaTypeB) {
    // Check file names (ignoring 'moment_<timestamp>_', file extensions, and special characters)
    const normalizeName = (name?: string) =>
      (name || '')
        .replace(/^moment_\d+_/, '')
        .replace(/\.[^/.]+$/, '')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toLowerCase();

    const nameA = normalizeName(a.fileName);
    const nameB = normalizeName(b.fileName);
    if (nameA && nameB && (nameA.includes(nameB) || nameB.includes(nameA))) {
      return true;
    }

    // Check non-empty identical caption
    const capA = (a.caption || '').trim().toLowerCase();
    const capB = (b.caption || '').trim().toLowerCase();
    if (capA && capB && capA === capB) {
      return true;
    }

    // Check same category and upload timing
    const catA = (a.category || '').toLowerCase();
    const catB = (b.category || '').toLowerCase();
    if (catA === catB) {
      if (a.timestamp && b.timestamp) {
        const tA = new Date(a.timestamp).getTime();
        const tB = new Date(b.timestamp).getTime();
        if (!isNaN(tA) && !isNaN(tB) && Math.abs(tA - tB) < 15 * 60 * 1000) {
          return true;
        }
      }
      if (a.date && b.date && a.date === b.date && (!capA || !capB || capA === capB)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Deduplicate media list, merging local streaming URLs into Google Drive records
 */
export function combineUniqueMediaItems(list: WeddingMediaItem[]): WeddingMediaItem[] {
  const result: WeddingMediaItem[] = [];

  for (const item of list) {
    if (!item) continue;
    if (item.id && item.id.startsWith('wm-init-')) continue;

    const existingIndex = result.findIndex((existing) => isSameMediaItem(existing, item));
    if (existingIndex !== -1) {
      // Merge best properties: keep cloud URL if available, merge localUrl for fast video streaming
      const existing = result[existingIndex];
      const isExistingCloud = existing.url?.startsWith('http');
      const isItemCloud = item.url?.startsWith('http');

      const preferredUrl = isExistingCloud ? existing.url : isItemCloud ? item.url : existing.url;
      const mergedLocalUrl =
        existing.localUrl ||
        item.localUrl ||
        (existing.url?.startsWith('/uploads/') ? existing.url : undefined) ||
        (item.url?.startsWith('/uploads/') ? item.url : undefined);

      const mergedDriveId =
        existing.driveId ||
        item.driveId ||
        extractDriveId(existing.url, existing.id) ||
        extractDriveId(item.url, item.id);

      const mergedThumb =
        existing.thumbnailUrl ||
        item.thumbnailUrl ||
        (mergedDriveId ? `https://lh3.googleusercontent.com/d/${mergedDriveId}` : undefined);

      result[existingIndex] = {
        ...existing,
        url: preferredUrl,
        driveId: mergedDriveId || undefined,
        thumbnailUrl: mergedThumb || undefined,
        localUrl: mergedLocalUrl || undefined,
        caption: existing.caption || item.caption,
        likes: Math.max(existing.likes || 1, item.likes || 1),
      };
    } else {
      result.push({ ...item });
    }
  }

  return result;
}

/**
 * Upload a media file (image or short video) directly to Google Apps Script.
 * 1. Sends base64 to GOOGLE_SCRIPT_URL -> saves in Google Drive folder and appends to Google Sheet
 * 2. Receives Google Drive public CDN URL
 * 3. Saves locally for instant rendering
 */
export async function uploadMediaVaultItem(params: {
  file: File;
  author: string;
  relationship: string;
  category: WeddingMediaCategory;
  caption: string;
}): Promise<WeddingMediaItem> {
  const { file, author, relationship, category, caption } = params;
  const isVideo = file.type.startsWith('video');
  const mediaType: 'image' | 'video' = isVideo ? 'video' : 'image';

  // Read base64
  const base64Data = await fileToBase64(file);

  const fallbackId = `wm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const dateFormatted = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  let savedUrl = base64Data; // Default instant preview
  let savedFileName = file.name;
  let finalItem: WeddingMediaItem = {
    id: fallbackId,
    author: author.trim() || 'Wedding Guest',
    relationship: relationship.trim() || 'Guest',
    category: category || 'all',
    caption: caption.trim(),
    mediaType,
    url: savedUrl,
    fileName: savedFileName,
    date: 'Just now',
    timestamp: new Date().toISOString(),
    likes: 1,
  };

  // 1. Submit directly to Google Apps Script (Google Drive & Google Sheet)
  if (GOOGLE_SCRIPT_URL && !GOOGLE_SCRIPT_URL.includes('placeholder')) {
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          type: 'wedding_memory',
          author: finalItem.author,
          relationship: finalItem.relationship,
          category: finalItem.category,
          mediaType: finalItem.mediaType,
          fileName: file.name,
          fileType: file.type,
          base64Data: base64Data,
          caption: finalItem.caption,
          submittedAt: finalItem.timestamp,
        }),
      });

      if (response.ok) {
        const json = await response.json();
        if (json && json.status === 'success' && json.item) {
          finalItem = {
            ...json.item,
            url: json.url || json.item.url || savedUrl,
          };
          savedUrl = finalItem.url;
        }
      }
    } catch (sheetErr) {
      console.warn('Google Script upload request completed or mode fallback:', sheetErr);
    }
  }

  // 2. Also notify local Vite dev server if running
  try {
    fetch('/api/upload-media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        base64Data,
        author: finalItem.author,
        relationship: finalItem.relationship,
        category: finalItem.category,
        caption: finalItem.caption,
      }),
    }).catch(() => {});
  } catch {}

  // 3. Save to localStorage cache for instant fast display
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VAULT);
    const existing: WeddingMediaItem[] = raw ? JSON.parse(raw) : [];
    const itemToCache = {
      ...finalItem,
      url: savedUrl.length > 500000 ? savedUrl.substring(0, 500) : savedUrl,
    };
    localStorage.setItem(STORAGE_KEY_VAULT, JSON.stringify([itemToCache, ...existing]));
  } catch (storageErr) {
    console.warn('LocalStorage save fallback:', storageErr);
  }

  return finalItem;
}

export interface BulkUploadProgress {
  currentIndex: number;
  total: number;
  currentFileName: string;
  status: 'uploading' | 'success' | 'error';
  item?: WeddingMediaItem;
  error?: string;
}

/**
 * Bulk upload multiple media files sequentially with live progress callbacks
 */
export async function bulkUploadMediaVaultItems(params: {
  files: File[];
  author: string;
  relationship: string;
  category: WeddingMediaCategory;
  caption?: string;
  onProgress?: (progress: BulkUploadProgress) => void;
}): Promise<{
  successful: WeddingMediaItem[];
  failed: { fileName: string; error: string }[];
}> {
  const { files, author, relationship, category, caption, onProgress } = params;
  const successful: WeddingMediaItem[] = [];
  const failed: { fileName: string; error: string }[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    onProgress?.({
      currentIndex: i + 1,
      total: files.length,
      currentFileName: file.name,
      status: 'uploading',
    });

    try {
      const item = await uploadMediaVaultItem({
        file,
        author,
        relationship,
        category,
        caption: caption || '',
      });
      successful.push(item);
      onProgress?.({
        currentIndex: i + 1,
        total: files.length,
        currentFileName: file.name,
        status: 'success',
        item,
      });
    } catch (err: any) {
      const errorMsg = err?.message || 'Upload failed';
      failed.push({ fileName: file.name, error: errorMsg });
      onProgress?.({
        currentIndex: i + 1,
        total: files.length,
        currentFileName: file.name,
        status: 'error',
        error: errorMsg,
      });
    }
  }

  return { successful, failed };
}

/**
 * Increment like count on a media item
 */
export async function likeMediaVaultItem(id: string): Promise<boolean> {
  try {
    const rawLiked = localStorage.getItem(STORAGE_KEY_LIKED);
    const likedSet: string[] = rawLiked ? JSON.parse(rawLiked) : [];
    if (likedSet.includes(id)) return false; // Already liked

    likedSet.push(id);
    localStorage.setItem(STORAGE_KEY_LIKED, JSON.stringify(likedSet));

    // Notify backend
    fetch('/api/like-memory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).catch(() => {});

    return true;
  } catch {
    return false;
  }
}

/**
 * Export all media memories directly into a Microsoft Excel compatible CSV file (.csv with UTF-8 BOM)
 */
export function exportVaultToExcel(items: WeddingMediaItem[]) {
  const sanitize = (val: string | number | undefined) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headers = [
    'Uploaded Date/Time',
    'Guest Name',
    'Relationship to Couple',
    'Category',
    'Media Type',
    'File Name',
    'Direct Public Media URL',
    'Caption / Note',
    'Likes Count',
  ];

  const rows = items.map((item) => [
    sanitize(item.timestamp || item.date),
    sanitize(item.author),
    sanitize(item.relationship),
    sanitize(item.category),
    sanitize(item.mediaType.toUpperCase()),
    sanitize(item.fileName || 'wedding_upload'),
    sanitize(item.url.startsWith('http') ? item.url : `${window.location.origin}${item.url}`),
    sanitize(item.caption),
    sanitize(item.likes),
  ]);

  const csvContent =
    '\uFEFF' +
    [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `Lydia_Ope_Wedding_Vault_Media_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
