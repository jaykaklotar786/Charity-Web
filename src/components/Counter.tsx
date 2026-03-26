'use client';

import { useEffect, useRef, useState } from 'react';

interface CounterProps {
  target: number;
  duration?: number;
  format?: 'number' | 'million';
  plus?: boolean;
}

export default function Counter({
  target,
  duration = 2000,
  format = 'number',
  plus = false,
}: CounterProps) {
  const [count, setCount] = useState(0);
  const [startCounter, setStartCounter] = useState(false);
  const counterRef = useRef<HTMLSpanElement>(null);

  // detect when counter comes into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStartCounter(true);
        }
      },
      { threshold: 0.5 },
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => {
      if (counterRef.current) {
        observer.unobserve(counterRef.current);
      }
    };
  }, []);

  //  counter logic
  useEffect(() => {
    if (!startCounter) return;

    let start = 0;
    const increment = target / (duration / 16);

    const counter = setInterval(() => {
      start += increment;

      if (start >= target) {
        setCount(target);
        clearInterval(counter);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(counter);
  }, [startCounter, target, duration]);

  const formatNumber = () => {
    if (format === 'million') {
      return (
        (count / 1000000).toFixed(1).replace('.0', '') + 'M' + (plus ? '+' : '')
      );
    }

    return count.toLocaleString();
  };

  return <span ref={counterRef}>{formatNumber()}</span>;
}
