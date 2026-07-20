import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';

const DEFAULT_CODE = ['n', 'e', 'x', 'o', 'r', 'i', 'a'];

const useKonamiCode = (secretCode = DEFAULT_CODE) => {
  const [inputSequence, setInputSequence] = useState([]);

  const triggerEasterEgg = () => {
    toast.success('HACKER MODE ACTIVATED! 🎆', { icon: '😎' });
    
    const duration = 5000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#00FFFF', '#FF00FF', '#7B2FF7']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#00FFFF', '#FF00FF', '#7B2FF7']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      
      setInputSequence((prev) => {
        const newSequence = [...prev, key];
        if (newSequence.length > secretCode.length) {
          newSequence.shift();
        }
        
        // Check if the current sequence matches the secret code
        if (newSequence.join('') === secretCode.join('')) {
          triggerEasterEgg();
          return []; // Reset after trigger
        }
        
        return newSequence;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [JSON.stringify(secretCode)]);
};

export default useKonamiCode;
