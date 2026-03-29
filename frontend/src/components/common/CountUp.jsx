import React, { useEffect, useState, useRef } from 'react';

function CountUp({ value, duration = 2000 }) {
  const [displayValue, setDisplayValue] = useState(0);
  const startRef = useRef(value);
  const startTimeRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    startRef.current = 0;
    const end = value;

    const animate = (currentTime) => {
      if (!startTimeRef.current) startTimeRef.current = currentTime;
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (easeOutQuart)
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(startRef.current + (end - startRef.current) * easeOut);

      setDisplayValue(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(end);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  return <>{displayValue.toLocaleString()}</>;
}

export default CountUp;
