import React from "react";
import { notFound } from "next/navigation";
import {
  validateShareToken,
  getSharedFolderData,
  getSharedFolders,
  getSharedFiles,
  getSharedFolderPath,
} from "@/lib/actions/share";
import { SharedDataRoomContent } from "@/components/dataroom/shared-data-room-content";
import { Eye } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface SharePageProps {
  params: {
    token: string;
  };
  searchParams: {
    folderId?: string;
  };
}

export default async function SharePage({
  params,
  searchParams,
}: SharePageProps) {
  const { token } = await params;
  const { folderId: queryFolderId } = await searchParams;

  // Validate token
  const initialFolderId = await validateShareToken(token);

  if (!initialFolderId) {
    notFound();
  }

  // Use query folderId if provided, otherwise use the initial folder
  const currentFolderId = queryFolderId || initialFolderId;

  // Get folder data
  const { ownerEmail } = await getSharedFolderData(currentFolderId);

  // Get folders and files in this folder
  const folders = await getSharedFolders(currentFolderId);
  const files = await getSharedFiles(currentFolderId);

  // Get folder path for breadcrumbs
  const folderPath = await getSharedFolderPath(currentFolderId);

  // Find the root shared folder name
  const rootFolder = await getSharedFolderData(initialFolderId);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {rootFolder.folder.name}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Shared by {ownerEmail}
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full">
              <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Read Only
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumbs */}
      {folderPath.length > 1 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              {folderPath.map((pathFolder, index) => (
                <React.Fragment key={pathFolder.id}>
                  <BreadcrumbItem>
                    {index < folderPath.length - 1 ? (
                      <BreadcrumbLink
                        href={`/share/${token}?folderId=${pathFolder.id}`}
                      >
                        {pathFolder.name}
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{pathFolder.name}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {index < folderPath.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <SharedDataRoomContent
          token={token}
          folderId={currentFolderId}
          folders={folders}
          files={files}
        />
      </main>
    </div>
  );
}
