/**
 * 数据层工具 - Supabase 版本
 */
import { createAdminClient } from "./supabase/server";
import type { DbPainting, DbArtist, DbArtistTimeline } from "./supabase/types";
import type {
  Painting,
  PaintingFilters,
  Artist,
  HomeSettings,
  SiteSettings,
  SettingsData,
  TimelineItem,
} from "@/types";

// ========================================
// 类型转换函数
// ========================================

/**
 * 数据库画作 -> 应用画作类型
 */
function toPainting(row: DbPainting): Painting {
  return {
    id: row.slug,
    title: row.title,
    description: row.description ?? "",
    year: row.year,
    dimensions: row.dimensions ?? undefined,
    status: row.status,
    imageUrl: row.image_url,
    thumbnailUrl: row.thumbnail_url,
    published: row.published,
    order: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * 数据库画家 -> 应用画家类型
 */
function toArtist(row: DbArtist, timeline: DbArtistTimeline[]): Artist {
  return {
    name: row.name,
    title: row.title ?? undefined,
    avatarUrl: row.avatar_url ?? "/images/artists/default.jpg",
    bio: row.bio ?? "",
    timeline: timeline.map((t) => ({
      year: String(t.year),
      title: t.title,
      description: t.description ?? undefined,
    })),
  };
}

// ========================================
// 画作数据操作
// ========================================

/**
 * 获取所有画作
 */
export async function getPaintings(
  filters?: PaintingFilters
): Promise<Painting[]> {
  const supabase = createAdminClient();

  let query = supabase
    .from("paintings")
    .select("*")
    .order("sort_order", { ascending: true });

  // 如果明确指定 published 参数，则按该值筛选
  if (filters && "published" in filters) {
    if (filters.published !== undefined) {
      query = query.eq("published", filters.published);
    }
    // 如果 published 是 undefined，返回所有画作（不筛选）
  } else {
    // 默认只返回已上架的画作
    query = query.eq("published", true);
  }

  // 年份筛选
  if (filters?.year) {
    query = query.eq("year", filters.year);
  }

  // 状态筛选
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  // 搜索筛选
  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("getPaintings error:", error);
    return [];
  }

  return (data ?? []).map(toPainting);
}

/**
 * 获取单个画作
 */
export async function getPainting(id: string): Promise<Painting | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("paintings")
    .select("*")
    .eq("slug", id)
    .single();

  if (error || !data) {
    return null;
  }

  return toPainting(data);
}

/**
 * 获取单个画作 (别名)
 */
export const getPaintingById = getPainting;

/**
 * 获取所有年份（用于筛选下拉）
 */
export async function getYears(): Promise<number[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("paintings")
    .select("year")
    .eq("published", true);

  if (error || !data) {
    return [];
  }

  const years = new Set(data.map((p) => p.year));
  return [...years].sort((a, b) => b - a);
}

/**
 * 创建画作
 */
export async function createPainting(
  input: Omit<Painting, "id" | "order" | "createdAt" | "updatedAt">
): Promise<Painting> {
  const supabase = createAdminClient();

  // 获取最大 slug 数字
  const { data: existing } = await supabase
    .from("paintings")
    .select("slug")
    .order("slug", { ascending: false })
    .limit(1);

  const maxNum = existing?.[0]
    ? parseInt(existing[0].slug.replace("p", ""), 10)
    : 0;
  const newSlug = `p${String(maxNum + 1).padStart(3, "0")}`;

  // 获取最大 sort_order
  const { data: orderData } = await supabase
    .from("paintings")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);

  const maxOrder = orderData?.[0]?.sort_order ?? 0;

  const { data, error } = await supabase
    .from("paintings")
    .insert({
      slug: newSlug,
      title: input.title,
      description: input.description,
      year: input.year,
      dimensions: input.dimensions ?? null,
      status: input.status,
      image_url: input.imageUrl,
      thumbnail_url: input.thumbnailUrl,
      published: input.published,
      sort_order: maxOrder + 1,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error("Failed to create painting");
  }

  return toPainting(data);
}

/**
 * 更新画作
 */
export async function updatePainting(
  id: string,
  input: Partial<Omit<Painting, "id" | "createdAt">>
): Promise<Painting | null> {
  const supabase = createAdminClient();

  // 构建更新对象，只包含需要更新的字段
  const updateData: Record<string, unknown> = {};

  if (input.title !== undefined) updateData.title = input.title;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.year !== undefined) updateData.year = input.year;
  if (input.dimensions !== undefined) updateData.dimensions = input.dimensions;
  if (input.status !== undefined) updateData.status = input.status;
  if (input.imageUrl !== undefined) updateData.image_url = input.imageUrl;
  if (input.thumbnailUrl !== undefined) updateData.thumbnail_url = input.thumbnailUrl;
  if (input.published !== undefined) updateData.published = input.published;
  if (input.order !== undefined) updateData.sort_order = input.order;

  const { data, error } = await supabase
    .from("paintings")
    .update(updateData)
    .eq("slug", id)
    .select()
    .single();

  if (error || !data) {
    return null;
  }

  return toPainting(data);
}

/**
 * 删除画作
 */
export async function deletePainting(id: string): Promise<boolean> {
  const supabase = createAdminClient();

  const { error } = await supabase.from("paintings").delete().eq("slug", id);

  return !error;
}

/**
 * 切换画作上架状态
 */
export async function togglePublished(id: string): Promise<Painting | null> {
  const painting = await getPainting(id);
  if (!painting) {
    return null;
  }
  return updatePainting(id, { published: !painting.published });
}

// ========================================
// 画家数据操作
// ========================================

/**
 * 获取画家信息
 */
export async function getArtist(): Promise<Artist> {
  const supabase = createAdminClient();

  const { data: artistData, error: artistError } = await supabase
    .from("artist")
    .select("*")
    .limit(1)
    .single();

  if (artistError || !artistData) {
    // 返回默认值
    return {
      name: "贝军",
      title: "国画艺术家",
      avatarUrl: "/images/artists/beijun.jpg",
      bio: "",
      timeline: [],
    };
  }

  // 获取时间线
  const { data: timelineData } = await supabase
    .from("artist_timeline")
    .select("*")
    .eq("artist_id", artistData.id)
    .order("sort_order", { ascending: true });

  return toArtist(artistData, timelineData ?? []);
}

/**
 * 更新画家信息
 */
export async function updateArtist(input: Partial<Artist>): Promise<Artist> {
  const supabase = createAdminClient();

  // 获取当前画家
  const { data: existing } = await supabase
    .from("artist")
    .select("id")
    .limit(1)
    .single();

  if (!existing) {
    throw new Error("Artist not found");
  }

  const updateData: Record<string, unknown> = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.title !== undefined) updateData.title = input.title;
  if (input.avatarUrl !== undefined) updateData.avatar_url = input.avatarUrl;
  if (input.bio !== undefined) updateData.bio = input.bio;

  await supabase.from("artist").update(updateData).eq("id", existing.id);

  // 如果有时间线更新
  if (input.timeline) {
    // 删除旧的时间线
    await supabase
      .from("artist_timeline")
      .delete()
      .eq("artist_id", existing.id);

    // 插入新的时间线
    if (input.timeline.length > 0) {
      await supabase.from("artist_timeline").insert(
        input.timeline.map((item, index) => ({
          artist_id: existing.id,
          year: parseInt(item.year, 10),
          title: item.title,
          description: item.description ?? null,
          sort_order: index,
        }))
      );
    }
  }

  return getArtist();
}

// ========================================
// 网站设置操作
// ========================================

/**
 * 获取网站设置
 */
export async function getSettings(): Promise<SettingsData> {
  const supabase = createAdminClient();

  const { data } = await supabase.from("site_settings").select("*");

  const settings: SettingsData = {
    site: {
      siteName: "贝军国画",
      wechatId: "",
      wechatQrCode: "",
      icp: "",
    },
    home: {
      hero: {
        backgroundImage: "/images/hero.jpg",
        title: "贝军国画",
        subtitle: "传承与创新",
      },
      featuredPaintingIds: [],
      artistStatement: "",
    },
    lastUpdated: new Date().toISOString(),
  };

  if (data) {
    for (const row of data) {
      if (row.key === "site") {
        settings.site = row.value as SiteSettings;
      } else if (row.key === "home") {
        settings.home = row.value as HomeSettings;
      }
    }
  }

  return settings;
}

/**
 * 获取首页设置
 */
export async function getHomeSettings(): Promise<HomeSettings> {
  const settings = await getSettings();
  return settings.home;
}

/**
 * 获取网站全局设置
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  const settings = await getSettings();
  return settings.site;
}

/**
 * 更新首页设置
 */
export async function updateHomeSettings(
  input: Partial<HomeSettings>
): Promise<HomeSettings> {
  const supabase = createAdminClient();
  const current = await getHomeSettings();
  const updated = { ...current, ...input };

  await supabase.from("site_settings").upsert({
    key: "home",
    value: updated,
  });

  return updated;
}

/**
 * 更新网站设置
 */
export async function updateSiteSettings(
  input: Partial<SiteSettings>
): Promise<SiteSettings> {
  const supabase = createAdminClient();
  const current = await getSiteSettings();
  const updated = { ...current, ...input };

  await supabase.from("site_settings").upsert({
    key: "site",
    value: updated,
  });

  return updated;
}

// ========================================
// 精选画作操作
// ========================================

/**
 * 获取精选画作
 */
export async function getFeaturedPaintings(): Promise<Painting[]> {
  const supabase = createAdminClient();

  // 从 featured_paintings 表获取，按 sort_order 排序
  const { data: featured } = await supabase
    .from("featured_paintings")
    .select("painting_id, sort_order")
    .order("sort_order", { ascending: true });

  if (!featured || featured.length === 0) {
    return [];
  }

  // 获取对应的画作
  const paintingIds = featured.map((f) => f.painting_id);
  const { data: paintings } = await supabase
    .from("paintings")
    .select("*")
    .in("id", paintingIds)
    .eq("published", true);

  if (!paintings) {
    return [];
  }

  // 按 featured 顺序排列
  const paintingMap = new Map(paintings.map((p) => [p.id, p]));
  return featured
    .map((f) => paintingMap.get(f.painting_id))
    .filter((p): p is DbPainting => p !== undefined)
    .map(toPainting);
}

/**
 * 更新精选画作
 */
export async function updateFeaturedPaintings(slugs: string[]): Promise<void> {
  const supabase = createAdminClient();

  // 获取 slug 对应的 id
  const { data: paintings } = await supabase
    .from("paintings")
    .select("id, slug")
    .in("slug", slugs);

  if (!paintings) return;

  const slugToId = new Map(paintings.map((p) => [p.slug, p.id]));

  // 清空现有精选
  await supabase.from("featured_paintings").delete().neq("id", "");

  // 插入新的精选
  const inserts = slugs
    .map((slug, index) => {
      const id = slugToId.get(slug);
      if (!id) return null;
      return {
        painting_id: id,
        sort_order: index,
      };
    })
    .filter((item): item is { painting_id: string; sort_order: number } => item !== null);

  if (inserts.length > 0) {
    await supabase.from("featured_paintings").insert(inserts);
  }
}
