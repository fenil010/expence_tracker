import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button, Input, Select } from '../ui';

const steps = [
  { id: 1, title: 'Category', description: 'Choose a category' },
  { id: 2, title: 'Amount', description: 'Set your budget limit' },
  { id: 3, title: 'Period', description: 'Select time period' },
];

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

export default function MultiStepBudgetForm({ 
  categories, 
  form, 
  setForm, 
  onSubmit, 
  saving 
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(0);

  const nextStep = () => {
    if (currentStep < steps.length) {
      setDirection(1);
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return form.category !== '';
      case 2:
        return form.amount !== '' && parseFloat(form.amount) > 0;
      case 3:
        return form.period !== '';
      default:
        return false;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentStep === steps.length && canProceed()) {
      onSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <motion.div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                  transition-colors duration-300
                  ${currentStep > step.id 
                    ? 'bg-emerald-600/60 text-white' 
                    : currentStep === step.id
                    ? 'bg-obsidian dark:bg-zinc-700 text-linen dark:text-white'
                    : 'bg-sand dark:bg-zinc-800 text-drift dark:text-zinc-500'
                  }
                `}
                animate={{
                  scale: currentStep === step.id ? 1.1 : 1,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {currentStep > step.id ? (
                  <Check className="w-5 h-5" />
                ) : (
                  step.id
                )}
              </motion.div>
              <span className={`
                text-xs mt-2 font-medium transition-colors duration-300
                ${currentStep >= step.id 
                  ? 'text-obsidian dark:text-white' 
                  : 'text-drift dark:text-zinc-500'
                }
              `}>
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-2 -mt-6">
                <motion.div
                  className="h-full bg-sand dark:bg-zinc-800 rounded-full overflow-hidden"
                >
                  <motion.div
                    className="h-full bg-emerald-600/60"
                    initial={{ width: '0%' }}
                    animate={{ 
                      width: currentStep > step.id ? '100%' : '0%' 
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="relative min-h-[200px]">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="absolute inset-0"
          >
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-obsidian dark:text-white mb-2">
                    {steps[0].title}
                  </h3>
                  <p className="text-sm text-drift dark:text-zinc-400">
                    {steps[0].description}
                  </p>
                </div>
                <Select
                  label="Category"
                  placeholder="Select category"
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  options={categories.map((c) => ({ 
                    value: c._id || c.name, 
                    label: c.name 
                  }))}
                  autoFocus
                />
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-obsidian dark:text-white mb-2">
                    {steps[1].title}
                  </h3>
                  <p className="text-sm text-drift dark:text-zinc-400">
                    {steps[1].description}
                  </p>
                </div>
                <Input
                  label="Budget Amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                  autoFocus
                />
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-obsidian dark:text-white mb-2">
                    {steps[2].title}
                  </h3>
                  <p className="text-sm text-drift dark:text-zinc-400">
                    {steps[2].description}
                  </p>
                </div>
                <Select
                  label="Period"
                  value={form.period}
                  onChange={(e) => setForm((p) => ({ ...p, period: e.target.value }))}
                  options={[
                    { value: 'weekly', label: 'Weekly' },
                    { value: 'monthly', label: 'Monthly' },
                    { value: 'yearly', label: 'Yearly' },
                  ]}
                  autoFocus
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between gap-3 pt-4">
        <Button
          variant="ghost"
          type="button"
          onClick={prevStep}
          disabled={currentStep === 1}
          icon={ChevronLeft}
        >
          Back
        </Button>
        
        {currentStep < steps.length ? (
          <Button
            type="button"
            onClick={nextStep}
            disabled={!canProceed()}
            icon={ChevronRight}
            iconPosition="right"
          >
            Next
          </Button>
        ) : (
          <Button
            type="submit"
            loading={saving}
            disabled={!canProceed()}
          >
            Create Budget
          </Button>
        )}
      </div>
    </form>
  );
}
