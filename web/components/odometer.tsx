import { useState, useEffect } from 'react';
import { GradientText } from './gradient-text';
import { Decimal } from 'decimal.js';

const UPDATE_PERIOD = 1000;

export const Odometer = ({
  start,
  rate,
}: {
  start: number;
  rate: number; // Per second
}) => {
  const [currentValue, setCurrentValue] = useState(new Decimal(start));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentValue((val) => val.add(rate));
    }, UPDATE_PERIOD);

    return () => clearInterval(interval);
  }, [start, rate]);

  return (
    <GradientText className="text-8xl font-extrabold mb-4">
      {currentValue.toFixed(2)}
    </GradientText>
  );
};
