/**
 * 图片迁移脚本
 * 将 public/images/ 中的图片上传到 Supabase Storage
 *
 * 运行方式: npx tsx scripts/migrate-images.ts
 */

import { createClient } from "@supabase/supabase-js";
import { readdir, readFile, writeFile, stat } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";

// 配置
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("请设置环境变量: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  console.error("提示: 运行时使用 npx dotenv -e .env.local -- npx tsx scripts/migrate-images.ts");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const IMAGES_DIR = path.join(process.cwd(), "public/images");
const THUMBNAIL_WIDTH = 400;
const THUMBNAIL_QUALITY = 80;

interface UrlMapping {
  oldUrl: string;
  newUrl: string;
  thumbnailUrl: string;
  originalFilename: string; // 保留原始文件名用于调试
}

/**
 * 生成安全的存储路径（使用 UUID 替代中文文件名）
 */
function generateSafeStoragePath(year: string, originalFilename: string): { imagePath: string; thumbPath: string } {
  const ext = path.extname(originalFilename).toLowerCase();
  const fileId = uuidv4();
  return {
    imagePath: `${year}/${fileId}${ext}`,
    thumbPath: `${year}/${fileId}_thumb.jpg`,
  };
}

async function getFilesRecursively(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getFilesRecursively(fullPath)));
    } else if (entry.isFile() && /\.(jpg|jpeg|png|webp)$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

async function uploadFile(
  bucket: string,
  storagePath: string,
  buffer: Buffer,
  contentType: string
): Promise<string | null> {
  const { error } = await supabase.storage.from(bucket).upload(storagePath, buffer, {
    contentType,
    cacheControl: "31536000", // 1年缓存
    upsert: true,
  });

  if (error) {
    console.error(`上传失败 ${storagePath}:`, error.message);
    return null;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(storagePath);

  return publicUrl;
}

async function migrateGalleryImages(): Promise<UrlMapping[]> {
  const mappings: UrlMapping[] = [];
  const galleryDir = path.join(IMAGES_DIR, "gallery");

  try {
    await stat(galleryDir);
  } catch {
    console.log("gallery 目录不存在，跳过");
    return mappings;
  }

  const years = await readdir(galleryDir);

  for (const year of years) {
    if (year.startsWith(".") || !/^\d{4}$/.test(year)) continue;

    const yearDir = path.join(galleryDir, year);
    const yearStat = await stat(yearDir);
    if (!yearStat.isDirectory()) continue;

    const files = await readdir(yearDir);
    console.log(`\n处理 ${year} 年 (${files.length} 个文件)...`);

    for (const file of files) {
      if (!/\.(jpg|jpeg|png|webp)$/i.test(file)) continue;

      const filePath = path.join(yearDir, file);
      const fileBuffer = await readFile(filePath);

      // 确定文件扩展名和 MIME 类型
      const ext = path.extname(file).toLowerCase();
      const mimeType =
        ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";

      // 生成安全的存储路径（UUID）
      const { imagePath, thumbPath } = generateSafeStoragePath(year, file);

      // 上传原图
      const imageUrl = await uploadFile("paintings", imagePath, fileBuffer, mimeType);

      if (!imageUrl) continue;

      // 生成并上传缩略图 (统一为 JPEG)
      const thumbnailBuffer = await sharp(fileBuffer)
        .resize(THUMBNAIL_WIDTH, null, { withoutEnlargement: true })
        .jpeg({ quality: THUMBNAIL_QUALITY })
        .toBuffer();

      const thumbnailUrl = await uploadFile(
        "paintings-thumbnails",
        thumbPath,
        thumbnailBuffer,
        "image/jpeg"
      );

      if (!thumbnailUrl) continue;

      mappings.push({
        oldUrl: `/images/gallery/${year}/${file}`,
        newUrl: imageUrl,
        thumbnailUrl: thumbnailUrl,
        originalFilename: file,
      });

      console.log(`  ✓ ${file}`);
    }
  }

  return mappings;
}

async function migrateArtistImages(): Promise<UrlMapping[]> {
  const mappings: UrlMapping[] = [];
  const artistsDir = path.join(IMAGES_DIR, "artists");

  try {
    await stat(artistsDir);
  } catch {
    console.log("artists 目录不存在，跳过");
    return mappings;
  }

  const files = await readdir(artistsDir);
  console.log(`\n处理 artists 目录 (${files.length} 个文件)...`);

  for (const file of files) {
    if (!/\.(jpg|jpeg|png|webp)$/i.test(file)) continue;

    const filePath = path.join(artistsDir, file);
    const fileBuffer = await readFile(filePath);

    const ext = path.extname(file).toLowerCase();
    const mimeType =
      ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";

    // 使用 UUID 生成安全文件名
    const safeFilename = `${uuidv4()}${ext}`;
    const imageUrl = await uploadFile("artists", safeFilename, fileBuffer, mimeType);

    if (imageUrl) {
      mappings.push({
        oldUrl: `/images/artists/${file}`,
        newUrl: imageUrl,
        thumbnailUrl: imageUrl, // 头像不需要单独缩略图
        originalFilename: file,
      });
      console.log(`  ✓ ${file}`);
    }
  }

  return mappings;
}

async function migrateSiteAssets(): Promise<UrlMapping[]> {
  const mappings: UrlMapping[] = [];

  // 迁移根目录的图片 (hero.jpg 等)
  const rootFiles = await readdir(IMAGES_DIR);
  console.log(`\n处理网站资源...`);

  for (const file of rootFiles) {
    if (!/\.(jpg|jpeg|png|webp)$/i.test(file)) continue;

    const filePath = path.join(IMAGES_DIR, file);
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) continue;

    const fileBuffer = await readFile(filePath);
    const ext = path.extname(file).toLowerCase();
    const mimeType =
      ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";

    // 使用 UUID 生成安全文件名
    const safeFilename = `${uuidv4()}${ext}`;
    const imageUrl = await uploadFile("site-assets", safeFilename, fileBuffer, mimeType);

    if (imageUrl) {
      mappings.push({
        oldUrl: `/images/${file}`,
        newUrl: imageUrl,
        thumbnailUrl: imageUrl,
        originalFilename: file,
      });
      console.log(`  ✓ ${file}`);
    }
  }

  // 迁移 featured 目录
  const featuredDir = path.join(IMAGES_DIR, "featured");
  try {
    await stat(featuredDir);
    const featuredFiles = await readdir(featuredDir);

    for (const file of featuredFiles) {
      if (!/\.(jpg|jpeg|png|webp)$/i.test(file)) continue;

      const filePath = path.join(featuredDir, file);
      const fileBuffer = await readFile(filePath);
      const ext = path.extname(file).toLowerCase();
      const mimeType =
        ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";

      // 使用 UUID 生成安全文件名
      const safeFilename = `featured/${uuidv4()}${ext}`;
      const imageUrl = await uploadFile("site-assets", safeFilename, fileBuffer, mimeType);

      if (imageUrl) {
        mappings.push({
          oldUrl: `/images/featured/${file}`,
          newUrl: imageUrl,
          thumbnailUrl: imageUrl,
          originalFilename: file,
        });
        console.log(`  ✓ featured/${file}`);
      }
    }
  } catch {
    console.log("featured 目录不存在，跳过");
  }

  return mappings;
}

async function main() {
  console.log("=".repeat(50));
  console.log("开始图片迁移到 Supabase Storage");
  console.log("=".repeat(50));
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log(`图片目录: ${IMAGES_DIR}`);

  const allMappings: UrlMapping[] = [];

  // 迁移各类图片
  const galleryMappings = await migrateGalleryImages();
  allMappings.push(...galleryMappings);

  const artistMappings = await migrateArtistImages();
  allMappings.push(...artistMappings);

  const assetMappings = await migrateSiteAssets();
  allMappings.push(...assetMappings);

  // 保存映射关系
  const outputPath = path.join(process.cwd(), "scripts/url-mappings.json");
  await writeFile(outputPath, JSON.stringify(allMappings, null, 2));

  console.log("\n" + "=".repeat(50));
  console.log(`迁移完成! 共 ${allMappings.length} 个文件`);
  console.log(`URL 映射已保存到: ${outputPath}`);
  console.log("=".repeat(50));
}

main().catch(console.error);
