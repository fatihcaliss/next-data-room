'use client';

import { useState } from 'react';
import { FileText, MoreVertical, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeleteFileDialog } from './delete-file-dialog';
import { useFileUrl } from '@/lib/queries/files';
import { formatFileSize, formatDate } from '@/lib/utils/format';
import { File as FileType } from '@/lib/types';

interface FileCardProps {
  file: FileType;
}

export function FileCard({ file }: FileCardProps) {
  const [showDelete, setShowDelete] = useState(false);
  const { data: fileUrl } = useFileUrl(file.id);

  const handleDownload = () => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };

  return (
    <>
      <div className="group relative bg-gray-800 border border-gray-700 rounded-lg p-4 hover:bg-gray-750 transition-colors">
        <div className="flex items-center space-x-3 mb-2">
          <FileText className="h-8 w-8 text-red-400" />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-white truncate">{file.name}</h3>
            <p className="text-sm text-gray-400">
              {formatFileSize(file.size)} • Modified {formatDate(file.updated_at)}
            </p>
          </div>
        </div>

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
            <DropdownMenuItem onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
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

      <DeleteFileDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        fileId={file.id}
        fileName={file.name}
      />
    </>
  );
}
