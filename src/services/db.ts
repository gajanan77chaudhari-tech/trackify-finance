// This is a mock database service. In a real application, you would replace this with a connection to a real database like Firestore.
'use server';
import { Transaction, PrivacySettings, PrivateContent } from '@/types';

// Mock database
let transactions: Transaction[] = [];

let privacySettings: PrivacySettings | null = null;
let privateContent: PrivateContent[] = [];


// Transactions
export async function getTransactions(): Promise<Transaction[]> {
    return Promise.resolve(transactions);
}

export async function addTransaction(transaction: Transaction): Promise<Transaction> {
    transactions.push(transaction);
    return Promise.resolve(transaction);
}

export async function updateTransaction(id: string, updatedTransaction: Partial<Omit<Transaction, 'id'>>): Promise<Transaction | null> {
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
        transactions[index] = { ...transactions[index], ...updatedTransaction };
        return Promise.resolve(transactions[index]);
    }
    return Promise.resolve(null);
}

export async function deleteTransaction(id: string): Promise<boolean> {
    const initialLength = transactions.length;
    transactions = transactions.filter(t => t.id !== id);
    return Promise.resolve(transactions.length < initialLength);
}

export async function deleteAllTransactions(): Promise<boolean> {
    transactions = [];
    return Promise.resolve(true);
}


// Privacy and Secure Storage
export async function getPrivacySettings(): Promise<PrivacySettings | null> {
    return Promise.resolve(privacySettings);
}

export async function savePrivacySettings(settings: PrivacySettings): Promise<void> {
    // In a real app, you would hash the password before saving
    privacySettings = settings;
    return Promise.resolve();
}

export async function getPrivateData(): Promise<PrivateContent[]> {
    const sortedData = [...privateContent].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return Promise.resolve(sortedData);
}

export async function savePrivateData(item: Omit<PrivateContent, 'id'>): Promise<PrivateContent> {
    const newItem = { ...item, id: crypto.randomUUID() };
    privateContent.push(newItem);
    return Promise.resolve(newItem);
}
