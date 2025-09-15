
"use client";

import { useState } from "react";
import type { PublicUser } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UserX } from "lucide-react";
import { EditUserDialog } from "./edit-user-dialog";
import { toggleUserStatus } from "@/app/admin/users/actions";
import { useToast } from "@/hooks/use-toast";

interface UserListProps {
  users: PublicUser[];
  onUserUpdate: (updatedUser: PublicUser) => void;
  onStatusToggle: (userId: string, newStatus: 'approved' | 'pending') => void;
}

export function UserList({ users, onUserUpdate, onStatusToggle }: UserListProps) {
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<PublicUser | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleEditClick = (user: PublicUser) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedUser(null);
  };

  const handleToggleStatus = async (user: PublicUser) => {
    const currentStatus = user.status;
    const newStatus = currentStatus === 'approved' ? 'pending' : 'approved';
    
    // Optimistic update
    onStatusToggle(user.id, newStatus);

    const result = await toggleUserStatus(user.id, currentStatus);
    
    if (result.error) {
        toast({
            title: "Error",
            description: `Failed to update status for ${user.username}.`,
            variant: "destructive",
        });
        // Revert on error
        onStatusToggle(user.id, currentStatus);
    } else {
        toast({
            title: "Status Updated",
            description: `@${user.username} is now ${newStatus}.`,
        });
    }
  };

  if (users.length === 0) {
    return (
      <Card className="bg-card border-border/50">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <UserX className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="font-semibold text-lg">No Users Found</p>
            <p className="text-muted-foreground">
              No users match your search criteria.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <Card key={user.id} className="bg-card border border-border/50 hover:border-primary/50 transition-all">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => handleEditClick(user)}>
              <Avatar className="h-12 w-12">
                <AvatarImage src={`https://i.pravatar.cc/80?u=${user.id}`} />
                <AvatarFallback>{user.full_name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-base">{user.full_name}</p>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
                 <p className="text-xs text-muted-foreground">{user.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
                <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleToggleStatus(user)}
                    className={cn(
                        "text-xs font-bold w-24",
                        user.status === "approved"
                        ? "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30"
                        : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30"
                    )}
                >
                    {user.status === 'approved' ? 'Approved' : 'Pending'}
                </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      {selectedUser && (
        <EditUserDialog 
            user={selectedUser} 
            isOpen={isDialogOpen}
            onClose={handleCloseDialog}
            onUserUpdate={(updatedUser) => {
                onUserUpdate(updatedUser);
            }}
        />
      )}
    </div>
  );
}
