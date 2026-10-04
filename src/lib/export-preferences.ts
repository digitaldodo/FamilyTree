import { useCallback, useSyncExternalStore } from 'react';
import {
  DEFAULT_ORIENTATION_PREFERENCE,
  type OrientationPreference,
} from '@/lib/pdf-layout';

const STORAGE_KEY = 'familytree:export-orientation';
const CHANGE_EVENT = 'familytree:export-orientation-change';

function isPreference(value: unknown): value is OrientationPreference {
  return value === 'landscape' || value === 'portrait' || value === 'auto';
}

/** Reads the saved orientation. Falls back to Landscape when nothing is saved. */
export function loadOrientationPreference(): OrientationPreference {
  if (typeof window === 'undefined') return DEFAULT_ORIENTATION_PREFERENCE;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return isPreference(saved) ? saved : DEFAULT_ORIENTATION_PREFERENCE;
  } catch {
    return DEFAULT_ORIENTATION_PREFERENCE;
  }
}

export function saveOrientationPreference(value: OrientationPreference) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Storage may be unavailable (private mode) — the choice still applies to this session.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

/** React hook: current orientation preference (SSR-safe) and a setter that persists it. */
export function useOrientationPreference() {
  const orientation = useSyncExternalStore(
    subscribe,
    loadOrientationPreference,
    () => DEFAULT_ORIENTATION_PREFERENCE
  );
  const setOrientation = useCallback(
    (value: OrientationPreference) => saveOrientationPreference(value),
    []
  );
  return [orientation, setOrientation] as const;
}
