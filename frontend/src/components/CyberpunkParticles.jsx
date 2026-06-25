import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const CyberpunkParticles = () => {
  const { isCyberpunk } = useTheme();
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!isCyberpunk) return;

    // Create 30 random particles
    const newParticles = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: 5 + Math.random() * 10,
      animationDelay: Math.random() * 5,
      size: 2 + Math.random() * 4,
      color: Math.random() > 0.5 ? '#FF00FF' : '#00FFFF', // Magenta or Cyan
    }));

    setParticles(newParticles);
  }, [isCyberpunk]);

  if (!isCyberpunk) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full opacity-60"
          style={{
            left: `${p.left}%`,
            top: '-5%',
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            animation: `fall ${p.animationDuration}s linear infinite`,
            animationDelay: `${p.animationDelay}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(110vh) scale(0.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default CyberpunkParticles;
