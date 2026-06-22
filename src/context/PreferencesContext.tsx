import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export type ModuleType = 'earnings' | 'cartao' | 'mensal' | 'geral';

interface PreferencesContextType {
  enabledModules: ModuleType[];
  toggleModule: (module: ModuleType) => void;
  isEnabled: (module: ModuleType) => boolean;
}

const PreferencesContext = createContext<PreferencesContextType | null>(null);

const PREFERENCES_STORAGE_KEY = 'controle_gastos_preferences_v1';
const DEFAULT_MODULES: ModuleType[] = ['cartao', 'mensal', 'geral'];

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [enabledModules, setEnabledModules] = useState<ModuleType[]>(DEFAULT_MODULES);
  const [user, setUser] = useState<any>(null);

  // 1. Ouvir estado de autenticação para gerenciar a fonte dos dados (Firestore ou LocalStorage)
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // Se logado: sincroniza preferências com o Firestore em tempo real
        const unsubPrefs = onSnapshot(
          doc(db, 'users', currentUser.uid, 'preferences', 'settings'),
          (docSnap) => {
            if (docSnap.exists()) {
              setEnabledModules(docSnap.data().enabledModules ?? DEFAULT_MODULES);
            } else {
              // Se o documento não existe ainda, inicializa com o padrão
              setDoc(doc(db, 'users', currentUser.uid, 'preferences', 'settings'), {
                enabledModules: DEFAULT_MODULES
              });
              setEnabledModules(DEFAULT_MODULES);
            }
          },
          (err) => console.error("Erro ao sincronizar preferências:", err)
        );

        return () => unsubPrefs();
      } else {
        // Se deslogado: carrega do localStorage local
        try {
          const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY);
          setEnabledModules(stored ? JSON.parse(stored) : DEFAULT_MODULES);
        } catch {
          setEnabledModules(DEFAULT_MODULES);
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 2. Salva no localStorage como backup local quando deslogado
  useEffect(() => {
    if (!user) {
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(enabledModules));
    }
  }, [enabledModules, user]);

  const toggleModule = async (module: ModuleType) => {
    const nextModules = enabledModules.includes(module)
      ? enabledModules.filter(m => m !== module)
      : [...enabledModules, module];

    if (user) {
      // Se logado: atualiza no Firestore
      try {
        await setDoc(doc(db, 'users', user.uid, 'preferences', 'settings'), {
          enabledModules: nextModules
        });
      } catch (err) {
        console.error("Erro ao salvar preferências no Firestore:", err);
      }
    } else {
      // Se deslogado: atualiza apenas o estado local
      setEnabledModules(nextModules);
    }
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
  if (!ctx) throw new Error('usePreferences deve ser usado dentro do PreferencesProvider');
  return ctx;
}
