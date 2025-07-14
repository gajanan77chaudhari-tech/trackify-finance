'use client';

import { useState, useMemo } from 'react';
import { type Transaction } from '@/types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { TransactionForm } from './transaction-form';
import { format, isSameDay } from 'date-fns';
import { ArrowUpCircle, ArrowDownCircle, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransactionHistoryProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  transactions: Transaction[];
  onTransactionChange: (transactions: Transaction[]) => void;
  onDeleteAll: () => void;
}

export function TransactionHistory({
  isOpen,
  onOpenChange,
  transactions,
  onTransactionChange,
  onDeleteAll
}: TransactionHistoryProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [transactions]);

  const handleEditClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleSaveTransaction = (transaction: Transaction) => {
    const isEditing = transactions.some(t => t.id === transaction.id);
    const newTransactions = isEditing
      ? transactions.map(t => (t.id === transaction.id ? transaction : t))
      : [...transactions, transaction];
    onTransactionChange(newTransactions);
    setIsFormOpen(false);
    setSelectedTransaction(null);
  };

  const handleDeleteTransaction = (transactionId: string) => {
    onTransactionChange(transactions.filter(t => t.id !== transactionId));
    setIsFormOpen(false);
    setSelectedTransaction(null);
  };
  
  const handleDeleteAll = () => {
    onDeleteAll();
    onOpenChange(false); // Close the sheet after deleting
  };

  const renderDateSeparator = (transaction: Transaction, index: number) => {
    if (index === 0) {
      return true;
    }
    const prevTransaction = sortedTransactions[index - 1];
    return !isSameDay(new Date(transaction.date), new Date(prevTransaction.date));
  };
  
  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle>Transaction History</SheetTitle>
            <SheetDescription>
              A complete list of all your recorded transactions.
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="flex-grow mt-4 pr-4">
            <div className="space-y-4">
              {sortedTransactions.map((transaction, index) => (
                <div key={transaction.id}>
                  {renderDateSeparator(transaction, index) && (
                    <div className="font-bold text-lg sticky top-0 bg-background py-2 my-2 border-b">
                      {format(new Date(transaction.date), 'MMMM d, yyyy')}
                    </div>
                  )}
                  <div className="flex items-center gap-4 group">
                    <div className="flex-shrink-0">
                      {transaction.type === 'income' ? (
                        <ArrowUpCircle className="w-6 h-6 text-green-500" />
                      ) : (
                        <ArrowDownCircle className="w-6 h-6 text-red-500" />
                      )}
                    </div>
                    <div className="flex-grow">
                      <p className="font-medium">{transaction.description}</p>
                      <div className="flex gap-1 flex-wrap mt-1">
                        {transaction.tags.map(tag => (
                            <span key={tag} className="text-xs px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={cn(
                          'font-mono font-semibold',
                          transaction.type === 'income'
                            ? 'text-green-500'
                            : 'text-red-500'
                        )}
                      >
                        {transaction.type === 'income' ? '+' : '-'}
                        {transaction.amount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => handleEditClick(transaction)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                           </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete this transaction.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteTransaction(transaction.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
              {sortedTransactions.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No transactions found.
                </p>
              )}
            </div>
          </ScrollArea>
          {sortedTransactions.length > 0 && (
            <SheetFooter className="mt-auto pt-4 border-t">
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <Button variant="destructive" className="w-full">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete All Transactions
                       </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete All Transactions?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete all of your transaction history. Are you absolutely sure?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAll}>Delete All</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <TransactionForm
              date={new Date(selectedTransaction.date)}
              onSave={handleSaveTransaction}
              existingTransaction={selectedTransaction}
              onDelete={selectedTransaction ? () => handleDeleteTransaction(selectedTransaction.id) : undefined}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
