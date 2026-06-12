import { useState } from 'react';
import type { CustomModule } from '../types';
import { useExpenses } from '../context/ExpenseContext';
import AddCustomModuleModal from '../components/AddCustomModuleModal';
import { MoveLeft, Plus, Pen, Trash2 } from 'lucide-react';

interface CustomModulesPageProps {
  onNavigate: (moduleId: string) => void;
  onBack: () => void;
}

export default function CustomModulesPage({ onNavigate, onBack }: CustomModulesPageProps) {
  const { customModules, removeCustomModule } = useExpenses();
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<CustomModule | undefined>();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleEdit = (item: CustomModule) => {
    setEditItem(item);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditItem(undefined);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirmDelete === id) {
      removeCustomModule(id);
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
          <h1 className="app-title">Meus Módulos</h1>
        </div>
      </header>

      <div className="detail-toolbar">
        <span className="detail-total">
          {customModules.length} módulo{customModules.length !== 1 ? 's' : ''}
        </span>
        <button className="btn btn-primary" onClick={handleAdd}>
          <Plus size={16} /> Novo Módulo
        </button>
      </div>

      {customModules.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum módulo customizado criado.</p>
          <button className="btn btn-primary" onClick={handleAdd}>
            Criar primeiro módulo
          </button>
        </div>
      ) : (
        <div className="modules-list">
          {customModules.map(module => (
            <div key={module.id} className="module-row" onClick={() => onNavigate(module.id)}>
              <div className="module-info">
                <div className="module-color-circle" style={{ backgroundColor: module.color }} />
                <div className="module-details">
                  <h3 className="module-name">{module.name}</h3>
                  {module.description && <p className="module-desc">{module.description}</p>}
                </div>
              </div>
              <div className="module-actions">
                <button
                  className="btn-icon"
                  title="Editar"
                  onClick={e => {
                    e.stopPropagation();
                    handleEdit(module);
                  }}
                >
                  <Pen size={14} />
                </button>
                <button
                  className={`btn-icon ${confirmDelete === module.id ? 'btn-icon--danger' : ''}`}
                  title={confirmDelete === module.id ? 'Confirmar exclusão' : 'Excluir'}
                  onClick={e => {
                    e.stopPropagation();
                    handleDelete(module.id);
                  }}
                >
                  {confirmDelete === module.id ? '✓' : <Trash2 size={14} />}
                </button>
                {confirmDelete === module.id && (
                  <button
                    className="btn-icon"
                    title="Cancelar"
                    onClick={e => {
                      e.stopPropagation();
                      setConfirmDelete(null);
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <AddCustomModuleModal onClose={() => setShowModal(false)} editItem={editItem} />}
    </div>
  );
}
