import React, { useState } from 'react';
import { Transaction, Currency } from '../types';
import { ChevronLeft, ChevronRight, Calendar, Info, X, Clock } from 'lucide-react';
import { getCategoryIcon, getCategoryColor } from './CategoryIcons';

interface FinanceCalendarProps {
  transactions: Transaction[];
  currency: Currency;
  onSelectCalendarDate: (dateStr: string | null) => void;
  selectedCalendarDate: string | null;
}

export const FinanceCalendar: React.FC<FinanceCalendarProps> = ({
  transactions,
  currency,
  onSelectCalendarDate,
  selectedCalendarDate
}) => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // 0-indexed

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper calculations
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // Day of week (0-6)

  // Navigate Months
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Group transactions for current calendar view
  const getTransactionsForDay = (day: number): Transaction[] => {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
    return transactions.filter(t => t.date === dateStr);
  };

  const getDaySpendingAmount = (day: number): number => {
    const dayTx = getTransactionsForDay(day);
    return dayTx
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  // Click on a date
  const handleDayClick = (day: number) => {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
    
    if (selectedCalendarDate === dateStr) {
      onSelectCalendarDate(null); // Toggle off
    } else {
      onSelectCalendarDate(dateStr);
    }
  };

  // Generate calendar cells
  const renderCalendarDays = () => {
    const cells: React.ReactNode[] = [];
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Fill blank cells for days from previous month
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(<div key={`empty-${i}`} className="h-14 bg-slate-900/5 dark:bg-slate-950/20 rounded-lg"></div>);
    }

    // Days of month
    for (let d = 1; d <= daysInMonth; d++) {
      const formattedMonth = String(currentMonth + 1).padStart(2, '0');
      const formattedDay = String(d).padStart(2, '0');
      const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;

      const dailySpend = getDaySpendingAmount(d);
      const isSelected = selectedCalendarDate === dateStr;
      const isToday = todayStr === dateStr;

      cells.push(
        <button
          key={d}
          onClick={() => handleDayClick(d)}
          className={`h-14 p-1.5 flex flex-col justify-between items-stretch rounded-lg border text-left transition-all relative overflow-hidden cursor-pointer group ${
            isSelected 
              ? 'border-indigo-500 bg-indigo-500/10' 
              : isToday
              ? 'border-indigo-500/50 bg-slate-800/80'
              : 'border-slate-200/40 dark:border-slate-800/60 bg-slate-900/5 hover:bg-slate-900/30 dark:hover:bg-slate-800/40'
          }`}
          id={`cal-day-${d}`}
        >
          {/* Day number */}
          <span className={`text-xs font-semibold ${isToday ? 'text-indigo-400 font-bold' : isSelected ? 'text-indigo-300' : 'text-slate-300'}`}>
            {d}
          </span>

          {/* Spend display */}
          {dailySpend > 0 ? (
            <div className="flex flex-col items-start mt-auto">
              <span className="text-[9px] font-bold font-display text-rose-400 leading-none group-hover:scale-105 transition-transform">
                {currency}{dailySpend >= 1000 ? `${(dailySpend / 1000).toFixed(1)}k` : dailySpend}
              </span>
              {/* Little red dot marker */}
              <span className="absolute bottom-1 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></span>
            </div>
          ) : null}
        </button>
      );
    }

    return cells;
  };

  const selectedDateTransactions = selectedCalendarDate ? transactions.filter(t => t.date === selectedCalendarDate) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="calendar-view-container">
      {/* Calendar Grid card */}
      <div className="lg:col-span-2 bg-slate-900/30 border border-slate-200/10 dark:border-slate-800/50 p-5 rounded-2xl backdrop-blur-xl shadow-lg" id="calendar-grid-card">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <h2 className="font-display font-semibold text-base text-white">
              {monthNames[currentMonth]} {currentYear}
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button 
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Calendar Cells Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {renderCalendarDays()}
        </div>

        <p className="text-[10px] text-slate-500 mt-4 flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-indigo-400" /> Hover and click on any calendar cell to view and filter transaction logs for that date.
        </p>
      </div>

      {/* Selected day transactions ledger */}
      <div className="lg:col-span-1 bg-slate-900/30 border border-slate-200/10 dark:border-slate-800/50 p-5 rounded-2xl flex flex-col backdrop-blur-xl shadow-lg" id="calendar-ledger-card">
        {selectedCalendarDate ? (
          <div className="flex-1 flex flex-col h-full">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">SELECTED DATE</span>
                <span className="text-sm font-bold text-white font-display">
                  {new Date(selectedCalendarDate).toLocaleDateString('default', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <button 
                onClick={() => onSelectCalendarDate(null)}
                className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded-lg cursor-pointer"
                title="Clear selected date"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[350px] pr-1">
              {selectedDateTransactions.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8 border border-dashed border-slate-800 rounded-lg">
                  No active transactions registered on this day.
                </p>
              ) : (
                selectedDateTransactions.map(tx => {
                  const IconComp = getCategoryIcon(tx.category);
                  const isInc = tx.type === 'income';
                  return (
                    <div 
                      key={tx.id}
                      className="p-3 rounded-xl border border-slate-800/40 bg-slate-900/20 flex justify-between items-center gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`p-2 rounded-lg shrink-0 ${getCategoryColor(tx.category, tx.type)}`}>
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-slate-200 truncate leading-tight">{tx.title}</h4>
                          <span className="text-[9px] text-slate-400 block mt-0.5">{tx.category} • {tx.paymentMethod}</span>
                        </div>
                      </div>

                      <span className={`text-xs font-bold font-mono shrink-0 ${isInc ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isInc ? '+' : '-'}{currency}{tx.amount.toLocaleString()}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-slate-400 h-full">
            <Calendar className="w-10 h-10 text-slate-700 mb-3 animate-bounce" />
            <p className="text-sm font-semibold text-slate-300">Select a Date</p>
            <p className="text-[11px] text-slate-500 max-w-xs mt-1.5 leading-relaxed">
              Click any calendar box on the left to show and inspect its full itemized transactional ledger here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
