"use client"

import { useEffect } from "react"

export default function AuthSuccessPage() {
  useEffect(() => {
    if (window.opener) {
      window.opener.postMessage({ type: "OAUTH_SUCCESS" }, "*")
      window.close()
    } else {
      window.location.href = "/time-entry"
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Authentication Successful!</h1>
      <p className="mb-4">You have been successfully signed in to Harvest.</p>
      <p className="text-sm text-gray-600">This window will close automatically...</p>
    </div>
  )
}
