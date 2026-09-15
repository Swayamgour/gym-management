import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout } from '../features/auth/authSlice';

const baseUrl = 'https://gym-management-production-48f7.up.railway.app/api/v1'

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }
});

// Wraps the base query so an expired/invalid token logs the user out
// automatically instead of leaving the app stuck on 401s everywhere.
const baseQueryWithReauth = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 401) {
    api.dispatch(logout());
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Dashboard',
    'Member',
    'Package',
    'Membership',
    'Attendance',
    'Trainer',
    'Payment',
    'Lead',
    'Whatsapp',
    'Settings',
    'Staff',
    'Auth'
  ],
  endpoints: () => ({})
});
