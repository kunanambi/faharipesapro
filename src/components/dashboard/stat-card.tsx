import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type StatCardProps = {
  title: string;
  value: string;
  icon: ReactNode;
  description: string;
  color?: string;
};

export function StatCard({ title, value, icon, description, color }: StatCardProps) {
  return (
    <Card className="shadow-md transition-all hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={cn("text-xs text-muted-foreground", color)}>
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
