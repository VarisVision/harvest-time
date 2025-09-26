"use client"

import { useEffect } from "react"

export default function AuthErrorPage() {
  useEffect(() => {
    if (window.opener) {
      window.opener.postMessage({ type: "OAUTH_ERROR" }, "*")
      window.close()
    } else {
      window.location.href = "/login?error=Authentication failed"
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4 text-red-600">Authentication Failed</h1>
      <p className="mb-4">There was an error during the authentication process.</p>
      <p className="text-sm text-gray-600">This window will close automatically...</p>
    </div>
  )
}
