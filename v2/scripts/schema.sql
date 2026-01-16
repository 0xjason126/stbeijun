-- =====================================================
-- Supabase Schema for 贝军国画 Gallery Website
-- =====================================================
-- 请在 Supabase Dashboard > SQL Editor 中执行此文件

-- 启用 UUID 扩展
create extension if not exists "uuid-ossp";

-- =====================================================
-- 1. 枚举类型
-- =====================================================

-- 画作状态
create type painting_status as enum ('售卖中', '可定制', '已售出');

-- =====================================================
-- 2. 表结构
-- =====================================================

-- 画作表
create table paintings (
  id uuid primary key default uuid_generate_v4(),
  slug varchar(10) unique not null,          -- 兼容旧 ID (p001, p002...)
  title varchar(100) not null,
  description text default '',
  year smallint not null check (year >= 1900 and year <= 2100),
  dimensions varchar(50),                     -- 尺寸，如 "70x138cm"
  status painting_status not null default '售卖中',
  image_url text not null,
  thumbnail_url text not null,
  published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 画家表
create table artist (
  id uuid primary key default uuid_generate_v4(),
  name varchar(50) not null,
  title varchar(100),                         -- 职称/头衔
  avatar_url text,
  bio text,                                   -- HTML 格式的简介
  updated_at timestamptz not null default now()
);

-- 画家时间线表
create table artist_timeline (
  id uuid primary key default uuid_generate_v4(),
  artist_id uuid references artist(id) on delete cascade,
  year smallint not null,
  title varchar(100) not null,
  description text,
  sort_order int not null default 0
);

-- 网站设置表 (键值对形式，便于扩展)
create table site_settings (
  key varchar(50) primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- 精选画作表
create table featured_paintings (
  id uuid primary key default uuid_generate_v4(),
  painting_id uuid references paintings(id) on delete cascade,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique(painting_id)
);

-- =====================================================
-- 3. 索引
-- =====================================================

create index idx_paintings_published on paintings(published) where published = true;
create index idx_paintings_year on paintings(year);
create index idx_paintings_status on paintings(status);
create index idx_paintings_sort_order on paintings(sort_order);
create index idx_artist_timeline_artist on artist_timeline(artist_id);
create index idx_featured_paintings_order on featured_paintings(sort_order);

-- =====================================================
-- 4. 自动更新 updated_at 触发器
-- =====================================================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger paintings_updated_at
  before update on paintings
  for each row execute function update_updated_at();

create trigger artist_updated_at
  before update on artist
  for each row execute function update_updated_at();

create trigger site_settings_updated_at
  before update on site_settings
  for each row execute function update_updated_at();

-- =====================================================
-- 5. RLS (Row Level Security) 策略
-- =====================================================

-- 启用 RLS
alter table paintings enable row level security;
alter table artist enable row level security;
alter table artist_timeline enable row level security;
alter table site_settings enable row level security;
alter table featured_paintings enable row level security;

-- 公开读取策略 (匿名用户)
create policy "Public can view published paintings"
  on paintings for select
  using (published = true);

create policy "Public can view artist"
  on artist for select
  using (true);

create policy "Public can view artist_timeline"
  on artist_timeline for select
  using (true);

create policy "Public can view site_settings"
  on site_settings for select
  using (true);

create policy "Public can view featured_paintings"
  on featured_paintings for select
  using (true);

-- 认证用户完全访问 (用于 Admin)
-- 注意：使用 service_role key 时会绕过 RLS
create policy "Service role full access paintings"
  on paintings for all
  using (auth.role() = 'service_role');

create policy "Service role full access artist"
  on artist for all
  using (auth.role() = 'service_role');

create policy "Service role full access artist_timeline"
  on artist_timeline for all
  using (auth.role() = 'service_role');

create policy "Service role full access site_settings"
  on site_settings for all
  using (auth.role() = 'service_role');

create policy "Service role full access featured_paintings"
  on featured_paintings for all
  using (auth.role() = 'service_role');

-- =====================================================
-- 6. Storage Buckets (需要在 Supabase Dashboard 创建)
-- =====================================================
--
-- 请在 Storage 页面创建以下 Buckets:
--
-- 1. paintings (公开读取)
--    - 用于存储画作原图
--    - 文件大小限制: 10MB
--    - 允许类型: image/jpeg, image/png, image/webp
--
-- 2. paintings-thumbnails (公开读取)
--    - 用于存储缩略图
--    - 文件大小限制: 2MB
--    - 允许类型: image/jpeg, image/webp
--
-- 3. artists (公开读取)
--    - 用于存储画家头像
--    - 文件大小限制: 5MB
--
-- 4. site-assets (公开读取)
--    - 用于存储网站资源（Hero 背景、微信二维码等）
--    - 文件大小限制: 5MB

-- Storage RLS (如果使用 SQL 创建 bucket)
-- insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- values
--   ('paintings', 'paintings', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
--   ('paintings-thumbnails', 'paintings-thumbnails', true, 2097152, array['image/jpeg', 'image/webp']),
--   ('site-assets', 'site-assets', true, 5242880, array['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']),
--   ('artists', 'artists', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']);
