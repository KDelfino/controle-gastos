import { useState } from 'react';
import type { SalaryItem } from '../types';
import { useExpenses } from '../context/ExpenseContext';
import MonthSelector from '../components/MonthSelector';
import AddEarningsModal from '../components/AddEarningsModal';
import { TrendingUp, ArrowLeft, Pen, Trash2, Plus } from 'lucide-react';

interface EarningsPageProps {
  onBack: () => void;
}

const fmt = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const fmtDate = (date?: string) => {
  if (!date) return '-';
  const parts = date.split('-');
  if (parts.length < 3) return date;
  const [year, month, day] = parts;
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
  const sortedEarnings = [...activeEarnings].sort((a, b) => {
    const dateA = a.date || ((a as any).yearMonth ? `${(a as any).yearMonth}-01` : '');
    const dateB = b.date || ((b as any).yearMonth ? `${(b as any).yearMonth}-01` : '');
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="btn-back" onClick={onBack}>
              <ArrowLeft size={16} /> Voltar
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                display: 'inline-flex', 
                padding: '6px', 
                borderRadius: 'var(--radius-sm)', 
                background: 'var(--surface)', 
                border: '1px solid var(--border)',
                color: 'var(--money-in)' 
              }}>
                <TrendingUp size={18} />
              </span>
              <h1 className="app-title" style={{ fontSize: '1.35rem' }}>Gerenciar Ganhos</h1>
            </div>
          </div>
        </div>
        <MonthSelector />
      </header>

      <div className="detail-toolbar">
        <span className="detail-total">
          Total de receitas no mês: <strong style={{ color: 'var(--money-in)' }}>{fmt(currentMonthEarningsTotal)}</strong>
          <small>({sortedEarnings.length} {sortedEarnings.length === 1 ? 'receita ativa' : 'receitas ativas'})</small>
        </span>
        <button className="btn btn-primary" onClick={handleAdd}>
          <Plus size={16} /> Adicionar receita
        </button>
      </div>

      {sortedEarnings.length === 0 ? (
        <div className="empty-state">
          <p>Nenhuma receita registrada ou ativa para o mês selecionado.</p>
          <button className="btn btn-primary" onClick={handleAdd}>
            <Plus size={16} /> Adicionar primeiro ganho
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
                        <div className="last-installment-label" style={{ color: 'var(--money-in)', background: 'var(--money-in-bg)', borderColor: 'var(--money-in-border)' }}>
                          Último recebimento
                        </div>
                      )}
                      <div>
                        <span className="item-desc-cell">{item.description || 'Ganho sem descrição'}</span>
                        {current !== null && (
                          <span className="installment-badge" style={{ color: 'var(--money-in)' }}>
                            {current}/{n}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>{fmtDate(item.date)}</td>
                    <td className="col-amount amount-cell num-font" style={{ color: 'var(--money-in)' }}>
                      {fmt(item.amount)}
                    </td>
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
            <tfoot>
              <tr>
                <td colSpan={2}><strong>Total de ganhos do mês</strong></td>
                <td className="col-amount amount-cell num-font" style={{ color: 'var(--money-in)' }}>
                  <strong>{fmt(currentMonthEarningsTotal)}</strong>
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {showModal && <AddEarningsModal onClose={() => setShowModal(false)} editItem={editItem} />}
    </div>
  );
}
