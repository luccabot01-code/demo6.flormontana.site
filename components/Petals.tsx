import React, { useEffect, useRef } from 'react';

const Petals: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const createPetal = () => {
      const petal = document.createElement('div');
      petal.className = 'absolute opacity-60 rounded-full pointer-events-none';

      // Randomize styles
      const size = Math.random() * 10 + 5;
      const startLeft = Math.random() * 100;
      const duration = Math.random() * 5 + 5;
      const rotation = Math.random() * 360;

      petal.style.width = `${size}px`;
      petal.style.height = `${size}px`;
      petal.style.background = Math.random() > 0.5 ? 'var(--color-primary-300)' : 'var(--color-primary-100)'; // Dynamic theme colors
      petal.style.left = `${startLeft}%`;
      petal.style.top = '-20px';
      petal.style.transform = `rotate(${rotation}deg)`;
      petal.style.transition = `top ${duration}s linear, transform ${duration}s ease-in-out`;

      container.appendChild(petal);

      // Animate
      requestAnimationFrame(() => {
        petal.style.top = '110vh';
        petal.style.transform = `rotate(${rotation + 360}deg) translateX(${Math.random() * 50 - 25}px)`;
      });

      // Cleanup
      setTimeout(() => {
        if (container.contains(petal)) {
          container.removeChild(petal);
        }
      }, duration * 1000);
    };

    const interval = setInterval(createPetal, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0 overflow-hidden" />
  );
};

export default Petals;