
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, TrendingUp, TrendingDown, Bell, Video, Cog, User } from "lucide-react";
import Link from "next/link";
import type { PublicUser, Withdrawal } from "@/lib/types";

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value) + ' TZS';
}

const adminLinks = [
    { href: "/admin/users", title: "User Management", icon: <Users /> },
    { href: "/admin/withdrawals", title: "Withdrawal Requests", icon: <DollarSign /> },
    { href: "/admin/notification", title: "Offer Notification", icon: <Bell /> },
    { href: "/admin/videos", title: "Manage Videos", icon: <Video /> },
    { href: "/admin/spin", title: "Spin Settings", icon: <Cog /> },
]

export default function AdminDashboardPage() {
    const supabase = createClient();
    const router = useRouter();
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        pendingUsers: 0,
        totalBalance: 0,
        totalExpenses: 0,
        totalProfit: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/');
                return;
            }
            const { data: publicUser } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single();

            if (publicUser?.role !== 'admin') {
                router.push('/dashboard');
                return false;
            }
            return true;
        };

        const fetchStats = async () => {
            const isAdmin = await checkAdmin();
            if (!isAdmin) return;

            const { data: usersData, error: usersError } = await supabase.from('users').select('status');
            const { data: withdrawalsData, error: withdrawalsError } = await supabase.from('withdrawals').select('amount').eq('status', 'approved');

            if (usersError || withdrawalsError) {
                console.error("Error fetching admin stats:", { usersError, withdrawalsError });
                setLoading(false);
                return;
            }

            const totalUsers = usersData.length;
            const activeUsers = usersData.filter(u => u.status === 'approved').length;
            const pendingUsers = totalUsers - activeUsers;
            const totalBalance = activeUsers * 5200;
            const totalExpenses = withdrawalsData.reduce((sum, w) => sum + w.amount, 0);
            const totalProfit = totalBalance - totalExpenses;

            setStats({
                totalUsers,
                activeUsers,
                pendingUsers,
                totalBalance,
                totalExpenses,
                totalProfit,
            });
            setLoading(false);
        };

        fetchStats();
    }, [supabase, router]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading admin data...</div>;
    }

    return (
        <div className="space-y-6 pb-24">
            <div>
                <h1 className="font-headline text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground">Welcome to the admin control panel.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <StatCard
                    title="Total Users"
                    value={`${stats.totalUsers}`}
                    icon={<Users className="text-white/80" />}
                    cardClassName="bg-blue-600/90 text-white"
                    description={`Active: ${stats.activeUsers}, Pending: ${stats.pendingUsers}`}
                />
                 <StatCard
                    title="Balance"
                    value={formatCurrency(stats.totalBalance)}
                    icon={<DollarSign className="text-white/80" />}
                    cardClassName="bg-green-600/90 text-white"
                    description="Active Users x 5200"
                />
                 <StatCard
                    title="Expenses"
                    value={formatCurrency(stats.totalExpenses)}
                    icon={<TrendingDown className="text-white/80" />}
                    cardClassName="bg-red-600/90 text-white"
                    description="Approved Withdrawals"
                />
                 <StatCard
                    title="Profit"
                    value={formatCurrency(stats.totalProfit)}
                    icon={<TrendingUp className="text-white/80" />}
                    cardClassName="bg-purple-600/90 text-white"
                    description="Balance - Expenses"
                />
            </div>
            
            <div>
                <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {adminLinks.map(link => (
                        <Link href={link.href} key={link.title}>
                            <Card className="hover:bg-accent hover:text-accent-foreground transition-colors h-full">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{link.title}</CardTitle>
                                    <div className="text-muted-foreground">{link.icon}</div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-muted-foreground">Manage {link.title.toLowerCase()}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>

             <Card className="bg-card border border-border">
                <CardContent className="pt-6">
                    <Button asChild className="w-full" variant="outline">
                        <Link href="/profile">
                            <User className="mr-2 h-4 w-4" />
                            My Profile
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
