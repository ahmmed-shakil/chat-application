"use client";

import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/lib/features/auth/authSlice";
import { useSocket } from "@/contexts/SocketContext";
import type { Chat } from "@/lib/features/chat/chatApiSlice";

interface TypingIndicatorProps {
  chatId: string;
  chat: Chat;
}

export default function TypingIndicator({
  chatId,
  chat,
}: TypingIndicatorProps) {
  const { typingUsers } = useSocket();
  const currentUser = useSelector(selectCurrentUser);

  const chatTypers = typingUsers.get(chatId);
  const typingUserIds = chatTypers
    ? Array.from(chatTypers).filter((id) => id !== currentUser?._id)
    : [];

  if (typingUserIds.length === 0) return null;

  const getTypingUserNames = () => {
    const typingNames = typingUserIds
      .map((userId) => {
        const user = chat.users.find((u) => u._id === userId);
        return user?.name || "Someone";
      })
      .slice(0, 3); // Show max 3 names

    if (typingNames.length === 1) {
      return `${typingNames[0]} is typing`;
    } else if (typingNames.length === 2) {
      return `${typingNames[0]} and ${typingNames[1]} are typing`;
    } else if (typingNames.length === 3) {
      return `${typingNames[0]}, ${typingNames[1]} and ${typingNames[2]} are typing`;
    } else {
      return `${typingNames[0]}, ${typingNames[1]} and ${
        typingUserIds.length - 2
      } others are typing`;
    }
  };

  return (
    <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 border-t dark:border-gray-800">
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
        <span className="italic">{getTypingUserNames()}...</span>
      </div>
    </div>
  );
}
