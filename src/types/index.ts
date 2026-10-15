export type Category = 'cartao' | 'mensal' | 'geral';

export type ExpenseType =
  | 'alimentacao'
  | 'contas'
  | 'educacao'
  | 'transporte'
  | 'compras'
  | 'games'
  | 'assinaturas'
  | 'roupa'
  | 'saude';

export interface ExpenseTypeConfig {
  id: ExpenseType;
  label: string;
  color: string;
  iconName: string; // nome do ícone Lucide
}

export const EXPENSE_TYPES: ExpenseTypeConfig[] = [
  { id: 'alimentacao', label: 'Alimentação', color: '#10b981', iconName: 'Utensils' },
  { id: 'contas',      label: 'Contas',      color: '#f43f5e', iconName: 'Receipt' },
  { id: 'educacao',    label: 'Educação',    color: '#8b5cf6', iconName: 'GraduationCap' },
  { id: 'transporte',  label: 'Transporte',  color: '#06b6d4', iconName: 'Car' },
  { id: 'compras',     label: 'Compras',     color: '#f59e0b', iconName: 'ShoppingBag' },
  { id: 'games',       label: 'Games',       color: '#ec4899', iconName: 'Gamepad2' },
  { id: 'assinaturas', label: 'Assinaturas', color: '#6366f1', iconName: 'Tv' },
  { id: 'roupa',       label: 'Roupa',       color: '#14b8a6', iconName: 'Shirt' },
  { id: 'saude',       label: 'Saúde',       color: '#ef4444', iconName: 'HeartPulse' },
];

export interface ExpenseItem {
  id: string;
  description: string;
  amount: number;               // valor por parcela ou valor mensal do contínuo
  date: string;                 // YYYY-MM-DD — data de início / 1ª parcela
  category: Category | string;  // categoria mãe (cartão, mensal, geral, etc.)
  installments: number;         // 1 = único, N = repete por N meses (quando não é recorrente)
  type?: ExpenseType;           // tipo/subcategoria para agrupamentos e gráficos
  recurring?: boolean;          // true = gasto contínuo sem término fixo
  endDate?: string;             // YYYY-MM — se cancelado/encerrado, último mês em que vigorou
}

export interface SalaryItem {
  id: string;
  amount: number;        // valor do ganho
  date: string;          // YYYY-MM-DD — data do 1º recebimento
  description?: string;  // opcional, ex: "Freelance", "Salário"
  installments: number;  // 1 = único, N = repete por N meses
}

export interface CustomModule {
  id: string;
  name: string;           // ex: "Gastos da Maria"
  color: string;          // ex: "#ff6b6b"
  description?: string;   // ex: "Despesas pessoais"
  createdAt: string;      // YYYY-MM-DD
}