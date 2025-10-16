"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  uploadFile,
  deleteFile,
  getFiles,
  getFileUrl,
  getAllFiles,
} from "@/lib/actions/files";
import { UploadFileData } from "@/lib/types";

export function useFiles(folderId: string) {
  return useQuery({
    queryKey: ["files", folderId],
    queryFn: () => getFiles(folderId),
  });
}

export function useAllFiles() {
  return useQuery({
    queryKey: ["files", "all"],
    queryFn: () => getAllFiles(),
  });
}

export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });
}

export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });
}

export function useFileUrl(fileId: string) {
  return useQuery({
    queryKey: ["fileUrl", fileId],
    queryFn: () => getFileUrl(fileId),
    enabled: !!fileId,
  });
}
