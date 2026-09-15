import { apiSlice } from './apiSlice';

export const whatsappApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    generateMessage: builder.mutation({
      query: (body) => ({ url: '/whatsapp/generate', method: 'POST', body })
    }),
    getTemplates: builder.query({
      query: () => '/whatsapp/templates',
      providesTags: ['Whatsapp']
    }),
    upsertTemplate: builder.mutation({
      query: ({ type, template }) => ({ url: `/whatsapp/templates/${type}`, method: 'PUT', body: { template } }),
      invalidatesTags: ['Whatsapp']
    }),
    getFollowUpHistory: builder.query({
      query: (params) => ({ url: '/whatsapp/history', params })
    })
  })
});

export const {
  useGenerateMessageMutation,
  useGetTemplatesQuery,
  useUpsertTemplateMutation,
  useGetFollowUpHistoryQuery
} = whatsappApi;
