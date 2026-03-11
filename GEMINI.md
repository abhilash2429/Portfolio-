# Gemini Project Context: ayush.top

## Project Overview

This is a personal portfolio and blog application built with **Next.js 16**. It features a modern, type-safe architecture using **Velite** for content management (MDX) and **Shadcn UI** for the design system. The project is managed with **npm**.

## Technology Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Runtime & Package Manager:** npm
- **Styling:** Tailwind CSS, Shadcn UI (Radix Primitives), `clsx`, `tailwind-merge`
- **Content Management:** Velite (MDX processing with Rehype plugins)
- **State/Data:** TanStack Query, Zod
- **Animations:** Framer Motion
- **Icons:** Lucide React, React Icons

## Key Directories & Files

- **`src/app/`**: Next.js App Router pages and layouts.
- **`src/content/`**: MDX content files (blog posts).
- **`src/components/`**: React components, organized by domain (e.g., `ui`, `mdx`, `layout`).
- **`src/config.ts`**: Global site configuration (social links, metadata).
- **`velite.config.ts`**: Content schema definition for Velite.
- **`styles/`**: Global styles (`globals.css`, `mdx.css`).

## Development Workflow

### Scripts

All commands should be run with npm scripts.

- **Development:**

  ```bash
  npm run dev
  ```

  _Runs `next dev` and `velite --watch` in parallel._

- **Build:**

  ```bash
  npm run build
  ```

  _Runs `velite --clean` followed by `next build`._

- **Lint:**

  ```bash
  npm run lint
  ```

- **Format:**
  ```bash
  npm run format
  ```
  _Uses `oxfmt`._

### Content Management

Content is stored in `src/content/` as MDX files. The schema is defined in `velite.config.ts`.

- **Collection:** `posts`
- **Required Fields:** `title`, `slug`, `description`, `cover`, `date`, `published` (default: true).

### Conventions

- **Imports:** Use the `~` alias for absolute imports (e.g., `~/components/ui/button`).
- **Styling:** Use Tailwind utility classes. For conditional classes, use the `cn()` utility (clsx + tailwind-merge).
- **Package Manager:** Use `npm` for installs and scripts.
- **Components:** Place shared UI components in `src/components/ui`. Place feature-specific components in their respective subdirectories within `src/components`.

