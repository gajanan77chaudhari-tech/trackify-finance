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
import { Checkbox } from '@/components/ui/checkbox';

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
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState<Set<string>>(new Set());

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [transactions]);
  
  const allTransactionIds = useMemo(() => sortedTransactions.map(t => t.id), [sortedTransactions]);

  const handleEditClick = (transaction: Transaction) => {
    if (isDeleteMode) return;
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

  const toggleDeleteSelection = (id: string) => {
    setSelectedToDelete(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedToDelete(new Set(allTransactionIds));
    } else {
      setSelectedToDelete(new Set());
    }
  };

  const handleDeleteSelected = () => {
    const remainingTransactions = transactions.filter(t => !selectedToDelete.has(t.id));
    onTransactionChange(remainingTransactions);
    setSelectedToDelete(new Set());
    setIsDeleteMode(false);
  }

  const renderDateSeparator = (transaction: Transaction, index: number) => {
    if (index === 0) {
      return true;
    }
    const prevTransaction = sortedTransactions[index - 1];
    return !isSameDay(new Date(transaction.date), new Date(prevTransaction.date));
  };
  
  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => {
          onOpenChange(open);
          if (!open) {
              setIsDeleteMode(false);
              setSelectedToDelete(new Set());
          }
      }}>
        <SheetContent className="w-full sm:max-w-md flex flex-col">
          <SheetHeader className="flex flex-row justify-between items-start">
            <div>
              <SheetTitle>Transaction History</SheetTitle>
              <SheetDescription>
                A complete list of all your recorded transactions.
              </SheetDescription>
            </div>
            {sortedTransactions.length > 0 && (
                <Button variant={isDeleteMode ? "secondary" : "ghost"} size="icon" className="w-8 h-8" onClick={() => {
                    setIsDeleteMode(!isDeleteMode);
                    setSelectedToDelete(new Set());
                }}>
                    <Trash2 className="w-4 h-4" />
                </Button>
            )}
          </SheetHeader>

          {isDeleteMode && sortedTransactions.length > 0 && (
            <div className="flex items-center space-x-2 py-2 border-b">
              <Checkbox 
                id="select-all" 
                checked={selectedToDelete.size > 0 && selectedToDelete.size === sortedTransactions.length}
                onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
              />
              <label htmlFor="select-all" className="text-sm font-medium leading-none">
                Select All ({selectedToDelete.size}/{sortedTransactions.length})
              </label>
            </div>
          )}

          <ScrollArea className="flex-grow mt-4 pr-4">
            <div className="space-y-4">
              {sortedTransactions.map((transaction, index) => (
                <div key={transaction.id}>
                  {renderDateSeparator(transaction, index) && (
                    <div className="font-bold text-lg sticky top-0 bg-background py-2 my-2 border-b">
                      {format(new Date(transaction.date), 'MMMM d, yyyy')}
                    </div>
                  )}
                  <div className="flex items-center gap-4 group" onClick={() => isDeleteMode && toggleDeleteSelection(transaction.id)}>
                    {isDeleteMode && (
                      <Checkbox 
                        checked={selectedToDelete.has(transaction.id)}
                        onCheckedChange={() => toggleDeleteSelection(transaction.id)}
                        className="mr-2"
                      />
                    )}
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
                    <div className={cn("flex opacity-0 group-hover:opacity-100 transition-opacity", isDeleteMode && "hidden")}>
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
          
          <SheetFooter className="mt-auto pt-4 border-t">
              {isDeleteMode && selectedToDelete.size > 0 ? (
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <Button variant="destructive" className="w-full">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Selected ({selectedToDelete.size})
                       </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete {selectedToDelete.size} transaction(s)?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the selected transactions.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteSelected}>Confirm Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
              ) : isDeleteMode ? (
                  <Button variant="outline" className="w-full" onClick={() => setIsDeleteMode(false)}>
                    Cancel
                  </Button>
              ) : (
                null
            )}
            </SheetFooter>
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
