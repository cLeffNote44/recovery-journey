/**
 * Quotes Store
 *
 * Manages motivational quotes, favorites, and custom quotes
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Quote, CustomQuote } from '@/types/app';
import { getQuoteOfTheDay, getRandomQuote, getContextualQuote } from '@/lib/quotes';

interface QuotesState {
  // State
  currentQuote: Quote;
  favoriteQuotes: string[];
  customQuotes: CustomQuote[];

  // Actions
  setCurrentQuote: (quote: Quote) => void;
  setFavoriteQuotes: (quotes: string[]) => void;
  setCustomQuotes: (quotes: CustomQuote[]) => void;
  refreshQuote: () => void;

  // Helpers
  addFavoriteQuote: (quoteText: string) => void;
  removeFavoriteQuote: (quoteText: string) => void;
  addCustomQuote: (quote: CustomQuote) => void;
}

export const useQuotesStore = create<QuotesState>()(
  persist(
    (set) => ({
      // Initial state
      currentQuote: getQuoteOfTheDay(),
      favoriteQuotes: [],
      customQuotes: [],

      // Actions
      setCurrentQuote: (quote) => set({ currentQuote: quote }),
      setFavoriteQuotes: (quotes) => set({ favoriteQuotes: quotes }),
      setCustomQuotes: (quotes) => set({ customQuotes: quotes }),
      refreshQuote: () =>
        set({
          currentQuote: getRandomQuote(),
        }),

      // Helper methods
      addFavoriteQuote: (quoteText) =>
        set((state) => ({
          favoriteQuotes: state.favoriteQuotes.includes(quoteText)
            ? state.favoriteQuotes
            : [...state.favoriteQuotes, quoteText],
        })),
      removeFavoriteQuote: (quoteText) =>
        set((state) => ({
          favoriteQuotes: state.favoriteQuotes.filter((q) => q !== quoteText),
        })),
      addCustomQuote: (quote) =>
        set((state) => ({
          customQuotes: [...state.customQuotes, quote],
        })),
    }),
    {
      name: 'quotes-store',
    }
  )
);
