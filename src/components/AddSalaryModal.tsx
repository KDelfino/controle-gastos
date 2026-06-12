import { useState } from 'react';
import type { SalaryItem } from '../types';
import { useExpenses } from '../context/ExpenseContext';

interface AddSalaryModalProps {
  onClose: () => void;
  editItem?: SalaryItem;
}

const fmt = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export default function AddSalaryModal({ onClose, editItem }: AddSalaryModalProps) {
  const { addSalary, updateSalary, selectedMonth, selectedYear } = useExpenses();

  const defaultYearMonth = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;

  const [amount, setAmount] = useState(editItem?.amount?.toString() ?? '');
  const [yearMonth, setYearMonth] = useState(editItem?.yearMonth ?? defaultYearMonth);
  const [description, setDescription] = useState(editItem?.description ?? '');

  const parsedAmount = parseFloat(amount.replace(',', '.')) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      amount: parsedAmount,
      yearMonth,
      description: description.trim() || undefined,
    };
    if (editItem) {
      updateSalary(editItem.id, payload);
    } else {
      addSalary(payload);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3 className="modal-title">{editItem ? 'Editar Salário' : 'Novo Salário'}</h3>
        <form onSubmit={handleSubmit} className="modal-form">
          <label className="form-label">
            Valor (R$)
            <input
              className="form-input"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
              autoFocus
            />
            {parsedAmount > 0 && (
              <span className="form-hint">
                Total: {fmt(parsedAmount)}
              </span>
            )}
          </label>

          <label className="form-label">
            Mês
            <input
              className="form-input"
              type="month"
              value={yearMonth}
              onChange={e => setYearMonth(e.target.value)}
              required
            />
          </label>

          <label className="form-label">
            Descrição (opcional)
            <input
              className="form-input"
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ex: Salário, Freelance, Bônus"
              maxLength={100}
            />
          </label>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
