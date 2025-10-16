"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { CreateFolderData, UpdateFolderData } from "@/lib/types";

export async function createFolder(data: CreateFolderData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Handle special cases where parent_id is "root" or "null" - treat as null
  const actualParentId =
    data.parent_id === "root" || data.parent_id === "null"
      ? null
      : data.parent_id;

  // Check if a folder with the same name already exists in the same parent
  let existingQuery = supabase
    .from("folders")
    .select("id")
    .eq("user_id", user.id)
    .eq("name", data.name);

  if (actualParentId === null) {
    existingQuery = existingQuery.is("parent_id", null);
  } else {
    existingQuery = existingQuery.eq("parent_id", actualParentId);
  }

  const { data: existingFolder } = await existingQuery.maybeSingle();

  if (existingFolder) {
    throw new Error("A folder with this name already exists in this location");
  }

  const { data: folder, error } = await supabase
    .from("folders")
    .insert({
      name: data.name,
      parent_id: actualParentId,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dataroom");
  return folder;
}

export async function updateFolder(id: string, data: UpdateFolderData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Get the current folder to find its parent_id
  const { data: currentFolder, error: fetchError } = await supabase
    .from("folders")
    .select("parent_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !currentFolder) {
    throw new Error("Folder not found");
  }

  // Check if a folder with the same name already exists in the same parent (excluding current folder)
  let existingQuery = supabase
    .from("folders")
    .select("id")
    .eq("user_id", user.id)
    .eq("name", data.name)
    .neq("id", id);

  if (currentFolder.parent_id === null) {
    existingQuery = existingQuery.is("parent_id", null);
  } else {
    existingQuery = existingQuery.eq("parent_id", currentFolder.parent_id);
  }

  const { data: existingFolder } = await existingQuery.maybeSingle();

  if (existingFolder) {
    throw new Error("A folder with this name already exists in this location");
  }

  const { error } = await supabase
    .from("folders")
    .update({
      name: data.name,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dataroom");
}

export async function deleteFolder(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("folders")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dataroom");
}

export async function getFolders(parentId: string | null = null) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Handle special cases where parentId is "root" or "null" - treat as null
  const actualParentId =
    parentId === "root" || parentId === "null" ? null : parentId;

  let query = supabase
    .from("folders")
    .select("*")
    .eq("user_id", user.id)
    .order("name");

  if (actualParentId === null) {
    query = query.is("parent_id", null);
  } else {
    query = query.eq("parent_id", actualParentId);
  }

  const { data: folders, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return folders;
}

export async function getFolderPath(folderId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const path = [];
  let currentId = folderId;

  while (currentId) {
    const { data: folder, error } = await supabase
      .from("folders")
      .select("id, name, parent_id, user_id")
      .eq("id", currentId)
      .eq("user_id", user.id)
      .single();

    if (error || !folder) {
      break;
    }

    path.unshift(folder);
    currentId = folder.parent_id;
  }

  return path;
}

export async function getAllFolders() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: folders, error } = await supabase
    .from("folders")
    .select("*")
    .eq("user_id", user.id)
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return folders;
}
