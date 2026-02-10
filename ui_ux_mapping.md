# Selsipad UI/UX Repository Mapping 🎨

This document provides a comprehensive mapping of the current project structure, design system, and user flows to serve as a reference for Figma UI/UX design.

## 1. Design System Foundation

### 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Font**: Inter (Google Fonts)
- **Icons**: Lucide React

### 🎨 Color Palette (from `globals.css`)

Derived from CSS variables, supporting Dark/Light modes.

| Variable        | Usage         | Description                         |
| --------------- | ------------- | ----------------------------------- |
| `--background`  | Main BG       | Page background color               |
| `--foreground`  | Main Text     | Primary text color                  |
| `--primary`     | Branding      | Core brand color (Buttons, accents) |
| `--secondary`   | Accents       | Secondary actions / backgrounds     |
| `--card`        | Surface       | Background for cards/containers     |
| `--muted`       | De-emphasized | Subtitles, disabled states          |
| `--destructive` | Error/Danger  | Error messages, delete actions      |
| `--border`      | Dividers      | Borders and separators              |

### 🧩 UI Component Library (`src/components/ui`)

Reusable base components found in the project:

- **Buttons**: `Button.tsx` (Variants: default, destructive, outline, secondary, ghost, link)
- **Inputs**: `Input.tsx` (Standard text/number inputs)
- **Cards**: `Card.tsx` (Container with standard padding/rounded corners)
- **Modals**: `Modal.tsx`, `dialog.tsx` (Overlays)
- **Navigation**: `GlobalBackButton.tsx`, `Tabs.tsx`
- **Feedback**: `Toast.tsx` (Notifications), `alert.tsx`, `Skeleton.tsx` (Loading states), `ProgressBar.tsx`
- **Visuals**: `Avatar.tsx`, `Badge.tsx`, `StatusBadge.tsx`, `Countdown.tsx`

---

## 2. Navigation Structure 🧭

### 📱 Global Layout (`app/layout.tsx`)

- **Providers**: `MultiChainWalletProvider` (Wallet connection state), `ToastProvider`.
- **Global Elements**:
  - `GlobalBackButton`: Floating/Fixed back navigation.
  - `ConditionalBottomNav`: Mobile-first bottom navigation bar.

### 📍 Navigation Menus (`src/components/layout`)

- **Header**: `DashboardHeader.tsx` (in `home/`) - Likely contains Logo, Connect Wallet, Profile.
- **Mobile Menu**: `MobileBottomNav.tsx` - App-like navigation for mobile users (Home, Explore, Launch, Profile).
- **Footer**: `Footer.tsx` - Standard footer content.

---

## 3. Page Structure & User Flows 🗺️

### 🏠 Landing / Dashboard (`app/page.tsx`)

The main entry point for users.

- **Header**: `DashboardHeader`
- **Hero/Background**: `PageBackground`, `HeroSection`
- **Main Content**: `DashboardCombinedGrid` (Central command center)
  - **Widgets**: `TrendingWidget`, `PortfolioWidget` (User's holdings/performance)
  - **Actions**: `QuickActions` (Shortcuts to Create, Buy, etc.)
- **Stats**: `StatsRow` (Global platform metrics)

### 🚀 Launchpad Wizards (`app/create/`)

Flows for project creators to launch tokens.

- **Presale**: `app/create/presale` (Step-by-step wizard)
  - Steps: Basics, Sale Params, Vesting, Review.
- **Fairlaunch**: `app/create/fairlaunch`
- **Bonding Curve**: `app/create/bonding-curve`

### 🔍 Explore & Listings (`app/test-explore`, `app/presales`)

Where investors find projects.

- **Explore**: `app/explore` - Likely a grid/list of active projects.
- **Presale List**: `app/presales` - Specific filtered list for presales.
- **Fairlaunch List**: `app/fairlaunch` (implied from structure).

### 📄 Project Details

Detailed view for investors to analyze and contribute.

- **Presale Details**: `app/presales/[id]`
  - **Header**: Project info, Socials, Badges (SAFU, KYC).
  - **Tabs**: `Overview`, `Contribute`, `Claim`, `Refund`, `Transactions`.
  - **Key Components**: `PresaleDetailClient.tsx`, `ContributionForm.tsx`, `VestingClaimer.tsx`.
- **Fairlaunch Details**: `app/fairlaunch/[id]` (Similar structure).

### 👤 User Profile (`app/profile/`)

User settings and portfolio management.

- **Portfolio**: `app/portfolio`
- **Rewards**: `app/rewards` (Referral system, earnings)
- **Vesting**: `app/vesting` (Claim portal for all investments)

### 🛠 Admin Panel (`app/admin/`)

Restricted area for platform administrators.

- **Management**: Approve projects, deploy contracts, manage vetting.

---

## 4. Key Functional Areas ✨

- **Wallet Connection**: Global button/modal handled by `MultiChainWalletProvider`.
- **Staking**: `app/staking` - Staking platform tokens for tiers/rewards.
- **Social/AMA**: `app/ama`, `app/feed` - Community engagement features.
- **Badges/Security**: `src/components/ui/StatusBadge.tsx`, `Badge.tsx` - Trust indicators (SAFU, Audit, KYC).

---

## 5. Notes for Designers 📝

- **Mobile First**: heavy use of `BottomNav` implies a strong mobile focus.
- **Dark Mode**: Tailwind config suggests full dark mode support (`.dark` class).
- **Modularity**: UI is built with atomic components (`ui/` folder) — stick to these base styles when designing new pages.
- **Gradient/Glass**: Check `PageBackground` and `Card` styles — likely uses modern glassmorphism or gradient overlays typical in Web3.

This map should provide a solid skeleton for building the Figma file. Let me know if you need deep dives into specific component code (e.g., "How does the Contribution Form success state look?").
