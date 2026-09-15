import { apiSlice } from './apiSlice';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (body) => ({ url: '/auth/register', method: 'POST', body })
    }),
    login: builder.mutation({
      query: (body) => ({ url: '/auth/login', method: 'POST', body })
    }),
    getMe: builder.query({
      query: () => '/auth/me',
      providesTags: ['Auth']
    }),
    changePassword: builder.mutation({
      query: (body) => ({ url: '/auth/change-password', method: 'PUT', body })
    }),
    createStaff: builder.mutation({
      query: (body) => ({ url: '/auth/staff', method: 'POST', body }),
      invalidatesTags: ['Staff']
    }),
    getStaff: builder.query({
      query: (params) => ({ url: '/auth/staff', params }),
      providesTags: ['Staff']
    }),
    updateStaff: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/auth/staff/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Staff']
    })
  })
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetMeQuery,
  useChangePasswordMutation,
  useCreateStaffMutation,
  useGetStaffQuery,
  useUpdateStaffMutation
} = authApi;
