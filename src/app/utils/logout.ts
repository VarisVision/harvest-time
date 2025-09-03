export async function logout() {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
    })
    
    if (response.ok) {
      window.location.href = "/login"
    } else {
      console.error("Logout failed")
      window.location.href = "/login"
    }
  } catch (error) {
    console.error("Logout error:", error)
    window.location.href = "/login"
  }
}
