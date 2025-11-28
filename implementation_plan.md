# DocMate MVP Implementation Plan

## Phase 1: Core Foundation (Months 1-2)

### Goal
Build the essential infrastructure, user authentication (Firebase), and the initial versions of the Symptom Checker and Chatbot.

### Architecture
- **Frontend**: React (Vite) + TypeScript + TailwindCSS v4
- **Backend/Auth**: Firebase (Auth, Firestore)
- **API Layer**: Node.js + Express (for complex logic/integrations)
- **AI Integration**: OpenAI API (Mock/Placeholder for initial dev)

### Tasks

#### 1. Project Initialization & Infrastructure
- [x] Create Monorepo structure
- [x] Setup Client (React + Vite + TS)
- [x] Setup Server (Express + TS)
- [x] Configure TailwindCSS v4 with Premium Theme

#### 2. Frontend Foundation (Rich Aesthetics)
- [x] Create core UI components (Glassmorphism)
- [x] Implement Responsive Layout
- [ ] Setup Routing (React Router) - *In Progress*

#### 3. Authentication Module (Firebase)
- [ ] Setup Firebase Project & Config
- [ ] Login/Register Pages (Premium UI)
- [ ] Protected Routes
- [ ] User Profile (Firestore)

#### 4. Core Features (MVP)
- **Landing Page**:
    - [ ] Hero Section
    - [ ] Features Grid
    - [ ] Call to Action
- **Dashboard (Health Graph)**:
    - [x] Health Graph UI (Recharts + Framer Motion)
    - [ ] Connect to Real Data (Firestore)
- **Symptom Checker**:
    - [ ] Chat Interface
    - [ ] Triage Logic

### Technical Specifications

#### Color Palette
- Primary: `#0EA5E9` (Sky Blue) -> Updated to `#84cc16` (Lime) & `#14b8a6` (Teal)
- Background: `#050a0a` (Deep Teal/Black)

#### Tech Stack Details
- **Client**: `react`, `react-router-dom`, `framer-motion`, `lucide-react`, `recharts`, `firebase`.
- **Server**: `express`, `cors`, `dotenv`, `jsonwebtoken`, `zod`, `pg` (Legacy/Optional).

---
*Created by Antigravity*
