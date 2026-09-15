import { apiSlice } from './apiSlice';

export const packageApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPackages: builder.query({
      query: (params) => ({ url: '/packages', params }),
      providesTags: (result) =>
        result?.packages
          ? [...result.packages.map(({ _id }) => ({ type: 'Package', id: _id })), { type: 'Package', id: 'LIST' }]
          : [{ type: 'Package', id: 'LIST' }]
    }),
    getPackageById: builder.query({
      query: (id) => `/packages/${id}`,
      providesTags: (result, error, id) => [{ type: 'Package', id }]
    }),
    createPackage: builder.mutation({
      query: (body) => ({ url: '/packages', method: 'POST', body }),
      invalidatesTags: [{ type: 'Package', id: 'LIST' }]
    }),
    updatePackage: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/packages/${id}`, method: 'PUT', body }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Package', id }, { type: 'Package', id: 'LIST' }]
    }),
    deletePackage: builder.mutation({
      query: (id) => ({ url: `/packages/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Package', id: 'LIST' }]
    })
  })
});

export const {
  useGetPackagesQuery,
  useGetPackageByIdQuery,
  useCreatePackageMutation,
  useUpdatePackageMutation,
  useDeletePackageMutation
} = packageApi;
