# 快速启动指南

## 🚀 已完成的优化

### 1. 修复的问题
- ✅ 修复了 Element Plus 图标导入问题
- ✅ 修复了 Layout.vue 中的图标使用方式
- ✅ 修复了 login/index.vue 中的图标使用方式
- ✅ 修复了 dashboard/index.vue 中的图标使用方式
- ✅ 添加了路由守卫，确保未登录用户重定向到登录页
- ✅ 优化了代码结构和类型定义

### 2. 项目状态
- ✅ 所有依赖已安装
- ✅ TypeScript 编译无错误
- ✅ 开发服务器已成功启动
- ✅ 运行在 http://localhost:3001/vue3-admin-platform/

## 📝 使用说明

### 访问应用
打开浏览器访问：
```
http://localhost:3001/vue3-admin-platform/
```

### 登录信息
```
用户名: admin
密码: admin123
```

### 功能模块

1. **数据看板** (`/dashboard`)
   - 设备统计
   - 资产统计
   - 订单统计
   - 数据趋势图表

2. **系统管理** (`/system`)
   - 用户管理 (`/system/user`)
   - 角色管理 (`/system/role`)
   - 权限管理 (`/system/permission`)

3. **设备管理** (`/device/list`)
   - 设备列表
   - 设备监控

4. **资产管理** (`/asset/list`)
   - 资产列表
   - 资产状态监控

5. **订单管理** (`/order/list`)
   - 订单列表
   - 订单详情

6. **系统设置** (`/settings`)
   - 系统配置

## 🎨 界面特性

- 响应式设计，支持移动端
- 侧边栏可折叠
- 支持中英文切换
- 深色主题侧边栏
- 数据可视化图表
- 权限控制（按钮级别）

## 🔧 开发命令

```bash
# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview

# 代码检查
pnpm lint
```

## 📦 技术栈版本

- Vue 3.4.21
- TypeScript 5.3.3
- Vite 5.1.6
- Element Plus 2.6.1
- Vue Router 4.3.0
- Pinia 2.1.7
- Vue I18n 9.10.2
- UnoCSS 0.58.5

## 🎯 权限系统

### 角色
- `admin` - 管理员（所有权限）
- `user` - 普通用户（部分权限）

### 权限标识
- `system:user:list` - 查看用户列表
- `system:user:add` - 添加用户
- `system:user:edit` - 编辑用户
- `system:user:delete` - 删除用户
- `system:role:list` - 查看角色列表
- `system:role:add` - 添加角色
- `system:role:edit` - 编辑角色
- `system:role:delete` - 删除角色
- `system:permission:list` - 查看权限列表
- `device:list` - 查看设备列表
- `asset:list` - 查看资产列表
- `order:list` - 查看订单列表

### 使用权限指令

```vue
<!-- 基于权限控制 -->
<el-button v-permission="{ permission: 'system:user:add' }">
  新增用户
</el-button>

<!-- 基于角色控制 -->
<el-button v-permission="{ role: 'admin' }">
  管理员功能
</el-button>

<!-- 多个权限（满足其一即可） -->
<el-button v-permission="{ permission: ['system:user:add', 'system:user:edit'] }">
  编辑
</el-button>
```

## 🌐 国际化

切换语言：点击顶部导航栏的语言切换按钮

支持的语言：
- 中文 (zh-CN)
- English (en-US)

## 📱 响应式断点

- xs: < 768px
- sm: >= 768px
- md: >= 992px
- lg: >= 1200px

## 🎨 主题色

- Primary: #409eff
- Success: #67c23a
- Warning: #e6a23c
- Danger: #f56c6c
- Info: #909399

## 💡 提示

1. 项目使用 Mock 数据，所有操作都是前端模拟
2. 刷新页面后登录状态会保持（使用 localStorage）
3. 路由权限基于用户角色和权限动态生成
4. 所有表单操作都有基本的验证和提示

## 🐛 常见问题

### 端口被占用
如果 3000 端口被占用，Vite 会自动使用其他端口（如 3001）

### 图标不显示
确保已正确安装 `@element-plus/icons-vue` 依赖

### 路由 404
检查 `vite.config.ts` 中的 `base` 配置是否正确

## 📞 技术支持

如有问题，请检查：
1. Node.js 版本 >= 16
2. pnpm 已正确安装
3. 依赖已完整安装
4. 浏览器控制台是否有错误信息
