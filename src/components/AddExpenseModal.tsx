import { useState } from 'react';
import type { Category, ExpenseItem, ExpenseType } from '../types';
import { EXPENSE_TYPES } from '../types';
import { useExpenses } from '../context/ExpenseContext';
import { 
  Utensils, 
  Receipt, 
  GraduationCap, 
  Car, 
  ShoppingBag, 
  Gamepad2, 
  Tv, 
  Shirt, 
  HeartPulse,
  Repeat,
  Calendar
} from 'lucide-react';

interface AddExpenseModalProps {
  category: Category | string;
  onClose: () => void;
  editItem?: ExpenseItem;
}

const fmt = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const TYPE_ICONS: Record<string, React.ReactNode> = {
  Utensils: <Utensils size={14} />,
  Receipt: <Receipt size={14} />,
  GraduationCap: <GraduationCap size={14} />,
  Car: <Car size={14} />,
  ShoppingBag: <ShoppingBag size={14} />,
  Gamepad2: <Gamepad2 size={14} />,
  Tv: <Tv size={14} />,
  Shirt: <Shirt size={14} />,
  HeartPulse: <HeartPulse size={14} />,
};

export default function AddExpenseModal({ category, onClose, editItem }: AddExpenseModalProps) {
  const { addExpense, updateExpense, selectedMonth, selectedYear } = useExpenses();

  const defaultDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;

  const [description, setDescription] = useState(editItem?.description ?? '');
  const [amount, setAmount] = useState(editItem?.amount?.toString() ?? '');
  const [date, setDate] = useState(editItem?.date ?? defaultDate);
  const [selectedType, setSelectedType] = useState<ExpenseType | undefined>(editItem?.type);
  const [isRecurring, setIsRecurring] = useState<boolean>(editItem?.recurring ?? false);
  const [installmentsInput, setInstallmentsInput] = useState(editItem?.installments?.toString() ?? '1');

  const parsedAmount = parseFloat(amount.replace(',', '.')) || 0;
  const installmentsNum = Math.max(1, parseInt(installmentsInput) || 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Omit<ExpenseItem, 'id'> = {
      description: description.trim(),
      amount: parsedAmount,
      date,
      category,
      installments: isRecurring ? 1 : installmentsNum,
      recurring: isRecurring,
      type: selectedType,
      ...(editItem?.endDate ? { endDate: editItem.endDate } : {}),
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 className="modal-title" style={{ margin: 0 }}>{editItem ? 'Editar Gasto' : 'Novo Gasto'}</h3>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </div>

        {editItem && (editItem.installments ?? 1) > 1 && !editItem.recurring && (
          <p className="modal-edit-warning">Editar aqui altera todas as parcelas.</p>
        )}
        {editItem && editItem.recurring && (
          <p className="modal-edit-warning" style={{ color: 'var(--accent)', background: 'rgba(56, 189, 248, 0.08)', borderColor: 'rgba(56, 189, 248, 0.2)' }}>
            Gasto recorrente (todo mês). As alterações se aplicam aos meses ativos.
          </p>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <label className="form-label">
            Descrição
            <input
              className="form-input"
              type="text"
              placeholder="Ex: Convênio Unimed, Almoço, Supermercado..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
              autoFocus
              maxLength={100}
            />
          </label>

          {/* SELETOR DE TIPO DE GASTO */}
          <div className="form-group">
            <span className="form-label" style={{ marginBottom: '6px' }}>
              Tipo de Gasto (Classificação)
            </span>
            <div className="expense-type-grid">
              {EXPENSE_TYPES.map(t => {
                const isSelected = selectedType === t.id;
                return (
                  <button
                    type="button"
                    key={t.id}
                    className={`expense-type-chip ${isSelected ? 'is-selected' : ''}`}
                    style={{
                      '--chip-color': t.color,
                      borderColor: isSelected ? t.color : undefined,
                    } as React.CSSProperties}
                    onClick={() => setSelectedType(isSelected ? undefined : t.id)}
                  >
                    <span className="chip-icon" style={{ color: t.color }}>
                      {TYPE_ICONS[t.iconName]}
                    </span>
                    <span className="chip-label">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MODO: RECORRENTE X PARCELADO */}
          <div className="form-group">
            <span className="form-label" style={{ marginBottom: '6px' }}>
              Frequência da Despesa
            </span>
            <div className="recurrence-toggle-group">
              <button
                type="button"
                className={`recurrence-tab ${!isRecurring ? 'is-active' : ''}`}
                onClick={() => setIsRecurring(false)}
              >
                <Calendar size={14} />
                <span>Parcelas Fixas / Único</span>
              </button>
              <button
                type="button"
                className={`recurrence-tab ${isRecurring ? 'is-active' : ''}`}
                onClick={() => setIsRecurring(true)}
              >
                <Repeat size={14} />
                <span>Gasto Contínuo (Todo Mês)</span>
              </button>
            </div>
            {isRecurring ? (
              <span className="recurrence-hint">
                Cobrado todos os meses a partir da data inicial (ex: convênio, aluguel, internet). Você poderá cancelá-lo quando quiser.
              </span>
            ) : null}
          </div>

          <label className="form-label">
            {isRecurring ? 'Valor Mensal (R$)' : installmentsNum > 1 ? 'Valor por parcela (R$)' : 'Valor (R$)'}
            <input
              className="form-input"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0,00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
            />
            {!isRecurring && installmentsNum > 1 && parsedAmount > 0 && (
              <span className="form-hint">
                Total: {fmt(parsedAmount * installmentsNum)} em {installmentsNum}x
              </span>
            )}
          </label>

          {!isRecurring && (
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
          )}

          <label className="form-label">
            {isRecurring ? 'Mês / Data de Início' : installmentsNum > 1 ? 'Data da 1ª parcela' : 'Data'}
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
