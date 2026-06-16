# 🌳 FamilyTree — Interactive Family Tree Builder

A production-ready SaaS web application for creating, visualizing, and managing family trees.

## Tech Stack

| Layer              | Technology                         |
| ------------------ | ---------------------------------- |
| Framework          | Next.js 15 (App Router)            |
| Language           | TypeScript                         |
| Styling            | Tailwind CSS v4                    |
| Animations         | Motion (Framer Motion)             |
| Tree Visualization | React Flow (@xyflow/react)         |
| ORM                | Prisma                             |
| Database           | PostgreSQL                         |
| Theme              | next-themes (dark/light mode)      |

## Project Structure

```
├── prisma/                    # Database schema & seeds
│   ├── schema.prisma          # Prisma schema (User, Tree, Member, Relationship)
│   └── seed.ts                # Database seed script
├── public/                    # Static assets
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (dashboard)/       # Dashboard route group
│   │   │   ├── admin/         # Admin panel
│   │   │   ├── dashboard/     # Dashboard home
│   │   │   ├── members/       # Members list
│   │   │   └── tree/          # Family tree viewer
│   │   ├── api/               # API routes
│   │   │   ├── health/        # Health check
│   │   │   ├── members/       # Members CRUD
│   │   │   └── trees/         # Trees CRUD
│   │   ├── globals.css        # Tailwind config + design tokens
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Landing page
│   │   ├── loading.tsx        # Loading state
│   │   ├── error.tsx          # Error boundary
│   │   └── not-found.tsx      # 404 page
│   ├── components/
│   │   ├── ui/                # Base UI components (Button, Card, Modal)
│   │   ├── layout/            # Layout components (Navbar, Sidebar)
│   │   └── features/          # Feature components (FamilyTree, MemberCard)
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Core libraries (Prisma client, utils)
│   ├── providers/             # React context providers
│   ├── services/              # API service layer
│   ├── store/                 # Global state management
│   ├── types/                 # TypeScript type definitions
│   ├── utils/                 # Utility functions & constants
│   └── validations/           # Input validation schemas
├── .env.example               # Environment variable template
├── .prettierrc                # Prettier configuration
└── next.config.ts             # Next.js configuration
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL

# 3. Generate Prisma client
npx prisma generate

# 4. Run database migrations
npx prisma migrate dev --name init

# 5. (Optional) Seed the database
npx prisma db seed

# 6. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Scripts

| Command                | Description                  |
| ---------------------- | ---------------------------- |
| `npm run dev`          | Start development server     |
| `npm run build`        | Build for production         |
| `npm run start`        | Start production server      |
| `npm run lint`         | Run ESLint                   |
| `npx prisma studio`   | Open Prisma database GUI     |
| `npx prisma generate`  | Regenerate Prisma client     |
| `npx prisma migrate dev` | Run database migrations   |

## Architecture

- **App Router** — File-based routing with layouts, loading states, and error boundaries
- **Route Groups** — `(dashboard)` group for authenticated pages with shared layout
- **API Routes** — RESTful endpoints under `/api/` for members and trees
- **Service Layer** — Centralized API call functions in `services/`
- **Type Safety** — Shared TypeScript interfaces across frontend and API
- **Validation Layer** — Schema-based input validation (Zod-ready)

## License

MIT
