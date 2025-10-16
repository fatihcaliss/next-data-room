"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  File as FileIcon,
  Folder as FolderIcon,
  X,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAllFiles } from "@/lib/queries/files";
import { useAllFolders } from "@/lib/queries/folders";
import { File, Folder } from "@/lib/types";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchResult {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  folder_id?: string | null;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  const { data: files = [] } = useAllFiles();
  const { data: folders = [] } = useAllFolders();

  // Build folder path map
  const folderPathMap = useMemo(() => {
    const map = new Map<string, string>();

    const buildPath = (
      folderId: string,
      visited = new Set<string>()
    ): string => {
      if (visited.has(folderId)) return "";
      visited.add(folderId);

      const folder = folders.find((f: Folder) => f.id === folderId);
      if (!folder) return "";

      if (!folder.parent_id) {
        return folder.name;
      }

      const parentPath = buildPath(folder.parent_id, visited);
      return parentPath ? `${parentPath} / ${folder.name}` : folder.name;
    };

    folders.forEach((folder: Folder) => {
      map.set(folder.id, buildPath(folder.id));
    });

    return map;
  }, [folders]);

  // Search and filter results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    // Search files
    files.forEach((file: File) => {
      if (file.name.toLowerCase().includes(query)) {
        const folderPath = file.folder_id
          ? folderPathMap.get(file.folder_id)
          : null;
        results.push({
          id: file.id,
          name: file.name,
          type: "file",
          path: folderPath || "root",
          folder_id: file.folder_id,
        });
      }
    });

    // Search folders
    folders.forEach((folder: Folder) => {
      if (folder.name.toLowerCase().includes(query)) {
        const parentPath = folder.parent_id
          ? folderPathMap.get(folder.parent_id)
          : null;
        results.push({
          id: folder.id,
          name: folder.name,
          type: "folder",
          path: parentPath || "root",
        });
      }
    });

    return results;
  }, [searchQuery, files, folders, folderPathMap]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchResults]);

  const handleSelectResult = useCallback(
    (result: SearchResult) => {
      if (result.type === "folder") {
        router.push(`/dataroom/${result.id}`);
      } else {
        // Navigate to the folder containing the file
        const folderId = result.folder_id || "root";
        router.push(`/dataroom/${folderId}`);
      }
      onOpenChange(false);
      setSearchQuery("");
    },
    [router, onOpenChange]
  );

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === "Enter" && searchResults.length > 0) {
        e.preventDefault();
        handleSelectResult(searchResults[selectedIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, searchResults, selectedIndex, handleSelectResult]);

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      setSearchQuery("");
      setSelectedIndex(0);
    }
  };

  const fileResults = searchResults.filter((r) => r.type === "file");
  const folderResults = searchResults.filter((r) => r.type === "folder");

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="p-0 gap-0 max-w-2xl ">
        <DialogTitle className="sr-only">Search files and folders</DialogTitle>
        <div className="flex items-center border-b px-4 py-3">
          <Search className="h-5 w-5 text-gray-400 mr-3" />
          <Input
            placeholder="Search files and folders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent dark:text-white placeholder-gray-400 px-0"
            autoFocus
          />
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {searchQuery && searchResults.length === 0 && (
            <div className="px-4 py-8 text-center text-gray-400">
              No results found for &quot;{searchQuery}&quot;
            </div>
          )}

          {!searchQuery && (
            <div className="px-4 py-8 text-center text-gray-400">
              Type to search files and folders...
            </div>
          )}

          {searchQuery && fileResults.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase">
                Files
              </div>
              {fileResults.map((result) => {
                const globalIndex = searchResults.findIndex(
                  (r) => r.id === result.id
                );
                return (
                  <button
                    key={result.id}
                    onClick={() => handleSelectResult(result)}
                    className={`w-full flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 ${
                      selectedIndex === globalIndex
                        ? "bg-gray-100 dark:bg-gray-800"
                        : ""
                    }`}
                  >
                    <FileIcon className="h-4 w-4 text-red-400 mr-3 flex-shrink-0" />
                    <div className="flex-1 text-left min-w-0">
                      <div className="text-sm text-gray-900 dark:text-white truncate">
                        {result.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {result.path}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {searchQuery && folderResults.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase">
                Folders
              </div>
              {folderResults.map((result) => {
                const globalIndex = searchResults.findIndex(
                  (r) => r.id === result.id
                );
                return (
                  <button
                    key={result.id}
                    onClick={() => handleSelectResult(result)}
                    className={`w-full flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 ${
                      selectedIndex === globalIndex
                        ? "bg-gray-100 dark:bg-gray-800"
                        : ""
                    }`}
                  >
                    <FolderIcon className="h-4 w-4 text-blue-400 mr-3 flex-shrink-0" />
                    <div className="flex-1 text-left min-w-0">
                      <div className="text-sm text-gray-900 dark:text-white truncate">
                        {result.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {result.path}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
