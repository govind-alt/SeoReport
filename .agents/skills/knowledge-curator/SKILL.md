---
name: knowledge-curator
description: >
  Triggered automatically after EVERY task completion on this project.
  Gathers information about what was done, why, and how — then writes structured
  summaries into the project knowledge base so every future AI agent starts
  with full context. Runs as a mandatory post-task hook for all agents.
---

# Knowledge Curator — Skill Instructions

## Purpose
You are the **Knowledge Curator** for the RankFlow SeoReport project.  
Your sole job is to **capture and persist structured knowledge** after each task so that every future AI agent (and human collaborator) can start with complete, accurate context.

---

## When You Run
You MUST be invoked **after every task completion** on this project — no exceptions.  
The triggering agent is responsible for calling you before ending their turn.

---

## Step-by-Step Execution

### 1. Collect Task Summary
Gather the following from the completed task context:
- **Task description** — what the agent was asked to do
- **Files changed** — list every file created, modified, or deleted (with absolute paths)
- **What was done** — a plain-English summary of the changes
- **Why it was done** — the reasoning and user intent behind the change
- **How it works** — explanation of key logic, patterns, or architecture decisions introduced
- **Known issues / gotchas** — anything that is fragile, incomplete, or needs follow-up
- **Open questions** — unresolved decisions left for the user or future agents

### 2. Read the Existing Knowledge Base
Before writing, always read:
```
c:\Users\hrish\Downloads\SeoReport-main v3\SeoReport-main\.agents\knowledge-base\INDEX.md
```
This is the master index. Check which domain/feature area the task touched.

### 3. Write or Update a Knowledge Entry
Choose the correct category file from `knowledge-base/` (or create one if it doesn't exist).

**Category files:**
| File | Coverage |
|------|----------|
| `auth.md` | Authentication, sessions, NextAuth, role logic |
| `database.md` | Prisma schema, migrations, SQLite/libSQL/PostgreSQL config |
| `api.md` | API routes, server actions, cron jobs |
| `frontend.md` | React components, pages, UI patterns, routing |
| `billing.md` | Plans, Stripe, invoice PDF generator |
| `pdf-reports.md` | PDF generation, puppeteer, report templates |
| `multi-tenancy.md` | Domain routing, agency/client separation, middleware |
| `devops.md` | Build, env vars, deployment, Node.js setup |
| `bugs-and-gotchas.md` | Known issues, fragile code, workarounds |
| `architecture.md` | High-level design decisions, patterns used across the codebase |

**Entry format** (append to the relevant file):
```markdown
## [YYYY-MM-DD] <Short Title>

**Task:** <one-line description of what the agent was asked to do>  
**Files Changed:**
- `path/to/file1.ts` — created/modified/deleted
- `path/to/file2.tsx` — created/modified/deleted

**What Was Done:**
<Plain English summary>

**Why:**
<Reasoning and user intent>

**How It Works:**
<Key logic, patterns, code flow explanation>

**Gotchas / Watch Out For:**
<Anything fragile or surprising>

**Open Questions:**
<Unresolved items, if any>

---
```

### 4. Update the Master INDEX.md
After writing the entry, update `INDEX.md` to reflect:
- The entry date and title
- Which file it was written to
- A one-line summary

### 5. Update PROJECT_SNAPSHOT.md
Update `PROJECT_SNAPSHOT.md` with any changes to:
- Active features
- Known working state
- Critical environment facts (e.g., Node.js path, port, DB location)

### 6. Git Commit & Push — MANDATORY
After writing all knowledge base updates, **always** run a git commit and push:

```powershell
# Stage all knowledge base changes
git add .agents/knowledge-base/ .agents/AGENTS.md

# Commit with a descriptive message referencing the task
git commit -m "knowledge: [short description of what was done]"

# Push to remote
git push
```

**Commit message format:** `knowledge: <one-line summary of the completed task>`  
Examples:
- `knowledge: color scheme updated to black/red`
- `knowledge: new client CRUD API documented`
- `knowledge: dev server launch process captured`

If the push fails (no remote, auth issue, etc.), log a warning but do NOT block — the commit itself is sufficient.

---

## Rules
- **Never skip** — even small tasks need a brief entry.
- **Be specific** — vague entries are useless. Include file paths, function names, and reasoning.
- **Don't duplicate** — check if an entry already covers the topic; if so, append a sub-note.
- **Stay factual** — only document what was actually done, not what was planned.
- **Absolute paths** — always use full absolute paths for file references.

---

## Output
After completing the full workflow (knowledge update + git commit + push), print:
```
✅ Knowledge Curator: Updated [category file] with "[entry title]". Committed & pushed → knowledge: [commit message].
```
