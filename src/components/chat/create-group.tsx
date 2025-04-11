'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useGetAllUsersQuery } from '@/lib/features/user/userApiSlice';
import { useCreateGroupChatMutation } from '@/lib/features/chat/chatApiSlice';
import type { User } from '@/lib/features/auth/authSlice';
import { useToast } from '@/hooks/use-toast';

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, Loader2, Search, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

// Validation schema
const formSchema = z.object({
  name: z.string().min(1, { message: 'Group name is required' }),
});

interface CreateGroupProps {
  open: boolean;
  onClose: () => void;
  onGroupCreated: (group: any) => void;
}

export default function CreateGroup({ open, onClose, onGroupCreated }: CreateGroupProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const { data, isLoading } = useGetAllUsersQuery();
  const [createGroupChat, { isLoading: isCreating }] = useCreateGroupChatMutation();
  const { toast } = useToast();

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  // Reset form and selections when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset();
      setSelectedUsers([]);
      setSearchTerm('');
    }
  }, [open, form]);

  // Filter users based on search term
  const filteredUsers = data?.data
    ? data.data.filter((user) => {
        // Check if user is not already selected
        const isSelected = selectedUsers.some((selected) => selected._id === user._id);
        // Check if user name or email matches search term
        const matchesSearch =
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch && !isSelected;
      })
    : [];

  // Add/remove user from selection
  const toggleUserSelection = (user: User) => {
    if (selectedUsers.some((selected) => selected._id === user._id)) {
      setSelectedUsers(selectedUsers.filter((selected) => selected._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (selectedUsers.length < 2) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select at least 2 users for the group',
      });
      return;
    }

    try {
      const response = await createGroupChat({
        name: values.name,
        users: selectedUsers.map((user) => user._id),
      }).unwrap();

      if (response.success) {
        onGroupCreated(response.data);
        toast({
          title: 'Group created',
          description: 'Your group has been created successfully',
        });
        onClose();
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.data?.message || 'Failed to create group',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Group Chat</DialogTitle>
          <DialogDescription>
            Add users to your group chat
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter group name"
                      {...field}
                      disabled={isCreating}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedUsers.length > 0 && (
              <div>
                <label className="text-sm font-medium">Selected Users</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedUsers.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-sm"
                    >
                      <span>{user.name}</span>
                      <button
                        type="button"
                        onClick={() => toggleUserSelection(user)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Add Users</label>
              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search users by name or email"
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <ScrollArea className="h-48 border rounded-md mt-2">
                {isLoading ? (
                  <div className="p-4 flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    {searchTerm ? 'No users found' : 'No users available'}
                  </div>
                ) : (
                  <div className="divide-y dark:divide-gray-800">
                    {filteredUsers.map((user) => (
                      <div
                        key={user._id}
                        className="p-3 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
                        onClick={() => toggleUserSelection(user)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.profilePicture} alt={user.name} />
                            <AvatarFallback>
                              {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium text-sm">{user.name}</h3>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <Check className="h-5 w-5 text-gray-400" />
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating || selectedUsers.length < 2}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Group'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
