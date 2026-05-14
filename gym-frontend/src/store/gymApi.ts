import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "./store";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const gymApi = createApi({
  reducerPath: "gymApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Members", "Plans", "Attendance", "Payments", "Trainers", "Dashboard"],
  endpoints: (builder) => ({
    // Auth
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (data) => ({
        url: "/auth/register",
        method: "POST",
        body: data,
      }),
    }),

    // Dashboard
    getDashboardStats: builder.query({
      query: () => "/dashboard/stats",
      providesTags: ["Dashboard"],
    }),
    getRevenueChart: builder.query({
      query: () => "/dashboard/revenue-chart",
      providesTags: ["Dashboard"],
    }),

    // Members
    getMembers: builder.query({
      query: (params?: { status?: string; search?: string }) => ({
        url: "/members",
        params,
      }),
      providesTags: ["Members"],
    }),
    getMember: builder.query({
      query: (id: string) => `/members/${id}`,
      providesTags: ["Members"],
    }),
    createMember: builder.mutation({
      query: (data) => ({
        url: "/members",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Members", "Dashboard"],
    }),
    updateMember: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/members/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Members"],
    }),
    deleteMember: builder.mutation({
      query: (id: string) => ({
        url: `/members/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Members", "Dashboard"],
    }),

    // Plans
    getPlans: builder.query({
      query: () => "/plans",
      providesTags: ["Plans"],
    }),
    createPlan: builder.mutation({
      query: (data) => ({
        url: "/plans",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Plans"],
    }),

    // Attendance
    getTodayAttendance: builder.query({
      query: () => "/attendance/today",
      providesTags: ["Attendance"],
    }),
    getMemberAttendance: builder.query({
      query: (memberId: string) => `/attendance/member/${memberId}`,
      providesTags: ["Attendance"],
    }),
    checkIn: builder.mutation({
      query: (data) => ({
        url: "/attendance/checkin",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Attendance", "Dashboard"],
    }),
    checkOut: builder.mutation({
      query: (id: string) => ({
        url: `/attendance/checkout/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["Attendance"],
    }),

    // Payments
    getPayments: builder.query({
      query: (params?) => ({
        url: "/payments",
        params,
      }),
      providesTags: ["Payments"],
    }),
    getPendingPayments: builder.query({
      query: () => "/payments/pending",
      providesTags: ["Payments"],
    }),
    createPayment: builder.mutation({
      query: (data) => ({
        url: "/payments",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Payments", "Members", "Dashboard"],
    }),

    // Trainers
    getTrainers: builder.query({
      query: () => "/trainers",
      providesTags: ["Trainers"],
    }),
    createTrainer: builder.mutation({
      query: (data) => ({
        url: "/trainers",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Trainers"],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetDashboardStatsQuery,
  useGetRevenueChartQuery,
  useGetMembersQuery,
  useGetMemberQuery,
  useCreateMemberMutation,
  useUpdateMemberMutation,
  useDeleteMemberMutation,
  useGetPlansQuery,
  useCreatePlanMutation,
  useGetTodayAttendanceQuery,
  useGetMemberAttendanceQuery,
  useCheckInMutation,
  useCheckOutMutation,
  useGetPaymentsQuery,
  useGetPendingPaymentsQuery,
  useCreatePaymentMutation,
  useGetTrainersQuery,
  useCreateTrainerMutation,
} = gymApi;
