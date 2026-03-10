import { useState } from 'react';
import type { Category, ExpenseItem } from '../types';
import { useExpenses } from '../context/ExpenseContext';
import MonthSelector from '../components/MonthSelector';
import AddExpenseModal from '../components/AddExpenseModal';
import { CreditCard, Form, MoveLeft, NotepadText, Pen, Search, Trash2 } from "lucide-react";

interface CategoryPageProps {
  category: Category;
  onBack: () => void;
}

const CATEGORY_META: Record<Category, { title: string; icon: React.ReactNode; accentColor: string }> = {
  cartao: { title: 'Cartão de Crédito', icon: <CreditCard size={20} />, accentColor: '#a78bfa' },
  mensal: { title: 'Contas Mensais', icon: <Form size={20} />, accentColor: '#a78bfa' },
  geral: { title: 'Gastos Gerais', icon: <NotepadText size={20} />, accentColor: '#a78bfa' },
};

const fmt = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const fmtDate = (date: string) => {
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
};

type SortOrder = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'date-desc', label: 'Mais recente' },
  { value: 'date-asc',  label: 'Mais antigo' },
  { value: 'amount-desc', label: 'Maior valor' },
  { value: 'amount-asc',  label: 'Menor valor' },
];

export default function CategoryPage({ category, onBack }: CategoryPageProps) {
  const { getFilteredExpenses, removeExpense, getInstallmentNumber, selectedMonth, selectedYear } = useExpenses();
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<ExpenseItem | undefined>();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('date-desc');

  const meta = CATEGORY_META[category];
  const items = getFilteredExpenses(category);
  const total = items.reduce((sum, i) => sum + i.amount, 0);

  const filtered = items.filter(i =>
    i.description.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    switch (sortOrder) {
      case 'date-desc': return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'date-asc':  return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'amount-desc': return b.amount - a.amount;
      case 'amount-asc':  return a.amount - b.amount;
    }
  });

  const handleEdit = (item: ExpenseItem) => {
    setEditItem(item);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditItem(undefined);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirmDelete === id) {
      removeExpense(id);
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
            <span className="title-icon">{meta.icon}</span>
            {meta.title}
          </h1>
        </div>
        <MonthSelector />
      </header>

      <div className="detail-toolbar">
        <span className="detail-total">
          Total: <strong>{fmt(total)}</strong>
          <small> ({items.length} item{items.length !== 1 ? 's' : ''})</small>
        </span>
        <button className="btn btn-primary" onClick={handleAdd}>
          + Adicionar
        </button>
      </div>

      <div className="table-controls">
        <div className="search-wrapper">
          <Search size={15} className="search-icon" />
          <input
            className="search-input"
            type="text"
            placeholder="Buscar gasto..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="sort-buttons">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className={`sort-btn ${sortOrder === opt.value ? 'sort-btn--active' : ''}`}
              onClick={() => setSortOrder(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="empty-state">
          {search
            ? <p>Nenhum resultado para "<strong>{search}</strong>".</p>
            : <><p>Nenhum gasto registrado neste mês.</p>
                <button className="btn btn-primary" onClick={handleAdd}>Adicionar primeiro gasto</button></>
          }
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
              {sorted.map(item => {
                const n = item.installments ?? 1;
                const current = n > 1 ? getInstallmentNumber(item, selectedMonth, selectedYear) : null;
                return (
                  <tr key={item.id}>
                    <td>
                      <span className="item-desc-cell">{item.description}</span>
                      {current !== null && (
                        <span className="installment-badge">{current}/{n}</span>
                      )}
                    </td>
                    <td>{fmtDate(item.date)}</td>
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
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2}><strong>Total{search ? ' (filtrado)' : ''}</strong></td>
                <td className="col-amount amount-cell">
                  <strong>{fmt(filtered.reduce((s, i) => s + i.amount, 0))}</strong>
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {showModal && (
        <AddExpenseModal
          category={category}
          onClose={() => setShowModal(false)}
          editItem={editItem}
        />
      )}
    </div>
  );
}
