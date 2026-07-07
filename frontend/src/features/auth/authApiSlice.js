import { apiSlice } from '../api/apiSlice';

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: '/auth/login',
        method: 'POST',
        body: data,
      }),
    }),
    getCaptcha: builder.query({
      query: () => '/auth/captcha',
    }),
    register: builder.mutation({
      query: (data) => ({
        url: '/auth/register',
        method: 'POST',
        body: data,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),
    forgotPassword: builder.mutation({
      query: (data) => ({
        url: '/auth/forgotpassword',
        method: 'POST',
        body: data,
      }),
    }),
    resetPassword: builder.mutation({
      query: ({ token, data }) => ({
        url: `/auth/resetpassword/${token}`,
        method: 'PUT',
        body: data,
      }),
    }),
    updatePassword: builder.mutation({
      query: (data) => ({
        url: '/auth/update-password',
        method: 'PUT',
        body: data,
      }),
    }),
    updateProfile: builder.mutation({
      query: (data) => ({
        url: '/auth/update-profile',
        method: 'PUT',
        body: data,
      }),
    }),
    getMe: builder.query({
      query: () => ({
        url: '/auth/me',
        method: 'GET',
      }),
    }),
    generate2FA: builder.mutation({
      query: () => ({
        url: '/auth/2fa/generate',
        method: 'POST',
      }),
    }),
    verify2FA: builder.mutation({
      query: (data) => ({
        url: '/auth/2fa/verify',
        method: 'POST',
        body: data,
      }),
    }),
    disable2FA: builder.mutation({
      query: (data) => ({
        url: '/auth/2fa/disable',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const { 
  useLoginMutation, 
  useGetCaptchaQuery,
  useRegisterMutation, 
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useUpdatePasswordMutation,
  useUpdateProfileMutation,
  useGetMeQuery,
  useGenerate2FAMutation,
  useVerify2FAMutation,
  useDisable2FAMutation
} = authApiSlice;
