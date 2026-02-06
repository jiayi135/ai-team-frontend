# DOM removeChild 错误修复分析

## 问题定位

**错误信息：**
```
NotFoundError: 无法对"Node"执行"removeChild"操作：要删除的节点不是此节点的子节点。
```

**问题位置：**
- 文件：`client/src/components/Map.tsx`
- 行号：103
- 代码：`script.remove();`

## 根本原因

在 `loadMapScript` 函数中，当 Google Maps API 脚本加载完成后，代码尝试立即移除 script 标签：

```typescript
script.onload = () => {
  resolve(null);
  script.remove(); // ⚠️ 问题代码
};
```

### 可能的触发场景

1. **重复调用问题**：如果 `loadMapScript` 被多次调用（例如组件重新挂载），可能会尝试删除已经被删除的 script 元素

2. **时序问题**：在某些浏览器或特定情况下，script 元素可能已经被浏览器内部机制处理或移除

3. **父节点变化**：在 script 加载期间，如果 document.head 发生了变化，可能导致 script 不再是 head 的子节点

4. **React 严格模式**：在开发环境中，React 严格模式会导致组件挂载两次，可能触发重复的脚本加载

## 修复方案

### 方案 1：安全的 remove 调用（推荐）

在删除前检查 script 是否仍然存在于 DOM 中：

```typescript
script.onload = () => {
  resolve(null);
  // 安全地移除 script
  if (script.parentNode) {
    script.parentNode.removeChild(script);
  }
};
```

### 方案 2：使用 try-catch 包裹

```typescript
script.onload = () => {
  resolve(null);
  try {
    script.remove();
  } catch (error) {
    console.warn('Script already removed:', error);
  }
};
```

### 方案 3：添加全局加载状态（最佳实践）

避免重复加载脚本：

```typescript
let isMapScriptLoaded = false;
let loadingPromise: Promise<void> | null = null;

function loadMapScript() {
  // 如果已经加载，直接返回
  if (isMapScriptLoaded) {
    return Promise.resolve();
  }
  
  // 如果正在加载，返回现有的 Promise
  if (loadingPromise) {
    return loadingPromise;
  }
  
  loadingPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = `${MAPS_PROXY_URL}/maps/api/js?key=${API_KEY}&v=weekly&libraries=marker,places,geocoding,geometry`;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => {
      isMapScriptLoaded = true;
      resolve();
      // 安全地移除 script
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
    script.onerror = () => {
      console.error("Failed to load Google Maps script");
      loadingPromise = null; // 允许重试
    };
    document.head.appendChild(script);
  });
  
  return loadingPromise;
}
```

## 推荐实施

采用 **方案 3**，因为它：
1. ✅ 防止重复加载脚本
2. ✅ 安全地处理 DOM 操作
3. ✅ 提升性能（避免重复网络请求）
4. ✅ 符合 React 最佳实践

## 额外优化

考虑添加清理逻辑到组件的 useEffect 中：

```typescript
useEffect(() => {
  init();
  
  // 清理函数（可选）
  return () => {
    // 如果需要，在组件卸载时清理资源
  };
}, [init]);
```
