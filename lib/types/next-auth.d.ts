import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      role: string
      agencyId: string | null
    } & DefaultSession["user"]
  }

  interface User {
    role: string
    agencyId: string | null
  }
}
