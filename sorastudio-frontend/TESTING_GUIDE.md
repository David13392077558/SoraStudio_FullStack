# SoraStudio 前端测试指南

## 📋 概述

本项目使用 **Vitest** + **@testing-library/react** 作为测试框架，提供了完整的单元测试、组件测试和集成测试支持。

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 运行测试
```bash
# 开发模式（监听文件变化）
npm test

# 运行所有测试一次
npm run test:run

# 带UI界面的测试
npm run test:ui

# 生成覆盖率报告
npm run test:coverage
```

## 📁 测试文件结构

```
src/
├── components/
│   ├── shared/
│   │   ├── ImageUploader.test.tsx    # 组件测试
│   │   └── VideoUploader.test.tsx
│   └── ...
├── pages/
│   ├── SoraPage.test.tsx             # 页面测试
│   ├── ProjectsPage.test.tsx
│   └── ...
├── services/
│   └── authService.test.ts           # 服务测试
├── api/
│   └── client.test.ts                # API测试
├── hooks/
│   └── useVideoPolling.test.ts       # Hook测试
├── utils.test.ts                     # 工具函数测试
└── test/
    └── setup.ts                      # 测试环境配置
```

## 🧪 测试类型

### 1. 单元测试 (Unit Tests)
测试单个函数、类或模块的逻辑。

```typescript
// src/utils/formatters.test.ts
import { describe, it, expect } from 'vitest'
import { formatFileSize } from './formatters'

describe('formatFileSize', () => {
  it('should format bytes correctly', () => {
    expect(formatFileSize(1024)).toBe('1.00 KB')
    expect(formatFileSize(1024 * 1024)).toBe('1.00 MB')
  })
})
```

### 2. 组件测试 (Component Tests)
测试React组件的渲染、交互和行为。

```typescript
// src/components/shared/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { Button } from './Button'

test('renders button with text', () => {
  render(<Button>Click me</Button>)
  expect(screen.getByText('Click me')).toBeInTheDocument()
})

test('calls onClick when clicked', () => {
  const handleClick = vi.fn()
  render(<Button onClick={handleClick}>Click me</Button>)

  fireEvent.click(screen.getByText('Click me'))
  expect(handleClick).toHaveBeenCalledTimes(1)
})
```

### 3. 集成测试 (Integration Tests)
测试多个组件或模块之间的交互。

```typescript
// src/pages/LoginPage.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { LoginPage } from './LoginPage'

// Mock auth service
vi.mock('../services/authService')

test('successful login flow', async () => {
  const user = userEvent.setup()
  render(<LoginPage />)

  await user.type(screen.getByLabelText('邮箱'), 'test@example.com')
  await user.type(screen.getByLabelText('密码'), 'password123')
  await user.click(screen.getByText('登录'))

  await waitFor(() => {
    expect(screen.getByText('登录成功')).toBeInTheDocument()
  })
})
```

## 🛠️ 测试工具和技巧

### Mocking

#### API Mocking
```typescript
import { vi } from 'vitest'
import axios from 'axios'

// Mock axios
vi.mock('axios')
const mockedAxios = vi.mocked(axios)

test('fetches data', async () => {
  mockedAxios.get.mockResolvedValue({
    data: { users: [{ id: 1, name: 'John' }] }
  })

  const result = await fetchUsers()
  expect(result).toEqual([{ id: 1, name: 'John' }])
})
```

#### 自定义Hook Mocking
```typescript
// Mock custom hook
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'John' },
    isAuthenticated: true
  })
}))
```

### Testing Library 查询方法

```typescript
// 按文本内容查找
screen.getByText('提交')
screen.getByRole('button', { name: '提交' })

// 按标签查找
screen.getByLabelText('用户名')

// 按占位符查找
screen.getByPlaceholderText('请输入用户名')

// 按测试ID查找
screen.getByTestId('submit-button')
```

### 用户交互测试

```typescript
import userEvent from '@testing-library/user-event'

test('form submission', async () => {
  const user = userEvent.setup()
  render(<ContactForm />)

  // 填写表单
  await user.type(screen.getByLabelText('姓名'), '张三')
  await user.type(screen.getByLabelText('邮箱'), 'zhangsan@example.com')

  // 提交表单
  await user.click(screen.getByText('提交'))

  // 验证结果
  await waitFor(() => {
    expect(screen.getByText('提交成功')).toBeInTheDocument()
  })
})
```

## 🎯 测试最佳实践

### 1. 测试命名
```typescript
// ✅ 好的命名
describe('UserProfile Component', () => {
  test('displays user name when data is loaded')
  test('shows loading spinner while fetching data')
  test('handles error state gracefully')
})

// ❌ 不好的命名
describe('UserProfile', () => {
  test('test 1')
  test('test user profile')
})
```

### 2. 测试结构
```typescript
test('should handle successful form submission', async () => {
  // Arrange - 设置测试环境
  const mockSubmit = vi.fn()
  render(<Form onSubmit={mockSubmit} />)

  // Act - 执行操作
  await userEvent.type(screen.getByLabelText('Name'), 'John')
  await userEvent.click(screen.getByText('Submit'))

  // Assert - 验证结果
  expect(mockSubmit).toHaveBeenCalledWith({ name: 'John' })
})
```

### 3. 避免测试实现细节
```typescript
// ✅ 测试行为
test('shows error message when login fails', async () => {
  // Mock failed login
  render(<LoginForm />)
  // ... test that error message appears
})

// ❌ 测试实现细节
test('calls setState with error when login fails', () => {
  // Testing internal state management
})
```

## 🔧 配置和环境

### 测试环境配置 (`src/test/setup.ts`)
```typescript
import '@testing-library/jest-dom'

// Mock browser APIs
Object.defineProperty(window, 'matchMedia', {
  value: vi.fn().mockReturnValue({
    matches: false,
    addListener: vi.fn(),
    removeListener: vi.fn()
  })
})

// Mock localStorage
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
```

### Vitest 配置 (`vite.config.ts`)
```typescript
export default defineConfig({
  test: {
    globals: true,           // 全局导入 test, expect, vi 等
    environment: 'jsdom',    // DOM 环境
    setupFiles: ['./src/test/setup.ts'], // 设置文件
    css: true,               // 支持 CSS
  }
})
```

## 📊 覆盖率报告

运行覆盖率测试：
```bash
npm run test:coverage
```

覆盖率报告将生成在 `coverage/` 目录中，包含：
- 语句覆盖率 (Statements)
- 分支覆盖率 (Branches)
- 函数覆盖率 (Functions)
- 行覆盖率 (Lines)

## 🚀 CI/CD 集成

### GitHub Actions 示例
```yaml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:run
      - run: npm run test:coverage
```

## 🐛 调试测试

### 在VS Code中调试
1. 在测试文件中设置断点
2. 按 F5 或点击调试面板
3. 选择 "Debug Current Test File"

### 控制台调试
```typescript
test('debug test', () => {
  console.log('Current state:', state)
  // 添加 debugger 语句
  debugger
  expect(result).toBe(expected)
})
```

## 📚 常用测试模式

### 异步测试
```typescript
test('async operation', async () => {
  const result = await someAsyncFunction()
  expect(result).toBe('expected value')
})
```

### 错误测试
```typescript
test('throws error for invalid input', () => {
  expect(() => {
    validateEmail('invalid-email')
  }).toThrow('Invalid email format')
})
```

### 快照测试
```typescript
test('matches snapshot', () => {
  const { container } = render(<Component />)
  expect(container.firstChild).toMatchSnapshot()
})
```

## 🎉 总结

通过这套测试框架，我们可以：
- ✅ 确保代码质量和可靠性
- ✅ 防止回归问题
- ✅ 提高重构信心
- ✅ 提供文档化的行为规范
- ✅ 支持持续集成和部署

开始编写测试，让我们的代码更加健壮！ 🚀