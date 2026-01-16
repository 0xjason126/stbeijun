"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { updateArtist as updateArtistData } from "@/lib/data";
import type { Artist } from "@/types";

// 认证检查辅助函数
async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    return { error: "未授权访问" };
  }
  return null;
}

export async function updateArtist(data: Partial<Artist>) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    await updateArtistData(data);
    revalidatePath("/artist");
    revalidatePath("/admin/artist");
    return { success: true };
  } catch {
    return { error: "保存失败，请重试" };
  }
}
