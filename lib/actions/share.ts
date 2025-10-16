"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export async function createShareLink(folderId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Check if the folder belongs to the user
  const { data: folder } = await supabase
    .from("folders")
    .select("id")
    .eq("id", folderId)
    .eq("user_id", user.id)
    .single();

  if (!folder) {
    throw new Error("Folder not found or unauthorized");
  }

  // Check if a share link already exists
  const { data: existingLink } = await supabase
    .from("shared_links")
    .select("token")
    .eq("folder_id", folderId)
    .eq("user_id", user.id)
    .single();

  if (existingLink) {
    return existingLink.token;
  }

  // Generate a unique token
  const token = crypto.randomBytes(32).toString("hex");

  // Create share link
  const { data: shareLink, error } = await supabase
    .from("shared_links")
    .insert({
      token,
      folder_id: folderId,
      user_id: user.id,
    })
    .select("token")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dataroom");
  return shareLink.token;
}

export async function deleteShareLink(folderId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("shared_links")
    .delete()
    .eq("folder_id", folderId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dataroom");
}

export async function validateShareToken(token: string) {
  const supabase = await createClient();

  const { data: shareLink, error } = await supabase
    .from("shared_links")
    .select("folder_id, expires_at")
    .eq("token", token)
    .single();

  if (error || !shareLink) {
    return null;
  }

  // Check if the link has expired
  if (shareLink.expires_at && new Date(shareLink.expires_at) < new Date()) {
    return null;
  }

  return shareLink.folder_id;
}

export async function getSharedFolderData(folderId: string) {
  const supabase = await createClient();

  // Get folder details
  const { data: folder, error: folderError } = await supabase
    .from("folders")
    .select("id, name, parent_id, user_id")
    .eq("id", folderId)
    .single();

  if (folderError || !folder) {
    throw new Error("Folder not found");
  }

  // Get user email from auth.users table using the database function
  let ownerEmail = "Data Room Owner"; // fallback

  const { data: userEmail, error: userError } = await supabase.rpc(
    "get_user_email",
    { user_id: folder.user_id }
  );

  if (!userError && userEmail) {
    ownerEmail = userEmail;
  }

  return {
    folder,
    ownerEmail,
  };
}

export async function getSharedFolders(folderId: string) {
  const supabase = await createClient();

  const { data: folders, error } = await supabase
    .from("folders")
    .select("*")
    .eq("parent_id", folderId)
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return folders || [];
}

export async function getSharedFiles(folderId: string) {
  const supabase = await createClient();

  const { data: files, error } = await supabase
    .from("files")
    .select("*")
    .eq("folder_id", folderId)
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return files || [];
}

export async function getSharedFolderPath(folderId: string) {
  const supabase = await createClient();

  const path = [];
  let currentId = folderId;

  while (currentId) {
    const { data: folder, error } = await supabase
      .from("folders")
      .select("id, name, parent_id")
      .eq("id", currentId)
      .single();

    if (error || !folder) {
      break;
    }

    path.unshift(folder);
    currentId = folder.parent_id;
  }

  return path;
}

export async function getSharedFileUrl(fileId: string, token: string) {
  const supabase = await createClient();

  // Verify the token is valid first
  const { data: shareLink, error: shareLinkError } = await supabase
    .from("shared_links")
    .select("folder_id")
    .eq("token", token)
    .single();

  if (shareLinkError || !shareLink) {
    throw new Error("Invalid share token");
  }

  // Get the file and verify it belongs to a folder within the shared tree
  const { data: file, error: fileError } = await supabase
    .from("files")
    .select("storage_path, folder_id")
    .eq("id", fileId)
    .single();

  if (fileError || !file) {
    throw new Error("File not found");
  }

  // Verify the file is in the shared folder tree
  let currentFolderId = file.folder_id;
  let isInSharedTree = currentFolderId === shareLink.folder_id;

  while (currentFolderId && !isInSharedTree) {
    const { data: folder } = await supabase
      .from("folders")
      .select("parent_id")
      .eq("id", currentFolderId)
      .single();

    if (
      folder?.parent_id === shareLink.folder_id ||
      folder?.parent_id === null
    ) {
      if (folder?.parent_id === shareLink.folder_id) {
        isInSharedTree = true;
      }
      break;
    }

    currentFolderId = folder?.parent_id || null;
    if (currentFolderId === shareLink.folder_id) {
      isInSharedTree = true;
    }
  }

  if (!isInSharedTree) {
    throw new Error("File not in shared folder");
  }

  // Create a signed URL for the file
  const { data } = await supabase.storage
    .from("documents")
    .createSignedUrl(file.storage_path, 3600); // 1 hour expiry

  return data?.signedUrl;
}
