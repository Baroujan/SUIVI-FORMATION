# Design Guidelines: Training Tracking Platform

## Design Approach
**System Selected:** Material Design 3 (enterprise productivity variant)
**Rationale:** Information-dense application requiring clear data hierarchy, familiar patterns for form inputs, tabular data, and multi-role interfaces (trainer, trainee, admin).

## Core Design Elements

### Typography
- **Primary Font:** Inter (Google Fonts)
- **Headers:** 600 weight, sizes: H1(32px), H2(24px), H3(20px), H4(16px)
- **Body:** 400 weight, 14px for data tables, 16px for forms and content
- **Data/Metrics:** 500 weight for emphasis on scores and statistics

### Layout System
**Spacing:** Tailwind units of 2, 4, 6, and 8 (p-2, m-4, gap-6, py-8)
- Form fields: gap-4 between inputs
- Card padding: p-6
- Section spacing: py-8 on containers
- Dense data views: gap-2 for compact lists

### Component Library

**Navigation:**
- Top app bar with role indicator (Trainer/Trainee/Admin)
- Language switcher in header (dropdown with flags)
- Tab navigation for instruments (Material tabs with underline indicator)

**Data Display:**
- **Chapter/Sub-chapter Lists:** Expandable accordion pattern with checkmarks for validated items
- **Progress Indicators:** Linear progress bars showing completion percentages
- **Score Display:** Large metric cards (grid-cols-1 md:grid-cols-3) showing: average comfort level, validation rate, training frequency
- **Tables:** Striped rows for trainee lists, sortable columns, compact spacing

**Forms:**
- **Comfort Level Rating:** Star rating or segmented button group (1-5 scale), displays current date on interaction
- **Trainee Selection:** Multi-select dropdown with search, QR scanner button alongside
- **Validation Checkboxes:** Clear checkmarks with auto-timestamp display
- **Session Management:** Save/Load buttons with session name input field

**Cards:**
- Instrument cards with icon, name, and validation count badge
- Training element cards showing: title, validation status, comfort rating, associated links

**Modals/Overlays:**
- QR code scanner modal (full-screen camera view)
- Confirmation dialogs for critical actions
- Alert notifications when trainee scores drop below threshold

**Interactive Elements:**
- Floating Action Button (FAB) for quick "Add New Element" on admin view
- Chip filters for instrument categories
- Link buttons to FACSUniversity resources (external link icon)

### Dashboard Layouts

**Trainer Interface:**
- Top: Trainee selection bar (saved sessions accessible)
- Instrument tabs below header
- Main area: Two-column layout (md:grid-cols-2) - left side shows chapter tree, right side shows validation form
- Bottom: Session controls (Save, Load, Export)

**Trainee Interface:**
- Hero section: Personal progress overview (comfort score, validated items count)
- Three-column grid (lg:grid-cols-3) of instrument cards
- Expanded view: Chapter tree with comfort level sliders for each validated element
- Quick access sidebar: Recent updates, links to resources

**Admin Interface:**
- Dashboard grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-4): Global metrics cards
- Laboratory search/filter bar
- Data table: Lab scores, alert status, report generation actions
- Report builder: Form with date range, user/lab selection, export format

### Accessibility
- ARIA labels on all interactive elements
- Keyboard navigation for all forms and tables
- High contrast ratios for text and data
- Clear focus indicators on form inputs and buttons

### Animations
Minimal - use only for:
- Tab transitions (fade)
- Accordion expand/collapse
- Loading states (subtle spinners)

**No Images Required** - This is a data-focused application where clarity and functionality take precedence over visual imagery.