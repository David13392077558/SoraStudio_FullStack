# Vitest Configuration

## 运行测试

### 开发模式（监听模式）
```bash
npm test
# 或者
npm run test
```

### 运行所有测试一次
```bash
npm run test:run
```

### 带UI界面的测试
```bash
npm run test:ui
```

### 生成覆盖率报告
```bash
npm run test:coverage
```

## 测试文件命名约定

- 测试文件应以 `.test.tsx` 或 `.test.ts` 结尾
- 测试文件应与被测试的文件在同一目录下

## 测试结构

### 单元测试
- 测试单个函数、组件或模块
- 文件位置: `src/**/*.test.ts`

### 组件测试
- 测试React组件的渲染和交互
- 文件位置: `src/**/*.test.tsx`

### 集成测试
- 测试多个组件或模块的集成
- 文件位置: `src/**/*.test.tsx`

## 测试示例

### 组件测试
```typescript
import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { MyComponent } from './MyComponent'

test('renders component correctly', () => {
  render(<MyComponent />)
  expect(screen.getByText('Hello World')).toBeInTheDocument()
})
```

### API测试
```typescript
import { expect, test, vi } from 'vitest'
import { apiClient } from './client'

test('calls API correctly', async () => {
  const mockResponse = { data: { result: 'success' } }
  vi.mocked(axios.get).mockResolvedValue(mockResponse)

  const result = await apiClient.getData()
  expect(result).toEqual(mockResponse.data)
})
```

## Mock策略

### API Mock
```typescript
vi.mock('./api/client', () => ({
  apiClient: {
    getData: vi.fn().mockResolvedValue({ result: 'mocked' })
  }
}))
```

### 浏览器API Mock
```typescript
// 在 src/test/setup.ts 中
Object.defineProperty(window, 'matchMedia', {
  value: vi.fn().mockReturnValue({
    matches: false,
    addListener: vi.fn(),
    removeListener: vi.fn()
  })
})
```

## 覆盖率目标

- 语句覆盖率: > 80%
- 分支覆盖率: > 75%
- 函数覆盖率: > 85%
- 行覆盖率: > 80%

## CI/CD集成

测试会在以下情况下自动运行:
- 代码推送时
- Pull Request时
- 部署前

## 调试测试

### 在VS Code中调试
1. 在测试文件中设置断点
2. 运行测试命令
3. 使用VS Code的调试面板

### 控制台调试
```typescript
test('debug test', () => {
  console.log('Debug info')
  // 测试代码
})
```