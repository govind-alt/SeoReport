# 🚀 DevOps, Environment & Portability

## 1-Command Portable Setup (`package.json`)
Run on any new device or environment:
```bash
cp .env.example .env
npm run setup
npm run dev
```

---

## Key npm Scripts
- `npm run dev`: Starts Next.js development server.
- `npm run setup`: Runs Prisma generate, syncs database schema, seeds demo accounts, and resets passwords to `Password123!`.
- `npm run seed`: Resets all user account passwords to `Password123!`.

---

## Environment Variables (`.env.example`)
- `DATABASE_URL`: Defaults to `file:./dev.db` for local execution.
- `NEXTAUTH_SECRET`: Pre-configured development secret key.
- `NEXT_PUBLIC_APP_URL`: `http://localhost:3000`.
