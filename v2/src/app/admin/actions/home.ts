"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { updateHomeSettings as updateHomeSettingsData } from "@/lib/data";
import type { HomeSettings } from "@/types";

// 认证检查辅助函数
async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    return { error: "未授权访问" };
  }
  return null;
}

export async function updateHomeSettings(data: Partial<HomeSettings>) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    await updateHomeSettingsData(data);
    revalidatePath("/");
    revalidatePath("/admin/home");
    return { success: true };
  } catch {
    return { error: "保存失败，请重试" };
  }
}

export async function updateFeaturedPaintings(ids: string[]) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    // 验证精选数量
    if (ids.length < 3 || ids.length > 6) {
      return { error: "精选画作数量需要在 3-6 幅之间" };
    }

    await updateHomeSettingsData({ featuredPaintingIds: ids });
    revalidatePath("/");
    revalidatePath("/admin/home");
    return { success: true };
  } catch {
    return { error: "保存失败，请重试" };
  }
}
