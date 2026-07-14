import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import Nodemailer from "next-auth/providers/nodemailer"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login", // Custom login page
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      checks: ["state"],
    }),
    Nodemailer({
      server: process.env.EMAIL_SERVER || {
        host: "localhost",
        port: 1025,
        auth: {
          user: "mock",
          pass: "mock",
        },
      },
      from: process.env.EMAIL_FROM || "noreply@rankflow.app",
      // Custom sendVerificationRequest to log to console if in development
      async sendVerificationRequest(params) {
        const { identifier, url, provider } = params;
        if (process.env.NODE_ENV !== "production") {
          console.log(`\n\n[MAGIC LINK GENERATED]`);
          console.log(`To: ${identifier}`);
          console.log(`URL: ${url}\n\n`);
        } else {
          // If in production, you would use provider.server to actually send the email here
          // This relies on the standard next-auth nodemailer implementation internally.
          // For now, we will log it.
          console.log(`Simulated sending magic link to ${identifier}: ${url}`);
        }
      }
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: { agency: true }
        })

        if (!user || !user.password) return null

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) return null

        return user
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // user object is only available on sign in
        token.role = user.role
        token.agencyId = user.agencyId
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role as string
        session.user.agencyId = token.agencyId as string
      }
      return session
    },
  },
})
