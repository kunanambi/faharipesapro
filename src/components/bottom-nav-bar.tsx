
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, TrendingUp, Users, User, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./ui/sidebar";
import { Button } from "./ui/button";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Home" },
];

const earnItem =   { href: "/earn", icon: TrendingUp, label: "Earn" };

const otherNavItems = [
  { href: "/team", icon: Users, label: "Team" },
  { href: "/withdraw", icon: DollarSign, label: "Withdraw" },
  { href: "/profile", icon: User, label: "Profile" },
]

export function BottomNavBar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 border-t bg-card/95 backdrop-blur-sm md:hidden">
      <nav className="grid grid-cols-5 h-16 items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
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
              <span>{item.label}</span>
            </Link>
          );
        })}
         <Button
            variant="ghost"
            onClick={() => setOpenMobile(true)}
            className="flex flex-col items-center gap-1 p-2 text-sm font-medium h-auto text-muted-foreground hover:text-foreground"
          >
            <TrendingUp className="h-6 w-6" />
            <span>Earn</span>
          </Button>
        {otherNavItems.map((item) => {
          const isActive = pathname === item.href;
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
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
