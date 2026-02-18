# School Management System - Frontend

## Project Setup

- **Frontend Path**: (this project)
- **Backend Path**: D:\me\school-management-system

## Three-Agent Workflow

| Command          | Role            | Responsibility                                           |
| ---------------- | --------------- | -------------------------------------------------------- |
| `/scan-backend`  | Backend Expert  | Scans backend project, generates API reference           |
| `/scan-frontend` | Frontend Expert | Scans frontend project, generates architecture reference |
| `/tech-lead`     | Tech Lead + PM  | Orchestrates both, reviews, knows business domain        |
| `/build-feature` | Orchestrator    | End-to-end feature build using all 3 agents              |
| `/ask-backend`   | Backend Expert  | Quick questions about API contracts                      |

## How to Start

1. Run `/scan-backend` to generate `docs/backend-reference.md`
2. Run `/scan-frontend` to generate `docs/frontend-reference.md`
3. Use `/build-feature <feature-name>` to build any module
4. Use `/tech-lead <question>` anytime for guidance

## CRITICAL: Reference-Driven Development

**Do NOT assume any tech stack, patterns, or conventions.**

All coding decisions must follow what is documented in:

- `docs/frontend-reference.md` for Angular version, styling approach, component patterns, state management, folder structure, and every other frontend convention
- `docs/backend-reference.md` for API contracts, DTOs, auth flow, and business rules
- `docs/business-rules.md` for accumulated domain decisions

If these files do not exist yet, run the scan commands first before writing any code.

**When writing new code:**

1. Read `docs/frontend-reference.md` to understand the existing patterns
2. Follow the same patterns, naming, folder structure, and style already in use
3. Match the existing tech stack exactly (do not introduce new libraries or patterns)
4. If a new pattern is needed, consult `/tech-lead` first

## Reference Docs

- `docs/backend-reference.md` - Auto-generated backend API reference
- `docs/frontend-reference.md` - Auto-generated frontend architecture reference (SOURCE OF TRUTH)
- `docs/business-rules.md` - Business domain knowledge (maintained by tech lead)
