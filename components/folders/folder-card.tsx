'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Folder, MoreVertical, Edit, Trash2, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RenameFolderDialog } from './rename-folder-dialog';
import { DeleteFolderDialog } from './delete-folder-dialog';
import { ShareLinkDialog } from '@/components/share-link-dialog';
import { formatDate } from '@/lib/utils/format';
import { Folder as FolderType } from '@/lib/types';

interface FolderCardProps {
  folder: FolderType;
}

export function FolderCard({ folder }: FolderCardProps) {
  const [showRename, setShowRename] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showShare, setShowShare] = useState(false);

  return (
    <>
      <div className="group relative bg-gray-800 border border-gray-700 rounded-lg p-4 hover:bg-gray-750 transition-colors">
        <Link href={`/dataroom/${folder.id}`} className="block">
          <div className="flex items-center space-x-3 mb-2">
            <Folder className="h-8 w-8 text-blue-400" />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-white truncate">{folder.name}</h3>
              <p className="text-sm text-gray-400">
                Modified {formatDate(folder.updated_at)}
              </p>
            </div>
          </div>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

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
  );
}
