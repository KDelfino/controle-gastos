import type { Category } from '../types';
import { EXPENSE_TYPES } from '../types';
import { useExpenses } from '../context/ExpenseContext';
import { ChevronRight, Repeat } from 'lucide-react';

interface SummaryCardProps {
  category: Category | string;
  title: string;
  icon?: React.ReactNode;
  accentColor?: string;
  customColor?: string;
  onViewAll: () => void;
}

const fmt = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export default function SummaryCard({
  category,
  title,
  icon,
  accentColor = '#38bdf8',
  customColor,
  onViewAll,
}: SummaryCardProps) {
  const { getFilteredExpenses, getInstallmentNumber, selectedMonth, selectedYear } = useExpenses();
  const items = getFilteredExpenses(category);
  const total = items.reduce((sum, item) => sum + item.amount, 0);
  const top3 = [...items].sort((a, b) => b.amount - a.amount).slice(0, 3);
  const color = customColor || accentColor;

  return (
    <div className="summary-card">
      <div className="summary-card-header">
        <div className="summary-header-left">
          {icon && (
            <span className="summary-icon" style={{ color }}>
              {icon}
            </span>
          )}
          <div>
            <h2 className="summary-title">{title}</h2>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
              {items.length} {items.length === 1 ? 'lançamento' : 'lançamentos'}
            </span>
          </div>
        </div>
        <p className="summary-total num-font">{fmt(total)}</p>
      </div>

      <ul className="summary-list">
        {top3.length === 0 ? (
          <li className="empty-text">Sem lançamentos neste mês</li>
        ) : (
          top3.map(item => {
            const n = item.installments ?? 1;
            const isRec = !!item.recurring;
            const current = !isRec && n > 1 ? getInstallmentNumber(item, selectedMonth, selectedYear) : null;
            const typeConfig = item.type ? EXPENSE_TYPES.find(t => t.id === item.type) : undefined;

            return (
              <li key={item.id} className="summary-list-item">
                <span className="item-desc">
                  {current !== null && current === n && (
                    <span className="last-installment-label" style={{ marginRight: '4px', marginBottom: 0 }}>
                      Última
                    </span>
                  )}
                  {isRec && (
                    <span className="recurring-badge-mini" title="Cobrado todo mês">
                      <Repeat size={10} />
                    </span>
                  )}
                  {typeConfig && (
                    <span 
                      className="type-dot" 
                      style={{ backgroundColor: typeConfig.color }} 
                      title={typeConfig.label} 
                    />
                  )}
                  <span>{item.description}</span>
                  {current !== null && (
                    <span className="installment-badge">{current}/{n}</span>
                  )}
                </span>
                <span className="item-amount num-font">{fmt(item.amount)}</span>
              </li>
            );
          })
        )}
        {items.length > 3 && (
          <li className="summary-more">+{items.length - 3} lançamento(s) oculto(s)</li>
        )}
      </ul>

      <button className="btn-view-all" onClick={onViewAll}>
        Ver extrato completo <ChevronRight size={14} />
      </button>
    </div>
  );
}
