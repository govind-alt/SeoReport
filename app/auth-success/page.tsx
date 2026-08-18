import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

/**
 * /auth-success
 *
 * Server-side landing page after any sign-in (credentials OR Google OAuth).
 * Reads the session role and redirects to the correct dashboard.
 *
 *  superadmin  → /superadmin
 *  admin/member → /admin/dashboard   (Agency workspace)
 *  client       → /client-portal
 *  (no session) → /login
 */
export default async function AuthSuccessPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const role = (session.user.role ?? "").toLowerCase()

  if (role === "superadmin") {
    redirect("/superadmin")
  }

  if (role === "client") {
    redirect("/client-portal")
  }

  // agency admin / member / admin (Google sign-up creates role = "admin")
  redirect("/admin/dashboard")
}
