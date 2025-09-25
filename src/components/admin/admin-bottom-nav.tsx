
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CreditCard, Users, Video, DollarSign, Landmark, Cog } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/withdrawals", icon: DollarSign, label: "Withdrawals" },
  { href: "/admin/videos", icon: Video, label: "Videos" },
  { href: "/admin/pending-settings", icon: Cog, label: "Settings" },
];

export function AdminBottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 border-t bg-card/95 backdrop-blur-sm md:hidden">
      <nav className="grid h-16 items-center justify-around" style={{ gridTemplateColumns: `repeat(${navItems.length}, 1fr)`}}>
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 p-2 text-sm font-medium",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
