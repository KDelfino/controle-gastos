import { useState } from 'react';
import type { Category, ExpenseItem, ExpenseType } from '../types';
import { EXPENSE_TYPES } from '../types';
import { useExpenses } from '../context/ExpenseContext';
import MonthSelector from '../components/MonthSelector';
import AddExpenseModal from '../components/AddExpenseModal';
import { 
  CreditCard, 
  CalendarDays, 
  ShoppingBag, 
  ArrowLeft, 
  Pen, 
  Search, 
  Trash2, 
  Plus,
  Repeat,
  Utensils, 
  Receipt, 
  GraduationCap, 
  Car, 
  Gamepad2, 
  Tv, 
  Shirt, 
  HeartPulse,
  AlertTriangle
} from "lucide-react";

interface CategoryPageProps {
  category: Category | string;
  onBack: () => void;
}

const CATEGORY_META: Record<Category, { title: string; icon: React.ReactNode; accentColor: string }> = {
  cartao: { title: 'Cartão de Crédito', icon: <CreditCard size={18} />, accentColor: '#38bdf8' },
  mensal: { title: 'Contas Mensais', icon: <CalendarDays size={18} />, accentColor: '#a855f7' },
  geral: { title: 'Gastos Gerais', icon: <ShoppingBag size={18} />, accentColor: '#f59e0b' },
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  Utensils: <Utensils size={13} />,
  Receipt: <Receipt size={13} />,
  GraduationCap: <GraduationCap size={13} />,
  Car: <Car size={13} />,
  ShoppingBag: <ShoppingBag size={13} />,
  Gamepad2: <Gamepad2 size={13} />,
  Tv: <Tv size={13} />,
  Shirt: <Shirt size={13} />,
  HeartPulse: <HeartPulse size={13} />,
};

const fmt = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const fmtDate = (date: string) => {
  const parts = date ? date.split('-') : [];
  if (parts.length < 3) return date || '-';
  const [year, month, day] = parts;
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
  const { 
    getFilteredExpenses, 
    removeExpense, 
    cancelRecurringExpense, 
    getInstallmentNumber, 
    selectedMonth, 
    selectedYear, 
    customModules 
  } = useExpenses();

  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<ExpenseItem | undefined>();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [recurringItemToCancel, setRecurringItemToCancel] = useState<ExpenseItem | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ExpenseType | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('date-desc');

  const builtInMeta = CATEGORY_META[category as Category];
  const customModule = customModules.find(m => m.id === category);
  const title = builtInMeta?.title || customModule?.name || 'Gastos';
  const icon = builtInMeta?.icon || null;
  const accentColor = customModule?.color || builtInMeta?.accentColor || '#38bdf8';

  const items = getFilteredExpenses(category);
  const total = items.reduce((sum, i) => sum + i.amount, 0);

  const filtered = items.filter(i => {
    const matchesSearch = i.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || i.type === typeFilter;
    return matchesSearch && matchesType;
  });

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

  const handleDeleteClick = (item: ExpenseItem) => {
    if (item.recurring) {
      // Se for recorrente, abre diálogo de escolha inteligente: encerrar a partir daqui ou apagar tudo
      setRecurringItemToCancel(item);
    } else {
      // Se for parcelado ou comum, confirma exclusão direta
      if (confirmDelete === item.id) {
        removeExpense(item.id);
        setConfirmDelete(null);
      } else {
        setConfirmDelete(item.id);
      }
    }
  };

  const handleConfirmCancelRecurringFromNow = async () => {
    if (!recurringItemToCancel) return;
    // O mês anterior ao selecionado se torna o último mês ativo
    let prevMonth = selectedMonth - 1;
    let prevYear = selectedYear;
    if (prevMonth < 1) {
      prevMonth = 12;
      prevYear -= 1;
    }
    await cancelRecurringExpense(recurringItemToCancel.id, prevYear, prevMonth);
    setRecurringItemToCancel(null);
  };

  const handleConfirmDeleteRecurringAll = async () => {
    if (!recurringItemToCancel) return;
    await removeExpense(recurringItemToCancel.id);
    setRecurringItemToCancel(null);
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
              {icon && (
                <span style={{ 
                  display: 'inline-flex', 
                  padding: '6px', 
                  borderRadius: 'var(--radius-sm)', 
                  background: 'var(--surface)', 
                  border: '1px solid var(--border)',
                  color: accentColor 
                }}>
                  {icon}
                </span>
              )}
              <h1 className="app-title" style={{ fontSize: '1.35rem' }}>{title}</h1>
            </div>
          </div>
        </div>
        <MonthSelector />
      </header>

      <div className="detail-toolbar">
        <span className="detail-total">
          Total de saídas: <strong>{fmt(total)}</strong>
          <small>({items.length} {items.length === 1 ? 'item' : 'itens'})</small>
        </span>
        <button className="btn btn-primary" onClick={handleAdd}>
          <Plus size={16} /> Adicionar lançamento
        </button>
      </div>

      <div className="table-controls">
        <div className="search-wrapper">
          <Search size={15} className="search-icon" />
          <input
            className="search-input"
            type="text"
            placeholder="Buscar por descrição..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* FILTRO RÁPIDO POR TIPO DE GASTO */}
        <div className="type-filter-bar">
          <button
            className={`type-filter-pill ${typeFilter === 'all' ? 'is-active' : ''}`}
            onClick={() => setTypeFilter('all')}
          >
            Todos os tipos
          </button>
          {EXPENSE_TYPES.map(t => {
            const isActive = typeFilter === t.id;
            return (
              <button
                key={t.id}
                className={`type-filter-pill ${isActive ? 'is-active' : ''}`}
                style={{
                  '--pill-color': t.color,
                  borderColor: isActive ? t.color : undefined,
                  color: isActive ? t.color : undefined,
                } as React.CSSProperties}
                onClick={() => setTypeFilter(isActive ? 'all' : t.id)}
              >
                <span>{TYPE_ICONS[t.iconName]}</span>
                <span>{t.label}</span>
              </button>
            );
          })}
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
          {search || typeFilter !== 'all'
            ? <p>Nenhum lançamento encontrado para os filtros selecionados.</p>
            : <><p>Nenhum gasto registrado nesta categoria para o mês selecionado.</p>
                <button className="btn btn-primary" onClick={handleAdd}><Plus size={16} /> Adicionar primeiro gasto</button></>
          }
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="expense-table">
            <thead>
              <tr>
                <th>Descrição & Tipo</th>
                <th>Data</th>
                <th className="col-amount">Valor</th>
                <th className="col-actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(item => {
                const n = item.installments ?? 1;
                const isRec = !!item.recurring;
                const current = !isRec && n > 1 ? getInstallmentNumber(item, selectedMonth, selectedYear) : null;
                const typeConfig = item.type ? EXPENSE_TYPES.find(t => t.id === item.type) : undefined;

                return (
                  <tr key={item.id}>
                    <td>
                      {current !== null && current === n && (
                        <div className="last-installment-label">Última parcela</div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                        <span className="item-desc-cell">{item.description}</span>
                        
                        {/* TAG DE RECORRÊNCIA CONTÍNUA */}
                        {isRec && (
                          <span className="recurring-badge" title="Gasto contínuo cobrado todo mês">
                            <Repeat size={11} /> Todo mês
                          </span>
                        )}

                        {/* TAG DE PARCELAS */}
                        {current !== null && (
                          <span className="installment-badge">{current}/{n}</span>
                        )}

                        {/* TAG DE TIPO DE GASTO */}
                        {typeConfig && (
                          <span 
                            className="expense-type-tag"
                            style={{ 
                              color: typeConfig.color, 
                              background: `${typeConfig.color}15`, 
                              borderColor: `${typeConfig.color}35` 
                            }}
                          >
                            {TYPE_ICONS[typeConfig.iconName]}
                            <span>{typeConfig.label}</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>{fmtDate(item.date)}</td>
                    <td className="col-amount amount-cell num-font">{fmt(item.amount)}</td>
                    <td className="col-actions">
                      <button className="btn-icon" title="Editar" onClick={() => handleEdit(item)}>
                        <Pen size={14} />
                      </button>
                      <button
                        className={`btn-icon ${confirmDelete === item.id ? 'btn-icon--danger' : ''}`}
                        title={confirmDelete === item.id ? 'Confirmar exclusão' : 'Excluir / Cancelar'}
                        onClick={() => handleDeleteClick(item)}
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
                <td colSpan={2}><strong>Total {search || typeFilter !== 'all' ? 'filtrado' : 'da categoria'}</strong></td>
                <td className="col-amount amount-cell num-font">
                  <strong>{fmt(filtered.reduce((s, i) => s + i.amount, 0))}</strong>
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* MODAL DE ENCERRAMENTO INTELIGENTE DE GASTO CONTÍNUO */}
      {recurringItemToCancel && (
        <div className="modal-overlay" onClick={() => setRecurringItemToCancel(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', color: 'var(--money-warn)' }}>
              <AlertTriangle size={22} />
              <h3 className="modal-title" style={{ margin: 0 }}>Gerenciar Gasto Contínuo</h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '18px', lineHeight: 1.5 }}>
              O item <strong>"{recurringItemToCancel.description}"</strong> é cobrado todo mês. Como você deseja proceder?
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                type="button" 
                className="btn" 
                style={{ 
                  background: 'var(--surface-raised)', 
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
                onClick={handleConfirmCancelRecurringFromNow}
              >
                <strong style={{ fontSize: '0.88rem' }}>🔒 Encerrar a partir deste mês</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  Mantém salvo nos meses anteriores e não aparecerá a partir deste mês em diante.
                </span>
              </button>

              <button 
                type="button" 
                className="btn btn-ghost" 
                style={{ 
                  color: 'var(--money-out)', 
                  borderColor: 'var(--money-out-border)',
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
                onClick={handleConfirmDeleteRecurringAll}
              >
                <strong style={{ fontSize: '0.88rem' }}>🗑️ Excluir de todos os meses</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  Apaga completamente o registro e o histórico de todos os meses passados e futuros.
                </span>
              </button>

              <button 
                type="button" 
                className="btn btn-ghost" 
                style={{ marginTop: '8px' }}
                onClick={() => setRecurringItemToCancel(null)}
              >
                Voltar / Cancelar
              </button>
            </div>
          </div>
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
