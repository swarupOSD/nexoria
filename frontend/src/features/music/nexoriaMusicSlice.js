import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentTrack: null,
  queue: [],
  history: [],
  isPlaying: false,
  volume: 1, // 0 to 1
  isMuted: false,
  repeatMode: 'none', // 'none', 'all', 'one'
  shuffleMode: false,
  currentTime: 0,
  duration: 0,
  likedTracks: JSON.parse(localStorage.getItem('nexoriaLikedTracks')) || [],
};

const nexoriaMusicSlice = createSlice({
  name: 'nexoriaMusic',
  initialState,
  reducers: {
    playTrack: (state, action) => {
      const track = action.payload;
      
      // If we play a new track, we set it as current, and add to history if replacing an old one
      if (state.currentTrack && state.currentTrack._id !== track._id) {
        state.history.push(state.currentTrack);
      }
      
      state.currentTrack = track;
      state.isPlaying = true;
      if (track.duration) {
        state.duration = track.duration;
      } else {
        state.duration = 0;
      }
    },
    setQueue: (state, action) => {
      state.queue = action.payload;
    },
    addToQueue: (state, action) => {
      state.queue.push(action.payload);
    },
    addToQueueNext: (state, action) => {
      state.queue.unshift(action.payload);
    },
    removeFromQueue: (state, action) => {
      state.queue = state.queue.filter((t, index) => index !== action.payload);
    },
    clearQueue: (state) => {
      state.queue = [];
    },
    playNextTrack: (state) => {
      if (state.queue.length > 0) {
        if (state.currentTrack) {
          state.history.push(state.currentTrack);
        }
        
        let nextIndex = 0;
        if (state.shuffleMode) {
          nextIndex = Math.floor(Math.random() * state.queue.length);
        }
        
        state.currentTrack = state.queue[nextIndex];
        if (state.currentTrack.duration) state.duration = state.currentTrack.duration;
        else state.duration = 0;
        
        // Remove from queue
        state.queue.splice(nextIndex, 1);
        state.isPlaying = true;
      } else {
        if (state.repeatMode === 'all' && state.history.length > 0) {
           // If repeat all and queue is empty, restart history
           state.queue = [...state.history];
           state.history = [];
           if (state.currentTrack) state.history.push(state.currentTrack);
           
           let nextIdx = 0;
           if (state.shuffleMode) {
             nextIdx = Math.floor(Math.random() * state.queue.length);
           }
           state.currentTrack = state.queue[nextIdx];
           if (state.currentTrack.duration) state.duration = state.currentTrack.duration;
           else state.duration = 0;
           state.queue.splice(nextIdx, 1);
           state.isPlaying = true;
        } else if (state.repeatMode !== 'one') {
           // Reached end and no repeat
           state.isPlaying = false;
        }
      }
    },
    playPrevTrack: (state) => {
      if (state.history.length > 0) {
        if (state.currentTrack) {
          state.queue.unshift(state.currentTrack);
        }
        state.currentTrack = state.history.pop();
        if (state.currentTrack.duration) state.duration = state.currentTrack.duration;
        else state.duration = 0;
        state.isPlaying = true;
      }
    },
    togglePlayPause: (state) => {
      if (state.currentTrack) {
        state.isPlaying = !state.isPlaying;
      }
    },
    setPlaying: (state, action) => {
      state.isPlaying = action.payload;
    },
    setVolume: (state, action) => {
      state.volume = action.payload;
      if (action.payload > 0) {
        state.isMuted = false;
      }
    },
    toggleMute: (state) => {
      state.isMuted = !state.isMuted;
    },
    toggleRepeat: (state) => {
      if (state.repeatMode === 'none') state.repeatMode = 'all';
      else if (state.repeatMode === 'all') state.repeatMode = 'one';
      else state.repeatMode = 'none';
    },
    toggleShuffle: (state) => {
      state.shuffleMode = !state.shuffleMode;
    },
    updateTime: (state, action) => {
      state.currentTime = action.payload.currentTime;
      if (action.payload.duration) {
        state.duration = action.payload.duration;
      }
    },
    toggleLikeTrack: (state, action) => {
      const trackId = action.payload;
      if (state.likedTracks.includes(trackId)) {
        state.likedTracks = state.likedTracks.filter(id => id !== trackId);
      } else {
        state.likedTracks.push(trackId);
      }
      localStorage.setItem('nexoriaLikedTracks', JSON.stringify(state.likedTracks));
    }
  }
});

export const {
  playTrack,
  setQueue,
  addToQueue,
  addToQueueNext,
  removeFromQueue,
  clearQueue,
  playNextTrack,
  playPrevTrack,
  togglePlayPause,
  setPlaying,
  setVolume,
  toggleMute,
  toggleRepeat,
  toggleShuffle,
  updateTime,
  toggleLikeTrack
} = nexoriaMusicSlice.actions;

export default nexoriaMusicSlice.reducer;
