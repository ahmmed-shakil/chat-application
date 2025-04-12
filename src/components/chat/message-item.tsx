"use client";

import type { Message } from "@/lib/features/chat/chatApiSlice";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  CheckCheck,
  Download,
  FileText,
  Image,
  Mic,
  Video,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MessageItemProps {
  message: Message;
  isOwnMessage: boolean;
}

export default function MessageItem({
  message,
  isOwnMessage,
}: MessageItemProps) {
  // Format the timestamp
  const getFormattedTime = (timestamp: string) => {
    return format(new Date(timestamp), "p"); // 'p' is the time format (e.g., 12:00 PM)
  };

  // Get the message content based on type
  const getMessageContent = () => {
    switch (message.type) {
      case "image":
        return (
          <div className="relative max-w-xs overflow-hidden rounded-lg">
            <img
              src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${message.content}`}
              alt="Image"
              className="w-full h-auto"
            />
            <div className="absolute bottom-0 right-0 p-1 text-xs text-white bg-black bg-opacity-50 rounded">
              {getFormattedTime(message.createdAt)}
            </div>
          </div>
        );
      case "audio":
        return (
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
            <Mic className="h-8 w-8 text-blue-500" />
            <div className="flex-1">
              <p className="text-sm">Audio message</p>
              <audio controls className="w-full mt-1">
                <source
                  src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${message.content}`}
                  type="audio/mpeg"
                />
                Your browser does not support the audio element.
              </audio>
            </div>
            <span className="text-xs text-gray-500">
              {getFormattedTime(message.createdAt)}
            </span>
          </div>
        );
      case "video":
        return (
          <div className="relative max-w-xs overflow-hidden rounded-lg">
            <video
              src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${message.content}`}
              controls
              className="w-full h-auto"
            />
            <div className="absolute bottom-0 right-0 p-1 text-xs text-white bg-black bg-opacity-50 rounded">
              {getFormattedTime(message.createdAt)}
            </div>
          </div>
        );
      case "file":
        return (
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
            <FileText className="h-8 w-8 text-blue-500" />
            <div className="flex-1">
              <p className="text-sm truncate">
                {message.content.split("/").pop()}
              </p>
              <a
                href={`${process.env.NEXT_PUBLIC_BACKEND_URL}${message.content}`}
                download
                className="text-xs text-blue-500 flex items-center gap-1 mt-1"
              >
                <Download className="h-3 w-3" /> Download
              </a>
            </div>
            <span className="text-xs text-gray-500">
              {getFormattedTime(message.createdAt)}
            </span>
          </div>
        );
      default:
        return (
          <div
            className={cn(
              "p-3 rounded-lg max-w-xs relative",
              isOwnMessage
                ? "bg-green-100 dark:bg-green-900 text-gray-800 dark:text-gray-100"
                : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border dark:border-gray-700"
            )}
          >
            <p className="break-words">{message.content}</p>
            <div className="text-xs text-gray-500 mt-1 flex items-center justify-end gap-1">
              {getFormattedTime(message.createdAt)}
              {isOwnMessage && message.readBy.length > 1 && (
                <CheckCheck className="h-3 w-3 text-blue-500" />
              )}
            </div>
          </div>
        );
    }
  };

  // If it's a group chat and not our message, show sender name and avatar
  const showSender = !isOwnMessage && message.chat.isGroupChat;

  return (
    <div className={cn("flex", isOwnMessage ? "justify-end" : "justify-start")}>
      <div className="flex items-end gap-2 max-w-[80%]">
        {showSender && (
          <Avatar className="w-6 h-6">
            <AvatarImage
              src={message.sender.profilePicture}
              alt={message.sender.name}
            />
            <AvatarFallback>
              {message.sender.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
        <div>
          {showSender && (
            <p className="text-xs text-gray-500 mb-1">{message.sender.name}</p>
          )}
          {getMessageContent()}
        </div>
      </div>
    </div>
  );
}
