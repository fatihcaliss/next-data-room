"use client";

import { useState } from "react";
import { FolderPlus, Upload, Folder } from "lucide-react";
import { useFolders } from "@/lib/queries/folders";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { CreateFolderDialog } from "@/components/folders/create-folder-dialog";
import { UploadPdfDialog } from "@/components/files/upload-pdf-dialog";
import { useUser } from "@/lib/supabase/client";

export function DataRoomSidebar() {
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showUploadPdf, setShowUploadPdf] = useState(false);
  const pathname = usePathname();
  const { data: user } = useUser();

  const { data: rootFolders, isLoading } = useFolders(null);

  return (
    <>
      <Sidebar className="bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
        <SidebarHeader className="p-6">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Acme Data Room
          </h1>
        </SidebarHeader>

        <SidebarContent className="px-6">
          {/* Quick Actions */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Quick Actions
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setShowCreateFolder(true)}
                    className="w-full justify-start text-left h-auto p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    <FolderPlus className="h-4 w-4" />
                    <div className="flex justify-between w-full">
                      <span className="font-medium w-full">New Folder</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 w-24 text-right">
                        ⌘ /
                      </span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setShowUploadPdf(true)}
                    className="w-full justify-start text-left h-auto p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    <Upload className="h-4 w-4" />
                    <div className="flex justify-between w-full">
                      <span className="font-medium">Upload PDFs</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 w-24 text-right ">
                        ⌘ .
                      </span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Documents Tree */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Documents
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/dataroom/root"}
                    className="hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    <Link href="/dataroom/root">
                      <Folder className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span>Data Room ({user?.email || "root"})</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {isLoading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <SidebarMenuItem key={i}>
                        <div className="flex items-center space-x-2 p-2">
                          <Skeleton className="h-4 w-4" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </SidebarMenuItem>
                    ))
                  : rootFolders &&
                    rootFolders.length > 0 && (
                      <div className="ml-4 space-y-1">
                        {rootFolders.map((folder) => (
                          <SidebarMenuItem key={folder.id}>
                            <SidebarMenuButton
                              asChild
                              isActive={pathname === `/dataroom/${folder.id}`}
                              className="hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                            >
                              <Link href={`/dataroom/${folder.id}`}>
                                <Folder className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                <span className="truncate">{folder.name}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </div>
                    )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <CreateFolderDialog
        open={showCreateFolder}
        onOpenChange={setShowCreateFolder}
      />
      <UploadPdfDialog
        open={showUploadPdf}
        onOpenChange={setShowUploadPdf}
        folderId="root"
      />
    </>
  );
}
