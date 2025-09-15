import { AppHeader } from "@/components/app-header";
import { AdminBottomNav } from "@/components/admin/admin-bottom-nav";
import React from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      <AdminBottomNav />
    </div>
  );
}
