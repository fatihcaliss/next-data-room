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
          <nav className="flex items-center space-x-2 text-sm">
            {folderPath.map((pathFolder, index) => (
              <div key={pathFolder.id} className="flex items-center">
                {index > 0 && (
                  <span className="mx-2 text-gray-400 dark:text-gray-600">
                    /
                  </span>
                )}
                {index < folderPath.length - 1 ? (
                  <a
                    href={`/share/${token}?folderId=${pathFolder.id}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {pathFolder.name}
                  </a>
                ) : (
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {pathFolder.name}
                  </span>
                )}
              </div>
            ))}
          </nav>
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
