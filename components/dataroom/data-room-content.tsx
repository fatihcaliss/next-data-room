"use client";

import { useState } from "react";
import { useFolders } from "@/lib/queries/folders";
import { useFiles as useFilesQuery } from "@/lib/queries/files";
import { CreateFolderDialog } from "@/components/folders/create-folder-dialog";
import { UploadPdfDialog } from "@/components/files/upload-pdf-dialog";
import { Button } from "@/components/ui/button";
import { FolderPlus, Upload, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { TableRow } from "./table-row";
import { deleteFolder } from "@/lib/actions/folders";
import { deleteFile } from "@/lib/actions/files";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "../ui/checkbox";

interface DataRoomContentProps {
  folderId: string;
}

export function DataRoomContent({ folderId }: DataRoomContentProps) {
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showUploadPdf, setShowUploadPdf] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  const queryClient = useQueryClient();

  const { data: folders, isLoading: foldersLoading } = useFolders(
    folderId === "root" ? null : folderId
  );
  const { data: files, isLoading: filesLoading } = useFilesQuery(
    folderId === "root" ? "root" : folderId
  );

  const isLoading = foldersLoading || filesLoading;

  // Get all items (folders + files)
  const allItems = [
    ...(folders || []).map((f) => ({ id: f.id, type: "folder" as const })),
    ...(files || []).map((f) => ({ id: f.id, type: "file" as const })),
  ];

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(allItems.map((item) => item.id));
      setSelectedItems(allIds);
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleClearSelection = () => {
    setSelectedItems(new Set());
  };

  const handleDeleteAll = async () => {
    if (selectedItems.size === 0) return;

    setIsDeleting(true);
    const toastId = toast.loading(`Deleting ${selectedItems.size} item(s)...`);

    try {
      const deletePromises = allItems
        .filter((item) => selectedItems.has(item.id))
        .map((item) => {
          if (item.type === "folder") {
            return deleteFolder(item.id);
          } else {
            return deleteFile(item.id);
          }
        });

      const results = await Promise.allSettled(deletePromises);

      // Count successes and failures
      const succeeded = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      if (failed === 0) {
        toast.success(`Successfully deleted ${succeeded} item(s)`, {
          id: toastId,
        });
      } else {
        toast.warning(`Deleted ${succeeded} item(s), ${failed} failed`, {
          id: toastId,
        });
      }

      // Clear selection and refresh data
      setSelectedItems(new Set());
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({ queryKey: ["files"] });
    } catch (error) {
      console.error("Delete all failed:", error);
      toast.error("Failed to delete items", { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  const isAllSelected =
    allItems.length > 0 && selectedItems.size === allItems.length;
  const isSomeSelected =
    selectedItems.size > 0 && selectedItems.size < allItems.length;

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: "/",
      metaKey: true,
      action: () => setShowCreateFolder(true),
    },
    {
      key: ".",
      metaKey: true,
      action: () => setShowUploadPdf(true),
    },
  ]);

  return (
    <div className="space-y-6 p-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">
          {folderId === "root" ? "Data Room" : "Folder Contents"}
        </h2>
        <div className="flex lg:space-x-2  lg:flex-row flex-col gap-2 lg:gap-0">
          <Button
            variant="outline"
            onClick={() => setShowCreateFolder(true)}
            className="bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            New Folder
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowUploadPdf(true)}
            className="bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload PDFs
          </Button>
        </div>
      </div>

      {/* Selection Bar */}
      {selectedItems.size > 0 && (
        <div className="bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              {selectedItems.size} item{selectedItems.size > 1 ? "s" : ""}{" "}
              selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSelection}
              className="h-8 text-sm"
            >
              Clear selection
            </Button>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteAll}
            disabled={isDeleting}
            className="h-8"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? "Deleting..." : `Delete All (${selectedItems.size})`}
          </Button>
        </div>
      )}

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
          {(folders && folders.length > 0) || (files && files.length > 0) ? (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400">
                <div className="col-span-1">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                  />
                </div>
                <div className="col-span-5">Name</div>
                <div className="col-span-3">Size</div>
                <div className="col-span-2">Modified</div>
                <div className="col-span-1"></div>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {/* Folders */}
                {folders &&
                  folders.map((folder) => (
                    <TableRow
                      key={folder.id}
                      item={folder}
                      type="folder"
                      isSelected={selectedItems.has(folder.id)}
                      onSelect={(checked) =>
                        handleSelectItem(folder.id, checked)
                      }
                    />
                  ))}

                {/* Files */}
                {files &&
                  files.map((file) => (
                    <TableRow
                      key={file.id}
                      item={file}
                      type="file"
                      isSelected={selectedItems.has(file.id)}
                      onSelect={(checked) => handleSelectItem(file.id, checked)}
                    />
                  ))}
              </div>
            </div>
          ) : (
            /* Empty state */
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400 mb-4">
                <FolderPlus className="h-12 w-12 mx-auto mb-2" />
                <p className="text-lg">No folders or files yet</p>
                <p className="text-sm">
                  Create a folder or upload some PDFs to get started
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dialogs */}
      <CreateFolderDialog
        open={showCreateFolder}
        onOpenChange={setShowCreateFolder}
        parentId={folderId === "root" ? null : folderId}
      />
      <UploadPdfDialog
        open={showUploadPdf}
        onOpenChange={setShowUploadPdf}
        folderId={folderId === "root" ? "root" : folderId}
      />
    </div>
  );
}
