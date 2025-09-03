import { useAuthStore } from '@/store/auth'
import { act, renderHook } from '@testing-library/react'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('Auth Store', () => {
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

  const mockAdminProfile = {
    id: '456',
    email: 'admin@example.com',
    full_name: 'Admin User',
    phone: '081234567891',
    role: 'admin' as const,
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useAuthStore())
      
      expect(result.current.user).toBeNull()
      expect(result.current.profile).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.isLoading).toBe(true) // Initial loading state
    })
  })

  describe('setUser', () => {
    it('should set user and update authentication state', () => {
      const { result } = renderHook(() => useAuthStore())
      
      act(() => {
        result.current.setUser(mockUser)
      })
      
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.isLoading).toBe(true) // Still loading until profile is set
    })

    it('should handle null user', () => {
      const { result } = renderHook(() => useAuthStore())
      
      // First set a user
      act(() => {
        result.current.setUser(mockUser)
      })
      
      // Then set to null
      act(() => {
        result.current.setUser(null)
      })
      
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('setProfile', () => {
    it('should set profile', () => {
      const { result } = renderHook(() => useAuthStore())
      
      act(() => {
        result.current.setProfile(mockProfile)
      })
      
      expect(result.current.profile).toEqual(mockProfile)
    })

    it('should handle null profile', () => {
      const { result } = renderHook(() => useAuthStore())
      
      // First set a profile
      act(() => {
        result.current.setProfile(mockProfile)
      })
      
      // Then set to null
      act(() => {
        result.current.setProfile(null)
      })
      
      expect(result.current.profile).toBeNull()
    })
  })

  describe('logout', () => {
    it('should clear user and profile data', () => {
      const { result } = renderHook(() => useAuthStore())
      
      // Set initial data
      act(() => {
        result.current.setUser(mockUser)
        result.current.setProfile(mockProfile)
      })
      
      // Logout
      act(() => {
        result.current.logout()
      })
      
      expect(result.current.user).toBeNull()
      expect(result.current.profile).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('isAdmin', () => {
    it('should return true for admin role', () => {
      const { result } = renderHook(() => useAuthStore())
      
      act(() => {
        result.current.setUser(mockUser)
        result.current.setProfile(mockAdminProfile)
      })
      
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.profile?.role).toBe('admin')
      expect(result.current.isAdmin()).toBe(true)
    })

    it('should return false for customer role', () => {
      const { result } = renderHook(() => useAuthStore())
      
      act(() => {
        result.current.setUser(mockUser)
        result.current.setProfile(mockProfile)
      })
      
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.profile?.role).toBe('customer')
      expect(result.current.isAdmin()).toBe(false)
    })

    it('should return false when not authenticated', () => {
      const { result } = renderHook(() => useAuthStore())
      
      expect(result.current.isAdmin()).toBe(false)
    })
  })

  describe('isCustomer', () => {
    it('should return true for customer role', () => {
      const { result } = renderHook(() => useAuthStore())
      
      act(() => {
        result.current.setUser(mockUser)
        result.current.setProfile(mockProfile)
      })
      
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.profile?.role).toBe('customer')
      expect(result.current.isCustomer()).toBe(true)
    })

    it('should return false for admin role', () => {
      const { result } = renderHook(() => useAuthStore())
      
      act(() => {
        result.current.setUser(mockUser)
        result.current.setProfile(mockAdminProfile)
      })
      
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.profile?.role).toBe('admin')
      expect(result.current.isCustomer()).toBe(false)
    })

    it('should return false when not authenticated', () => {
      const { result } = renderHook(() => useAuthStore())
      
      expect(result.current.isCustomer()).toBe(false)
    })
  })



  describe('State Consistency', () => {
    it('should maintain consistency between user and authentication state', () => {
      const { result } = renderHook(() => useAuthStore())
      
      // When user is set, isAuthenticated should be true
      act(() => {
        result.current.setUser(mockUser)
      })
      
      expect(result.current.isAuthenticated).toBe(true)
      
      // When user is cleared, isAuthenticated should be false
      act(() => {
        result.current.setUser(null)
      })
      
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('should set loading to false when user is set', () => {
      const { result } = renderHook(() => useAuthStore())
      
      expect(result.current.isLoading).toBe(false)
      
      act(() => {
        result.current.setUser(mockUser)
      })
      
      expect(result.current.isLoading).toBe(false)
    })

    it('should set loading to false when user is explicitly set to null', () => {
      const { result } = renderHook(() => useAuthStore())
      
      expect(result.current.isLoading).toBe(false)
      
      act(() => {
        result.current.setUser(null)
      })
      
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should handle multiple rapid state changes', () => {
      const { result } = renderHook(() => useAuthStore())
      
      act(() => {
        result.current.setUser(mockUser)
        result.current.setProfile(mockProfile)
        result.current.logout()
        result.current.setUser(mockUser)
      })
      
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.profile).toBeNull() // Should be cleared by logout
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('should handle setting same user multiple times', () => {
      const { result } = renderHook(() => useAuthStore())
      
      act(() => {
        result.current.setUser(mockUser)
        result.current.setUser(mockUser)
        result.current.setUser(mockUser)
      })
      
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
    })
  })
})