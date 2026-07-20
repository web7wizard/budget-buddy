import React, { useState } from 'react';
import { Budget, Transaction, Currency } from '../types';
import { PiggyBank, Plus, Trash2, AlertTriangle, Check, Smile, DollarSign, ListFilter, Activity } from 'lucide-react';

interface BudgetPlannerProps {
  budgets: Budget[];
  transactions: Transaction[];
  onUpdateBudgets: (budgets: Budget[]) => void;
  currency: Currency;
  onShowToast: (text: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

export const BudgetPlanner: React.FC<BudgetPlannerProps> = ({
  budgets,
  transactions,
  onUpdateBudgets,
  currency,
  onShowToast
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [category, setCategory] = useState('Food');
  const [limit, setLimit] = useState('');

  const currentMonthStr = new Date().toISOString().substring(0, 7);

  // Hardcoded categories match expense categories list
  const expenseCategories = [
    'Food', 'Groceries', 'Snacks', 'Restaurant', 'Tea/Coffee',
    'Transport', 'Fuel', 'Shopping', 'Clothes', 'Electronics',
    'Bills', 'Electricity', 'Water', 'Internet', 'Mobile Recharge',
    'Rent', 'Education', 'Books', 'College', 'Medical', 'Medicine',
    'Hospital', 'Entertainment', 'Movies', 'Netflix', 'Gaming',
    'Travel', 'Family', 'Friends', 'Investment', 'Savings',
    'Charity', 'Pets', 'Others'
  ];

  const handleAddBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!limit || parseFloat(limit) <= 0) {
      onShowToast('Please enter a valid positive budget limit.', 'error');
      return;
    }

    // Check if category budget already exists
    const exists = budgets.find(b => b.category === category);
    if (exists) {
      // Overwrite/Update existing category budget limit
      const updated = budgets.map(b => b.category === category ? { ...b, limit: parseFloat(limit) } : b);
      onUpdateBudgets(updated);
      onShowToast(`Updated "${category}" budget to ${currency}${parseFloat(limit).toLocaleString()}`, 'success');
    } else {
      const budget: Budget = {
        id: `budget-${Date.now()}`,
        category,
        limit: parseFloat(limit)
      };
      onUpdateBudgets([...budgets, budget]);
      onShowToast(`Created a budget of ${currency}${parseFloat(limit).toLocaleString()} for "${category}"!`, 'success');
    }

    setLimit('');
    setIsAdding(false);
  };

  const handleDeleteBudget = (id: string) => {
    const b = budgets.find(item => item.id === id);
    const updated = budgets.filter(item => item.id !== id);
    onUpdateBudgets(updated);
    if (b) onShowToast(`Removed budget for "${b.category}".`, 'info');
  };

  // Calculate actual spending per category for this month
  const getCategorySpentThisMonth = (cat: string): number => {
    return transactions
      .filter(t => t.type === 'expense' && t.category === cat && t.date.startsWith(currentMonthStr))
      .reduce((sum, t) => sum + t.amount, 0);
  };

  return (
    <div className="space-y-6" id="budget-panel">
      {/* Header and Toggle */}
      <div className="flex justify-between items-center bg-slate-900/10 p-1 rounded-xl">
        <h2 className="font-display font-semibold text-lg text-white flex items-center gap-2">
          <PiggyBank className="w-5 h-5 text-indigo-400" />
          Monthly Budget Planner
        </h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-4.5 py-2 font-display font-medium text-xs rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white transition-all shadow-md cursor-pointer"
          id="btn-add-budget"
        >
          {isAdding ? 'Close Builder' : <><Plus className="w-4 h-4" /> Configure Category Budget</>}
        </button>
      </div>

      {/* Configure Budget Form */}
      {isAdding && (
        <form onSubmit={handleAddBudget} className="bg-slate-900/40 border border-slate-200/10 dark:border-slate-800/50 p-5 rounded-2xl backdrop-blur-md max-w-md mx-auto space-y-4 animate-fade-in" id="add-budget-form">
          <h3 className="font-display font-semibold text-sm text-white mb-2">Set Category Expense Cap</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Expense Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-850 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {expenseCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Monthly Spending Limit ({currency})</label>
              <input
                type="number"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                placeholder="5000"
                className="w-full bg-slate-850 border border-slate-700 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                required
                min="1"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
          >
            <Check className="w-4 h-4" /> Save Category Budget
          </button>
        </form>
      )}

      {/* Budgets Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="budgets-grid">
        {budgets.length === 0 ? (
          <div className="lg:col-span-3 text-center py-16 border border-dashed border-slate-800 rounded-2xl text-slate-400 bg-slate-900/10" id="budgets-empty">
            <PiggyBank className="w-12 h-12 mx-auto text-slate-600 mb-2" />
            <h3 className="font-display font-medium text-slate-300">No active category limits set</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
              Create monthly budgets for categories like Food, Travel, and Rent to visualize, control, and prevent overspending.
            </p>
          </div>
        ) : (
          budgets.map((b) => {
            const spent = getCategorySpentThisMonth(b.category);
            const remaining = Math.max(0, b.limit - spent);
            const pct = Math.min(100, Math.round((spent / b.limit) * 100));
            const isOverBudget = spent > b.limit;

            return (
              <div
                key={b.id}
                className={`bg-slate-900/30 border p-5 rounded-2xl flex flex-col backdrop-blur-xl shadow-md transition-all hover:translate-y-[-2px] ${
                  isOverBudget 
                    ? 'border-rose-500/30 bg-rose-500/5 shadow-[0_0_12px_rgba(239,68,68,0.1)] animate-pulse' 
                    : 'border-slate-200/10 dark:border-slate-800/50'
                }`}
                id={`budget-card-${b.id}`}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-display font-semibold text-base text-white truncate leading-tight">
                      {b.category}
                    </h3>
                    <span className="text-[10px] text-slate-400 block mt-1 font-semibold uppercase tracking-wider">
                      CAP: {currency}{b.limit.toLocaleString()} / mo
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteBudget(b.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer shrink-0"
                    title="Delete budget limit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress bar info */}
                <div className="flex justify-between items-end text-xs mb-1.5">
                  <span className="text-slate-400 font-semibold">Spent {pct}%</span>
                  <span className={`font-bold font-mono ${isOverBudget ? 'text-rose-400' : 'text-slate-200'}`}>
                    {currency}{spent.toLocaleString()}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 bg-slate-850 rounded-full overflow-hidden mb-3.5 relative border border-slate-700/30">
                  <div
                    className={`h-full transition-all duration-1000 ease-out rounded-full ${
                      isOverBudget ? 'bg-rose-500' : pct > 80 ? 'bg-amber-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>

                {/* Footer values */}
                <div className="flex justify-between items-center mt-auto text-xs font-semibold">
                  {isOverBudget ? (
                    <span className="text-rose-400 flex items-center gap-1 text-[11px] font-bold">
                      <AlertTriangle className="w-4 h-4 shrink-0" /> OVER BUDGET! (-{currency}{(spent - b.limit).toLocaleString()})
                    </span>
                  ) : (
                    <span className="text-emerald-400 text-[11px] font-bold">
                      ✓ {currency}{remaining.toLocaleString()} remaining
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
