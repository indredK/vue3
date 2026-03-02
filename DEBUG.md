# 调试指南

## 当前问题：页面空白

### 快速检查步骤

#### 1. 访问正确的 URL
确保访问：
```
http://localhost:3001/
```

**不是**：
- ~~http://localhost:3001/vue3-admin-platform/~~（已改为根路径）
- ~~http://localhost:3000/~~（端口被占用，使用 3001）

#### 2. 清除浏览器缓存和 localStorage

打开浏览器开发者工具（F12），在 Console 中执行：
```javascript
// 清除 localStorage
localStorage.clear()

// 刷新页面
location.reload()
```

#### 3. 检查浏览器控制台错误

打开开发者工具（F12），切换到 Console 标签，查看是否有：
- 红色错误信息
- 路由相关的警告
- 404 错误

**常见错误及解决方案：**

##### 错误 1: "Failed to resolve module specifier"
```
解决：清除缓存，重启开发服务器
pnpm dev
```

##### 错误 2: "Cannot read properties of null"
```
解决：检查 #app 元素是否存在
查看 index.html 中是否有 <div id="app"></div>
```

##### 错误 3: 路由循环
```
解决：清除 localStorage
localStorage.clear()
```

#### 4. 检查网络请求

在开发者工具的 Network 标签中：
- 确保 HTML 文件加载成功（200）
- 确保 main.ts 加载成功
- 确保没有 404 错误

#### 5. 检查 Vue DevTools

如果安装了 Vue DevTools：
- 检查是否能看到 Vue 应用
- 查看 Pinia store 中的 user 状态
- 查看路由列表

---

## 详细调试步骤

### 步骤 1：确认服务器运行

在终端中应该看到：
```
VITE v5.4.21  ready in 319 ms
➜  Local:   http://localhost:3001/
```

如果没有，运行：
```bash
cd trae_projects/vue3-admin-platform
pnpm dev
```

### 步骤 2：访问登录页

1. 打开浏览器
2. 访问 `http://localhost:3001/`
3. 应该自动跳转到 `http://localhost:3001/login`
4. 应该看到登录表单

**如果看不到登录页：**
- 打开 F12 控制台
- 查看 Console 中的错误
- 查看 Network 中是否有失败的请求

### 步骤 3：测试登录

1. 输入用户名：`admin`
2. 输入密码：`admin123`
3. 点击登录
4. 应该跳转到 Dashboard

**如果登录失败：**
- 检查控制台是否有错误
- 确认用户名密码正确

### 步骤 4：检查 localStorage

在控制台执行：
```javascript
console.log('Token:', localStorage.getItem('token'))
console.log('Locale:', localStorage.getItem('locale'))
```

应该看到：
```
Token: mock-token-1234567890
Locale: zh-CN
```

### 步骤 5：检查路由

在控制台执行：
```javascript
import { router } from './src/router'
console.log('Routes:', router.getRoutes())
```

应该看到多个路由，包括：
- /login
- /dashboard
- /system/user
- 等等

---

## 常见问题排查

### 问题 1：页面完全空白

**可能原因：**
1. JavaScript 加载失败
2. Vue 应用挂载失败
3. 路由配置错误

**排查步骤：**
```javascript
// 1. 检查 #app 元素
console.log(document.getElementById('app'))
// 应该返回 div 元素

// 2. 检查 Vue 是否加载
console.log(window.__VUE__)
// 应该有值

// 3. 检查路由
console.log(window.location.pathname)
// 应该显示当前路径
```

### 问题 2：登录后空白

**可能原因：**
1. 动态路由未加载
2. Layout 组件加载失败
3. 路由守卫死循环

**排查步骤：**
```javascript
// 在 Vue DevTools 中检查
// Pinia > user store
{
  token: "mock-token-xxx",
  userInfo: { ... },
  routesLoaded: true  // 应该是 true
}
```

### 问题 3：刷新后空白

**可能原因：**
1. localStorage 被清除
2. 路由未重新加载
3. 路由守卫逻辑错误

**解决方案：**
```javascript
// 检查 token 是否存在
if (!localStorage.getItem('token')) {
  console.log('Token 丢失，需要重新登录')
}

// 检查路由加载状态
// 在 Vue DevTools 中查看 routesLoaded
```

---

## 手动测试脚本

在浏览器控制台执行以下脚本进行测试：

### 测试 1：检查环境
```javascript
console.log('=== 环境检查 ===')
console.log('URL:', window.location.href)
console.log('App Element:', document.getElementById('app'))
console.log('Token:', localStorage.getItem('token'))
console.log('Locale:', localStorage.getItem('locale'))
```

### 测试 2：模拟登录
```javascript
// 设置 token
localStorage.setItem('token', 'mock-token-test')
// 刷新页面
location.reload()
```

### 测试 3：清除状态
```javascript
// 清除所有状态
localStorage.clear()
sessionStorage.clear()
// 刷新页面
location.reload()
```

---

## 开发者工具使用

### Chrome DevTools

1. **Console（控制台）**
   - 查看错误信息
   - 执行调试脚本
   - 查看日志输出

2. **Network（网络）**
   - 查看资源加载情况
   - 检查 API 请求
   - 查看响应内容

3. **Application（应用）**
   - Local Storage：查看存储的数据
   - Session Storage：查看会话数据
   - Cookies：查看 Cookie

4. **Vue DevTools**
   - Components：查看组件树
   - Pinia：查看状态管理
   - Router：查看路由信息

---

## 紧急修复

如果以上都不行，执行以下步骤：

### 1. 完全重置
```bash
# 停止开发服务器（Ctrl+C）

# 清除 node_modules
rm -rf node_modules

# 清除 lock 文件
rm pnpm-lock.yaml

# 重新安装
pnpm install

# 启动
pnpm dev
```

### 2. 检查端口占用
```bash
# 查看 3001 端口是否被占用
lsof -i :3001

# 如果被占用，杀死进程
kill -9 <PID>
```

### 3. 使用不同浏览器
- 尝试使用 Chrome 隐私模式
- 尝试使用 Firefox
- 尝试使用 Safari

---

## 获取帮助

如果问题仍然存在，请提供以下信息：

1. **浏览器控制台截图**
   - Console 标签的错误信息
   - Network 标签的请求列表

2. **开发服务器输出**
   - 终端中的完整输出
   - 是否有错误或警告

3. **环境信息**
   ```bash
   node --version
   pnpm --version
   ```

4. **访问的 URL**
   - 完整的 URL 地址
   - 是否有重定向

5. **localStorage 内容**
   ```javascript
   console.log(JSON.stringify(localStorage))
   ```

---

## 当前配置

- **开发服务器**：http://localhost:3001/
- **Base URL**：/ (根路径)
- **路由模式**：HTML5 History
- **默认语言**：zh-CN
- **测试账号**：admin / admin123

---

## 下一步

1. 按照上述步骤逐一检查
2. 记录遇到的错误信息
3. 如果有错误，提供完整的错误堆栈
4. 我会根据具体错误提供解决方案
