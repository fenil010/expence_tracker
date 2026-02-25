import { useState, useEffect } from 'react';
import Toggle from './Toggle';

export default function ConfettiToggle() {
  const [confettiEnabled, setConfettiEnabled] = useState(() => {
    try {
      const stored = localStorage.getItem('confettiEnabled');
      return stored !== 'false'; // Default to true
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('confettiEnabled', confettiEnabled.toString());
    } catch (err) {
      console.warn('Failed to save confetti preference:', err);
    }
  }, [confettiEnabled]);

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-char dark:text-zinc-200">
          Celebration Effects
        </p>
        <p className="text-xs text-drift dark:text-zinc-500 mt-0.5">
          Show confetti when you stay under budget
        </p>
      </div>
      <Toggle 
        checked={confettiEnabled} 
        onChange={setConfettiEnabled}
        aria-label="Toggle celebration effects"
      />
    </div>
  );
}
