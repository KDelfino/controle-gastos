import { useExpenses } from '../context/ExpenseContext';

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
      <button className="month-btn" onClick={prev} aria-label="Mês anterior">
        ‹
      </button>
      <span className="month-label">
        {MONTHS[selectedMonth - 1]} {selectedYear}
      </span>
      <button className="month-btn" onClick={next} aria-label="Próximo mês">
        ›
      </button>
    </div>
  );
}
