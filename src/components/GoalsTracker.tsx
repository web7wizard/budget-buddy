import React, { useState } from 'react';
import { SavingsGoal, Currency } from '../types';
import { Target, Plus, Trash2, Calendar, Award, Sparkles, AlertCircle, TrendingUp, ArrowDownRight, RefreshCcw } from 'lucide-react';

interface GoalsTrackerProps {
  goals: SavingsGoal[];
  onUpdateGoals: (goals: SavingsGoal[]) => void;
  currency: Currency;
  onShowToast: (text: string, type: 'success' | 'info' | 'warning' | 'error') => void;
  onTriggerCelebration: () => void;
}

export const GoalsTracker: React.FC<GoalsTrackerProps> = ({
  goals,
  onUpdateGoals,
  currency,
  onShowToast,
  onTriggerCelebration
}) => {
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [targetAmt, setTargetAmt] = useState('');
  const [savedAmt, setSavedAmt] = useState('');
  const [deadline, setDeadline] = useState('');

  // Update Goal modal states for localized Deposit/Withdraw
  const [activeDepositId, setActiveDepositId] = useState<string | null>(null);
  const [activeDepositType, setActiveDepositType] = useState<'deposit' | 'withdraw'>('deposit');
  const [depositValue, setDepositValue] = useState('');

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName.trim() || !targetAmt || !deadline) {
      onShowToast('Please fill out all goal parameters.', 'error');
      return;
    }
    const current = parseFloat(savedAmt) || 0;
    const target = parseFloat(targetAmt);

    if (current > target) {
      onShowToast('Initial savings cannot exceed target.', 'warning');
      return;
    }

    const goal: SavingsGoal = {
      id: `goal-${Date.now()}`,
      name: goalName.trim(),
      targetAmount: target,
      currentSaved: current,
      deadline: deadline
    };

    onUpdateGoals([goal, ...goals]);
    onShowToast(`Savings goal for "${goal.name}" set successfully!`, 'success');

    // Celebration check!
    if (current >= target) {
      onTriggerCelebration();
      onShowToast(`Congratulations! You have already completed your goal for "${goal.name}"!`, 'success');
    }

    // Reset Form
    setGoalName('');
    setTargetAmt('');
    setSavedAmt('');
    setDeadline('');
    setIsAddingGoal(false);
  };

  const handleDeleteGoal = (id: string) => {
    const goal = goals.find(g => g.id === id);
    const updated = goals.filter(g => g.id !== id);
    onUpdateGoals(updated);
    if (goal) onShowToast(`Removed savings goal for "${goal.name}".`, 'info');
  };

  const handleUpdateSavings = (goalId: string) => {
    const val = parseFloat(depositValue);
    if (!val || val <= 0) {
      onShowToast('Please enter a positive transaction amount.', 'error');
      return;
    }

    const updated = goals.map(g => {
      if (g.id === goalId) {
        let nextSaved = g.currentSaved;
        if (activeDepositType === 'deposit') {
          nextSaved += val;
          if (nextSaved > g.targetAmount) nextSaved = g.targetAmount;
          onShowToast(`Saved ${currency}${val.toLocaleString()} to "${g.name}"!`, 'success');
          
          if (nextSaved >= g.targetAmount && g.currentSaved < g.targetAmount) {
            onTriggerCelebration();
            onShowToast(`🏆 Celebration! Goal "${g.name}" completed successfully!`, 'success');
          }
        } else {
          nextSaved -= val;
          if (nextSaved < 0) nextSaved = 0;
          onShowToast(`Withdrew ${currency}${val.toLocaleString()} from "${g.name}".`, 'info');
        }
        return { ...g, currentSaved: nextSaved };
      }
      return g;
    });

    onUpdateGoals(updated);
    setDepositValue('');
    setActiveDepositId(null);
  };

  const getDaysRemaining = (deadlineStr: string) => {
    const diffTime = new Date(deadlineStr).getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6" id="goals-container">
      <div className="flex justify-between items-center bg-slate-900/10 p-1 rounded-xl">
        <h2 className="font-display font-semibold text-lg text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-400" />
          Active Savings Goals
        </h2>
        <button
          onClick={() => setIsAddingGoal(!isAddingGoal)}
          className="flex items-center gap-1.5 px-4.5 py-2 font-display font-medium text-xs rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 transition-all shadow-md cursor-pointer"
          id="btn-add-goal"
        >
          {isAddingGoal ? 'Close Form' : <><Plus className="w-4 h-4" /> Create Savings Goal</>}
        </button>
      </div>

      {/* Add Goal Form */}
      {isAddingGoal && (
        <form onSubmit={handleAddGoal} className="bg-slate-900/40 border border-slate-200/10 dark:border-slate-800/50 p-5 rounded-2xl backdrop-blur-md max-w-xl mx-auto space-y-4 animate-fade-in" id="add-goal-form">
          <h3 className="font-display font-semibold text-sm text-white mb-2">Set up a Target Savings Goal</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Goal Name / Slogan</label>
              <input
                type="text"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                placeholder="e.g. Dream Japan Vacation or iMac Pro"
                className="w-full bg-slate-850 border border-slate-700 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Target Amount</label>
              <input
                type="number"
                value={targetAmt}
                onChange={(e) => setTargetAmt(e.target.value)}
                placeholder="150000"
                className="w-full bg-slate-850 border border-slate-700 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                required
                min="1"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Already Saved (Optional)</label>
              <input
                type="number"
                value={savedAmt}
                onChange={(e) => setSavedAmt(e.target.value)}
                placeholder="20000"
                className="w-full bg-slate-850 border border-slate-700 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                min="0"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Deadline Date</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-slate-850 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
          >
            <Sparkles className="w-4 h-4" /> Deploy Savings Goal
          </button>
        </form>
      )}

      {/* Active Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="goals-grid">
        {goals.length === 0 ? (
          <div className="md:col-span-2 text-center py-16 border border-dashed border-slate-800 rounded-2xl text-slate-400 bg-slate-900/10" id="goals-empty">
            <Target className="w-12 h-12 mx-auto text-slate-600 mb-2" />
            <h3 className="font-display font-medium text-slate-300">No active savings targets set</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
              Define target amounts for bikes, vacations, and emergency budgets, and monitor your deposit progress offline.
            </p>
          </div>
        ) : (
          goals.map((g) => {
            const pct = Math.min(100, Math.round((g.currentSaved / g.targetAmount) * 100));
            const daysLeft = getDaysRemaining(g.deadline);
            const isCompleted = pct >= 100;

            return (
              <div
                key={g.id}
                className={`bg-slate-900/30 border p-5 rounded-2xl flex flex-col backdrop-blur-xl shadow-md transition-all hover:translate-y-[-2px] ${
                  isCompleted ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-slate-200/10 dark:border-slate-800/50'
                }`}
                id={`goal-card-${g.id}`}
              >
                {/* Goal title header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="min-w-0">
                    <h3 className="font-display font-semibold text-base text-white truncate leading-tight flex items-center gap-1.5">
                      {g.name}
                      {isCompleted && <Award className="w-4.5 h-4.5 text-yellow-400 fill-yellow-400/20" />}
                    </h3>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" /> Deadline: {new Date(g.deadline).toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteGoal(g.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer shrink-0"
                    title="Delete goal tracker"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress bar info */}
                <div className="flex justify-between items-end text-xs mb-1.5">
                  <span className="text-slate-400 font-semibold">Saved Progress</span>
                  <span className="font-bold font-mono text-white">
                    {currency}{g.currentSaved.toLocaleString()} / <span className="text-slate-400">{currency}{g.targetAmount.toLocaleString()}</span>
                  </span>
                </div>

                {/* Real progress bar */}
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden mb-4 relative border border-slate-700/30">
                  <div
                    className={`h-full transition-all duration-1000 ease-out rounded-full ${
                      isCompleted ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center mt-auto text-xs">
                  <div>
                    {isCompleted ? (
                      <span className="text-emerald-400 font-bold font-display flex items-center gap-1 text-[11px]">
                        🏆 Target Achieved! Completed
                      </span>
                    ) : daysLeft > 0 ? (
                      <span className="text-slate-400 text-[11px] font-semibold">
                        ⏳ <span className="text-indigo-400 font-bold font-mono">{daysLeft}</span> days remaining
                      </span>
                    ) : (
                      <span className="text-rose-400 text-[11px] font-bold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Target date elapsed
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                    {pct}% Saved
                  </span>
                </div>

                {/* Deposit / Withdraw Action Drawer */}
                <div className="mt-4 pt-4 border-t border-slate-800/60 flex flex-col gap-2">
                  {activeDepositId === g.id ? (
                    <div className="space-y-2 animate-fade-in">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveDepositType('deposit')}
                          className={`flex-1 py-1 text-[10px] font-bold rounded cursor-pointer ${
                            activeDepositType === 'deposit' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          Deposit Cash
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveDepositType('withdraw')}
                          className={`flex-1 py-1 text-[10px] font-bold rounded cursor-pointer ${
                            activeDepositType === 'withdraw' ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          Withdraw Cash
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Amount"
                          value={depositValue}
                          onChange={(e) => setDepositValue(e.target.value)}
                          className="flex-1 bg-slate-850 border border-slate-700 rounded py-1 px-2.5 text-xs text-white focus:outline-none"
                          min="1"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateSavings(g.id)}
                          className="px-3 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveDepositId(null)}
                          className="px-2 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-bold rounded cursor-pointer"
                        >
                          X
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveDepositId(g.id);
                        setActiveDepositType('deposit');
                      }}
                      className="w-full text-center py-1.5 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700/40 text-[10px] text-slate-300 font-bold tracking-wide transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <RefreshCcw className="w-3 h-3" /> Deposit / Withdraw Funds
                    </button>
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
