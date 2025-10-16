export interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface File {
  id: string;
  name: string;
  folder_id: string;
  user_id: string;
  storage_path: string;
  size: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
}

export interface CreateFolderData {
  name: string;
  parent_id: string | null;
}

export interface UpdateFolderData {
  name: string;
}

export interface UpdateFileData {
  name: string;
}

export interface UploadFileData {
  file: File;
  folder_id: string;
}

export interface BreadcrumbItem {
  id: string;
  name: string;
  path: string;
}
