// src/components/Timer.tsx
import React, { useState, useEffect } from 'react';

interface TimerProps {
  initialTime: number;
  onTimerEnd: () => void;
}

const Timer: React.FC<TimerProps> = ({ initialTime, onTimerEnd }) => {
  const [time, setTime] = useState(initialTime);

  useEffect(() => {
    if (time > 0) {
      const timer = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else {
      onTimerEnd();
    }
  }, [time, onTimerEnd]);

  return <div className="text-4xl font-bold text-black">{time}</div>;
};

export default Timer;