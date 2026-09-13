import { RsvpFormData, MemoryPost, PollOptionId, PollResultData } from '../types/wedding';
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

/* ─────────────────────────────────────────────────────────────
 * POLL SERVICE (10km Marathon Participation Poll)
 * ───────────────────────────────────────────────────────────── */

const STORAGE_KEY_POLL_VOTE = 'openlily_poll_user_vote';
const STORAGE_KEY_POLL_TALLIES = 'openlily_poll_tallies_local';

export function getUserPollVote(): PollOptionId | null {
  try {
    return (localStorage.getItem(STORAGE_KEY_POLL_VOTE) as PollOptionId) || null;
  } catch {
    return null;
  }
}

/**
 * Helper to compute percentage weights safely
 */
export function calculatePollPercentages(participateCount: number, unavailableCount: number): PollResultData {
  const userVote = getUserPollVote();
  let part = Math.max(0, participateCount);
  let unavail = Math.max(0, unavailableCount);

  // If user has recorded a vote locally but counts are 0 (e.g. backend sync pending), enforce local vote
  if (part === 0 && unavail === 0 && userVote) {
    if (userVote === 'participate') part = 1;
    if (userVote === 'unavailable') unavail = 1;
  }

  const total = part + unavail;
  if (total === 0) {
    return {
      participate: 0,
      unavailable: 0,
      total: 0,
      participatePct: 0,
      unavailablePct: 0,
    };
  }

  const participatePct = Math.round((part / total) * 100);
  const unavailablePct = 100 - participatePct;

  return {
    participate: part,
    unavailable: unavail,
    total,
    participatePct,
    unavailablePct,
  };
}

/**
 * Fetch visitor's public IP address with timeout safety
 */
export async function fetchUserIp(): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const res = await fetch('https://api.ipify.org?format=json', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const json = await res.json();
      if (json && json.ip) return json.ip;
    }
  } catch (err) {
    console.warn('Could not retrieve IP address via ipify API:', err);
  }
  // Fallback device fingerprint token stored in localStorage
  let fallbackId = localStorage.getItem('openlily_voter_device_id');
  if (!fallbackId) {
    fallbackId = `device-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('openlily_voter_device_id', fallbackId);
  }
  return fallbackId;
}

/**
 * Fetch live poll results from Google Sheets backend or local cache
 */
export async function fetchPollResults(): Promise<PollResultData> {
  // Read local cache first (defaults strictly to 0)
  let localTallies = { participate: 0, unavailable: 0 };
  try {
    const cached = localStorage.getItem(STORAGE_KEY_POLL_TALLIES);
    if (cached) {
      const parsed = JSON.parse(cached);
      // Clean up legacy dummy values if present in user's browser
      if (parsed.participate === 14 && parsed.unavailable === 4) {
        localStorage.removeItem(STORAGE_KEY_POLL_TALLIES);
      } else {
        localTallies = parsed;
      }
    }
  } catch {}

  const userVote = getUserPollVote();
  if (userVote === 'participate' && localTallies.participate === 0) {
    localTallies.participate = 1;
  } else if (userVote === 'unavailable' && localTallies.unavailable === 0) {
    localTallies.unavailable = 1;
  }

  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('placeholder')) {
    return calculatePollPercentages(localTallies.participate, localTallies.unavailable);
  }

  try {
    const res = await fetch(`${GOOGLE_SCRIPT_URL}?action=getPollResults`);
    if (res.ok) {
      const json = await res.json();
      if (json.status === 'success' && typeof json.participate === 'number' && typeof json.unavailable === 'number') {
        let pCount = json.participate;
        let uCount = json.unavailable;

        // Ensure user's own vote is accounted for
        if (userVote === 'participate' && pCount === 0) pCount = 1;
        if (userVote === 'unavailable' && uCount === 0) uCount = 1;

        const tallies = { participate: pCount, unavailable: uCount };
        localStorage.setItem(STORAGE_KEY_POLL_TALLIES, JSON.stringify(tallies));
        return calculatePollPercentages(tallies.participate, tallies.unavailable);
      }
    }
  } catch (err) {
    console.warn('Could not fetch live poll results from Google Script:', err);
  }

  return calculatePollPercentages(localTallies.participate, localTallies.unavailable);
}

/**
 * Submit vote to backend with duplicate IP check
 */
export async function submitPollVote(
  option: PollOptionId
): Promise<{ success: boolean; results: PollResultData; alreadyVoted?: boolean; message?: string }> {
  // Save local vote lock
  try {
    localStorage.setItem(STORAGE_KEY_POLL_VOTE, option);
  } catch {}

  // Update local tallies immediately for smooth user feedback
  let localTallies = { participate: 0, unavailable: 0 };
  try {
    const cached = localStorage.getItem(STORAGE_KEY_POLL_TALLIES);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (!(parsed.participate === 14 && parsed.unavailable === 4)) {
        localTallies = parsed;
      }
    }
  } catch {}

  if (option === 'participate') {
    localTallies.participate = Math.max(1, localTallies.participate + 1);
  } else {
    localTallies.unavailable = Math.max(1, localTallies.unavailable + 1);
  }

  try {
    localStorage.setItem(STORAGE_KEY_POLL_TALLIES, JSON.stringify(localTallies));
  } catch {}

  const userIp = await fetchUserIp();

  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('placeholder')) {
    return {
      success: true,
      results: calculatePollPercentages(localTallies.participate, localTallies.unavailable),
    };
  }

  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        type: 'poll_vote',
        option,
        ipAddress: userIp,
        userAgent: navigator.userAgent,
        submittedAt: new Date().toISOString(),
      }),
    });
  } catch (err) {
    console.error('Failed to submit poll vote to Google Script:', err);
  }

  return {
    success: true,
    results: calculatePollPercentages(localTallies.participate, localTallies.unavailable),
  };
}

