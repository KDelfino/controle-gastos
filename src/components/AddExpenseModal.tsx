import { useState } from 'react';
import type { Category, ExpenseItem } from '../types';
import { useExpenses } from '../context/ExpenseContext';

interface AddExpenseModalProps {
  category: Category | string;
  onClose: () => void;
  editItem?: ExpenseItem;
}

const fmt = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export default function AddExpenseModal({ category, onClose, editItem }: AddExpenseModalProps) {
  const { addExpense, updateExpense, selectedMonth, selectedYear } = useExpenses();

  const defaultDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;

  const [description, setDescription] = useState(editItem?.description ?? '');
  const [amount, setAmount] = useState(editItem?.amount?.toString() ?? '');
  const [date, setDate] = useState(editItem?.date ?? defaultDate);
  const [installmentsInput, setInstallmentsInput] = useState(editItem?.installments?.toString() ?? '1');

  const parsedAmount = parseFloat(amount.replace(',', '.')) || 0;
  const installmentsNum = Math.max(1, parseInt(installmentsInput) || 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      description: description.trim(),
      amount: parsedAmount,
      date,
      category,
      installments: installmentsNum,
    };
    if (editItem) {
      updateExpense(editItem.id, payload);
    } else {
      addExpense(payload);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3 className="modal-title">{editItem ? 'Editar Gasto' : 'Novo Gasto'}</h3>
        {editItem && (editItem.installments ?? 1) > 1 && (
          <p className="modal-edit-warning">Editar aqui altera todas as parcelas.</p>
        )}
        <form onSubmit={handleSubmit} className="modal-form">
          <label className="form-label">
            Descrição
            <input
              className="form-input"
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
              autoFocus
              maxLength={100}
            />
          </label>

          <label className="form-label">
            {installmentsNum > 1 ? 'Valor por parcela (R$)' : 'Valor (R$)'}
            <input
              className="form-input"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
            />
            {installmentsNum > 1 && parsedAmount > 0 && (
              <span className="form-hint">
                Total: {fmt(parsedAmount * installmentsNum)} em {installmentsNum}x
              </span>
            )}
          </label>

          <label className="form-label">
            Parcelas
            <div className="installments-row">
              <input
                className="form-input installments-input"
                type="number"
                min={1}
                max={360}
                value={installmentsInput}
                onChange={e => setInstallmentsInput(e.target.value)}
                required
              />
              <span className="installments-hint">
                {installmentsNum === 1 ? 'pagamento único' : `${installmentsNum} meses`}
              </span>
            </div>
          </label>

          <label className="form-label">
            {installmentsNum > 1 ? 'Data da 1ª parcela' : 'Data'}
            <input
              className="form-input"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
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
