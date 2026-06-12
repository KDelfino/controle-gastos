import { useExpenses } from '../context/ExpenseContext';
import { DollarSign } from 'lucide-react';

interface SalaryCardProps {
  onViewAll: () => void;
}

const fmt = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export default function SalaryCard({ onViewAll }: SalaryCardProps) {
  const { getSalaryForMonth, getTotalExpensesForMonth, getBalance, selectedMonth, selectedYear } =
    useExpenses();

  const salary = getSalaryForMonth(selectedMonth, selectedYear);
  const expenses = getTotalExpensesForMonth(selectedMonth, selectedYear);
  const balance = getBalance(selectedMonth, selectedYear);

  const isPositive = balance >= 0;

  return (
    <div className="salary-card" style={{ '--accent': '#10b981' } as React.CSSProperties}>
      <div className="salary-card-header">
        <span className="salary-icon">
          <DollarSign size={22} />
        </span>
        <div>
          <h2 className="salary-title">Resumo Financeiro</h2>
          <p className="salary-total">{fmt(balance)}</p>
        </div>
        <span className={`balance-indicator ${isPositive ? 'balance-positive' : 'balance-negative'}`}>
          {isPositive ? '↑' : '↓'}
        </span>
      </div>

      <ul className="salary-list">
        <li className="salary-list-item">
          <span className="item-label">Salário</span>
          <span className="item-amount salary-amount">{fmt(salary)}</span>
        </li>
        <li className="salary-list-item">
          <span className="item-label">Gastos</span>
          <span className="item-amount expenses-amount">{fmt(expenses)}</span>
        </li>
      </ul>

      <button className="btn-view-all" onClick={onViewAll}>
        Gerenciar salário
      </button>
    </div>
  );
}
