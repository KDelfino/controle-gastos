export type Category = 'cartao' | 'mensal' | 'geral';

export interface ExpenseItem {
  id: string;
  description: string;
  amount: number;        // valor por parcela
  date: string;          // YYYY-MM-DD — data da 1ª parcela
  category: Category | string;  // pode ser categoria padrão ou nome de módulo customizado
  installments: number;  // 1 = único, N = repete por N meses
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