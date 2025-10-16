"use client";

import { useState, useRef } from "react";
import { useUploadFile, useFiles } from "@/lib/queries/files";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
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

interface UploadPdfDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderId: string;
}

export function UploadPdfDialog({
  open,
  onOpenChange,
  folderId,
}: UploadPdfDialogProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [duplicateFiles, setDuplicateFiles] = useState<File[]>([]);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadFile = useUploadFile();
  const { data: existingFiles } = useFiles(folderId);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const pdfFiles = Array.from(files).filter(
      (file) => file.type === "application/pdf"
    );

    if (pdfFiles.length !== files.length) {
      toast.error("Only PDF files are allowed");
    }

    // Check file sizes (10MB limit)
    const oversizedFiles = pdfFiles.filter(
      (file) => file.size > 10 * 1024 * 1024
    );
    if (oversizedFiles.length > 0) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setSelectedFiles((prev) => [...prev, ...pdfFiles]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const checkForDuplicates = () => {
    if (!existingFiles) return [];

    const existingFileNames = new Set(existingFiles.map((f) => f.name));
    return selectedFiles.filter((file) => existingFileNames.has(file.name));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    // Check for duplicate file names
    const duplicates = checkForDuplicates();
    if (duplicates.length > 0) {
      setDuplicateFiles(duplicates);
      setShowDuplicateDialog(true);
      return;
    }

    await performUpload(selectedFiles);
  };

  const performUpload = async (filesToUpload: File[]) => {
    try {
      let successCount = 0;
      for (const file of filesToUpload) {
        await uploadFile.mutateAsync({
          file,
          folder_id: folderId,
        });
        successCount++;
      }

      toast.success(`${successCount} file(s) uploaded successfully`);
      setSelectedFiles([]);
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload files"
      );
    }
  };

  const handleSkipDuplicates = async () => {
    setShowDuplicateDialog(false);

    // Filter out duplicate files
    const duplicateNames = new Set(duplicateFiles.map((f) => f.name));
    const filesToUpload = selectedFiles.filter(
      (file) => !duplicateNames.has(file.name)
    );

    if (filesToUpload.length > 0) {
      await performUpload(filesToUpload);
    } else {
      toast.info("No files to upload after skipping duplicates");
      setSelectedFiles([]);
      onOpenChange(false);
    }
  };

  const handleCancelUpload = () => {
    setShowDuplicateDialog(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload PDF Files</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Drop zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Drag and drop PDF files here, or click to select
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Select Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf"
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
              />
            </div>

            {/* Selected files */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Selected Files:</h4>
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                  >
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-red-500" />
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={uploadFile.isPending || selectedFiles.length === 0}
              >
                {uploadFile.isPending
                  ? "Uploading..."
                  : `Upload ${selectedFiles.length} file(s)`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Duplicate files alert dialog */}
      <AlertDialog
        open={showDuplicateDialog}
        onOpenChange={setShowDuplicateDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Duplicate Files Detected
            </AlertDialogTitle>
            <AlertDialogDescription>
              The following file(s) already exist in this folder:
              <div className="mt-3 space-y-2">
                {duplicateFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded border border-yellow-200 dark:border-yellow-800"
                  >
                    <FileText className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                      {file.name}
                    </span>
                  </div>
                ))}
              </div>
              <span className="mt-3 text-sm block">
                Would you like to skip these files and upload the rest?
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelUpload}>
              Cancel Upload
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSkipDuplicates}>
              Skip Duplicates & Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
