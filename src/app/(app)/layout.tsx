import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import React from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar>
        <AppSidebar />
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col min-h-screen">
          <AppHeader />
          <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
