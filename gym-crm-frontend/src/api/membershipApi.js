import { apiSlice } from './apiSlice';

export const membershipApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMemberships: builder.query({
      query: (params) => ({ url: '/memberships', params }),
      providesTags: (result) =>
        result?.memberships
          ? [
              ...result.memberships.map(({ _id }) => ({ type: 'Membership', id: _id })),
              { type: 'Membership', id: 'LIST' }
            ]
          : [{ type: 'Membership', id: 'LIST' }]
    }),
    getMembershipById: builder.query({
      query: (id) => `/memberships/${id}`,
      providesTags: (result, error, id) => [{ type: 'Membership', id }]
    }),
    assignOrRenewMembership: builder.mutation({
      query: (body) => ({ url: '/memberships', method: 'POST', body }),
      invalidatesTags: [
        { type: 'Membership', id: 'LIST' },
        { type: 'Member', id: 'LIST' },
        { type: 'Payment', id: 'LIST' },
        'Dashboard'
      ]
    })
  })
});

export const { useGetMembershipsQuery, useGetMembershipByIdQuery, useAssignOrRenewMembershipMutation } = membershipApi;
