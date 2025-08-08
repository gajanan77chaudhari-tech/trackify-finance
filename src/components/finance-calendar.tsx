
'use client';

import { useState } from 'react';
import { type Transaction } from '@/types';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  add,
  sub,
  isToday,
  isSameMonth,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ChevronLeft, ChevronRight, PlusCircle, ArrowUpCircle, ArrowDownCircle, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { TransactionForm } from './transaction-form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


interface FinanceCalendarProps {
  transactions: Transaction[];
  onTransactionChange: (transactions: Transaction[]) => void;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
}

export function FinanceCalendar({ transactions, onTransactionChange, currentDate, setCurrentDate }: FinanceCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const prevMonth = () => setCurrentDate(sub(currentDate, { months: 1 }));
  const nextMonth = () => setCurrentDate(add(currentDate, { months: 1 }));

  const handleSaveTransaction = (transaction: Transaction) => {
    const isEditing = transactions.some(t => t.id === transaction.id);
    const newTransactions = isEditing
      ? transactions.map(t => (t.id === transaction.id ? transaction : t))
      : [...transactions, transaction];
    onTransactionChange(newTransactions);
    setIsFormOpen(false);
  };
  
  const handleDeleteTransaction = (transactionId: string) => {
    onTransactionChange(transactions.filter(t => t.id !== transactionId));
    setIsFormOpen(false);
  };

  const openFormDialog = (date: Date, transaction: Transaction | null = null) => {
    setSelectedDate(date);
    setSelectedTransaction(transaction);
    setIsListOpen(false); // Close list if open
    setIsFormOpen(true);
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setIsListOpen(true);
  };
  
  const closeListAndOpenForm = () => {
      if (selectedDate) {
          openFormDialog(selectedDate, null);
      }
  }

  const dailyTransactionsForSelectedDate = selectedDate
    ? transactions.filter(t => isSameDay(new Date(t.date), selectedDate as Date))
    : [];

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <>
      <Card className="overflow-hidden shadow-lg">
        <div className="p-4 bg-card-foreground/5">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-xl md:text-2xl font-bold">{format(currentDate, 'MMMM yyyy')}</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={prevMonth} aria-label="Previous month">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth} aria-label="Next month">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-7 border-t">
          {weekdays.map(day => (
            <div key={day} className="text-center font-medium bg-[#2E2EFF] text-white p-2 border-b text-sm">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 auto-rows-auto">
          {days.map(day => {
            const dailyTransactions = transactions.filter(t => isSameDay(new Date(t.date), day));
            
            return (
              <div
                key={day.toString()}
                onClick={() => handleDayClick(day)}
                className={cn(
                  'relative p-2 border-r border-b flex flex-col min-h-[120px] md:min-h-[100px] group transition-colors hover:bg-accent cursor-pointer',
                  !isSameMonth(day, currentDate) && 'bg-muted/20',
                  isToday(day) && 'bg-green-100 dark:bg-green-900/30'
                )}
              >
                <div className="flex justify-between items-start">
                  <span className={cn(
                    "text-sm font-semibold", 
                     isToday(day) ? "text-white bg-green-500 rounded-full w-6 h-6 flex items-center justify-center" : isSameMonth(day, currentDate) ? "text-black" : "text-[#ADADAD]"
                    )}>{format(day, 'd')}</span>
                </div>
                {dailyTransactions.length > 0 && (
                    <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-primary"></div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
      
      <Dialog open={isListOpen} onOpenChange={setIsListOpen}>
        <DialogContent className="max-h-[80vh] flex flex-col">
            <DialogHeader>
                <DialogTitle>Transactions for {selectedDate && format(selectedDate, 'MMMM d, yyyy')}</DialogTitle>
                <DialogDescription>
                    {dailyTransactionsForSelectedDate.length > 0 ? `You have ${dailyTransactionsForSelectedDate.length} transaction(s) on this date.` : 'No transactions for this date.'}
                </DialogDescription>
            </DialogHeader>
            <div className="flex-grow overflow-y-auto pr-4 -mr-4 space-y-3">
              {dailyTransactionsForSelectedDate.length > 0 ? (
                  dailyTransactionsForSelectedDate.map(transaction => (
                      <div key={transaction.id} className="flex items-center gap-4 group">
                          <div className="flex-shrink-0">
                              {transaction.type === 'income' ? <ArrowUpCircle className="w-6 h-6 text-green-500" /> : <ArrowDownCircle className="w-6 h-6 text-red-500" />}
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
                              <p className={cn('font-mono font-semibold', transaction.type === 'income' ? 'text-green-500' : 'text-red-500')}>
                                {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                           </div>
                           <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => openFormDialog(new Date(transaction.date), transaction)}><Edit className="w-4 h-4" /></Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>This action cannot be undone. This will permanently delete this transaction.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteTransaction(transaction.id)}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                           </div>
                      </div>
                  ))
              ) : (
                  <p className="text-muted-foreground text-center py-8">Click "Add New Transaction" to get started.</p>
              )}
            </div>
             <div className="mt-auto pt-4 border-t">
                <Button onClick={closeListAndOpenForm} className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Transaction
                </Button>
            </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{selectedTransaction ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
                 <DialogDescription>{selectedDate && format(selectedDate, 'MMMM d, yyyy')}</DialogDescription>
            </DialogHeader>
            {selectedDate && (
                <TransactionForm 
                  date={selectedDate}
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
