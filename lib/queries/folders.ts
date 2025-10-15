"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createFolder,
  updateFolder,
  deleteFolder,
  getFolders,
  getFolderPath,
} from "@/lib/actions/folders";
import { UpdateFolderData } from "@/lib/types";

export function useFolders(parentId: string | null = null) {
  return useQuery({
    queryKey: ["folders", parentId],
    queryFn: () => getFolders(parentId),
  });
}

export function useFolderPath(folderId: string) {
  return useQuery({
    queryKey: ["folderPath", folderId],
    queryFn: () => getFolderPath(folderId),
  });
}

export function useCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({ queryKey: ["folderPath"] });
    },
  });
}

export function useUpdateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFolderData }) =>
      updateFolder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({ queryKey: ["folderPath"] });
    },
  });
}

export function useDeleteFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({ queryKey: ["folderPath"] });
    },
  });
}
