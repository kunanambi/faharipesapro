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

export function AppSidebar() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <DollarSign className="h-5 w-5" />
          </div>
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
