import { apiSlice } from './apiSlice';

export const leadApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getLeads: builder.query({
      query: (params) => ({ url: '/leads', params }),
      providesTags: (result) =>
        result?.leads
          ? [...result.leads.map(({ _id }) => ({ type: 'Lead', id: _id })), { type: 'Lead', id: 'LIST' }]
          : [{ type: 'Lead', id: 'LIST' }]
    }),
    getLeadById: builder.query({
      query: (id) => `/leads/${id}`,
      providesTags: (result, error, id) => [{ type: 'Lead', id }]
    }),
    createLead: builder.mutation({
      query: (body) => ({ url: '/leads', method: 'POST', body }),
      invalidatesTags: [{ type: 'Lead', id: 'LIST' }]
    }),
    updateLead: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/leads/${id}`, method: 'PUT', body }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Lead', id }, { type: 'Lead', id: 'LIST' }]
    }),
    convertLead: builder.mutation({
      query: (id) => ({ url: `/leads/${id}/convert`, method: 'POST' }),
      invalidatesTags: [{ type: 'Lead', id: 'LIST' }, { type: 'Member', id: 'LIST' }, 'Dashboard']
    }),
    deleteLead: builder.mutation({
      query: (id) => ({ url: `/leads/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Lead', id: 'LIST' }]
    })
  })
});

export const {
  useGetLeadsQuery,
  useGetLeadByIdQuery,
  useCreateLeadMutation,
  useUpdateLeadMutation,
  useConvertLeadMutation,
  useDeleteLeadMutation
} = leadApi;
