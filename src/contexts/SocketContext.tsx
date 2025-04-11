// /* eslint-disable @typescript-eslint/no-explicit-any */
// import {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
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

//   useEffect(() => {
//     // Initialize socket when token is available
//     if (token && !socket) {
//       const newSocket = io("http://localhost:5000", {
//         transports: ["websocket"],
//       });

//       setSocket(newSocket);

//       // Socket connect event
//       newSocket.on("connect", () => {
//         console.log("Socket connected");
//         setOnline(true);

//         // Setup user connection with token
//         if (token) {
//           newSocket.emit("setup", token);
//         }
//       });

//       // Socket disconnect event
//       newSocket.on("disconnect", () => {
//         console.log("Socket disconnected");
//         setOnline(false);
//       });

//       // Listen for online users
//       newSocket.on("user-online", (userId) => {
//         setOnlineUsers((prev) => new Set(prev).add(userId));
//       });

//       // Listen for offline users
//       newSocket.on("user-offline", (userId) => {
//         setOnlineUsers((prev) => {
//           const newSet = new Set(prev);
//           newSet.delete(userId);
//           return newSet;
//         });
//       });

//       // Cleanup on unmount
//       return () => {
//         newSocket.disconnect();
//         setSocket(null);
//       };
//     }

//     // If token is removed, disconnect socket
//     if (!token && socket) {
//       socket.disconnect();
//       setSocket(null);
//       setOnline(false);
//     }
//   }, [token, socket]);

//   // Function to join a chat room
//   const joinChat = (chatId: string) => {
//     if (socket && online) {
//       socket.emit("join-chat", chatId);
//     }
//   };

//   // Function to leave a chat room
//   const leaveChat = (chatId: string) => {
//     if (socket && online) {
//       socket.emit("leave-chat", chatId);
//     }
//   };

//   // Function to emit typing indicator
//   const emitTyping = (chatId: string) => {
//     if (socket && online && currentUser) {
//       socket.emit("typing", chatId, currentUser._id);
//     }
//   };

//   // Function to emit stop typing indicator
//   const emitStopTyping = (chatId: string) => {
//     if (socket && online) {
//       socket.emit("stop-typing", chatId);
//     }
//   };

//   // Function to emit new message
//   const emitNewMessage = (message: any) => {
//     if (socket && online) {
//       socket.emit("new-message", message);
//     }
//   };

//   // Function to emit message read
//   const emitMessageRead = (messageId: string) => {
//     if (socket && online && currentUser) {
//       socket.emit("message-read", messageId, currentUser._id);
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
import { useSelector } from "react-redux";
import { selectToken, selectCurrentUser } from "@/lib/features/auth/authSlice";

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

  // Initialize socket connection
  useEffect(() => {
    // Only initialize if we have a token and no socket yet
    if (token && !socketRef.current) {
      console.log("Initializing socket connection");

      const newSocket = io("http://localhost:5000", {
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
      setOnlineUsers((prev) => new Set(prev).add(userId));
    };

    const handleUserOffline = (userId: string) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    };

    // Set up event listeners
    currentSocket.on("connect", handleConnect);
    currentSocket.on("disconnect", handleDisconnect);
    currentSocket.on("user-online", handleUserOnline);
    currentSocket.on("user-offline", handleUserOffline);

    // Clean up event listeners
    return () => {
      currentSocket.off("connect", handleConnect);
      currentSocket.off("disconnect", handleDisconnect);
      currentSocket.off("user-online", handleUserOnline);
      currentSocket.off("user-offline", handleUserOffline);
    };
  }, [token]);

  // Function to join a chat room
  const joinChat = (chatId: string) => {
    if (socketRef.current && online) {
      socketRef.current.emit("join-chat", chatId);
    }
  };

  // Function to leave a chat room
  const leaveChat = (chatId: string) => {
    if (socketRef.current && online) {
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
