import { useEffect, useRef, useState } from 'react';

export const useWebAudio = (audioRef, isYouTube) => {
  const [isReady, setIsReady] = useState(false);
  const graphRef = useRef({
    ctx: null,
    source: null,
    analyser: null,
    eq: {
      bass: null,
      mid: null,
      treble: null,
      convolver: null,
      reverbGain: null,
      dryGain: null
    }
  });

  useEffect(() => {
    // Detect mobile to prevent Web Audio API from breaking background playback
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isYouTube || !audioRef.current || graphRef.current.ctx || isMobile) return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      
      const source = ctx.createMediaElementSource(audioRef.current);
      
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;

      // EQ Nodes
      const bass = ctx.createBiquadFilter();
      bass.type = 'lowshelf';
      bass.frequency.value = 250;

      const mid = ctx.createBiquadFilter();
      mid.type = 'peaking';
      mid.frequency.value = 1000;
      mid.Q.value = 1;

      const treble = ctx.createBiquadFilter();
      treble.type = 'highshelf';
      treble.frequency.value = 4000;

      // Reverb Nodes
      const convolver = ctx.createConvolver();
      const length = ctx.sampleRate * 2.0;
      const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
      for (let i = 0; i < 2; i++) {
        const channelData = impulse.getChannelData(i);
        for (let j = 0; j < length; j++) {
          channelData[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / length, 3);
        }
      }
      convolver.buffer = impulse;

      const reverbGain = ctx.createGain();
      reverbGain.gain.value = 0;

      const dryGain = ctx.createGain();
      dryGain.gain.value = 1;

      // Routing Graph:
      // Source -> Bass -> Mid -> Treble -> Analyser -> [DryGain, Convolver]
      // Convolver -> ReverbGain -> Destination
      // DryGain -> Destination

      source.connect(bass);
      bass.connect(mid);
      mid.connect(treble);
      treble.connect(analyser);

      analyser.connect(dryGain);
      analyser.connect(convolver);
      
      convolver.connect(reverbGain);

      dryGain.connect(ctx.destination);
      reverbGain.connect(ctx.destination);

      graphRef.current = {
        ctx,
        source,
        analyser,
        eq: { bass, mid, treble, convolver, reverbGain, dryGain }
      };

      setIsReady(true);
    } catch (err) {
      console.error('Web Audio API Initialization Failed:', err);
    }

  }, [audioRef, isYouTube]);

  const updateEq = (vals) => {
    if (!graphRef.current.ctx) return;
    const { bass, mid, treble, reverbGain, dryGain } = graphRef.current.eq;
    
    if (bass) bass.gain.value = vals.bass;
    if (mid) mid.gain.value = vals.mid;
    if (treble) treble.gain.value = vals.treble;
    
    if (reverbGain && dryGain) {
      reverbGain.gain.value = vals.reverb;
      dryGain.gain.value = 1 - (vals.reverb * 0.5);
    }
  };

  const getAnalyser = () => graphRef.current.analyser;
  const resumeContext = () => {
    if (graphRef.current.ctx?.state === 'suspended') {
      graphRef.current.ctx.resume();
    }
  };

  return { isReady, updateEq, getAnalyser, resumeContext };
};
