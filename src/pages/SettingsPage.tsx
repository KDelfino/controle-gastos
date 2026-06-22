import { useState } from 'react';
import { usePreferences, type ModuleType } from '../context/PreferencesContext';
import { useExpenses } from '../context/ExpenseContext';
import MonthSelector from '../components/MonthSelector';
import { MoveLeft, Settings, Plus, Pen, Trash2, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

interface SettingsPageProps {
  onBack: () => void;
}

const MODULES_INFO: Record<ModuleType, { title: string; description: string; icon: string }> = {
  earnings: {
    title: 'Ganhos',
    description: 'Mostra seus ganhos mensais (salário, freelance, etc) e o saldo (entradas - gastos)',
    icon: '💰',
  },
  cartao: {
    title: 'Cartão de Crédito',
    description: 'Rastreie seus gastos com cartão de crédito',
    icon: '💳',
  },
  mensal: {
    title: 'Contas Mensais',
    description: 'Controle suas contas fixas (aluguel, internet, etc)',
    icon: '📋',
  },
  geral: {
    title: 'Gastos Gerais',
    description: 'Registre gastos diversos e sem categoria',
    icon: '📝',
  },
};

const COLOR_OPTIONS = [
  '#ef4444', // red
  '#f59e0b', // orange
  '#eab308', // yellow
  '#10b981', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#a855f7', // purple
  '#ec4899', // pink
];

export default function SettingsPage({ onBack }: SettingsPageProps) {
  const { enabledModules, toggleModule, isEnabled } = usePreferences();
  const { customModules, addCustomModule, removeCustomModule, updateCustomModule } = useExpenses();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formColor, setFormColor] = useState(COLOR_OPTIONS[6]); // purple default

  const modules: ModuleType[] = ['earnings', 'cartao', 'mensal', 'geral'];

  const handleCreate = () => {
    if (!formName.trim()) return;
    
    const newModule = {
      id: `custom_${Date.now()}`,
      name: formName,
      description: formDesc,
      color: formColor,
      createdAt: new Date().toISOString(),
    };

    addCustomModule(newModule);
    setFormName('');
    setFormDesc('');
    setFormColor(COLOR_OPTIONS[6]);
    setShowCreateModal(false);
  };

  const handleEdit = (id: string) => {
    const module = customModules.find(m => m.id === id);
    if (module) {
      setEditingId(id);
      setFormName(module.name);
      setFormDesc(module.description || '');
      setFormColor(module.color);
    }
  };

  const handleSaveEdit = () => {
    if (!formName.trim() || !editingId) return;
    
    updateCustomModule(editingId, {
      name: formName,
      description: formDesc,
      color: formColor,
    });
    
    setEditingId(null);
    setFormName('');
    setFormDesc('');
    setFormColor(COLOR_OPTIONS[6]);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormName('');
    setFormDesc('');
    setFormColor(COLOR_OPTIONS[6]);
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
              <Settings size={20} />
            </span>
            Configurações
          </h1>
        </div>
        <MonthSelector />
      </header>

      <div className="settings-container">
        <section className="settings-section">
          <h2 className="settings-section-title">Módulos</h2>
          <p className="settings-section-desc">
            Escolha quais módulos você quer usar no Dashboard. Seus dados continuam salvos mesmo com o módulo desativado.
          </p>

          <div className="modules-grid">
            {modules.map(module => (
              <div key={module} className="module-card">
                <label className="module-checkbox-wrapper">
                  <input
                    type="checkbox"
                    checked={isEnabled(module)}
                    onChange={() => toggleModule(module)}
                    className="module-checkbox"
                  />
                  <div className="module-label">
                    <span className="module-icon">{MODULES_INFO[module].icon}</span>
                    <div>
                      <h3 className="module-title">{MODULES_INFO[module].title}</h3>
                      <p className="module-description">{MODULES_INFO[module].description}</p>
                    </div>
                  </div>
                </label>
              </div>
            ))}
          </div>

          <div className="settings-info">
            <p>
              <strong>Módulos ativados:</strong> {enabledModules.length > 0 ? enabledModules.length : 'Nenhum'}
            </p>
            {enabledModules.length === 0 && (
              <p style={{ color: '#ef4444', marginTop: '8px' }}>
                ⚠️ Ative pelo menos um módulo para usar o app.
              </p>
            )}
          </div>
        </section>

        <section className="settings-section">
          <div className="section-header">
            <h2 className="settings-section-title">Módulos Customizados</h2>
            <button 
              className="btn btn-primary btn-small"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={16} /> Novo Módulo
            </button>
          </div>
          <p className="settings-section-desc">
            Crie módulos personalizados para organizar seus gastos da forma que quiser.
          </p>

          {customModules.length === 0 ? (
            <div className="settings-empty">
              <p>Nenhum módulo customizado criado ainda.</p>
            </div>
          ) : (
            <div className="custom-modules-list">
              {customModules.map(module => (
                <div key={module.id} className="custom-module-item">
                  <div 
                    className="custom-module-color"
                    style={{ backgroundColor: module.color }}
                  />
                  <div className="custom-module-info">
                    <h3 className="custom-module-name">{module.name}</h3>
                    {module.description && (
                      <p className="custom-module-desc">{module.description}</p>
                    )}
                  </div>
                  <div className="custom-module-actions">
                    <button
                      className="btn-icon"
                      onClick={() => handleEdit(module.id)}
                      title="Editar"
                    >
                      <Pen size={16} />
                    </button>
                    <button
                      className="btn-icon btn-icon-danger"
                      onClick={() => removeCustomModule(module.id)}
                      title="Deletar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {(showCreateModal || editingId) && (
          <div className="modal-overlay" onClick={() => {
            setShowCreateModal(false);
            handleCancelEdit();
          }}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h2 className="modal-title">
                {editingId ? 'Editar Módulo' : 'Novo Módulo'}
              </h2>

              <div className="form-group">
                <label className="form-label">Nome do Módulo</label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="Ex: Gastos da Maria, Despesas da Casa"
                  className="form-input"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Descrição (opcional)</label>
                <input
                  type="text"
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  placeholder="Ex: Despesas compartilhadas da casa"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Cor</label>
                <div className="color-picker">
                  {COLOR_OPTIONS.map(color => (
                    <button
                      key={color}
                      className={`color-option ${formColor === color ? 'color-option--active' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormColor(color)}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowCreateModal(false);
                    handleCancelEdit();
                  }}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-primary"
                  onClick={editingId ? handleSaveEdit : handleCreate}
                >
                  {editingId ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </div>
          </div>
        )}

        <section className="settings-section" style={{ marginTop: '24px' }}>
          <h2 className="settings-section-title">Conta</h2>
          <p className="settings-section-desc">
            Conectado como <strong>{auth.currentUser?.email || 'Usuário'}</strong>
          </p>
          <button 
            className="btn btn-ghost" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              color: '#f87171', 
              borderColor: 'rgba(239, 68, 68, 0.2)' 
            }} 
            onClick={async () => {
              try {
                await signOut(auth);
              } catch (err) {
                console.error("Erro ao deslogar:", err);
              }
            }}
          >
            <LogOut size={16} /> Sair da Conta
          </button>
        </section>
      </div>
    </div>
  );
}
