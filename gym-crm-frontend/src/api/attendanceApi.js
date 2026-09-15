import { apiSlice } from './apiSlice';

export const attendanceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    checkIn: builder.mutation({
      query: (body) => ({ url: '/attendance/check-in', method: 'POST', body }),
      invalidatesTags: ['Attendance', 'Dashboard', { type: 'Member', id: 'LIST' }]
    }),
    checkOut: builder.mutation({
      query: (body) => ({ url: '/attendance/check-out', method: 'POST', body }),
      invalidatesTags: ['Attendance', 'Dashboard', { type: 'Member', id: 'LIST' }]
    }),
    getCurrentlyInside: builder.query({
      query: () => '/attendance/currently-inside',
      providesTags: ['Attendance']
    }),
    getTodayAttendance: builder.query({
      query: () => '/attendance/today',
      providesTags: ['Attendance']
    }),
    getMemberAttendance: builder.query({
      query: ({ memberId, ...params }) => ({ url: `/attendance/member/${memberId}`, params }),
      providesTags: ['Attendance']
    })
  })
});

export const {
  useCheckInMutation,
  useCheckOutMutation,
  useGetCurrentlyInsideQuery,
  useGetTodayAttendanceQuery,
  useGetMemberAttendanceQuery
} = attendanceApi;
