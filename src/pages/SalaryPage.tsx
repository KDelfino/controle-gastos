import { useState } from 'react';
import type { SalaryItem } from '../types';
import { useExpenses } from '../context/ExpenseContext';
import MonthSelector from '../components/MonthSelector';
import AddSalaryModal from '../components/AddSalaryModal';
import { DollarSign, MoveLeft, Pen, Trash2 } from 'lucide-react';

interface SalaryPageProps {
  onBack: () => void;
}

const fmt = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const fmtMonth = (yearMonth: string) => {
  const [year, month] = yearMonth.split('-');
  const months = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];
  return `${months[parseInt(month) - 1]} ${year}`;
};

export default function SalaryPage({ onBack }: SalaryPageProps) {
  const { salaries, removeSalary, getSalaryForMonth, selectedMonth, selectedYear } = useExpenses();
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<SalaryItem | undefined>();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const currentSalary = getSalaryForMonth(selectedMonth, selectedYear);
  const sortedSalaries = [...salaries].sort(
    (a, b) => new Date(b.yearMonth).getTime() - new Date(a.yearMonth).getTime()
  );

  const handleEdit = (item: SalaryItem) => {
    setEditItem(item);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditItem(undefined);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirmDelete === id) {
      removeSalary(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
    }
  };

  return (
    <div className="page">
      <header className="app-header">
        <div className="header-top">
          <button className="btn-back" onClick={onBack}>
            <MoveLeft size={16} /> Voltar
          </button>
          <h1 className="app-title">
            <span className="title-icon">
              <DollarSign size={20} />
            </span>
            Gerenciar Salário
          </h1>
        </div>
        <MonthSelector />
      </header>

      <div className="detail-toolbar">
        <span className="detail-total">
          Salário do mês: <strong>{fmt(currentSalary)}</strong>
        </span>
        <button className="btn btn-primary" onClick={handleAdd}>
          + Adicionar
        </button>
      </div>

      {sortedSalaries.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum salário registrado.</p>
          <button className="btn btn-primary" onClick={handleAdd}>
            Adicionar primeiro salário
          </button>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="expense-table">
            <thead>
              <tr>
                <th>Mês</th>
                <th>Descrição</th>
                <th className="col-amount">Valor</th>
                <th className="col-actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              {sortedSalaries.map(item => (
                <tr key={item.id}>
                  <td>{fmtMonth(item.yearMonth)}</td>
                  <td>{item.description || '-'}</td>
                  <td className="col-amount amount-cell">{fmt(item.amount)}</td>
                  <td className="col-actions">
                    <button className="btn-icon" title="Editar" onClick={() => handleEdit(item)}>
                      <Pen size={14} />
                    </button>
                    <button
                      className={`btn-icon ${confirmDelete === item.id ? 'btn-icon--danger' : ''}`}
                      title={confirmDelete === item.id ? 'Confirmar exclusão' : 'Excluir'}
                      onClick={() => handleDelete(item.id)}
                    >
                      {confirmDelete === item.id ? '✓' : <Trash2 size={14} />}
                    </button>
                    {confirmDelete === item.id && (
                      <button className="btn-icon" title="Cancelar" onClick={() => setConfirmDelete(null)}>
                        ✕
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && <AddSalaryModal onClose={() => setShowModal(false)} editItem={editItem} />}
    </div>
  );
}
