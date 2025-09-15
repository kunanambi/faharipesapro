
"use client";

import { useState, useEffect, FormEvent } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const supabase = createClient();
  const { toast } = useToast();
  const router = useRouter();
  
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [avatarFallback, setAvatarFallback] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.push('/');
        return;
      }
      
      const currentUser = data.user;
      setUser(currentUser);
      setFullName(currentUser.user_metadata?.full_name || "");
      setUsername(currentUser.user_metadata?.username || "");
      setPhone(currentUser.user_metadata?.phone || "");
      setEmail(currentUser.email || "");
      setAvatarFallback(
        (currentUser.user_metadata?.full_name || "")
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
      );
    };
    getUser();
  }, [supabase, router]);

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    if (!user) return;

    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName, username, phone },
    });

    if (error) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved.",
      });
      // Refresh user data
      const { data } = await supabase.auth.refreshSession();
      if (data.user) setUser(data.user);
    }
    setIsSaving(false);
  };
  
  const handlePasswordChange = async (e: FormEvent) => {
      e.preventDefault();
      setIsChangingPassword(true);

      if (newPassword !== confirmPassword) {
          toast({
              title: "Passwords do not match",
              description: "Please ensure your new password and confirmation match.",
              variant: "destructive",
          });
          setIsChangingPassword(false);
          return;
      }
      if (!user) return;

      // Supabase requires reauthentication for password changes if the user hasn't logged in recently.
      // However, for a direct password update, you can use the updateUser method.
       const { error } = await supabase.auth.updateUser({
          password: newPassword
      });

      if (error) {
           toast({
              title: "Error Changing Password",
              description: error.message,
              variant: "destructive",
          });
      } else {
           toast({
              title: "Password Changed",
              description: "Your password has been updated successfully.",
          });
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
      }
      setIsChangingPassword(false);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={`https://i.pravatar.cc/150?u=${user.id}`} />
                <AvatarFallback>{avatarFallback}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{fullName}</h3>
                <p className="text-sm text-muted-foreground">{email}</p>
              </div>
            </div>
            <Separator />
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
          <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                  Enter your new password below.
              </CardDescription>
          </CardHeader>
          <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="grid gap-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input 
                          id="new-password" 
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                      />
                  </div>
                   <div className="grid gap-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input 
                          id="confirm-password" 
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                      />
                  </div>
                  <Button type="submit" disabled={isChangingPassword}>
                      {isChangingPassword ? "Changing..." : "Change Password"}
                  </Button>
              </form>
          </CardContent>
      </Card>
    </div>
  );
}
