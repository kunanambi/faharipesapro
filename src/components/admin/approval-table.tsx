"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Check, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import type { SupabaseUser } from "@/lib/types";
import { approveUser } from "@/app/admin/users/actions";

type UserWithStatus = SupabaseUser & {
  dbStatus: 'pending' | 'approved' | 'rejected';
};

export function ApprovalTable({ users: initialUsers }: { users: UserWithStatus[] }) {
  const [users, setUsers] = useState<UserWithStatus[]>(initialUsers);
  const { toast } = useToast();

  const handleApprove = async (userId: string) => {
    const originalUsers = [...users];
    const userToApprove = users.find(u => u.id === userId);

    // Optimistically update the UI
    setUsers(users.filter((user) => user.id !== userId));

    const { error } = await approveUser(userId);

    if (error) {
      toast({
        title: "Error Approving User",
        description: error,
        variant: "destructive",
      });
      // Revert UI change on error
      setUsers(originalUsers);
    } else {
      toast({
        title: "User Approved",
        description: `${userToApprove?.raw_user_meta_data.full_name} has been approved.`,
      });
    }
  };
  
  const handleReject = (userId: string) => {
    // We can implement rejection logic later
     const user = users.find(u => u.id === userId);
     setUsers(users.filter((user) => user.id !== userId));
     toast({
       title: `User Rejected`,
       description: `${user?.raw_user_meta_data.full_name} has been rejected.`,
     });
  }
  
  const pendingUsers = users.filter(user => user.dbStatus === 'pending');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Pending Approvals</CardTitle>
        <CardDescription>
          Review and process new user registration requests.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden lg:table-cell">Registered</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingUsers.length > 0 ? (
                pendingUsers.map((user) => {
                  const registrationDate = user.created_at ? new Date(user.created_at) : null;
                  const isValidDate = registrationDate && !isNaN(registrationDate.getTime());

                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={`https://i.pravatar.cc/40?u=${user.id}`} />
                            <AvatarFallback>{user.raw_user_meta_data.full_name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="font-medium">
                            {user.raw_user_meta_data.full_name}
                            <div className="text-sm text-muted-foreground hidden sm:block">@{user.raw_user_meta_data.username}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {isValidDate ? format(registrationDate, "PPP") : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700 border-green-200"
                            onClick={() => handleApprove(user.id)}
                          >
                            <Check className="h-4 w-4" />
                            <span className="sr-only">Approve</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                            onClick={() => handleReject(user.id)}
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Reject</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No pending approvals.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
