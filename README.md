# Vertex — Professional Web Application Platform

A complete, production-grade, modular web application foundation engineered for the **Vertex** competition project.

This codebase provides an enterprise-ready foundation with authentication, user profile management, an extensible member dashboard, a comprehensive administrative management console, security auditing, and notification broadcasting. It is structured to accept project-specific modules seamlessly without refactoring core systems.

---

## 🎨 Design Philosophy & Visual Identity

Engineered strictly according to human-centric modern SaaS product design principles (inspired by Linear, Vercel, Raycast, and Notion):

* **Color Palette**: Sophisticated white and soft neutral surfaces (`#FAFAFA`, `#F4F4F5`) with charcoal / deep graphite typography (`#18181B`).
* **Accent Color**: Deep, restrained Sage Green (`#2D6A4F` / `#D8F3DC`).
* **Refined Detailing**: Subtle 1px borders (`#E4E4E7`), soft realistic shadows (`0 1px 3px rgba(0,0,0,0.06)`), and understated micro-interactions.
* **Strict Anti-Patterns**: No neon colors, no cyberpunk glow, no generic gradient washes, and no template artifacts.

---

## ⚡ Key Modules & Features

### 1. Authentication & Security
* **NextAuth v5 (Auth.js)** with Credentials provider and OAuth hooks (Google, GitHub, LinkedIn).
* **Bcrypt Password Hashing** (12 salt rounds) with live strength meter checking length, cases, and digits.
* **Token-based Password Reset** and **Email Verification** flows.
* **Next.js 16 Request Proxy** (`src/proxy.ts`) enforcing role-based route access before rendering.
* **Client & Server Input Validation** via Zod schemas and React Hook Form.

### 2. User Dashboard
* **Overview**: Welcome banner, 4 KPI stat cards, announcement banner, and recent login history.
* **Profile Management**: Editable personal details, bio, phone, location, website, and social links (GitHub, LinkedIn, Twitter/X, Instagram).
* **Security Tab**: Password update modal with verification of existing password.
* **Avatar Upload**: Interactive avatar preview and image management.
* **Notification Center**: Real-time notifications categorized by System, Security, Account, and Announcements with "Mark all as read".
* **Competition Workspace Placeholder (`/workspace`)**: Modular container with integration guidelines for plug-and-play addition of competition-specific features.

### 3. Admin Management Console (`/admin`)
* **Admin Dashboard**: Real-time KPI summaries, user registration velocity chart, role distribution pie chart, and live audit feed.
* **User Management (`/admin/users`)**: Searchable, filterable, sortable user directory with pagination, bulk status changes (activate, suspend, delete), and per-user edit drawer.
* **Roles & Permissions (`/admin/roles`)**: Visual capability matrix outlining granular privileges for Super Admin, Admin, and User roles.
* **Security & Audit Logs (`/admin/audit-logs`)**: Complete historical log of administrative operations, logins, password changes, and permission updates.
* **Notification Broadcaster (`/admin/notifications`)**: Broadcast announcements to all users or specific roles with optional call-to-action links.
* **Login Activity Monitor (`/admin/activity`)**: Device signatures, IP addresses, authentication providers, and timestamp records.
* **Analytics Engine (`/admin/analytics`)**: Engagement metrics, growth rate, and verification ratios.
* **Reports & Data Export (`/admin/reports`)**: One-click JSON data exports for user directories and security audit logs.
* **System Settings (`/admin/settings`)**: Super-admin controlled platform settings (registration toggle, maintenance mode, site name, support email).

---

## 🏗 Tech Stack

| Layer | Technology |
|---|---|
| Framework | **Next.js 16 (App Router + Turbopack)** |
| Language | **TypeScript 5** |
| Database ORM | **Prisma ORM 6** |
| Database Engine | **SQLite** (`prisma/dev.db` zero-setup local) / **PostgreSQL** (production) |
| Authentication | **NextAuth.js v5 (Auth.js)** |
| Styling | **Tailwind CSS v4 + Vanilla CSS Design Tokens** |
| Animations | **Framer Motion** |
| Icons | **Lucide React + Custom Brand SVGs** |
| Charts | **Recharts** |
| Forms & Validation | **React Hook Form + Zod** |
| Notifications | **Sonner Toast System** |

---

## 🚀 Quick Start & Local Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and configure your database string:
```bash
cp .env.example .env.local
```

### 3. Initialize Database & Seed
If your PostgreSQL instance is running:
```bash
npx prisma db push
npx prisma db seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Default Seed Credentials

After running `npx prisma db seed`, you can sign in with:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Super Admin** | `superadmin@vertex.app` | `Password123!` | Full system control, settings, user deletion |
| **Admin** | `admin@vertex.app` | `Password123!` | User management, audit logs, broadcasting |
| **Standard User** | `sarah.chen@example.com` | `Password123!` | Dashboard, workspace, profile management |

---

## 🔌 How to Integrate Your Vertex Competition Module

The platform was intentionally engineered with modular extension points:

1. **Add Database Models**: Define your project entities in `prisma/schema.prisma` with relation to `User`.
2. **Implement Feature Routes**: Create subfolders inside `src/app/(dashboard)/` (e.g. `src/app/(dashboard)/projects/` or `src/app/(dashboard)/inventory/`).
3. **Register Navigation Items**: Add the new link to `src/components/navigation/UserSidebar.tsx`.
4. **Enforce Role Permissions**: Use `auth()` inside server components or `src/proxy.ts` to control access.
