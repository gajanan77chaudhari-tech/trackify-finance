'use client';

import { useState, useEffect } from 'react';
import { type Transaction } from '@/types';
import { Header } from '@/components/header';
import { MonthlyOverview } from '@/components/monthly-overview';
import { FinanceCalendar } from '@/components/finance-calendar';
import { TransactionHistory } from '@/components/transaction-history';
import { addTransaction, deleteTransaction, getTransactions, updateTransaction, deleteAllTransactions } from '@/services/db';


export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isMounted, setIsMounted] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    async function loadTransactions() {
      const fetchedTransactions = await getTransactions();
      setTransactions(fetchedTransactions);
      setIsMounted(true);
    }
    loadTransactions();
  }, []);


  const handleTransactionChange = async (newTransactions: Transaction[]) => {
    // This function will now handle individual operations: add, update, delete
    const oldIds = new Set(transactions.map(t => t.id));
    const newIds = new Set(newTransactions.map(t => t.id));

    // Handle deletions
    for (const oldTx of transactions) {
      if (!newIds.has(oldTx.id)) {
        await deleteTransaction(oldTx.id);
      }
    }

    // Handle additions and updates
    for (const newTx of newTransactions) {
      if (!oldIds.has(newTx.id)) {
        await addTransaction(newTx); // Add new
      } else {
        const oldTx = transactions.find(t => t.id === newTx.id);
        if (oldTx && JSON.stringify(oldTx) !== JSON.stringify(newTx)) {
            await updateTransaction(newTx.id, newTx); // Update existing
        }
      }
    }
    const fetchedTransactions = await getTransactions();
    setTransactions(fetchedTransactions);
  };
  
  const handleDeleteAllTransactions = async () => {
    await deleteAllTransactions();
    const fetchedTransactions = await getTransactions();
    setTransactions(fetchedTransactions);
  }

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
        onDeleteAll={handleDeleteAllTransactions}
      />
      <footer className="text-center p-4 text-muted-foreground text-sm">
        <p>Built with ❤️ for financial clarity.</p>
      </footer>
    </div>
  );
}
