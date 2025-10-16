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
      <div className="min-h-screen w-full">
        <div className="flex h-[calc(100vh-4rem)]">
          <DataRoomSidebar />
          <SidebarInset className="flex-1 p-6 overflow-auto">
            <DashboardHeader />
            {children}
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
