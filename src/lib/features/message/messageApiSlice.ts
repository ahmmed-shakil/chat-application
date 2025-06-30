/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiSlice } from "../api/apiSlice";
import { selectCurrentUser } from "../auth/authSlice";
import type { Message } from "../chat/chatApiSlice";
import { chatApiSlice } from "../chat/chatApiSlice";
import { v4 as uuidv4 } from "uuid";

export interface MessagesResponse {
  success: boolean;
  data: Message[];
}

export interface MessageResponse {
  success: boolean;
  data: Message;
}

export interface SendMessageRequest {
  chatId: string;
  content: string;
  type?: string;
}

export const messageApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMessages: builder.query<MessagesResponse, string>({
      query: (chatId) => `/messages/${chatId}`,
      providesTags: ["Message"],
    }),

    sendMessage: builder.mutation<MessageResponse, SendMessageRequest>({
      query: (data) => ({
        url: "/messages",
        method: "POST",
        body: data,
      }),
      async onQueryStarted(data, { dispatch, queryFulfilled, getState }) {
        const state = getState() as any;
        const currentUser = state.auth.user;

        const tempMessage: Message = {
          _id: uuidv4(),
          sender: currentUser,
          content: data.content,
          chat: { _id: data.chatId } as any,
          type: data.type || "text",
          readBy: [currentUser._id],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          sent: false,
          delivered: false,
        };

        // Optimistically add message to the list
        const patchResult = dispatch(
          messageApiSlice.util.updateQueryData(
            "getMessages",
            data.chatId,
            (draft) => {
              draft.data.push(tempMessage);
            }
          )
        );

        // Optimistically update chat list with last message
        const chatPatchResult = dispatch(
          chatApiSlice.util.updateQueryData(
            "getUserChats",
            undefined,
            (draft: any) => {
              const chatIndex = draft.data.findIndex(
                (chat: any) => chat._id === data.chatId
              );
              if (chatIndex !== -1) {
                draft.data[chatIndex].lastMessage = tempMessage;
                // Move chat to top
                const [chat] = draft.data.splice(chatIndex, 1);
                draft.data.unshift(chat);
              }
            }
          )
        );

        try {
          const { data: responseData } = await queryFulfilled;

          // Update with real message data
          dispatch(
            messageApiSlice.util.updateQueryData(
              "getMessages",
              data.chatId,
              (draft) => {
                const index = draft.data.findIndex(
                  (msg) => msg._id === tempMessage._id
                );
                if (index !== -1) {
                  draft.data[index] = {
                    ...responseData.data,
                    sent: true,
                    delivered: false,
                  };
                }
              }
            )
          );

          // Update chat list with real message
          dispatch(
            chatApiSlice.util.updateQueryData(
              "getUserChats",
              undefined,
              (draft: any) => {
                const chatIndex = draft.data.findIndex(
                  (chat: any) => chat._id === data.chatId
                );
                if (chatIndex !== -1) {
                  draft.data[chatIndex].lastMessage = responseData.data;
                }
              }
            )
          );
        } catch (error) {
          // Revert optimistic updates on error
          patchResult.undo();
          chatPatchResult.undo();

          // Show failed message
          dispatch(
            messageApiSlice.util.updateQueryData(
              "getMessages",
              data.chatId,
              (draft) => {
                const failedMessage = {
                  ...tempMessage,
                  sent: false,
                  _id: `failed-${tempMessage._id}`,
                };
                draft.data.push(failedMessage);
              }
            )
          );
        }
      },
    }),

    uploadFile: builder.mutation<
      MessageResponse,
      { chatId: string; file: File; type: string }
    >({
      query: ({ chatId, file, type }) => {
        const formData = new FormData();
        formData.append("chatId", chatId);
        formData.append("type", type);
        formData.append("file", file);

        return {
          url: "/messages/upload",
          method: "POST",
          body: formData,
          formData: true,
        };
      },
      async onQueryStarted(
        { chatId, file, type },
        { dispatch, queryFulfilled, getState }
      ) {
        const state = getState() as any;
        const currentUser = state.auth.user;

        const tempId = uuidv4();
        const tempMessage: Message = {
          _id: tempId,
          sender: currentUser,
          content: file.name,
          chat: { _id: chatId } as any,
          type: type,
          readBy: [currentUser._id],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          sent: false,
          delivered: false,
          isUploading: true, // Add uploading flag
        };

        // Optimistically add uploading message
        const patchResult = dispatch(
          messageApiSlice.util.updateQueryData(
            "getMessages",
            chatId,
            (draft) => {
              draft.data.push(tempMessage);
            }
          )
        );

        try {
          const { data: responseData } = await queryFulfilled;

          // Replace temp message with real one (remove temp, add real)
          dispatch(
            messageApiSlice.util.updateQueryData(
              "getMessages",
              chatId,
              (draft) => {
                // Remove temp message
                const tempIndex = draft.data.findIndex(
                  (msg) => msg._id === tempId
                );
                if (tempIndex !== -1) {
                  draft.data.splice(tempIndex, 1);
                }

                // Add real message (avoid duplicates)
                const realMessageExists = draft.data.some(
                  (msg) => msg._id === responseData.data._id
                );
                if (!realMessageExists) {
                  draft.data.push({
                    ...responseData.data,
                    sent: true,
                    delivered: false,
                  });
                }
              }
            )
          );

          // Update chat list
          dispatch(
            chatApiSlice.util.updateQueryData(
              "getUserChats",
              undefined,
              (draft: any) => {
                const chatIndex = draft.data.findIndex(
                  (chat: any) => chat._id === chatId
                );
                if (chatIndex !== -1) {
                  draft.data[chatIndex].lastMessage = responseData.data;
                  // Move to top
                  const [chat] = draft.data.splice(chatIndex, 1);
                  draft.data.unshift(chat);
                }
              }
            )
          );
        } catch (error) {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const {
  useGetMessagesQuery,
  useSendMessageMutation,
  useUploadFileMutation,
} = messageApiSlice;
