/* eslint-disable @typescript-eslint/no-explicit-any */
// // /* eslint-disable @typescript-eslint/no-explicit-any */
// // import {
// //   createContext,
// //   useContext,
// //   useEffect,
// //   useState,
// //   type ReactNode,
// // } from "react";
// // import { io, type Socket } from "socket.io-client";
// // import { useSelector } from "react-redux";
// // import { selectToken, selectCurrentUser } from "@/lib/features/auth/authSlice";

// // interface SocketContextType {
// //   socket: Socket | null;
// //   online: boolean;
// //   onlineUsers: Set<string>;
// //   joinChat: (chatId: string) => void;
// //   leaveChat: (chatId: string) => void;
// //   emitTyping: (chatId: string) => void;
// //   emitStopTyping: (chatId: string) => void;
// //   emitNewMessage: (message: any) => void;
// //   emitMessageRead: (messageId: string) => void;
// // }

// // const SocketContext = createContext<SocketContextType>({
// //   socket: null,
// //   online: false,
// //   onlineUsers: new Set(),
// //   joinChat: () => {},
// //   leaveChat: () => {},
// //   emitTyping: () => {},
// //   emitStopTyping: () => {},
// //   emitNewMessage: () => {},
// //   emitMessageRead: () => {},
// // });

// // export const useSocket = () => useContext(SocketContext);

// // export const SocketProvider = ({ children }: { children: ReactNode }) => {
// //   const [socket, setSocket] = useState<Socket | null>(null);
// //   const [online, setOnline] = useState<boolean>(false);
// //   const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
// //   const token = useSelector(selectToken);
// //   const currentUser = useSelector(selectCurrentUser);

// //   useEffect(() => {
// //     // Initialize socket when token is available
// //     if (token && !socket) {
// //       const newSocket = io("http://localhost:5000", {
// //         transports: ["websocket"],
// //       });

// //       setSocket(newSocket);

// //       // Socket connect event
// //       newSocket.on("connect", () => {
// //         console.log("Socket connected");
// //         setOnline(true);

// //         // Setup user connection with token
// //         if (token) {
// //           newSocket.emit("setup", token);
// //         }
// //       });

// //       // Socket disconnect event
// //       newSocket.on("disconnect", () => {
// //         console.log("Socket disconnected");
// //         setOnline(false);
// //       });

// //       // Listen for online users
// //       newSocket.on("user-online", (userId) => {
// //         setOnlineUsers((prev) => new Set(prev).add(userId));
// //       });

// //       // Listen for offline users
// //       newSocket.on("user-offline", (userId) => {
// //         setOnlineUsers((prev) => {
// //           const newSet = new Set(prev);
// //           newSet.delete(userId);
// //           return newSet;
// //         });
// //       });

// //       // Cleanup on unmount
// //       return () => {
// //         newSocket.disconnect();
// //         setSocket(null);
// //       };
// //     }

// //     // If token is removed, disconnect socket
// //     if (!token && socket) {
// //       socket.disconnect();
// //       setSocket(null);
// //       setOnline(false);
// //     }
// //   }, [token, socket]);

// //   // Function to join a chat room
// //   const joinChat = (chatId: string) => {
// //     if (socket && online) {
// //       socket.emit("join-chat", chatId);
// //     }
// //   };

// //   // Function to leave a chat room
// //   const leaveChat = (chatId: string) => {
// //     if (socket && online) {
// //       socket.emit("leave-chat", chatId);
// //     }
// //   };

// //   // Function to emit typing indicator
// //   const emitTyping = (chatId: string) => {
// //     if (socket && online && currentUser) {
// //       socket.emit("typing", chatId, currentUser._id);
// //     }
// //   };

// //   // Function to emit stop typing indicator
// //   const emitStopTyping = (chatId: string) => {
// //     if (socket && online) {
// //       socket.emit("stop-typing", chatId);
// //     }
// //   };

// //   // Function to emit new message
// //   const emitNewMessage = (message: any) => {
// //     if (socket && online) {
// //       socket.emit("new-message", message);
// //     }
// //   };

// //   // Function to emit message read
// //   const emitMessageRead = (messageId: string) => {
// //     if (socket && online && currentUser) {
// //       socket.emit("message-read", messageId, currentUser._id);
// //     }
// //   };

// //   return (
// //     <SocketContext.Provider
// //       value={{
// //         socket,
// //         online,
// //         onlineUsers,
// //         joinChat,
// //         leaveChat,
// //         emitTyping,
// //         emitStopTyping,
// //         emitNewMessage,
// //         emitMessageRead,
// //       }}
// //     >
// //       {children}
// //     </SocketContext.Provider>
// //   );
// // };

// /* eslint-disable @typescript-eslint/no-explicit-any */
// import {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
//   useRef,
//   type ReactNode,
// } from "react";
// import { io, type Socket } from "socket.io-client";
// import { useSelector } from "react-redux";
// import { selectToken, selectCurrentUser } from "@/lib/features/auth/authSlice";

// interface SocketContextType {
//   socket: Socket | null;
//   online: boolean;
//   onlineUsers: Set<string>;
//   joinChat: (chatId: string) => void;
//   leaveChat: (chatId: string) => void;
//   emitTyping: (chatId: string) => void;
//   emitStopTyping: (chatId: string) => void;
//   emitNewMessage: (message: any) => void;
//   emitMessageRead: (messageId: string) => void;
// }

// const SocketContext = createContext<SocketContextType>({
//   socket: null,
//   online: false,
//   onlineUsers: new Set(),
//   joinChat: () => {},
//   leaveChat: () => {},
//   emitTyping: () => {},
//   emitStopTyping: () => {},
//   emitNewMessage: () => {},
//   emitMessageRead: () => {},
// });

// export const useSocket = () => useContext(SocketContext);

// export const SocketProvider = ({ children }: { children: ReactNode }) => {
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const [online, setOnline] = useState<boolean>(false);
//   const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
//   const token = useSelector(selectToken);
//   const currentUser = useSelector(selectCurrentUser);
//   const socketRef = useRef<Socket | null>(null);

//   // Initialize socket connection
//   useEffect(() => {
//     // Only initialize if we have a token and no socket yet
//     if (token && !socketRef.current) {
//       console.log("Initializing socket connection");

//       const newSocket = io("http://localhost:5000", {
//         transports: ["websocket"],
//       });

//       // Store in ref to avoid dependency cycle
//       socketRef.current = newSocket;
//       setSocket(newSocket);

//       // Clean up on unmount or token change
//       return () => {
//         console.log("Cleaning up socket connection");
//         if (socketRef.current) {
//           socketRef.current.disconnect();
//           socketRef.current = null;
//           setSocket(null);
//           setOnline(false);
//         }
//       };
//     }

//     // Disconnect if token is removed
//     if (!token && socketRef.current) {
//       console.log("Token removed, disconnecting socket");
//       socketRef.current.disconnect();
//       socketRef.current = null;
//       setSocket(null);
//       setOnline(false);
//     }
//   }, [token]);

//   // Setup socket event listeners
//   useEffect(() => {
//     const currentSocket = socketRef.current;

//     if (!currentSocket) return;

//     // Socket connect event
//     const handleConnect = () => {
//       console.log("Socket connected");
//       setOnline(true);

//       // Setup user connection with token
//       if (token) {
//         currentSocket.emit("setup", token);
//       }
//     };

//     // Socket disconnect event
//     const handleDisconnect = () => {
//       console.log("Socket disconnected");
//       setOnline(false);
//     };

//     // User online/offline events
//     const handleUserOnline = (userId: string) => {
//       setOnlineUsers((prev) => new Set(prev).add(userId));
//     };

//     const handleUserOffline = (userId: string) => {
//       setOnlineUsers((prev) => {
//         const newSet = new Set(prev);
//         newSet.delete(userId);
//         return newSet;
//       });
//     };

//     // Set up event listeners
//     currentSocket.on("connect", handleConnect);
//     currentSocket.on("disconnect", handleDisconnect);
//     currentSocket.on("user-online", handleUserOnline);
//     currentSocket.on("user-offline", handleUserOffline);

//     // Clean up event listeners
//     return () => {
//       currentSocket.off("connect", handleConnect);
//       currentSocket.off("disconnect", handleDisconnect);
//       currentSocket.off("user-online", handleUserOnline);
//       currentSocket.off("user-offline", handleUserOffline);
//     };
//   }, [token]);

//   // Function to join a chat room
//   const joinChat = (chatId: string) => {
//     if (socketRef.current && online) {
//       socketRef.current.emit("join-chat", chatId);
//     }
//   };

//   // Function to leave a chat room
//   const leaveChat = (chatId: string) => {
//     if (socketRef.current && online) {
//       socketRef.current.emit("leave-chat", chatId);
//     }
//   };

//   // Function to emit typing indicator
//   const emitTyping = (chatId: string) => {
//     if (socketRef.current && online && currentUser) {
//       socketRef.current.emit("typing", chatId, currentUser._id);
//     }
//   };

//   // Function to emit stop typing indicator
//   const emitStopTyping = (chatId: string) => {
//     if (socketRef.current && online) {
//       socketRef.current.emit("stop-typing", chatId);
//     }
//   };

//   // Function to emit new message
//   const emitNewMessage = (message: any) => {
//     if (socketRef.current && online) {
//       socketRef.current.emit("new-message", message);
//     }
//   };

//   // Function to emit message read
//   const emitMessageRead = (messageId: string) => {
//     if (socketRef.current && online && currentUser) {
//       socketRef.current.emit("message-read", messageId, currentUser._id);
//     }
//   };

//   return (
//     <SocketContext.Provider
//       value={{
//         socket,
//         online,
//         onlineUsers,
//         joinChat,
//         leaveChat,
//         emitTyping,
//         emitStopTyping,
//         emitNewMessage,
//         emitMessageRead,
//       }}
//     >
//       {children}
//     </SocketContext.Provider>
//   );
// };

// 2222

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
  const token = useSelector(selectToken);
  const currentUser = useSelector(selectCurrentUser);
  const socketRef = useRef<Socket | null>(null);
  const dispatch = useDispatch();

  // Initialize socket connection
  useEffect(() => {
    // Only initialize if we have a token and no socket yet
    if (token && !socketRef.current) {
      console.log("Initializing socket connection");

      const newSocket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}`, {
        transports: ["websocket"],
      });

      // Store in ref to avoid dependency cycle
      socketRef.current = newSocket;
      setSocket(newSocket);

      // Clean up on unmount or token change
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

    // Disconnect if token is removed
    if (!token && socketRef.current) {
      console.log("Token removed, disconnecting socket");
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setOnline(false);
    }
  }, [token]);

  // Setup socket event listeners
  useEffect(() => {
    const currentSocket = socketRef.current;

    if (!currentSocket) return;

    // Socket connect event
    const handleConnect = () => {
      console.log("Socket connected");
      setOnline(true);

      // Setup user connection with token
      if (token) {
        currentSocket.emit("setup", token);
      }
    };

    // Socket disconnect event
    const handleDisconnect = () => {
      console.log("Socket disconnected");
      setOnline(false);
    };

    // User online/offline events
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

    // Handle incoming messages event
    // const handleMessageReceived = (message: any) => {
    //   console.log("New message received via socket:", message);

    //   // Instead of trying to directly update the cache, we'll use invalidation
    //   // which is more reliable with TypeScript
    //   dispatch(chatApiSlice.util.invalidateTags(["Chat"]));
    //   dispatch(messageApiSlice.util.invalidateTags(["Message"]));

    //   // Additionally, we can dispatch an action to update the UI immediately
    //   // This approach works around TypeScript issues with updateQueryData
    //   if (message && message.chat && message.chat._id) {
    //     // Create a custom action to handle the new message in your reducer
    //     // or simply rely on the invalidation to trigger a refetch
    //     console.log("Triggering refetch for chat:", message.chat._id);
    //   }
    // };
    const handleMessageReceived = (message: any) => {
      console.log("New message received via socket:", message);

      // This event will be used by the ChatLayout component
      // to display new messages in the current chat

      // Invalidate message cache to ensure new messages are loaded
      dispatch(messageApiSlice.util.invalidateTags(["Message"]));
    };

    // Handle chat list updates (for chat list refresh)
    const handleChatListUpdate = (message: any) => {
      console.log("Chat list update received:", message);

      // This event will be used by the ChatList component
      // to refresh the chat list when new messages arrive

      // Invalidate chat cache to ensure chat list is updated
      dispatch(chatApiSlice.util.invalidateTags(["Chat"]));
    };

    // Handle message notifications (for toast notifications)
    const handleMessageNotification = (message: any) => {
      console.log("Message notification received:", message);

      // This event is for showing notifications when messages
      // arrive in chats other than the current one

      // You can dispatch an action to show a notification
      // or use your toast directly here if needed
    };

    // Handle typing events
    const handleTyping = (chatId: string, userId: string) => {
      console.log(`User ${userId} is typing in chat ${chatId}`);
      // Handle typing indicator in your UI
    };

    const handleStopTyping = (chatId: string) => {
      // console.log(`Typing stopped in chat ${chatId}`);
      // Handle stop typing in your UI
    };

    // Handle message read updates
    const handleMessageReadUpdate = (messageId: string, userId: string) => {
      // console.log(`Message ${messageId} marked as read by ${userId}`);

      // Use invalidation for message updates
      dispatch(messageApiSlice.util.invalidateTags(["Message"]));
      dispatch(chatApiSlice.util.invalidateTags(["Chat"]));
    };

    // Set up event listeners
    currentSocket.on("connect", handleConnect);
    currentSocket.on("disconnect", handleDisconnect);
    currentSocket.on("user-online", handleUserOnline);
    currentSocket.on("user-offline", handleUserOffline);
    currentSocket.on("message-received", handleMessageReceived);
    currentSocket.on("chat-list-update", handleChatListUpdate);
    currentSocket.on("message-notification", handleMessageNotification);
    currentSocket.on("typing", handleTyping);
    currentSocket.on("stop-typing", handleStopTyping);
    currentSocket.on("message-read-update", handleMessageReadUpdate);

    // Clean up event listeners
    return () => {
      currentSocket.off("connect", handleConnect);
      currentSocket.off("disconnect", handleDisconnect);
      currentSocket.off("user-online", handleUserOnline);
      currentSocket.off("user-offline", handleUserOffline);
      currentSocket.off("message-received", handleMessageReceived);
      currentSocket.off("chat-list-update", handleChatListUpdate);
      currentSocket.off("message-notification", handleMessageNotification);
      currentSocket.off("typing", handleTyping);
      currentSocket.off("stop-typing", handleStopTyping);
      currentSocket.off("message-read-update", handleMessageReadUpdate);
    };
  }, [token, dispatch]);

  // Function to join a chat room
  const joinChat = (chatId: string) => {
    if (socketRef.current && online) {
      console.log("Joining chat:", chatId);
      socketRef.current.emit("join-chat", chatId);
    }
  };

  // Function to leave a chat room
  const leaveChat = (chatId: string) => {
    if (socketRef.current && online) {
      console.log("Leaving chat:", chatId);
      socketRef.current.emit("leave-chat", chatId);
    }
  };

  // Function to emit typing indicator
  const emitTyping = (chatId: string) => {
    if (socketRef.current && online && currentUser) {
      socketRef.current.emit("typing", chatId, currentUser._id);
    }
  };

  // Function to emit stop typing indicator
  const emitStopTyping = (chatId: string) => {
    if (socketRef.current && online) {
      socketRef.current.emit("stop-typing", chatId);
    }
  };

  // Function to emit new message
  const emitNewMessage = (message: any) => {
    if (socketRef.current && online) {
      console.log("Emitting new message:", message);
      socketRef.current.emit("new-message", message);
    }
  };

  // Function to emit message read
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
