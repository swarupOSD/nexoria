import { createSlice } from '@reduxjs/toolkit';

const getInitialState = () => {
  const savedState = localStorage.getItem('nexoriaSoundState');
  if (savedState) {
    try {
      const parsed = JSON.parse(savedState);
      
      // Filter out any invalid old dummy data (like songs without proper audio URLs or titles)
      const cleanRecentlyPlayed = (parsed.recentlyPlayed || []).filter(
        s => s && s.title && s.audioUrl && !s.title.includes('Cyber Beats FM') && !s.title.includes('Lofi Chill Station') && !s.title.includes('Nexoria Hits 99.5')
      );

      return {
        currentSong: parsed.currentSong || null,
        isPlaying: false, // always start paused to respect browser autoplay rules
        queue: parsed.queue || [],
        recentlyPlayed: cleanRecentlyPlayed,
        volume: parsed.volume !== undefined ? parsed.volume : 1,
        isMuted: parsed.isMuted || false,
        loopMode: parsed.loopMode || 0, // 0 = no loop, 1 = loop all, 2 = loop one
        isShuffle: parsed.isShuffle || false
      };
    } catch (e) {
      console.error('Failed to parse sound state', e);
    }
  }
  return {
    currentSong: null,
    isPlaying: false,
    queue: [],
    recentlyPlayed: [],
    volume: 1,
    isMuted: false,
    loopMode: 0,
    isShuffle: false,
    isRadioMode: false
  };
};

const initialState = getInitialState();

const saveStateToLocal = (state) => {
  localStorage.setItem('nexoriaSoundState', JSON.stringify({
    currentSong: state.currentSong,
    queue: state.queue,
    recentlyPlayed: state.recentlyPlayed,
    volume: state.volume,
    isMuted: state.isMuted,
    loopMode: state.loopMode,
    isShuffle: state.isShuffle,
    isRadioMode: state.isRadioMode
  }));
};

const musicSlice = createSlice({
  name: 'music',
  initialState,
  reducers: {
    playSong: (state, action) => {
      const song = action.payload;
      
      // Add previous currentSong to recently played if it exists
      if (state.currentSong && state.currentSong._id !== song._id) {
        state.recentlyPlayed = [state.currentSong, ...state.recentlyPlayed.filter(s => s._id !== state.currentSong._id)].slice(0, 20);
      }
      
      state.currentSong = song;
      state.isPlaying = true;
      saveStateToLocal(state);
    },
    togglePlayPause: (state) => {
      if (state.currentSong) {
        state.isPlaying = !state.isPlaying;
      }
    },
    setPlaying: (state, action) => {
      state.isPlaying = action.payload;
    },
    setVolume: (state, action) => {
      state.volume = action.payload;
      if (action.payload > 0) state.isMuted = false;
      saveStateToLocal(state);
    },
    toggleMute: (state) => {
      state.isMuted = !state.isMuted;
      saveStateToLocal(state);
    },
    addToQueue: (state, action) => {
      const song = action.payload;
      if (!state.queue.find(s => s._id === song._id)) {
        state.queue.push(song);
        saveStateToLocal(state);
      }
    },
    removeFromQueue: (state, action) => {
      state.queue = state.queue.filter(s => s._id !== action.payload);
      saveStateToLocal(state);
    },
    playNext: (state) => {
      if (state.queue.length > 0) {
        const nextSong = state.queue[0];
        
        if (state.currentSong) {
          state.recentlyPlayed = [state.currentSong, ...state.recentlyPlayed.filter(s => s._id !== state.currentSong._id)].slice(0, 20);
        }
        
        state.currentSong = nextSong;
        state.queue.shift(); // remove from queue
        state.isPlaying = true;
      } else if (state.currentSong && state.loopMode === 1) {
        // Handle loop all if there's a playlist context (to be implemented)
        // For now, if no queue, just stop or restart
        state.currentSong = null;
        state.isPlaying = false;
      } else {
        state.currentSong = null;
        state.isPlaying = false;
      }
      saveStateToLocal(state);
    },
    playPrevious: (state) => {
      if (state.recentlyPlayed.length > 0) {
        const prevSong = state.recentlyPlayed[0];
        
        if (state.currentSong) {
          state.queue = [state.currentSong, ...state.queue];
        }
        
        state.currentSong = prevSong;
        state.recentlyPlayed.shift();
        state.isPlaying = true;
      }
      saveStateToLocal(state);
    },
    clearQueue: (state) => {
      state.queue = [];
      saveStateToLocal(state);
    },
    removeFromRecentlyPlayed: (state, action) => {
      const songIdToRemove = action.payload;
      state.recentlyPlayed = state.recentlyPlayed.filter(s => s._id !== songIdToRemove);
      saveStateToLocal(state);
    },
    toggleLoopMode: (state) => {
      state.loopMode = (state.loopMode + 1) % 3;
      saveStateToLocal(state);
    },
    toggleShuffle: (state) => {
      state.isShuffle = !state.isShuffle;
      saveStateToLocal(state);
    },
    toggleRadioMode: (state) => {
      state.isRadioMode = !state.isRadioMode;
      saveStateToLocal(state);
    },
    playPlaylist: (state, action) => {
      const { songs, startIndex = 0 } = action.payload;
      if (songs && songs.length > 0) {
        if (state.currentSong) {
          state.recentlyPlayed = [state.currentSong, ...state.recentlyPlayed.filter(s => s._id !== state.currentSong._id)].slice(0, 20);
        }
        state.currentSong = songs[startIndex];
        state.queue = songs.slice(startIndex + 1);
        state.isPlaying = true;
        saveStateToLocal(state);
      }
    }
  }
});

export const {
  playSong, togglePlayPause, setPlaying, setVolume, toggleMute,
  addToQueue, removeFromQueue, playNext, playPrevious, clearQueue,
  removeFromRecentlyPlayed, toggleLoopMode, toggleShuffle, toggleRadioMode, playPlaylist
} = musicSlice.actions;

export default musicSlice.reducer;
