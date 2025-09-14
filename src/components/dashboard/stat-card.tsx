import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type StatCardProps = {
  title: string;
  value: string;
  icon: ReactNode;
  description: string;
  color?: string;
  cardClassName?: string;
};

export function StatCard({ title, value, icon, description, color, cardClassName }: StatCardProps) {
  return (
    <Card className={cn("transition-all hover:shadow-lg hover:-translate-y-1", cardClassName)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={cn("text-sm font-medium text-muted-foreground", cardClassName && "text-white/90")}>{title}</CardTitle>
        <div className={cn("text-muted-foreground", cardClassName && "text-white/90")}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={cn("text-xs text-muted-foreground", color, cardClassName && "text-white/80")}>
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
