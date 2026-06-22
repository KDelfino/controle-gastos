import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Category, ExpenseItem, SalaryItem, CustomModule } from '../types';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  addDoc, 
  deleteDoc 
} from 'firebase/firestore';

interface ExpenseContextType {
  user: any;
  loading: boolean;
  expenses: ExpenseItem[];
  addExpense: (item: Omit<ExpenseItem, 'id'>) => Promise<void>;
  removeExpense: (id: string) => Promise<void>;
  updateExpense: (id: string, item: Omit<ExpenseItem, 'id'>) => Promise<void>;
  selectedMonth: number;
  selectedYear: number;
  setSelectedMonth: (month: number) => void;
  setSelectedYear: (year: number) => void;
  getFilteredExpenses: (category: Category | string) => ExpenseItem[];
  getInstallmentNumber: (item: ExpenseItem, month: number, year: number) => number;
  salaries: SalaryItem[];
  addSalary: (item: Omit<SalaryItem, 'id'>) => Promise<void>;
  removeSalary: (id: string) => Promise<void>;
  updateSalary: (id: string, item: Omit<SalaryItem, 'id'>) => Promise<void>;
  getSalaryForMonth: (month: number, year: number) => number;
  getSalaryInstallmentNumber: (item: SalaryItem, month: number, year: number) => number;
  getFilteredSalaries: () => SalaryItem[];
  getTotalExpensesForMonth: (month: number, year: number) => number;
  getBalance: (month: number, year: number) => number;
  customModules: CustomModule[];
  addCustomModule: (item: Omit<CustomModule, 'id' | 'createdAt'>) => Promise<void>;
  removeCustomModule: (id: string) => Promise<void>;
  updateCustomModule: (id: string, item: Omit<CustomModule, 'id' | 'createdAt'>) => Promise<void>;
}

const ExpenseContext = createContext<ExpenseContextType | null>(null);

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [salaries, setSalaries] = useState<SalaryItem[]>([]);
  const [customModules, setCustomModules] = useState<CustomModule[]>([]);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Usuário logado: iniciar sincronização em tempo real com Firestore
        const unsubExpenses = onSnapshot(
          collection(db, 'users', currentUser.uid, 'expenses'), 
          (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExpenseItem));
            setExpenses(list);
          },
          (err) => console.error("Erro ao carregar despesas:", err)
        );

        const unsubSalaries = onSnapshot(
          collection(db, 'users', currentUser.uid, 'salaries'), 
          (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SalaryItem));
            setSalaries(list);
          },
          (err) => console.error("Erro ao carregar salários:", err)
        );

        const unsubModules = onSnapshot(
          collection(db, 'users', currentUser.uid, 'customModules'), 
          (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CustomModule));
            setCustomModules(list);
            setLoading(false);
          },
          (err) => {
            console.error("Erro ao carregar módulos:", err);
            setLoading(false);
          }
        );

        return () => {
          unsubExpenses();
          unsubSalaries();
          unsubModules();
        };
      } else {
        // Usuário deslogado: limpar estados e terminar carregamento
        setExpenses([]);
        setSalaries([]);
        setCustomModules([]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // OPERAÇÕES DE DESPESAS (FIRESTORE)
  const addExpense = async (item: Omit<ExpenseItem, 'id'>) => {
    if (!auth.currentUser) return;
    try {
      await addDoc(collection(db, 'users', auth.currentUser.uid, 'expenses'), item);
    } catch (e) {
      console.error("Erro ao adicionar despesa no Firestore:", e);
      throw e;
    }
  };

  const removeExpense = async (id: string) => {
    if (!auth.currentUser) return;
    try {
      await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'expenses', id));
    } catch (e) {
      console.error("Erro ao remover despesa no Firestore:", e);
      throw e;
    }
  };

  const updateExpense = async (id: string, item: Omit<ExpenseItem, 'id'>) => {
    if (!auth.currentUser) return;
    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid, 'expenses', id), item);
    } catch (e) {
      console.error("Erro ao atualizar despesa no Firestore:", e);
      throw e;
    }
  };

  // OPERAÇÕES DE SALÁRIOS (FIRESTORE)
  const addSalary = async (item: Omit<SalaryItem, 'id'>) => {
    if (!auth.currentUser) return;
    try {
      await addDoc(collection(db, 'users', auth.currentUser.uid, 'salaries'), item);
    } catch (e) {
      console.error("Erro ao adicionar salário no Firestore:", e);
      throw e;
    }
  };

  const removeSalary = async (id: string) => {
    if (!auth.currentUser) return;
    try {
      await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'salaries', id));
    } catch (e) {
      console.error("Erro ao remover salário no Firestore:", e);
      throw e;
    }
  };

  const updateSalary = async (id: string, item: Omit<SalaryItem, 'id'>) => {
    if (!auth.currentUser) return;
    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid, 'salaries', id), item);
    } catch (e) {
      console.error("Erro ao atualizar salário no Firestore:", e);
      throw e;
    }
  };

  const getSalaryForMonth = (month: number, year: number): number => {
    const selYM = year * 12 + (month - 1);
    return salaries.filter(s => {
      const [sy, sm] = s.date.split('-').map(Number);
      const startYM = sy * 12 + (sm - 1);
      const n = s.installments ?? 1;
      return selYM >= startYM && selYM < startYM + n;
    }).reduce((sum, s) => sum + s.amount, 0);
  };

  const getSalaryInstallmentNumber = (item: SalaryItem, month: number, year: number): number => {
    const [sy, sm] = item.date.split('-').map(Number);
    return (year * 12 + (month - 1)) - (sy * 12 + (sm - 1)) + 1;
  };

  const getFilteredSalaries = (): SalaryItem[] => {
    const selYM = selectedYear * 12 + (selectedMonth - 1);
    return salaries.filter(s => {
      const [sy, sm] = s.date.split('-').map(Number);
      const startYM = sy * 12 + (sm - 1);
      const n = s.installments ?? 1;
      return selYM >= startYM && selYM < startYM + n;
    });
  };

  const getTotalExpensesForMonth = (month: number, year: number): number => {
    const selYM = year * 12 + (month - 1);
    return expenses.filter(e => {
      const [sy, sm] = e.date.split('-').map(Number);
      const startYM = sy * 12 + (sm - 1);
      const n = e.installments ?? 1;
      return selYM >= startYM && selYM < startYM + n;
    }).reduce((sum, i) => sum + i.amount, 0);
  };

  const getBalance = (month: number, year: number): number => {
    return getSalaryForMonth(month, year) - getTotalExpensesForMonth(month, year);
  };

  // OPERAÇÕES DE MÓDULOS CUSTOMIZADOS (FIRESTORE)
  const addCustomModule = async (item: Omit<CustomModule, 'id' | 'createdAt'>) => {
    if (!auth.currentUser) return;
    try {
      const newModuleId = `custom_${Date.now()}`;
      const payload: CustomModule = {
        ...item,
        id: newModuleId,
        createdAt: new Date().toISOString().split('T')[0],
      };
      await setDoc(doc(db, 'users', auth.currentUser.uid, 'customModules', newModuleId), payload);
    } catch (e) {
      console.error("Erro ao adicionar módulo customizado no Firestore:", e);
      throw e;
    }
  };

  const removeCustomModule = async (id: string) => {
    if (!auth.currentUser) return;
    try {
      await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'customModules', id));
      // Remove despesas associadas a este módulo customizado no Firestore
      const associatedExpenses = expenses.filter(e => e.category === id);
      const batchPromises = associatedExpenses.map(e => 
        deleteDoc(doc(db, 'users', auth.currentUser!.uid, 'expenses', e.id))
      );
      await Promise.all(batchPromises);
    } catch (e) {
      console.error("Erro ao deletar módulo customizado no Firestore:", e);
      throw e;
    }
  };

  const updateCustomModule = async (id: string, item: Omit<CustomModule, 'id' | 'createdAt'>) => {
    if (!auth.currentUser) return;
    try {
      const existing = customModules.find(m => m.id === id);
      if (!existing) return;
      const payload = {
        ...existing,
        ...item,
        id,
      };
      await setDoc(doc(db, 'users', auth.currentUser.uid, 'customModules', id), payload);
    } catch (e) {
      console.error("Erro ao atualizar módulo customizado no Firestore:", e);
      throw e;
    }
  };

  // Retorna os gastos cujo intervalo de parcelas abrange o mês/ano selecionado
  const getFilteredExpenses = (category: Category | string): ExpenseItem[] => {
    const selYM = selectedYear * 12 + (selectedMonth - 1);
    return expenses.filter(e => {
      if (e.category !== category) return false;
      const [sy, sm] = e.date.split('-').map(Number);
      const startYM = sy * 12 + (sm - 1);
      const n = e.installments ?? 1;
      return selYM >= startYM && selYM < startYM + n;
    });
  };

  // Retorna qual número da parcela (1-based) está ativa no mês/ano
  const getInstallmentNumber = (item: ExpenseItem, month: number, year: number): number => {
    const [sy, sm] = item.date.split('-').map(Number);
    return (year * 12 + (month - 1)) - (sy * 12 + (sm - 1)) + 1;
  };

  return (
    <ExpenseContext.Provider
      value={{
        user,
        loading,
        expenses,
        addExpense,
        removeExpense,
        updateExpense,
        selectedMonth,
        selectedYear,
        setSelectedMonth,
        setSelectedYear,
        getFilteredExpenses,
        getInstallmentNumber,
        salaries,
        addSalary,
        removeSalary,
        updateSalary,
        getSalaryForMonth,
        getSalaryInstallmentNumber,
        getFilteredSalaries,
        getTotalExpensesForMonth,
        getBalance,
        customModules,
        addCustomModule,
        removeCustomModule,
        updateCustomModule,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses(): ExpenseContextType {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error('useExpenses deve ser usado dentro do ExpenseProvider');
  return ctx;
}
