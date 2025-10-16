"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { UploadFileData } from "@/lib/types";

export async function uploadFile(data: UploadFileData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Validate file type
  if (data.file.type !== "application/pdf") {
    throw new Error("Only PDF files are allowed");
  }

  // Validate file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (data.file.size > maxSize) {
    throw new Error("File size must be less than 10MB");
  }

  // Create storage path
  const fileExt = data.file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2)}.${fileExt}`;
  const storagePath = `${user.id}/${fileName}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(storagePath, data.file);

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  // Create file record in database
  // Handle special cases where folder_id is "root" or "null" - treat as null
  const actualFolderId =
    data.folder_id === "root" || data.folder_id === "null"
      ? null
      : data.folder_id;

  const { data: file, error: dbError } = await supabase
    .from("files")
    .insert({
      name: data.file.name,
      folder_id: actualFolderId,
      user_id: user.id,
      storage_path: storagePath,
      size: data.file.size,
    })
    .select()
    .single();

  if (dbError) {
    // Clean up uploaded file if database insert fails
    await supabase.storage.from("documents").remove([storagePath]);
    throw new Error(dbError.message);
  }

  revalidatePath("/dataroom");
  return file;
}

export async function deleteFile(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Get file info first
  const { data: file, error: fetchError } = await supabase
    .from("files")
    .select("storage_path")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !file) {
    throw new Error("File not found");
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from("files")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (dbError) {
    throw new Error(dbError.message);
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from("documents")
    .remove([file.storage_path]);

  if (storageError) {
    console.error("Failed to delete file from storage:", storageError);
  }

  revalidatePath("/dataroom");
}

export async function getFiles(folderId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Handle special cases where folderId is "root" or "null" - treat as null
  const actualFolderId =
    folderId === "root" || folderId === "null" ? null : folderId;

  let query = supabase
    .from("files")
    .select("*")
    .eq("user_id", user.id)
    .order("name");

  if (actualFolderId === null) {
    query = query.is("folder_id", null);
  } else {
    query = query.eq("folder_id", actualFolderId);
  }

  const { data: files, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return files;
}

export async function getFileUrl(fileId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: file, error } = await supabase
    .from("files")
    .select("storage_path")
    .eq("id", fileId)
    .eq("user_id", user.id)
    .single();

  if (error || !file) {
    throw new Error("File not found");
  }

  const { data } = await supabase.storage
    .from("documents")
    .createSignedUrl(file.storage_path, 3600); // 1 hour expiry

  return data?.signedUrl;
}

export async function getAllFiles() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: files, error } = await supabase
    .from("files")
    .select("*")
    .eq("user_id", user.id)
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return files;
}
