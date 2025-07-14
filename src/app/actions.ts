'use server';

import { categorizeTransaction } from '@/ai/flows/categorize-transaction';

export async function getCategorySuggestions(description: string): Promise<string[]> {
  if (!description) {
    return [];
  }
  try {
    const result = await categorizeTransaction({ description });
    return result.categorySuggestions || [];
  } catch (error) {
    console.error('Error fetching category suggestions:', error);
    return [];
  }
}
