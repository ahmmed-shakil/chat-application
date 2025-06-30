/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
import {
  useSendMessageMutation,
  useUploadFileMutation,
} from "@/lib/features/message/messageApiSlice";
import { useSocket } from "@/contexts/SocketContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import {
  Paperclip,
  Send,
  Mic,
  Image,
  FileText,
  Video,
  X,
  Loader2,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MessageInputProps {
  chatId: string;
  onMessageSent: (message: any) => void;
}

export default function MessageInput({
  chatId,
  onMessageSent,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<string>("");
  const [sendMessage, { isLoading: isSendingText }] = useSendMessageMutation();
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
  const { emitTyping, emitStopTyping, emitNewMessage } = useSocket();
  const { toast } = useToast();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (message && !isTyping) {
      setIsTyping(true);
      emitTyping(chatId);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        emitStopTyping(chatId);
      }
    }, 3000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, isTyping, chatId, emitTyping, emitStopTyping]);

  // Handle text message submission
  const handleSendMessage = async () => {
    if (!message.trim() && !selectedFile) return;

    try {
      if (selectedFile) {
        await uploadFile({
          chatId,
          file: selectedFile,
          type: fileType,
        }).unwrap();

        setSelectedFile(null);
        setFileType("");
      } else {
        await sendMessage({
          chatId,
          content: message.trim(),
        }).unwrap();

        setMessage("");
      }

      // Stop typing when message is sent
      if (isTyping) {
        setIsTyping(false);
        emitStopTyping(chatId);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again.",
      });
    }
  };

  // Handle file selection
  const handleFileSelect = (type: string) => {
    setFileType(type);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
    setShowAttachments(false);
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Handle enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="p-3 border-t dark:border-gray-800">
      {selectedFile && (
        <div className="mb-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            {fileType === "image" && (
              <Image className="h-5 w-5 text-blue-500" />
            )}
            {fileType === "video" && (
              <Video className="h-5 w-5 text-blue-500" />
            )}
            {fileType === "audio" && <Mic className="h-5 w-5 text-blue-500" />}
            {fileType === "file" && (
              <FileText className="h-5 w-5 text-blue-500" />
            )}
            <span className="text-sm truncate">{selectedFile.name}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedFile(null)}
            className="h-8 w-8 p-0 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <Popover open={showAttachments} onOpenChange={setShowAttachments}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full"
            >
              <Paperclip className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2" align="start" side="top">
            <div className="grid grid-cols-2 gap-2">
              <button
                className="flex flex-col items-center p-2 gap-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => handleFileSelect("image")}
              >
                <Image className="h-6 w-6 text-blue-500" />
                <span className="text-xs">Image</span>
              </button>
              <button
                className="flex flex-col items-center p-2 gap-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => handleFileSelect("video")}
              >
                <Video className="h-6 w-6 text-purple-500" />
                <span className="text-xs">Video</span>
              </button>
              <button
                className="flex flex-col items-center p-2 gap-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => handleFileSelect("audio")}
              >
                <Mic className="h-6 w-6 text-red-500" />
                <span className="text-xs">Audio</span>
              </button>
              <button
                className="flex flex-col items-center p-2 gap-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => handleFileSelect("file")}
              >
                <FileText className="h-6 w-6 text-green-500" />
                <span className="text-xs">Document</span>
              </button>
            </div>
          </PopoverContent>
        </Popover>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          accept={
            fileType === "image"
              ? "image/*"
              : fileType === "video"
              ? "video/*"
              : fileType === "audio"
              ? "audio/*"
              : "*"
          }
        />

        <div className="relative flex-1">
          <Textarea
            placeholder={
              selectedFile ? "Add a caption..." : "Type a message..."
            }
            className="resize-none py-1 pr-12 min-h-[2.5rem] max-h-32"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSendingText || isUploading}
          />
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute right-1 bottom-1 h-8 w-8 rounded-full",
              (isSendingText || isUploading) && "opacity-50 cursor-not-allowed"
            )}
            onClick={handleSendMessage}
            disabled={isSendingText || isUploading}
          >
            {isSendingText || isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5 text-green-600" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
