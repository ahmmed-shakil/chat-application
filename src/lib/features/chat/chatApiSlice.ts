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
  sender: User;
  // sender: string;
  content: string;
  chat: Chat;
  type: string;
  // readBy: User[];
  readBy: string[];
  createdAt: string;
  updatedAt: string;
  sent: boolean;
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
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data: responseData } = await queryFulfilled;

          // Optimistically update the chat list
          dispatch(
            chatApiSlice.util.updateQueryData(
              "getUserChats",
              undefined,
              (draft) => {
                const existingChat = draft.data.find(
                  (chat) => chat._id === responseData.data._id
                );
                if (!existingChat) {
                  draft.data.unshift(responseData.data);
                }
              }
            )
          );
        } catch (error) {
          // Error handling is done by RTK Query
        }
      },
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
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data: responseData } = await queryFulfilled;

          // Optimistically update the chat list
          dispatch(
            chatApiSlice.util.updateQueryData(
              "getUserChats",
              undefined,
              (draft) => {
                draft.data.unshift(responseData.data);
              }
            )
          );
        } catch (error) {
          // Error handling is done by RTK Query
        }
      },
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
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data: responseData } = await queryFulfilled;

          // Optimistically update the chat in the list
          dispatch(
            chatApiSlice.util.updateQueryData(
              "getUserChats",
              undefined,
              (draft) => {
                const index = draft.data.findIndex(
                  (chat) => chat._id === responseData.data._id
                );
                if (index !== -1) {
                  draft.data[index] = responseData.data;
                }
              }
            )
          );
        } catch (error) {
          // Error handling is done by RTK Query
        }
      },
    }),
    addToGroup: builder.mutation<SingleChatResponse, GroupUserRequest>({
      query: (data) => ({
        url: "/chats/group/add",
        method: "PUT",
        body: data,
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data: responseData } = await queryFulfilled;

          // Optimistically update the chat in the list
          dispatch(
            chatApiSlice.util.updateQueryData(
              "getUserChats",
              undefined,
              (draft) => {
                const index = draft.data.findIndex(
                  (chat) => chat._id === responseData.data._id
                );
                if (index !== -1) {
                  draft.data[index] = responseData.data;
                }
              }
            )
          );
        } catch (error) {
          // Error handling is done by RTK Query
        }
      },
    }),
    removeFromGroup: builder.mutation<SingleChatResponse, GroupUserRequest>({
      query: (data) => ({
        url: "/chats/group/remove",
        method: "PUT",
        body: data,
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data: responseData } = await queryFulfilled;

          // Optimistically update the chat in the list
          dispatch(
            chatApiSlice.util.updateQueryData(
              "getUserChats",
              undefined,
              (draft) => {
                const index = draft.data.findIndex(
                  (chat) => chat._id === responseData.data._id
                );
                if (index !== -1) {
                  draft.data[index] = responseData.data;
                }
              }
            )
          );
        } catch (error) {
          // Error handling is done by RTK Query
        }
      },
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
