import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";

// Define base query with authorization header
const baseQuery = fetchBaseQuery({
  baseUrl: "https://chat-application-agpb.onrender.com/api",
  // baseUrl: 'http://localhost:5000/api',
  prepareHeaders: (headers, { getState }) => {
    // Add token to request headers
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
  credentials: "include",
});

// Create API slice
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: ["User", "Chat", "Message"],
  endpoints: () => ({}),
});

export default apiSlice;
