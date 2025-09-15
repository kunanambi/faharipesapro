import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminBottomNav } from "@/components/admin/admin-bottom-nav";
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import React from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar>
        <AdminSidebar />
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col min-h-screen">
          <AdminHeader />
          <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
          <AdminBottomNav />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
