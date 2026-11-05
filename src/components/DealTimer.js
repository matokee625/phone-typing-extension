'use client';

import { useState, useEffect } from 'react';

function getTimeRemaining(targetDate) {
  const total = targetDate - Date.now();
  if (total <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return { days, hours, minutes, seconds };
}

export default function DealTimer({ targetDate }) {
  const [target] = useState(() => {
    if (targetDate) return new Date(targetDate).getTime();
    // Default: 3 days from now
    return Date.now() + 3 * 24 * 60 * 60 * 1000;
  });

  const [time, setTime] = useState(getTimeRemaining(target));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeRemaining(target));
    }, 1000);

    return () => clearInterval(interval);
  }, [target]);

  const units = [
    { label: 'Days', value: time.days },
    { label: 'Hours', value: time.hours },
    { label: 'Minutes', value: time.minutes },
    { label: 'Seconds', value: time.seconds },
  ];

  return (
    <div className="flex items-center gap-3">
      {units.map((unit, idx) => (
        <div key={unit.label} className="flex items-center gap-3">
          <div className="flex flex-col items-center">
            <div className="bg-[#E31E24] text-white rounded-lg w-16 h-16 flex items-center justify-center shadow-md">
              <span className="text-2xl font-bold tabular-nums">
                {String(unit.value).padStart(2, '0')}
              </span>
            </div>
            <span className="text-xs text-gray-500 mt-1.5 font-medium">
              {unit.label}
            </span>
          </div>
          {idx < units.length - 1 && (
            <span className="text-2xl font-bold text-[#E31E24] -mt-5">:</span>
          )}
        </div>
      ))}
    </div>
  );
}
