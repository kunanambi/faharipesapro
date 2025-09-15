
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
  useSidebar,
} from "../ui/sidebar";
import {
  CreditCard,
  LayoutDashboard,
  LogOut,
  Users,
  Video,
  Cog,
  User,
} from "lucide-react";

const AdminNav = () => {
    const pathname = usePathname();
    const { setOpenMobile } = useSidebar();

    const handleLinkClick = () => {
        setOpenMobile(false);
    }

    return (
        <>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Dashboard" isActive={pathname === "/admin/dashboard"} onClick={handleLinkClick}>
                    <Link href="/admin/dashboard">
                        <LayoutDashboard />
                        <span>Dashboard</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="User Management" isActive={pathname === "/admin/users"} onClick={handleLinkClick}>
                    <Link href="/admin/users">
                        <Users />
                        <span>Users</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Withdrawals" isActive={pathname === "/admin/withdrawals"} onClick={handleLinkClick}>
                    <Link href="/admin/withdrawals">
                        <CreditCard />
                        <span>Lipa</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Videos" isActive={pathname.startsWith("/admin/videos")} onClick={handleLinkClick}>
                    <Link href="/admin/videos">
                        <Video />
                        <span>Videos</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Spin Settings" isActive={pathname === "/admin/spin"} onClick={handleLinkClick}>
                    <Link href="/admin/spin">
                        <Cog />
                        <span>Spin Settings</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </>
    );
}

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

export function AdminSidebar() {

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <FahariLogo />
          <span className="font-headline text-lg font-semibold group-data-[collapsible=icon]:hidden">
            Fahari Admin
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu><AdminNav /></SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="User Panel">
              <Link href="/dashboard">
                <User />
                <span>User Panel</span>
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
