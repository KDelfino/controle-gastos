import { useExpenses } from '../context/ExpenseContext';
import { TrendingUp, TrendingDown, ArrowDownLeft, ArrowUpRight, ArrowRight } from 'lucide-react';

interface EarningsCardProps {
  onViewAll: () => void;
}

const fmt = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export default function EarningsCard({ onViewAll }: EarningsCardProps) {
  const { getSalaryForMonth, getTotalExpensesForMonth, getBalance, selectedMonth, selectedYear } =
    useExpenses();

  const totalEarnings = getSalaryForMonth(selectedMonth, selectedYear);
  const expenses = getTotalExpensesForMonth(selectedMonth, selectedYear);
  const balance = getBalance(selectedMonth, selectedYear);

  const isPositive = balance >= 0;
  const spentRate = totalEarnings > 0 ? Math.min(100, Math.max(0, Math.round((expenses / totalEarnings) * 100))) : (expenses > 0 ? 100 : 0);

  return (
    <div className="salary-card">
      <div className="salary-card-header">
        <div className="salary-meta">
          <span className="salary-title">Saldo Líquido do Mês</span>
          <span className="salary-total num-font">{fmt(balance)}</span>
        </div>
        <div className={`balance-pill ${isPositive ? 'is-positive' : 'is-negative'}`}>
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{isPositive ? 'Superávit' : 'Déficit'}</span>
        </div>
      </div>

      <ul className="salary-list">
        <li className="salary-list-item">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ display: 'inline-flex', padding: '3px', borderRadius: '4px', background: 'var(--money-in-bg)', color: 'var(--money-in)' }}>
              <ArrowDownLeft size={12} />
            </span>
            <span className="item-label">Entradas (Ganhos)</span>
          </div>
          <span className="salary-amount num-font">{fmt(totalEarnings)}</span>
        </li>
        <li className="salary-list-item">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ display: 'inline-flex', padding: '3px', borderRadius: '4px', background: 'var(--money-out-bg)', color: 'var(--money-out)' }}>
              <ArrowUpRight size={12} />
            </span>
            <span className="item-label">Saídas (Gastos)</span>
          </div>
          <span className="expenses-amount num-font">{fmt(expenses)}</span>
        </li>
      </ul>

      {totalEarnings > 0 && (
        <div className="cashflow-progress">
          <div className="cashflow-progress-bar">
            <div 
              className="cashflow-spent-fill" 
              style={{ 
                width: `${spentRate}%`,
                background: spentRate > 90 ? 'var(--money-out)' : spentRate > 75 ? 'var(--money-warn)' : 'var(--accent)'
              }} 
            />
          </div>
          <div className="cashflow-progress-hint">
            <span>{spentRate}% da renda comprometida</span>
            <span>{fmt(Math.max(0, totalEarnings - expenses))} restante</span>
          </div>
        </div>
      )}

      <button className="btn-view-all" onClick={onViewAll}>
        Gerenciar lançamentos de ganhos <ArrowRight size={14} />
      </button>
    </div>
  );
}
