'use client'

import { useSession, signIn } from 'next-auth/react'
import { useEffect } from 'react'
import LoadingScreen from './LoadingScreen' // Adjust the path as needed

interface AuthWrapperProps {
  children: React.ReactNode
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'unauthenticated') {
      signIn() // Redirects to the sign-in page
    }
  }, [status])

  if (status === 'loading') {
    return <LoadingScreen />
  }

  if (status === 'authenticated') {
    return <>{children}</>
  }

  // While redirecting, don't render anything
  return null
}

export default AuthWrapper
