'use client';

import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/lib/features/auth/authSlice';
import { useGetMessagesQuery } from '@/lib/features/message/messageApiSlice';
import type { Message } from '@/lib/features/chat/chatApiSlice';
import { cn } from '@/lib/utils';
import { useSocket } from '@/contexts/SocketContext';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import MessageItem from './message-item';

interface MessageListProps {
  chatId: string;
  newMessage?: Message;
}

export default function MessageList({ chatId, newMessage }: MessageListProps) {
  const currentUser = useSelector(selectCurrentUser);
  const { data, isLoading, isError } = useGetMessagesQuery(chatId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { emitMessageRead } = useSocket();

  useEffect(() => {
    scrollToBottom();
  }, [data, newMessage]);

  // Mark messages as read
  useEffect(() => {
    if (data?.data && currentUser) {
      data.data.forEach((message) => {
        const hasRead = message.readBy.some((user) => user._id === currentUser._id);
        if (!hasRead) {
          emitMessageRead(message._id);
        }
      });
    }
  }, [data, currentUser, emitMessageRead]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Combine fetched messages with new socket message if any
  const allMessages = newMessage
    ? [...(data?.data || []), newMessage].filter(
        (v, i, a) => a.findIndex((t) => t._id === v._id) === i
      )
    : data?.data || [];

  return (
    <ScrollArea className="flex-1 p-4">
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : isError ? (
        <div className="text-center p-4 text-red-500">Failed to load messages</div>
      ) : allMessages.length === 0 ? (
        <div className="text-center p-4 text-gray-500">
          <p>No messages yet</p>
          <p className="text-sm">Start a conversation</p>
        </div>
      ) : (
        <div className="space-y-4">
          {allMessages.map((message) => (
            <MessageItem
              key={message._id}
              message={message}
              isOwnMessage={message.sender._id === currentUser?._id}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}
    </ScrollArea>
  );
}
