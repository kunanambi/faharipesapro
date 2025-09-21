
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
import { updateUserByAdmin, changeUserPasswordByAdmin } from "@/app/admin/users/actions";
import { Separator } from "../ui/separator";

interface EditUserDialogProps {
  user: PublicUser;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdate: (updatedUser: PublicUser) => void;
}

export function EditUserDialog({ user, isOpen, onClose, onUserUpdate }: EditUserDialogProps) {
  const { toast } = useToast();
  // Profile fields
  const [fullName, setFullName] = useState(user.full_name || "");
  const [username, setUsername] = useState(user.username || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [email, setEmail] = useState(user.email || "");
  const [balance, setBalance] = useState(user.balance || 0);
  const [totalEarnings, setTotalEarnings] = useState(user.total_earnings || 0);
  const [isSaving, setIsSaving] = useState(false);
  
  // Password fields
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);


  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const result = await updateUserByAdmin({
      userId: user.id,
      fullName,
      username,
      phone,
      email,
      balance: Number(balance),
      total_earnings: Number(totalEarnings)
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
      // Don't close the dialog, allow for more edits like password change
    }
    setIsSaving(false);
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please ensure the new passwords match.",
        variant: "destructive",
      });
      return;
    }
     if (newPassword.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    setIsChangingPassword(true);
    const result = await changeUserPasswordByAdmin({ userId: user.id, newPassword });

    if (result.error) {
       toast({
        title: "Error Changing Password",
        description: result.error,
        variant: "destructive",
      });
    } else {
        toast({
            title: "Password Changed",
            description: `Password for @${user.username} has been updated.`,
        });
        setNewPassword("");
        setConfirmPassword("");
    }
    setIsChangingPassword(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User: @{user.username}</DialogTitle>
          <DialogDescription>
            Make changes to the user's profile or password.
          </DialogDescription>
        </DialogHeader>

        {/* Profile Info Form */}
        <form onSubmit={handleProfileSubmit} className="grid gap-4 py-4">
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="totalEarnings" className="text-right">
              Total Earnings
            </Label>
            <Input
              id="totalEarnings"
              type="number"
              value={totalEarnings}
              onChange={(e) => setTotalEarnings(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Profile Changes"}
            </Button>
          </DialogFooter>
        </form>

        <Separator />
        
        {/* Password Change Form */}
         <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <h3 className="font-semibold text-lg">Change Password</h3>
             <div className="grid gap-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input 
                    id="new-password" 
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                />
            </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input 
                    id="confirm-password" 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                />
            </div>
             <DialogFooter>
                <Button type="submit" variant="destructive" disabled={isChangingPassword || !newPassword}>
                    {isChangingPassword ? "Changing..." : "Change Password"}
                </Button>
            </DialogFooter>
         </form>

      </DialogContent>
    </Dialog>
  );
}
