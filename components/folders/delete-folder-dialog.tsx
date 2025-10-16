"use client";

import { useDeleteFolder } from "@/lib/queries/folders";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface DeleteFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderId: string;
  folderName: string;
}

export function DeleteFolderDialog({
  open,
  onOpenChange,
  folderId,
  folderName,
}: DeleteFolderDialogProps) {
  const deleteFolder = useDeleteFolder();

  const handleDelete = async () => {
    try {
      await deleteFolder.mutateAsync(folderId);
      toast.success("Folder deleted successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete folder"
      );
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Folder</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the folder &quot;{folderName}&quot;?
            This action cannot be undone and will also delete all files and
            subfolders inside it.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteFolder.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteFolder.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
