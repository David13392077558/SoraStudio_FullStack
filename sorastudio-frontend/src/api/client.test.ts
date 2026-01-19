import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { apiClient } from './client'

// Mock axios
vi.mock('axios')
const mockedAxios = vi.mocked(axios)

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generatePrompt', () => {
    it('should call the correct API endpoint with form data', async () => {
      const mockResponse = { data: { taskId: '123' } }
      mockedAxios.post.mockResolvedValueOnce(mockResponse)

      const params = {
        style: 'cinematic',
        description: 'A beautiful sunset'
      }

      const result = await apiClient.generatePrompt(params)

      expect(mockedAxios.post).toHaveBeenCalledWith('/ai/generate-prompt', expect.any(FormData))
      expect(result).toEqual(mockResponse.data)
    })

    it('should include image file in form data when provided', async () => {
      const mockResponse = { data: { taskId: '123' } }
      mockedAxios.post.mockResolvedValueOnce(mockResponse)

      const imageFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const params = {
        image: imageFile,
        style: 'cinematic'
      }

      await apiClient.generatePrompt(params)

      const formData = mockedAxios.post.mock.calls[0][1] as FormData
      expect(formData.get('image')).toEqual(imageFile)
      expect(formData.get('style')).toBe('cinematic')
    })
  })

  describe('getTaskStatus', () => {
    it('should call the correct API endpoint', async () => {
      const mockResponse = { data: { status: 'completed', result: 'test result' } }
      mockedAxios.get.mockResolvedValueOnce(mockResponse)

      const result = await apiClient.getTaskStatus('123')

      expect(mockedAxios.get).toHaveBeenCalledWith('/tasks/123')
      expect(result).toEqual(mockResponse.data)
    })
  })
})