"use client";

import type { Chat } from "@/lib/features/chat/chatApiSlice";
import type { User } from "@/lib/features/auth/authSlice";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/lib/features/auth/authSlice";
import { useSocket } from "@/contexts/SocketContext";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreVertical, Phone, Video } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatHeaderProps {
  chat: Chat;
  onViewInfo: () => void;
  onLeaveGroup?: () => void;
}

export default function ChatHeader({
  chat,
  onViewInfo,
  onLeaveGroup,
}: ChatHeaderProps) {
  const currentUser = useSelector(selectCurrentUser);
  const { onlineUsers } = useSocket();

  const getChatName = (chat: Chat, user?: User | null) => {
    if (chat.isGroupChat) {
      return chat.name;
    }
    const otherUser = chat.users.find((u) => u._id !== user?._id);
    return otherUser?.name || "Unknown User";
  };

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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const name = getChatName(chat, currentUser);
  const avatar = getChatAvatar(chat, currentUser);
  const isOnline = isUserOnline(chat, currentUser);

  return (
    <div className="flex items-center justify-between p-3 border-b dark:border-gray-800">
      <div className="flex items-center gap-3" onClick={onViewInfo}>
        <div className="relative cursor-pointer">
          <Avatar>
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></span>
          )}
        </div>
        <div>
          <h2 className="font-medium">{name}</h2>
          <p className="text-xs text-gray-500">
            {isOnline
              ? "Online"
              : chat.isGroupChat
              ? `${chat.users.length} members`
              : "Offline"}
          </p>
        </div>
      </div>
      <div className="flex items-center">
        <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800">
          <Phone className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800">
          <Video className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800">
            <MoreVertical className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={onViewInfo}>View Info</DropdownMenuItem>
            <DropdownMenuSeparator />
            {chat.isGroupChat && onLeaveGroup && (
              <DropdownMenuItem onClick={onLeaveGroup} className="text-red-500">
                Leave Group
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
