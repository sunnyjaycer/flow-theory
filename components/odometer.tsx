import { useState, useEffect } from 'react';
import { GradientText } from './gradient-text';
import { Decimal } from 'decimal.js';
import { RATE_MULTIPLE } from '../constants';

const UPDATE_PERIOD = 1000 * RATE_MULTIPLE;

export const Odometer = ({
  start,
  rate,
}: {
  start: number;
  rate: number; // Per second
}) => {
  const [currentValue, setCurrentValue] = useState(start);

  useEffect(() => {
    setCurrentValue(start);
    const interval = setInterval(() => {
      setCurrentValue((val) => val + rate);
    }, UPDATE_PERIOD);
    return () => clearInterval(interval);
  }, [start, rate]);

  return (
    <GradientText className="text-4xl font-extrabold mb-4">
      {currentValue.toFixed(7)}
    </GradientText>
  );
};
