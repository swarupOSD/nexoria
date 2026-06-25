import { apiSlice } from '../api/apiSlice';

export const uploadApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    uploadImage: builder.mutation({
      query: (data) => ({
        url: '/upload/image',
        method: 'POST',
        body: data,
      }),
    }),
    uploadLogo: builder.mutation({
      query: (data) => ({
        url: '/upload/logo',
        method: 'POST',
        body: data,
      }),
    }),
    uploadProfile: builder.mutation({
      query: (data) => ({
        url: '/upload/profile',
        method: 'POST',
        body: data,
      }),
    }),
    deleteImage: builder.mutation({
      query: (data) => ({
        url: '/upload/delete',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useUploadImageMutation,
  useUploadLogoMutation,
  useUploadProfileMutation,
  useDeleteImageMutation,
} = uploadApiSlice;
