"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Folder,
  FileText,
  MoreVertical,
  Edit,
  Trash2,
  Link as LinkIcon,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RenameFolderDialog } from "@/components/folders/rename-folder-dialog";
import { DeleteFolderDialog } from "@/components/folders/delete-folder-dialog";
import { DeleteFileDialog } from "@/components/files/delete-file-dialog";
import { ShareLinkDialog } from "@/components/share-link-dialog";
import { useFileUrl } from "@/lib/queries/files";
import { formatFileSize, formatDate } from "@/lib/utils/format";
import { Folder as FolderType, File as FileType } from "@/lib/types";
import { toast } from "sonner";

interface TableRowProps {
  item: FolderType | FileType;
  type: "folder" | "file";
}

export function TableRow({ item, type }: TableRowProps) {
  const [showRename, setShowRename] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: fileUrl } = useFileUrl(type === "file" ? item.id : "");

  const handleDownload = async () => {
    if (!fileUrl || !file) return;

    setIsDownloading(true);
    const toastId = toast.loading("Preparing download...");

    try {
      // Fetch the file
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error("Failed to download file");

      // Get the blob
      const blob = await response.blob();

      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = file.name; // Use the original filename

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success(`Downloaded ${file.name}`, { id: toastId });
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Download failed. Opening file in new tab...", {
        id: toastId,
      });
      // Fallback to opening in new tab
      window.open(fileUrl, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  const isFolder = type === "folder";
  const folder = isFolder ? (item as FolderType) : null;
  const file = !isFolder ? (item as FileType) : null;

  return (
    <>
      <div className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-750 transition-colors group">
        <div className="col-span-1 flex items-center">
          <input type="checkbox" className="rounded" />
        </div>

        <div className="col-span-5 flex items-center space-x-3">
          {isFolder ? (
            <Link
              href={`/dataroom/${item.id}`}
              className="flex items-center space-x-3 flex-1"
            >
              <Folder className="h-5 w-5 text-blue-400" />
              <span>{item.name}</span>
            </Link>
          ) : (
            <Link
              href={fileUrl ? fileUrl : ""}
              target="_blank"
              className="flex items-center space-x-3 flex-1"
            >
              <FileText className="h-5 w-5 text-red-400" />
              <span>{item.name}</span>
            </Link>
          )}
        </div>

        <div className="col-span-3 text-gray-400">
          {isFolder ? "-" : formatFileSize(file!.size)}
        </div>

        <div className="col-span-2 text-gray-400">
          {formatDate(item.updated_at)}
        </div>

        <div className="col-span-1 flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isFolder ? (
                <>
                  <DropdownMenuItem onClick={() => setShowRename(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowShare(true)}>
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Copy Share Link
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowDelete(true)}
                    className="text-red-400 focus:text-red-400"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem
                    onClick={handleDownload}
                    disabled={isDownloading || !fileUrl}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isDownloading ? "Downloading..." : "Download"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowDelete(true)}
                    className="text-red-400 focus:text-red-400"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isFolder && folder && (
        <>
          <RenameFolderDialog
            open={showRename}
            onOpenChange={setShowRename}
            folderId={folder.id}
            currentName={folder.name}
          />
          <DeleteFolderDialog
            open={showDelete}
            onOpenChange={setShowDelete}
            folderId={folder.id}
            folderName={folder.name}
          />
          <ShareLinkDialog
            open={showShare}
            onOpenChange={setShowShare}
            folderId={folder.id}
            folderName={folder.name}
          />
        </>
      )}

      {!isFolder && file && (
        <DeleteFileDialog
          open={showDelete}
          onOpenChange={setShowDelete}
          fileId={file.id}
          fileName={file.name}
        />
      )}
    </>
  );
}
