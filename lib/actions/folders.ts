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
      .select("id, name, parent_id")
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
