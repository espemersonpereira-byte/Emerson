import { IronLogState, UserProfile } from '../types';

export const STORAGE_KEY = 'ironlog_app_state_v1';
export const PROFILE_STORAGE_KEY = 'ironlog_profile_only_v1';
export const ONBOARDING_FLAG_KEY = 'ironlog_onboarding_done_v1';
export const ONBOARDING_STEP_KEY = 'ironlog_onboarding_step_v1';
export const SAFETY_BACKUP_KEY = 'ironlog_safety_backup_v1';

const IDB_NAME = 'ironlog_persistent_db';
const IDB_STORE = 'app_state_store';
const IDB_KEY = 'main_state';

const CACHE_NAME = 'ironlog_persistent_cache_v1';
const CACHE_URL_KEY = '/__ironlog_persisted_state__.json';

// Request persistent storage permission from browser (prevents iOS/Safari/Chrome storage eviction)
if (
  typeof navigator !== 'undefined' &&
  navigator.storage &&
  typeof navigator.storage.persist === 'function'
) {
  void navigator.storage.persist().catch(() => {});
}

/**
 * Compresses an uploaded image File using an HTML5 Canvas so iPhone 12MP/48MP photos
 * (which are 5MB-12MB in raw Base64 and would exceed localStorage's 5MB limit)
 * are cleanly resized to crisp, lightweight JPEGs (~35KB-95KB) that save instantaneously.
 */
export function compressImageFile(
  file: File,
  maxDimension = 640,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Falha ao ler imagem'));
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (!dataUrl) {
        reject(new Error('Imagem vazia'));
        return;
      }
      const img = new Image();
      img.onerror = () => {
        resolve(dataUrl);
      };
      img.onload = () => {
        try {
          let { width, height } = img;
          if (width > maxDimension || height > maxDimension) {
            if (width >= height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(dataUrl);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch {
          resolve(dataUrl);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

function setOnboardingCookies(): void {
  if (typeof document === 'undefined') return;
  try {
    document.cookie = `${ONBOARDING_FLAG_KEY}=true; path=/; max-age=31536000; SameSite=Lax`;
    if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
      document.cookie = `${ONBOARDING_FLAG_KEY}=true; path=/; max-age=31536000; SameSite=None; Secure`;
    }
  } catch {
    // Ignore cookie errors
  }
}

export function hasCompletedOnboardingFlag(): boolean {
  try {
    if (localStorage.getItem(ONBOARDING_FLAG_KEY) === 'true') return true;
  } catch {
    // Ignore
  }
  try {
    if (
      typeof document !== 'undefined' &&
      document.cookie.includes(`${ONBOARDING_FLAG_KEY}=true`)
    ) {
      return true;
    }
  } catch {
    // Ignore
  }
  try {
    const savedProfileRaw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (savedProfileRaw) {
      const parsed = JSON.parse(savedProfileRaw) as Partial<UserProfile>;
      if (parsed && parsed.onboardingCompleted) return true;
    }
  } catch {
    // Ignore
  }
  return false;
}

export function isStateConfigured(state: IronLogState | null | undefined): boolean {
  if (!state || !state.profile) return false;
  if (state.profile.onboardingCompleted) return true;
  if (state.profile.name && state.profile.name.trim().length > 0) return true;
  if (state.profile.avatarUrl && state.profile.avatarUrl.length > 0) return true;
  if (state.profile.accentColor && state.profile.accentColor !== 'orange') return true;
  if (Array.isArray(state.sessions) && state.sessions.length > 1) return true;
  if (Array.isArray(state.customExercises) && state.customExercises.length > 0) return true;
  if (state.activeWorkout !== null && state.activeWorkout !== undefined) return true;
  if (Number(state.updatedAt) > 0) return true;
  return false;
}

function openDatabase(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function saveStateToIndexedDB(state: IronLogState): Promise<void> {
  const db = await openDatabase();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      store.put(state, IDB_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function loadStateFromIndexedDB(): Promise<IronLogState | null> {
  const db = await openDatabase();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.get(IDB_KEY);
      req.onsuccess = () => {
        const val = req.result;
        if (val && val.profile && Array.isArray(val.routines)) {
          resolve(val as IronLogState);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function saveStateToCacheStorage(state: IronLogState): Promise<void> {
  if (typeof caches === 'undefined') return;
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = new Response(JSON.stringify(state), {
      headers: { 'Content-Type': 'application/json' },
    });
    await cache.put(CACHE_URL_KEY, response);
  } catch {
    // Ignore CacheStorage errors
  }
}

async function loadStateFromCacheStorage(): Promise<IronLogState | null> {
  if (typeof caches === 'undefined') return null;
  try {
    const cache = await caches.open(CACHE_NAME);
    const match = await cache.match(CACHE_URL_KEY);
    if (!match) return null;
    const parsed = await match.json();
    if (parsed && parsed.profile && Array.isArray(parsed.routines)) {
      return parsed as IronLogState;
    }
  } catch {
    // Ignore
  }
  return null;
}

async function saveStateToServer(
  state: IronLogState,
  options?: { flushBeacon?: boolean; forceReset?: boolean }
): Promise<void> {
  if (typeof window === 'undefined') return;
  let onboardingStep = 1;
  try {
    onboardingStep = Number(localStorage.getItem(ONBOARDING_STEP_KEY)) || 1;
  } catch {
    // Ignore
  }

  const payloadStr = JSON.stringify({
    state,
    updatedAt: state.updatedAt || Date.now(),
    onboardingStep,
    forceReset: Boolean(options?.forceReset),
  });

  if (
    options?.flushBeacon &&
    typeof navigator !== 'undefined' &&
    typeof navigator.sendBeacon === 'function'
  ) {
    try {
      const blob = new Blob([payloadStr], { type: 'text/plain' });
      navigator.sendBeacon('/api/state', blob);
      return;
    } catch {
      // Fallback to fetch
    }
  }

  try {
    await fetch('/api/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payloadStr,
      keepalive: true,
    });
  } catch {
    // Offline or network error — local layers still hold the state
  }
}

async function loadStateFromServer(): Promise<{
  state: IronLogState | null;
  onboardingStep?: number;
}> {
  if (typeof window === 'undefined') return { state: null };
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const res = await fetch('/api/state', {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return { state: null };
    const data = await res.json();
    if (data && data.state && data.state.profile && Array.isArray(data.state.routines)) {
      return {
        state: data.state as IronLogState,
        onboardingStep: Number(data.onboardingStep) || 1,
      };
    }
  } catch {
    // Offline or server unavailable
  }
  return { state: null };
}

/**
 * Synchronously reads the best available state from localStorage (combining STORAGE_KEY
 * and PROFILE_STORAGE_KEY fallback).
 */
export function loadSyncStateFromLocalStorage(): IronLogState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const profileRaw = localStorage.getItem(PROFILE_STORAGE_KEY);
    const savedProfile = profileRaw ? (JSON.parse(profileRaw) as Partial<UserProfile>) : null;
    const flagCompleted = hasCompletedOnboardingFlag();

    if (raw) {
      const parsed = JSON.parse(raw) as IronLogState;
      if (parsed && parsed.profile && Array.isArray(parsed.routines)) {
        const mergedProfile: UserProfile = {
          ...parsed.profile,
          ...(savedProfile || {}),
          avatarUrl: parsed.profile.avatarUrl || savedProfile?.avatarUrl,
          onboardingCompleted:
            Boolean(parsed.profile.onboardingCompleted) ||
            Boolean(savedProfile?.onboardingCompleted) ||
            flagCompleted,
        };
        return {
          ...parsed,
          profile: mergedProfile,
        };
      }
    }
  } catch {
    // Ignore JSON parse errors
  }
  return null;
}

/**
 * Synchronously persists state to localStorage with QuotaExceededError protection,
 * sets a dedicated onboarding completion flag + cookie, and mirrors to IndexedDB,
 * CacheStorage, and the backend /api/state disk store.
 */
export function persistIronLogState(
  state: IronLogState,
  options?: { flushBeacon?: boolean; forceReset?: boolean }
): void {
  // Never allow an uninitialized blank state (updatedAt === undefined and not configured)
  // to overwrite an existing saved state
  if (!options?.forceReset && !isStateConfigured(state)) {
    const existingSync = loadSyncStateFromLocalStorage();
    if (existingSync && isStateConfigured(existingSync)) {
      return;
    }
  }

  const stampedState: IronLogState = {
    ...state,
    updatedAt: state.updatedAt || Date.now(),
  };

  // 1. Mark onboarding completed flag & cookie permanently once completed
  if (stampedState.profile.onboardingCompleted) {
    try {
      localStorage.setItem(ONBOARDING_FLAG_KEY, 'true');
    } catch {
      // Ignore
    }
    setOnboardingCookies();
  }

  // 2. Always save lightweight profile metadata separately (< 2KB) so profile settings NEVER fail due to quota
  try {
    const lightweightProfile: UserProfile = {
      ...stampedState.profile,
      avatarUrl:
        stampedState.profile.avatarUrl && stampedState.profile.avatarUrl.length > 120000
          ? undefined
          : stampedState.profile.avatarUrl,
    };
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(lightweightProfile));
  } catch {
    // Ignore
  }

  // 3. Save full state to localStorage with automatic fallback if photos exceed 5MB quota
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stampedState));
  } catch {
    try {
      const lightweightState: IronLogState = {
        ...stampedState,
        profile: {
          ...stampedState.profile,
          avatarUrl:
            stampedState.profile.avatarUrl && stampedState.profile.avatarUrl.length > 150000
              ? undefined
              : stampedState.profile.avatarUrl,
        },
        photos: [],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lightweightState));
    } catch {
      // Ignore
    }
  }

  // 4. Mirror full state (including high-res photos & avatar) to IndexedDB, CacheStorage, and Server Disk
  void saveStateToIndexedDB(stampedState);
  void saveStateToCacheStorage(stampedState);
  void saveStateToServer(stampedState, options);
}

/**
 * Hydrates state across all 4 persistence layers (localStorage, IndexedDB, CacheStorage, and Server /api/state)
 * and picks the most complete / most recently updated state.
 */
export async function hydrateBestIronLogState(
  fallbackFactory: () => IronLogState
): Promise<IronLogState> {
  const syncState = loadSyncStateFromLocalStorage();
  const [idbState, cacheState, serverResult] = await Promise.all([
    loadStateFromIndexedDB(),
    loadStateFromCacheStorage(),
    loadStateFromServer(),
  ]);

  if (serverResult.onboardingStep && serverResult.onboardingStep > 1) {
    try {
      if (!localStorage.getItem(ONBOARDING_STEP_KEY)) {
        localStorage.setItem(ONBOARDING_STEP_KEY, String(serverResult.onboardingStep));
      }
    } catch {
      // Ignore
    }
  }

  const candidates = [syncState, idbState, cacheState, serverResult.state].filter(
    (c): c is IronLogState => Boolean(c && c.profile && Array.isArray(c.routines))
  );

  const configuredCandidates = candidates.filter((c) => isStateConfigured(c));

  if (configuredCandidates.length === 0) {
    if (hasCompletedOnboardingFlag() && candidates.length > 0) {
      const recovered: IronLogState = {
        ...candidates[0],
        updatedAt: Date.now(),
        profile: {
          ...candidates[0].profile,
          onboardingCompleted: true,
        },
      };
      persistIronLogState(recovered);
      return recovered;
    }
    return fallbackFactory();
  }

  // Sort configured candidates: onboardingCompleted === true first, then highest updatedAt
  configuredCandidates.sort((a, b) => {
    const aDone = Boolean(a.profile?.onboardingCompleted);
    const bDone = Boolean(b.profile?.onboardingCompleted);
    if (aDone !== bDone) {
      return bDone ? 1 : -1;
    }
    const aTime = Number(a.updatedAt) || 0;
    const bTime = Number(b.updatedAt) || 0;
    return bTime - aTime;
  });

  const best = configuredCandidates[0];

  // If the user previously configured their profile or completed onboarding in any layer,
  // mark onboardingCompleted = true so reopening the app goes directly to the home screen
  const shouldCompleteOnboarding =
    hasCompletedOnboardingFlag() ||
    configuredCandidates.some((c) => Boolean(c.profile?.onboardingCompleted)) ||
    configuredCandidates.some((c) => isStateConfigured(c));

  const bestAvatar =
    best.profile.avatarUrl ||
    configuredCandidates.find((c) => Boolean(c.profile?.avatarUrl))?.profile.avatarUrl;
  const bestPhotos =
    Array.isArray(best.photos) && best.photos.length > 0
      ? best.photos
      : configuredCandidates.find((c) => Array.isArray(c.photos) && c.photos.length > 0)
          ?.photos || [];
  const bestName =
    best.profile.name ||
    configuredCandidates.find((c) => Boolean(c.profile?.name?.trim()))?.profile.name ||
    '';

  const unified: IronLogState = {
    ...best,
    updatedAt: best.updatedAt || Date.now(),
    profile: {
      ...best.profile,
      name: bestName,
      avatarUrl: bestAvatar,
      onboardingCompleted: shouldCompleteOnboarding,
    },
    photos: bestPhotos,
  };

  persistIronLogState(unified);
  return unified;
}

/**
 * Completely clears all local and server storage when the user clicks "Apagar Todos os Dados".
 */
export async function clearAllIronLogStorage(): Promise<void> {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PROFILE_STORAGE_KEY);
    localStorage.removeItem(ONBOARDING_FLAG_KEY);
    localStorage.removeItem(ONBOARDING_STEP_KEY);
  } catch {
    // Ignore
  }

  if (typeof document !== 'undefined') {
    try {
      document.cookie = `${ONBOARDING_FLAG_KEY}=; path=/; max-age=0`;
      document.cookie = `${ONBOARDING_FLAG_KEY}=; path=/; max-age=0; SameSite=None; Secure`;
    } catch {
      // Ignore
    }
  }

  try {
    const db = await openDatabase();
    if (db) {
      await new Promise<void>((resolve) => {
        const tx = db.transaction(IDB_STORE, 'readwrite');
        tx.objectStore(IDB_STORE).delete(IDB_KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    }
  } catch {
    // Ignore
  }

  if (typeof caches !== 'undefined') {
    try {
      await caches.delete(CACHE_NAME);
    } catch {
      // Ignore
    }
  }

  try {
    await fetch('/api/state/reset', { method: 'POST', keepalive: true });
  } catch {
    // Ignore
  }
}
