import { useState } from 'react';
import type { CustomModule } from '../types';
import { useExpenses } from '../context/ExpenseContext';

interface AddCustomModuleModalProps {
  onClose: () => void;
  editItem?: CustomModule;
}

const PRESET_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];

export default function AddCustomModuleModal({ onClose, editItem }: AddCustomModuleModalProps) {
  const { addCustomModule, updateCustomModule } = useExpenses();

  const [name, setName] = useState(editItem?.name ?? '');
  const [color, setColor] = useState(editItem?.color ?? PRESET_COLORS[0]);
  const [description, setDescription] = useState(editItem?.description ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: name.trim(),
      color,
      description: description.trim() || undefined,
    };
    if (editItem) {
      updateCustomModule(editItem.id, payload);
    } else {
      addCustomModule(payload);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3 className="modal-title">{editItem ? 'Editar Módulo' : 'Novo Módulo'}</h3>
        <form onSubmit={handleSubmit} className="modal-form">
          <label className="form-label">
            Nome do Módulo *
            <input
              className="form-input"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
              maxLength={50}
              placeholder="Ex: Gastos da Maria"
            />
          </label>

          <label className="form-label">
            Descrição (opcional)
            <input
              className="form-input"
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={100}
              placeholder="Ex: Despesas pessoais"
            />
          </label>

          <label className="form-label">
            Cor do Módulo
            <div className="color-picker">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  className={`color-option ${color === c ? 'color-option--active' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                  title={c}
                />
              ))}
            </div>
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
