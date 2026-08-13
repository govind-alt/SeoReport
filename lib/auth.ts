import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"
import { isRateLimited, recordFailedAttempt, clearAttempts } from "./rate-limit"

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Strict email validation */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/** Minimum 6 chars for passwords */
function isValidPassword(password: string): boolean {
  return typeof password === "string" && password.length >= 6;
}

// ── NextAuth Config ──────────────────────────────────────────────────────────

export const { handlers, signIn, signOut, auth } = NextAuth({
  // ── Security ──────────────────────────────────────────────────────────────
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "development-fallback-secret-key-12345",
  trustHost: true,
  adapter: PrismaAdapter(prisma),

  // ── Session: JWT strategy with 24-hour expiry ─────────────────────────────
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,       // 24 hours
    updateAge: 60 * 60,          // Refresh token every 1 hour
  },

  // ── Custom pages ─────────────────────────────────────────────────────────
  pages: {
    signIn: "/login",
    error: "/login",             // Auth errors redirect here
  },

  // ── Providers ─────────────────────────────────────────────────────────────
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      checks: ["state", "pkce"],  // PKCE + state for maximum OAuth security
      authorization: {
        params: {
          prompt: "select_account", // Always show account chooser
          access_type: "offline",
        },
      },
    }),

    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totpCode: { label: "2FA Code", type: "text" },
      },
      async authorize(credentials) {
        const email    = (credentials?.email    as string | undefined)?.trim().toLowerCase();
        const password = (credentials?.password as string | undefined);

        // ── 1. Basic input validation ────────────────────────────────────
        if (!email || !password) return null;
        if (!isValidEmail(email))    return null;
        if (!isValidPassword(password)) return null;

        // ── 2. Rate-limit check (per email) ─────────────────────────────
        const { limited, remainingSeconds } = isRateLimited(email);
        if (limited) {
          // We throw so NextAuth surfaces the error correctly
          throw new Error(
            `Too many failed attempts. Try again in ${Math.ceil((remainingSeconds ?? 900) / 60)} minute(s).`
          );
        }

        // ── 3. Look up user ──────────────────────────────────────────────
        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            name: true,
            email: true,
            password: true,
            role: true,
            agencyId: true,
            image: true,
            twoFactorEnabled: true,
            twoFactorSecret: true,
          },
        });

        // No user found → record attempt, return null (generic error to client)
        if (!user) {
          recordFailedAttempt(email);
          return null;
        }

        // Google-only account (no password set) — cannot use credentials
        if (!user.password) {
          recordFailedAttempt(email);
          return null;
        }

        // ── 4. Constant-time password compare ────────────────────────────
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          const nowLimited = recordFailedAttempt(email);
          if (nowLimited) {
            throw new Error("Too many failed attempts. Account temporarily locked for 15 minutes.");
          }
          return null; // Wrong password — generic error
        }

        // ── 4.5. 2FA Check ───────────────────────────────────────────────
        if (user.twoFactorEnabled && user.twoFactorSecret) {
          const totpCode = (credentials?.totpCode as string | undefined)?.trim();
          
          if (!totpCode) {
            throw new Error("2FA_REQUIRED"); // Special string we check in the frontend
          }

          // We need to dynamically import speakeasy or require it since NextAuth runs on Node
          const speakeasy = require('speakeasy');
          const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: totpCode,
            window: 1,
          });

          if (!verified) {
            throw new Error("Invalid 2FA code. Please try again.");
          }
        }

        // ── 5. Success — clear rate-limit ─────────────────────────────────
        clearAttempts(email);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          agencyId: user.agencyId,
        } as any;
      },
    }),
  ],

  // ── Events ───────────────────────────────────────────────────────────────
  events: {
    /**
     * Fires once when a brand-new user record is created (Google OAuth first sign-in).
     * Auto-creates an Agency workspace for them.
     */
    async createUser({ user }) {
      // Only create agency if user doesn't already have one
      const existingUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { agencyId: true },
      });

      if (!existingUser?.agencyId) {
        const baseName = user.name ?? "My Agency";
        // Slug: lowercase alphanum + random suffix to ensure uniqueness
        const rawSlug  = baseName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
        const slug     = rawSlug + "-" + Math.random().toString(36).substring(2, 7);

        const agency = await prisma.agency.create({
          data: {
            name: baseName,
            slug,
            subdomain: slug,
          },
        });

        await prisma.user.update({
          where: { id: user.id },
          data: { agencyId: agency.id, role: "admin" },
        });
      }
    },
  },

  // ── Callbacks ────────────────────────────────────────────────────────────
  callbacks: {
    /**
     * JWT callback — called every time a token is created or refreshed.
     * Persist custom fields into the token so they survive across requests.
     */
    async jwt({ token, user, account, trigger }) {
      // `user` is only set on initial sign-in
      if (user) {
        token.id       = user.id;
        token.role     = (user as any).role     ?? "member";
        token.agencyId = (user as any).agencyId ?? null;
        token.name     = user.name;
        token.email    = user.email;
        token.picture  = user.image ?? null;
      }

      // For Google sign-ins, re-fetch agencyId from DB so it's always fresh
      if (account?.provider === "google" && token.id) {
        const dbUser = await prisma.user.findUnique({
          where:  { id: token.id as string },
          select: { role: true, agencyId: true, name: true },
        });
        if (dbUser) {
          token.role     = dbUser.role;
          token.agencyId = dbUser.agencyId;
          token.name     = dbUser.name ?? token.name;
        }
      }

      return token;
    },

    /**
     * Session callback — shapes what is returned to the client via useSession().
     * Never expose sensitive data (password, tokens) here.
     */
    async session({ session, token }) {
      session.user.id       = token.id      as string;
      session.user.role     = token.role    as string;
      session.user.agencyId = token.agencyId as string | null;
      session.user.name     = token.name    as string | null;
      session.user.email    = token.email   as string;
      session.user.image    = token.picture as string | null;
      return session;
    },
  },
});
