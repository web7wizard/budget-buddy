import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  ListTodo, 
  Calendar, 
  PiggyBank, 
  Target, 
  Settings, 
  Heart, 
  Plus, 
  Sparkles, 
  Sun, 
  Moon, 
  Info, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  Download, 
  Upload, 
  Trash2, 
  Edit, 
  Copy, 
  RefreshCw, 
  User,
  CreditCard,
  DollarSign,
  Briefcase,
  X,
  Filter,
  Check,
  Percent,
  SlidersHorizontal,
  Flame,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { 
  Transaction, 
  Budget, 
  SavingsGoal, 
  WishlistItem, 
  EMITracker, 
  QuickAddButton, 
  RecurringTemplate,
  ToastMessage,
  Currency,
  PaymentMethod
} from './types';
import { 
  initialTransactions, 
  initialBudgets, 
  initialSavingsGoals, 
  initialWishlist, 
  initialEMIs, 
  initialQuickAddButtons, 
  initialRecurringTemplates 
} from './initialData';
import { getCategoryIcon, getCategoryColor } from './components/CategoryIcons';
import { DailySpendingAndInsights } from './components/DailySpendingAndInsights';
import { WishlistAndEMI } from './components/WishlistAndEMI';
import { FinanceCalendar } from './components/FinanceCalendar';
import { GoalsTracker } from './components/GoalsTracker';
import { BudgetPlanner } from './components/BudgetPlanner';
import { FinanceCharts } from './components/FinanceCharts';

export default function App() {
  // User Profile Session State
  const [userProfile, setUserProfile] = useState<{
    name: string;
    email: string;
    monthlyBudget: number;
    initialBalance: number;
  } | null>(() => {
    const saved = localStorage.getItem('bb_user_profile');
    return saved ? JSON.parse(saved) : null;
  });

  // Setup Form States
  const [setupName, setSetupName] = useState('');
  const [setupEmail, setSetupEmail] = useState('');
  const [setupCurrency, setSetupCurrency] = useState<Currency>('₹');
  const [setupMonthlyBudget, setSetupMonthlyBudget] = useState('');
  const [setupInitialBalance, setSetupInitialBalance] = useState('');

  // Core States (Loaded from LocalStorage)
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('bb_transactions');
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('bb_budgets');
    return saved ? JSON.parse(saved) : initialBudgets;
  });

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem('bb_goals');
    return saved ? JSON.parse(saved) : initialSavingsGoals;
  });

  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => {
    const saved = localStorage.getItem('bb_wishlist');
    return saved ? JSON.parse(saved) : initialWishlist;
  });

  const [emis, setEMIs] = useState<EMITracker[]>(() => {
    const saved = localStorage.getItem('bb_emis');
    return saved ? JSON.parse(saved) : initialEMIs;
  });

  const [quickAddButtons, setQuickAddButtons] = useState<QuickAddButton[]>(() => {
    const saved = localStorage.getItem('bb_quickadd');
    return saved ? JSON.parse(saved) : initialQuickAddButtons;
  });

  const [recurringTemplates, setRecurringTemplates] = useState<RecurringTemplate[]>(() => {
    const saved = localStorage.getItem('bb_recurring');
    return saved ? JSON.parse(saved) : initialRecurringTemplates;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currency, setCurrency] = useState<Currency>(() => {
    return (localStorage.getItem('bb_currency') as Currency) || '₹';
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('bb_theme');
    return saved ? saved === 'dark' : true; // Default to premium dark mode
  });

  const [enableAnimations, setEnableAnimations] = useState<boolean>(() => {
    const saved = localStorage.getItem('bb_animations');
    return saved ? saved === 'true' : true;
  });

  const [enableNotifications, setEnableNotifications] = useState<boolean>(() => {
    const saved = localStorage.getItem('bb_notifications');
    return saved ? saved === 'true' : true;
  });

  // UI Flow States
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Search, Sort, Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState<'all' | 'today' | 'week' | 'month' | 'year' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' | 'title'>('date-desc');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Transaction Form States
  const [txTitle, setTxTitle] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [txCategory, setTxCategory] = useState('Food');
  const [txDate, setTxDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [txPaymentMethod, setTxPaymentMethod] = useState<PaymentMethod>('UPI');
  const [txNotes, setTxNotes] = useState('');
  const [txIsRecurring, setTxIsRecurring] = useState(false);

  // Custom Quick Add config States
  const [qaLabel, setQaLabel] = useState('');
  const [qaAmount, setQaAmount] = useState('');
  const [qaCategory, setQaCategory] = useState('Food');

  // Input refs
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Synchronize LocalStorage
  useEffect(() => {
    localStorage.setItem('bb_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('bb_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('bb_goals', JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  useEffect(() => {
    localStorage.setItem('bb_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('bb_emis', JSON.stringify(emis));
  }, [emis]);

  useEffect(() => {
    localStorage.setItem('bb_quickadd', JSON.stringify(quickAddButtons));
  }, [quickAddButtons]);

  useEffect(() => {
    localStorage.setItem('bb_recurring', JSON.stringify(recurringTemplates));
  }, [recurringTemplates]);

  useEffect(() => {
    localStorage.setItem('bb_currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('bb_theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('bb_animations', String(enableAnimations));
  }, [enableAnimations]);

  useEffect(() => {
    localStorage.setItem('bb_notifications', String(enableNotifications));
  }, [enableNotifications]);

  // Toast System Helper
  const showToast = (text: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    if (!enableNotifications) return;
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + N -> New Transaction
      if (e.ctrlKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setIsAddTxOpen(true);
        setEditingTransaction(null);
      }
      // Ctrl + F -> Focus Search box
      if (e.ctrlKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setActiveTab('transactions');
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      // Esc -> Close Modals
      if (e.key === 'Escape') {
        setIsAddTxOpen(false);
        setEditingTransaction(null);
        setShowResetConfirm(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Process automatic monthly recurring expenses on launch!
  useEffect(() => {
    const currentYearMonth = new Date().toISOString().substring(0, 7); // 'YYYY-MM'
    let newlyProcessedCount = 0;

    const updatedTemplates = recurringTemplates.map(template => {
      // Check if already processed this month
      if (template.lastProcessedMonth === currentYearMonth) {
        return template;
      }

      // Verify if there's already a transaction matching this description in the current month to prevent duplicate auto-debit triggers
      const alreadyLogged = transactions.some(t => 
        t.category === template.category && 
        t.date.startsWith(currentYearMonth) && 
        t.title.includes(template.title)
      );

      if (alreadyLogged) {
        return { ...template, lastProcessedMonth: currentYearMonth };
      }

      // Auto-generate the transaction on the 1st of the month (or today if launching later)
      const dateOfDebit = `${currentYearMonth}-01`;
      const newTx: Transaction = {
        id: `tx-recur-${Date.now()}-${Math.random()}`,
        title: `Auto-Processed: ${template.title}`,
        amount: template.amount,
        type: template.type,
        category: template.category,
        date: dateOfDebit,
        paymentMethod: template.paymentMethod,
        notes: 'Automatically generated monthly subscription payment.',
        isRecurring: true
      };

      setTransactions(prev => [newTx, ...prev]);
      newlyProcessedCount++;

      return { ...template, lastProcessedMonth: currentYearMonth };
    });

    if (newlyProcessedCount > 0) {
      setRecurringTemplates(updatedTemplates);
      showToast(`Automatically processed ${newlyProcessedCount} monthly recurring expenses!`, 'info');
    }
  }, []);

  // Trigger celebration confetti
  const triggerCelebration = () => {
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
    }, 6000);
  };

  // Transaction CRUD Operations
  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txTitle.trim() || !txAmount || !txDate) {
      showToast('Please fill out all mandatory fields.', 'error');
      return;
    }

    const amt = parseFloat(txAmount);
    if (isNaN(amt) || amt <= 0) {
      showToast('Please enter a positive numeric transaction amount.', 'error');
      return;
    }

    if (editingTransaction) {
      // Edit mode
      const updated = transactions.map(t => {
        if (t.id === editingTransaction.id) {
          return {
            ...t,
            title: txTitle.trim(),
            amount: amt,
            type: txType,
            category: txCategory,
            date: txDate,
            paymentMethod: txPaymentMethod,
            notes: txNotes.trim(),
            isRecurring: txIsRecurring
          };
        }
        return t;
      });
      setTransactions(updated);
      showToast(`"${txTitle}" transaction updated successfully!`, 'success');
    } else {
      // New mode
      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        title: txTitle.trim(),
        amount: amt,
        type: txType,
        category: txCategory,
        date: txDate,
        paymentMethod: txPaymentMethod,
        notes: txNotes.trim(),
        isRecurring: txIsRecurring
      };
      setTransactions([newTx, ...transactions]);
      showToast(`Added transaction: "${txTitle}"!`, 'success');

      // Check if we went over budget for this category
      if (txType === 'expense') {
        const catBudget = budgets.find(b => b.category === txCategory);
        if (catBudget) {
          const currentMonthStr = new Date().toISOString().substring(0, 7);
          const totalSpent = [newTx, ...transactions]
            .filter(t => t.type === 'expense' && t.category === txCategory && t.date.startsWith(currentMonthStr))
            .reduce((sum, t) => sum + t.amount, 0);

          if (totalSpent > catBudget.limit) {
            showToast(`⚠️ OVER-BUDGET ALERT! "${txCategory}" limit of ${currency}${catBudget.limit.toLocaleString()} exceeded!`, 'warning');
          }
        }
      }
    }

    // Reset Form & Close Modal
    setIsAddTxOpen(false);
    setEditingTransaction(null);
    setTxTitle('');
    setTxAmount('');
    setTxNotes('');
    setTxIsRecurring(false);
  };

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setTxTitle(tx.title);
    setTxAmount(String(tx.amount));
    setTxType(tx.type);
    setTxCategory(tx.category);
    setTxDate(tx.date);
    setTxPaymentMethod(tx.paymentMethod);
    setTxNotes(tx.notes);
    setTxIsRecurring(tx.isRecurring);
    setIsAddTxOpen(true);
  };

  const handleDeleteTransaction = (id: string) => {
    const tx = transactions.find(t => t.id === id);
    setTransactions(prev => prev.filter(t => t.id !== id));
    if (tx) showToast(`Deleted transaction: "${tx.title}"`, 'info');
  };

  const handleDuplicateTransaction = (tx: Transaction) => {
    const duplicate: Transaction = {
      ...tx,
      id: `tx-dup-${Date.now()}`,
      title: `${tx.title} (Copy)`,
      date: new Date().toISOString().split('T')[0] // Set to today's date
    };
    setTransactions([duplicate, ...transactions]);
    showToast(`Duplicated transaction as "${duplicate.title}"!`, 'success');
  };

  // Add transaction from external components helper (like Goals / Wishlist)
  const handleAddExternalTransaction = (
    title: string,
    amount: number,
    type: 'expense' | 'income',
    category: string,
    notes: string
  ) => {
    const newTx: Transaction = {
      id: `tx-ext-${Date.now()}`,
      title,
      amount,
      type,
      category,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'UPI',
      notes,
      isRecurring: false
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  // Quick Add handler
  const handleQuickAddClick = (button: QuickAddButton) => {
    const newTx: Transaction = {
      id: `tx-quick-${Date.now()}`,
      title: button.label.replace(/^[^\s]+\s/, ''), // Remove emoji prefix
      amount: button.amount,
      type: button.type,
      category: button.category,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'UPI',
      notes: 'Logged via Quick Add button.',
      isRecurring: false
    };
    setTransactions([newTx, ...transactions]);
    showToast(`Quick Logged: ${currency}${button.amount} spent on ${button.category}!`, 'success');

    // Budget trigger check
    const catBudget = budgets.find(b => b.category === button.category);
    if (catBudget) {
      const currentMonthStr = new Date().toISOString().substring(0, 7);
      const totalSpent = [newTx, ...transactions]
        .filter(t => t.type === 'expense' && t.category === button.category && t.date.startsWith(currentMonthStr))
        .reduce((sum, t) => sum + t.amount, 0);

      if (totalSpent > catBudget.limit) {
        showToast(`⚠️ OVER-BUDGET ALERT! "${button.category}" limit of ${currency}${catBudget.limit.toLocaleString()} exceeded!`, 'warning');
      }
    }
  };

  // Save new Quick Add preset button
  const handleCreateQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qaLabel.trim() || !qaAmount) {
      showToast('Please provide a label and amount for the preset.', 'error');
      return;
    }
    const amt = parseFloat(qaAmount);
    if (isNaN(amt) || amt <= 0) {
      showToast('Please enter a positive amount.', 'error');
      return;
    }

    const newBtn: QuickAddButton = {
      id: `qa-btn-${Date.now()}`,
      label: qaLabel.trim(),
      amount: amt,
      type: 'expense',
      category: qaCategory
    };

    setQuickAddButtons([...quickAddButtons, newBtn]);
    showToast(`Quick Add button "${qaLabel}" registered!`, 'success');
    setQaLabel('');
    setQaAmount('');
  };

  const handleDeleteQuickAdd = (id: string) => {
    setQuickAddButtons(quickAddButtons.filter(b => b.id !== id));
    showToast('Quick Add shortcut removed.', 'info');
  };

  // Finance Summary Calculations (Overall)
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBalance = totalIncome - totalExpense;

  // Monthly stats calculations (this month only)
  const currentMonthStr = new Date().toISOString().substring(0, 7);
  const monthlyExpensesList = transactions.filter(t => t.type === 'expense' && t.date.startsWith(currentMonthStr));
  const monthlyIncomeList = transactions.filter(t => t.type === 'income' && t.date.startsWith(currentMonthStr));
  
  const monthlyIncome = monthlyIncomeList.reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpense = monthlyExpensesList.reduce((sum, t) => sum + t.amount, 0);
  const monthlySavings = monthlyIncome - monthlyExpense;
  const savingsPercentage = monthlyIncome > 0 ? Math.round((monthlySavings / monthlyIncome) * 100) : 0;

  const currentDayOfMonth = new Date().getDate();
  const dailySpendingAverage = currentDayOfMonth > 0 ? monthlyExpense / currentDayOfMonth : 0;

  // Monthly Budget Remaining
  const totalBudgetLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalBudgetSpent = budgets.reduce((sum, b) => {
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category === b.category && t.date.startsWith(currentMonthStr))
      .reduce((total, t) => total + t.amount, 0);
    return sum + Math.min(spent, b.limit);
  }, 0);
  const budgetRemaining = totalBudgetLimit - totalBudgetSpent;

  // Filter & Sort Transactions List
  const getFilteredTransactions = () => {
    let list = [...transactions];

    // 1. Calendar filter
    if (selectedCalendarDate) {
      list = list.filter(t => t.date === selectedCalendarDate);
    }

    // 2. Search Box Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(t => 
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.paymentMethod.toLowerCase().includes(q) ||
        t.notes.toLowerCase().includes(q) ||
        String(t.amount).includes(q)
      );
    }

    // 3. Type Filter
    if (filterType !== 'all') {
      list = list.filter(t => t.type === filterType);
    }

    // 4. Category Filter
    if (filterCategory !== 'all') {
      list = list.filter(t => t.category === filterCategory);
    }

    // 5. Payment Method Filter
    if (filterPaymentMethod !== 'all') {
      list = list.filter(t => t.paymentMethod === filterPaymentMethod);
    }

    // 6. Date Range Filter
    const today = new Date().toISOString().split('T')[0];
    if (filterDateRange === 'today') {
      list = list.filter(t => t.date === today);
    } else if (filterDateRange === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      list = list.filter(t => new Date(t.date) >= oneWeekAgo);
    } else if (filterDateRange === 'month') {
      list = list.filter(t => t.date.startsWith(currentMonthStr));
    } else if (filterDateRange === 'year') {
      const currentYear = new Date().getFullYear().toString();
      list = list.filter(t => t.date.startsWith(currentYear));
    } else if (filterDateRange === 'custom') {
      if (customStartDate) {
        list = list.filter(t => t.date >= customStartDate);
      }
      if (customEndDate) {
        list = list.filter(t => t.date <= customEndDate);
      }
    }

    // Sort operations
    list.sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });

    return list;
  };

  const filteredTx = getFilteredTransactions();

  // Pagination bounds
  const totalPages = Math.ceil(filteredTx.length / itemsPerPage) || 1;
  const paginatedTx = filteredTx.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Backup Center Functions
  const handleExportData = () => {
    const backup = {
      transactions,
      budgets,
      savingsGoals,
      wishlist,
      emis,
      quickAddButtons,
      recurringTemplates,
      currency,
      theme: isDarkMode ? 'dark' : 'light'
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BudgetBuddy_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Financial data backup exported successfully!', 'success');
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.transactions) setTransactions(data.transactions);
        if (data.budgets) setBudgets(data.budgets);
        if (data.savingsGoals) setSavingsGoals(data.savingsGoals);
        if (data.wishlist) setWishlist(data.wishlist);
        if (data.emis) setEMIs(data.emis);
        if (data.quickAddButtons) setQuickAddButtons(data.quickAddButtons);
        if (data.recurringTemplates) setRecurringTemplates(data.recurringTemplates);
        if (data.currency) setCurrency(data.currency);
        if (data.theme) setIsDarkMode(data.theme === 'dark');

        showToast('Backup restored successfully!', 'success');
      } catch (err) {
        showToast('Invalid backup file structure.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Date,Title,Type,Category,Amount,Payment Method,Notes,Is Recurring\r\n';

    transactions.forEach(t => {
      const row = [
        t.date,
        `"${t.title.replace(/"/g, '""')}"`,
        t.type,
        t.category,
        t.amount,
        t.paymentMethod,
        `"${(t.notes || '').replace(/"/g, '""')}"`,
        t.isRecurring ? 'Yes' : 'No'
      ].join(',');
      csvContent += row + '\r\n';
    });

    const encodedUri = encodeURI(csvContent);
    const a = document.createElement('a');
    a.setAttribute('href', encodedUri);
    a.setAttribute('download', `BudgetBuddy_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Transactions list downloaded as CSV spreadsheet!', 'success');
  };

  const handleResetAllData = () => {
    localStorage.clear();
    setTransactions(initialTransactions);
    setBudgets(initialBudgets);
    setSavingsGoals(initialSavingsGoals);
    setWishlist(initialWishlist);
    setEMIs(initialEMIs);
    setQuickAddButtons(initialQuickAddButtons);
    setRecurringTemplates(initialRecurringTemplates);
    setCurrency('₹');
    setIsDarkMode(true);
    setUserProfile(null);
    setShowResetConfirm(false);
    showToast('All app data has been factory reset to default presets.', 'warning');
  };

  const handleSetupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const budgetVal = parseFloat(setupMonthlyBudget) || 0;
    const balanceVal = parseFloat(setupInitialBalance) || 0;

    const profile = {
      name: setupName.trim(),
      email: setupEmail.trim(),
      monthlyBudget: budgetVal,
      initialBalance: balanceVal
    };
    localStorage.setItem('bb_user_profile', JSON.stringify(profile));
    setUserProfile(profile);
    setCurrency(setupCurrency);

    // Initialize category budgets as empty so the user can configure their budget boundaries themselves
    setBudgets([]);
    localStorage.setItem('bb_budgets', JSON.stringify([]));

    // Starting ledger transaction is only created if the user explicitly specifies a starting balance > 0
    let initialTxs: Transaction[] = [];
    if (balanceVal > 0) {
      initialTxs = [{
        id: `tx-init-${Date.now()}`,
        title: 'Starting Balance Wallet Setup',
        amount: balanceVal,
        type: 'income',
        category: 'Salary',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'Net Banking',
        notes: 'Initial balance logged during setup.',
        isRecurring: false
      }];
    }
    setTransactions(initialTxs);
    localStorage.setItem('bb_transactions', JSON.stringify(initialTxs));

    // Reset others
    setSavingsGoals([]);
    localStorage.setItem('bb_goals', JSON.stringify([]));
    setWishlist([]);
    localStorage.setItem('bb_wishlist', JSON.stringify([]));
    setEMIs([]);
    localStorage.setItem('bb_emis', JSON.stringify([]));

    triggerCelebration();
    setTimeout(() => {
      showToast(`Welcome ${profile.name}! BudgetBuddy has initialized your custom ledger starting at ${setupCurrency}${balanceVal.toLocaleString()}!`, 'success');
    }, 500);
  };

  const handleLogOut = () => {
    if (confirm("Are you sure you want to sign out? This will reset your profile session, but your ledger transactions will remain in localStorage. To completely erase data, use the Factory Reset option in settings.")) {
      localStorage.removeItem('bb_user_profile');
      setUserProfile(null);
      showToast('Signed out of profile session.', 'info');
    }
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-sans relative overflow-hidden selection:bg-indigo-500 selection:text-white">
        {/* Aesthetic background mesh glow */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-full max-w-md p-8 bg-slate-900/40 border border-slate-200/10 rounded-3xl backdrop-blur-xl shadow-2xl relative z-10 m-4 animate-fade-in">
          {/* Logo Branding */}
          <div className="text-center mb-8">
            <span className="text-5xl inline-block mb-3 transform hover:scale-110 transition-transform cursor-default">💸</span>
            <h1 className="text-3xl font-display font-extrabold text-white tracking-tight">
              BudgetBuddy
            </h1>
            <p className="text-xs text-slate-400 mt-1.5 uppercase tracking-wide font-medium">
              PREMIUM PERSONAL FINANCE GATEWAY
            </p>
          </div>

          <form onSubmit={handleSetupSubmit} className="space-y-5">
            {/* Input: Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" /> Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Alex Carter"
                value={setupName}
                onChange={(e) => setSetupName(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-700/50 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              />
            </div>

            {/* Input: Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" /> Email Address
              </label>
              <input
                type="email"
                required
                placeholder="e.g. abc@gmail.com"
                value={setupEmail}
                onChange={(e) => setSetupEmail(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-700/50 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              />
            </div>

            {/* Select: Starting Currency */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-indigo-400" /> Preferred Currency
              </label>
              <select
                value={setupCurrency}
                onChange={(e) => setSetupCurrency(e.target.value as Currency)}
                className="w-full bg-slate-950/60 border border-slate-700/50 rounded-xl py-2.5 px-3.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="₹">₹ INR (Rupees)</option>
                <option value="$">$ USD (Dollars)</option>
                <option value="€">€ EUR (Euros)</option>
              </select>
            </div>

            {/* Input: Monthly Budget Limit */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-indigo-400" /> Total Monthly Spending Budget
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 font-mono text-sm font-bold text-slate-400">{setupCurrency}</span>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="e.g. 50000"
                  value={setupMonthlyBudget}
                  onChange={(e) => setSetupMonthlyBudget(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-700/50 rounded-xl py-2.5 pl-8 pr-3.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all font-mono"
                />
              </div>
              <p className="text-[10px] text-slate-400 italic">Sets your overall monthly target. Your actual budgets will be 100% clean for you to configure.</p>
            </div>

            {/* Input: Starting Wallet Balance */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-indigo-400" /> Starting Balance in Wallet / Bank
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 font-mono text-sm font-bold text-slate-400">{setupCurrency}</span>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="e.g. 10000"
                  value={setupInitialBalance}
                  onChange={(e) => setSetupInitialBalance(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-700/50 rounded-xl py-2.5 pl-8 pr-3.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all font-mono"
                />
              </div>
              <p className="text-[10px] text-slate-400 italic">Your starting ledger deposit. Set to 0 to start with absolute zero history.</p>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-sm rounded-xl tracking-wide transition-all shadow-lg hover:shadow-indigo-500/20 shadow-indigo-600/35 flex items-center justify-center gap-2 cursor-pointer border border-indigo-500/50"
            >
              <Sparkles className="w-4.5 h-4.5 text-yellow-300" /> Create My BudgetBuddy Ledger
            </button>
          </form>

          <div className="text-center mt-6 text-[10px] text-slate-500 font-mono">
            Securely encrypted in LocalStorage. No data leaves your machine.
          </div>
        </div>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-slate-950 dark:bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans selection:bg-indigo-500 selection:text-white relative" id="app-viewport">
      {/* Dynamic Celebration Confetti Banner */}
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden flex items-center justify-center animate-pulse" id="confetti-stage">
          <div className="absolute top-10 text-center animate-bounce">
            <h1 className="text-4xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-emerald-400 to-indigo-500 tracking-wider">
              🎉 GOAL ACHIEVED! WELL DONE! 🎉
            </h1>
            <p className="text-sm font-semibold text-white mt-2">Compounding effort produces outstanding outcomes.</p>
          </div>
          {/* Custom fallback particle effect using simple CSS animations */}
          <div className="absolute inset-0 flex justify-around opacity-75">
            {[...Array(20)].map((_, i) => (
              <div 
                key={i}
                className={`w-3 h-3 rounded-full bg-indigo-500 animate-bounce`} 
                style={{
                  backgroundColor: ['#F59E0B', '#10B981', '#4F46E5', '#EF4444', '#EC4899'][i % 5],
                  animationDelay: `${i * 0.25}s`,
                  animationDuration: `${1.5 + (i % 3)}s`,
                  transform: `translateY(${Math.sin(i) * 50}px)`
                }}
              ></div>
            ))}
          </div>
        </div>
      )}

      {/* 1. Left Sidebar Navigation Panel */}
      <aside className="w-full md:w-72 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200/10 dark:border-slate-800/50 p-6 flex flex-col justify-between shrink-0" id="sidebar-panel">
        <div className="space-y-6">
          {/* Logo Branding Header */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl" role="img" aria-label="money">💸</span>
              <h1 className="text-xl font-display font-bold text-white tracking-tight flex items-center gap-1.5">
                BudgetBuddy
              </h1>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">
              "Track every rupee. Build smarter financial habits."
            </p>
          </div>

          {/* Quick Stats Panel inside sidebar */}
          <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-3.5 space-y-2 text-xs font-medium">
            <div className="flex justify-between">
              <span className="text-slate-400">Net Balance:</span>
              <span className={`font-mono font-bold ${totalBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {currency}{totalBalance.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Total Income:</span>
              <span className="text-emerald-400 font-mono font-semibold">
                +{currency}{totalIncome.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Total Expenses:</span>
              <span className="text-rose-400 font-mono font-semibold">
                -{currency}{totalExpense.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Menu Navigation Items */}
          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-3 md:pb-0" id="nav-menu">
            <button
              onClick={() => { setActiveTab('dashboard'); setSelectedCalendarDate(null); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                activeTab === 'dashboard' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => { setActiveTab('transactions'); setSelectedCalendarDate(null); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                activeTab === 'transactions' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <ListTodo className="w-4 h-4 shrink-0" />
              <span>Transactions</span>
            </button>

            <button
              onClick={() => { setActiveTab('budget'); setSelectedCalendarDate(null); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                activeTab === 'budget' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <PiggyBank className="w-4 h-4 shrink-0" />
              <span>Budget Planner</span>
            </button>

            <button
              onClick={() => { setActiveTab('goals'); setSelectedCalendarDate(null); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                activeTab === 'goals' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <Target className="w-4 h-4 shrink-0" />
              <span>Savings Goals</span>
            </button>

            <button
              onClick={() => { setActiveTab('wishlist'); setSelectedCalendarDate(null); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                activeTab === 'wishlist' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <Heart className="w-4 h-4 shrink-0" />
              <span>Wishlist & EMIs</span>
            </button>

            <button
              onClick={() => { setActiveTab('calendar'); setSelectedCalendarDate(null); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                activeTab === 'calendar' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Calendar</span>
            </button>

            <button
              onClick={() => { setActiveTab('settings'); setSelectedCalendarDate(null); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                activeTab === 'settings' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span>Settings Center</span>
            </button>
          </nav>

          {/* Quick Add Log Panel in Sidebar (Desktop only) */}
          <div className="hidden md:block bg-slate-950/20 border border-slate-800 p-4 rounded-xl space-y-3" id="sidebar-quickadd-box">
            <h4 className="text-[10px] font-bold text-slate-400 tracking-wider flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              QUICK LOG SHORTCUTS
            </h4>

            <div className="grid grid-cols-2 gap-2">
              {quickAddButtons.map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => handleQuickAddClick(btn)}
                  className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg hover:border-indigo-500/50 text-[10px] text-slate-300 font-bold tracking-wide transition-all cursor-pointer truncate"
                  title={`Instantly record ${currency}${btn.amount} spent`}
                >
                  +{currency}{btn.amount} {btn.label.split(' ')[0]}
                </button>
              ))}
            </div>
            <p className="text-[9px] text-slate-500 mt-1">Configure presets in settings.</p>
          </div>
        </div>

        {/* User profile footer card */}
        {userProfile && (
          <div className="mt-8 pt-4 border-t border-slate-200/10 dark:border-slate-800/50 flex items-center justify-between gap-2" id="user-profile-badge">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-rose-500 flex items-center justify-center font-display font-bold text-white tracking-wider text-sm shrink-0 shadow-md">
                {userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'JJ'}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white truncate font-display leading-tight">{userProfile.name}</h4>
                <span className="text-[10px] text-slate-400 truncate block mt-0.5 font-mono">{userProfile.email || 'offline@budgetbuddy.app'}</span>
              </div>
            </div>
            <button 
              onClick={handleLogOut}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all shrink-0 cursor-pointer"
              title="Sign out profile"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </aside>

      {/* 2. Main Content Canvas */}
      <main className="flex-1 bg-slate-950 p-6 md:p-8 flex flex-col gap-6 overflow-y-auto max-h-screen relative" id="main-canvas">
        {/* Top Header Bar */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200/10 dark:border-slate-800/50 pb-5" id="canvas-header">
          <div>
            <h2 className="text-2xl font-display font-bold text-white tracking-tight flex items-center gap-2">
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'transactions' && 'Transactional History Ledger'}
              {activeTab === 'budget' && 'Monthly Cap Budgets'}
              {activeTab === 'goals' && 'Target Savings Goals'}
              {activeTab === 'wishlist' && 'Savings Wishlist & EMIs'}
              {activeTab === 'calendar' && 'Expense Calendar Visualizer'}
              {activeTab === 'settings' && 'Applet Configuration Control'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Active ledger synchronized locally with browser localStorage offline.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Currency selector quick link */}
            <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5">
              {(['₹', '$', '€'] as Currency[]).map((cur) => (
                <button
                  key={cur}
                  onClick={() => setCurrency(cur)}
                  className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold font-mono transition-all cursor-pointer ${
                    currency === cur ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cur}
                </button>
              ))}
            </div>

            {/* Dark Mode switcher */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Toggle theme mode"
            >
              {isDarkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* Main Primary Add Transaction button */}
            <button
              onClick={() => {
                setEditingTransaction(null);
                setTxTitle('');
                setTxAmount('');
                setTxNotes('');
                setTxIsRecurring(false);
                setIsAddTxOpen(true);
              }}
              className="flex items-center gap-1.5 px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg hover:translate-y-[-1px] cursor-pointer"
              id="btn-add-transaction-main"
            >
              <Plus className="w-4 h-4" /> Add Transaction
            </button>
          </div>
        </header>

        {/* 3. Global Stats Bar Card (Dashboard + Report view contexts) */}
        {(activeTab === 'dashboard' || activeTab === 'settings') && (
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="stats-banner">
            {/* Stat 1: Balance */}
            <div className="bg-slate-900/40 border border-slate-200/10 dark:border-slate-800/50 p-5 rounded-2xl flex flex-col relative overflow-hidden backdrop-blur-xl shadow-md">
              <span className="text-[10px] text-slate-400 tracking-wider font-display font-semibold uppercase">TOTAL BALANCE</span>
              <span className={`text-2xl font-bold font-display tracking-tight mt-1.5 ${totalBalance >= 0 ? 'text-white' : 'text-rose-400'}`}>
                {currency}{totalBalance.toLocaleString()}
              </span>
              <div className="absolute top-4 right-4 p-1 rounded bg-slate-800/40 text-slate-400">
                <PiggyBank className="w-4 h-4" />
              </div>
            </div>

            {/* Stat 2: Income */}
            <div className="bg-slate-900/40 border border-slate-200/10 dark:border-slate-800/50 p-5 rounded-2xl flex flex-col relative overflow-hidden backdrop-blur-xl shadow-md">
              <span className="text-[10px] text-slate-400 tracking-wider font-display font-semibold uppercase">TOTAL INCOME</span>
              <span className="text-2xl font-bold font-display tracking-tight text-emerald-400 mt-1.5">
                +{currency}{totalIncome.toLocaleString()}
              </span>
              <div className="absolute top-4 right-4 p-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>

            {/* Stat 3: Expenses */}
            <div className="bg-slate-900/40 border border-slate-200/10 dark:border-slate-800/50 p-5 rounded-2xl flex flex-col relative overflow-hidden backdrop-blur-xl shadow-md">
              <span className="text-[10px] text-slate-400 tracking-wider font-display font-semibold uppercase">TOTAL EXPENSES</span>
              <span className="text-2xl font-bold font-display tracking-tight text-rose-400 mt-1.5">
                -{currency}{totalExpense.toLocaleString()}
              </span>
              <div className="absolute top-4 right-4 p-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/15">
                <ArrowDownRight className="w-4 h-4" />
              </div>
            </div>

            {/* Stat 4: Savings Rate */}
            <div className="bg-slate-900/40 border border-slate-200/10 dark:border-slate-800/50 p-5 rounded-2xl flex flex-col relative overflow-hidden backdrop-blur-xl shadow-md">
              <span className="text-[10px] text-slate-400 tracking-wider font-display font-semibold uppercase">MONTHLY SAVINGS</span>
              <span className="text-2xl font-bold font-display tracking-tight text-indigo-400 mt-1.5">
                {currency}{monthlySavings.toLocaleString()}
              </span>
              <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                <span className="font-bold text-indigo-300 font-mono">{savingsPercentage}%</span>
                <span>savings rate</span>
              </div>
              <div className="absolute top-4 right-4 p-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/15">
                <Percent className="w-4 h-4" />
              </div>
            </div>
          </section>
        )}

        {/* 4. Tab Views Router */}
        <section className="flex-1 min-h-0" id="tabs-rendering-router">
          
          {/* VIEW: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in" id="view-dashboard">
              {/* Daily Spending Runrate Stats & Smart Insights heuristics */}
              <DailySpendingAndInsights 
                transactions={transactions}
                budgets={budgets}
                currency={currency}
              />

              {/* Monthly progress & quick bento metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-bento-grid">
                {/* Month Progress & budgets */}
                <div className="lg:col-span-1 bg-slate-900/30 border border-slate-200/10 dark:border-slate-800/50 p-5 rounded-2xl flex flex-col justify-between backdrop-blur-md shadow-md" id="month-progress-card">
                  <div>
                    <span className="text-[10px] text-slate-400 tracking-wider font-display font-medium block">MONTH PROGRESS BAR</span>
                    <h3 className="font-display font-bold text-white mt-1 text-base">
                      {new Date().toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                    </h3>
                  </div>

                  <div className="my-4 space-y-2">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Days Elapsed:</span>
                      <span className="font-bold text-white font-mono">{currentDayOfMonth} / {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()} days</span>
                    </div>
                    {/* Visual Month Elapsed Progress Bar */}
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/30">
                      <div 
                        className="h-full bg-indigo-500 rounded-full" 
                        style={{ width: `${Math.round((currentDayOfMonth / new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/60 space-y-2 text-xs font-semibold">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Budget Limit:</span>
                      <span className="font-mono text-slate-200">{currency}{totalBudgetLimit.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Budget Spent:</span>
                      <span className="font-mono text-slate-200">{currency}{totalBudgetSpent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-800/20">
                      <span className="text-slate-400">Budget Remaining:</span>
                      <span className={`font-mono font-bold ${budgetRemaining >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {currency}{budgetRemaining.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recent transactions list */}
                <div className="lg:col-span-2 bg-slate-900/30 border border-slate-200/10 dark:border-slate-800/50 p-5 rounded-2xl backdrop-blur-md shadow-md flex flex-col" id="recent-transactions-card">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-display font-semibold text-sm text-white">Recent Transactions</h3>
                    <button 
                      onClick={() => setActiveTab('transactions')}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold hover:underline cursor-pointer"
                    >
                      View All Ledger
                    </button>
                  </div>

                  <div className="space-y-2.5 flex-1 overflow-y-auto max-h-56 pr-1" id="recent-transactions-list">
                    {transactions.slice(0, 5).map(tx => {
                      const IconComp = getCategoryIcon(tx.category);
                      const isInc = tx.type === 'income';
                      return (
                        <div 
                          key={tx.id}
                          className="p-3.5 rounded-xl border border-slate-800/40 bg-slate-900/10 flex justify-between items-center gap-3 hover:bg-slate-900/30 transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`p-2 rounded-lg shrink-0 ${getCategoryColor(tx.category, tx.type)}`}>
                              <IconComp className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-semibold text-slate-200 truncate leading-tight">{tx.title}</h4>
                              <span className="text-[10px] text-slate-400 mt-0.5 block">{tx.category} • {tx.paymentMethod}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className={`text-xs font-bold font-mono ${isInc ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isInc ? '+' : '-'}{currency}{tx.amount.toLocaleString()}
                            </span>
                            <button
                              onClick={() => handleOpenEdit(tx)}
                              className="p-1 text-slate-500 hover:text-indigo-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: TRANSACTIONS TABLE */}
          {activeTab === 'transactions' && (
            <div className="space-y-4 animate-fade-in" id="view-transactions-panel">
              {/* Filter controls card */}
              <div className="bg-slate-900/30 border border-slate-200/10 dark:border-slate-800/50 p-4 rounded-2xl flex flex-col gap-4 backdrop-blur-md shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {/* Search Bar Input */}
                  <div className="relative md:col-span-2">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search title, category, payment method, notes... (Ctrl + F)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-850 border border-slate-700/60 rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                      id="tx-search-input"
                    />
                  </div>

                  {/* Flow Type selector */}
                  <div>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as any)}
                      className="w-full bg-slate-850 border border-slate-700/60 rounded-xl py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                    >
                      <option value="all">📊 All Transaction Types</option>
                      <option value="income">🟢 Incomes Only</option>
                      <option value="expense">🔴 Expenses Only</option>
                    </select>
                  </div>

                  {/* Sort Order */}
                  <div>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full bg-slate-850 border border-slate-700/60 rounded-xl py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                    >
                      <option value="date-desc">📅 Date: Newest First</option>
                      <option value="date-asc">📅 Date: Oldest First</option>
                      <option value="amount-desc">💰 Amount: High to Low</option>
                      <option value="amount-asc">💰 Amount: Low to High</option>
                      <option value="title">🔤 Alphabetical (Title)</option>
                    </select>
                  </div>
                </div>

                {/* Secondary Filters row */}
                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800/50 text-xs">
                  <div className="flex items-center gap-1 text-slate-400 font-semibold mr-1">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" /> Advanced Filter:
                  </div>

                  {/* Category Filter */}
                  <div>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="bg-slate-850 border border-slate-800 rounded-lg py-1 px-2 text-slate-300 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="all">Category: All</option>
                      {Array.from(new Set(transactions.map(t => t.category))).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Payment Method Filter */}
                  <div>
                    <select
                      value={filterPaymentMethod}
                      onChange={(e) => setFilterPaymentMethod(e.target.value)}
                      className="bg-slate-850 border border-slate-800 rounded-lg py-1 px-2 text-slate-300 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="all">Payment: All</option>
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Debit Card">Debit Card</option>
                      <option value="Net Banking">Net Banking</option>
                      <option value="Wallet">Wallet</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Date Range quick select */}
                  <div>
                    <select
                      value={filterDateRange}
                      onChange={(e) => setFilterDateRange(e.target.value as any)}
                      className="bg-slate-850 border border-slate-800 rounded-lg py-1 px-2 text-slate-300 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="all">Time Period: All</option>
                      <option value="today">Today Only</option>
                      <option value="week">This Week (7 days)</option>
                      <option value="month">This Month</option>
                      <option value="year">This Year</option>
                      <option value="custom">Custom Date Range</option>
                    </select>
                  </div>

                  {/* Custom Dates Inputs */}
                  {filterDateRange === 'custom' && (
                    <div className="flex items-center gap-2 animate-fade-in text-[11px]">
                      <input 
                        type="date" 
                        value={customStartDate} 
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="bg-slate-850 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300 focus:outline-none"
                      />
                      <span className="text-slate-500">to</span>
                      <input 
                        type="date" 
                        value={customEndDate} 
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="bg-slate-850 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300 focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Clear filter button if calendar date selected */}
                  {selectedCalendarDate && (
                    <button
                      onClick={() => setSelectedCalendarDate(null)}
                      className="px-2 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold rounded-lg hover:bg-rose-500 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                    >
                      📅 Filtered to: {selectedCalendarDate} (Click to Clear)
                    </button>
                  )}

                  <div className="ml-auto flex items-center gap-2 font-bold font-mono text-slate-400">
                    Results: {filteredTx.length}
                  </div>
                </div>
              </div>

              {/* Transactions list card */}
              <div className="bg-slate-900/30 border border-slate-200/10 dark:border-slate-800/50 rounded-2xl backdrop-blur-md shadow-md overflow-hidden" id="transactions-ledger-list">
                <div className="p-4 border-b border-slate-800/60 bg-slate-900/40 flex justify-between items-center flex-wrap gap-2">
                  <h3 className="font-display font-semibold text-sm text-white">Itemized Ledger Accounts</h3>
                  
                  {/* Export CSV quick button */}
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 font-bold border border-slate-700 rounded-lg text-[10px] uppercase tracking-wide transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" /> Export Excel CSV
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800/60 text-slate-400 uppercase tracking-wider text-[10px] font-bold bg-slate-950/20">
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Ledger Title</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Method</th>
                        <th className="py-3 px-4">Notes</th>
                        <th className="py-3 px-4 text-right">Amount</th>
                        <th className="py-3 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {paginatedTx.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                            No ledger entries match search parameters.
                          </td>
                        </tr>
                      ) : (
                        paginatedTx.map((tx) => {
                          const IconComp = getCategoryIcon(tx.category);
                          const isInc = tx.type === 'income';
                          return (
                            <tr 
                              key={tx.id} 
                              className={`hover:bg-slate-900/20 transition-all ${
                                tx.isRecurring ? 'bg-indigo-950/5' : ''
                              }`}
                              id={`ledger-row-${tx.id}`}
                            >
                              <td className="py-3.5 px-4 font-mono font-medium text-slate-300">
                                {tx.date}
                              </td>
                              <td className="py-3.5 px-4 font-semibold font-display text-white max-w-xs truncate">
                                <div className="flex items-center gap-1.5">
                                  <span>{tx.title}</span>
                                  {tx.isRecurring && (
                                    <span className="text-[8px] px-1.5 py-0.5 rounded font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase shrink-0">
                                      Auto-Debit
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2">
                                  <div className={`p-1.5 rounded-md ${getCategoryColor(tx.category, tx.type)}`}>
                                    <IconComp className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="font-semibold text-slate-200">{tx.category}</span>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 font-semibold text-slate-300">
                                {tx.paymentMethod}
                              </td>
                              <td className="py-3.5 px-4 text-slate-400 italic max-w-xs truncate">
                                {tx.notes || '—'}
                              </td>
                              <td className={`py-3.5 px-4 text-right font-bold font-mono text-sm ${isInc ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {isInc ? '+' : '-'}{currency}{tx.amount.toLocaleString()}
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => handleOpenEdit(tx)}
                                    className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                    title="Edit ledger details"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDuplicateTransaction(tx)}
                                    className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                    title="Duplicate transaction preset"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTransaction(tx.id)}
                                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                                    title="Delete transaction"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination footer */}
                {totalPages > 1 && (
                  <div className="p-4 border-t border-slate-800/60 bg-slate-950/20 flex justify-between items-center text-xs text-slate-400">
                    <div>
                      Showing pages <span className="text-white font-bold">{currentPage}</span> of <span className="text-white font-bold">{totalPages}</span>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 disabled:opacity-50 border border-slate-800 text-slate-200 font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 disabled:opacity-50 border border-slate-800 text-slate-200 font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW: BUDGET PLANNER */}
          {activeTab === 'budget' && (
            <div className="animate-fade-in" id="view-budget">
              <BudgetPlanner 
                budgets={budgets}
                transactions={transactions}
                onUpdateBudgets={setBudgets}
                currency={currency}
                onShowToast={showToast}
              />
            </div>
          )}

          {/* VIEW: SAVINGS GOALS */}
          {activeTab === 'goals' && (
            <div className="animate-fade-in" id="view-goals">
              <GoalsTracker 
                goals={savingsGoals}
                onUpdateGoals={setSavingsGoals}
                currency={currency}
                onShowToast={showToast}
                onTriggerCelebration={triggerCelebration}
              />
            </div>
          )}

          {/* VIEW: WISHLIST & EMI TRACKER */}
          {activeTab === 'wishlist' && (
            <div className="animate-fade-in" id="view-wishlist">
              <WishlistAndEMI 
                wishlist={wishlist}
                onUpdateWishlist={setWishlist}
                emis={emis}
                onUpdateEMIs={setEMIs}
                onAddTransaction={handleAddExternalTransaction}
                currency={currency}
                onShowToast={showToast}
              />
            </div>
          )}

          {/* VIEW: CALENDAR TRACKER */}
          {activeTab === 'calendar' && (
            <div className="animate-fade-in" id="view-calendar">
              <FinanceCalendar 
                transactions={transactions}
                currency={currency}
                selectedCalendarDate={selectedCalendarDate}
                onSelectCalendarDate={(dateStr) => {
                  setSelectedCalendarDate(dateStr);
                  if (dateStr) {
                    setActiveTab('transactions'); // Pivot to transactions tab showing filtered ledger
                    showToast(`Filtered ledger to ${dateStr}!`, 'info');
                  }
                }}
              />
            </div>
          )}

          {/* VIEW: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fade-in" id="view-settings">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Custom Quick Buttons configuration */}
                <div className="bg-slate-900/30 border border-slate-200/10 dark:border-slate-800/50 p-6 rounded-2xl flex flex-col backdrop-blur-md shadow-md" id="quickadd-config">
                  <div className="flex items-center gap-2 mb-4">
                    <Flame className="w-5 h-5 text-amber-400" />
                    <h3 className="font-display font-semibold text-base text-white">Customize Quick Add Buttons</h3>
                  </div>

                  <form onSubmit={handleCreateQuickAdd} className="space-y-4 mb-6">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="col-span-2">
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Preset Label (With Emoji!)</label>
                        <input
                          type="text"
                          value={qaLabel}
                          onChange={(e) => setQaLabel(e.target.value)}
                          placeholder="e.g. 🍔 Pizza or 🚌 Ticket"
                          className="w-full bg-slate-850 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Deducted Amount</label>
                        <input
                          type="number"
                          value={qaAmount}
                          onChange={(e) => setQaAmount(e.target.value)}
                          placeholder="150"
                          className="w-full bg-slate-850 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none"
                          required
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Category</label>
                        <select
                          value={qaCategory}
                          onChange={(e) => setQaCategory(e.target.value)}
                          className="w-full bg-slate-850 border border-slate-700 rounded-lg py-2 px-3 text-slate-300 focus:outline-none"
                        >
                          {Object.keys(getCategoryIcon).length > 0 || [
                            'Food', 'Groceries', 'Snacks', 'Restaurant', 'Tea/Coffee',
                            'Transport', 'Fuel', 'Shopping', 'Clothes', 'Electronics',
                            'Bills', 'Medical', 'Entertainment', 'Travel', 'Investment', 'Others'
                          ].map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-md"
                    >
                      <Plus className="w-4 h-4" /> Save Shortcut Button
                    </button>
                  </form>

                  {/* List and Delete presets */}
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {quickAddButtons.map(btn => (
                      <div key={btn.id} className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/80 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-semibold text-slate-200">{btn.label}</span>
                          <span className="text-[10px] text-slate-400 ml-2">({btn.category} • {currency}{btn.amount})</span>
                        </div>
                        <button
                          onClick={() => handleDeleteQuickAdd(btn.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preference switches & Factory Reset Backup Center */}
                <div className="bg-slate-900/30 border border-slate-200/10 dark:border-slate-800/50 p-6 rounded-2xl flex flex-col backdrop-blur-md shadow-md gap-6" id="settings-preferences">
                  <div>
                    <h3 className="font-display font-semibold text-base text-white mb-4">Functional Preferences</h3>
                    
                    <div className="space-y-4 text-xs font-semibold">
                      {/* Animation Toggle */}
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-slate-200 text-sm">Enable Micro-Animations</h4>
                          <p className="text-[11px] text-slate-400 font-normal">Fades and layout shifts inside lists and dialogs.</p>
                        </div>
                        <button
                          onClick={() => setEnableAnimations(!enableAnimations)}
                          className={`w-11 h-6 rounded-full p-1 transition-all cursor-pointer ${
                            enableAnimations ? 'bg-indigo-600 flex justify-end' : 'bg-slate-800 flex justify-start'
                          }`}
                        >
                          <span className="w-4 h-4 bg-white rounded-full"></span>
                        </button>
                      </div>

                      {/* Toast Toggle */}
                      <div className="flex justify-between items-center pt-4 border-t border-slate-800/50">
                        <div>
                          <h4 className="text-slate-200 text-sm">Toast Popups Notification</h4>
                          <p className="text-[11px] text-slate-400 font-normal">Receive responsive feedback notifications on actions.</p>
                        </div>
                        <button
                          onClick={() => setEnableNotifications(!enableNotifications)}
                          className={`w-11 h-6 rounded-full p-1 transition-all cursor-pointer ${
                            enableNotifications ? 'bg-indigo-600 flex justify-end' : 'bg-slate-800 flex justify-start'
                          }`}
                        >
                          <span className="w-4 h-4 bg-white rounded-full"></span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Backup REST center */}
                  <div className="pt-4 border-t border-slate-800/60">
                    <h3 className="font-display font-semibold text-sm text-white mb-3">Backup & System Diagnostics</h3>
                    
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {/* Export backup */}
                      <button
                        onClick={handleExportData}
                        className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow"
                      >
                        <Download className="w-4 h-4" /> Export Backup (JSON)
                      </button>

                      {/* Import backup */}
                      <label className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow text-center select-none">
                        <Upload className="w-4 h-4" /> Restore Backup
                        <input 
                          type="file" 
                          accept=".json" 
                          onChange={handleImportData}
                          className="hidden"
                        />
                      </label>

                      {/* Factory Reset button */}
                      <button
                        onClick={() => setShowResetConfirm(true)}
                        className="col-span-2 py-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white font-bold border border-rose-500/20 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-2 shadow"
                      >
                        <RefreshCw className="w-4 h-4" /> Full Factory Data Reset
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* VIEW: REPORTS & ANALYTICS CHARTS */}
          {activeTab === 'reports' && (
            <div className="space-y-6 animate-fade-in" id="view-reports-charts">
              {/* Report Quick metrics bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="reports-header-stats">
                {/* Most Expensive Category */}
                <div className="bg-slate-900/40 border border-slate-200/10 dark:border-slate-800/50 p-5 rounded-2xl backdrop-blur shadow" id="card-expensive-cat">
                  <span className="text-[10px] text-slate-400 tracking-wider font-display font-medium uppercase">MOST EXPENSIVE CATEGORY</span>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl">
                      <ArrowUpRight className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      {(() => {
                        const expenseByCategory: Record<string, number> = {};
                        transactions.filter(t => t.type === 'expense' && t.date.startsWith(currentMonthStr)).forEach(t => {
                          expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
                        });
                        const sorted = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1]);
                        if (sorted.length > 0) {
                          return (
                            <>
                              <h4 className="text-sm font-bold font-display text-white">{sorted[0][0]}</h4>
                              <span className="text-xs text-rose-400 font-mono font-bold mt-1 block">{currency}{sorted[0][1].toLocaleString()} spent</span>
                            </>
                          );
                        }
                        return <h4 className="text-sm font-bold text-slate-400 font-display">No expenses yet</h4>;
                      })()}
                    </div>
                  </div>
                </div>

                {/* Highest Single Transaction */}
                <div className="bg-slate-900/40 border border-slate-200/10 dark:border-slate-800/50 p-5 rounded-2xl backdrop-blur shadow" id="card-highest-tx">
                  <span className="text-[10px] text-slate-400 tracking-wider font-display font-medium uppercase">HIGHEST TRANSACTION</span>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                      {(() => {
                        const monthlyTx = transactions.filter(t => t.date.startsWith(currentMonthStr));
                        if (monthlyTx.length > 0) {
                          const highest = [...monthlyTx].sort((a, b) => b.amount - a.amount)[0];
                          return (
                            <>
                              <h4 className="text-sm font-bold font-display text-white truncate max-w-[150px]">{highest.title}</h4>
                              <span className="text-xs text-indigo-400 font-mono font-bold mt-1 block">{currency}{highest.amount.toLocaleString()} ({highest.category})</span>
                            </>
                          );
                        }
                        return <h4 className="text-sm font-bold text-slate-400 font-display">No transactions yet</h4>;
                      })()}
                    </div>
                  </div>
                </div>

                {/* Daily average outflow */}
                <div className="bg-slate-900/40 border border-slate-200/10 dark:border-slate-800/50 p-5 rounded-2xl backdrop-blur shadow" id="card-daily-average">
                  <span className="text-[10px] text-slate-400 tracking-wider font-display font-medium uppercase">DAILY RUN RATE AVERAGE</span>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold font-display text-white">Daily Outflow Mean</h4>
                      <span className="text-xs text-emerald-400 font-mono font-bold mt-1 block">{currency}{Math.round(dailySpendingAverage).toLocaleString()} / day</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Graphical rendering of charts with Chart.js */}
              <FinanceCharts 
                transactions={transactions}
                budgets={budgets}
                currency={currency}
                isDarkMode={isDarkMode}
              />
            </div>
          )}

        </section>

        {/* Global Footer Credits */}
        <footer className="text-center py-5 border-t border-slate-200/10 dark:border-slate-800/50 text-xs text-slate-500 mt-auto flex justify-between items-center flex-wrap gap-4" id="credits-footer">
          <div className="flex items-center gap-1.5 font-semibold">
            <span>Built with ❤️ using React, HTML5, CSS3, JavaScript, Chart.js & LocalStorage</span>
          </div>
          <div>
            <span>BudgetBuddy Premium Ledger Applet • v2.0.1</span>
          </div>
        </footer>
      </main>

      {/* 5. ADD & EDIT TRANSACTION MODAL WINDOW */}
      {isAddTxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in" id="tx-modal-overlay">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-200/10 dark:border-slate-800 p-6 rounded-2xl shadow-2xl relative space-y-4" id="tx-modal-content">
            {/* Close button */}
            <button 
              onClick={() => { setIsAddTxOpen(false); setEditingTransaction(null); }}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white bg-slate-800 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Title */}
            <div>
              <h3 className="text-lg font-display font-bold text-white leading-tight">
                {editingTransaction ? `Edit Ledger: "${editingTransaction.title}"` : 'Record New Transaction'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Ctrl+S to save immediately, Esc to cancel.
              </p>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveTransaction} className="space-y-4 text-xs font-semibold">
              
              {/* Type Switcher: Income vs Expense */}
              <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-1" id="modal-type-switcher">
                <button
                  type="button"
                  onClick={() => { setTxType('expense'); setTxCategory('Food'); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    txType === 'expense' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🔴 Record Expense Outflow
                </button>
                <button
                  type="button"
                  onClick={() => { setTxType('income'); setTxCategory('Salary'); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    txType === 'income' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🟢 Record Income Inflow
                </button>
              </div>

              {/* Title & Amount */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="col-span-2">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Transaction Title</label>
                  <input
                    type="text"
                    value={txTitle}
                    onChange={(e) => setTxTitle(e.target.value)}
                    placeholder="e.g. Weekly Organic Groceries"
                    className="w-full bg-slate-850 border border-slate-700/60 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Amount ({currency})</label>
                  <input
                    type="number"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    placeholder="2500"
                    className="w-full bg-slate-850 border border-slate-700/60 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                    required
                    min="1"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Category Badge</label>
                  <select
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value)}
                    className="w-full bg-slate-850 border border-slate-700/60 rounded-xl py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {txType === 'income' ? (
                      ['Salary', 'Freelance', 'Business', 'Gift', 'Interest', 'Refund', 'Scholarship', 'Other'].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))
                    ) : (
                      [
                        'Food', 'Groceries', 'Snacks', 'Restaurant', 'Tea/Coffee', 'Transport', 'Fuel', 
                        'Shopping', 'Clothes', 'Electronics', 'Bills', 'Electricity', 'Water', 'Internet', 
                        'Mobile Recharge', 'Rent', 'Education', 'Books', 'College', 'Medical', 'Medicine', 
                        'Hospital', 'Entertainment', 'Movies', 'Netflix', 'Gaming', 'Travel', 'Family', 
                        'Friends', 'Investment', 'Savings', 'Charity', 'Pets', 'Others'
                      ].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Date & Payment Method */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Date of Entry</label>
                  <input
                    type="date"
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full bg-slate-850 border border-slate-700/60 rounded-xl py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Payment Method</label>
                  <select
                    value={txPaymentMethod}
                    onChange={(e) => setTxPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full bg-slate-850 border border-slate-700/60 rounded-xl py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="Cash">💵 Cash</option>
                    <option value="UPI">📱 UPI / QR</option>
                    <option value="Credit Card">💳 Credit Card</option>
                    <option value="Debit Card">🏧 Debit Card</option>
                    <option value="Net Banking">🏦 Net Banking</option>
                    <option value="Wallet">👛 Wallet</option>
                    <option value="Other">⚙️ Other</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Notes / Description (Optional)</label>
                <textarea
                  value={txNotes}
                  onChange={(e) => setTxNotes(e.target.value)}
                  placeholder="Include any receipts detail or location tags..."
                  rows={2}
                  className="w-full bg-slate-850 border border-slate-700/60 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Recurring Switch */}
              <div className="flex justify-between items-center p-3 bg-slate-950/40 rounded-xl border border-slate-800">
                <div>
                  <h4 className="text-slate-200 text-xs font-bold">Monthly Recurring Expense</h4>
                  <p className="text-[10px] text-slate-400 font-normal">Check this to automatically repeat this debit next month.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setTxIsRecurring(!txIsRecurring)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-all cursor-pointer ${
                    txIsRecurring ? 'bg-indigo-600 flex justify-end' : 'bg-slate-800 flex justify-start'
                  }`}
                >
                  <span className="w-4 h-4 bg-white rounded-full"></span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsAddTxOpen(false); setEditingTransaction(null); }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow cursor-pointer"
                >
                  {editingTransaction ? 'Save Changes' : 'Record Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. RESET ALL CONFIRMATION DIALOG MODAL */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in" id="reset-modal-overlay">
          <div className="w-full max-w-sm bg-slate-900 border border-rose-500/20 p-5 rounded-2xl shadow-2xl space-y-4" id="reset-modal-content">
            <h3 className="text-base font-display font-bold text-white flex items-center gap-1.5 leading-tight">
              ⚠️ Are you absolutely sure?
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              This action will permanently wipe out all offline transactions, monthly budgets, EMI logs, savings goals, and wishlists from your LocalStorage cache. This is irreversible.
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                No, Keep My Data
              </button>
              <button
                onClick={handleResetAllData}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Yes, Reset System
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. TOAST NOTIFICATION CONTAINER */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none" id="toasts-container">
        {toasts.map((toast) => (
          <div 
            key={toast.id}
            className={`p-3.5 rounded-xl border flex items-center gap-2.5 shadow-xl min-w-64 max-w-sm animate-fade-in pointer-events-auto bg-slate-900 border-slate-800 ${
              toast.type === 'success' ? 'border-l-4 border-l-emerald-500' :
              toast.type === 'warning' ? 'border-l-4 border-l-amber-500' :
              toast.type === 'error' ? 'border-l-4 border-l-rose-500' :
              'border-l-4 border-l-indigo-500'
            }`}
            id={toast.id}
          >
            <div>
              {toast.type === 'success' && <Sparkles className="w-4 h-4 text-emerald-400" />}
              {toast.type === 'warning' && <Info className="w-4 h-4 text-amber-400" />}
              {toast.type === 'error' && <Info className="w-4 h-4 text-rose-400" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-indigo-400" />}
            </div>
            <p className="text-xs font-bold text-slate-100">{toast.text}</p>
          </div>
        ))}
      </div>

      {/* Dynamic toggle analytics tab (reports) router support */}
      {activeTab === 'dashboard' && (
        <button
          onClick={() => setActiveTab('reports')}
          className="fixed bottom-6 left-6 md:left-[21rem] z-40 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-3.5 shadow-2xl shadow-indigo-600/30 border border-indigo-500 cursor-pointer flex items-center justify-center transition-all hover:scale-105"
          title="Inspect Reports & Visual Charts"
          id="floating-charts-shortcut"
        >
          <Sparkles className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
