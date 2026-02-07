# AI Team Frontend 设计系统

## 🎨 设计理念

参考 Claude.ai、Apple 和 Google 的现代简约风格，打造优雅、清晰、易用的 AI 助手界面。

---

## 🌈 配色方案

### 主色调（Primary Colors）

基于 Claude.ai 的优雅配色，采用温暖的橙棕色系：

```css
/* 主色 - 橙棕色系 */
--primary-50: #FFF7ED;
--primary-100: #FFEDD5;
--primary-200: #FED7AA;
--primary-300: #FDBA74;
--primary-400: #FB923C;
--primary-500: #F97316;  /* 主色 */
--primary-600: #EA580C;
--primary-700: #C2410C;
--primary-800: #9A3412;
--primary-900: #7C2D12;
```

### 中性色（Neutral Colors）

```css
/* 背景色 */
--bg-primary: #FFFFFF;
--bg-secondary: #F9FAFB;
--bg-tertiary: #F3F4F6;

/* 文字色 */
--text-primary: #111827;
--text-secondary: #6B7280;
--text-tertiary: #9CA3AF;

/* 边框色 */
--border-light: #E5E7EB;
--border-medium: #D1D5DB;
--border-dark: #9CA3AF;
```

### 语义色（Semantic Colors）

```css
/* 成功 */
--success: #10B981;
--success-light: #D1FAE5;

/* 警告 */
--warning: #F59E0B;
--warning-light: #FEF3C7;

/* 错误 */
--error: #EF4444;
--error-light: #FEE2E2;

/* 信息 */
--info: #3B82F6;
--info-light: #DBEAFE;
```

---

## 📐 布局系统

### 间距系统（Spacing）

采用 8px 基准的间距系统：

```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
```

### 圆角系统（Border Radius）

```css
--radius-sm: 0.375rem;  /* 6px */
--radius-md: 0.5rem;    /* 8px */
--radius-lg: 0.75rem;   /* 12px */
--radius-xl: 1rem;      /* 16px */
--radius-2xl: 1.5rem;   /* 24px */
--radius-full: 9999px;  /* 圆形 */
```

### 阴影系统（Shadows）

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
```

---

## ✍️ 字体系统

### 字体家族

```css
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
--font-mono: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, monospace;
```

### 字体大小

```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

### 字重

```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

---

## 🧩 组件设计

### 按钮（Button）

**主按钮（Primary）**:
- 背景: `--primary-500`
- 文字: 白色
- 圆角: `--radius-lg`
- 内边距: `12px 24px`
- Hover: `--primary-600`

**次按钮（Secondary）**:
- 背景: 透明
- 边框: `--border-medium`
- 文字: `--text-primary`
- Hover: `--bg-secondary`

**文字按钮（Text）**:
- 背景: 透明
- 文字: `--primary-500`
- Hover: `--primary-50`

### 输入框（Input）

- 边框: `--border-light`
- 圆角: `--radius-md`
- 内边距: `10px 14px`
- Focus: `--primary-500` 边框
- 字体大小: `--text-base`

### 卡片（Card）

- 背景: `--bg-primary`
- 边框: `--border-light`
- 圆角: `--radius-xl`
- 阴影: `--shadow-sm`
- Hover: `--shadow-md`

---

## 📱 页面布局

### 导航栏（Navigation）

**顶部导航**:
- 高度: 64px
- 背景: `--bg-primary`
- 边框底部: `--border-light`
- Logo 左对齐
- 导航项右对齐

**侧边栏**:
- 宽度: 280px
- 背景: `--bg-secondary`
- 可折叠
- 图标 + 文字

### 主内容区

**聊天界面**:
- 最大宽度: 800px
- 居中对齐
- 消息气泡圆角: `--radius-2xl`
- 用户消息: `--primary-50` 背景
- AI 消息: `--bg-secondary` 背景

**工具页面**:
- 最大宽度: 1200px
- 卡片式布局
- 网格间距: `--space-6`

---

## 🎭 动画效果

### 过渡动画

```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
```

### 常用动画

- **淡入淡出**: opacity + transform
- **滑动**: transform translateY/X
- **缩放**: transform scale
- **旋转**: transform rotate

---

## 🎯 功能入口设计

### 主导航

清晰的 5 大功能入口：

1. **💬 AI 聊天** - 首页，最突出
2. **🛠️ 工具生成** - 创建工具
3. **🎯 任务管理** - 查看任务
4. **🧩 技能中心** - MCP 技能
5. **📦 代码进化** - 自我优化

### 快捷操作

- **新建对话**: 右上角 "+" 按钮
- **设置**: 右上角齿轮图标
- **用户菜单**: 右上角头像

---

## 📐 响应式设计

### 断点

```css
--breakpoint-sm: 640px;   /* 手机 */
--breakpoint-md: 768px;   /* 平板 */
--breakpoint-lg: 1024px;  /* 笔记本 */
--breakpoint-xl: 1280px;  /* 桌面 */
```

### 适配规则

- **移动端**: 单列布局，侧边栏折叠
- **平板**: 双列布局，侧边栏可见
- **桌面**: 三列布局，完整功能

---

## ✨ 设计原则

### 1. 简洁优先

- 去除不必要的装饰
- 留白充足
- 层次清晰

### 2. 一致性

- 统一的配色
- 统一的间距
- 统一的圆角

### 3. 易用性

- 清晰的功能入口
- 明确的操作反馈
- 友好的错误提示

### 4. 性能优化

- 减少动画复杂度
- 优化图片加载
- 懒加载组件

---

## 🎨 设计对比

### 之前的问题

❌ 颜色过于鲜艳，不够优雅  
❌ 功能入口不清晰  
❌ 间距不统一  
❌ 缺乏层次感

### 现在的改进

✅ 优雅的橙棕色系  
✅ 清晰的 5 大功能入口  
✅ 统一的 8px 间距系统  
✅ 明确的视觉层次

---

## 📚 参考资源

- **Claude.ai**: 配色和布局灵感
- **Apple Human Interface Guidelines**: 设计原则
- **Google Material Design**: 组件设计
- **Tailwind CSS**: 工具类系统

---

**设计系统版本**: v1.0  
**最后更新**: 2026-02-07  
**负责人**: Manus AI Agent
