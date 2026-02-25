import { useEffect } from 'react';
import confetti from 'canvas-confetti';

// Trigger confetti animation with theme colors
export function triggerConfetti() {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    return;
  }

  // Check if confetti library is available
  if (typeof confetti !== 'function') {
    console.warn('Confetti library not available');
    return;
  }

  try {
    // Get accent colors from CSS custom properties
    const root = document.documentElement;
    const accentColor = getComputedStyle(root).getPropertyValue('--color-accent').trim();
    const accentSecondary = getComputedStyle(root).getPropertyValue('--color-accent-secondary').trim();
    
    const colors = [accentColor, accentSecondary].filter(Boolean);
    if (colors.length === 0) {
      colors.push('#1A1714', '#3D3830'); // Fallback colors
    }

    // Adjust particle count based on screen width
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 50 : 100;

    // Center burst
    confetti({
      particleCount,
      spread: 70,
      origin: { y: 0.6 },
      colors,
      ticks: 200,
      gravity: 1,
      decay: 0.94,
      startVelocity: 30,
      scalar: 1.2,
    });

    // Left burst
    setTimeout(() => {
      confetti({
        particleCount: Math.floor(particleCount / 2),
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors,
        ticks: 200,
        gravity: 1,
        decay: 0.94,
        startVelocity: 30,
      });
    }, 250);

    // Right burst
    setTimeout(() => {
      confetti({
        particleCount: Math.floor(particleCount / 2),
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors,
        ticks: 200,
        gravity: 1,
        decay: 0.94,
        startVelocity: 30,
      });
    }, 400);
  } catch (error) {
    console.error('Failed to trigger confetti:', error);
  }
}

export default function ConfettiTrigger({ budgets = [], enabled = true }) {
  useEffect(() => {
    if (!enabled || !budgets || budgets.length === 0) {
      return;
    }

    // Find budgets that are complete and under budget
    const successfulBudgets = budgets.filter(budget => {
      const isComplete = new Date(budget.endDate) < new Date();
      const isUnderBudget = budget.spent < budget.amount;
      return isComplete && isUnderBudget;
    });

    if (successfulBudgets.length === 0) {
      return;
    }

    // Check if we've already shown confetti for these budgets this session
    const budgetIds = successfulBudgets.map(b => b._id).sort().join('_');
    const shownKey = `confetti_shown_${budgetIds}`;
    
    try {
      const alreadyShown = sessionStorage.getItem(shownKey);
      
      if (!alreadyShown) {
        triggerConfetti();
        sessionStorage.setItem(shownKey, 'true');
      }
    } catch (err) {
      console.warn('Failed to access sessionStorage:', err);
      // Still trigger confetti even if sessionStorage fails
      triggerConfetti();
    }
  }, [budgets, enabled]);

  return null; // This component doesn't render anything
}
