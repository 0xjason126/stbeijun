"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  getPaintingById,
  updatePainting as updatePaintingData,
  deletePainting as deletePaintingData,
  createPainting as createPaintingData,
} from "@/lib/data";
import type { PaintingStatus } from "@/types";

// 认证检查辅助函数
async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    return { error: "未授权访问" };
  }
  return null;
}

export async function togglePublished(id: string, published: boolean) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const painting = await getPaintingById(id);
    if (!painting) {
      return { error: "画作不存在" };
    }

    await updatePaintingData(id, { published });
    revalidatePath("/admin/paintings");
    revalidatePath("/gallery");
    revalidatePath("/");

    return { success: true };
  } catch {
    return { error: "操作失败，请重试" };
  }
}

export async function updatePainting(
  id: string,
  data: {
    title: string;
    description: string;
    year: number;
    status: PaintingStatus;
    dimensions?: string;
  }
) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const painting = await getPaintingById(id);
    if (!painting) {
      return { error: "画作不存在" };
    }

    await updatePaintingData(id, {
      ...data,
      updatedAt: new Date().toISOString(),
    });

    revalidatePath("/admin/paintings");
    revalidatePath(`/admin/paintings/${id}`);
    revalidatePath("/gallery");
    revalidatePath("/");

    return { success: true };
  } catch {
    return { error: "更新失败，请重试" };
  }
}

export async function createPainting(data: {
  title: string;
  description: string;
  year: number;
  status: PaintingStatus;
  dimensions?: string;
  imageUrl: string;
  thumbnailUrl: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const authError = await requireAuth();
  if (authError) return { success: false, ...authError };

  try {
    const newPainting = await createPaintingData({
      ...data,
      published: false,
    });

    revalidatePath("/admin/paintings");

    return { success: true, id: newPainting.id };
  } catch {
    return { success: false, error: "创建画作失败" };
  }
}

export async function deletePainting(id: string) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const painting = await getPaintingById(id);
    if (!painting) {
      return { error: "画作不存在" };
    }

    await deletePaintingData(id);
    revalidatePath("/admin/paintings");
    revalidatePath("/gallery");
    revalidatePath("/");

    return { success: true };
  } catch {
    return { error: "删除失败，请重试" };
  }
}
