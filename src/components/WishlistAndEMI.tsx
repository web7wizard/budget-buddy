import React, { useState } from 'react';
import { WishlistItem, EMITracker, Currency, PaymentMethod } from '../types';
import { 
  Heart, 
  Plus, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  CreditCard, 
  PiggyBank, 
  Bookmark,
  ShoppingBag
} from 'lucide-react';

interface WishlistAndEMIProps {
  wishlist: WishlistItem[];
  onUpdateWishlist: (list: WishlistItem[]) => void;
  emis: EMITracker[];
  onUpdateEMIs: (list: EMITracker[]) => void;
  onAddTransaction: (title: string, amount: number, type: 'expense' | 'income', category: string, notes: string) => void;
  currency: Currency;
  onShowToast: (text: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

export const WishlistAndEMI: React.FC<WishlistAndEMIProps> = ({
  wishlist,
  onUpdateWishlist,
  emis,
  onUpdateEMIs,
  onAddTransaction,
  currency,
  onShowToast
}) => {
  // Wishlist Form states
  const [newProduct, setNewProduct] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newPriority, setNewPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');

  // EMI Form states
  const [newEmiName, setNewEmiName] = useState('');
  const [newEmiAmount, setNewEmiAmount] = useState('');
  const [newEmiDueDate, setNewEmiDueDate] = useState('05');
  const [newEmiMonths, setNewEmiMonths] = useState('12');

  const [isAddingWish, setIsAddingWish] = useState(false);
  const [isAddingEMI, setIsAddingEMI] = useState(false);

  // Wishlist Handlers
  const handleAddWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.trim() || !newPrice) {
      onShowToast('Please fill out all product details.', 'error');
      return;
    }
    const item: WishlistItem = {
      id: `wish-${Date.now()}`,
      product: newProduct.trim(),
      price: parseFloat(newPrice),
      priority: newPriority,
      purchased: false
    };
    const updated = [item, ...wishlist];
    onUpdateWishlist(updated);
    onShowToast(`"${item.product}" added to wishlist!`, 'success');
    setNewProduct('');
    setNewPrice('');
    setNewPriority('Medium');
    setIsAddingWish(false);
  };

  const handleToggleWish = (id: string) => {
    const updated = wishlist.map(item => {
      if (item.id === id) {
        const nextState = !item.purchased;
        if (nextState) {
          // Auto add a transaction if product purchased!
          onAddTransaction(
            `Wishlist Purchase: ${item.product}`,
            item.price,
            'expense',
            'Shopping',
            'Purchased item from wishlist tracker'
          );
          onShowToast(`Purchased "${item.product}"! Transaction logged under Shopping.`, 'success');
        }
        return { ...item, purchased: nextState };
      }
      return item;
    });
    onUpdateWishlist(updated);
  };

  const handleDeleteWish = (id: string) => {
    const item = wishlist.find(i => i.id === id);
    const updated = wishlist.filter(item => item.id !== id);
    onUpdateWishlist(updated);
    if (item) onShowToast(`Removed "${item.product}" from wishlist.`, 'info');
  };

  // EMI Handlers
  const handleAddEMI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmiName.trim() || !newEmiAmount || !newEmiDueDate || !newEmiMonths) {
      onShowToast('Please provide all EMI conditions.', 'error');
      return;
    }
    const item: EMITracker = {
      id: `emi-${Date.now()}`,
      name: newEmiName.trim(),
      amount: parseFloat(newEmiAmount),
      dueDate: newEmiDueDate.padStart(2, '0'),
      remainingMonths: parseInt(newEmiMonths),
      isPaidThisMonth: false
    };
    const updated = [...emis, item];
    onUpdateEMIs(updated);
    onShowToast(`EMI for "${item.name}" registered successfully!`, 'success');
    setNewEmiName('');
    setNewEmiAmount('');
    setNewEmiDueDate('05');
    setNewEmiMonths('12');
    setIsAddingEMI(false);
  };

  const handlePayEMI = (id: string) => {
    const updated = emis.map(item => {
      if (item.id === id) {
        if (item.isPaidThisMonth) {
          onShowToast('EMI already paid this month.', 'info');
          return item;
        }
        
        // Add transaction
        onAddTransaction(
          `EMI Installment: ${item.name}`,
          item.amount,
          'expense',
          'Bills',
          `EMI payment. ${item.remainingMonths - 1} installments remaining.`
        );

        const remaining = item.remainingMonths - 1;
        onShowToast(`Paid EMI for "${item.name}"! Transaction logged under Bills.`, 'success');
        
        return {
          ...item,
          isPaidThisMonth: true,
          remainingMonths: remaining
        };
      }
      return item;
    }).filter(item => item.remainingMonths > 0); // Remove completed EMIs automatically

    onUpdateEMIs(updated);
  };

  const handleDeleteEMI = (id: string) => {
    const item = emis.find(e => e.id === id);
    const updated = emis.filter(item => item.id !== id);
    onUpdateEMIs(updated);
    if (item) onShowToast(`Cancelled EMI tracker for "${item.name}".`, 'info');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="wishlist-emi-wrapper">
      
      {/* 1. Wishlist Section */}
      <div className="bg-slate-900/30 border border-slate-200/10 dark:border-slate-800/50 p-6 rounded-2xl flex flex-col backdrop-blur-xl shadow-lg" id="wishlist-section">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500/10" />
            <h2 className="font-display font-semibold text-lg text-white">Savings Wishlist</h2>
          </div>
          <button 
            onClick={() => setIsAddingWish(!isAddingWish)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
            id="btn-add-wish"
          >
            {isAddingWish ? 'Cancel' : <><Plus className="w-3.5 h-3.5" /> Add Item</>}
          </button>
        </div>

        {/* Add Wish Form */}
        {isAddingWish && (
          <form onSubmit={handleAddWish} className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl mb-6 space-y-4 animate-fade-in" id="wish-form">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Product / Slogan</label>
                <input 
                  type="text" 
                  value={newProduct}
                  onChange={(e) => setNewProduct(e.target.value)}
                  placeholder="e.g. Sony Wireless Headphones"
                  className="w-full bg-slate-800 border border-slate-700/60 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Target Price</label>
                <input 
                  type="number" 
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="24999"
                  className="w-full bg-slate-800 border border-slate-700/60 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-rose-500"
                  required
                  min="1"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Priority</label>
                <select 
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700/60 rounded-lg py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-rose-500"
                >
                  <option value="High">🔴 High Priority</option>
                  <option value="Medium">🟡 Medium Priority</option>
                  <option value="Low">🟢 Low Priority</option>
                </select>
              </div>
            </div>
            <button 
              type="submit"
              className="w-full bg-rose-500 hover:bg-rose-600 text-white font-medium text-xs py-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Save Wishlist Product
            </button>
          </form>
        )}

        {/* Wishlist Items List */}
        <div className="space-y-3 flex-1 overflow-y-auto max-h-[400px] pr-1" id="wishlist-items-container">
          {wishlist.length === 0 ? (
            <div className="text-center py-12 text-slate-400 border border-dashed border-slate-800 rounded-xl" id="wish-empty">
              <ShoppingBag className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="text-sm">Wishlist is empty.</p>
              <p className="text-[11px] text-slate-500 mt-1">Add items you intend to buy and track purchase logs offline.</p>
            </div>
          ) : (
            wishlist.map((item) => (
              <div 
                key={item.id}
                className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all hover:bg-slate-900/40 ${
                  item.purchased 
                    ? 'border-emerald-500/20 bg-emerald-500/5 opacity-70' 
                    : 'border-slate-800 bg-slate-900/10'
                }`}
                id={`wish-item-${item.id}`}
              >
                <div className="flex items-start gap-3">
                  <button 
                    onClick={() => handleToggleWish(item.id)}
                    className="mt-0.5 text-slate-500 hover:text-emerald-400 transition-colors cursor-pointer"
                    title={item.purchased ? 'Mark as Unpurchased' : 'Mark as Purchased'}
                  >
                    {item.purchased ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-500/10" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-slate-600 hover:border-emerald-500 transition-all"></div>
                    )}
                  </button>
                  <div>
                    <h3 className={`text-sm font-medium font-display leading-tight ${item.purchased ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                      {item.product}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-xs font-bold font-mono text-rose-400">
                        {currency}{item.price.toLocaleString()}
                      </span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold border border-slate-800 bg-slate-900 text-slate-400">
                        {item.priority} Priority
                      </span>
                      {item.purchased && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                          Purchased
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleDeleteWish(item.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-all cursor-pointer"
                  title="Delete product"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 2. EMI Tracker Section */}
      <div className="bg-slate-900/30 border border-slate-200/10 dark:border-slate-800/50 p-6 rounded-2xl flex flex-col backdrop-blur-xl shadow-lg" id="emi-section">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-500" />
            <h2 className="font-display font-semibold text-lg text-white">EMI Tracker</h2>
          </div>
          <button 
            onClick={() => setIsAddingEMI(!isAddingEMI)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-all cursor-pointer"
            id="btn-add-emi"
          >
            {isAddingEMI ? 'Cancel' : <><Plus className="w-3.5 h-3.5" /> Register EMI</>}
          </button>
        </div>

        {/* Add EMI Form */}
        {isAddingEMI && (
          <form onSubmit={handleAddEMI} className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl mb-6 space-y-4 animate-fade-in" id="emi-form">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">EMI Name / Loan</label>
                <input 
                  type="text" 
                  value={newEmiName}
                  onChange={(e) => setNewEmiName(e.target.value)}
                  placeholder="e.g. Car Loan or Apple Keyboard"
                  className="w-full bg-slate-800 border border-slate-700/60 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Monthly Installment</label>
                <input 
                  type="number" 
                  value={newEmiAmount}
                  onChange={(e) => setNewEmiAmount(e.target.value)}
                  placeholder="8500"
                  className="w-full bg-slate-800 border border-slate-700/60 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                  min="1"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Due Date (Day of Month)</label>
                <input 
                  type="number" 
                  value={newEmiDueDate}
                  onChange={(e) => setNewEmiDueDate(e.target.value)}
                  placeholder="05"
                  className="w-full bg-slate-800 border border-slate-700/60 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                  min="1"
                  max="31"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Remaining Installments (Months)</label>
                <input 
                  type="number" 
                  value={newEmiMonths}
                  onChange={(e) => setNewEmiMonths(e.target.value)}
                  placeholder="12"
                  className="w-full bg-slate-800 border border-slate-700/60 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                  min="1"
                />
              </div>
            </div>
            <button 
              type="submit"
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium text-xs py-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Save EMI Schedule
            </button>
          </form>
        )}

        {/* EMI Schedule Items List */}
        <div className="space-y-3 flex-1 overflow-y-auto max-h-[400px] pr-1" id="emi-items-container">
          {emis.length === 0 ? (
            <div className="text-center py-12 text-slate-400 border border-dashed border-slate-800 rounded-xl" id="emi-empty">
              <Clock className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="text-sm">No active EMI schedules registered.</p>
              <p className="text-[11px] text-slate-500 mt-1">Register loans/installments to track monthly bills easily.</p>
            </div>
          ) : (
            emis.map((item) => (
              <div 
                key={item.id}
                className="p-4 rounded-xl border border-slate-800 bg-slate-900/10 flex flex-col gap-3 transition-all hover:bg-slate-900/40"
                id={`emi-item-${item.id}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100 font-display leading-tight">{item.name}</h3>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3 text-indigo-400" /> Due on {item.dueDate}th of every month
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.isPaidThisMonth ? (
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 flex items-center gap-1">
                        ● Paid
                      </span>
                    ) : (
                      <button 
                        onClick={() => handlePayEMI(item.id)}
                        className="px-2.5 py-1 text-[10px] font-bold rounded-md bg-indigo-500 text-white hover:bg-indigo-600 transition-all cursor-pointer"
                      >
                        Mark as Paid
                      </button>
                    )}

                    <button 
                      onClick={() => handleDeleteEMI(item.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 rounded-md transition-colors cursor-pointer"
                      title="Remove schedule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2.5 border-t border-slate-800 text-xs font-medium">
                  <div>
                    <span className="text-slate-400 mr-1">Installment:</span>
                    <span className="font-bold text-white font-mono">{currency}{item.amount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 mr-1">Months Remaining:</span>
                    <span className="px-2 py-0.5 rounded-md font-bold font-mono bg-slate-800/80 text-indigo-400 border border-slate-700/50">
                      {item.remainingMonths} mo
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
