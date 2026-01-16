/**
 * 输入验证 Schema - 使用 Zod
 */
import { z } from "zod";

// 画作状态枚举
export const PaintingStatusSchema = z.enum(["售卖中", "可定制", "已售出"]);

// 画作更新验证
export const PaintingUpdateSchema = z.object({
  title: z
    .string()
    .min(1, "标题不能为空")
    .max(100, "标题不能超过100个字符"),
  description: z
    .string()
    .max(5000, "描述不能超过5000个字符"),
  year: z
    .number()
    .int("年份必须是整数")
    .min(1900, "年份不能早于1900年")
    .max(2100, "年份不能晚于2100年"),
  status: PaintingStatusSchema,
  dimensions: z
    .string()
    .max(50, "尺寸不能超过50个字符")
    .optional(),
});

// 画作创建验证（包含图片 URL）
export const PaintingCreateSchema = PaintingUpdateSchema.extend({
  imageUrl: z.string().url("图片 URL 格式不正确"),
  thumbnailUrl: z.string().url("缩略图 URL 格式不正确"),
});

// 首页设置验证
export const HomeSettingsSchema = z.object({
  hero: z.object({
    backgroundImage: z.string().optional(),
    title: z.string().max(50).optional(),
    subtitle: z.string().max(100).optional(),
  }).optional(),
  featuredPaintingIds: z
    .array(z.string())
    .min(3, "至少选择3幅精选画作")
    .max(6, "最多选择6幅精选画作")
    .optional(),
  artistStatement: z.string().max(2000).optional(),
});

// 画家信息验证
export const ArtistSchema = z.object({
  name: z
    .string()
    .min(1, "姓名不能为空")
    .max(50, "姓名不能超过50个字符")
    .optional(),
  title: z.string().max(100).optional(),
  avatarUrl: z.string().url("头像 URL 格式不正确").optional(),
  bio: z.string().max(10000, "简介不能超过10000个字符").optional(),
  timeline: z
    .array(
      z.object({
        year: z.string(),
        title: z.string(),
        description: z.string().optional(),
      })
    )
    .optional(),
});

// 导出类型
export type PaintingUpdateInput = z.infer<typeof PaintingUpdateSchema>;
export type PaintingCreateInput = z.infer<typeof PaintingCreateSchema>;
export type HomeSettingsInput = z.infer<typeof HomeSettingsSchema>;
export type ArtistInput = z.infer<typeof ArtistSchema>;
