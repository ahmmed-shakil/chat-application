'use client';

import { useState, useEffect } from 'react';
import { useSearchUsersQuery } from '@/lib/features/user/userApiSlice';
import { useAccessChatMutation } from '@/lib/features/chat/chatApiSlice';
import type { User } from '@/lib/features/auth/authSlice';
import { useToast } from '@/hooks/use-toast';

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Search, UserPlus } from 'lucide-react';

interface UserSearchProps {
  open: boolean;
  onClose: () => void;
  onChatCreated: (chat: any) => void;
}

export default function UserSearch({ open, onClose, onChatCreated }: UserSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const { data, isLoading } = useSearchUsersQuery(debouncedTerm, {
    skip: debouncedTerm.length < 2
  });
  const [accessChat, { isLoading: isCreatingChat }] = useAccessChatMutation();
  const { toast } = useToast();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Clear search when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchTerm('');
      setDebouncedTerm('');
    }
  }, [open]);

  const handleStartChat = async (userId: string) => {
    try {
      const response = await accessChat({ userId }).unwrap();

      if (response.success) {
        onChatCreated(response.data);
        toast({
          title: 'Chat created',
          description: 'You can now start messaging',
        });
        onClose();
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.data?.message || 'Failed to create chat',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Find Users</DialogTitle>
          <DialogDescription>
            Search for users to start a new conversation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              type="search"
              placeholder="Search by name or email"
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="border rounded-md divide-y dark:divide-gray-800 max-h-72 overflow-auto">
            {debouncedTerm.length < 2 ? (
              <div className="p-4 text-center text-gray-500">
                Type at least 2 characters to search
              </div>
            ) : isLoading ? (
              <div className="p-4 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
              </div>
            ) : !data?.data?.length ? (
              <div className="p-4 text-center text-gray-500">
                No users found
              </div>
            ) : (
              data.data.map((user: User) => (
                <div key={user._id} className="p-3 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.profilePicture} alt={user.name} />
                      <AvatarFallback>
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{user.name}</h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    disabled={isCreatingChat}
                    onClick={() => handleStartChat(user._id)}
                  >
                    {isCreatingChat ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-1" />
                        Chat
                      </>
                    )}
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
