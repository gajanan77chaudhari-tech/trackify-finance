export type Transaction = {
  id: string;
  date: string; // Using ISO string for date serialization
  description: string;
  amount: number;
  type: 'income' | 'expense';
  tags: string[];
};

export type PrivateContent = {
    id: string;
    type: 'note' | 'photo';
    content: string; // note content or photo data URI
    createdAt: string;
};
