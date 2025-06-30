/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type { Message } from "@/lib/features/chat/chatApiSlice";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Check,
  CheckCheck,
  Download,
  FileText,
  Image,
  Mic,
  Video,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MessageItemProps {
  message: Message;
  isOwnMessage: boolean;
  chat: any;
}

export default function MessageItem({
  message,
  isOwnMessage,
  chat,
}: MessageItemProps) {
  console.log("🚀 ~ message:", message);

  // Get the file URL - handle both Cloudinary URLs and local paths
  const getFileUrl = (content: string) => {
    // If content starts with http, it's already a full URL (Cloudinary)
    if (content.startsWith("http")) {
      return content;
    }
    // Otherwise, it's a local path, prepend backend URL
    return `${process.env.NEXT_PUBLIC_BACKEND_URL}${content}`;
  };

  // Format the timestamp
  const getFormattedTime = (timestamp: string) => {
    return format(new Date(timestamp), "p"); // 'p' is the time format (e.g., 12:00 PM)
  };

  // Get status indicator component
  const getStatusIndicator = () => {
    if (!isOwnMessage) return null;

    // Determine the message status
    const allUsersCount = chat?.users?.length || 0;
    const readByCount = message.readBy.length;

    // If read by all users, show blue double tick
    if (readByCount === allUsersCount) {
      return <CheckCheck className="h-3 w-3 text-blue-500" />;
    }

    // If delivered but not read by all, show gray double tick
    if (message?.delivered) {
      return <CheckCheck className="h-3 w-3 text-gray-500" />;
    }

    // If only sent but not delivered, show single tick
    if (message?.sent) {
      return <Check className="h-3 w-3 text-gray-500" />;
    }

    // If not sent yet, show nothing
    return null;
  };

  // Get the message content based on type
  const getMessageContent = () => {
    switch (message.type) {
      case "image":
        return (
          <div className="relative max-w-xs overflow-hidden rounded-lg">
            {message.isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 rounded-lg">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
            )}
            <img
              src={getFileUrl(message.content)}
              alt="Image"
              className={cn("w-full h-auto", message.isUploading && "blur-sm")}
              onError={(e) => {
                // Fallback if image fails to load
                console.error("Failed to load image:", message.content);
              }}
            />
            <div className="absolute bottom-0 right-0 p-1 text-xs text-white bg-black bg-opacity-50 rounded flex items-center gap-1">
              {getFormattedTime(message.createdAt)}
              {getStatusIndicator()}
            </div>
          </div>
        );
      case "audio":
        return (
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg relative">
            {message.isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 rounded-lg">
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              </div>
            )}
            <Mic className="h-8 w-8 text-blue-500" />
            <div className="flex-1">
              <p className="text-sm">Audio message</p>
              {!message.isUploading && (
                <audio controls className="w-full mt-1">
                  <source src={getFileUrl(message.content)} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              )}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">
                {getFormattedTime(message.createdAt)}
              </span>
              {getStatusIndicator()}
            </div>
          </div>
        );
      case "video":
        return (
          <div className="relative max-w-xs overflow-hidden rounded-lg">
            {message.isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 rounded-lg">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
            )}
            <video
              src={getFileUrl(message.content)}
              controls={!message.isUploading}
              className={cn("w-full h-auto", message.isUploading && "blur-sm")}
            />
            <div className="absolute bottom-0 right-0 p-1 text-xs text-white bg-black bg-opacity-50 rounded flex items-center gap-1">
              {getFormattedTime(message.createdAt)}
              {getStatusIndicator()}
            </div>
          </div>
        );
      case "file":
        return (
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg relative">
            {message.isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 rounded-lg">
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              </div>
            )}
            <FileText className="h-8 w-8 text-blue-500" />
            <div className="flex-1">
              <p className="text-sm truncate">
                {/* Extract filename from URL or path */}
                {message.content.split("/").pop()?.split("?")[0] ||
                  "Unknown file"}
              </p>
              {!message.isUploading && (
                <a
                  href={getFileUrl(message.content)}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 flex items-center gap-1 mt-1"
                >
                  <Download className="h-3 w-3" /> Download
                </a>
              )}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">
                {getFormattedTime(message.createdAt)}
              </span>
              {getStatusIndicator()}
            </div>
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
              {getStatusIndicator()}
            </div>
          </div>
        );
    }
  };

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
