
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { DollarSign, Users, TrendingUp, TrendingDown, Bell, Video, Cog, User, Landmark } from "lucide-react";
import Link from "next/link";
import { FaInstagram, FaTiktok, FaFacebook, FaWhatsapp } from "react-icons/fa";
import { redirect } from "next/navigation";

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value) + ' TZS';
}

const adminLinks = [
    { href: "/admin/users", title: "User Management", icon: <Users /> },
    { href: "/admin/withdrawals", title: "Withdrawal Requests", icon: <DollarSign /> },
    { href: "/admin/expenses", title: "Manage Expenses", icon: <Landmark /> },
    { href: "/admin/notification", title: "Offer Notification", icon: <Bell /> },
    { href: "/admin/videos", title: "Manage Videos", icon: <Video /> },
    { href: "/admin/spin", title: "Spin Settings", icon: <Cog /> },
]

export default async function AdminDashboardPage() {
    const supabase = createClient();

    // Check for user and admin role
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/');
    }
    const { data: publicUser } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

    if (publicUser?.role !== 'admin') {
        redirect('/dashboard');
    }

    // Fetch all required data concurrently
    const [
        { count: totalUsers, error: totalUsersError },
        { count: activeUsers, error: activeUsersError },
        { count: pendingUsers, error: pendingUsersError },
        { data: approvedWithdrawals, error: withdrawalsError },
        { data: otherExpenses, error: expensesError }
    ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('withdrawals').select('amount').eq('status', 'approved'),
        supabase.from('expenses').select('amount')
    ]);

    // Handle potential errors
    if (totalUsersError || activeUsersError || pendingUsersError || withdrawalsError || expensesError) {
        console.error("Error fetching admin dashboard data:", { totalUsersError, activeUsersError, pendingUsersError, withdrawalsError, expensesError });
        // You can render an error message here
    }

    const activeUsersCount = activeUsers ?? 0;
    const totalBalance = activeUsersCount * 5200;
    const withdrawalExpenses = approvedWithdrawals?.reduce((sum, w) => sum + w.amount, 0) ?? 0;
    const otherExpensesTotal = otherExpenses?.reduce((sum, e) => sum + Number(e.amount), 0) ?? 0;
    const totalExpenses = withdrawalExpenses + otherExpensesTotal;
    const totalProfit = totalBalance - totalExpenses;

    return (
        <div className="space-y-6 pb-24">
            <div>
                <h1 className="font-headline text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground">Welcome to the admin control panel.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <StatCard
                    title="Total Users"
                    value={`${totalUsers ?? 0}`}
                    icon={<Users className="text-white/80" />}
                    cardClassName="bg-blue-600/90 text-white"
                    description={`Active: ${activeUsersCount}, Pending: ${pendingUsers ?? 0}`}
                />
                 <StatCard
                    title="Balance"
                    value={formatCurrency(totalBalance)}
                    icon={<DollarSign className="text-white/80" />}
                    cardClassName="bg-green-600/90 text-white"
                    description="Active Users x 5200"
                />
                 <StatCard
                    title="Expenses"
                    value={formatCurrency(totalExpenses)}
                    icon={<TrendingDown className="text-white/80" />}
                    cardClassName="bg-red-600/90 text-white"
                    description="Withdrawals + Other Costs"
                />
                 <StatCard
                    title="Profit"
                    value={formatCurrency(totalProfit)}
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
