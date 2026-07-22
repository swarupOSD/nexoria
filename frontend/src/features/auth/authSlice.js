import { createSlice } from '@reduxjs/toolkit';

const initialUser = (localStorage.getItem('user') && localStorage.getItem('user') !== 'undefined') ? JSON.parse(localStorage.getItem('user')) : null;

const initialState = {
  user: initialUser,
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
      
      let modifiedUser = user;
      if (user) {
        // Clone the user object to avoid mutating a frozen RTK Query payload
        modifiedUser = { ...user };
      }
      
      state.user = modifiedUser;
      if (token) state.token = token;
      state.isAuthenticated = !!modifiedUser;
      
      localStorage.setItem('user', JSON.stringify(modifiedUser));
      if (token) localStorage.setItem('token', token);
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
