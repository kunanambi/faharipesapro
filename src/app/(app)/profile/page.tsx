import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect('/');
  }

  const user = data.user;
  const fullName = user.user_metadata?.full_name || 'Fahari User';
  const username = user.user_metadata?.username || 'fahariuser';
  const phone = user.user_metadata?.phone || '';
  const email = user.email || '';
  const avatarFallback = fullName.split(' ').map(n => n[0]).join('').toUpperCase();


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
        <CardContent className="space-y-6">
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
                    <Input id="fullName" defaultValue={fullName} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" defaultValue={username} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" defaultValue={phone} />
                </div>
            </div>
             <Button>Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}
