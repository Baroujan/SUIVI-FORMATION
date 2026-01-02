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
- `/api/admin/metrics` - Admin dashboard metrics (lab counts, alerts, global averages)
- `/api/admin/laboratories/:id` - Detailed lab info with user metrics

## BD Biosciences Instruments
The application includes comprehensive training modules for:
- **BD FACSCanto II** - 3-laser, 8-color flow cytometer
- **BD FACSLyric** - Clinical flow cytometer with integrated reagent management
- **BD FACSCelesta** - Flexible multicolor analyzer (up to 14 colors)
- **BD FACSymphony A5** - High-parameter spectral analyzer (up to 50 parameters)
- **BD FACSAria III** - High-speed 4-way cell sorter
- **BD FACSMelody** - Compact cell sorter for research labs

## Development
- Run: `npm run dev`
- Frontend: Port 5000
- Backend: Express server with Vite middleware

## Production Deployment
- **Platform**: Vercel
- **URL**: https://suivi-formation.vercel.app/
- **Database**: Neon PostgreSQL (serverless)
- **API**: Vercel Serverless Functions (api/index.ts)

## Recent Changes
- 2026-01-02: Made site production-ready with comprehensive BD Biosciences cytometer data
- 2026-01-02: Added admin metrics API and connected dashboard to real data
- 2026-01-02: Connected trainee interface to real API data (validations, comfort ratings)
- 2026-01-02: Created user documentation (DOCUMENTATION.md)
- 2026-01-01: Added modification history tracking with audit logs visible to trainers and trainees
- 2026-01-01: Updated login page with User ID + Lab Code authentication (GDPR compliant)
- 2026-01-01: Migrated from in-memory storage to PostgreSQL database for permanent data persistence
- 2026-01-01: Initial implementation with all three interfaces (trainer, trainee, admin)

## Test Users
- **trainer** - Trainer role (Dr. Sophie Laurent)
- **formateur2** - Trainer role (Marc Dubois)
- **admin** - Administrator role
- **jean.dupont** (LAB001) - Trainee at CHU Lyon
- **marie.martin** (LAB001) - Trainee at CHU Lyon
- **pierre.bernard** (LAB002) - Trainee at Institut Pasteur
- **claire.petit** (LAB002) - Trainee at Institut Pasteur
- **thomas.roux** (LAB003) - Trainee at CNRS Marseille

## Laboratories
- **LAB001** - CHU Lyon - Centre de Cytométrie
- **LAB002** - Institut Pasteur - Plateforme Cytométrie
- **LAB003** - CNRS Marseille - UMR 7280
