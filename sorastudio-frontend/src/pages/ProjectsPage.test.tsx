import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { ProjectsPage } from '../pages/ProjectsPage'

// Mock authService
vi.mock('../services/authService', () => ({
  authService: {
    getUserProjects: vi.fn().mockResolvedValue([]),
  },
}))

test('renders projects page', async () => {
  render(<ProjectsPage />)

  expect(screen.getByText('我的项目')).toBeInTheDocument()
  expect(screen.getByText('管理您的AI生成项目和历史记录')).toBeInTheDocument()
})