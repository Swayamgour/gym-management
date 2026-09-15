import { apiSlice } from './apiSlice';

export const memberApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMembers: builder.query({
      query: (params) => ({ url: '/members', params }),
      providesTags: (result) =>
        result?.members
          ? [
              ...result.members.map(({ _id }) => ({ type: 'Member', id: _id })),
              { type: 'Member', id: 'LIST' }
            ]
          : [{ type: 'Member', id: 'LIST' }]
    }),
    getMemberById: builder.query({
      query: (id) => `/members/${id}`,
      providesTags: (result, error, id) => [{ type: 'Member', id }]
    }),
    getMemberActivity: builder.query({
      query: (id) => `/members/${id}/activity`
    }),
    createMember: builder.mutation({
      query: (body) => ({ url: '/members', method: 'POST', body }),
      invalidatesTags: [{ type: 'Member', id: 'LIST' }, 'Dashboard']
    }),
    updateMember: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/members/${id}`, method: 'PUT', body }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Member', id }, { type: 'Member', id: 'LIST' }]
    }),
    deleteMember: builder.mutation({
      query: (id) => ({ url: `/members/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Member', id: 'LIST' }, 'Dashboard']
    }),
    assignTrainer: builder.mutation({
      query: ({ id, trainerId }) => ({ url: `/members/${id}/trainer`, method: 'PUT', body: { trainerId } }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Member', id }, { type: 'Member', id: 'LIST' }, 'Trainer']
    })
  })
});

export const {
  useGetMembersQuery,
  useGetMemberByIdQuery,
  useGetMemberActivityQuery,
  useCreateMemberMutation,
  useUpdateMemberMutation,
  useDeleteMemberMutation,
  useAssignTrainerMutation
} = memberApi;
