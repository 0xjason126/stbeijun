/**
 * 数据迁移脚本
 * 将 JSON 文件中的数据迁移到 Supabase PostgreSQL
 *
 * 运行方式: npx dotenv -e .env.local -- npx tsx scripts/migrate-data.ts
 * 注意: 需要先运行 migrate-images.ts 生成 url-mappings.json
 */

import { createClient } from "@supabase/supabase-js";
import { readFile } from "fs/promises";
import path from "path";

// 配置
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("请设置环境变量: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface UrlMapping {
  oldUrl: string;
  newUrl: string;
  thumbnailUrl: string;
}

interface OldPainting {
  id: string;
  title: string;
  description: string;
  year: number;
  dimensions?: string;
  status: "售卖中" | "可定制" | "已售出";
  imageUrl: string;
  thumbnailUrl: string;
  published: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface OldArtist {
  name: string;
  title?: string;
  avatarUrl: string;
  bio: string;
  timeline?: Array<{
    year: string;
    title: string;
    description?: string;
  }>;
}

interface OldSettings {
  site: {
    siteName: string;
    wechatId: string;
    wechatQrCode: string;
    icp: string;
  };
  home: {
    hero: {
      backgroundImage: string;
      title: string;
      subtitle: string;
    };
    featuredPaintingIds: string[];
    artistStatement: string;
  };
  lastUpdated: string;
}

async function loadUrlMappings(): Promise<Map<string, UrlMapping>> {
  try {
    const content = await readFile(
      path.join(process.cwd(), "scripts/url-mappings.json"),
      "utf-8"
    );
    const mappings: UrlMapping[] = JSON.parse(content);
    return new Map(mappings.map((m) => [m.oldUrl, m]));
  } catch {
    console.warn("警告: url-mappings.json 不存在，将使用原始 URL");
    return new Map();
  }
}

async function migratePaintings(urlMap: Map<string, UrlMapping>): Promise<void> {
  console.log("\n迁移画作数据...");

  const content = await readFile(
    path.join(process.cwd(), "src/data/paintings.json"),
    "utf-8"
  );
  const { paintings }: { paintings: OldPainting[] } = JSON.parse(content);

  console.log(`  共 ${paintings.length} 幅画作`);

  for (const painting of paintings) {
    const mapping = urlMap.get(painting.imageUrl);

    const { error } = await supabase.from("paintings").insert({
      slug: painting.id,
      title: painting.title,
      description: painting.description || "",
      year: painting.year,
      dimensions: painting.dimensions || null,
      status: painting.status,
      image_url: mapping?.newUrl || painting.imageUrl,
      thumbnail_url: mapping?.thumbnailUrl || painting.thumbnailUrl,
      published: painting.published,
      sort_order: painting.order,
      created_at: painting.createdAt,
      updated_at: painting.updatedAt,
    });

    if (error) {
      console.error(`  ✗ ${painting.title}: ${error.message}`);
    } else {
      console.log(`  ✓ ${painting.title}`);
    }
  }
}

async function migrateArtist(urlMap: Map<string, UrlMapping>): Promise<void> {
  console.log("\n迁移画家数据...");

  const content = await readFile(
    path.join(process.cwd(), "src/data/artist.json"),
    "utf-8"
  );
  const artist: OldArtist = JSON.parse(content);

  const avatarMapping = urlMap.get(artist.avatarUrl);

  const { data: artistData, error: artistError } = await supabase
    .from("artist")
    .insert({
      name: artist.name,
      title: artist.title || null,
      avatar_url: avatarMapping?.newUrl || artist.avatarUrl,
      bio: artist.bio,
    })
    .select()
    .single();

  if (artistError) {
    console.error(`  ✗ 画家信息: ${artistError.message}`);
    return;
  }

  console.log(`  ✓ ${artist.name}`);

  // 迁移时间线
  if (artist.timeline && artist.timeline.length > 0) {
    console.log(`  迁移时间线 (${artist.timeline.length} 条)...`);

    for (let i = 0; i < artist.timeline.length; i++) {
      const item = artist.timeline[i];
      if (!item) continue;
      const { error } = await supabase.from("artist_timeline").insert({
        artist_id: artistData.id,
        year: parseInt(item.year, 10),
        title: item.title,
        description: item.description || null,
        sort_order: i,
      });

      if (error) {
        console.error(`    ✗ ${item.year}: ${error.message}`);
      } else {
        console.log(`    ✓ ${item.year} - ${item.title}`);
      }
    }
  }
}

async function migrateSettings(urlMap: Map<string, UrlMapping>): Promise<void> {
  console.log("\n迁移网站设置...");

  const content = await readFile(
    path.join(process.cwd(), "src/data/settings.json"),
    "utf-8"
  );
  const settings: OldSettings = JSON.parse(content);

  // 更新图片 URL
  const heroMapping = urlMap.get(settings.home.hero.backgroundImage);
  const qrMapping = urlMap.get(settings.site.wechatQrCode);

  const siteValue = {
    ...settings.site,
    wechatQrCode: qrMapping?.newUrl || settings.site.wechatQrCode,
  };

  const homeValue = {
    ...settings.home,
    hero: {
      ...settings.home.hero,
      backgroundImage: heroMapping?.newUrl || settings.home.hero.backgroundImage,
    },
  };

  // 插入 site 设置
  const { error: siteError } = await supabase.from("site_settings").upsert({
    key: "site",
    value: siteValue,
  });

  if (siteError) {
    console.error(`  ✗ site 设置: ${siteError.message}`);
  } else {
    console.log(`  ✓ site 设置`);
  }

  // 插入 home 设置
  const { error: homeError } = await supabase.from("site_settings").upsert({
    key: "home",
    value: homeValue,
  });

  if (homeError) {
    console.error(`  ✗ home 设置: ${homeError.message}`);
  } else {
    console.log(`  ✓ home 设置`);
  }

  // 迁移精选画作
  console.log("\n迁移精选画作...");
  const featuredIds = settings.home.featuredPaintingIds;

  for (let i = 0; i < featuredIds.length; i++) {
    const slug = featuredIds[i];

    // 查找画作 ID
    const { data: painting } = await supabase
      .from("paintings")
      .select("id")
      .eq("slug", slug)
      .single();

    if (painting) {
      const { error } = await supabase.from("featured_paintings").insert({
        painting_id: painting.id,
        sort_order: i,
      });

      if (error) {
        console.error(`  ✗ 精选 ${slug}: ${error.message}`);
      } else {
        console.log(`  ✓ 精选 ${slug}`);
      }
    } else {
      console.warn(`  ! 找不到画作 ${slug}`);
    }
  }
}

async function main() {
  console.log("=".repeat(50));
  console.log("开始数据迁移到 Supabase");
  console.log("=".repeat(50));

  // 加载 URL 映射
  const urlMap = await loadUrlMappings();
  console.log(`加载了 ${urlMap.size} 个 URL 映射`);

  // 迁移数据
  await migratePaintings(urlMap);
  await migrateArtist(urlMap);
  await migrateSettings(urlMap);

  console.log("\n" + "=".repeat(50));
  console.log("数据迁移完成!");
  console.log("=".repeat(50));
}

main().catch(console.error);
