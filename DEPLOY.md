# Vercel部署指南

本文档提供了将贝军国画网站部署到Vercel平台并启用全球加速的详细步骤。

## 准备工作

1. 创建[Vercel账户](https://vercel.com/signup)（如果还没有）
2. 将代码推送到GitHub仓库

## 部署步骤

### 1. 连接GitHub仓库

1. 登录Vercel账户
2. 点击"New Project"
3. 选择"Import Git Repository"
4. 授权Vercel访问您的GitHub账户
5. 选择包含贝军国画网站代码的仓库

### 2. 配置部署设置

1. 项目名称：输入您想要的项目名称，例如"beijun-gallery"
2. 框架预设：选择"Other"
3. 构建和输出设置：
   - 构建命令：留空（静态网站无需构建）
   - 输出目录：留空（默认为根目录）
4. 点击"Deploy"按钮

## 全球加速配置

项目已通过vercel.json文件配置了全球CDN加速。该文件包含以下配置：

```json
{
  "version": 2,
  "builds": [
    { "src": "**/*", "use": "@vercel/static" }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "/$1" }
  ],
  "github": {
    "silent": true
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    },
    {
      "source": "/images/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

## 自定义域名设置

1. 在Vercel项目仪表板中，点击"Settings"
2. 选择"Domains"
3. 添加您的自定义域名
4. 按照Vercel提供的说明配置DNS记录
5. 等待DNS传播完成（通常需要几分钟到几小时）

## SSL证书配置

Vercel会自动为您的自定义域名提供免费的SSL证书，无需额外配置。

## 部署更新

每当您将更改推送到GitHub仓库的主分支时，Vercel将自动重新部署您的网站。

## 性能优化

Vercel已经提供了全球CDN加速，但您还可以：

1. 优化图片：确保所有图片都经过适当压缩
2. 使用WebP格式：考虑将JPG图片转换为WebP格式以提高加载速度
3. 延迟加载：对于画廊页面，考虑实现图片延迟加载

## 监控与分析

1. 在Vercel项目仪表板中，点击"Analytics"
2. 启用Vercel Analytics以监控网站性能和访问情况
3. 考虑集成Google Analytics或百度统计等第三方分析工具

## 故障排除

如果部署过程中遇到问题：

1. 检查Vercel部署日志
2. 确认vercel.json文件格式正确
3. 联系Vercel支持或查阅[Vercel文档](https://vercel.com/docs)