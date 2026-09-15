import { apiSlice } from './apiSlice';

export const settingsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSettings: builder.query({
      query: () => '/settings',
      providesTags: ['Settings']
    }),
    updateSettings: builder.mutation({
      query: (body) => ({ url: '/settings', method: 'PUT', body }),
      invalidatesTags: ['Settings']
    })
  })
});

export const { useGetSettingsQuery, useUpdateSettingsMutation } = settingsApi;
