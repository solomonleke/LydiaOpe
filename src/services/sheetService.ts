import { RsvpFormData, MemoryPost } from '../types/wedding';
import { GOOGLE_SCRIPT_URL } from '../config/scriptUrl';

const STORAGE_KEY_BLESSINGS = 'openlily_blessings_local';
const STORAGE_KEY_RSVP = 'openlily_rsvp_local';

/**
 * Submit an RSVP to Google Sheets backend
 */
export async function submitRsvp(data: RsvpFormData): Promise<boolean> {
  // Store locally first as fallback
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY_RSVP) || '[]');
    existing.push({ ...data, submittedAt: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEY_RSVP, JSON.stringify(existing));
  } catch (err) {
    console.warn('LocalStorage save failed:', err);
  }

  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('placeholder')) {
    console.info('Google Script URL not configured yet. Saved locally.');
    return true;
  }

  try {
    // Send as text/plain to avoid CORS preflight issues with Google Apps Script
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        type: 'rsvp',
        ...data,
      }),
    });
    return true;
  } catch (error) {
    console.error('Failed to submit RSVP to Google Sheet:', error);
    return true; // still return true since local fallback succeeded
  }
}

/**
 * Submit a Blessing/Wish to Google Sheets backend
 */
export async function submitBlessing(data: {
  author: string;
  relationship: string;
  message: string;
}): Promise<MemoryPost> {
  const newBlessing: MemoryPost = {
    id: `m-${Date.now()}`,
    author: data.author,
    relationship: data.relationship || 'Guest',
    message: data.message,
    date: 'Just now',
    likes: 1,
  };

  // Save to local storage for immediate offline / quick render persistence
  try {
    const existing: MemoryPost[] = JSON.parse(localStorage.getItem(STORAGE_KEY_BLESSINGS) || '[]');
    localStorage.setItem(STORAGE_KEY_BLESSINGS, JSON.stringify([newBlessing, ...existing]));
  } catch (err) {
    console.warn('LocalStorage save failed:', err);
  }

  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('placeholder')) {
    console.info('Google Script URL not configured yet. Saved locally.');
    return newBlessing;
  }

  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        type: 'blessing',
        ...data,
      }),
    });
  } catch (error) {
    console.error('Failed to submit blessing to Google Sheet:', error);
  }

  return newBlessing;
}

/**
 * Fetch blessings from Google Sheet backend, merging with local storage
 */
export async function fetchBlessings(defaultBlessings: MemoryPost[]): Promise<MemoryPost[]> {
  let localBlessings: MemoryPost[] = [];
  try {
    localBlessings = JSON.parse(localStorage.getItem(STORAGE_KEY_BLESSINGS) || '[]');
  } catch {}

  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('placeholder')) {
    return combineUniqueBlessings([...localBlessings, ...defaultBlessings]);
  }

  try {
    const res = await fetch(`${GOOGLE_SCRIPT_URL}?action=getBlessings`);
    if (res.ok) {
      const json = await res.json();
      if (json.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {
        return combineUniqueBlessings([...localBlessings, ...json.data, ...defaultBlessings]);
      }
    }
  } catch (error) {
    console.warn('Could not fetch blessings from Google Sheet script:', error);
  }

  return combineUniqueBlessings([...localBlessings, ...defaultBlessings]);
}

function combineUniqueBlessings(list: MemoryPost[]): MemoryPost[] {
  const seen = new Set<string>();
  const result: MemoryPost[] = [];

  for (const item of list) {
    const key = `${item.author}-${item.message}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }

  return result;
}
