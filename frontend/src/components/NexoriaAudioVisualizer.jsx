import React, { useEffect, useRef } from 'react';

const NexoriaAudioVisualizer = ({ audioRef, isPlaying }) => {
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    // Only initialize once and when audio element is ready
    if (!audioRef.current || audioContextRef.current) return;

    try {
      // Create audio context
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      
      // Create analyser
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 128; // Lower for fewer, thicker bars

      // Create source and connect
      // Note: connecting media element source multiple times throws an error, so we track it globally or ensure it's only done once.
      // In React StrictMode this can mount twice, so we wrap in try-catch
      sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
    } catch (err) {
      console.warn("AudioVisualizer: Web Audio API initialization failed or already connected.", err);
    }

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [audioRef]);

  useEffect(() => {
    if (!canvasRef.current || !analyserRef.current || !isPlaying) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    // Resume context if suspended (browser policy)
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;

      analyserRef.current.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, width, height);

      const barWidth = (width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height;
        
        // Gradient for bars
        const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.2)'); // Violet
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0.8)');
        
        ctx.fillStyle = gradient;
        
        // Draw with rounded top
        ctx.beginPath();
        ctx.roundRect(x, height - barHeight, barWidth, barHeight, [10, 10, 0, 0]);
        ctx.fill();

        x += barWidth + 2;
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying]);

  return (
    <canvas 
      ref={canvasRef} 
      width={1024} 
      height={256} 
      className="w-full h-24 sm:h-32 opacity-60 pointer-events-none"
    />
  );
};

export default NexoriaAudioVisualizer;
