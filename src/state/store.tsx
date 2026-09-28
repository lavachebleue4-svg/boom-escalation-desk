import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import type { AppState } from '../types';
import { reducer, type Action } from './actions';
import { buildInitialState } from '../data/seed';

const STORAGE_KEY = 'boom-escalation-desk-v1';

function loadInitialState(): AppState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildInitialState();
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed.cases || !parsed.demo || !parsed.automation) return buildInitialState();
    return parsed;
  } catch {
    return buildInitialState();
  }
}

interface StoreContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitialState);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage unavailable (e.g. private browsing quota) — demo continues in memory only.
    }
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
