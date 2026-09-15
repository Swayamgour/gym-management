import { apiSlice } from './apiSlice';

export const paymentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPayments: builder.query({
      query: (params) => ({ url: '/payments', params }),
      providesTags: [{ type: 'Payment', id: 'LIST' }]
    }),
    getPendingPayments: builder.query({
      query: () => '/payments/pending',
      providesTags: [{ type: 'Payment', id: 'PENDING' }]
    }),
    getMemberPayments: builder.query({
      query: (memberId) => `/payments/member/${memberId}`,
      providesTags: [{ type: 'Payment', id: 'LIST' }]
    }),
    recordPayment: builder.mutation({
      query: (body) => ({ url: '/payments', method: 'POST', body }),
      invalidatesTags: [
        { type: 'Payment', id: 'LIST' },
        { type: 'Payment', id: 'PENDING' },
        { type: 'Membership', id: 'LIST' },
        { type: 'Member', id: 'LIST' },
        'Dashboard'
      ]
    })
  })
});

export const {
  useGetPaymentsQuery,
  useGetPendingPaymentsQuery,
  useGetMemberPaymentsQuery,
  useRecordPaymentMutation
} = paymentApi;
