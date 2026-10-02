import MonthSelector from '../components/MonthSelector';
import SummaryCard from '../components/SummaryCard';
import EarningsCard from '../components/EarningsCard';
import type { Category } from '../types';
import { useExpenses } from '../context/ExpenseContext';
import { usePreferences } from '../context/PreferencesContext';
import { CreditCard, CalendarDays, ShoppingBag, Settings, Wallet } from "lucide-react";

interface DashboardProps {
  onNavigate: (page: 'earnings' | 'detail' | 'settings', category?: Category | string) => void;
}

const CATEGORIES: { category: Category; title: string; icon: React.ReactNode; accentColor: string }[] = [
  { category: 'cartao', title: 'Cartão de Crédito', icon: <CreditCard size={18} />, accentColor: '#38bdf8' },
  { category: 'mensal', title: 'Contas Mensais', icon: <CalendarDays size={18} />, accentColor: '#a855f7' },
  { category: 'geral', title: 'Gastos Gerais', icon: <ShoppingBag size={18} />, accentColor: '#f59e0b' },
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ 
              display: 'inline-flex', 
              padding: '8px', 
              borderRadius: 'var(--radius-md)', 
              background: 'var(--surface)', 
              border: '1px solid var(--border)',
              color: 'var(--accent)'
            }}>
              <Wallet size={20} />
            </span>
            <div>
              <h1 className="app-title">Controle Financeiro</h1>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                Gestão pessoal de fluxo de caixa
              </span>
            </div>
          </div>

          <div className="header-right">
            <div className="grand-total-container">
              <span className="grand-total-label">Total de despesas</span>
              <span className="grand-total num-font">{fmt(grandTotal)}</span>
            </div>
            <button
              className="btn-settings"
              title="Configurações e módulos"
              onClick={() => onNavigate('settings')}
            >
              <Settings size={18} />
            </button>
          </div>
        </div>

        <MonthSelector />
      </header>

      {!isEnabled('earnings') && expenseCategories.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum módulo ativado no momento. Personalize os módulos visíveis nas configurações.</p>
          <button className="btn btn-primary" onClick={() => onNavigate('settings')}>
            Abrir Configurações
          </button>
        </div>
      ) : (
        <>
          {isEnabled('earnings') && (
            <EarningsCard onViewAll={() => onNavigate('earnings')} />
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
