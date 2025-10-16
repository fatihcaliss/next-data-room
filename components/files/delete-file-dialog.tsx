"use client";

import { useDeleteFile } from "@/lib/queries/files";
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

interface DeleteFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileId: string;
  fileName: string;
}

export function DeleteFileDialog({
  open,
  onOpenChange,
  fileId,
  fileName,
}: DeleteFileDialogProps) {
  const deleteFile = useDeleteFile();

  const handleDelete = async () => {
    try {
      await deleteFile.mutateAsync(fileId);
      toast.success("File deleted successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete file"
      );
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete File</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{fileName}&quot;? This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteFile.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteFile.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
