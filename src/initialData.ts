import { Transaction, Budget, SavingsGoal, WishlistItem, EMITracker, QuickAddButton, RecurringTemplate } from './types';

export const initialTransactions: Transaction[] = [];

export const initialBudgets: Budget[] = [];

export const initialSavingsGoals: SavingsGoal[] = [];

export const initialWishlist: WishlistItem[] = [];

export const initialEMIs: EMITracker[] = [];

export const initialQuickAddButtons: QuickAddButton[] = [
  { id: 'qa-1', label: '☕ Tea / Coffee', amount: 50, type: 'expense', category: 'Tea/Coffee' },
  { id: 'qa-2', label: '🍕 Snacks', amount: 100, type: 'expense', category: 'Snacks' },
  { id: 'qa-3', label: '⛽ Fuel refuel', amount: 200, type: 'expense', category: 'Fuel' },
  { id: 'qa-4', label: '🛍️ Small Shopping', amount: 500, type: 'expense', category: 'Shopping' }
];

export const initialRecurringTemplates: RecurringTemplate[] = [
  { id: 'rt-1', title: 'Monthly House Rent Payment', amount: 18000, type: 'expense', category: 'Rent', paymentMethod: 'Net Banking' },
  { id: 'rt-2', title: 'Netflix Subscription Premium', amount: 649, type: 'expense', category: 'Netflix', paymentMethod: 'Credit Card' },
  { id: 'rt-3', title: 'Internet Broadband Bill', amount: 943, type: 'expense', category: 'Internet', paymentMethod: 'Debit Card' }
];
