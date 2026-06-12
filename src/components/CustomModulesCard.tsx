import { useExpenses } from '../context/ExpenseContext';

interface CustomModulesCardProps {
  onViewAll: () => void;
}

export default function CustomModulesCard({ onViewAll }: CustomModulesCardProps) {
  const { customModules } = useExpenses();

  return (
    <div className="custom-modules-card">
      <div className="custom-modules-header">
        <h2 className="custom-modules-title">Meus Módulos</h2>
        <p className="custom-modules-count">{customModules.length} módulo{customModules.length !== 1 ? 's' : ''}</p>
      </div>

      {customModules.length === 0 ? (
        <div className="custom-modules-empty">
          <p>Crie seu primeiro módulo para rastrear despesas customizadas</p>
        </div>
      ) : (
        <ul className="custom-modules-list">
          {customModules.slice(0, 3).map(module => (
            <li key={module.id} className="custom-module-item">
              <div className="module-color-dot" style={{ backgroundColor: module.color }} />
              <span className="module-item-name">{module.name}</span>
            </li>
          ))}
          {customModules.length > 3 && (
            <li className="custom-module-more">+{customModules.length - 3} módulo{customModules.length - 3 !== 1 ? 's' : ''} a mais</li>
          )}
        </ul>
      )}

      <button className="btn-view-all" onClick={onViewAll}>
        {customModules.length === 0 ? 'Criar Módulo' : 'Ver Todos'}
      </button>
    </div>
  );
}
