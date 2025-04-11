// 'use client';

// import { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { selectCurrentUser, logout } from '@/lib/features/auth/authSlice';
// import { useLogoutMutation } from '@/lib/features/auth/authApiSlice';
// import type { Chat, Message } from '@/lib/features/chat/chatApiSlice';
// import { useSocket } from '@/contexts/SocketContext';
// import { useToast } from '@/hooks/use-toast';

// import ChatList from '@/components/chat/chat-list';
// import ChatHeader from '@/components/chat/chat-header';
// import MessageList from '@/components/chat/message-list';
// import MessageInput from '@/components/chat/message-input';
// import UserSearch from '@/components/chat/user-search';
// import CreateGroup from '@/components/chat/create-group';
// import { Button } from '@/components/ui/button';
// import { LogOut } from 'lucide-react';

// export default function ChatLayout() {
//   const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
//   const [showUserSearch, setShowUserSearch] = useState(false);
//   const [showCreateGroup, setShowCreateGroup] = useState(false);
//   const [newSocketMessage, setNewSocketMessage] = useState<Message | undefined>(undefined);
//   const currentUser = useSelector(selectCurrentUser);
//   const { socket } = useSocket();
//   const [logoutApi] = useLogoutMutation();
//   const dispatch = useDispatch();
//   const { toast } = useToast();

//   // Listen for new messages via socket
//   useEffect(() => {
//     if (socket) {
//       socket.on('message-received', (message: Message) => {
//         // If chat is selected and matches the message's chat, add to state
//         if (selectedChat && message.chat._id === selectedChat._id) {
//           setNewSocketMessage(message);
//         } else {
//           // Otherwise show a notification
//           toast({
//             title: `New message from ${message.sender.name}`,
//             description: message.type === 'text'
//               ? message.content.substring(0, 30) + (message.content.length > 30 ? '...' : '')
//               : `Sent a ${message.type}`,
//           });
//         }
//       });

//       return () => {
//         socket.off('message-received');
//       };
//     }
//   }, [socket, selectedChat, toast]);

//   // Join chat room when a chat is selected
//   useEffect(() => {
//     if (selectedChat && socket) {
//       socket.emit('join-chat', selectedChat._id);
//     }
//   }, [selectedChat, socket]);

//   const handleSelectChat = (chat: Chat) => {
//     setSelectedChat(chat);
//     // Clear any socket message when changing chats
//     setNewSocketMessage(undefined);
//   };

//   const handleNewChatCreated = (chat: Chat) => {
//     setSelectedChat(chat);
//   };

//   const handleMessageSent = (message: Message) => {
//     // No need to do anything here as the message list will be updated via RTK Query
//     // and socket.io for real-time updates
//   };

//   const handleLogout = async () => {
//     try {
//       await logoutApi().unwrap();
//       dispatch(logout());
//     } catch (error) {
//       console.error('Logout failed:', error);
//       // If API call fails, log out anyway on the client side
//       dispatch(logout());
//     }
//   };

//   return (
//     <div className="w-full h-screen flex flex-col lg:flex-row overflow-hidden bg-white dark:bg-gray-950">
//       {/* Sidebar */}
//       <div className="w-full lg:w-1/3 xl:w-1/4 h-full flex flex-col border-r dark:border-gray-800">
//         <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-800">
//           <div className="flex items-center gap-2">
//             <h1 className="font-bold text-green-600">WhatsApp Clone</h1>
//           </div>
//           <Button variant="ghost" size="icon" onClick={handleLogout}>
//             <LogOut className="h-5 w-5" />
//           </Button>
//         </div>
//         <ChatList
//           onSelectChat={handleSelectChat}
//           selectedChat={selectedChat}
//           onNewChat={() => setShowUserSearch(true)}
//           onNewGroup={() => setShowCreateGroup(true)}
//         />
//       </div>

//       {/* Chat area */}
//       <div className="flex-1 h-full flex flex-col">
//         {selectedChat ? (
//           <>
//             <ChatHeader
//               chat={selectedChat}
//               onViewInfo={() => {
//                 // TODO: Implement chat info view
//                 toast({
//                   title: 'View info',
//                   description: 'Chat info functionality will be implemented in a future update',
//                 });
//               }}
//               onLeaveGroup={
//                 selectedChat.isGroupChat
//                   ? () => {
//                       toast({
//                         title: 'Leave group',
//                         description: 'Leave group functionality will be implemented in a future update',
//                       });
//                     }
//                   : undefined
//               }
//             />
//             <MessageList chatId={selectedChat._id} newMessage={newSocketMessage} />
//             <MessageInput chatId={selectedChat._id} onMessageSent={handleMessageSent} />
//           </>
//         ) : (
//           <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
//             <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
//               Welcome, {currentUser?.name}!
//             </h2>
//             <p className="text-gray-600 dark:text-gray-400 max-w-md">
//               Select a chat to start messaging or create a new one.
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Dialogs */}
//       <UserSearch
//         open={showUserSearch}
//         onClose={() => setShowUserSearch(false)}
//         onChatCreated={handleNewChatCreated}
//       />
//       <CreateGroup
//         open={showCreateGroup}
//         onClose={() => setShowCreateGroup(false)}
//         onGroupCreated={handleNewChatCreated}
//       />
//     </div>
//   );
// }

"use client";

import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentUser, logout } from "@/lib/features/auth/authSlice";
import { useLogoutMutation } from "@/lib/features/auth/authApiSlice";
import type { Chat, Message } from "@/lib/features/chat/chatApiSlice";
import { useSocket } from "@/contexts/SocketContext";
import { useToast } from "@/hooks/use-toast";

import ChatList from "@/components/chat/chat-list";
import ChatHeader from "@/components/chat/chat-header";
import MessageList from "@/components/chat/message-list";
import MessageInput from "@/components/chat/message-input";
import UserSearch from "@/components/chat/user-search";
import CreateGroup from "@/components/chat/create-group";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function ChatLayout() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newSocketMessage, setNewSocketMessage] = useState<Message | undefined>(
    undefined
  );
  const currentUser = useSelector(selectCurrentUser);
  const { socket, joinChat } = useSocket();
  const [logoutApi] = useLogoutMutation();
  const dispatch = useDispatch();
  const { toast } = useToast();

  // Handle message received event
  const handleMessageReceived = useCallback(
    (message: Message) => {
      if (selectedChat && message.chat._id === selectedChat._id) {
        setNewSocketMessage(message);
      } else {
        toast({
          title: `New message from ${message.sender.name}`,
          description:
            message.type === "text"
              ? message.content.substring(0, 30) +
                (message.content.length > 30 ? "..." : "")
              : `Sent a ${message.type}`,
        });
      }
    },
    [selectedChat, toast]
  );

  // Setup socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Remove any existing listener first to prevent duplicates
    socket.off("message-received");

    // Add new listener
    socket.on("message-received", handleMessageReceived);

    // Cleanup on unmount or when dependencies change
    return () => {
      socket.off("message-received");
    };
  }, [socket, handleMessageReceived]);

  // Join chat room when a chat is selected
  useEffect(() => {
    if (selectedChat && socket) {
      joinChat(selectedChat._id);
    }
  }, [selectedChat, socket, joinChat]);

  const handleSelectChat = useCallback((chat: Chat) => {
    setSelectedChat(chat);
    // Clear any socket message when changing chats
    setNewSocketMessage(undefined);
  }, []);

  const handleNewChatCreated = useCallback((chat: Chat) => {
    setSelectedChat(chat);
  }, []);

  const handleMessageSent = () => {
    // No need to do anything here as the message list will be updated via RTK Query
    // and socket.io for real-time updates
  };

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
      dispatch(logout());
    } catch (error) {
      console.error("Logout failed:", error);
      // If API call fails, log out anyway on the client side
      dispatch(logout());
    }
  };

  return (
    <div className="w-full h-screen flex flex-col lg:flex-row overflow-hidden bg-white dark:bg-gray-950">
      {/* Sidebar */}
      <div className="w-full lg:w-1/3 xl:w-1/4 h-full flex flex-col border-r dark:border-gray-800">
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-800">
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-green-600">WhatsApp Clone</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
        <ChatList
          onSelectChat={handleSelectChat}
          selectedChat={selectedChat}
          onNewChat={() => setShowUserSearch(true)}
          onNewGroup={() => setShowCreateGroup(true)}
        />
      </div>

      {/* Chat area */}
      <div className="flex-1 h-full flex flex-col">
        {selectedChat ? (
          <>
            <ChatHeader
              chat={selectedChat}
              onViewInfo={() => {
                toast({
                  title: "View info",
                  description:
                    "Chat info functionality will be implemented in a future update",
                });
              }}
              onLeaveGroup={
                selectedChat.isGroupChat
                  ? () => {
                      toast({
                        title: "Leave group",
                        description:
                          "Leave group functionality will be implemented in a future update",
                      });
                    }
                  : undefined
              }
            />
            <MessageList
              chatId={selectedChat._id}
              newMessage={newSocketMessage}
            />
            <MessageInput
              chatId={selectedChat._id}
              onMessageSent={handleMessageSent}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Welcome, {currentUser?.name}!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md">
              Select a chat to start messaging or create a new one.
            </p>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <UserSearch
        open={showUserSearch}
        onClose={() => setShowUserSearch(false)}
        onChatCreated={handleNewChatCreated}
      />
      <CreateGroup
        open={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onGroupCreated={handleNewChatCreated}
      />
    </div>
  );
}
