import type { Category } from '../types';
import { useExpenses } from '../context/ExpenseContext';

interface SummaryCardProps {
  category: Category;
  title: string;
  icon: React.ReactNode;
  accentColor: string;
  onViewAll: () => void;
}

const fmt = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export default function SummaryCard({
  category,
  title,
  icon,
  accentColor,
  onViewAll,
}: SummaryCardProps) {
  const { getFilteredExpenses, getInstallmentNumber, selectedMonth, selectedYear } = useExpenses();
  const items = getFilteredExpenses(category);
  const total = items.reduce((sum, item) => sum + item.amount, 0);
  const top3 = [...items].sort((a, b) => b.amount - a.amount).slice(0, 3);

  return (
    <div className="summary-card" style={{ '--accent': accentColor } as React.CSSProperties}>
      <div className="summary-card-header">
        <span className="summary-icon">{icon}</span>
        <div>
          <h2 className="summary-title">{title}</h2>
          <p className="summary-total">{fmt(total)}</p>
        </div>
      </div>

      <ul className="summary-list">
        {top3.length === 0 ? (
          <li className="empty-text">Nenhum gasto neste mês</li>
        ) : (
          top3.map(item => {
            const n = item.installments ?? 1;
            const current = n > 1 ? getInstallmentNumber(item, selectedMonth, selectedYear) : null;
            return (
              <li key={item.id} className="summary-list-item">
                <span className="item-desc">
                  {item.description}
                  {current !== null && (
                    <span className="installment-badge">{current}/{n}</span>
                  )}
                </span>
                <span className="item-amount">{fmt(item.amount)}</span>
              </li>
            );
          })
        )}
        {items.length > 3 && (
          <li className="summary-more">+{items.length - 3} item(s) a mais</li>
        )}
      </ul>

      <button className="btn-view-all" onClick={onViewAll}>
        Ver todos
      </button>
    </div>
  );
}
