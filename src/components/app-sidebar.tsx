
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
} from "./ui/sidebar";
import {
  CreditCard,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Play,
  RefreshCw,
  Settings,
  Users,
  Youtube,
  Cog,
  Video,
} from "lucide-react";

const UserNav = () => {
    const { setOpenMobile } = useSidebar();
    const pathname = usePathname();

    const handleLinkClick = () => {
        setOpenMobile(false);
    }
  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="My Team" isActive={pathname === "/team"} onClick={handleLinkClick}>
          <Link href="/team">
            <Users />
            <span>My Team</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
       <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="Facebook Ads" onClick={handleLinkClick}>
          <Link href="/earn">
            <Play />
            <span>Facebook Ads</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
       <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="Instagram Ads" onClick={handleLinkClick}>
          <Link href="/earn">
            <Play />
            <span>Instagram Ads</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="YouTube Videos" onClick={handleLinkClick}>
          <Link href="/earn">
            <Youtube />
            <span>YouTube Videos</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="Tiktok Videos" onClick={handleLinkClick}>
          <Link href="/earn">
            <Play />
            <span>Tiktok Videos</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
       <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="Play Spin" isActive={pathname === "/spin"} onClick={handleLinkClick}>
          <Link href="/spin">
            <RefreshCw />
            <span>Play Spin</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="WhatsApp Ads" onClick={handleLinkClick}>
          <Link href="#">
            <MessageCircle />
            <span>WhatsApp Ads</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="Withdrawal" onClick={handleLinkClick}>
          <Link href="/withdraw">
            <CreditCard />
            <span>Withdrawal</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </>
  );
}

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
