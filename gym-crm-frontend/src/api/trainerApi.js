import { apiSlice } from './apiSlice';

export const trainerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTrainers: builder.query({
      query: () => '/trainers',
      providesTags: ['Trainer']
    }),
    getTrainerDashboard: builder.query({
      query: (trainerId) => (trainerId ? `/trainers/${trainerId}/dashboard` : '/trainers/dashboard'),
      providesTags: ['Trainer']
    }),
    getTrainerMembers: builder.query({
      query: (trainerId) => `/trainers/${trainerId}/members`,
      providesTags: ['Trainer']
    })
  })
});

export const { useGetTrainersQuery, useGetTrainerDashboardQuery, useGetTrainerMembersQuery } = trainerApi;
