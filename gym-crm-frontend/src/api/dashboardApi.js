import { apiSlice } from './apiSlice';

export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: () => '/dashboard',
      providesTags: ['Dashboard']
    }),
    getActionRequired: builder.query({
      query: () => '/dashboard/action-required',
      providesTags: ['Dashboard']
    })
  })
});

export const { useGetDashboardStatsQuery, useGetActionRequiredQuery } = dashboardApi;
