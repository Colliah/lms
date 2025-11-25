# LMS Documentation

Comprehensive documentation for the English Learning Management System.

## Quick Links

- [Database Schema](./database-schema.mdx) - Complete Prisma schema reference with 35+ models
- [Service Layer](./service-layer.mdx) - Business logic and SM-2 spaced repetition algorithm
- [Server Actions](./server-actions.mdx) - API endpoints and authentication patterns
- [UI Components](./ui-components.mdx) - Frontend components and styling guide
- [Setup Guide](./setup-guide.mdx) - Installation, deployment, and configuration

## Architecture Overview

The LMS follows a clean layered architecture:

```
┌─────────────────────────────────┐
│     UI Layer (React/Next.js)    │
│  • Server Components            │
│  • Client Components            │
│  • Shadcn UI + Tailwind         │
└────────────┬────────────────────┘
             │
┌────────────▼────────────────────┐
│    API Layer (Server Actions)   │
│  • Authentication               │
│  • Input Validation             │
│  • Error Transformation         │
└────────────┬────────────────────┘
             │
┌────────────▼────────────────────┐
│  Service Layer (Business Logic) │
│  • SM-2 Algorithm               │
│  • Complex Calculations         │
│  • Database Operations          │
└────────────┬────────────────────┘
             │
┌────────────▼────────────────────┐
│  Data Layer (Prisma ORM)        │
│  • PostgreSQL Database          │
│  • Models & Relations           │
│  • Migrations                   │
└─────────────────────────────────┘
```

## Features

### Learning Modules

1. **Vocabulary** - SM-2 spaced repetition flashcards
2. **Grammar** - Interactive exercises with instant feedback
3. **Reading** - Comprehension passages with WPM tracking
4. **Writing** - Text editor with AI feedback (placeholder)
5. **Speaking** - Pronunciation practice (simulated recording)

### Progress Tracking

- Daily study streaks with freeze feature
- Vocabulary mastery tracking
- Weekly activity charts
- Achievement system
- Analytics snapshots

### Gamification

- Streak counter
- Achievement badges
- Progress visualization
- Daily goals

## Technology Stack

- **Frontend**: React 19, Next.js 16, Tailwind CSS
- **UI Components**: Shadcn UI, Radix UI
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: Better Auth
- **Charts**: Recharts
- **Runtime**: Bun
- **Deployment**: Vercel (recommended)

## Getting Started

1. Install dependencies: `bun install`
2. Setup database: `bun run db:push`
3. Seed data: `bun seed`
4. Start dev server: `bun dev`

See [Setup Guide](./setup-guide.mdx) for detailed instructions.

## Development Workflow

### Making Changes

1. Edit Prisma schema → `bun run db:generate` → `bun run db:push`
2. Update service layer → Add/modify functions in `services/`
3. Create server actions → Add to `app/actions/`
4. Build UI components → Add to `components/`

### Code Quality

- Lint: `bun lint`
- Format: `bun run format`
- Type check: `bunx tsc --noEmit`

## API Reference

All server actions return:

```typescript
type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

See [Server Actions](./server-actions.mdx) for full API reference.

## Database Models

Key models:

- **User**: Authentication and profile
- **Word**: Vocabulary with translations
- **UserWordProgress**: SM-2 tracking per user/word
- **GrammarExercise**: Grammar questions
- **ReadingPassage**: Comprehension passages
- **WritingPrompt**: Writing practice prompts
- **DailyActivity**: Progress tracking
- **UserStreak**: Streak management

See [Database Schema](./database-schema.mdx) for complete reference.

## Contributing

1. Fork repository
2. Create feature branch
3. Make changes
4. Run tests and linting
5. Submit pull request

## License

[Add your license here]

## Support

For questions or issues:
- Documentation: `/docs`
- GitHub Issues: [repository-url]
- Email: [support-email]
