/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/lib/features/auth/authSlice";
import { useGetMessagesQuery } from "@/lib/features/message/messageApiSlice";
import type { Message } from "@/lib/features/chat/chatApiSlice";
import { useSocket } from "@/contexts/SocketContext";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import MessageItem from "./message-item";
import TypingIndicator from "./typing-indicator";

interface MessageListProps {
  chatId: string;
  chat: any;
}

export default function MessageList({ chatId, chat }: MessageListProps) {
  const currentUser = useSelector(selectCurrentUser);
  const { data, isLoading, isError } = useGetMessagesQuery(chatId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { emitMessageRead } = useSocket();

  useEffect(() => {
    scrollToBottom();
  }, [data]);

  // Emit message read events for unread messages
  useEffect(() => {
    if (data?.data && currentUser) {
      data.data.forEach((message) => {
        // Only mark as read if:
        // 1. Message is not from current user
        // 2. Current user hasn't read it yet
        if (
          message.sender._id !== currentUser._id &&
          !message.readBy.includes(currentUser._id)
        ) {
          emitMessageRead(message._id);
        }
      });
    }
  }, [data, currentUser, emitMessageRead]);

  // Clean up duplicate messages (safeguard)
  useEffect(() => {
    if (data?.data && Array.isArray(data.data)) {
      const uniqueMessages = data.data.filter((message, index, array) => {
        // Keep message if it's the first occurrence of this ID
        const firstIndex = array.findIndex((m) => m._id === message._id);
        if (firstIndex !== index) {
          console.log(`Removing duplicate message: ${message._id}`);
          return false;
        }
        return true;
      });

      // If we found duplicates, we could dispatch an action to clean them up
      // For now, we'll just log them
      if (uniqueMessages.length !== data.data.length) {
        console.log(
          `Found ${data.data.length - uniqueMessages.length} duplicate messages`
        );
      }
    }
  }, [data]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const messages = data?.data || [];

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : isError ? (
          <div className="text-center p-4 text-red-500">
            Failed to load messages
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center p-4 text-gray-500">
            <p>No messages yet</p>
            <p className="text-sm">Start a conversation</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageItem
                key={message._id}
                message={message}
                isOwnMessage={message.sender._id === currentUser?._id}
                chat={chat}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>
      <div className="p-2 border-t dark:border-gray-800">
        <TypingIndicator chatId={chatId} chat={chat} />
      </div>
    </div>
  );
}
