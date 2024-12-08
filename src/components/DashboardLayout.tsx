import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";

export function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full">
        <header className="bg-background border-b border-border h-14 flex items-center px-6">
          <h1 className="text-xl font-semibold">The Thatch House</h1>
        </header>
        <div className="flex flex-1">
          <DashboardSidebar />
          <main className="flex-1 p-8 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}