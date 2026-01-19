import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { ImageUploader } from './shared/ImageUploader'

// Mock FileReader
global.FileReader = vi.fn().mockImplementation(() => ({
  readAsDataURL: vi.fn(),
  onload: vi.fn(),
  result: 'data:image/jpeg;base64,test'
}))

describe('ImageUploader', () => {
  const mockOnUpload = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders upload area', () => {
    render(<ImageUploader onUpload={mockOnUpload} />)

    expect(screen.getByText('点击或拖拽上传图片')).toBeInTheDocument()
    expect(screen.getByText('支持 JPG、PNG、GIF 格式')).toBeInTheDocument()
  })

  test('handles file drop', async () => {
    render(<ImageUploader onUpload={mockOnUpload} />)

    const dropzone = screen.getByText('点击或拖拽上传图片').closest('div')

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

    fireEvent.drop(dropzone!, {
      dataTransfer: {
        files: [file]
      }
    })

    await waitFor(() => {
      expect(mockOnUpload).toHaveBeenCalledWith(file)
    })
  })

  test('validates file type', () => {
    render(<ImageUploader onUpload={mockOnUpload} />)

    const dropzone = screen.getByText('点击或拖拽上传图片').closest('div')

    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' })

    fireEvent.drop(dropzone!, {
      dataTransfer: {
        files: [invalidFile]
      }
    })

    expect(screen.getByText('不支持的文件格式')).toBeInTheDocument()
  })
})