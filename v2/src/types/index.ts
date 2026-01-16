/**
 * 贝军国画网站 V2 类型定义
 */

// ========================================
// 画作相关类型
// ========================================

/** 画作售卖状态 */
export type PaintingStatus = "售卖中" | "可定制" | "已售出";

/** 画作数据 */
export interface Painting {
  /** 唯一标识符 */
  id: string;
  /** 画作标题 */
  title: string;
  /** 画作描述 */
  description: string;
  /** 创作年份 */
  year: number;
  /** 尺寸，如 "68cm x 136cm" */
  dimensions?: string;
  /** 售卖状态 */
  status: PaintingStatus;
  /** 原图 URL */
  imageUrl: string;
  /** 缩略图 URL */
  thumbnailUrl: string;
  /** 是否上架（前台可见） */
  published: boolean;
  /** 排序权重（数字越小越靠前） */
  order: number;
  /** 创建时间 ISO 8601 */
  createdAt: string;
  /** 更新时间 ISO 8601 */
  updatedAt: string;
}

/** 创建画作输入 */
export interface CreatePaintingInput {
  title: string;
  description?: string;
  year: number;
  dimensions?: string;
  status: PaintingStatus;
  imageUrl: string;
  thumbnailUrl: string;
  published?: boolean;
}

/** 更新画作输入 */
export interface UpdatePaintingInput {
  title?: string;
  description?: string;
  year?: number;
  dimensions?: string;
  status?: PaintingStatus;
  imageUrl?: string;
  thumbnailUrl?: string;
  published?: boolean;
  order?: number;
}

/** 画作筛选条件 */
export interface PaintingFilters {
  year?: number;
  status?: PaintingStatus;
  search?: string;
  published?: boolean;
}

// ========================================
// 画家相关类型
// ========================================

/** 时间线条目 */
export interface TimelineItem {
  year: number;
  title: string;
  description?: string;
}

/** 画家信息 */
export interface Artist {
  /** 姓名 */
  name: string;
  /** 头衔，如 "国家一级美术师" */
  title?: string;
  /** 头像 URL */
  avatarUrl: string;
  /** 简介（支持 HTML） */
  bio: string;
  /** 艺术历程时间线 */
  timeline?: TimelineItem[];
}

// ========================================
// 首页配置类型
// ========================================

/** Hero 区域配置 */
export interface HeroSettings {
  /** 背景图片 URL */
  backgroundImage: string;
  /** 主标题 */
  title: string;
  /** 副标题 */
  subtitle?: string;
}

/** 首页配置 */
export interface HomeSettings {
  /** Hero 区域 */
  hero: HeroSettings;
  /** 精选画作 ID 列表（3 个） */
  featuredPaintingIds: string[];
  /** 艺术理念文案（首页滚动章节） */
  artistStatement?: string;
}

// ========================================
// 网站配置类型
// ========================================

/** 网站全局配置 */
export interface SiteSettings {
  /** 网站名称 */
  siteName: string;
  /** 咨询微信号 */
  wechatId: string;
  /** 微信二维码图片 URL */
  wechatQrCode?: string;
  /** 备案号 */
  icp?: string;
}

// ========================================
// 数据文件类型
// ========================================

/** paintings.json 文件结构 */
export interface PaintingsData {
  paintings: Painting[];
  lastUpdated: string;
}

/** featured.json 文件结构 */
export interface FeaturedData {
  featuredIds: string[];
  lastUpdated: string;
}

/** artist.json 文件结构 */
export type ArtistData = Artist;

/** settings.json 文件结构 */
export interface SettingsData {
  site: SiteSettings;
  home: HomeSettings;
  lastUpdated: string;
}

// ========================================
// API 响应类型
// ========================================

/** 通用 API 响应 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/** 分页信息 */
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/** 分页响应 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationInfo;
}

// ========================================
// 上传相关类型
// ========================================

/** 图片上传结果 */
export interface UploadResult {
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  size: number;
}

// ========================================
// 认证相关类型
// ========================================

/** 用户会话 */
export interface UserSession {
  id: string;
  username: string;
  role: "admin";
}
