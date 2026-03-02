# Bug 修复记录

## 问题：刷新页面后丢失内容

### 问题描述
登录后访问任何页面，刷新浏览器会导致页面内容丢失或显示空白。

### 问题原因
1. 动态路由在刷新后没有被重新加载
2. 路由守卫中缺少对"路由已加载"状态的跟踪
3. 刷新时虽然 token 和用户信息存在，但动态路由没有重新注册到路由器中

### 解决方案

#### 1. 添加路由加载状态标记
在 `src/stores/user.ts` 中添加 `routesLoaded` 状态：

```typescript
const routesLoaded = ref(false)  // 跟踪路由是否已加载
```

#### 2. 修改 initRoutes 方法
确保路由只加载一次：

```typescript
async function initRoutes() {
  if (!routesLoaded.value) {
    await loadAsyncRoutes()
    routesLoaded.value = true
  }
}
```

#### 3. 优化路由守卫逻辑
在 `src/router/index.ts` 中改进路由守卫：

```typescript
router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore()
  
  // 1. 登录页处理
  if (to.path === '/login') {
    if (userStore.token) {
      next('/dashboard')
    } else {
      next()
    }
    return
  }
  
  // 2. 未登录处理
  if (!userStore.token) {
    next('/login')
    return
  }
  
  // 3. 首次加载（没有用户信息）
  if (!userStore.userInfo) {
    try {
      await userStore.getUserInfo()
      await userStore.initRoutes()
      next({ ...to, replace: true })
    } catch (error) {
      await userStore.logout()
      next('/login')
    }
    return
  }
  
  // 4. 刷新页面（有用户信息但路由未加载）
  if (!userStore.routesLoaded) {
    try {
      await userStore.initRoutes()
      next({ ...to, replace: true })
    } catch (error) {
      await userStore.logout()
      next('/login')
    }
    return
  }
  
  // 5. 正常导航
  next()
})
```

#### 4. 登出时重置状态
确保登出时重置路由加载标记：

```typescript
async function logout() {
  token.value = ''
  userInfo.value = null
  permissions.value = []
  roles.value = []
  routesLoaded.value = false  // 重置标记
  localStorage.removeItem('token')
  router.push('/login')
}
```

### 测试步骤

1. **登录测试**
   ```
   1. 访问 http://localhost:3001/vue3-admin-platform/
   2. 使用 admin/admin123 登录
   3. 应该成功跳转到 dashboard
   ```

2. **刷新测试**
   ```
   1. 登录后访问任意页面（如 /system/user）
   2. 按 F5 或点击浏览器刷新按钮
   3. 页面应该正常显示，不会丢失内容
   ```

3. **导航测试**
   ```
   1. 登录后在不同页面间切换
   2. 所有菜单项应该正常工作
   3. 刷新任意页面都应该保持当前页面状态
   ```

4. **登出测试**
   ```
   1. 点击右上角用户头像
   2. 选择"退出登录"
   3. 应该跳转到登录页
   4. 再次登录应该正常工作
   ```

### 技术细节

#### 为什么需要 `next({ ...to, replace: true })`？

当动态路由刚被添加时，当前的导航还不知道这些新路由。使用 `next({ ...to, replace: true })` 会：
1. 重新触发导航到目标路由
2. 此时路由器已经知道新添加的动态路由
3. `replace: true` 避免在历史记录中留下重复条目

#### 为什么需要 routesLoaded 标记？

- 刷新页面时，Pinia store 会重新初始化
- 但 localStorage 中的 token 仍然存在
- 需要一个标记来判断动态路由是否已经加载到路由器中
- 避免重复加载路由

### 相关文件

- `src/stores/user.ts` - 用户状态管理
- `src/router/index.ts` - 路由配置和守卫
- `src/main.ts` - 应用入口

### 修复时间
2024-01-15

### 修复版本
v1.0.1

### 影响范围
- 所有需要登录的页面
- 动态路由加载逻辑
- 页面刷新行为

### 后续优化建议

1. **添加加载状态**
   - 在路由加载时显示 loading 动画
   - 提升用户体验

2. **错误处理**
   - 添加更详细的错误提示
   - 区分不同类型的错误（网络错误、权限错误等）

3. **路由缓存**
   - 考虑使用 keep-alive 缓存页面组件
   - 减少重复渲染

4. **性能优化**
   - 路由懒加载已实现
   - 可以考虑预加载常用路由

### 验证结果

✅ 登录功能正常
✅ 刷新页面内容保持
✅ 路由导航正常
✅ 登出功能正常
✅ 权限控制正常
✅ TypeScript 编译无错误
