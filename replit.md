# Training Tracker - BDB France Scientific

## Overview
An online training tracking tool for flow cytometry training sessions. The platform allows trainers to validate training elements during sessions, and trainees to assess their comfort level on each validated element. It includes full traceability of modifications and supports French/English languages.

## Tech Stack
- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: TanStack Query
- **Routing**: Wouter
- **Database**: PostgreSQL with Drizzle ORM

## Project Structure
```
client/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── AppSidebar.tsx # Navigation sidebar
│   │   ├── ChapterAccordion.tsx
│   │   ├── ComfortRating.tsx
│   │   ├── InstrumentSelector.tsx
│   │   ├── InstrumentTabs.tsx
│   │   ├── LanguageSelector.tsx
│   │   ├── MetricCard.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── TraineeSelector.tsx
│   │   └── TrainingElementCard.tsx
│   ├── contexts/
│   │   └── AppContext.tsx  # Theme, language, user context
│   ├── lib/
│   │   ├── i18n.ts        # Translations (FR/EN)
│   │   ├── queryClient.ts
│   │   └── utils.ts
│   ├── pages/
│   │   ├── trainer/       # Trainer interface pages
│   │   ├── trainee/       # Trainee interface pages
│   │   ├── admin/         # Admin interface pages
│   │   ├── Login.tsx      # Role selection
│   │   └── not-found.tsx
│   ├── App.tsx
│   └── index.css
server/
├── routes.ts              # API endpoints
├── storage.ts             # PostgreSQL database storage
├── db.ts                  # Database connection
└── index.ts
shared/
└── schema.ts              # Data models and types
```

## User Roles
1. **Trainer (Formateur)**: Manage training sessions, select trainees, validate elements
2. **Trainee (Stagiaire)**: View validated elements, rate comfort level (1-5)
3. **Admin (Administrateur)**: Manage users, laboratories, generate reports, configure alerts

## Key Features
- Role-based navigation with sidebar
- Dark/Light theme toggle
- French/English language switcher
- Training session management (save/load)
- Element validation with trainer info and date
- Comfort level rating (1-5 stars)
- FACSUniversity resource links
- Laboratory score tracking
- Alert system for low comfort scores
- Report generation (individual and lab)
- Full modification traceability with audit logs
- Simple login (User ID + Lab Code, GDPR compliant)
- Modifiable training elements with complete change tracking

## API Endpoints
- `/api/users` - User management
- `/api/instruments` - Instrument CRUD
- `/api/chapters` - Chapter management
- `/api/sub-chapters` - Sub-chapter management
- `/api/training-elements` - Training element CRUD (with modification history)
- `/api/validations` - Validation records (with modification history)
- `/api/comfort-ratings` - Trainee self-assessments (with modification history)
- `/api/training-sessions` - Session save/load
- `/api/laboratories` - Laboratory management
- `/api/trainee/:id/progress` - Trainee progress data
- `/api/auth/login` - Authentication with User ID + Lab Code
- `/api/modification-history` - Audit trail for entity changes
- `/api/modification-history/all` - All modification history

## Development
- Run: `npm run dev`
- Frontend: Port 5000
- Backend: Express server with Vite middleware

## Recent Changes
- 2026-01-01: Added modification history tracking with audit logs visible to trainers and trainees
- 2026-01-01: Updated login page with User ID + Lab Code authentication (GDPR compliant)
- 2026-01-01: Migrated from in-memory storage to PostgreSQL database for permanent data persistence
- 2026-01-01: Initial implementation with all three interfaces (trainer, trainee, admin)
- Complete data models with Drizzle ORM and seed data
- All API endpoints implemented with full traceability
- Internationalization (FR/EN) support

## Test Users
- **trainer** - Trainer role (Dr. Sophie Laurent)
- **admin** - Administrator role
- **jean.dupont** (LAB001) - Trainee at CHU Lyon
- **marie.martin** (LAB001) - Trainee at CHU Lyon
- **pierre.bernard** (LAB002) - Trainee at Institut Pasteur
