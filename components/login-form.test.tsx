import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LoginForm } from './login-form'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

jest.mock('@/lib/supabase/client')
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

describe('LoginForm Component', () => {
  const mockPush = jest.fn()
  const mockSignInWithPassword = jest.fn()

  const fillLoginForm = (email = 'test@example.com', password = 'password123') => {
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: email } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: password } })
    fireEvent.click(screen.getByRole('button', { name: /login/i }))
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
    ;(createClient as jest.Mock).mockReturnValue({
      auth: { signInWithPassword: mockSignInWithPassword },
    })
  })

  it('should render login form', () => {
    render(<LoginForm />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('should login successfully and redirect', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null })
    render(<LoginForm />)

    fillLoginForm()

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
      expect(mockPush).toHaveBeenCalledWith('/protected')
    })
  })

  it('should display error on failed login', async () => {
    mockSignInWithPassword.mockResolvedValue({
      error: new Error('Invalid login credentials'),
    })
    render(<LoginForm />)

    fillLoginForm()

    await waitFor(() => {
      expect(screen.getByText('Invalid login credentials')).toBeInTheDocument()
    })
  })

  it('should show loading state during login', async () => {
    mockSignInWithPassword.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ error: null }), 100))
    )
    render(<LoginForm />)

    fillLoginForm()

    expect(screen.getByText(/logging in/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled()
  })

  it('should have navigation links', () => {
    render(<LoginForm />)

    expect(screen.getByText(/forgot your password/i).closest('a')).toHaveAttribute('href', '/auth/forgot-password')
    expect(screen.getByText(/sign up/i)).toHaveAttribute('href', '/auth/sign-up')
  })
})
