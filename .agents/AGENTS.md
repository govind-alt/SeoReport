<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# 🤖 MANDATORY GLOBAL AGENT RULES

All AI Agents working on this repository MUST strictly follow these two mandatory workflow execution rules:

---

## 🔍 RULE 1: MANDATORY PRE-TASK KNOWLEDGE & INSTRUCTIONS REVIEW
**BEFORE starting ANY task, research, analysis, or code modification:**

1. **Review Master Knowledge Base**: Inspect [`docs/KNOWLEDGE_BASE.md`](file:///c:/Users/somna/OneDrive/Desktop/SEO%20TASK/SeoReport/docs/KNOWLEDGE_BASE.md) to understand current system architecture, design tokens (`#0D0D0D`, `#16161A`, `#FF1E42`, `#F4F4F6`), Prisma schema models, and REST endpoints.
2. **Review Onboarding & Build Context**: Read [`docs/AI_PROJECT_CONTEXT.md`](file:///c:/Users/somna/OneDrive/Desktop/SEO%20TASK/SeoReport/docs/AI_PROJECT_CONTEXT.md) and [`docs/BUILD_LOG.md`](file:///c:/Users/somna/OneDrive/Desktop/SEO%20TASK/SeoReport/docs/BUILD_LOG.md) for date-wise chronological project context.
3. **Review Global Agent Rules**: Read this file ([`.agents/AGENTS.md`](file:///c:/Users/somna/OneDrive/Desktop/SEO%20TASK/SeoReport/.agents/AGENTS.md)) to align with repository constraints, multi-tenancy rules, and coding standards.
4. **No Assumption Policy**: Do NOT guess variable names, routes, or schema fields — verify against existing knowledge base documents first.

---

## 🧠 RULE 2: AUTOMATIC KNOWLEDGE CURATOR & MANDATORY GIT PUSH
**ON COMPLETION of ANY task, code modification, bug fix, or feature implementation:**

1. **Trigger Knowledge Curator SubAgent**: Execute the Knowledge Curator workflow defined in [SKILL.md](file:///c:/Users/somna/OneDrive/Desktop/SEO%20TASK/SeoReport/.agents/skills/knowledge-curator/SKILL.md).
2. **Gather Technical Insights**: Inspect modified files, trace implementation logic, extract code rationale, and document database or route changes.
3. **Update Knowledge Base Documents**:
   - Update date-wise timeline in [`docs/KNOWLEDGE_BASE.md`](file:///c:/Users/somna/OneDrive/Desktop/SEO%20TASK/SeoReport/docs/KNOWLEDGE_BASE.md).
   - Append date-wise execution log to [`docs/BUILD_LOG.md`](file:///c:/Users/somna/OneDrive/Desktop/SEO%20TASK/SeoReport/docs/BUILD_LOG.md).
   - Refresh token-optimized context in [`docs/AI_PROJECT_CONTEXT.md`](file:///c:/Users/somna/OneDrive/Desktop/SEO%20TASK/SeoReport/docs/AI_PROJECT_CONTEXT.md).
4. **MANDATORY AUTOMATIC GIT COMMIT & PUSH**: Immediately after running the Knowledge Curator workflow, ALWAYS execute:
   ```bash
   git add .
   git commit -m "docs & curation: [Summarize deliverables and knowledge base updates]"
   git push origin main
   ```
5. **Ensure Inter-Agent Portability**: Guarantee that all newly acquired project knowledge, architectural decisions, and setup instructions are committed and pushed to GitHub so remote repositories remain 100% synchronized.
