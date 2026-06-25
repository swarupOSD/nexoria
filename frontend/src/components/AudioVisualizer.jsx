import React, { useEffect, useRef } from 'react';

const AudioVisualizer = ({ isPlaying, isYouTube, getAnalyser }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const dataArrayRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // CSS Fallback animation (for YouTube or when Web Audio API fails)
    let time = 0;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      
      ctx.clearRect(0, 0, width, height);
      
      const analyser = getAnalyser ? getAnalyser() : null;
      const numBars = isYouTube ? 12 : (analyser ? analyser.frequencyBinCount : 12);
      const barWidth = (width / numBars) - 2;
      
      if (!isYouTube && analyser) {
        if (!dataArrayRef.current) {
          dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
        }
        analyser.getByteFrequencyData(dataArrayRef.current);
      }

      for (let i = 0; i < numBars; i++) {
        let barHeight = 2; // min height
        
        if (isPlaying) {
          if (!isYouTube && analyser && dataArrayRef.current) {
            // Native Audio Data
            const percent = dataArrayRef.current[i] / 255;
            barHeight = Math.max(2, height * percent * 0.8);
          } else {
            // CSS Fallback Animation for YouTube
            const sinValue = Math.sin(time + (i * 0.5));
            const noise = Math.random() * 0.2;
            const normalized = (sinValue + 1) / 2; // 0 to 1
            barHeight = Math.max(2, height * (normalized + noise) * 0.8);
          }
        }

        const x = i * (barWidth + 2);
        const y = height - barHeight;

        // Gradient
        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, '#a855f7'); // purple-500
        gradient.addColorStop(1, '#6366f1'); // indigo-500

        ctx.fillStyle = gradient;
        
        // Rounded bars
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 4);
        ctx.fill();
      }

      time += 0.1;
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, isYouTube]);



  return (
    <canvas 
      ref={canvasRef} 
      width={100} 
      height={30} 
      className="opacity-70 pointer-events-none"
    />
  );
};

export default AudioVisualizer;
