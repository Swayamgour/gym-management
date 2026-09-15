import { createSlice } from '@reduxjs/toolkit';

const storedUser = localStorage.getItem('gymcrm_user');
const storedToken = localStorage.getItem('gymcrm_token');

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      localStorage.setItem('gymcrm_user', JSON.stringify(user));
      localStorage.setItem('gymcrm_token', token);
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('gymcrm_user', JSON.stringify(state.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('gymcrm_user');
      localStorage.removeItem('gymcrm_token');
    }
  }
});

export const { setCredentials, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;
