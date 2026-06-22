import { useState } from 'react';
import type { SalaryItem } from '../types';
import { useExpenses } from '../context/ExpenseContext';
import MonthSelector from '../components/MonthSelector';
import AddEarningsModal from '../components/AddEarningsModal';
import { DollarSign, MoveLeft, Pen, Trash2 } from 'lucide-react';

interface EarningsPageProps {
  onBack: () => void;
}

const fmt = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const fmtDate = (date: string) => {
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
};

export default function EarningsPage({ onBack }: EarningsPageProps) {
  const { 
    getSalaryForMonth, 
    getFilteredSalaries, 
    removeSalary, 
    getSalaryInstallmentNumber, 
    selectedMonth, 
    selectedYear 
  } = useExpenses();

  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<SalaryItem | undefined>();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const currentMonthEarningsTotal = getSalaryForMonth(selectedMonth, selectedYear);
  
  // Lista apenas os ganhos ativos no mês selecionado
  const activeEarnings = getFilteredSalaries();
  
  // Ordena por data decrescente
  const sortedEarnings = [...activeEarnings].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleEdit = (item: SalaryItem) => {
    setEditItem(item);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditItem(undefined);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirmDelete === id) {
      await removeSalary(id);
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
            Gerenciar Ganhos
          </h1>
        </div>
        <MonthSelector />
      </header>

      <div className="detail-toolbar">
        <span className="detail-total">
          Ganhos ativos no mês: <strong>{fmt(currentMonthEarningsTotal)}</strong>
        </span>
        <button className="btn btn-primary" onClick={handleAdd}>
          + Adicionar
        </button>
      </div>

      {sortedEarnings.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum ganho registrado para este mês.</p>
          <button className="btn btn-primary" onClick={handleAdd}>
            Adicionar primeiro ganho
          </button>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="expense-table">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Data</th>
                <th className="col-amount">Valor</th>
                <th className="col-actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              {sortedEarnings.map(item => {
                const n = item.installments ?? 1;
                const current = n > 1 ? getSalaryInstallmentNumber(item, selectedMonth, selectedYear) : null;
                return (
                  <tr key={item.id}>
                    <td>
                      {current !== null && current === n && (
                        <div className="last-installment-label" style={{ color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.12)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                          Último ganho!
                        </div>
                      )}
                      <div>
                        <span className="item-desc-cell">{item.description || 'Ganho sem descrição'}</span>
                        {current !== null && (
                          <span className="installment-badge" style={{ color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.12)', borderColor: 'rgba(16, 185, 129, 0.25)' }}>
                            {current}/{n}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>{fmtDate(item.date)}</td>
                    <td className="col-amount amount-cell" style={{ color: '#10b981' }}>{fmt(item.amount)}</td>
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && <AddEarningsModal onClose={() => setShowModal(false)} editItem={editItem} />}
    </div>
  );
}
