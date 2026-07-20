export type Currency = '₹' | '$' | '€';
export type PaymentMethod = 'Cash' | 'UPI' | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'Wallet' | 'Other';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  paymentMethod: PaymentMethod;
  notes: string;
  isRecurring: boolean;
  recurringInterval?: 'monthly' | 'weekly';
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentSaved: number;
  deadline: string;
}

export interface WishlistItem {
  id: string;
  product: string;
  price: number;
  priority: 'High' | 'Medium' | 'Low';
  purchased: boolean;
}

export interface EMITracker {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  remainingMonths: number;
  isPaidThisMonth: boolean;
}

export interface QuickAddButton {
  id: string;
  label: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
}

export interface RecurringTemplate {
  id: string;
  title: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
  paymentMethod: PaymentMethod;
  lastProcessedMonth?: string; // Format: 'YYYY-MM'
}

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'info' | 'warning' | 'error';
}
