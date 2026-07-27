<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# 🤖 GLOBAL RULE: Automatic Knowledge Curator Execution

**Mandatory Rule for All AI Agents:**
On completion of **ANY** task, code modification, bug fix, or feature implementation:

1. **Trigger Knowledge Curator SubAgent**: Execute the Knowledge Curator workflow defined in [SKILL.md](file:///c:/Users/somna/OneDrive/Desktop/SEO%20TASK/SeoReport/.agents/skills/knowledge-curator/SKILL.md).
2. **Gather Technical Insights**: Inspect modified files, trace implementation logic, extract code rationale, and document database or route changes.
3. **Update Knowledge Base**:
   - Update date-wise timeline in [`docs/KNOWLEDGE_BASE.md`](file:///c:/Users/somna/OneDrive/Desktop/SEO%20TASK/SeoReport/docs/KNOWLEDGE_BASE.md).
   - Append execution logs to [`docs/BUILD_LOG.md`](file:///c:/Users/somna/OneDrive/Desktop/SEO%20TASK/SeoReport/docs/BUILD_LOG.md).
   - Refresh token-optimized context in [`docs/AI_PROJECT_CONTEXT.md`](file:///c:/Users/somna/OneDrive/Desktop/SEO%20TASK/SeoReport/docs/AI_PROJECT_CONTEXT.md).
4. **Ensure Inter-Agent Portability**: Guarantee that all newly acquired project knowledge, architectural decisions, and setup instructions are immediately accessible to any AI agent pair programming on this repository.

