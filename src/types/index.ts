export type Transaction = {
  id: string;
  date: string; // Using ISO string for date serialization
  description: string;
  amount: number;
  type: 'income' | 'expense';
  tags: string[];
};
