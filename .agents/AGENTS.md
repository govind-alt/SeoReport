<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# 🧠 Global Agent Rules — RankFlow Project

## RULE 1 — Read the Knowledge Base First (MANDATORY)

**Before starting ANY task**, every agent MUST read:

1. `.agents/knowledge-base/PROJECT_SNAPSHOT.md` — current environment, credentials, architecture overview, known issues
2. `.agents/knowledge-base/INDEX.md` — find which category files are relevant to your task
3. The relevant category file(s) from `.agents/knowledge-base/` — read entries for the area you are working on

**This is not optional.** Skipping this step risks repeating known mistakes, breaking established patterns, or using wrong commands.

---

## RULE 2 — Invoke Knowledge Curator After Every Task (MANDATORY)

**After completing ANY task**, every agent MUST act as the **Knowledge Curator** and update the knowledge base before ending their turn.

The Knowledge Curator skill instructions are in:
```
.agents/skills/knowledge-curator/SKILL.md
```

Follow those instructions exactly. At minimum:
- Write a dated entry to the relevant category file in `.agents/knowledge-base/`
- Update `INDEX.md` with the new entry
- Update `PROJECT_SNAPSHOT.md` if anything about the running environment changed
- **Run git commit + push** (see Step 6 in SKILL.md)

**Git commit + push after every curator run:**
```powershell
git add .agents/knowledge-base/ .agents/AGENTS.md
git commit -m "knowledge: <one-line summary of task completed>"
git push
```

Print this confirmation when done:
```
✅ Knowledge Curator: Updated [file] with "[entry title]". Committed & pushed → knowledge: [commit message].
```


---

## RULE 3 — Node.js Execution (CRITICAL)

`npm`, `pnpm`, and `npx` are **NOT available** in the system PATH on this machine.

**Always use this exact path to run Node.js:**
```powershell
& "C:\Users\hrish\AppData\Local\Programs\cursor\resources\app\resources\helpers\node.exe" <script> <args>
```

**Common patterns:**
```powershell
# Start dev server
& "C:\Users\hrish\AppData\Local\Programs\cursor\resources\app\resources\helpers\node.exe" "node_modules\next\dist\bin\next" dev

# Run Prisma
& "C:\Users\hrish\AppData\Local\Programs\cursor\resources\app\resources\helpers\node.exe" "node_modules\.bin\prisma" <command>

# Run tsx
& "C:\Users\hrish\AppData\Local\Programs\cursor\resources\app\resources\helpers\node.exe" "node_modules\.bin\tsx" <script.ts>
```

---

## RULE 4 — Authentication Pattern

This project uses **NextAuth v5 (beta)**, NOT v4. The API is completely different.

**Correct:**
```typescript
import { auth } from "@/lib/auth"
const session = await auth()
```

**Wrong — do not use:**
```typescript
import { getServerSession } from "next-auth"  // ❌ v4 API, does not exist
```

---

## RULE 5 — Database Safety

The dev SQLite database (`dev.db`) has seeded demo data. **Do not run `prisma migrate dev`** unless explicitly asked. It will wipe the seed data.

Use `prisma db push` for schema changes during development, or check with the user first.

---

## RULE 6 — Knowledge Base Location

```
.agents/
  AGENTS.md                          ← This file (global rules)
  skills/
    knowledge-curator/
      SKILL.md                       ← Knowledge Curator instructions
  knowledge-base/
    INDEX.md                         ← Master index (always update this)
    PROJECT_SNAPSHOT.md              ← Current project state (always read this first)
    architecture.md                  ← Design patterns, routing, multi-tenancy
    auth.md                          ← Authentication knowledge
    database.md                      ← Prisma, schema, migrations
    api.md                           ← API routes, server actions, cron
    frontend.md                      ← Components, pages, UI patterns
    billing.md                       ← Plans, Stripe, invoices
    pdf-reports.md                   ← PDF generation
    multi-tenancy.md                 ← Domain routing, middleware
    devops.md                        ← Node.js, env vars, deployment
    bugs-and-gotchas.md              ← Known issues and workarounds
```
