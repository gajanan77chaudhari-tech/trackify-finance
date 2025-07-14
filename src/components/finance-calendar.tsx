'use client';

import { useState } from 'react';
import { type Transaction } from '@/types';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
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
import { ChevronLeft, ChevronRight, PlusCircle, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TransactionForm } from './transaction-form';

interface FinanceCalendarProps {
  transactions: Transaction[];
  onTransactionChange: (transactions: Transaction[]) => void;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
}

export function FinanceCalendar({ transactions, onTransactionChange, currentDate, setCurrentDate }: FinanceCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
    setIsDialogOpen(false);
  };
  
  const handleDeleteTransaction = (transactionId: string) => {
    onTransactionChange(transactions.filter(t => t.id !== transactionId));
    setIsDialogOpen(false);
  };

  const openDialog = (date: Date, transaction: Transaction | null = null) => {
    setSelectedDate(date);
    setSelectedTransaction(transaction);
    setIsDialogOpen(true);
  };

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
            <div key={day} className="text-center font-medium text-muted-foreground p-2 border-b text-sm">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 auto-rows-auto">
          {days.map(day => {
            const dailyTransactions = transactions.filter(t => isSameDay(new Date(t.date), day));
            const dailyIncome = dailyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
            const dailyExpense = dailyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

            return (
              <div
                key={day.toString()}
                className={cn(
                  'relative p-2 border-r border-b flex flex-col min-h-[120px] md:min-h-[140px] group transition-colors hover:bg-muted/50',
                  !isSameMonth(day, currentDate) && 'text-muted-foreground bg-muted/20',
                  isToday(day) && 'bg-accent/10'
                )}
              >
                <div className="flex justify-between items-start">
                  <span className={cn("text-sm font-bold", isToday(day) && "text-accent-foreground bg-accent rounded-full w-6 h-6 flex items-center justify-center")}>{format(day, 'd')}</span>
                  <Button variant="ghost" size="icon" className="w-6 h-6 opacity-0 group-hover:opacity-100 focus:opacity-100" onClick={() => openDialog(day)}>
                    <PlusCircle className="w-4 h-4" />
                  </Button>
                </div>

                {dailyTransactions.length > 0 && (
                  <div className="mt-1 flex-grow overflow-y-auto text-xs space-y-1">
                      {dailyTransactions.map(t => (
                          <div key={t.id} onClick={() => openDialog(day, t)} className="cursor-pointer flex items-center gap-1 p-1 rounded hover:bg-accent/20">
                             {t.type === 'income' ? <ArrowUpCircle className="w-3 h-3 text-green-500 shrink-0" /> : <ArrowDownCircle className="w-3 h-3 text-red-500 shrink-0" />}
                             <span className="truncate flex-1">{t.description}</span>
                             <span className="font-mono">{t.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                          </div>
                      ))}
                  </div>
                )}
                
                {(dailyIncome > 0 || dailyExpense > 0) && (
                  <div className="mt-auto pt-1 text-[10px] text-right space-y-0.5">
                    {dailyIncome > 0 && <div className="text-green-500 font-semibold leading-none">+{dailyIncome.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>}
                    {dailyExpense > 0 && <div className="text-red-500 font-semibold leading-none">-{dailyExpense.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{selectedTransaction ? 'Edit Transaction' : 'Add Transaction'} for {selectedDate && format(selectedDate, 'MMMM d, yyyy')}</DialogTitle>
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
