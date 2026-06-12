import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type ModuleType = 'salary' | 'cartao' | 'mensal' | 'geral';

interface PreferencesContextType {
  enabledModules: ModuleType[];
  toggleModule: (module: ModuleType) => void;
  isEnabled: (module: ModuleType) => boolean;
}

const PreferencesContext = createContext<PreferencesContextType | null>(null);

const PREFERENCES_STORAGE_KEY = 'controle_gastos_preferences_v1';

// Módulos ativados por padrão
const DEFAULT_MODULES: ModuleType[] = ['cartao', 'mensal', 'geral'];

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [enabledModules, setEnabledModules] = useState<ModuleType[]>(() => {
    try {
      const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_MODULES;
    } catch {
      return DEFAULT_MODULES;
    }
  });

  useEffect(() => {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(enabledModules));
  }, [enabledModules]);

  const toggleModule = (module: ModuleType) => {
    setEnabledModules(prev =>
      prev.includes(module) ? prev.filter(m => m !== module) : [...prev, module]
    );
  };

  const isEnabled = (module: ModuleType): boolean => {
    return enabledModules.includes(module);
  };

  return (
    <PreferencesContext.Provider value={{ enabledModules, toggleModule, isEnabled }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesContextType {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used inside PreferencesProvider');
  return ctx;
}
