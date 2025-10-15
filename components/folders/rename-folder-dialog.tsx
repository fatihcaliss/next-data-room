'use client';

import { useState, useEffect } from 'react';
import { useUpdateFolder } from '@/lib/queries/folders';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface RenameFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderId: string;
  currentName: string;
}

export function RenameFolderDialog({ open, onOpenChange, folderId, currentName }: RenameFolderDialogProps) {
  const [name, setName] = useState('');
  const updateFolder = useUpdateFolder();

  useEffect(() => {
    if (open) {
      setName(currentName);
    }
  }, [open, currentName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Folder name is required');
      return;
    }

    if (name.trim() === currentName) {
      onOpenChange(false);
      return;
    }

    try {
      await updateFolder.mutateAsync({
        id: folderId,
        data: { name: name.trim() },
      });
      
      toast.success('Folder renamed successfully');
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to rename folder');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Folder</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="folderName">Folder Name</Label>
            <Input
              id="folderName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter folder name"
              className="mt-1"
              autoFocus
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateFolder.isPending}
            >
              {updateFolder.isPending ? 'Renaming...' : 'Rename'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
