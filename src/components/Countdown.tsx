import React, { useState, useEffect } from 'react';

interface CountdownProps { targetDate: string; }
interface TimeLeft { days: number; hours: number; minutes: number; seconds: number; }

export const Countdown: React.FC<CountdownProps> = ({ targetDate }) => {
  const calc = (): TimeLeft => {
    const diff = +new Date(targetDate) - +new Date();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / 1000 / 60) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  };

  const [t, setT] = useState<TimeLeft>(calc());

  useEffect(() => {
    const timer = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const units = [
    { label: 'Days', value: t.days },
    { label: 'Hours', value: t.hours },
    { label: 'Minutes', value: t.minutes },
    { label: 'Seconds', value: t.seconds },
  ];

  return (
    <div className="countdown">
      {units.map((u) => (
        <div key={u.label} className="countdown-unit">
          <div className="countdown-value">{String(u.value).padStart(2, '0')}</div>
          <div className="countdown-label">{u.label}</div>
        </div>
      ))}
    </div>
  );
};
