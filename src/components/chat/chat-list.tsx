"use client";

import { useCallback, useEffect, useState } from "react";
import { useGetUserChatsQuery } from "@/lib/features/chat/chatApiSlice";
import { type Chat, Message } from "@/lib/features/chat/chatApiSlice";
import type { User } from "@/lib/features/auth/authSlice";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/lib/features/auth/authSlice";
import { useSocket } from "@/contexts/SocketContext";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import ChatListItem from "./chat-list-item";
import { Button } from "@/components/ui/button";

interface ChatListProps {
  onSelectChat: (chat: Chat) => void;
  selectedChat?: Chat | null;
  onNewChat: () => void;
  onNewGroup: () => void;
}

export default function ChatList({
  onSelectChat,
  selectedChat,
  onNewChat,
  onNewGroup,
}: ChatListProps) {
  const { data, isLoading, error } = useGetUserChatsQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const currentUser = useSelector(selectCurrentUser);
  const { onlineUsers, socket } = useSocket();

  const getChatName = (chat: Chat, user?: User | null) => {
    if (chat.isGroupChat) {
      return chat.name;
    }
    const otherUser = chat.users.find((u) => u._id !== user?._id);
    return otherUser?.name || "Unknown User";
  };

  const filteredChats = data?.data
    ? data.data.filter((chat) => {
        const chatName = getChatName(chat, currentUser);
        return chatName.toLowerCase().includes(searchTerm.toLowerCase());
      })
    : [];

  const getChatAvatar = (chat: Chat, user?: User | null) => {
    if (chat.isGroupChat) {
      return chat.groupPicture;
    }
    const otherUser = chat.users.find((u) => u._id !== user?._id);
    return otherUser?.profilePicture;
  };

  const isUserOnline = (chat: Chat, user?: User | null) => {
    if (chat.isGroupChat) return false;
    const otherUser = chat.users.find((u) => u._id !== user?._id);
    return otherUser ? onlineUsers.has(otherUser._id) : false;
  };

  return (
    <div className="w-full h-full flex flex-col border-r dark:border-gray-800">
      <div className="p-3 border-b dark:border-gray-800">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            type="search"
            placeholder="Search chats"
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex space-x-2 mt-2">
          <Button
            onClick={onNewChat}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            New Chat
          </Button>
          <Button
            onClick={onNewGroup}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            New Group
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex justify-center items-center h-20">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        ) : error ? (
          <div className="text-center p-4 text-red-500">
            Failed to load chats
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="text-center p-4 text-gray-500">
            {searchTerm ? "No chats found" : "No chats yet"}
          </div>
        ) : (
          <div className="divide-y dark:divide-gray-800">
            {filteredChats.map((chat) => (
              <ChatListItem
                key={chat._id}
                chat={chat}
                isSelected={selectedChat?._id === chat._id}
                isOnline={isUserOnline(chat, currentUser)}
                name={getChatName(chat, currentUser)}
                avatar={getChatAvatar(chat, currentUser)}
                onClick={() => onSelectChat(chat)}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
