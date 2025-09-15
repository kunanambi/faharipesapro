import { OfferCard } from "@/components/dashboard/offer-card";
import { ReferralCard } from "@/components/dashboard/referral-card";
import { SpinWheel } from "@/components/dashboard/spin-wheel";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2, TrendingDown, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-8 pb-24">
      <OfferCard />
      <div>
        <h2 className="text-2xl font-bold">Hi, Fahari User!</h2>
      </div>
      <div className="grid grid-cols-1 gap-6">
        <StatCard
          title="Balance"
          value="0 TZS"
          icon={<TrendingUp className="text-white/80" />}
          cardClassName="bg-green-600/90 text-white"
          description=""
        />
        <StatCard
          title="Net Profit"
          value="0 TZS"
          icon={<BarChart2 className="text-white/80" />}
          cardClassName="bg-blue-600/90 text-white"
          description=""
        />
        <StatCard
          title="Cost"
          value="5,200 TZS"
          icon={<TrendingDown className="text-white/80" />}
          cardClassName="bg-red-600/90 text-white"
          description=""
        />

        <ReferralCard />

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
