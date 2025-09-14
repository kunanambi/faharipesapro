import { AdBanner } from "@/components/dashboard/ad-banner";
import { ReferralCard } from "@/components/dashboard/referral-card";
import { SpinWheel } from "@/components/dashboard/spin-wheel";
import { StatCard } from "@/components/dashboard/stat-card";
import { VideoSection } from "@/components/dashboard/video-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Users } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-3">
        <h1 className="font-headline text-3xl font-bold">User Dashboard</h1>
      </div>

      <StatCard
        title="Account Balance"
        value="KSh 12,350.00"
        icon={<DollarSign />}
        description="+12% from last month"
      />
      <StatCard
        title="Total Profits"
        value="KSh 7,150.00"
        icon={<TrendingUp />}
        description="+8% from last month"
        color="text-green-500"
      />
      <StatCard
        title="Activation Cost"
        value="KSh 5,200.00"
        icon={<DollarSign />}
        description="One-time platform fee"
        color="text-red-500"
      />

      <div className="lg:col-span-2">
        <ReferralCard />
      </div>

      <div className="lg:col-span-1">
         <Card className="h-full">
          <CardHeader>
            <CardTitle className="font-headline">Spin & Win</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <SpinWheel />
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-3">
        <VideoSection />
      </div>

       <div className="lg:col-span-3">
        <AdBanner />
      </div>
    </div>
  );
}
