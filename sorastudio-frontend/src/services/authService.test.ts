import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authService } from './authService'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Token Management', () => {
    it('should store and retrieve token', () => {
      const token = 'test-token'
      localStorageMock.setItem.mockImplementation(() => {})
      localStorageMock.getItem.mockReturnValue(token)

      // Mock setAuth call
      authService.setAuth({ user: { id: '1', email: 'test@test.com', name: 'Test' }, token })

      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', token)
      expect(authService.getToken()).toBe(token)
    })

    it('should check authentication status', () => {
      localStorageMock.getItem.mockReturnValueOnce('token').mockReturnValueOnce('{"id":"1"}')

      expect(authService.isAuthenticated()).toBe(true)

      localStorageMock.getItem.mockReturnValueOnce(null)

      expect(authService.isAuthenticated()).toBe(false)
    })
  })

  describe('Project Management', () => {
    it('should create project', async () => {
      const mockApiClient = {
        post: vi.fn().mockResolvedValue({
          data: {
            project: {
              id: '1',
              name: 'Test Project',
              type: 'prompt',
              status: 'draft'
            }
          }
        })
      }

      // Mock the apiClient import
      vi.doMock('../api/client', () => ({
        apiClient: mockApiClient
      }))

      const projectData = {
        name: 'Test Project',
        type: 'prompt' as const,
        tags: ['test']
      }

      const result = await authService.createProject(projectData)

      expect(mockApiClient.post).toHaveBeenCalledWith('/projects', projectData)
      expect(result).toHaveProperty('id', '1')
    })
  })
})