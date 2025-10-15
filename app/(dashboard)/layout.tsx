import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DataRoomSidebar } from "@/components/dashboard/data-room-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white w-full">
        <div className="flex h-[calc(100vh-4rem)]">
          <DataRoomSidebar />
          <SidebarInset className="flex-1 p-6 bg-white dark:bg-gray-900 overflow-auto">
            <DashboardHeader user={user} />
            {children}
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
