import { useState } from 'react';
import type { SalaryItem } from '../types';
import { useExpenses } from '../context/ExpenseContext';

interface AddEarningsModalProps {
  onClose: () => void;
  editItem?: SalaryItem;
}

const fmt = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export default function AddEarningsModal({ onClose, editItem }: AddEarningsModalProps) {
  const { addSalary, updateSalary, selectedMonth, selectedYear } = useExpenses();

  const defaultDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;

  const [amount, setAmount] = useState(editItem?.amount?.toString() ?? '');
  const [date, setDate] = useState(editItem?.date ?? defaultDate);
  const [description, setDescription] = useState(editItem?.description ?? '');
  const [installmentsInput, setInstallmentsInput] = useState(editItem?.installments?.toString() ?? '1');

  const parsedAmount = parseFloat(amount.replace(',', '.')) || 0;
  const installmentsNum = Math.max(1, parseInt(installmentsInput) || 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      amount: parsedAmount,
      date,
      description: description.trim() || undefined,
      installments: installmentsNum,
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
        <h3 className="modal-title">{editItem ? 'Editar Ganho' : 'Novo Ganho'}</h3>
        <form onSubmit={handleSubmit} className="modal-form">
          <label className="form-label">
            Valor do ganho (R$)
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
                Valor: {fmt(parsedAmount)} {installmentsNum > 1 && `(Total: ${fmt(parsedAmount * installmentsNum)} em ${installmentsNum}x)`}
              </span>
            )}
          </label>

          <label className="form-label">
            Parcelas / Repetições (meses)
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
                {installmentsNum === 1 ? 'recebimento único' : `${installmentsNum} meses`}
              </span>
            </div>
          </label>

          <label className="form-label">
            {installmentsNum > 1 ? 'Data do 1º recebimento' : 'Data'}
            <input
              className="form-input"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
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
              placeholder="Ex: Salário, Freelance, Rendimentos"
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
