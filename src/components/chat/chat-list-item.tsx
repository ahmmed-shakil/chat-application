"use client";

import type { Chat } from "@/lib/features/chat/chatApiSlice";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Check, CheckCheck } from "lucide-react";
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
  const currentUser = useSelector(selectCurrentUser);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

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
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-medium truncate pr-2">{name}</h3>
            <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
              {getFormattedTime(chat.updatedAt)}
            </span>
          </div>
          <div className="flex items-start gap-2">
            {/* Message content with proper wrapping */}
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm leading-tight break-words ${
                  currentUser &&
                  chat?.lastMessage?.readBy?.includes(currentUser._id)
                    ? "text-gray-500"
                    : "text-gray-700 font-semibold"
                }`}
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  wordBreak: "break-word",
                }}
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
            </div>
            {/* Status icons - always visible */}
            <div className="flex-shrink-0 flex items-center">
              {chat.lastMessage?.sender?._id === currentUser?._id && (
                <>
                  {chat.lastMessage?.readBy.length === chat.users.length ? (
                    <CheckCheck className="h-4 w-4 text-blue-500" />
                  ) : (
                    <Check className="h-4 w-4 text-gray-500" />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
