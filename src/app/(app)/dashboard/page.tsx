import { OfferCard } from "@/components/dashboard/offer-card";
import { SpinWheel } from "@/components/dashboard/spin-wheel";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2, TrendingDown, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <OfferCard />
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

        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-center">Spin to Win!</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <div className="w-full max-w-sm">
                <SpinWheel />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
