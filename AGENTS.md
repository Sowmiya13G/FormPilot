<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Registration Management Platform — Agent Guidelines
- **Architecture & Stack**: Next.js App Router (Next 16+), React 19, TypeScript, Tailwind CSS v4, MongoDB + Mongoose (strictly NO Postgres / Prisma).
- **Rules**: Refer to `.agent/rules/` for mandatory architecture rules, coding standards, and Wonderla domain workflows.
- **Skills**: Refer to `.agent/skills/` for standalone HTML generator, Google Workspace integrations, and form engine skills.
- **Implementation Tasks**: Sequenced phase-by-phase in `.task/`. Always refer to `.task/00-MASTER-ROADMAP.md` for phase status and progression.
