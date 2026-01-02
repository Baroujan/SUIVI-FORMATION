# Design Guidelines: BD Biosciences Training Tracker

## Design Approach
**System Selected:** BD FACSDuet / FACS Workflow Manager Clinical Style
**Rationale:** Professional clinical laboratory software aesthetic matching BD Biosciences product line. Clean, data-focused interface with deep blues and teal accents.

## Core Design Elements

### Color Palette (BD Biosciences Clinical)
- **Primary Blue:** HSL(210, 75%, 35%) - Deep professional blue
- **Accent Teal:** HSL(195, 85%, 45%) - BD signature teal for highlights
- **Sidebar:** HSL(210, 35%, 18%) - Dark navy sidebar (BD style)
- **Background:** HSL(210, 20%, 98%) - Subtle blue-tinted white
- **Cards:** Pure white for maximum contrast and clarity

### Typography
- **Primary Font:** Inter (Google Fonts)
- **Headers:** 600 weight, sizes: H1(28px), H2(22px), H3(18px), H4(15px)
- **Body:** 400 weight, 14px for data tables, 15px for forms
- **Data/Metrics:** 600 weight for emphasis on scores and statistics
- **Clinical emphasis:** Clear, readable text with good spacing

### Layout System
**Spacing:** Tailwind units of 3, 4, 6, and 8
- Form fields: gap-4 between inputs
- Card padding: p-5 or p-6
- Section spacing: py-6 on containers
- Dense data views: gap-2 for compact lists

### Component Library

**Navigation (BD Style):**
- Dark navy sidebar with teal accent highlights
- Role indicator badge in sidebar header
- Language switcher in main header
- Instrument tabs with clean underline indicator

**Data Display:**
- **Training Elements:** Card-based with clear validation status
- **Progress Indicators:** Segmented progress bars with percentage
- **Metrics Cards:** Large numbers with labels, grid layout
- **Tables:** Clean borders, alternating subtle backgrounds

**Forms:**
- **Comfort Level Rating:** 5-star rating with teal color
- **Trainee Selection:** Multi-select with search and QR scanner
- **Validation Checkboxes:** Large touch-friendly checkboxes
- **Session Management:** Prominent save/load buttons

**Cards:**
- White background on blue-tinted background for contrast
- Subtle shadows on hover
- Clear section headers

**Interactive Elements:**
- Primary buttons: Deep blue with white text
- Secondary buttons: Light gray with dark text
- Accent buttons: Teal for key actions
- Ghost buttons for less prominent actions

### Dashboard Layouts

**Trainer Interface:**
- Header: Session name, location selector, save/load controls
- Left panel: Trainee and instrument selection (configuration)
- Main area: Training elements with validation controls
- Clear visual feedback on validated items

**Trainee Interface:**
- Progress overview at top (metrics cards)
- Instrument cards with progress indicators
- Expandable chapters with comfort rating controls

**Admin Interface:**
- Dashboard metrics grid at top
- Laboratory list with search/filter
- Alert indicators for low comfort scores
- Report generation controls

### Accessibility
- ARIA labels on all interactive elements
- Keyboard navigation for forms and tables
- High contrast ratios (WCAG AA compliant)
- Clear focus indicators

### Animations
Minimal and professional:
- Tab transitions (150ms fade)
- Accordion expand/collapse (200ms)
- Loading spinners (subtle, teal colored)
- Button press feedback (subtle scale)

### BD Biosciences Brand Notes
- Clean, clinical aesthetic
- Professional appearance suitable for laboratory environments
- Data-focused with clear hierarchy
- Teal accent color for key interactive elements
- Dark sidebar navigation (signature BD style)
