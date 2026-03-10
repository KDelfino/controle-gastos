export type Category = 'cartao' | 'mensal' | 'geral';

export interface ExpenseItem {
  id: string;
  description: string;
  amount: number;        // valor por parcela
  date: string;          // YYYY-MM-DD — data da 1ª parcela
  category: Category;
  installments: number;  // 1 = único, N = repete por N meses
}
