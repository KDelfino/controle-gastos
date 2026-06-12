import MonthSelector from '../components/MonthSelector';
import SummaryCard from '../components/SummaryCard';
import SalaryCard from '../components/SalaryCard';
import type { Category } from '../types';
import { useExpenses } from '../context/ExpenseContext';
import { usePreferences } from '../context/PreferencesContext';
import { CreditCard, Form, NotepadText, Settings } from "lucide-react";

interface DashboardProps {
  onNavigate: (page: 'salary' | 'detail' | 'settings', category?: Category | string) => void;
}

const CATEGORIES: { category: Category; title: string; icon: React.ReactNode; accentColor: string }[] = [
  { category: 'cartao', title: 'Cartão de Crédito', icon: <CreditCard size={22} />, accentColor: '#a78bfa' },
  { category: 'mensal', title: 'Contas Mensais', icon: <Form size={22} />, accentColor: '#a78bfa' },
  { category: 'geral', title: 'Gastos Gerais', icon: <NotepadText size={22} />, accentColor: '#a78bfa' },
];

const fmt = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { getFilteredExpenses, customModules } = useExpenses();
  const { isEnabled } = usePreferences();

  const expenseCategories = CATEGORIES.filter(c => isEnabled(c.category));

  const grandTotal = expenseCategories.reduce((sum, { category }) => {
    const items = getFilteredExpenses(category);
    return sum + items.reduce((s, i) => s + i.amount, 0);
  }, 0) + customModules.reduce((sum, module) => {
    const items = getFilteredExpenses(module.id);
    return sum + items.reduce((s, i) => s + i.amount, 0);
  }, 0);

  return (
    <div className="page">
      <header className="app-header">
        <div className="header-top">
          <h1 className="app-title">Controle de Gastos</h1>
          <div className="header-right">
            <span className="grand-total">{fmt(grandTotal)}</span>
            <button
              className="btn-settings"
              title="Configurações"
              onClick={() => onNavigate('settings')}
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
        <MonthSelector />
      </header>

      {!isEnabled('salary') && expenseCategories.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum módulo ativado. Clique em Configurações para ativar módulos.</p>
          <button className="btn btn-primary" onClick={() => onNavigate('settings')}>
            Abrir Configurações
          </button>
        </div>
      ) : (
        <>
          {isEnabled('salary') && (
            <div className="cards-grid">
              <SalaryCard onViewAll={() => onNavigate('salary')} />
            </div>
          )}

          <div className="cards-grid">
            {expenseCategories.map(c => (
              <SummaryCard
                key={c.category}
                category={c.category}
                title={c.title}
                icon={c.icon}
                accentColor={c.accentColor}
                onViewAll={() => onNavigate('detail', c.category)}
              />
            ))}
            {customModules.map(module => (
              <SummaryCard
                key={module.id}
                category={module.id}
                title={module.name}
                onViewAll={() => onNavigate('detail', module.id)}
                customColor={module.color}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
