
"use client"

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { PublicUser } from "@/lib/types";
import { updateUserByAdmin } from "@/app/admin/users/actions";

interface EditUserDialogProps {
  user: PublicUser;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdate: (updatedUser: PublicUser) => void;
}

export function EditUserDialog({ user, isOpen, onClose, onUserUpdate }: EditUserDialogProps) {
  const { toast } = useToast();
  const [fullName, setFullName] = useState(user.full_name || "");
  const [username, setUsername] = useState(user.username || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [email, setEmail] = useState(user.email || "");
  const [balance, setBalance] = useState(user.balance || 0);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const result = await updateUserByAdmin({
      userId: user.id,
      fullName,
      username,
      phone,
      email,
      balance: Number(balance)
    });

    if (result.error) {
      toast({
        title: "Error Updating User",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "User Updated",
        description: `Profile for ${username} has been successfully updated.`,
      });
      onUserUpdate(result.data as PublicUser);
      onClose();
    }
    setIsSaving(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User: @{user.username}</DialogTitle>
          <DialogDescription>
            Make changes to the user's profile. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fullName" className="text-right">
              Full Name
            </Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Phone
            </Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="col-span-3"
            />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="balance" className="text-right">
              Balance
            </Label>
            <Input
              id="balance"
              type="number"
              value={balance}
              onChange={(e) => setBalance(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
