import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DataRoomContent } from "@/components/dataroom/data-room-content";
import { Breadcrumbs } from "@/components/dataroom/breadcrumbs";

interface DataRoomPageProps {
  params: {
    folderId: string;
  };
}

export default async function DataRoomPage({ params }: DataRoomPageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { folderId } = await params;

  return (
    <div className="space-y-6">
      {/* <Breadcrumbs folderId={folderId} /> */}
      <DataRoomContent folderId={folderId} />
    </div>
  );
}
