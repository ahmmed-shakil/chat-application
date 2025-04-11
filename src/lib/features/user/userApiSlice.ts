import { apiSlice } from '../api/apiSlice';
import type { User } from '../auth/authSlice';

export interface UserResponse {
  success: boolean;
  data: User[];
}

export interface SingleUserResponse {
  success: boolean;
  data: User;
}

// Define user API endpoints
export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    searchUsers: builder.query<UserResponse, string>({
      query: (searchTerm) => `/users/search?search=${encodeURIComponent(searchTerm)}`,
      providesTags: ['User'],
    }),
    getAllUsers: builder.query<UserResponse, void>({
      query: () => '/users',
      providesTags: ['User'],
    }),
    getUserById: builder.query<SingleUserResponse, string>({
      query: (userId) => `/users/${userId}`,
      providesTags: ['User'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useSearchUsersQuery,
  useGetAllUsersQuery,
  useGetUserByIdQuery,
} = userApiSlice;
