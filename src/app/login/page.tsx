"use client"

import { useEffect, useState } from "react"

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const url = new URL(window.location.href)
    const err = url.searchParams.get("error")
    if (err) setError(err)
  }, [])

  const handleAuthorize = () => {
    window.location.href = "/api/auth/login"
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">You need to sign in!</h1>
        <p className="mb-4">
            You need to be signed into a Harvest account!<br /> 
            Please, sign in or sign up:
        </p>
        {error && <p>{error}</p>}
        <button onClick={handleAuthorize} className="hover:cursor-pointer bg-amber-300 p-2 rounded-md text-black font-bold">Sign In</button>
    </div>
  )
}


