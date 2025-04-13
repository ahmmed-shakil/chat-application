"use client";

import type { Chat } from "@/lib/features/chat/chatApiSlice";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { CheckCheck } from "lucide-react";
import { selectCurrentUser } from "@/lib/features/auth/authSlice";
import { useSelector } from "react-redux";

interface ChatListItemProps {
  chat: Chat;
  isSelected: boolean;
  isOnline: boolean;
  name: string;
  avatar?: string;
  onClick: () => void;
}

export default function ChatListItem({
  chat,
  isSelected,
  isOnline,
  name,
  avatar,
  onClick,
}: ChatListItemProps) {
  // console.log("🚀 ~ chat:", chat?.lastMessage);
  // console.log("🚀 ~ chat:", chat);
  // Get the first letter of the name for the avatar fallback

  const currentUser = useSelector(selectCurrentUser);
  // console.log("🚀 ~ currentUser:", currentUser);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Format the timestamp
  const getFormattedTime = (timestamp?: string) => {
    if (!timestamp) return "";
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  return (
    <div
      className={cn(
        "p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors",
        isSelected && "bg-gray-100 dark:bg-gray-900"
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          <Avatar>
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="font-medium truncate">{name}</h3>
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {getFormattedTime(chat.updatedAt)}
            </span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <p
              className={`text-sm truncate  ${
                currentUser &&
                chat?.lastMessage?.readBy?.includes(currentUser._id)
                  ? "text-gray-500"
                  : "text-gray-700 font-semibold"
              }`}
            >
              {chat.lastMessage ? (
                <>
                  {chat.lastMessage.type !== "text" ? (
                    <span className="italic">
                      {chat.lastMessage.type.charAt(0).toUpperCase() +
                        chat.lastMessage.type.slice(1)}
                    </span>
                  ) : (
                    chat.lastMessage.content
                  )}
                </>
              ) : (
                <span className="italic">No messages yet</span>
              )}
            </p>
            {chat.lastMessage?.readBy.length === chat.users.length &&
              chat?.lastMessage?.sender?._id === currentUser?._id && (
                <CheckCheck className="h-4 w-4 text-blue-500" />
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
