// This is a mock database service. In a real application, you would replace this with a connection to a real database like Firestore.
'use server';
import { Transaction, PrivateContent } from '@/types';
import { isSameDay, isSameMinute } from 'date-fns';

// Mock database
let transactions: Transaction[] = [];
let privateContent: PrivateContent[] = [];
let privacyPassword: string | null = null;
let privacyUnlockDateTime: Date | null = null;


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


// Privacy and Secure Storage - All functionality has been removed.
export async function getPrivateData(): Promise<PrivateContent[]> {
    return Promise.resolve([]);
}

export async function savePrivateData(item: Omit<PrivateContent, 'id' | 'createdAt'>): Promise<PrivateContent> {
    const newItem = { ...item, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    // No longer saving
    return Promise.resolve(newItem);
}

export async function hasPrivacyPassword(): Promise<boolean> {
    return Promise.resolve(false);
}

export async function setPrivacyPassword(password: string): Promise<void> {
    privacyPassword = null;
    return Promise.resolve();
}

export async function checkPrivacyPassword(password: string): Promise<boolean> {
    return Promise.resolve(false);
}

export async function setPrivacyUnlockDateTime(date: Date): Promise<void> {
    privacyUnlockDateTime = null;
    return Promise.resolve();
}

export async function checkPrivacyUnlockDateTime(date: Date): Promise<boolean> {
    return Promise.resolve(false);
}
