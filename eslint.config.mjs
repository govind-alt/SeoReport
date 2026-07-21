import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * ESLint configuration for RankFlow.
 *
 * Extends the Next.js recommended rule-sets and applies project-level overrides
 * to keep the build clean while retaining actionable warnings for developers.
 *
 * Rule override rationale:
 *  - @typescript-eslint/no-explicit-any: Downgraded to "warn" because many
 *    Prisma query return types are structurally complex and `any` is currently
 *    used as a pragmatic escape-hatch in UI components. This should be
 *    tightened to "error" once proper domain types are extracted to
 *    `types/` files.
 *  - react-hooks/exhaustive-deps: "warn" — missing deps are intentional in
 *    several places (e.g., data-loading effects that should only run once).
 *  - @typescript-eslint/no-unused-vars: "warn" — dead code is informational
 *    during active development but should not block the build.
 *  - react/no-unescaped-entities: "error" — unescaped quotes in JSX are a
 *    real correctness issue and must always be fixed.
 *  - @next/next/no-html-link-for-pages: "error" — using <a> for internal
 *    Next.js pages bypasses the router and disables prefetching.
 *  - react-hooks/purity: "error" — calling impure functions (Date.now,
 *    Math.random) inside a component's render path violates React's rules.
 *  - prefer-const: "warn" — helpful guidance but not a blocker.
 */
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // ── Project-level rule overrides ──────────────────────────────────────────
    rules: {
      // Downgraded: Prisma + dynamic data makes strict typing complex across
      // all UI components. Target "error" once domain types are extracted.
      "@typescript-eslint/no-explicit-any": "warn",

      // Downgraded: Some intentional single-run effects missing deps.
      "react-hooks/exhaustive-deps": "warn",

      // Downgraded: Dead code is tracked as a warning, not a build blocker.
      "@typescript-eslint/no-unused-vars": "warn",

      // Downgraded: prefer-const is a style guide rule.
      "prefer-const": "warn",

      // Downgraded: setState in effects is sometimes intentional in guards.
      "react-hooks/set-state-in-effect": "warn",

      // Kept at "warn": <img> without Next.js Image is a performance concern.
      "@next/next/no-img-element": "warn",
    },
  },
]);

export default eslintConfig;
