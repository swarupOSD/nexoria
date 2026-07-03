import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: (localStorage.getItem('user') && localStorage.getItem('user') !== 'undefined') ? JSON.parse(localStorage.getItem('user')) : null,
  token: (localStorage.getItem('token') && localStorage.getItem('token') !== 'undefined') ? localStorage.getItem('token') : null,
  isAuthenticated: !!localStorage.getItem('token') && localStorage.getItem('token') !== 'undefined',
  isKidsMode: localStorage.getItem('isKidsMode') === 'true',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = !!user;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
    toggleKidsMode: (state) => {
      state.isKidsMode = !state.isKidsMode;
      localStorage.setItem('isKidsMode', state.isKidsMode);
    },
  },
});

export const { setCredentials, logout, toggleKidsMode } = authSlice.actions;
export default authSlice.reducer;
