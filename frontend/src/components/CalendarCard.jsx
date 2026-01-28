import { useState, useEffect } from 'react';

/**
 * CalendarCard Component
 * Displays current date and time with live updates.
 */
export default function CalendarCard() {
    const [now, setNow] = useState(new Date());

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setNow(new Date());
        }, 60000); // Update every minute

        return () => clearInterval(timer);
    }, []);

    const day = now.getDate();
    const month = now.toLocaleDateString('en-US', { month: 'long' });
    const time = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
    const weekday = now.toLocaleDateString('en-US', { weekday: 'long' });

    return (
        <div className="card h-full text-center flex flex-col justify-center">
            <p className="text-xs text-slate-400 uppercase tracking-wider">{weekday}</p>
            <h2 className="text-4xl font-semibold mt-1">{day}</h2>
            <p className="text-sm text-slate-500">{month}</p>
            <p className="text-xs text-slate-400 mt-2">{time}</p>
        </div>
    );
}
