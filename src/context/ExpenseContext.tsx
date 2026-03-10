import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Category, ExpenseItem } from '../types';

interface ExpenseContextType {
  expenses: ExpenseItem[];
  addExpense: (item: Omit<ExpenseItem, 'id'>) => void;
  removeExpense: (id: string) => void;
  updateExpense: (id: string, item: Omit<ExpenseItem, 'id'>) => void;
  selectedMonth: number;
  selectedYear: number;
  setSelectedMonth: (month: number) => void;
  setSelectedYear: (year: number) => void;
  getFilteredExpenses: (category: Category) => ExpenseItem[];
  getInstallmentNumber: (item: ExpenseItem, month: number, year: number) => number;
}

const ExpenseContext = createContext<ExpenseContextType | null>(null);

const STORAGE_KEY = 'controle_gastos_v1';

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
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

  // Returns expenses whose installment range covers the selected month
  const getFilteredExpenses = (category: Category): ExpenseItem[] => {
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
