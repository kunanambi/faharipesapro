
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Search, User, UserX } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/stat-card";

// This is placeholder data. We will replace this with real data from Supabase later.
const teamMembers = [
    { username: 'jane_smith', phone: '0765432109', joined: '2025-01-15', status: 'Active' },
    { username: 'mike_wilson', phone: '0712345678', joined: '2025-01-14', status: 'Pending' },
    { username: 'sarah_jones', phone: '0756789012', joined: '2025-01-13', status: 'Active' },
];

const totalReferred = teamMembers.length;
const earnings = 15600;

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value) + ' TZS';
}

export default function TeamPage() {
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
                description=""
                />
        </div>

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
            {teamMembers.length > 0 ? (
                 <div className="space-y-4">
                    {teamMembers.map((member) => (
                        <Card key={member.username} className="bg-card border border-border/50">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-muted rounded-full">
                                        <User className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="font-bold">{member.username}</p>
                                        <p className="text-sm text-muted-foreground">{member.phone}</p>
                                        <p className="text-xs text-muted-foreground">Joined: {member.joined}</p>
                                    </div>
                                </div>
                                <Badge
                                    className={cn(
                                        "text-xs font-bold",
                                        member.status === "Active"
                                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                                        : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                    )}
                                    variant="outline"
                                >
                                    {member.status}
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
                            <p className="text-muted-foreground">You have no team members yet.</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    </div>
  )
}
