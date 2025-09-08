'use client';
import { useEffect, useState } from 'react';

export default function Countdown({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState(targetDate.getTime() - Date.now());
  
  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(targetDate.getTime() - Date.now()), 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const d = Math.max(0, timeLeft);
  const days = Math.floor(d / 86400000);
  const hours = Math.floor((d % 86400000) / 3600000);
  const mins = Math.floor((d % 3600000) / 60000);
  const secs = Math.floor((d % 60000) / 1000);

  const timeUnits = [
    { value: days, label: 'Jours' },
    { value: hours, label: 'Heures' },
    { value: mins, label: 'Minutes' },
    { value: secs, label: 'Secondes' }
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4 md:gap-8">
      {timeUnits.map((unit, index) => (
        <div key={index} className="flex flex-col items-center">
          <div className="bg-white/90 backdrop-blur-sm border-2 border-gray-200/50 rounded-2xl p-4 md:p-6 shadow-lg min-w-[80px] md:min-w-[100px]">
            <div className="text-3xl md:text-4xl font-black gradient-text font-mono">
              {unit.value.toString().padStart(2, '0')}
            </div>
          </div>
          <div className="text-sm md:text-base font-semibold text-gray-600 mt-2">
            {unit.label}
          </div>
        </div>
      ))}
    </div>
  );
}
