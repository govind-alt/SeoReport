import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import Nodemailer from "next-auth/providers/nodemailer"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "super-secret-key-vault-phrase-12345",
  trustHost: true,
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
  events: {
    async createUser({ user }) {
      if (!user.agencyId) {
        const agencyName = user.name ? user.name : 'My SEO Agency';
        const slug = agencyName.toLowerCase().replace(/[^a-z0-9-]/g, '') + '-' + Math.random().toString(36).substring(2, 6);
        
        const agency = await prisma.agency.create({
          data: {
            name: agencyName,
            slug: slug,
            subdomain: slug
          }
        });
        
        await prisma.user.update({
          where: { id: user.id },
          data: { agencyId: agency.id, role: 'admin' }
        });
      }
    }
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // user object is only available on sign in
        token.role = user.role
        token.agencyId = user.agencyId
        if (user.name) token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role as string
        session.user.agencyId = token.agencyId as string
        if (token.name) session.user.name = token.name as string
      }
      return session
    },
  },
})
