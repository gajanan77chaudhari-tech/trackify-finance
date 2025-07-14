'use client';

import { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { getCategorySuggestions } from '@/app/actions';
import { type Transaction } from '@/types';
import { Loader2, Sparkles } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

const formSchema = z.object({
  description: z.string().min(2, 'Description must be at least 2 characters.'),
  amount: z.coerce.number().positive('Amount must be a positive number.'),
  type: z.enum(['income', 'expense']),
});

type TransactionFormValues = z.infer<typeof formSchema>;

interface TransactionFormProps {
  onSave: (data: Transaction) => void;
  onDelete?: () => void;
  existingTransaction?: Transaction | null;
  date: Date;
}

export function TransactionForm({ onSave, onDelete, existingTransaction, date }: TransactionFormProps) {
  const [isPending, startTransition] = useTransition();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>(existingTransaction?.tags || []);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: existingTransaction?.description || '',
      amount: existingTransaction?.amount || 0,
      type: existingTransaction?.type || 'expense',
    },
  });

  const descriptionValue = form.watch('description');
  const debouncedDescription = useDebounce(descriptionValue, 500);

  useEffect(() => {
    if (debouncedDescription && debouncedDescription.length > 2) {
      startTransition(async () => {
        const result = await getCategorySuggestions(debouncedDescription);
        setSuggestions(result.filter(s => !selectedTags.includes(s)));
      });
    } else {
      setSuggestions([]);
    }
  }, [debouncedDescription, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
    setSuggestions(prev => prev.filter(s => s !== tag));
  };
  
  const handleSave = (values: TransactionFormValues) => {
    const transaction: Transaction = {
      id: existingTransaction?.id || crypto.randomUUID(),
      date: date.toISOString(),
      tags: selectedTags,
      ...values,
    };
    onSave(transaction);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Coffee, Salary, Rent" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select transaction type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {(isPending || suggestions.length > 0 || selectedTags.length > 0) && (
          <div className="space-y-2">
            <FormLabel className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Tags
            </FormLabel>
            <div className="flex flex-wrap gap-2 min-h-[28px] items-center">
              {selectedTags.map(tag => (
                <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => toggleTag(tag)}>
                  {tag}
                </Badge>
              ))}
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {!isPending && suggestions.map(suggestion => (
                <Badge key={suggestion} variant="outline" className="cursor-pointer" onClick={() => toggleTag(suggestion)}>
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4">
            {existingTransaction && onDelete && (
                <Button type="button" variant="destructive" onClick={onDelete}>
                    Delete
                </Button>
            )}
          <Button type="submit" className="ml-auto">
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {existingTransaction ? 'Save Changes' : 'Add Transaction'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
