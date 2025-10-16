"use client";

import { useState } from "react";
import { useFolderPath } from "@/lib/queries/folders";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import {
  ChevronRight,
  ChevronDown,
  FolderPlus,
  FolderPen,
  Copy,
  FolderX,
} from "lucide-react";
import { useUser } from "@/lib/supabase/client";
import { createShareLink } from "@/lib/actions/share";
import { toast } from "sonner";
import { CreateFolderDialog } from "@/components/folders/create-folder-dialog";
import { RenameFolderDialog } from "@/components/folders/rename-folder-dialog";
import { DeleteFolderDialog } from "@/components/folders/delete-folder-dialog";
import { useRouter } from "next/navigation";

interface BreadcrumbsProps {
  folderId?: string;
}

export function Breadcrumbs({ folderId }: BreadcrumbsProps) {
  const { data: path, isLoading } = useFolderPath(folderId ?? "root");
  const { data: user } = useUser();
  const router = useRouter();

  // Dialog states
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showRenameFolder, setShowRenameFolder] = useState(false);
  const [showDeleteFolder, setShowDeleteFolder] = useState(false);
  const [createFolderParentId, setCreateFolderParentId] = useState<
    string | null
  >(null);

  if (isLoading) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <div className="h-4 w-32 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  // Get current folder (last in path or root)
  const currentFolder = path && path.length > 0 ? path[path.length - 1] : null;
  const currentFolderId = currentFolder?.id || null;

  // Truncate long folder names
  const truncateName = (name: string) => {
    if (name.length > 20) {
      return name.substring(0, 20) + "...";
    }
    return name;
  };

  // Handle copy share link
  const handleCopyShareLink = async () => {
    if (!currentFolderId) {
      toast.error("Cannot share root folder");
      return;
    }

    try {
      const token = await createShareLink(currentFolderId);
      const shareUrl = `${window.location.origin}/share/${token}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to create share link");
      console.error(error);
    }
  };

  // Handle delete complete
  const handleDeleteComplete = () => {
    if (currentFolder?.parent_id) {
      router.push(`/dataroom/${currentFolder.parent_id}`);
    } else {
      router.push("/dataroom/root");
    }
    toast.success("Folder deleted successfully");
  };

  // Check if user can modify (user must own the folder)
  const canModify = currentFolder?.user_id === user?.id;

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dataroom/root">
                Data Room (
                {user?.email ? `${user.email.slice(0, 10)}...` : "root"})
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          {path && path.length > 0 && (
            <>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>

              {path.map((folder, index) => (
                <div key={folder.id} className="flex items-center">
                  {index > 0 && (
                    <BreadcrumbSeparator>
                      <ChevronRight className="h-4 w-4" />
                    </BreadcrumbSeparator>
                  )}
                  <BreadcrumbItem>
                    {index === path.length - 1 ? (
                      <BreadcrumbPage className="hover:bg-muted/30 px-2 py-2 -ml-2 rounded-md transition cursor-pointer">
                        <DropdownMenu
                          open={dropdownOpen}
                          onOpenChange={setDropdownOpen}
                        >
                          <DropdownMenuTrigger asChild>
                            <div className="flex gap-1 items-center">
                              {truncateName(folder.name)}
                              <ChevronDown className="h-4 w-4" />
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            className="w-56 mt-2"
                            align="end"
                          >
                            <DropdownMenuGroup>
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onSelect={() => {
                                  setCreateFolderParentId(currentFolderId);
                                  setShowCreateFolder(true);
                                }}
                              >
                                <FolderPlus className="h-4 w-4 mr-2" />
                                New Folder
                                <DropdownMenuShortcut>⌘/</DropdownMenuShortcut>
                              </DropdownMenuItem>
                              {canModify && (
                                <DropdownMenuItem
                                  className="cursor-pointer"
                                  onSelect={() => {
                                    setShowRenameFolder(true);
                                  }}
                                >
                                  <FolderPen className="h-4 w-4 mr-2" />
                                  Rename
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onSelect={handleCopyShareLink}
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Share Link
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                            {canModify && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                  <DropdownMenuItem
                                    onSelect={() => {
                                      setShowDeleteFolder(true);
                                    }}
                                    className="text-destructive focus:text-destructive cursor-pointer"
                                  >
                                    <FolderX className="h-4 w-4 mr-2 text-destructive" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuGroup>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={`/dataroom/${folder.id}`}>
                          {folder.name}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </div>
              ))}
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Dialogs */}
      {currentFolder && (
        <>
          <CreateFolderDialog
            open={showCreateFolder}
            onOpenChange={setShowCreateFolder}
            parentId={createFolderParentId}
          />
          <RenameFolderDialog
            open={showRenameFolder}
            onOpenChange={setShowRenameFolder}
            folderId={currentFolder.id}
            currentName={currentFolder.name}
          />
          <DeleteFolderDialog
            open={showDeleteFolder}
            onOpenChange={setShowDeleteFolder}
            folderId={currentFolder.id}
            folderName={currentFolder.name}
            onDeleteComplete={handleDeleteComplete}
          />
        </>
      )}
    </>
  );
}
