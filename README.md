# 🌳 Family Legacy — Interactive Family Tree Builder

> "Preserve generations beautifully."

A production-ready SaaS web application for creating, visualizing, and managing family trees. With a focus on emotional user experience, it features an interactive UI, rich member profiles, a memories timeline, multi-format exports (PDF/PNG/JSON), and PWA offline support.

## Key Features

- **Interactive Trees**: Drag, drop, pan, and zoom through generations seamlessly.
- **Rich Profiles**: Store bios, photos, and life events for every member.
- **Memories Timeline**: Chronological view of family milestones.
- **Export & Backup**: Save your tree visually as PDF/PNG, or export raw data as JSON.
- **PWA Ready**: Installable on mobile with offline shell caching.
- **Private & Secure**: Your family data is encrypted and completely under your control.

## Tech Stack

| Layer              | Technology                         |
| ------------------ | ---------------------------------- |
| Framework          | Next.js 15 (App Router)            |
| Language           | TypeScript                         |
| Styling            | Tailwind CSS v4                    |
| Animations         | Framer Motion                      |
| Tree Visualization | React Flow (@xyflow/react)         |
| Authentication     | Auth.js (NextAuth)                 |
| Media Storage      | Cloudinary                         |
| ORM                | Prisma                             |
| Database           | PostgreSQL                         |
| Theme              | next-themes (dark/light mode)      |
| PWA                | next-pwa                           |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Cloudinary Account
- npm

### Setup & Installation

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
```

### Environment Variables

Update `.env.local` with your configuration:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/familytree"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="your-preset"
```

### Database Initialization

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Seed the database
npx prisma db seed
```

### Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Deployment (Vercel)

This project is optimized for deployment on Vercel.

1. Push your code to a GitHub repository.
2. Import the project in Vercel.
3. Add the required Environment Variables in the Vercel dashboard.
4. Deploy. Vercel will automatically detect Next.js and apply the `vercel.json` optimizations.

## Architecture

- **App Router** — File-based routing with layouts, loading states, and error boundaries
- **Route Groups** — `(dashboard)` group for authenticated pages with shared layout
- **API Routes** — RESTful endpoints under `/api/`
- **Service Layer** — Centralized API call functions in `services/`
- **Type Safety** — Shared TypeScript interfaces across frontend and API
- **Responsive Design** — Glassmorphism, smooth animations, and mobile safe areas.

## License

MIT
