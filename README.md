# Vue3 管理平台

一个基于 Vue 3 + TypeScript + Element Plus + Vite 的现代化管理平台。

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - JavaScript 的超集
- **Vite** - 下一代前端构建工具
- **Element Plus** - Vue 3 组件库
- **Vue Router** - 官方路由管理器
- **Pinia** - Vue 状态管理
- **Vue I18n** - 国际化插件
- **UnoCSS** - 即时按需原子化 CSS 引擎

## 功能特性

- ✅ 用户登录/登出
- ✅ 动态路由权限控制
- ✅ 国际化支持（中文/英文）
- ✅ 响应式布局
- ✅ 数据看板
- ✅ 系统管理（用户/角色/权限）
- ✅ 设备管理
- ✅ 资产管理
- ✅ 订单管理
- ✅ 系统设置

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

服务器将在 `http://localhost:3000` 启动（如果端口被占用会自动使用其他端口）

### 构建生产版本

```bash
pnpm build
```

### 预览生产构建

```bash
pnpm preview
```

## 测试账号

- 用户名：`admin`
- 密码：`admin123`

## 项目结构

```
vue3-admin-platform/
├── src/
│   ├── directives/       # 自定义指令
│   ├── i18n/            # 国际化配置
│   │   └── locales/     # 语言文件
│   ├── router/          # 路由配置
│   ├── stores/          # Pinia 状态管理
│   ├── styles/          # 全局样式
│   ├── views/           # 页面组件
│   │   ├── asset/       # 资产管理
│   │   ├── dashboard/   # 数据看板
│   │   ├── device/      # 设备管理
│   │   ├── login/       # 登录页
│   │   ├── order/       # 订单管理
│   │   ├── settings/    # 系统设置
│   │   ├── system/      # 系统管理
│   │   └── Layout.vue   # 布局组件
│   ├── App.vue          # 根组件
│   └── main.ts          # 入口文件
├── index.html           # HTML 模板
├── vite.config.ts       # Vite 配置
├── tsconfig.json        # TypeScript 配置
└── uno.config.ts        # UnoCSS 配置
```

## 权限系统

项目实现了基于角色和权限的访问控制：

- 路由级别权限控制
- 按钮级别权限控制（使用 `v-permission` 指令）
- 支持角色和权限双重验证

### 使用权限指令

```vue
<el-button v-permission="{ permission: 'system:user:add' }">
  新增用户
</el-button>

<el-button v-permission="{ role: 'admin' }">
  管理员功能
</el-button>
```

## 国际化

项目支持中文和英文两种语言，可以通过顶部导航栏切换。

语言文件位于 `src/i18n/locales/` 目录。

## 开发说明

### 添加新页面

1. 在 `src/views/` 下创建页面组件
2. 在 `src/router/index.ts` 中添加路由配置
3. 在 `src/i18n/locales/` 中添加对应的国际化文本

### 添加新的权限

在 `src/stores/user.ts` 的 `mockUserData.permissions` 数组中添加权限标识。

## 浏览器支持

- Chrome >= 87
- Firefox >= 78
- Safari >= 14
- Edge >= 88

## License

MIT
