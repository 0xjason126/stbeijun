# 贝军国画网站

这是贝军国画作品展示网站的源代码仓库。网站展示了贝军老师的国画作品集，包括人物画、山水画等多种题材。

## 项目结构

- `index.html` - 网站首页
- `gallery.html` - 画廊页面
- `artists.html` - 艺术家介绍页面
- `css/` - 样式文件
- `js/` - JavaScript脚本
- `images/` - 图片资源目录
- `data/` - 数据文件

## 部署说明

本项目已配置为可以直接部署到Vercel平台，并启用全球CDN加速。详细的部署步骤请参考 [DEPLOY.md](./DEPLOY.md) 文件。

### 快速部署

1. 将代码推送到GitHub仓库
2. 在Vercel上导入该GitHub仓库
3. 使用默认配置部署
4. 网站将自动通过Vercel的全球CDN网络提供服务

## 全球加速

本项目使用Vercel提供的全球CDN网络，确保网站在全球范围内都能快速访问。主要优势包括：

- 全球边缘网络分发
- 自动图片优化
- 智能路由
- 自动HTTPS加密
- 高速缓存策略

## 开发指南

本项目是一个纯静态网站，无需构建步骤。直接编辑HTML、CSS和JavaScript文件即可。

### 本地开发

可以使用任何静态文件服务器在本地预览网站，例如：

```bash
# 使用Python的简易HTTP服务器
python -m http.server

# 或使用Node.js的http-server
npx http-server
```

## 图片资源管理

图片资源的管理规范请参考 [images/README.md](./images/README.md) 文件。