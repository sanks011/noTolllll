'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { apiService } from '@/lib/api'

interface User {
  id: string
  email: string
  companyName: string
  contactPerson: string
  userType: string
  role: string
  isAdmin?: boolean
  sector: string
  hsCode?: string
  targetCountries?: string[]
}

interface SignupData {
  email: string
  password: string
  companyName: string
  contactPerson: string
  userType: string
  role: string
  isAdmin?: boolean
  sector?: string
  hsCode?: string
  targetCountries?: string[]
}

interface AuthContextType {
  user: User | null
  signin: (email: string, password: string) => Promise<User>
  signup: (data: SignupData) => Promise<User>
  signout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored token on mount
    const token = localStorage.getItem('token')
    if (token) {
      // Set token in API service
      apiService.setToken(token)
      // Validate token with backend
      apiService.getProfile()
        .then((response: any) => {
          setUser(response.user)
        })
        .catch(() => {
          localStorage.removeItem('token')
          apiService.clearToken()
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const signin = async (email: string, password: string): Promise<User> => {
    try {
      const response = await apiService.signin(email, password)
      localStorage.setItem('token', response.token)
      apiService.setToken(response.token)
      setUser(response.user)
      return response.user
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign in')
    }
  }

  const signup = async (data: SignupData): Promise<User> => {
    try {
      const response = await apiService.signup(data)
      localStorage.setItem('token', response.token)
      apiService.setToken(response.token)
      setUser(response.user)
      return response.user
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign up')
    }
  }

  const signout = () => {
    localStorage.removeItem('token')
    apiService.clearToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        signin,
        signup,
        signout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
