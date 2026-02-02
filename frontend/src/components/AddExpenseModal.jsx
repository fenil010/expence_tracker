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
      <div className="relative bg-white rounded-3xl shadow-xl max-w-md w-full p-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-neutral-900">
            Add Transaction
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors"
          >
            <span className="text-neutral-600">✕</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type Toggle */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleChange('type', 'expense')}
                className={`py-3 px-4 rounded-xl font-medium transition-all ${
                  formData.type === 'expense'
                    ? 'bg-rose-500 text-white shadow-soft'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => handleChange('type', 'income')}
                className={`py-3 px-4 rounded-xl font-medium transition-all ${
                  formData.type === 'income'
                    ? 'bg-emerald-500 text-white shadow-soft'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                Income
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                className="input-field pl-8 text-lg font-semibold"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="input-field"
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
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Description
            </label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="input-field"
              placeholder="What was this for?"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
            >
              Add Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
