import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Category, ExpenseItem, SalaryItem, CustomModule } from '../types';

interface ExpenseContextType {
  expenses: ExpenseItem[];
  addExpense: (item: Omit<ExpenseItem, 'id'>) => void;
  removeExpense: (id: string) => void;
  updateExpense: (id: string, item: Omit<ExpenseItem, 'id'>) => void;
  selectedMonth: number;
  selectedYear: number;
  setSelectedMonth: (month: number) => void;
  setSelectedYear: (year: number) => void;
  getFilteredExpenses: (category: Category | string) => ExpenseItem[];
  getInstallmentNumber: (item: ExpenseItem, month: number, year: number) => number;
  salaries: SalaryItem[];
  addSalary: (item: Omit<SalaryItem, 'id'>) => void;
  removeSalary: (id: string) => void;
  updateSalary: (id: string, item: Omit<SalaryItem, 'id'>) => void;
  getSalaryForMonth: (month: number, year: number) => number;
  getTotalExpensesForMonth: (month: number, year: number) => number;
  getBalance: (month: number, year: number) => number;
  customModules: CustomModule[];
  addCustomModule: (item: Omit<CustomModule, 'id' | 'createdAt'>) => void;
  removeCustomModule: (id: string) => void;
  updateCustomModule: (id: string, item: Omit<CustomModule, 'id' | 'createdAt'>) => void;
}

const ExpenseContext = createContext<ExpenseContextType | null>(null);

const STORAGE_KEY = 'controle_gastos_v1';
const SALARY_STORAGE_KEY = 'controle_gastos_salaries_v1';
const CUSTOM_MODULES_STORAGE_KEY = 'controle_gastos_custom_modules_v1';

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [salaries, setSalaries] = useState<SalaryItem[]>(() => {
    try {
      const stored = localStorage.getItem(SALARY_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [customModules, setCustomModules] = useState<CustomModule[]>(() => {
    try {
      const stored = localStorage.getItem(CUSTOM_MODULES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(SALARY_STORAGE_KEY, JSON.stringify(salaries));
  }, [salaries]);

  useEffect(() => {
    localStorage.setItem(CUSTOM_MODULES_STORAGE_KEY, JSON.stringify(customModules));
  }, [customModules]);

  const addExpense = (item: Omit<ExpenseItem, 'id'>) => {
    const newItem: ExpenseItem = { ...item, id: crypto.randomUUID() };
    setExpenses(prev => [...prev, newItem]);
  };

  const removeExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const updateExpense = (id: string, item: Omit<ExpenseItem, 'id'>) => {
    setExpenses(prev => prev.map(e => (e.id === id ? { ...item, id } : e)));
  };

  const addSalary = (item: Omit<SalaryItem, 'id'>) => {
    const newSalary: SalaryItem = { ...item, id: crypto.randomUUID() };
    setSalaries(prev => [...prev, newSalary]);
  };

  const removeSalary = (id: string) => {
    setSalaries(prev => prev.filter(s => s.id !== id));
  };

  const updateSalary = (id: string, item: Omit<SalaryItem, 'id'>) => {
    setSalaries(prev => prev.map(s => (s.id === id ? { ...item, id } : s)));
  };

  const getSalaryForMonth = (month: number, year: number): number => {
    const yearMonth = `${year}-${String(month).padStart(2, '0')}`;
    const salary = salaries.find(s => s.yearMonth === yearMonth);
    return salary?.amount ?? 0;
  };

  const getTotalExpensesForMonth = (): number => {
    return getFilteredExpenses('cartao').reduce((sum, i) => sum + i.amount, 0) +
           getFilteredExpenses('mensal').reduce((sum, i) => sum + i.amount, 0) +
           getFilteredExpenses('geral').reduce((sum, i) => sum + i.amount, 0);
  };

  const getBalance = (month: number, year: number): number => {
    return getSalaryForMonth(month, year) - getTotalExpensesForMonth();
  };

  const addCustomModule = (item: Omit<CustomModule, 'id' | 'createdAt'>) => {
    const newModule: CustomModule = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCustomModules(prev => [...prev, newModule]);
  };

  const removeCustomModule = (id: string) => {
    setCustomModules(prev => prev.filter(m => m.id !== id));
    // Remove expenses associadas a este módulo
    setExpenses(prev => prev.filter(e => e.category !== id));
  };

  const updateCustomModule = (id: string, item: Omit<CustomModule, 'id' | 'createdAt'>) => {
    setCustomModules(prev =>
      prev.map(m => {
        if (m.id === id) {
          return { ...m, ...item, id, createdAt: m.createdAt };
        }
        return m;
      })
    );
  };

  // Returns expenses whose installment range covers the selected month
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

  // Returns which installment number (1-based) is active in the given month/year
  const getInstallmentNumber = (item: ExpenseItem, month: number, year: number): number => {
    const [sy, sm] = item.date.split('-').map(Number);
    return (year * 12 + (month - 1)) - (sy * 12 + (sm - 1)) + 1;
  };

  return (
    <ExpenseContext.Provider
      value={{
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
  if (!ctx) throw new Error('useExpenses must be used inside ExpenseProvider');
  return ctx;
}
