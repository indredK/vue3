# 部署指南

## GitHub 仓库

项目已成功关联到 GitHub 仓库：
```
https://github.com/indredK/vue3.git
```

## 本地开发

### 克隆项目
```bash
git clone https://github.com/indredK/vue3.git
cd vue3
```

### 安装依赖
```bash
pnpm install
```

### 启动开发服务器
```bash
pnpm dev
```

访问：`http://localhost:3000/vue3-admin-platform/`

## 生产部署

### 构建项目
```bash
pnpm build
```

构建产物将生成在 `dist` 目录。

### 部署到静态服务器

#### 1. Vercel 部署

1. 在 Vercel 导入 GitHub 仓库
2. 配置构建设置：
   - Build Command: `pnpm build`
   - Output Directory: `dist`
   - Install Command: `pnpm install`
3. 点击 Deploy

#### 2. Netlify 部署

1. 在 Netlify 导入 GitHub 仓库
2. 配置构建设置：
   - Build command: `pnpm build`
   - Publish directory: `dist`
3. 点击 Deploy

#### 3. GitHub Pages 部署

项目已包含 GitHub Actions 工作流（`.github/workflows/deploy.yml`）。

启用步骤：
1. 进入仓库 Settings > Pages
2. Source 选择 "GitHub Actions"
3. 推送代码到 main 分支会自动触发部署

访问地址：`https://indredK.github.io/vue3/`

#### 4. 服务器部署（Nginx）

1. 构建项目：
```bash
pnpm build
```

2. 将 `dist` 目录上传到服务器

3. Nginx 配置示例：
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/vue3-admin-platform/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 启用 gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

## 环境变量配置

复制 `.env.example` 为 `.env` 并根据需要修改：

```bash
cp .env.example .env
```

## Git 工作流

### 提交代码
```bash
git add .
git commit -m "描述你的更改"
git push origin main
```

### 创建新分支
```bash
git checkout -b feature/new-feature
# 开发完成后
git push origin feature/new-feature
```

### 拉取最新代码
```bash
git pull origin main
```

## 注意事项

1. **Base URL 配置**：如果部署到子路径，需要修改 `vite.config.ts` 中的 `base` 配置
2. **API 地址**：生产环境需要配置正确的 API 地址
3. **路由模式**：项目使用 HTML5 History 模式，需要服务器支持
4. **浏览器兼容性**：确保目标浏览器支持 ES2020

## 性能优化建议

1. 启用 CDN 加速静态资源
2. 配置服务器 gzip 压缩
3. 启用浏览器缓存
4. 使用 HTTP/2
5. 图片资源使用 WebP 格式

## 监控和日志

建议集成：
- Sentry - 错误监控
- Google Analytics - 用户行为分析
- 服务器日志 - Nginx/Apache 访问日志

## 备份策略

1. 定期备份数据库（如果有）
2. 代码托管在 GitHub（已完成）
3. 定期备份服务器配置文件

## 技术支持

如有问题，请：
1. 查看项目 README.md
2. 查看 QUICKSTART.md
3. 在 GitHub 提交 Issue
