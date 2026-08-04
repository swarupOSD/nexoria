class SoundManager {
  constructor() {
    this.sounds = {};
    this.enabled = true;
    this.volume = 0.5;
    this.loaded = false;
    this.loadingPromises = [];
  }

  /**
   * Initialize all sounds
   */
  async initialize() {
    if (this.loaded) return;

    const soundFiles = {
      diceRoll: '/sounds/dice-roll.mp3',
      diceRoll6: '/sounds/dice-roll-6.mp3',
      tokenMove: '/sounds/token-move.mp3',
      tokenKill: '/sounds/token-kill.mp3',
      tokenHome: '/sounds/token-home.mp3',
      win: '/sounds/win.mp3',
      lose: '/sounds/lose.mp3',
      turnChange: '/sounds/turn-change.mp3',
      gameStart: '/sounds/game-start.mp3',
      error: '/sounds/error.mp3',
      threeSixes: '/sounds/three-sixes.mp3',
      noMove: '/sounds/no-move.mp3'
    };

    // Create audio elements
    for (const [key, url] of Object.entries(soundFiles)) {
      const audio = new Audio(url);
      audio.preload = 'auto';
      
      // Store with loading promise
      this.loadingPromises.push(
        new Promise((resolve) => {
          audio.addEventListener('canplaythrough', () => {
            this.sounds[key] = audio;
            resolve();
          });
          audio.addEventListener('error', () => {
            console.warn(`Failed to load sound: ${url}`);
            // Create fallback silent audio
            this.sounds[key] = this.createFallbackSound();
            resolve();
          });
          // Start loading
          audio.load();
        })
      );
    }

    await Promise.all(this.loadingPromises);
    this.loaded = true;
  }

  /**
   * Create fallback sound when file fails to load
   */
  createFallbackSound() {
    const audio = new Audio();
    // Use Web Audio API for fallback beep
    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      audio._context = context;
      audio._beep = (frequency = 440, duration = 100) => {
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.1, context.currentTime);
        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + duration / 1000);
      };
    } catch (e) {
      // If Web Audio API is not available, return silent audio
    }
    return audio;
  }

  /**
   * Play a sound with optional delay and volume
   */
  play(soundKey, options = {}) {
    if (!this.enabled) return;

    const {
      delay = 0,
      volume = this.volume,
      loop = false
    } = options;

    const sound = this.sounds[soundKey];
    if (!sound) {
      console.warn(`Sound not found: ${soundKey}`);
      return;
    }

    // If fallback beep sound
    if (sound._beep) {
      setTimeout(() => {
        const frequencies = {
          diceRoll: 440,
          diceRoll6: 523,
          tokenMove: 330,
          tokenKill: 200,
          tokenHome: 660,
          win: 880,
          lose: 220,
          turnChange: 440,
          gameStart: 523,
          error: 150,
          threeSixes: 150,
          noMove: 300
        };
        const freq = frequencies[soundKey] || 440;
        sound._beep(freq, 100);
      }, delay);
      return;
    }

    // Standard audio playback
    setTimeout(() => {
      try {
        const clone = sound.cloneNode();
        clone.volume = Math.min(volume, 1);
        clone.loop = loop;
        clone.play().catch(e => {
          console.warn(`Failed to play sound ${soundKey}:`, e);
        });
      } catch (e) {
        console.warn(`Error playing sound ${soundKey}:`, e);
      }
    }, delay);
  }

  /**
   * Play sound with easing (volume fade in/out)
   */
  playWithEasing(soundKey, duration = 500) {
    if (!this.enabled) return;

    const sound = this.sounds[soundKey];
    if (!sound) return;

    try {
      const clone = sound.cloneNode();
      clone.volume = 0;
      clone.play();
      
      // Fade in
      const steps = 20;
      const stepDuration = duration / steps;
      let currentStep = 0;
      
      const fadeInterval = setInterval(() => {
        currentStep++;
        clone.volume = (currentStep / steps) * this.volume;
        
        if (currentStep >= steps) {
          clearInterval(fadeInterval);
          // Fade out
          setTimeout(() => {
            const fadeOutInterval = setInterval(() => {
              clone.volume -= this.volume / steps;
              if (clone.volume <= 0) {
                clearInterval(fadeOutInterval);
                clone.pause();
              }
            }, stepDuration);
          }, duration / 2);
        }
      }, stepDuration);
    } catch (e) {
      console.warn(`Error playing sound with easing:`, e);
    }
  }

  /**
   * Toggle sound on/off
   */
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  /**
   * Set global volume
   */
  setVolume(volume) {
    this.volume = Math.min(Math.max(volume, 0), 1);
  }

  /**
   * Preload all sounds (call before game starts)
   */
  async preload() {
    await this.initialize();
  }

  /**
   * Play sound for specific game events
   */
  // Event-specific play methods
  playDiceRoll(diceValue) {
    if (diceValue === 6) {
      this.play('diceRoll6', { volume: 0.8 });
    } else {
      this.play('diceRoll', { volume: 0.5 });
    }
  }

  playTokenMove() {
    this.play('tokenMove', { volume: 0.3 });
  }

  playTokenKill() {
    this.play('tokenKill', { volume: 0.9 });
    // Add vibration effect if supported
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  }

  playTokenHome() {
    this.playWithEasing('tokenHome', 800);
  }

  playWin() {
    this.playWithEasing('win', 2000);
    // Celebration vibration
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 200]);
    }
  }

  playLose() {
    this.play('lose', { volume: 0.6 });
  }

  playTurnChange() {
    this.play('turnChange', { volume: 0.3 });
  }

  playGameStart() {
    this.play('gameStart', { volume: 0.7 });
  }

  playError() {
    this.play('error', { volume: 0.4 });
  }

  playThreeSixes() {
    this.play('threeSixes', { volume: 0.7 });
  }

  playNoMove() {
    this.play('noMove', { volume: 0.3 });
  }
}

// Create singleton instance
export const soundManager = new SoundManager();

// React Hook for sound
import { useEffect, useRef } from 'react';

export const useSound = () => {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      soundManager.initialize();
      initialized.current = true;
    }
  }, []);

  return soundManager;
};
