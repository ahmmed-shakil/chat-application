"use client";

import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentUser, logout } from "@/lib/features/auth/authSlice";
import { useLogoutMutation } from "@/lib/features/auth/authApiSlice";
import type { Chat } from "@/lib/features/chat/chatApiSlice";
import { useSocket } from "@/contexts/SocketContext";
import { useToast } from "@/hooks/use-toast";

import ChatList from "@/components/chat/chat-list";
import ChatHeader from "@/components/chat/chat-header";
import MessageList from "@/components/chat/message-list";
import MessageInput from "@/components/chat/message-input";
import UserSearch from "@/components/chat/user-search";
import CreateGroup from "@/components/chat/create-group";
import { Button } from "@/components/ui/button";
import { LogOut, ArrowLeft } from "lucide-react";

export default function ChatLayout() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const currentUser = useSelector(selectCurrentUser);
  const { socket, joinChat } = useSocket();
  const [logoutApi] = useLogoutMutation();
  const dispatch = useDispatch();
  const { toast } = useToast();

  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 1024); // 1024px is the lg breakpoint
    };
    checkMobileView();

    window.addEventListener("resize", checkMobileView);

    return () => window.removeEventListener("resize", checkMobileView);
  }, []);

  useEffect(() => {
    if (selectedChat && socket) {
      joinChat(selectedChat._id);
    }
  }, [selectedChat, socket, joinChat]);

  const handleSelectChat = useCallback(
    (chat: Chat) => {
      setSelectedChat(chat);
      if (isMobileView) {
        setShowChatOnMobile(true);
      }
    },
    [isMobileView]
  );

  const handleBackToList = () => {
    setShowChatOnMobile(false);
  };

  const handleNewChatCreated = useCallback(
    (chat: Chat) => {
      setSelectedChat(chat);
      if (isMobileView) {
        setShowChatOnMobile(true);
      }
    },
    [isMobileView]
  );

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
      dispatch(logout());
    } catch (error) {
      console.error("Logout failed:", error);
      dispatch(logout());
    }
  };

  const showListView = !isMobileView || (isMobileView && !showChatOnMobile);
  const showChatView = !isMobileView || (isMobileView && showChatOnMobile);

  return (
    <div className="w-full h-screen flex flex-col lg:flex-row overflow-hidden bg-white dark:bg-gray-950">
      {showListView && (
        <div
          className={`${
            isMobileView ? "w-full" : "w-full lg:w-1/3 xl:w-1/4"
          } h-full flex flex-col border-r dark:border-gray-800`}
        >
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-800">
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-green-600">BlinkChat</h1>
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
      )}

      {showChatView && (
        <div
          className={`${
            isMobileView ? "w-full" : "flex-1"
          } h-full flex flex-col`}
        >
          {selectedChat ? (
            <>
              {/* Fixed Chat Header */}
              <div className="sticky top-0 z-10 flex items-center bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-800 shadow-sm">
                {isMobileView && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="mr-1"
                    onClick={handleBackToList}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                )}
                <div className="flex-1">
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
                </div>
              </div>
              {/* Scrollable Messages Area */}
              <div className="flex-1 flex flex-col min-h-0">
                <MessageList chatId={selectedChat._id} chat={selectedChat} />
              </div>
              {/* Fixed Message Input */}
              <div className="sticky bottom-0 bg-white dark:bg-gray-950 border-t dark:border-gray-800">
                <MessageInput
                  chatId={selectedChat._id}
                  onMessageSent={() => {}} // No longer needed with optimistic updates
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Welcome, {currentUser?.name}!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-md">
                Select a chat to start messaging or create a new one.
              </p>
              {isMobileView && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={handleBackToList}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Chats
                </Button>
              )}
            </div>
          )}
        </div>
      )}

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
