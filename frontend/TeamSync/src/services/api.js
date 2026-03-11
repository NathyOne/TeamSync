import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import {
  ACCESS_TOKEN_KEY,
  JWT_LOGIN_URL,
  REFRESH_TOKEN_KEY,
  SESSION_KEY,
  USER_BADGE_KEY,
} from '../config/appConfig'

const refreshUrl =
  typeof JWT_LOGIN_URL === 'string' && JWT_LOGIN_URL.includes('/create/')
    ? JWT_LOGIN_URL.replace('/create/', '/refresh/')
    : 'http://localhost:9000/auth/jwt/refresh/'

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:9000/teamsync/',
  prepareHeaders: (headers) => {
    const token = window.sessionStorage.getItem(ACCESS_TOKEN_KEY)
    if (token) {
      headers.set('authorization', `JWT ${token}`)
    }
    return headers
  },
})

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)

  if (result.error && result.error.status === 401) {
    const refreshToken = window.sessionStorage.getItem(REFRESH_TOKEN_KEY)

    if (!refreshToken) {
      window.sessionStorage.removeItem(ACCESS_TOKEN_KEY)
      window.sessionStorage.removeItem(REFRESH_TOKEN_KEY)
      window.sessionStorage.removeItem(SESSION_KEY)
      window.sessionStorage.removeItem(USER_BADGE_KEY)
      if (typeof window !== 'undefined') {
        window.location.replace('/login')
      }
      return result
    }

    const refreshResult = await baseQuery(
      {
        url: refreshUrl,
        method: 'POST',
        body: { refresh: refreshToken },
      },
      api,
      extraOptions,
    )

    if (refreshResult.data?.access) {
      window.sessionStorage.setItem(ACCESS_TOKEN_KEY, refreshResult.data.access)
      result = await baseQuery(args, api, extraOptions)
    } else {
      window.sessionStorage.removeItem(ACCESS_TOKEN_KEY)
      window.sessionStorage.removeItem(REFRESH_TOKEN_KEY)
      window.sessionStorage.removeItem(SESSION_KEY)
      window.sessionStorage.removeItem(USER_BADGE_KEY)
      if (typeof window !== 'undefined') {
        window.location.replace('/login')
      }
    }
  }

  return result
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Product', 'User', 'Assignment', 'Movement'],
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: () => 'app/products/',
      providesTags: ['Product'],
    }),
    getUsers: builder.query({
      query: () => 'user/register/',
      providesTags: ['User'],
    }),
    getCurrentUser: builder.query({
      query: () => 'user/me/',
      providesTags: ['User'],
    }),
    updateUser: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `user/register/${id}/`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: ['User'],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `user/register/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
    addProduct: builder.mutation({
      query: (product) => ({
        url: 'app/products/',
        method: 'POST',
        body: product,
      }),
      invalidatesTags: ['Product'],
    }),
    getSalesAssignments: builder.query({
      query: () => 'app/stock/assignments/',
      providesTags: ['Assignment'],
    }),
    getStockMovements: builder.query({
      query: () => 'app/stock/movements/',
      providesTags: ['Movement'],
    }),
    getSalesDeposits: builder.query({
      query: () => 'app/stock/deposits/',
      providesTags: ['Movement'],
    }),
    getMyDeposits: builder.query({
      query: () => 'app/stock/my-deposits/',
      providesTags: ['Movement'],
    }),
    getMyAssignments: builder.query({
      query: () => 'app/stock/my-assignments/',
      providesTags: ['Assignment'],
    }),
    assignStock: builder.mutation({
      query: (assignment) => ({
        url: 'app/stock/assign/',
        method: 'POST',
        body: assignment,
      }),
      invalidatesTags: ['Product', 'Assignment'],
    }),
    acceptAssignment: builder.mutation({
      query: (payload) => ({
        url: 'app/stock/accept/',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Assignment'],
    }),
    rejectAssignment: builder.mutation({
      query: (payload) => ({
        url: 'app/stock/reject/',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Product', 'Assignment'],
    }),
    returnStock: builder.mutation({
      query: (payload) => ({
        url: 'app/stock/return/',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Product', 'Assignment', 'Movement'],
    }),
    submitSale: builder.mutation({
      query: (payload) => ({
        url: 'app/stock/sold/',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Assignment', 'Movement'],
    }),
  }),
})

export const {
  useGetProductsQuery,
  useGetUsersQuery,
  useGetCurrentUserQuery,
  useAddProductMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetSalesAssignmentsQuery,
  useGetStockMovementsQuery,
  useGetSalesDepositsQuery,
  useGetMyDepositsQuery,
  useGetMyAssignmentsQuery,
  useAssignStockMutation,
  useAcceptAssignmentMutation,
  useRejectAssignmentMutation,
  useReturnStockMutation,
  useSubmitSaleMutation,
} = api
