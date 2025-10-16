"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Folder, FileText, Download } from "lucide-react";
import Link from "next/link";
import { formatFileSize } from "@/lib/utils/format";
import { formatDistanceToNow } from "date-fns";
import { getSharedFileUrl } from "@/lib/actions/share";
import { toast } from "sonner";

interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

interface File {
  id: string;
  name: string;
  folder_id: string;
  storage_path: string;
  size: number;
  created_at: string;
  updated_at: string;
}

interface SharedDataRoomContentProps {
  token: string;
  folderId: string;
  folders: Folder[];
  files: File[];
}

export function SharedDataRoomContent({
  token,
  folders,
  files,
}: SharedDataRoomContentProps) {
  const isLoading = false;
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(
    null
  );

  const handleDownload = async (file: File) => {
    setDownloadingFileId(file.id);
    const toastId = toast.loading("Preparing download...");

    try {
      // Get the signed URL for the file
      const fileUrl = await getSharedFileUrl(file.id, token);

      if (!fileUrl) {
        throw new Error("Failed to get file URL");
      }

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
      toast.error("Download failed. Please try again.", { id: toastId });
    } finally {
      setDownloadingFileId(null);
    }
  };
  console.log(folders, files);
  return (
    <div className="space-y-6">
      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Table Layout */}
          {folders.length > 0 || files.length > 0 ? (
            <div className="rounded-lg overflow-hidden">
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400">
                <div className="col-span-6">Name</div>
                <div className="col-span-3">Size</div>
                <div className="col-span-3">Modified</div>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {/* Folders */}
                {folders.map((folder) => (
                  <Link
                    key={folder.id}
                    href={`/share/${token}?folderId=${folder.id}`}
                    className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                  >
                    <div className="col-span-6 flex items-center gap-3">
                      <Folder className="h-5 w-5 text-blue-500 flex-shrink-0" />
                      <span className="truncate font-medium">
                        {folder.name}
                      </span>
                    </div>
                    <div className="col-span-3 flex items-center text-gray-500 dark:text-gray-400">
                      -
                    </div>
                    <div className="col-span-3 flex items-center text-gray-500 dark:text-gray-400 text-sm">
                      {formatDistanceToNow(new Date(folder.updated_at), {
                        addSuffix: true,
                      })}
                    </div>
                  </Link>
                ))}

                {/* Files */}
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <button
                      onClick={async () => {
                        const url = await getSharedFileUrl(file.id, token);
                        if (url) window.open(url, "_blank");
                      }}
                      className="col-span-6 flex items-center gap-3 text-left hover:underline cursor-pointer"
                    >
                      <FileText className="h-5 w-5 text-red-500 flex-shrink-0" />
                      <span className="truncate">{file.name}</span>
                    </button>
                    <div className="col-span-3 flex items-center text-gray-500 dark:text-gray-400 text-sm">
                      {formatFileSize(file.size)}
                    </div>
                    <div className="col-span-3 flex items-center justify-between text-gray-500 dark:text-gray-400 text-sm">
                      <span>
                        {formatDistanceToNow(new Date(file.updated_at), {
                          addSuffix: true,
                        })}
                      </span>
                      <button
                        onClick={() => handleDownload(file)}
                        disabled={downloadingFileId === file.id}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        title={
                          downloadingFileId === file.id
                            ? "Downloading..."
                            : "Download"
                        }
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Empty state */
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400 mb-4">
                <Folder className="h-12 w-12 mx-auto mb-2" />
                <p className="text-lg">This folder is empty</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
