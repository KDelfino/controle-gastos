import MonthSelector from '../components/MonthSelector';
import SummaryCard from '../components/SummaryCard';
import type { Category } from '../types';
import { useExpenses } from '../context/ExpenseContext';
import { CreditCard, Form, NotepadText } from "lucide-react";

interface DashboardProps {
  onNavigate: (category: Category) => void;
}

const CATEGORIES: { category: Category; title: string; icon: React.ReactNode; accentColor: string }[] = [
  { category: 'cartao', title: 'Cartão de Crédito', icon: <CreditCard size={22} />, accentColor: '#a78bfa' },
  { category: 'mensal', title: 'Contas Mensais', icon: <Form size={22} />, accentColor: '#a78bfa' },
  { category: 'geral', title: 'Gastos Gerais', icon: <NotepadText size={22} />, accentColor: '#a78bfa' },
];

const fmt = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { getFilteredExpenses } = useExpenses();

  const grandTotal = CATEGORIES.reduce((sum, { category }) => {
    const items = getFilteredExpenses(category);
    return sum + items.reduce((s, i) => s + i.amount, 0);
  }, 0);

  return (
    <div className="page">
      <header className="app-header">
        <div className="header-top">
          <h1 className="app-title">Controle de Gastos</h1>
          <span className="grand-total">{fmt(grandTotal)}</span>
        </div>
        <MonthSelector />
      </header>

      <div className="cards-grid">
        {CATEGORIES.map(c => (
          <SummaryCard
            key={c.category}
            category={c.category}
            title={c.title}
            icon={c.icon}
            accentColor={c.accentColor}
            onViewAll={() => onNavigate(c.category)}
          />
        ))}
      </div>
    </div>
  );
}
