# MergeBoost — Copilot Instructions

MergeBoost is a Social Media Content Management Platform (SMCMP) for **Adaptogenic Nootropic Drinks** targeting coders and creatives.

## Framework & Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| ORM | Prisma (PostgreSQL via Supabase) |
| Auth | NextAuth v5 |
| AI | Google Gemini (`@google/genai`) |

### Conventions

- Use the App Router (`app/`) for routes, layouts, and API handlers.
- Shared utilities live in `src/lib/`; shared types in `src/types/`.
- Path alias: `@/*` maps to the project root.
- Prefer Server Components by default; add `"use client"` only when browser APIs, hooks, or event handlers are required.
- Use Prisma via the singleton at `src/lib/prisma.ts` — never instantiate `PrismaClient` elsewhere.
- All database access belongs in Server Components, Server Actions, or Route Handlers — never in client components.
- Use Zod (when added) or Prisma types for runtime validation at API boundaries.
- No half-baked placeholders: every exported function, type, and component must be complete and typed.

## User Roles

| Role | Permissions |
|------|-------------|
| `ADMIN` | Full platform access: user management, campaign oversight, publish/unpublish any post, view all analytics. |
| `CONTENT_CREATOR` | Create and edit own posts, submit for approval, view own post analytics. |
| `CONTENT_APPROVER` | Review pending posts (approve/reject with notes), view campaign posts and analytics. Cannot create posts unless also assigned creator role logic. |

Role is stored on `User.role` (Prisma `Role` enum). Authorization checks must happen server-side before any mutation.

## Post Lifecycle State Machine

```
DRAFT
  │  (creator submits)
  ▼
PENDING_APPROVAL
  ├─► APPROVED  (approver accepts)
  │     │  (admin/creator schedules or publishes)
  │     ▼
  │   PUBLISHED
  └─► REJECTED  (approver rejects with rejectionNote)
        │  (creator revises)
        ▼
      DRAFT
```

### Transition Rules

| From | To | Actor | Condition |
|------|----|-------|-----------|
| `DRAFT` | `PENDING_APPROVAL` | Content Creator | Post has title, content, and at least one platform |
| `PENDING_APPROVAL` | `APPROVED` | Content Approver / Admin | Review complete |
| `PENDING_APPROVAL` | `REJECTED` | Content Approver / Admin | Must set `rejectionNote` |
| `REJECTED` | `DRAFT` | Content Creator | Creator edits and resubmits |
| `APPROVED` | `PUBLISHED` | Admin / Content Creator | `scheduledAt` reached or manual publish |
| `PUBLISHED` | — | — | Terminal state (edits create a new draft revision in future iterations) |

Invalid transitions must be rejected server-side with a clear error — never rely on client-only checks.

## Server / Client Boundary

### Server-only (never import in `"use client"` files)

- `src/lib/prisma.ts` — database client
- NextAuth session/config modules
- Server Actions (`"use server"`)
- Environment secrets (`process.env.DATABASE_URL`, `NEXTAUTH_SECRET`, `GEMINI_API_KEY`)

### Client-safe

- Presentational UI components with no direct DB or secret access
- Types from `src/types/index.ts` (type-only imports)
- Client hooks for UI state (forms, modals, toasts)

### Patterns

```tsx
// ✅ Server Component — fetch data directly
import { prisma } from "@/src/lib/prisma";

export default async function PostsPage() {
  const posts = await prisma.post.findMany();
  return <PostList posts={posts} />;
}
```

```tsx
// ✅ Client Component — receives serializable props only
"use client";

import type { PostSummary } from "@/src/types";

export function PostList({ posts }: { posts: PostSummary[] }) {
  return <ul>{posts.map((p) => <li key={p.id}>{p.title}</li>)}</ul>;
}
```

```tsx
// ❌ Never do this in a client component
"use client";
import { prisma } from "@/src/lib/prisma"; // leaks server code to bundle
```

### Data Serialization

- Pass plain JSON-serializable objects from Server Components to Client Components.
- Convert `Date` fields to ISO strings at the boundary when needed.
- Do not pass Prisma `Decimal` or class instances across the boundary.

## Domain Context

- **Campaigns** group posts around marketing objectives (e.g., product launch, seasonal promo).
- **Posts** target one or more **Platforms** (`X_TWITTER`, `LINKEDIN`, `INSTAGRAM`, `TIKTOK`, `FACEBOOK`, `YOUTUBE`).
- **Analytics** track engagement metrics per published post.
- Users must set `consentGiven: true` before creating content (GDPR/consent flow).
