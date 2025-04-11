import { apiSlice } from '../api/apiSlice';
import type { Message } from '../chat/chatApiSlice';

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

// Define message API endpoints
export const messageApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMessages: builder.query<MessagesResponse, string>({
      query: (chatId) => `/messages/${chatId}`,
      providesTags: ['Message'],
    }),
    sendMessage: builder.mutation<MessageResponse, SendMessageRequest>({
      query: (data) => ({
        url: '/messages',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Message', 'Chat'],
    }),
    uploadFile: builder.mutation<
      MessageResponse,
      { chatId: string; file: File; type: string }
    >({
      query: ({ chatId, file, type }) => {
        const formData = new FormData();
        formData.append('chatId', chatId);
        formData.append('type', type);
        formData.append('file', file);

        return {
          url: '/messages/upload',
          method: 'POST',
          body: formData,
          formData: true,
        };
      },
      invalidatesTags: ['Message', 'Chat'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetMessagesQuery,
  useSendMessageMutation,
  useUploadFileMutation,
} = messageApiSlice;
