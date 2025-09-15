"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarFooter,
} from "./ui/sidebar";
import {
  DollarSign,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  Video,
} from "lucide-react";

const UserNav = () => (
  <>
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        tooltip="Dashboard"
        isActive={usePathname() === "/dashboard"}
      >
        <Link href="/dashboard">
          <LayoutDashboard />
          <span>Dashboard</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
    <SidebarMenuItem>
      <SidebarMenuButton asChild tooltip="Videos">
        <Link href="#">
          <Video />
          <span>Videos</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
    <SidebarMenuItem>
      <SidebarMenuButton asChild tooltip="Referrals">
        <Link href="#">
          <Users />
          <span>Referrals</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  </>
);

const AdminNav = () => (
  <>
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        tooltip="Dashboard"
        isActive={usePathname() === "/admin/dashboard"}
      >
        <Link href="/admin/dashboard">
          <LayoutDashboard />
          <span>Dashboard</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  </>
);

const FahariLogo = () => (
    <div className="relative w-8 h-8">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M5 9C5 7.89543 5.89543 7 7 7H17C18.1046 7 19 7.89543 19 9V18C19 19.1046 18.1046 20 17 20H7C5.89543 20 5 19.1046 5 18V9Z" stroke="hsl(var(--sidebar-primary))" strokeWidth="1.5"/>
            <path d="M9 14H13" stroke="hsl(var(--sidebar-primary))" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M9 11V17" stroke="hsl(var(--sidebar-primary))" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M15 7C15 4.79086 13.2091 3 11 3C8.79086 3 7 4.79086 7 7" stroke="hsl(var(--sidebar-primary))" strokeWidth="1.5"/>
        </svg>
    </div>
);

export function AppSidebar() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <FahariLogo />
          <span className="font-headline text-lg font-semibold group-data-[collapsible=icon]:hidden">
            Fahari Pesa
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>{isAdmin ? <AdminNav /> : <UserNav />}</SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <Link href="#">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Log Out">
              <Link href="/">
                <LogOut />
                <span>Log Out</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
