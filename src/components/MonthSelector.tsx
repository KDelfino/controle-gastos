import { useExpenses } from '../context/ExpenseContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export default function MonthSelector() {
  const { selectedMonth, selectedYear, setSelectedMonth, setSelectedYear } = useExpenses();

  const prev = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const next = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  return (
    <div className="month-selector">
      <button className="month-btn" onClick={prev} aria-label="Mês anterior" title="Mês anterior">
        <ChevronLeft size={16} />
      </button>
      <span className="month-label">
        {MONTHS[selectedMonth - 1]} <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{selectedYear}</span>
      </span>
      <button className="month-btn" onClick={next} aria-label="Próximo mês" title="Próximo mês">
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
