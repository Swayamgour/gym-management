import { apiSlice } from './apiSlice';

export const reportApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMemberReport: builder.query({ query: () => '/reports/members' }),
    getAttendanceReport: builder.query({ query: (params) => ({ url: '/reports/attendance', params }) }),
    getMembershipReport: builder.query({ query: (params) => ({ url: '/reports/memberships', params }) }),
    getRevenueReport: builder.query({ query: (params) => ({ url: '/reports/revenue', params }) }),
    getTrainerReport: builder.query({ query: () => '/reports/trainers' })
  })
});

export const {
  useGetMemberReportQuery,
  useGetAttendanceReportQuery,
  useGetMembershipReportQuery,
  useGetRevenueReportQuery,
  useGetTrainerReportQuery
} = reportApi;
