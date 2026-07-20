import React from 'react';
import { Transaction, Budget, Currency } from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Smile, 
  Lightbulb, 
  Activity,
  Award,
  TrendingUp as GrowthIcon,
  Flame,
  ArrowRight
} from 'lucide-react';

interface DailySpendingAndInsightsProps {
  transactions: Transaction[];
  budgets: Budget[];
  currency: Currency;
}

export const DailySpendingAndInsights: React.FC<DailySpendingAndInsightsProps> = ({
  transactions,
  budgets,
  currency
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  })();

  // Filter transactions
  const expenseTx = transactions.filter(t => t.type === 'expense');
  const incomeTx = transactions.filter(t => t.type === 'income');

  // Daily Stats Calculations
  const todaySpend = expenseTx
    .filter(t => t.date === todayStr)
    .reduce((sum, t) => sum + t.amount, 0);

  const yesterdaySpend = expenseTx
    .filter(t => t.date === yesterdayStr)
    .reduce((sum, t) => sum + t.amount, 0);

  // Weekly spending (last 7 days)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weeklySpend = expenseTx
    .filter(t => new Date(t.date) >= oneWeekAgo)
    .reduce((sum, t) => sum + t.amount, 0);

  // Monthly spending (current calendar month)
  const currentMonthStr = new Date().toISOString().substring(0, 7); // 'YYYY-MM'
  const monthlySpend = expenseTx
    .filter(t => t.date.startsWith(currentMonthStr))
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyIncome = incomeTx
    .filter(t => t.date.startsWith(currentMonthStr))
    .reduce((sum, t) => sum + t.amount, 0);

  // Max and Min transaction values this month
  const monthlyExpensesList = expenseTx.filter(t => t.date.startsWith(currentMonthStr));
  const maxTx = monthlyExpensesList.length > 0 ? Math.max(...monthlyExpensesList.map(t => t.amount)) : 0;
  const minTx = monthlyExpensesList.length > 0 ? Math.min(...monthlyExpensesList.map(t => t.amount)) : 0;

  // Daily Average (this month)
  const currentDayOfMonth = new Date().getDate();
  const dailyAverage = currentDayOfMonth > 0 ? monthlySpend / currentDayOfMonth : 0;

  // Financial Health Score Calculation
  const calculateHealthScore = () => {
    let score = 50; // Starting baseline

    // 1. Income vs Expense Ratio
    if (monthlyIncome > 0) {
      const expenseRatio = monthlySpend / monthlyIncome;
      if (expenseRatio <= 0.4) score += 25;
      else if (expenseRatio <= 0.6) score += 15;
      else if (expenseRatio <= 0.8) score += 5;
      else if (expenseRatio > 0.95) score -= 15;
    } else if (monthlySpend > 0) {
      score -= 20; // Expenses but no income is risky
    }

    // 2. Savings Rate
    if (monthlyIncome > 0) {
      const savingsRate = (monthlyIncome - monthlySpend) / monthlyIncome;
      if (savingsRate >= 0.35) score += 15;
      else if (savingsRate >= 0.15) score += 8;
      else if (savingsRate < 0) score -= 10;
    }

    // 3. Budget adherence
    if (budgets.length > 0) {
      let overBudgetCount = 0;
      budgets.forEach(b => {
        const spent = expenseTx
          .filter(t => t.category === b.category && t.date.startsWith(currentMonthStr))
          .reduce((sum, t) => sum + t.amount, 0);
        if (spent > b.limit) overBudgetCount++;
      });

      if (overBudgetCount === 0) score += 10;
      else score -= overBudgetCount * 5;
    } else {
      score += 5; // Extra points for starting out
    }

    // Bound the score between 5 and 100
    return Math.max(5, Math.min(100, score));
  };

  const healthScore = calculateHealthScore();
  const getHealthLevel = (score: number) => {
    if (score >= 85) return { text: 'Excellent', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' };
    if (score >= 70) return { text: 'Good', color: 'text-teal-400 border-teal-500/30 bg-teal-500/10' };
    if (score >= 50) return { text: 'Average', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' };
    return { text: 'Needs Improvement', color: 'text-rose-400 border-rose-500/30 bg-rose-500/10' };
  };

  const health = getHealthLevel(healthScore);

  // Smart Insights generator
  const getSmartInsights = () => {
    const insights: Array<{ text: string; type: 'success' | 'warning' | 'info'; sub: string }> = [];

    // Tip 1: Savings Habit
    if (monthlyIncome > 0) {
      const savingsPercent = Math.round(((monthlyIncome - monthlySpend) / monthlyIncome) * 100);
      if (savingsPercent >= 30) {
        insights.push({
          text: 'Excellent savings habit this month!',
          type: 'success',
          sub: `You have successfully retained ${savingsPercent}% of your active income so far.`
        });
      } else if (savingsPercent < 0) {
        insights.push({
          text: 'Caution: Outflow is outstripping income.',
          type: 'warning',
          sub: 'You are currently spending more than your monthly earnings. Try restricting non-essential purchases.'
        });
      }
    }

    // Tip 2: Category overspends (Food)
    const foodSpend = expenseTx
      .filter(t => (t.category === 'Food' || t.category === 'Restaurant' || t.category === 'Snacks') && t.date.startsWith(currentMonthStr))
      .reduce((sum, t) => sum + t.amount, 0);

    const prevMonthFoodSpend = expenseTx
      .filter(t => {
        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        const prevMonthStr = d.toISOString().substring(0, 7);
        return (t.category === 'Food' || t.category === 'Restaurant' || t.category === 'Snacks') && t.date.startsWith(prevMonthStr);
      })
      .reduce((sum, t) => sum + t.amount, 0);

    if (prevMonthFoodSpend > 0 && foodSpend > prevMonthFoodSpend * 1.2) {
      const increasePct = Math.round(((foodSpend - prevMonthFoodSpend) / prevMonthFoodSpend) * 100);
      insights.push({
        text: `You spent ${increasePct}% more on food this month.`,
        type: 'warning',
        sub: `Food expenses are at ${currency}${foodSpend.toLocaleString()} compared to ${currency}${prevMonthFoodSpend.toLocaleString()} last month.`
      });
    }

    // Tip 3: Budget Status
    let budgetExceeded = false;
    let safeBudgetCategories: string[] = [];
    budgets.forEach(b => {
      const spent = expenseTx
        .filter(t => t.category === b.category && t.date.startsWith(currentMonthStr))
        .reduce((sum, t) => sum + t.amount, 0);
      if (spent > b.limit) {
        budgetExceeded = true;
      } else if (spent > 0 && spent < b.limit * 0.7) {
        safeBudgetCategories.push(b.category);
      }
    });

    if (budgetExceeded) {
      insights.push({
        text: 'Action required: Over-budget alert!',
        type: 'warning',
        sub: 'One or more category budgets have been exceeded. Review your Transactions table to curb costs.'
      });
    } else if (safeBudgetCategories.length > 0) {
      insights.push({
        text: `Good job! You are safely within your ${safeBudgetCategories[0].toLowerCase()} budget.`,
        type: 'success',
        sub: 'Your budget controls are working excellently in keeping this category optimized.'
      });
    }

    // Tip 4: Entertainment
    const entertainmentSpend = expenseTx
      .filter(t => (t.category === 'Entertainment' || t.category === 'Movies' || t.category === 'Netflix' || t.category === 'Gaming') && t.date.startsWith(currentMonthStr))
      .reduce((sum, t) => sum + t.amount, 0);

    if (entertainmentSpend > monthlySpend * 0.15 && entertainmentSpend > 1000) {
      insights.push({
        text: 'Recommendation: Try reducing entertainment expenses.',
        type: 'info',
        sub: `Leisure spending comprises ${Math.round((entertainmentSpend / monthlySpend) * 100)}% of your total outflows. Cutting down will accelerate your savings.`
      });
    }

    // Tip 5: General Tips if none generated
    if (insights.length < 3) {
      insights.push({
        text: 'Build sustainable wealth through micro-SIPs.',
        type: 'info',
        sub: 'Investing as little as 10% of your salary at the beginning of the month helps secure compounding gains.'
      });
    }

    return insights;
  };

  const insights = getSmartInsights();

  return (
    <div className="space-y-6" id="daily-insights-panel">
      {/* 1. Health Score Header Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health score widget */}
        <div className="lg:col-span-1 bg-slate-900/40 border border-slate-200/10 dark:border-slate-800/50 p-5 rounded-2xl flex flex-col items-center justify-center text-center backdrop-blur-xl shadow-md" id="health-score-widget">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-indigo-400" />
            <span className="text-xs text-slate-400 tracking-wider font-display font-medium">FINANCIAL HEALTH SCORE</span>
          </div>

          <div className="relative flex items-center justify-center w-28 h-28 my-2">
            {/* SVG circle meter */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r="48"
                className="stroke-slate-800"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="56"
                cy="56"
                r="48"
                className="stroke-indigo-500 transition-all duration-1000 ease-out"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 48}
                strokeDashoffset={2 * Math.PI * 48 * (1 - healthScore / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-display font-bold text-white">{healthScore}</span>
              <span className="text-[10px] text-slate-400">out of 100</span>
            </div>
          </div>

          <div className={`mt-3 px-3 py-1 text-xs font-semibold rounded-full border ${health.color}`} id="health-badge">
            {health.text}
          </div>
        </div>

        {/* Smart Insights list */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-200/10 dark:border-slate-800/50 p-5 rounded-2xl backdrop-blur-xl shadow-md flex flex-col" id="insights-widget">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs text-slate-400 tracking-wider font-display font-medium">SMART FINANCE INSIGHTS</h3>
          </div>

          <div className="space-y-3.5 flex-1 overflow-y-auto max-h-56 pr-1" id="insights-list">
            {insights.map((insight, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-xl border flex gap-3 transition-all hover:translate-x-1 ${
                  insight.type === 'success' 
                    ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-300' 
                    : insight.type === 'warning'
                    ? 'bg-amber-500/5 border-amber-500/10 text-amber-300'
                    : 'bg-indigo-500/5 border-indigo-500/10 text-indigo-300'
                }`}
                id={`insight-item-${index}`}
              >
                <div className="mt-0.5">
                  {insight.type === 'success' && <Award className="w-4 h-4 text-emerald-400" />}
                  {insight.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                  {insight.type === 'info' && <Lightbulb className="w-4 h-4 text-indigo-400" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold font-display text-slate-100">{insight.text}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{insight.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Micro Daily Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="daily-stats-row">
        {/* Today's Expense */}
        <div className="bg-slate-900/20 border border-slate-200/5 dark:border-slate-800/40 p-4 rounded-xl flex flex-col" id="stat-today">
          <span className="text-[10px] text-slate-400 tracking-wider font-display font-medium">TODAY'S SPENDING</span>
          <span className="text-xl font-bold font-display text-white mt-1">
            {currency}{todaySpend.toLocaleString(undefined, { minimumFractionDigits: 0 })}
          </span>
          <div className="flex items-center gap-1 mt-1.5 text-[10px] text-slate-400">
            {todaySpend > yesterdaySpend ? (
              <span className="text-rose-400 flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> High
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center">
                <TrendingDown className="w-3 h-3 mr-0.5" /> Stable
              </span>
            )}
            <span>vs yesterday</span>
          </div>
        </div>

        {/* Yesterday's Expense */}
        <div className="bg-slate-900/20 border border-slate-200/5 dark:border-slate-800/40 p-4 rounded-xl flex flex-col" id="stat-yesterday">
          <span className="text-[10px] text-slate-400 tracking-wider font-display font-medium">YESTERDAY'S SPEND</span>
          <span className="text-xl font-bold font-display text-slate-300 mt-1">
            {currency}{yesterdaySpend.toLocaleString(undefined, { minimumFractionDigits: 0 })}
          </span>
          <span className="text-[10px] text-slate-500 mt-2">Logged daily tracking</span>
        </div>

        {/* Weekly Expense */}
        <div className="bg-slate-900/20 border border-slate-200/5 dark:border-slate-800/40 p-4 rounded-xl flex flex-col" id="stat-weekly">
          <span className="text-[10px] text-slate-400 tracking-wider font-display font-medium">WEEKLY RUN RATE</span>
          <span className="text-xl font-bold font-display text-white mt-1">
            {currency}{weeklySpend.toLocaleString(undefined, { minimumFractionDigits: 0 })}
          </span>
          <span className="text-[10px] text-slate-400 mt-2 flex items-center">
            <Flame className="w-3 h-3 text-amber-400 mr-1 animate-pulse" /> Active 7-day window
          </span>
        </div>

        {/* Daily Spending Average */}
        <div className="bg-slate-900/20 border border-slate-200/5 dark:border-slate-800/40 p-4 rounded-xl flex flex-col" id="stat-average">
          <span className="text-[10px] text-slate-400 tracking-wider font-display font-medium">DAILY SPEND AVERAGE</span>
          <span className="text-xl font-bold font-display text-indigo-400 mt-1">
            {currency}{Math.round(dailyAverage).toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 mt-2">This month's pace</span>
        </div>
      </div>

      {/* 3. Range Min & Max Statistics */}
      <div className="p-4 rounded-xl border border-dashed border-slate-200/10 dark:border-slate-800/60 bg-slate-900/10 flex flex-wrap justify-between items-center gap-4 text-xs text-slate-400" id="limit-stats-row">
        <div className="flex items-center gap-2">
          <span className="font-display font-medium tracking-wide">RANGE ANALYSIS (CURRENT MONTH):</span>
        </div>
        <div className="flex gap-6">
          <div>
            <span className="text-[10px] text-slate-500 uppercase mr-1">Highest Expense:</span>
            <span className="font-bold text-rose-400 font-display">{currency}{maxTx.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase mr-1">Lowest Expense:</span>
            <span className="font-bold text-emerald-400 font-display">{currency}{minTx.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
