'use client';

import { useState, useEffect } from 'react';
import { type Transaction } from '@/types';
import { Header } from '@/components/header';
import { MonthlyOverview } from '@/components/monthly-overview';
import { FinanceCalendar } from '@/components/finance-calendar';
import { TransactionHistory } from '@/components/transaction-history';

// Mock data for initial state
const initialTransactions: Transaction[] = [
    { id: '1', date: new Date(new Date().setDate(2)).toISOString(), description: 'Salary', amount: 3500, type: 'income', tags: ['work', 'payroll'] },
    { id: '2', date: new Date(new Date().setDate(2)).toISOString(), description: 'Rent', amount: 1200, type: 'expense', tags: ['housing'] },
    { id: '3', date: new Date(new Date().setDate(5)).toISOString(), description: 'Groceries', amount: 150, type: 'expense', tags: ['food'] },
    { id: '4', date: new Date(new Date().setDate(10)).toISOString(), description: 'Freelance Project', amount: 500, type: 'income', tags: ['side-hustle'] },
    { id: '5', date: new Date(new Date().setDate(12)).toISOString(), description: 'Internet Bill', amount: 60, type: 'expense', tags: ['utilities'] },
];

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isMounted, setIsMounted] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Load from localStorage if available
    try {
      const savedTransactions = localStorage.getItem('transactions');
      if (savedTransactions) {
        setTransactions(JSON.parse(savedTransactions));
      } else {
        setTransactions(initialTransactions);
      }
    } catch (error) {
      console.error("Could not parse transactions from localStorage", error);
      setTransactions(initialTransactions);
    }
  }, []);

  useEffect(() => {
    if(isMounted) {
      // Save to localStorage whenever transactions change
      localStorage.setItem('transactions', JSON.stringify(transactions));
    }
  }, [transactions, isMounted]);

  const handleTransactionChange = (newTransactions: Transaction[]) => {
    setTransactions(newTransactions);
  };

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-headline">Loading Trackify Finance...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header onHistoryClick={() => setIsHistoryOpen(true)} />
      <main className="container mx-auto p-4 md:p-8 flex-grow">
        <MonthlyOverview transactions={transactions} currentDate={currentDate} />
        <FinanceCalendar
          transactions={transactions}
          onTransactionChange={handleTransactionChange}
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
        />
      </main>
      <TransactionHistory 
        isOpen={isHistoryOpen}
        onOpenChange={setIsHistoryOpen}
        transactions={transactions}
        onTransactionChange={handleTransactionChange}
      />
      <footer className="text-center p-4 text-muted-foreground text-sm">
        <p>Built with ❤️ for financial clarity.</p>
      </footer>
    </div>
  );
}
