'use client'

import { ReactNode } from 'react'
import AuthWrapper from '../components/AuthWrapper' // Adjust the path as needed

interface ProtectedLayoutProps {
  children: ReactNode
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return <AuthWrapper>{children}</AuthWrapper>
}