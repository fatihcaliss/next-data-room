"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, Loader2, Eye } from "lucide-react";
import { toast } from "sonner";
import { createShareLink } from "@/lib/actions/share";

interface ShareLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderId: string;
  folderName: string;
}

export function ShareLinkDialog({
  open,
  onOpenChange,
  folderId,
  folderName,
}: ShareLinkDialogProps) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);

  useEffect(() => {
    if (open && !shareToken) {
      generateShareLink();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, folderId]);

  const generateShareLink = async () => {
    try {
      setLoading(true);
      const token = await createShareLink(folderId);
      setShareToken(token);
    } catch (error) {
      console.error("Failed to generate share link", error);
      toast.error("Failed to generate share link");
    } finally {
      setLoading(false);
    }
  };

  const shareUrl = shareToken
    ? `${window.location.origin}/share/${shareToken}`
    : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Share link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link", error);
      toast.error("Failed to copy link");
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset token after closing to regenerate on next open if needed
    setTimeout(() => setShareToken(null), 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Folder</DialogTitle>
          <DialogDescription>
            Anyone with this link can view the contents of this folder in
            read-only mode.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-blue-600 dark:text-blue-400">
                  This link provides read-only access
                </span>
              </div>

              <div>
                <Label htmlFor="shareUrl">
                  Share Link for &quot;{folderName}&quot;
                </Label>
                <div className="flex space-x-2 mt-1">
                  <Input
                    id="shareUrl"
                    value={shareUrl}
                    readOnly
                    className="flex-1 font-mono text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCopy}
                    className="px-3"
                    disabled={!shareUrl}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleClose}>Done</Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
