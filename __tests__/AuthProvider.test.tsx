import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider } from '../components/auth/AuthProvider'

// Mock implementations
const mockSetUser = jest.fn()
const mockSetProfile = jest.fn()
const mockSetLoading = jest.fn()
const mockPush = jest.fn()
const mockReplace = jest.fn()

// Mock store
jest.mock('../store/auth', () => ({
  useAuthStore: jest.fn(() => ({
    setUser: mockSetUser,
    setProfile: mockSetProfile,
    setLoading: mockSetLoading,
  }))
}))

// Mock router
jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
    replace: mockReplace,
    pathname: '/',
    query: {},
    asPath: '/'
  }))
}))

// Mock supabase
const mockSupabaseAuth = {
  getSession: jest.fn(),
  onAuthStateChange: jest.fn(),
  getUser: jest.fn()
}

const mockSupabaseFrom = jest.fn(() => ({
  select: jest.fn(() => ({
    eq: jest.fn(() => ({
      single: jest.fn()
    }))
  })),
  insert: jest.fn(() => ({
    select: jest.fn(() => ({
      single: jest.fn()
    }))
  }))
}))

jest.mock('../lib/supabase', () => ({
  supabase: {
    auth: mockSupabaseAuth,
    from: mockSupabaseFrom
  }
}))

describe('AuthProvider', () => {
  const TestComponent = () => <div>Test Child Component</div>

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup default Supabase mocks
    mockSupabaseAuth.getSession.mockResolvedValue({
      data: { session: null },
      error: null
    })

    mockSupabaseAuth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    } as any)
  })

  describe('Initial Session Loading', () => {
    it('should show loading state initially', () => {
      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should render children after loading', async () => {
      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Test Child Component')).toBeInTheDocument()
      })
    })
  })

  describe('Session Error Handling', () => {
    it('should handle session errors gracefully', async () => {
      const sessionError = new Error('Session expired')
      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: null },
        error: sessionError
      })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Session error:', sessionError)
      })

      consoleSpy.mockRestore()
    })

    it('should handle refresh token errors', async () => {
      const refreshError = new Error('refresh token expired')
      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: null },
        error: refreshError
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(mockSetUser).toHaveBeenCalledWith(null)
      })
    })
  })

  describe('User Profile Management', () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      user_metadata: {},
      app_metadata: {},
      aud: 'authenticated',
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    }

    const mockProfile = {
      id: '123',
      email: 'test@example.com',
      full_name: 'Test User',
      phone: '081234567890',
      role: 'customer' as const,
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    }

    it('should fetch user profile when session exists', async () => {
      mockSupabaseAuth.getSession.mockResolvedValue({
        data: {
          session: {
            user: mockUser,
            access_token: 'token',
            refresh_token: 'refresh',
            expires_in: 3600,
            expires_at: Date.now() + 3600000,
            token_type: 'bearer'
          }
        },
        error: null
      })

      mockSupabaseFrom.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: mockProfile, error: null }))
          }))
        }))
      } as any)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(mockSetUser).toHaveBeenCalledWith(mockUser)
        expect(mockSetProfile).toHaveBeenCalledWith(mockProfile)
      })
    })

    it('should create profile if not exists', async () => {
      mockSupabaseAuth.getSession.mockResolvedValue({
        data: {
          session: {
            user: mockUser,
            access_token: 'token',
            refresh_token: 'refresh',
            expires_in: 3600,
            expires_at: Date.now() + 3600000,
            token_type: 'bearer'
          }
        },
        error: null
      })

      // First call returns no profile
      mockSupabaseFrom.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: null, error: null }))
          }))
        }))
      } as any)

      // Second call (insert) returns new profile
      mockSupabaseFrom.mockReturnValueOnce({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: mockProfile, error: null }))
          }))
        }))
      } as any)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(mockSetProfile).toHaveBeenCalledWith(mockProfile)
      })
    })

    it('should retry profile fetch on failure', async () => {
      mockSupabaseAuth.getSession.mockResolvedValue({
        data: {
          session: {
            user: mockUser,
            access_token: 'token',
            refresh_token: 'refresh',
            expires_in: 3600,
            expires_at: Date.now() + 3600000,
            token_type: 'bearer'
          }
        },
        error: null
      })

      // First call fails
      mockSupabaseFrom.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: null, error: new Error('Network error') }))
          }))
        }))
      } as any)

      // Second call succeeds
      mockSupabaseFrom.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: mockProfile, error: null }))
          }))
        }))
      } as any)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(mockSetProfile).toHaveBeenCalledWith(mockProfile)
      }, { timeout: 3000 })
    })
  })

  describe('Auth State Changes', () => {
    it('should handle SIGNED_IN event', async () => {
      const mockAuthStateCallback = jest.fn()
      mockSupabaseAuth.onAuthStateChange.mockImplementation((callback) => {
        mockAuthStateCallback.mockImplementation(callback)
        return { data: { subscription: { unsubscribe: jest.fn() } } }
      })

      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Simulate SIGNED_IN event
      const mockSession = {
        user: {
          id: '123',
          email: 'test@example.com',
          user_metadata: {},
          app_metadata: {},
          aud: 'authenticated',
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        access_token: 'token',
        refresh_token: 'refresh',
        expires_in: 3600,
        expires_at: Date.now() + 3600000,
        token_type: 'bearer'
      }

      await waitFor(() => {
        mockAuthStateCallback('SIGNED_IN', mockSession)
      })

      expect(mockSetUser).toHaveBeenCalledWith(mockSession.user)
    })

    it('should handle SIGNED_OUT event', async () => {
      const mockAuthStateCallback = jest.fn()
      mockSupabaseAuth.onAuthStateChange.mockImplementation((callback) => {
        mockAuthStateCallback.mockImplementation(callback)
        return { data: { subscription: { unsubscribe: jest.fn() } } }
      })

      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Simulate SIGNED_OUT event
      await waitFor(() => {
        mockAuthStateCallback('SIGNED_OUT', null)
      })

      expect(mockSetUser).toHaveBeenCalledWith(null)
    })
  })
})