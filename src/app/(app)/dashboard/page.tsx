
import { OfferCard } from "@/components/dashboard/offer-card";
import { ReferralCard } from "@/components/dashboard/referral-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { BarChart2, TrendingDown, TrendingUp, Shield } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  // Fetch the public user data which contains balance, status, and role
  const { data: publicUser, error: publicUserError } = await supabase
    .from('users')
    .select('username, balance, status, role')
    .eq('id', user.id)
    .single();

  // If the profile fetch fails OR if the user profile doesn't exist yet (common after sign-up)
  if (publicUserError && publicUserError.code !== 'PGRST116') { // PGRST116 means no rows found
    console.error("Error fetching public user data:", publicUserError);
    // An unexpected error occurred, redirecting to login is a safe fallback.
    redirect('/');
    return;
  }
  
  if (!publicUser) {
    // This can happen if the public.users record hasn't been created yet by the trigger.
    // Redirecting to pending is a safe state.
    redirect('/pending');
    return;
  }
  
  // REDIRECTION LOGIC: Check the user's role
  if (publicUser.role === 'admin') {
      redirect('/admin/dashboard');
  }
  
  if (publicUser.status === 'pending') {
    redirect('/pending');
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value) + ' TZS';
  }

  const balance = publicUser.balance || 0;
  const netProfit = 0; // net_profit column was removed
  const cost = 5200;
  const username = publicUser.username || 'User';


  return (
    <div className="space-y-8 pb-24">
      <OfferCard />
      <div>
        <h2 className="text-2xl font-bold">Hi, {username}!</h2>
      </div>
      <div className="grid grid-cols-1 gap-6">
        <StatCard
          title="Balance"
          value={formatCurrency(balance)}
          icon={<TrendingUp className="text-white/80" />}
          cardClassName="bg-green-600/90 text-white"
          description=""
        />
        <StatCard
          title="Net Profit"
          value={formatCurrency(netProfit)}
          icon={<BarChart2 className="text-white/80" />}
          cardClassName="bg-blue-600/90 text-white"
          description="Calculated from your earnings"
        />
        <StatCard
          title="Cost"
          value={formatCurrency(cost)}
          icon={<TrendingDown className="text-white/80" />}
          cardClassName="bg-red-600/90 text-white"
          description=""
        />

        <ReferralCard referralCode={username!} />

        <Card className="bg-card border border-border">
            <CardContent className="pt-6">
                <div className="text-center">
                    <h2 className="font-headline text-2xl font-bold text-white mb-2">Welcome to Fahari Pesa!</h2>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto">
                        Start earning money through various tasks. Watch ads, share links, play games, and build your team to maximize your earnings.
                    </p>
                </div>
            </CardContent>
        </Card>

        <Card className="bg-muted/50 border border-border/50">
             <CardContent className="pt-6">
                <div className="text-center">
                    <p className="font-semibold text-white">Imeandaliwa na Fahari Investment Company</p>
                    <p className="text-sm text-muted-foreground">Chini ya usimamizi wa CEO Joseph Kunambi</p>
                </div>
             </CardContent>
        </Card>

      </div>
    </div>
  );
}
