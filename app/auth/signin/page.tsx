// app/auth/signin/page.tsx

'use client'

import { signIn, useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LoadingScreen from '../../../components/LoadingScreen' // Adjust the path as needed

export default function SignInPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') {
      // Still checking session
      return
    }

    if (session) {
      // If already authenticated, redirect to home or desired page
      router.push('/')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return <LoadingScreen />
  }

  return (
    <div className="flex items-center justify-center h-screen bg-black text-green-500">
      <div className="p-8 border border-green-500 rounded">
        <h1 className="text-2xl mb-4">Sign In</h1>
        <button
          onClick={() => signIn()}
          className="bg-green-500 text-black px-4 py-2 rounded"
        >
          Sign In with GitHub
        </button>
      </div>
    </div>
  )
}
