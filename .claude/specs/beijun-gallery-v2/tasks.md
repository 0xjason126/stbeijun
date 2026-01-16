# 贝军国画网站 V2 实施任务清单

## 阶段 1：项目初始化与基础设施

- [ ] 1. 项目脚手架搭建
  - [ ] 1.1. 初始化 Next.js 15 项目
    - Objective: 使用 `pnpm create next-app@latest` 创建项目，配置 App Router、TypeScript、Tailwind CSS 4、ESLint
    - References: Req 技术栈决策
  - [ ] 1.2. 配置 TypeScript 严格模式
    - Objective: 修改 `tsconfig.json` 启用 strict、noUncheckedIndexedAccess、路径别名 @/*
    - References: Req 技术栈决策
  - [ ] 1.3. 安装并配置 shadcn/ui
    - Objective: 运行 `pnpm dlx shadcn@latest init`，选择 Stone 色系，安装 Button、Dialog、Input、Select、Card 等基础组件
    - References: Req 技术栈决策
  - [ ] 1.4. 安装 Framer Motion
    - Objective: `pnpm add framer-motion`，创建 `lib/motion.ts` 导出常用动画配置
    - References: Req 4.1

- [ ] 2. 设计系统配置
  - [ ] 2.1. 配置 Tailwind 主题色
    - Objective: 在 `tailwind.config.ts` 中添加 Stone 色系和 Amber 强调色，配置深色模式（class 策略）
    - References: Req 设计规范
  - [ ] 2.2. 配置 Google Fonts
    - Objective: 在 `app/layout.tsx` 使用 `next/font` 加载 Noto Serif SC、Noto Sans SC、Inter，设置 CSS 变量
    - References: Req 设计规范
  - [ ] 2.3. 创建全局样式
    - Objective: 编写 `app/globals.css`，定义 CSS 变量、滚动条样式、基础动画、prefers-reduced-motion 降级
    - References: Req 1.6, 10.4

- [ ] 3. 数据层搭建
  - [ ] 3.1. 定义 TypeScript 类型
    - Objective: 创建 `types/index.ts`，定义 Painting、Artist、HomeSettings、SiteSettings 等接口
    - References: Req 2.5, 7.2
  - [ ] 3.2. 迁移现有数据
    - Objective: 将现有 `data/paintings.json` 转换为新格式，添加 id、published、order、thumbnailUrl 字段
    - References: Req 7.1
  - [ ] 3.3. 创建数据读写工具
    - Objective: 实现 `lib/data.ts` 包含 readJSON、writeJSON 函数，添加文件锁防止并发写入
    - References: Req 7.1, 7.2
  - [ ] 3.4. 创建 Vercel Blob 工具
    - Objective: 实现 `lib/blob.ts` 包含 uploadImage、deleteImage 函数，生成缩略图 URL
    - References: Req 7.6

---

## 阶段 2：访客端核心页面

- [ ] 4. 根布局与导航
  - [ ] 4.1. 创建根布局
    - Objective: 实现 `app/layout.tsx`，包含字体加载、主题 Provider、基础 meta 标签
    - References: Req 9.2
  - [ ] 4.2. 实现隐形导航组件
    - Objective: 创建 `components/public/Navbar.tsx`，实现：初始透明→滚动后毛玻璃、滚动方向感知（向下隐藏/向上显示）、深色模式切换
    - References: Req 4.3
  - [ ] 4.3. 实现滚动进度指示器
    - Objective: 创建 `components/public/ScrollProgress.tsx`，在页面边缘显示细线进度条
    - References: Req 4.4
  - [ ] 4.4. 实现页脚组件
    - Objective: 创建 `components/public/Footer.tsx`，包含画家签名/印章元素、联系方式
    - References: Req 1.5

- [ ] 5. 首页实现
  - [ ] 5.1. 创建首页路由
    - Objective: 实现 `app/(public)/page.tsx`，使用 SSG + ISR (revalidate: 60)，获取 HomeSettings 和精选画作
    - References: Req 1.7
  - [ ] 5.2. 实现 Hero 组件
    - Objective: 创建 `components/public/Hero.tsx`，实现全屏高度、视差背景（0.5x 滚动速度）、标题渐入动画、滚动指示器
    - References: Req 1.1
  - [ ] 5.3. 实现艺术理念章节
    - Objective: 创建 `components/public/ArtistStatement.tsx`，使用 Intersection Observer 触发渐入动画
    - References: Req 1.2
  - [ ] 5.4. 实现精选画作网格
    - Objective: 创建 `components/public/FeaturedGrid.tsx`，Bento Grid 布局，悬停显示标题/年份，点击导航到画廊并高亮
    - References: Req 1.3, 1.4
  - [ ] 5.5. 添加 prefers-reduced-motion 支持
    - Objective: 使用 Framer Motion 的 `useReducedMotion` 钩子，为所有动画提供无动画降级
    - References: Req 1.6, 10.4

- [ ] 6. 画廊页实现
  - [ ] 6.1. 创建画廊路由
    - Objective: 实现 `app/(public)/gallery/page.tsx`，SSG + ISR，支持 URL 查询参数（year、status、q）
    - References: Req 2.8
  - [ ] 6.2. 实现筛选栏组件
    - Objective: 创建 `components/public/FilterBar.tsx`，包含年份下拉（动态生成）、状态下拉、搜索框（300ms 防抖）
    - References: Req 2.3
  - [ ] 6.3. 实现瀑布流画廊
    - Objective: 创建 `components/public/MasonryGallery.tsx`，使用 CSS columns 实现响应式 1/2/3/4 列布局
    - References: Req 2.1
  - [ ] 6.4. 实现画作卡片
    - Objective: 创建 `components/public/PaintingCard.tsx`，极简设计（图片 + 悬停显示标题），懒加载图片
    - References: Req 2.2
  - [ ] 6.5. 实现 Lightbox 模态框
    - Objective: 创建 `components/public/Lightbox.tsx`，包含画作大图（支持缩放）、详情信息、"咨询购买"按钮
    - References: Req 2.5
  - [ ] 6.6. 实现 Lightbox 键盘导航
    - Objective: 添加 ESC 关闭、← → 切换画作的键盘事件监听
    - References: Req 2.6
  - [ ] 6.7. 实现咨询购买弹窗
    - Objective: 创建联系方式组件，显示微信号 + 一键复制功能 + 可选二维码
    - References: Req 2.7
  - [ ] 6.8. 实现移动端拖拽关闭
    - Objective: 使用 Framer Motion drag 手势，向下拖拽 > 100px 关闭 Lightbox
    - References: Req 4.5
  - [ ] 6.9. 实现无限滚动或分页
    - Objective: 实现优雅的分页导航（保留现有分页逻辑，样式升级）
    - References: Req 2.4

- [ ] 7. 画家介绍页实现
  - [ ] 7.1. 创建画家页路由
    - Objective: 实现 `app/(public)/artist/page.tsx`，SSG + ISR，获取 Artist 数据
    - References: Req 3.1
  - [ ] 7.2. 实现画家头像区域
    - Objective: 大幅肖像 + 渐入动画 + 姓名/头衔
    - References: Req 3.1
  - [ ] 7.3. 实现画家简介
    - Objective: 渲染富文本 HTML，支持基础排版（段落、加粗、列表）
    - References: Req 3.2
  - [ ] 7.4. 实现艺术历程时间线
    - Objective: 创建 `components/public/Timeline.tsx`，章节式展示重要时间节点
    - References: Req 3.3
  - [ ] 7.5. 添加"浏览作品" CTA
    - Objective: 页面底部固定 CTA 按钮，链接到画廊页
    - References: Req 3.4

---

## 阶段 3：管理端认证

- [ ] 8. NextAuth.js 配置
  - [ ] 8.1. 安装 NextAuth.js v5
    - Objective: `pnpm add next-auth@beta`，创建 `lib/auth.ts` 配置 Credentials Provider
    - References: Req 5.2
  - [ ] 8.2. 配置环境变量
    - Objective: 创建 `.env.local.example`，定义 NEXTAUTH_SECRET、ADMIN_USERNAME、ADMIN_PASSWORD_HASH
    - References: Req 5.2
  - [ ] 8.3. 创建 Auth API 路由
    - Objective: 实现 `app/api/auth/[...nextauth]/route.ts`
    - References: Req 5.2
  - [ ] 8.4. 实现中间件保护
    - Objective: 创建 `middleware.ts`，保护 /admin/* 路由（登录页除外）
    - References: Req 5.5

- [ ] 9. 管理端登录页
  - [ ] 9.1. 创建登录页面
    - Objective: 实现 `app/admin/page.tsx`，表单包含用户名、密码输入框、登录按钮
    - References: Req 5.1
  - [ ] 9.2. 实现登录表单逻辑
    - Objective: 使用 Server Action 调用 signIn，成功后重定向到 /admin/dashboard
    - References: Req 5.3
  - [ ] 9.3. 实现会话有效期
    - Objective: 在 NextAuth 配置中设置 session maxAge: 7 天
    - References: Req 5.4

---

## 阶段 4：管理端后台

- [ ] 10. 管理端布局
  - [ ] 10.1. 创建管理端布局
    - Objective: 实现 `app/admin/layout.tsx`，包含侧边栏导航、用户信息、登出按钮
    - References: Req 5.1
  - [ ] 10.2. 创建仪表盘页面
    - Objective: 实现 `app/admin/dashboard/page.tsx`，显示画作总数、已上架数、各状态统计
    - References: Req 5.3

- [ ] 11. 画作管理
  - [ ] 11.1. 创建画作列表页
    - Objective: 实现 `app/admin/paintings/page.tsx`，表格显示：缩略图、标题、年份、状态、上架状态、操作
    - References: Req 7.1
  - [ ] 11.2. 实现筛选功能
    - Objective: 添加年份、状态、上架状态筛选下拉框
    - References: Req 7.5
  - [ ] 11.3. 实现上架/下架切换
    - Objective: 创建 `actions/paintings.ts` 的 togglePublished 函数，使用 Switch 组件即时切换
    - References: Req 7.2
  - [ ] 11.4. 创建画作编辑页
    - Objective: 实现 `app/admin/paintings/[id]/page.tsx`，表单包含：标题、描述、年份下拉、状态下拉
    - References: Req 7.2
  - [ ] 11.5. 实现画作更新 Action
    - Objective: 创建 updatePainting Server Action，验证输入（zod），更新 JSON，触发 revalidatePath
    - References: Req 7.2
  - [ ] 11.6. 创建新增画作页
    - Objective: 实现 `app/admin/paintings/new/page.tsx`，表单包含图片上传 + 基本信息
    - References: Req 7.3
  - [ ] 11.7. 实现图片上传组件
    - Objective: 创建 `components/admin/ImageUploader.tsx`，支持拖放、预览、自动压缩（客户端 canvas）、上传到 Vercel Blob
    - References: Req 7.6
  - [ ] 11.8. 实现创建画作 Action
    - Objective: 创建 createPainting Server Action，生成 ID，添加到 JSON，触发 revalidatePath
    - References: Req 7.3
  - [ ] 11.9. 实现删除画作功能
    - Objective: 添加删除按钮 + 确认对话框，创建 deletePainting Server Action，同时删除 Blob 图片
    - References: Req 7.4

- [ ] 12. 首页配置管理
  - [ ] 12.1. 创建首页配置页
    - Objective: 实现 `app/admin/home/page.tsx`，分区显示 Hero 编辑和精选画作选择
    - References: Req 6.1, 6.2
  - [ ] 12.2. 实现 Hero 编辑
    - Objective: 表单包含背景图上传（复用 ImageUploader）、主标题、副标题输入
    - References: Req 6.1
  - [ ] 12.3. 实现精选画作选择器
    - Objective: 创建 `components/admin/FeaturedPicker.tsx`，从画作列表选择 3 幅，支持拖拽排序
    - References: Req 6.2
  - [ ] 12.4. 实现保存并触发 ISR
    - Objective: 创建 updateHomeSettings Server Action，保存 JSON 后调用 revalidatePath('/')
    - References: Req 6.3

- [ ] 13. 画家信息管理
  - [ ] 13.1. 创建画家信息页
    - Objective: 实现 `app/admin/profile/page.tsx`，表单包含头像、姓名、简介编辑
    - References: Req 8.1
  - [ ] 13.2. 实现简单富文本编辑器
    - Objective: 创建 `components/admin/RichTextEditor.tsx`，基于 contenteditable 或轻量库（如 tiptap），支持加粗、段落
    - References: Req 8.1
  - [ ] 13.3. 实现保存并触发 ISR
    - Objective: 创建 updateArtist Server Action，保存 JSON 后调用 revalidatePath('/artist')
    - References: Req 8.2

---

## 阶段 5：交互增强与动效

- [ ] 14. 页面过渡动画
  - [ ] 14.1. 实现 View Transitions 增强
    - Objective: 使用 `next/link` 的 `viewTransition` 属性（实验性），为支持的浏览器启用原生过渡
    - References: Req 4.1
  - [ ] 14.2. 实现 Framer Motion 页面过渡
    - Objective: 创建 `components/PageTransition.tsx`，包裹页面内容，实现淡入淡出效果
    - References: Req 4.1

- [ ] 15. 深色/浅色模式
  - [ ] 15.1. 实现主题切换逻辑
    - Objective: 创建 `lib/theme.ts`，实现 getTheme、setTheme（localStorage + document.documentElement.classList）
    - References: Req 4.2
  - [ ] 15.2. 实现主题切换按钮
    - Objective: 在 Navbar 添加太阳/月亮图标切换按钮，默认跟随系统
    - References: Req 4.2
  - [ ] 15.3. 防止闪烁
    - Objective: 在 `<head>` 添加阻塞脚本，在 HTML 渲染前设置正确的 class
    - References: Req 4.2

- [ ] 16. 加载状态优化
  - [ ] 16.1. 实现骨架屏组件
    - Objective: 创建 `components/ui/Skeleton.tsx`，可用于图片、文字、卡片等场景
    - References: Req 4.6
  - [ ] 16.2. 实现水墨晕染加载效果
    - Objective: 创建 CSS 动画，模拟水墨扩散效果作为加载指示器
    - References: Req 4.6

---

## 阶段 6：SEO 与性能优化

- [ ] 17. SEO 配置
  - [ ] 17.1. 配置页面 Metadata
    - Objective: 为每个页面创建 generateMetadata 函数，生成 title、description、og:image
    - References: Req 9.2
  - [ ] 17.2. 生成 sitemap.xml
    - Objective: 创建 `app/sitemap.ts`，动态生成包含所有公开页面的 sitemap
    - References: Req 9.3
  - [ ] 17.3. 创建 robots.txt
    - Objective: 创建 `app/robots.ts`，允许爬虫访问公开页面，禁止 /admin
    - References: Req 9.3

- [ ] 18. 图片优化
  - [ ] 18.1. 使用 next/image
    - Objective: 将所有 `<img>` 替换为 `<Image>`，配置 sizes、priority、placeholder
    - References: Req 9.4
  - [ ] 18.2. 配置图片域名白名单
    - Objective: 在 `next.config.ts` 中添加 Vercel Blob 域名到 images.remotePatterns
    - References: Req 9.4

- [ ] 19. 性能优化
  - [ ] 19.1. 代码分割优化
    - Objective: 对 Framer Motion、Lightbox 等重型组件使用 dynamic import
    - References: Req 9.5
  - [ ] 19.2. 配置包分析
    - Objective: 安装 @next/bundle-analyzer，分析并优化包体积，目标 < 100KB gzipped
    - References: Req 9.5
  - [ ] 19.3. 添加 Lighthouse CI
    - Objective: 创建 `.github/workflows/lighthouse.yml`，在 PR 时运行 Lighthouse 检查
    - References: Req 9.1

---

## 阶段 7：可访问性完善

- [ ] 20. 可访问性增强
  - [ ] 20.1. 添加焦点样式
    - Objective: 为所有可交互元素添加清晰的 focus-visible 样式
    - References: Req 10.1
  - [ ] 20.2. 完善图片 alt 文本
    - Objective: 确保所有画作图片使用标题作为 alt，装饰图片使用空 alt
    - References: Req 10.2
  - [ ] 20.3. 检查颜色对比度
    - Objective: 使用工具检查所有文本/背景组合满足 WCAG AA（4.5:1）
    - References: Req 10.3
  - [ ] 20.4. 完善键盘导航
    - Objective: 确保 Tab 键可访问所有功能，模态框焦点陷阱正常工作
    - References: Req 10.5

---

## 阶段 8：测试

- [ ] 21. 单元测试
  - [ ] 21.1. 配置 Vitest
    - Objective: 安装 vitest、@testing-library/react、@testing-library/user-event，配置测试环境
    - References: Req 测试策略
  - [ ] 21.2. 编写数据层测试
    - Objective: 测试 `lib/data.ts` 的 readJSON、writeJSON、筛选逻辑
    - References: Req 7.1, 7.2
  - [ ] 21.3. 编写组件测试
    - Objective: 测试 FilterBar 筛选逻辑、Lightbox 键盘导航、主题切换
    - References: Req 2.3, 2.6, 4.2

- [ ] 22. E2E 测试
  - [ ] 22.1. 配置 Playwright
    - Objective: 安装 playwright，配置多浏览器测试（Chrome、Firefox、Safari）
    - References: Req 测试策略
  - [ ] 22.2. 编写访客流程测试
    - Objective: 测试首页→画廊→筛选→Lightbox→关闭完整流程
    - References: Req 1.1-2.8
  - [ ] 22.3. 编写管理员流程测试
    - Objective: 测试登录→画作管理→上下架→首页配置完整流程
    - References: Req 5.1-8.2

---

## 阶段 9：部署与上线

- [ ] 23. 部署配置
  - [ ] 23.1. 配置 Vercel 项目
    - Objective: 连接 GitHub 仓库，配置环境变量，启用 Vercel Blob
    - References: Req 技术栈决策
  - [ ] 23.2. 配置预览部署
    - Objective: 确保 PR 自动生成预览 URL，包含生产环境变量
    - References: Req 技术栈决策
  - [ ] 23.3. 迁移现有数据
    - Objective: 将现有画作图片上传到 Vercel Blob，更新 paintings.json 中的 URL
    - References: Req 7.6

- [ ] 24. 上线准备
  - [ ] 24.1. 性能验收
    - Objective: 使用 Lighthouse 验证 LCP < 2.5s、INP < 200ms、CLS < 0.1
    - References: Req 9.1
  - [ ] 24.2. 可访问性验收
    - Objective: 使用 axe DevTools 检查无严重可访问性问题
    - References: Req 10.1-10.5
  - [ ] 24.3. 浏览器兼容性测试
    - Objective: 在 Chrome、Firefox、Safari、Edge 最新版测试核心功能
    - References: Req 10.5
