import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ClientExamplePage from './page'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

jest.mock('@/lib/supabase/client')
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

type Note = {
  id: string
  title: string
}

describe('ClientExamplePage CRUD Operations', () => {
  const mockSelect = jest.fn()
  const mockInsert = jest.fn()
  const mockDelete = jest.fn()
  const mockFrom = jest.fn()

  const setupMocks = (notes: Note[] = []) => {
    mockSelect.mockResolvedValue({ data: notes, error: null })
    mockInsert.mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: { id: '999', title: 'New Note' },
          error: null
        }),
      }),
    })
    mockDelete.mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null }),
    })
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({ push: jest.fn() })
    mockFrom.mockReturnValue({ select: mockSelect, insert: mockInsert, delete: mockDelete })
    ;(createClient as jest.Mock).mockReturnValue({ from: mockFrom })
  })

  describe('Fetch Notes (Read)', () => {
    it('should fetch and display notes', async () => {
      setupMocks([
        { id: '1', title: 'First Note' },
        { id: '2', title: 'Second Note' },
      ])

      render(<ClientExamplePage />)

      await waitFor(() => {
        expect(screen.getByText('First Note')).toBeInTheDocument()
        expect(screen.getByText('Second Note')).toBeInTheDocument()
      })
    })

    it('should show empty state when no notes', async () => {
      setupMocks([])
      render(<ClientExamplePage />)

      await waitFor(() => {
        expect(screen.getByText(/no notes yet/i)).toBeInTheDocument()
      })
    })
  })

  describe('Create Note', () => {
    it('should create note and display it', async () => {
      setupMocks([])
      render(<ClientExamplePage />)

      await waitFor(() => screen.getByPlaceholderText(/enter note title/i))

      const input = screen.getByPlaceholderText(/enter note title/i) as HTMLInputElement
      fireEvent.change(input, { target: { value: 'New Note' } })
      fireEvent.click(screen.getByRole('button', { name: /add note/i }))

      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith({ title: 'New Note' })
        expect(input.value).toBe('')
      })
    })

    it('should show loading state when submitting', async () => {
      setupMocks([])
      mockInsert.mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockImplementation(
            () => new Promise((resolve) => setTimeout(() => resolve({ data: { id: '1', title: 'Test' }, error: null }), 100))
          ),
        }),
      })

      render(<ClientExamplePage />)
      await waitFor(() => screen.getByPlaceholderText(/enter note title/i))

      fireEvent.change(screen.getByPlaceholderText(/enter note title/i), { target: { value: 'Test' } })
      fireEvent.click(screen.getByRole('button', { name: /add note/i }))

      expect(screen.getByText(/adding/i)).toBeInTheDocument()
    })
  })

  describe('Delete Note', () => {
    it('should delete note optimistically', async () => {
      setupMocks([
        { id: '1', title: 'Note to Delete' },
        { id: '2', title: 'Note to Keep' },
      ])

      render(<ClientExamplePage />)
      await waitFor(() => screen.getByText('Note to Delete'))

      fireEvent.click(screen.getAllByRole('button', { name: /delete/i })[0])

      await waitFor(() => {
        expect(screen.queryByText('Note to Delete')).not.toBeInTheDocument()
        expect(screen.getByText('Note to Keep')).toBeInTheDocument()
      })
    })

    it('should restore note if delete fails', async () => {
      setupMocks([{ id: '1', title: 'Test Note' }])
      mockDelete.mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: new Error('Failed') }),
      })

      render(<ClientExamplePage />)
      await waitFor(() => screen.getByText('Test Note'))

      fireEvent.click(screen.getByRole('button', { name: /delete/i }))

      await waitFor(() => expect(screen.queryByText('Test Note')).not.toBeInTheDocument())
      await waitFor(() => expect(screen.getByText('Test Note')).toBeInTheDocument())
    })
  })
})
