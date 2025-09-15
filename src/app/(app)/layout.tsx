import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import { BottomNavBar } from "@/components/bottom-nav-bar";
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { headers } from "next/headers";
import React from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = headers().get('x-next-pathname') || '';
  const isAdminSection = pathname.startsWith('/admin');

  if (isAdminSection) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <AppSidebar />
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col min-h-screen">
          <AppHeader />
          <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
          <BottomNavBar />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
