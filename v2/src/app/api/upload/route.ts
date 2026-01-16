/**
 * 图片上传 API
 * 上传图片到 Supabase Storage，并自动生成缩略图
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@/lib/auth";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";

// 配置
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const THUMBNAIL_WIDTH = 400;
const THUMBNAIL_QUALITY = 80;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// 创建 Supabase Admin 客户端
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

export async function POST(request: NextRequest) {
  // 验证认证
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const year =
      (formData.get("year") as string) || new Date().getFullYear().toString();

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, WebP" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Max 10MB" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileId = uuidv4();

    // 获取图片元数据
    const metadata = await sharp(buffer).metadata();

    // 处理原图（优化质量，统一为 JPEG）
    const processedImage = await sharp(buffer)
      .jpeg({ quality: 90 })
      .toBuffer();

    // 生成缩略图
    const thumbnail = await sharp(buffer)
      .resize(THUMBNAIL_WIDTH, null, { withoutEnlargement: true })
      .jpeg({ quality: THUMBNAIL_QUALITY })
      .toBuffer();

    // 上传原图 - 使用 UUID 命名确保唯一且兼容 Supabase Storage
    const imagePath = `${year}/${fileId}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from("paintings")
      .upload(imagePath, processedImage, {
        contentType: "image/jpeg",
        cacheControl: "31536000", // 1年缓存
      });

    if (uploadError) {
      console.error("Image upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload image" },
        { status: 500 }
      );
    }

    // 上传缩略图
    const thumbPath = `${year}/${fileId}_thumb.jpg`;
    const { error: thumbError } = await supabase.storage
      .from("paintings-thumbnails")
      .upload(thumbPath, thumbnail, {
        contentType: "image/jpeg",
        cacheControl: "31536000",
      });

    if (thumbError) {
      console.error("Thumbnail upload error:", thumbError);
      // 缩略图失败不影响主流程，使用原图作为缩略图
    }

    // 获取公开 URL
    const {
      data: { publicUrl: imageUrl },
    } = supabase.storage.from("paintings").getPublicUrl(imagePath);

    const {
      data: { publicUrl: thumbnailUrl },
    } = supabase.storage
      .from("paintings-thumbnails")
      .getPublicUrl(thumbError ? imagePath : thumbPath);

    return NextResponse.json({
      success: true,
      imageUrl,
      thumbnailUrl: thumbError ? imageUrl : thumbnailUrl,
      width: metadata.width,
      height: metadata.height,
      size: processedImage.length,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
