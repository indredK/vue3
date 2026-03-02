# 测试指南

## 如何测试刷新问题已修复

### 前置条件
确保开发服务器正在运行：
```bash
pnpm dev
```

访问地址：`http://localhost:3001/vue3-admin-platform/`

---

## 测试场景

### 场景 1：登录后刷新首页

**步骤：**
1. 打开浏览器访问登录页
2. 输入用户名：`admin`，密码：`admin123`
3. 点击登录，应该跳转到 Dashboard 页面
4. 按 `F5` 或点击浏览器刷新按钮
5. **预期结果**：Dashboard 页面正常显示，数据完整

**验证点：**
- ✅ 页面不会跳转到登录页
- ✅ 侧边栏菜单正常显示
- ✅ 顶部导航栏正常显示
- ✅ Dashboard 数据卡片正常显示
- ✅ 图表正常渲染

---

### 场景 2：访问子页面后刷新

**步骤：**
1. 登录后点击左侧菜单"系统管理" > "用户管理"
2. 等待页面加载完成，显示用户列表
3. 按 `F5` 刷新页面
4. **预期结果**：用户管理页面正常显示，表格数据完整

**验证点：**
- ✅ URL 保持为 `/system/user`
- ✅ 页面内容正常显示
- ✅ 表格数据正常加载
- ✅ 操作按钮正常显示
- ✅ 权限控制正常工作

---

### 场景 3：多次刷新不同页面

**步骤：**
1. 登录后访问"设备管理"页面
2. 刷新页面，验证正常
3. 切换到"资产管理"页面
4. 刷新页面，验证正常
5. 切换到"订单管理"页面
6. 刷新页面，验证正常

**预期结果：**
- ✅ 每个页面刷新后都能正常显示
- ✅ 页面内容不会丢失
- ✅ 路由状态正确

---

### 场景 4：直接访问深层路由

**步骤：**
1. 登录系统
2. 在浏览器地址栏直接输入：`http://localhost:3001/vue3-admin-platform/system/role`
3. 按回车访问

**预期结果：**
- ✅ 页面正常加载
- ✅ 显示角色管理页面
- ✅ 侧边栏高亮正确的菜单项

---

### 场景 5：刷新后导航功能

**步骤：**
1. 登录后访问任意页面
2. 刷新页面
3. 点击侧边栏其他菜单项进行导航

**预期结果：**
- ✅ 刷新后导航功能正常
- ✅ 可以正常切换到其他页面
- ✅ 路由跳转正常工作

---

### 场景 6：登出后重新登录

**步骤：**
1. 登录系统
2. 访问几个不同的页面
3. 点击右上角用户头像 > 退出登录
4. 重新登录
5. 访问各个页面并刷新

**预期结果：**
- ✅ 登出成功跳转到登录页
- ✅ 重新登录后功能正常
- ✅ 刷新功能正常工作
- ✅ 路由状态正确重置

---

### 场景 7：浏览器前进后退

**步骤：**
1. 登录后依次访问：Dashboard → 用户管理 → 设备管理
2. 点击浏览器后退按钮
3. 刷新页面
4. 再次点击前进按钮

**预期结果：**
- ✅ 前进后退功能正常
- ✅ 刷新后历史记录保持
- ✅ 页面内容正确显示

---

### 场景 8：权限控制验证

**步骤：**
1. 登录后访问"系统管理" > "用户管理"
2. 刷新页面
3. 检查页面上的"新增用户"、"编辑"、"删除"按钮

**预期结果：**
- ✅ 刷新后权限按钮仍然显示
- ✅ 权限控制正常工作
- ✅ v-permission 指令生效

---

## 浏览器兼容性测试

在以下浏览器中测试刷新功能：

### Chrome/Edge
- ✅ 正常刷新
- ✅ 硬刷新（Ctrl+Shift+R）
- ✅ 开发者工具打开时刷新

### Firefox
- ✅ 正常刷新
- ✅ 硬刷新（Ctrl+Shift+R）

### Safari
- ✅ 正常刷新
- ✅ 硬刷新（Cmd+Shift+R）

---

## 开发者工具检查

### 1. 控制台检查
打开浏览器开发者工具（F12），切换到 Console 标签：

**刷新页面时应该看到：**
- ✅ 没有 JavaScript 错误
- ✅ 没有路由相关的警告
- ✅ 没有 404 错误

### 2. 网络请求检查
切换到 Network 标签：

**刷新页面时应该看到：**
- ✅ HTML 文档正常加载（200）
- ✅ JavaScript 文件正常加载
- ✅ CSS 文件正常加载
- ✅ 没有失败的请求

### 3. Vue DevTools 检查
安装 Vue DevTools 扩展后：

**刷新页面时应该看到：**
- ✅ Pinia store 状态正确
- ✅ `userInfo` 有值
- ✅ `token` 存在
- ✅ `routesLoaded` 为 true
- ✅ 路由列表包含动态路由

### 4. Application/Storage 检查
切换到 Application 标签 > Local Storage：

**应该看到：**
- ✅ `token` 键存在
- ✅ `locale` 键存在（语言设置）
- ✅ 刷新后这些值保持不变

---

## 性能测试

### 页面加载时间
使用 Chrome DevTools 的 Performance 标签：

1. 开始录制
2. 刷新页面
3. 停止录制

**检查指标：**
- ✅ FCP (First Contentful Paint) < 1s
- ✅ LCP (Largest Contentful Paint) < 2.5s
- ✅ TTI (Time to Interactive) < 3s

### 内存使用
使用 Chrome DevTools 的 Memory 标签：

1. 拍摄堆快照
2. 刷新页面多次
3. 再次拍摄堆快照

**检查：**
- ✅ 没有明显的内存泄漏
- ✅ 内存使用稳定

---

## 自动化测试建议

### E2E 测试用例（使用 Playwright/Cypress）

```javascript
describe('页面刷新测试', () => {
  it('登录后刷新 Dashboard 页面', async () => {
    await page.goto('/login')
    await page.fill('[placeholder="用户名"]', 'admin')
    await page.fill('[placeholder="密码"]', 'admin123')
    await page.click('button:has-text("登录")')
    await page.waitForURL('**/dashboard')
    
    // 刷新页面
    await page.reload()
    
    // 验证页面内容
    await expect(page.locator('.welcome-section')).toBeVisible()
    await expect(page.locator('.stat-card')).toHaveCount(6)
  })
  
  it('刷新子页面保持状态', async () => {
    // 登录
    await login()
    
    // 访问用户管理
    await page.click('text=用户管理')
    await page.waitForURL('**/system/user')
    
    // 刷新
    await page.reload()
    
    // 验证
    await expect(page.locator('.user-management')).toBeVisible()
    await expect(page.locator('.el-table')).toBeVisible()
  })
})
```

---

## 问题排查

如果刷新后仍然有问题，检查以下内容：

### 1. 清除浏览器缓存
```
Chrome: Ctrl+Shift+Delete
选择"缓存的图片和文件"
```

### 2. 检查 localStorage
```javascript
// 在控制台执行
console.log(localStorage.getItem('token'))
console.log(localStorage.getItem('locale'))
```

### 3. 检查路由配置
```javascript
// 在控制台执行
console.log(router.getRoutes())
// 应该看到所有动态路由
```

### 4. 检查 Pinia store
```javascript
// 在 Vue DevTools 中查看
// Pinia > user store
// 确认 routesLoaded 为 true
```

---

## 测试报告模板

```markdown
## 测试报告

**测试日期：** YYYY-MM-DD
**测试人员：** [姓名]
**浏览器：** Chrome 120 / Firefox 121 / Safari 17

### 测试结果

| 场景 | 状态 | 备注 |
|------|------|------|
| 登录后刷新首页 | ✅ 通过 | |
| 访问子页面后刷新 | ✅ 通过 | |
| 多次刷新不同页面 | ✅ 通过 | |
| 直接访问深层路由 | ✅ 通过 | |
| 刷新后导航功能 | ✅ 通过 | |
| 登出后重新登录 | ✅ 通过 | |
| 浏览器前进后退 | ✅ 通过 | |
| 权限控制验证 | ✅ 通过 | |

### 问题记录
无

### 总结
所有测试场景通过，刷新问题已完全修复。
```

---

## 持续监控

建议在生产环境中：

1. **添加错误监控**
   - 使用 Sentry 捕获路由错误
   - 监控页面加载失败率

2. **添加性能监控**
   - 使用 Google Analytics
   - 监控页面加载时间

3. **用户反馈**
   - 收集用户关于刷新问题的反馈
   - 定期检查错误日志

---

## 相关文档

- [BUGFIX.md](./BUGFIX.md) - Bug 修复详细说明
- [README.md](./README.md) - 项目文档
- [QUICKSTART.md](./QUICKSTART.md) - 快速开始指南
