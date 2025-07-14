// This is a mock database service. In a real application, you would replace this with a connection to a real database like Firestore.
'use server';
import { Transaction } from '@/types';

// Mock database
let transactions: Transaction[] = [
    { id: '1', date: new Date(new Date().setDate(2)).toISOString(), description: 'Salary', amount: 3500, type: 'income', tags: ['work', 'payroll'] },
    { id: '2', date: new Date(new Date().setDate(2)).toISOString(), description: 'Rent', amount: 1200, type: 'expense', tags: ['housing'] },
    { id: '3', date: new Date(new Date().setDate(5)).toISOString(), description: 'Groceries', amount: 150, type: 'expense', tags: ['food'] },
    { id: '4', date: new Date(new Date().setDate(10)).toISOString(), description: 'Freelance Project', amount: 500, type: 'income', tags: ['side-hustle'] },
    { id: '5', date: new Date(new Date().setDate(12)).toISOString(), description: 'Internet Bill', amount: 60, type: 'expense', tags: ['utilities'] },
];

export async function getTransactions(): Promise<Transaction[]> {
    // In a real DB, you'd fetch from the database here.
    return Promise.resolve(transactions);
}

export async function addTransaction(transaction: Transaction): Promise<Transaction> {
    // In a real DB, you'd insert a new document.
    transactions.push(transaction);
    return Promise.resolve(transaction);
}

export async function updateTransaction(id: string, updatedTransaction: Partial<Omit<Transaction, 'id'>>): Promise<Transaction | null> {
    // In a real DB, you'd update a document.
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
        transactions[index] = { ...transactions[index], ...updatedTransaction };
        return Promise.resolve(transactions[index]);
    }
    return Promise.resolve(null);
}

export async function deleteTransaction(id: string): Promise<boolean> {
    // In a real DB, you'd delete a document.
    const initialLength = transactions.length;
    transactions = transactions.filter(t => t.id !== id);
    return Promise.resolve(transactions.length < initialLength);
}

export async function deleteAllTransactions(): Promise<boolean> {
    // In a real DB, you would delete all documents in a collection.
    transactions = [];
    return Promise.resolve(true);
}
