

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Search, User, UserX } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/stat-card";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ReferralCard } from "@/components/dashboard/referral-card";
import type { PublicUser } from "@/lib/types";

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value) + ' TZS';
}

export default async function TeamPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  // Fetch current user's referral code (username)
  const { data: currentUserData, error: currentUserError } = await supabase
    .from('users')
    .select('username')
    .eq('id', user.id)
    .single();
  
  if (currentUserError || !currentUserData) {
    console.error("Could not fetch current user's data", currentUserError);
    redirect('/dashboard');
  }

  const referralCode = currentUserData.username;

  // Fetch users who were invited by the current user
  const { data: teamMembers, error: teamError } = await supabase
    .from('users')
    .select('*')
    .eq('invited_by', referralCode);

  if (teamError) {
    console.error("Error fetching team members:", teamError);
    // Continue with an empty team
  }

  const activeTeamMembers = teamMembers?.filter(m => m.status === 'approved') || [];
  const earnings = activeTeamMembers.length * 1500;
  const totalReferred = teamMembers?.length || 0;

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
            <StatCard
                title="Total Referred"
                value={totalReferred.toString()}
                icon={<Users className="text-white/80" />}
                cardClassName="bg-green-600/90 text-white"
                description=""
                />
            <StatCard
                title="Earnings"
                value={formatCurrency(earnings)}
                icon={<TrendingUp className="text-white/80" />}
                cardClassName="bg-purple-600/90 text-white"
                description="From approved referrals"
                />
        </div>

        <ReferralCard referralCode={referralCode!} />

        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Search by username or phone..."
                className="pl-10"
            />
        </div>

        <div>
            <h2 className="text-xl font-bold mb-4">My Team</h2>
            {(teamMembers && teamMembers.length > 0) ? (
                 <div className="space-y-4">
                    {teamMembers.map((member: PublicUser) => (
                        <Card key={member.id} className="bg-card border border-border/50">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-muted rounded-full">
                                        <User className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="font-bold">{member.username}</p>
                                        <p className="text-sm text-muted-foreground">{member.phone}</p>
                                        <p className="text-xs text-muted-foreground">Joined: {new Date(member.created_at!).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <Badge
                                    className={cn(
                                        "text-xs font-bold",
                                        member.status === "approved"
                                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                                        : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                    )}
                                    variant="outline"
                                >
                                    {member.status === 'approved' ? 'Active' : 'Pending'}
                                </Badge>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="bg-card border-border/50">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center justify-center h-48 text-center">
                            <UserX className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="font-semibold text-lg">No Referrals Yet</p>
                            <p className="text-muted-foreground">Share your link to build your team.</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    </div>
  )
}
