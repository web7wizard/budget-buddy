import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Filler,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Transaction, Budget, Currency } from '../types';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Filler
);

interface FinanceChartsProps {
  transactions: Transaction[];
  budgets: Budget[];
  currency: Currency;
  isDarkMode: boolean;
}

export const FinanceCharts: React.FC<FinanceChartsProps> = ({
  transactions,
  budgets,
  currency,
  isDarkMode
}) => {
  const pieRef = useRef<HTMLCanvasElement>(null);
  const barRef = useRef<HTMLCanvasElement>(null);
  const lineRef = useRef<HTMLCanvasElement>(null);
  const doughnutRef = useRef<HTMLCanvasElement>(null);

  const pieChartInstance = useRef<ChartJS | null>(null);
  const barChartInstance = useRef<ChartJS | null>(null);
  const lineChartInstance = useRef<ChartJS | null>(null);
  const doughnutChartInstance = useRef<ChartJS | null>(null);

  const textPrimary = isDarkMode ? '#F8FAFC' : '#0F172A';
  const textMuted = isDarkMode ? '#94A3B8' : '#64748B';
  const gridColor = isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.1)';

  // Calculate chart data
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  const incomeTransactions = transactions.filter(t => t.type === 'income');

  // 1. Expense by Category
  const expenseByCategory: Record<string, number> = {};
  expenseTransactions.forEach(t => {
    expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
  });

  const pieLabels = Object.keys(expenseByCategory);
  const pieValues = Object.values(expenseByCategory);

  const pieColors = [
    '#F43F5E', '#EC4899', '#D946EF', '#A855F7', '#8B5CF6', 
    '#6366F1', '#3B82F6', '#0EA5E9', '#06B6D4', '#14B8A6', 
    '#10B981', '#22C55E', '#84CC16', '#EAB308', '#F97316'
  ];

  // 2. Monthly Income vs Expense (grouped by month or just current month comparison)
  // Let's group transactions by month for the last 6 months
  const monthsList: string[] = [];
  const incomeByMonth: Record<string, number> = {};
  const expenseByMonth: Record<string, number> = {};

  const getMonthYearString = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('default', { month: 'short', year: '2-digit' });
    } catch {
      return 'Unknown';
    }
  };

  // Pre-populate last 4 months in order
  for (let i = 3; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const mStr = getMonthYearString(d.toISOString().substring(0, 10));
    monthsList.push(mStr);
    incomeByMonth[mStr] = 0;
    expenseByMonth[mStr] = 0;
  }

  transactions.forEach(t => {
    const mStr = getMonthYearString(t.date);
    if (monthsList.includes(mStr)) {
      if (t.type === 'income') {
        incomeByMonth[mStr] += t.amount;
      } else {
        expenseByMonth[mStr] += t.amount;
      }
    }
  });

  // 3. Daily Spending (Last 14 days)
  const last14Days: string[] = [];
  const dailySpending: Record<string, number> = {};

  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().split('T')[0];
    last14Days.push(dStr);
    dailySpending[dStr] = 0;
  }

  expenseTransactions.forEach(t => {
    if (dailySpending[t.date] !== undefined) {
      dailySpending[t.date] += t.amount;
    }
  });

  const lineLabels = last14Days.map(dStr => {
    const d = new Date(dStr);
    return d.toLocaleDateString('default', { day: 'numeric', month: 'short' });
  });
  const lineValues = last14Days.map(dStr => dailySpending[dStr]);

  // 4. Budget Usage
  // Compare budget limits with actual spent per category for categories that have budgets
  const budgetLabels = budgets.map(b => b.category);
  const budgetLimits = budgets.map(b => b.limit);
  const budgetSpent = budgets.map(b => {
    return expenseTransactions
      .filter(t => t.category === b.category)
      .reduce((sum, t) => sum + t.amount, 0);
  });

  useEffect(() => {
    // Destroy previous charts to re-render with new theme/data
    if (pieChartInstance.current) pieChartInstance.current.destroy();
    if (barChartInstance.current) barChartInstance.current.destroy();
    if (lineChartInstance.current) lineChartInstance.current.destroy();
    if (doughnutChartInstance.current) doughnutChartInstance.current.destroy();

    // Render Pie Chart (Expenses by Category)
    if (pieRef.current && pieLabels.length > 0) {
      pieChartInstance.current = new ChartJS(pieRef.current, {
        type: 'pie',
        data: {
          labels: pieLabels,
          datasets: [{
            data: pieValues,
            backgroundColor: pieColors.slice(0, pieLabels.length),
            borderColor: isDarkMode ? '#1E293B' : '#FFFFFF',
            borderWidth: 2,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                color: textPrimary,
                font: { family: 'Inter', size: 11 },
                boxWidth: 12
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => ` ${context.label}: ${currency}${context.parsed.toLocaleString()}`
              }
            }
          }
        }
      });
    }

    // Render Bar Chart (Income vs Expense)
    if (barRef.current) {
      barChartInstance.current = new ChartJS(barRef.current, {
        type: 'bar',
        data: {
          labels: monthsList,
          datasets: [
            {
              label: 'Income',
              data: monthsList.map(m => incomeByMonth[m]),
              backgroundColor: '#10B981',
              borderRadius: 6,
            },
            {
              label: 'Expense',
              data: monthsList.map(m => expenseByMonth[m]),
              backgroundColor: '#EF4444',
              borderRadius: 6,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: textPrimary, font: { family: 'Inter' } }
            },
            tooltip: {
              callbacks: {
                label: (context) => ` ${context.dataset.label}: ${currency}${context.parsed.toLocaleString()}`
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: textMuted, font: { family: 'Inter' } }
            },
            y: {
              grid: { color: gridColor },
              ticks: { color: textMuted, font: { family: 'Inter' } }
            }
          }
        }
      });
    }

    // Render Line Chart (Daily Spending Trend)
    if (lineRef.current) {
      const ctx = lineRef.current.getContext('2d');
      let gradient: CanvasGradient | undefined;
      if (ctx) {
        gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(79, 70, 229, 0.35)');
        gradient.addColorStop(1, 'rgba(79, 70, 229, 0)');
      }

      lineChartInstance.current = new ChartJS(lineRef.current, {
        type: 'line',
        data: {
          labels: lineLabels,
          datasets: [{
            label: 'Daily Outflow',
            data: lineValues,
            borderColor: '#4F46E5',
            borderWidth: 3,
            backgroundColor: gradient || 'rgba(79, 70, 229, 0.1)',
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#4F46E5',
            pointBorderColor: isDarkMode ? '#1E293B' : '#FFFFFF',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => ` Spent: ${currency}${context.parsed.toLocaleString()}`
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: textMuted, font: { family: 'Inter' }, maxRotation: 45 }
            },
            y: {
              grid: { color: gridColor },
              ticks: { color: textMuted, font: { family: 'Inter' } }
            }
          }
        }
      });
    }

    // Render Doughnut Chart (Budget Utilization)
    if (doughnutRef.current && budgets.length > 0) {
      // Calculate overall budget utilization percentage
      const totalBudgetLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
      const totalBudgetSpent = budgets.reduce((sum, b) => {
        const spent = expenseTransactions
          .filter(t => t.category === b.category)
          .reduce((total, t) => total + t.amount, 0);
        return sum + Math.min(spent, b.limit); // Cap at limit for chart visualization
      }, 0);

      const remainingBudget = Math.max(0, totalBudgetLimit - totalBudgetSpent);

      doughnutChartInstance.current = new ChartJS(doughnutRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Spent', 'Remaining'],
          datasets: [{
            data: [totalBudgetSpent, remainingBudget],
            backgroundColor: ['#6366F1', 'rgba(148, 163, 184, 0.2)'],
            borderColor: isDarkMode ? '#1E293B' : '#FFFFFF',
            borderWidth: 2,
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: textPrimary,
                font: { family: 'Inter', size: 12 },
                boxWidth: 12
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => ` ${context.label}: ${currency}${context.parsed.toLocaleString()}`
              }
            }
          }
        }
      });
    }

    return () => {
      if (pieChartInstance.current) pieChartInstance.current.destroy();
      if (barChartInstance.current) barChartInstance.current.destroy();
      if (lineChartInstance.current) lineChartInstance.current.destroy();
      if (doughnutChartInstance.current) doughnutChartInstance.current.destroy();
    };
  }, [transactions, budgets, currency, isDarkMode]);

  const hasExpenses = pieLabels.length > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="charts-wrapper">
      {/* 1. Category Distribution */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col h-80 shadow-sm" id="chart-card-category">
        <h3 className="font-display font-medium text-slate-800 dark:text-slate-200 mb-3 text-sm tracking-wide">EXPENSE BY CATEGORY</h3>
        <div className="relative flex-1 flex items-center justify-center">
          {hasExpenses ? (
            <canvas ref={pieRef}></canvas>
          ) : (
            <p className="text-sm text-slate-400 dark:text-slate-500">No expenses recorded for breakdown.</p>
          )}
        </div>
      </div>

      {/* 2. Monthly Comparison */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col h-80 shadow-sm" id="chart-card-income-expense">
        <h3 className="font-display font-medium text-slate-800 dark:text-slate-200 mb-3 text-sm tracking-wide">MONTHLY COMPARISON</h3>
        <div className="relative flex-1">
          <canvas ref={barRef}></canvas>
        </div>
      </div>

      {/* 3. Daily Spending Line */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col h-80 shadow-sm" id="chart-card-trend">
        <h3 className="font-display font-medium text-slate-800 dark:text-slate-200 mb-3 text-sm tracking-wide">DAILY OUTFLOW TREND (14 DAYS)</h3>
        <div className="relative flex-1">
          <canvas ref={lineRef}></canvas>
        </div>
      </div>

      {/* 4. Overall Budget Doughnut */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col h-80 shadow-sm" id="chart-card-budget">
        <h3 className="font-display font-medium text-slate-800 dark:text-slate-200 mb-3 text-sm tracking-wide">BUDGET ALLOCATION UTILIZATION</h3>
        <div className="relative flex-1 flex items-center justify-center">
          {budgets.length > 0 ? (
            <canvas ref={doughnutRef}></canvas>
          ) : (
            <p className="text-sm text-slate-400 dark:text-slate-500">No category budgets created. Go to Budget tab!</p>
          )}
        </div>
      </div>
    </div>
  );
};
