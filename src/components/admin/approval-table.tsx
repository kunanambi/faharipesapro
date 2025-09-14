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
import { Badge } from "@/components/ui/badge";
import type { User } from "@/lib/types";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Check, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const initialUsers: User[] = [
  {
    id: "1",
    fullName: "Jane Smith",
    username: "janesmith",
    email: "jane.smith@example.com",
    phone: "555-0101",
    registeredAt: new Date("2023-10-28T10:00:00Z"),
    status: "pending",
  },
  {
    id: "2",
    fullName: "Michael Johnson",
    username: "mikej",
    email: "michael.j@example.com",
    phone: "555-0102",
    registeredAt: new Date("2023-10-28T11:30:00Z"),
    status: "pending",
  },
  {
    id: "3",
    fullName: "Emily Davis",
    username: "emilyd",
    email: "emily.davis@example.com",
    phone: "555-0103",
    registeredAt: new Date("2023-10-27T14:00:00Z"),
    status: "pending",
  },
  {
    id: "4",
    fullName: "Chris Lee",
    username: "chrisl",
    email: "chris.lee@example.com",
    phone: "555-0104",
    registeredAt: new Date("2023-10-26T09:00:00Z"),
    status: "pending",
  },
];

export function ApprovalTable() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const { toast } = useToast();

  const handleAction = (userId: string, newStatus: "approved" | "rejected") => {
    // Simulate API call
    const user = users.find(u => u.id === userId);
    setUsers(users.filter((user) => user.id !== userId));
    toast({
      title: `User ${newStatus}`,
      description: `${user?.fullName} has been ${newStatus}.`,
    });
  };

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
              {users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={`https://i.pravatar.cc/40?u=${user.id}`} />
                          <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">
                          {user.fullName}
                          <div className="text-sm text-muted-foreground hidden sm:block">@{user.username}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {format(user.registeredAt, "PPP")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700 border-green-200"
                          onClick={() => handleAction(user.id, "approved")}
                        >
                          <Check className="h-4 w-4" />
                          <span className="sr-only">Approve</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                          onClick={() => handleAction(user.id, "rejected")}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Reject</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
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
