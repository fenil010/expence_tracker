import { useState } from 'react';
import { CATEGORIES, generateId } from '../data/schema';

export default function AddExpenseModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    type: 'expense',
    category: 'Food',
    amount: '',
    description: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    if (amount > 0 && formData.description.trim()) {
      onAdd({
        id: generateId(),
        type: formData.type,
        category: formData.category,
        amount,
        description: formData.description.trim(),
        date: new Date().toISOString(),
      });

      // Reset form
      setFormData({
        type: 'expense',
        category: 'Food',
        amount: '',
        description: '',
      });
      onClose();
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      
      // Auto-select first category when type changes
      if (field === 'type') {
        updated.category = CATEGORIES[value][0];
      }
      
      return updated;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in-95 duration-200 border border-neutral-100/50">
        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <h2 className="text-2xl font-bold text-neutral-900">
            Add Transaction
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
          >
            <span className="text-neutral-600 font-bold">✕</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type Toggle */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-3 uppercase tracking-wide">
              Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleChange('type', 'expense')}
                className={`py-3 px-4 rounded-xl font-bold transition-all duration-300 ${
                  formData.type === 'expense'
                    ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg scale-105'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => handleChange('type', 'income')}
                className={`py-3 px-4 rounded-xl font-bold transition-all duration-300 ${
                  formData.type === 'income'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg scale-105'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                Income
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-2 uppercase tracking-wide">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-bold text-lg">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                className="w-full px-4 pl-8 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl text-lg font-bold text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-2 uppercase tracking-wide">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-medium text-neutral-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
            >
              {CATEGORIES[formData.type].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-2 uppercase tracking-wide">
              Description
            </label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl font-medium text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
              placeholder="What was this for?"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-neutral-100 text-neutral-700 font-bold rounded-xl hover:bg-neutral-200 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 active:scale-95"
            >
              Add Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
