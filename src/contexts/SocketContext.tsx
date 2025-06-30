/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import { useSelector, useDispatch } from "react-redux";
import { selectToken, selectCurrentUser } from "@/lib/features/auth/authSlice";
import { chatApiSlice } from "@/lib/features/chat/chatApiSlice";
import { messageApiSlice } from "@/lib/features/message/messageApiSlice";
import type { AnyAction } from "@reduxjs/toolkit";

interface SocketContextType {
  socket: Socket | null;
  online: boolean;
  onlineUsers: Set<string>;
  typingUsers: Map<string, Set<string>>; // chatId -> Set of user IDs
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
  emitTyping: (chatId: string) => void;
  emitStopTyping: (chatId: string) => void;
  emitNewMessage: (message: any) => void;
  emitMessageRead: (messageId: string) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  online: false,
  onlineUsers: new Set(),
  typingUsers: new Map(),
  joinChat: () => {},
  leaveChat: () => {},
  emitTyping: () => {},
  emitStopTyping: () => {},
  emitNewMessage: () => {},
  emitMessageRead: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [online, setOnline] = useState<boolean>(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Map<string, Set<string>>>(
    new Map()
  );
  const token = useSelector(selectToken);
  const currentUser = useSelector(selectCurrentUser);
  const socketRef = useRef<Socket | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (token && !socketRef.current) {
      console.log("Initializing socket connection");

      const newSocket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}`, {
        transports: ["websocket"],
      });

      socketRef.current = newSocket;
      setSocket(newSocket);
      return () => {
        console.log("Cleaning up socket connection");
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
          setSocket(null);
          setOnline(false);
        }
      };
    }

    if (!token && socketRef.current) {
      console.log("Token removed, disconnecting socket");
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setOnline(false);
    }
  }, [token]);

  useEffect(() => {
    const currentSocket = socketRef.current;

    if (!currentSocket) return;

    const handleConnect = () => {
      console.log("Socket connected");
      setOnline(true);

      if (token) {
        currentSocket.emit("setup", token);
      }
    };

    const handleDisconnect = () => {
      console.log("Socket disconnected");
      setOnline(false);
    };

    const handleUserOnline = (userId: string) => {
      console.log("User came online:", userId);
      setOnlineUsers((prev) => new Set(prev).add(userId));
    };

    const handleUserOffline = (userId: string) => {
      console.log("User went offline:", userId);
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    };

    const handleMessageReceived = (message: any) => {
      console.log("New message received via socket:", message);

      // Optimistically update message list
      dispatch(
        messageApiSlice.util.updateQueryData(
          "getMessages",
          message.chat._id || message.chat,
          (draft) => {
            // Check if message already exists (avoid duplicates)
            const exists = draft.data.some((msg) => msg._id === message._id);
            if (!exists) {
              // Only add if it's not from current user OR if no existing message with same content/timestamp
              const isDuplicate = draft.data.some(
                (msg) =>
                  msg.content === message.content &&
                  msg.sender._id === message.sender._id &&
                  Math.abs(
                    new Date(msg.createdAt).getTime() -
                      new Date(message.createdAt).getTime()
                  ) < 5000 // Within 5 seconds
              );

              if (!isDuplicate) {
                draft.data.push(message);
              } else {
                console.log(
                  "Skipping duplicate message based on content/timestamp"
                );
              }
            }
          }
        ) as unknown as AnyAction
      );

      // Update chat list with last message
      dispatch(
        chatApiSlice.util.updateQueryData(
          "getUserChats",
          undefined,
          (draft: any) => {
            const chatId = message.chat._id || message.chat;
            const chatIndex = draft.data.findIndex(
              (chat: any) => chat._id === chatId
            );
            if (chatIndex !== -1) {
              draft.data[chatIndex].lastMessage = message;
              // Move chat to top
              const [chat] = draft.data.splice(chatIndex, 1);
              draft.data.unshift(chat);
            }
          }
        ) as unknown as AnyAction
      );
    };

    const handleChatListUpdate = (data: any) => {
      console.log("Chat list update:", data);

      // Re-fetch chat list to ensure it's up to date
      dispatch(
        chatApiSlice.util.invalidateTags(["Chat"]) as unknown as AnyAction
      );
    };

    const handleMessageDelivered = (data: {
      messageId: string;
      chatId: string;
      userId: string;
    }) => {
      console.log("Message delivered:", data);

      // Update message delivery status
      dispatch(
        messageApiSlice.util.updateQueryData(
          "getMessages",
          data.chatId,
          (draft) => {
            const message = draft.data.find(
              (msg) => msg._id === data.messageId
            );
            if (message) {
              message.sent = true;
            }
          }
        ) as unknown as AnyAction
      );
    };

    const handleMessageNotification = (message: any) => {
      console.log("Message notification received:", message);
    };

    const handleTyping = (data: {
      chatId: string;
      userId: string;
      userName: string;
    }) => {
      console.log(`User ${data.userName} is typing in chat ${data.chatId}`);
      setTypingUsers((prev) => {
        const newMap = new Map(prev);
        const chatTypers = newMap.get(data.chatId) || new Set();
        chatTypers.add(data.userId);
        newMap.set(data.chatId, chatTypers);
        return newMap;
      });
    };

    const handleStopTyping = (data: { chatId: string; userId: string }) => {
      console.log(`User ${data.userId} stopped typing in chat ${data.chatId}`);
      setTypingUsers((prev) => {
        const newMap = new Map(prev);
        const chatTypers = newMap.get(data.chatId);
        if (chatTypers) {
          chatTypers.delete(data.userId);
          if (chatTypers.size === 0) {
            newMap.delete(data.chatId);
          } else {
            newMap.set(data.chatId, chatTypers);
          }
        }
        return newMap;
      });
    };

    const handleMessageReadUpdate = (data: {
      messageId: string;
      userId: string;
      chatId: string;
    }) => {
      console.log("Message read update:", data);

      // Update message read status optimistically
      dispatch(
        messageApiSlice.util.updateQueryData(
          "getMessages",
          data.chatId,
          (draft) => {
            // Find message by ID first, then by other criteria if not found
            let message = draft.data.find((msg) => msg._id === data.messageId);

            // If not found by exact ID, try to find by content/timestamp (for optimistic updates)
            if (!message) {
              console.log(
                "Message not found by ID, searching for recent messages..."
              );
              // Find the most recent message that hasn't been read by this user
              message = draft.data
                .filter((msg) => !msg.readBy.includes(data.userId))
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )[0];
            }

            if (message && !message.readBy.includes(data.userId)) {
              message.readBy.push(data.userId);
              console.log(`Updated read status for message ${message._id}`);
            } else if (message) {
              console.log(
                `User ${data.userId} already read message ${message._id}`
              );
            } else {
              console.log(
                `Message ${data.messageId} not found in chat ${data.chatId}`
              );
            }
          }
        ) as unknown as AnyAction
      );

      // Also update the chat list if this was the last message
      dispatch(
        chatApiSlice.util.updateQueryData(
          "getUserChats",
          undefined,
          (draft: any) => {
            const chatIndex = draft.data.findIndex(
              (chat: any) => chat._id === data.chatId
            );
            if (
              chatIndex !== -1 &&
              draft.data[chatIndex].lastMessage?._id === data.messageId
            ) {
              if (
                !draft.data[chatIndex].lastMessage.readBy.includes(data.userId)
              ) {
                draft.data[chatIndex].lastMessage.readBy.push(data.userId);
              }
            }
          }
        ) as unknown as AnyAction
      );
    };

    currentSocket.on("connect", handleConnect);
    currentSocket.on("disconnect", handleDisconnect);
    currentSocket.on("user-online", handleUserOnline);
    currentSocket.on("user-offline", handleUserOffline);
    currentSocket.on("message-received", handleMessageReceived);
    currentSocket.on("message-delivered", handleMessageDelivered);
    currentSocket.on("chat-list-update", handleChatListUpdate);
    currentSocket.on("message-notification", handleMessageNotification);
    currentSocket.on("typing", handleTyping);
    currentSocket.on("stop-typing", handleStopTyping);
    currentSocket.on("message-read-update", handleMessageReadUpdate);

    return () => {
      currentSocket.off("connect", handleConnect);
      currentSocket.off("disconnect", handleDisconnect);
      currentSocket.off("user-online", handleUserOnline);
      currentSocket.off("user-offline", handleUserOffline);
      currentSocket.off("message-received", handleMessageReceived);
      currentSocket.off("message-delivered", handleMessageDelivered);
      currentSocket.off("chat-list-update", handleChatListUpdate);
      currentSocket.off("message-notification", handleMessageNotification);
      currentSocket.off("typing", handleTyping);
      currentSocket.off("stop-typing", handleStopTyping);
      currentSocket.off("message-read-update", handleMessageReadUpdate);
    };
  }, [token, dispatch, currentUser?._id]);

  const joinChat = (chatId: string) => {
    if (socketRef.current && online) {
      console.log("Joining chat:", chatId);
      socketRef.current.emit("join-chat", chatId);
    }
  };

  const leaveChat = (chatId: string) => {
    if (socketRef.current && online) {
      console.log("Leaving chat:", chatId);
      socketRef.current.emit("leave-chat", chatId);
    }
  };

  const emitTyping = (chatId: string) => {
    if (socketRef.current && online && currentUser) {
      socketRef.current.emit("typing", chatId, currentUser._id);
    }
  };

  const emitStopTyping = (chatId: string) => {
    if (socketRef.current && online) {
      socketRef.current.emit("stop-typing", chatId);
    }
  };

  const emitNewMessage = (message: any) => {
    if (socketRef.current && online) {
      console.log("Emitting new message:", message);
      socketRef.current.emit("new-message", message);
    }
  };

  const emitMessageRead = (messageId: string) => {
    if (socketRef.current && online && currentUser) {
      socketRef.current.emit("message-read", messageId, currentUser._id);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        online,
        onlineUsers,
        typingUsers,
        joinChat,
        leaveChat,
        emitTyping,
        emitStopTyping,
        emitNewMessage,
        emitMessageRead,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
