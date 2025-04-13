import { apiSlice } from "../api/apiSlice";
import type { User } from "../auth/authSlice";

export interface Chat {
  _id: string;
  name: string;
  isGroupChat: boolean;
  users: User[];
  lastMessage?: Message;
  groupAdmin?: User;
  groupPicture?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  // sender: User;
  sender: string;
  content: string;
  chat: Chat;
  type: string;
  // readBy: User[];
  readBy: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatsResponse {
  success: boolean;
  data: Chat[];
}

export interface SingleChatResponse {
  success: boolean;
  data: Chat;
}

export interface AccessChatRequest {
  userId: string;
}

export interface CreateGroupChatRequest {
  name: string;
  users: string[];
}

export interface UpdateGroupChatRequest {
  chatId: string;
  name?: string;
  users?: string[];
}

export interface GroupUserRequest {
  chatId: string;
  userId: string;
}

// Define chat API endpoints
export const chatApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserChats: builder.query<ChatsResponse, void>({
      query: () => "/chats",
      providesTags: ["Chat"],
    }),
    accessChat: builder.mutation<SingleChatResponse, AccessChatRequest>({
      query: (data) => ({
        url: "/chats",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Chat"],
    }),
    createGroupChat: builder.mutation<
      SingleChatResponse,
      CreateGroupChatRequest
    >({
      query: (data) => ({
        url: "/chats/group",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Chat"],
    }),
    updateGroupChat: builder.mutation<
      SingleChatResponse,
      UpdateGroupChatRequest
    >({
      query: (data) => ({
        url: "/chats/group",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Chat"],
    }),
    addToGroup: builder.mutation<SingleChatResponse, GroupUserRequest>({
      query: (data) => ({
        url: "/chats/group/add",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Chat"],
    }),
    removeFromGroup: builder.mutation<SingleChatResponse, GroupUserRequest>({
      query: (data) => ({
        url: "/chats/group/remove",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Chat"],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetUserChatsQuery,
  useAccessChatMutation,
  useCreateGroupChatMutation,
  useUpdateGroupChatMutation,
  useAddToGroupMutation,
  useRemoveFromGroupMutation,
} = chatApiSlice;
