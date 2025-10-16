"use client";

import { useState } from "react";
import {
  Folder,
  File as FileIcon,
  ChevronRight,
  ChevronDown,
  FolderOpen,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Folder as FolderType, File } from "@/lib/types";

interface FolderTreeItemProps {
  folder: FolderType;
  allFolders: FolderType[];
  allFiles: File[];
  level?: number;
}

export function FolderTreeItem({
  folder,
  allFolders,
  allFiles,
  level = 0,
}: FolderTreeItemProps) {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(true); // Default to expanded

  // Find child folders
  const childFolders = allFolders.filter((f) => f.parent_id === folder.id);

  // Find files in this folder
  const folderFiles = allFiles.filter((f) => f.folder_id === folder.id);

  const hasChildren = childFolders.length > 0 || folderFiles.length > 0;
  const isActive = pathname === `/dataroom/${folder.id}`;

  return (
    <>
      <SidebarMenuItem>
        <div className="flex items-center w-full">
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex-shrink-0"
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3 text-gray-500" />
              ) : (
                <ChevronRight className="h-3 w-3 text-gray-500" />
              )}
            </button>
          ) : (
            <span className="w-6 flex-shrink-0" />
          )}
          <SidebarMenuButton
            asChild
            isActive={isActive}
            className="hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex-1"
          >
            <Link href={`/dataroom/${folder.id}`} className="flex items-center">
              {isExpanded ? (
                <FolderOpen className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              ) : (
                <Folder className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              )}
              <span className="truncate ml-0">{folder.name}</span>
            </Link>
          </SidebarMenuButton>
        </div>
      </SidebarMenuItem>

      {/* Render children when expanded */}
      {isExpanded && hasChildren && (
        <div className="ml-6 space-y-1">
          {/* Render child folders */}
          {childFolders.map((childFolder) => (
            <FolderTreeItem
              key={childFolder.id}
              folder={childFolder}
              allFolders={allFolders}
              allFiles={allFiles}
              level={level + 1}
            />
          ))}

          {/* Render files in this folder */}
          {folderFiles.map((file) => (
            <SidebarMenuItem key={file.id}>
              <SidebarMenuButton className="hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer pl-1">
                <FileIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <span className="truncate text-sm ml-0">{file.name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </div>
      )}
    </>
  );
}
