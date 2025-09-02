"use client"

import { useEffect, useState } from "react"

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const url = new URL(window.location.href)
    const err = url.searchParams.get("error")
    if (err) setError(err)

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "OAUTH_SUCCESS") {
        window.location.href = "/time-entry"
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  const handleAuthorize = () => {
    try {
      const popup = window.open("/api/auth/login", "harvest_oauth", 
        "width=500,height=600,scrollbars=yes,resizable=yes,location=yes"
      )
      
      if (popup) {
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed)
            
            if (window.location.pathname === "/login") {
              window.location.href = "/time-entry"
            }
          }
        }, 1000)
      } else {
        throw new Error("Popup blocked")
      }
    } catch (e) {
      if (window.top && window.top !== window.self) {
        try {
          window.top.postMessage({ type: "OPEN_OAUTH", url: "/api/auth/login" }, "*")
        } catch (postMessageError) {
          window.location.href = "/api/auth/login"
        }
      } else {
        window.location.href = "/api/auth/login"
      }
    }
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


