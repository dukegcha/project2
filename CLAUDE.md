# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a Next.js 15 restaurant reservation website featuring the "Hanakin Sushi & Izakaya" restaurant with a modern React-based UI. The project uses TypeScript, Tailwind CSS, and shadcn/ui components for a professional restaurant booking experience.

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles with Tailwind and CSS variables
│   ├── layout.tsx           # Root layout component
│   └── page.tsx             # Home page (renders RestaurantComponent)
├── components/
│   ├── ui/                  # shadcn/ui component library
│   │   ├── button.tsx
│   │   ├── calendar.tsx
│   │   ├── card.tsx
│   │   ├── popover.tsx
│   │   └── select.tsx
│   └── RestaurantComponent.tsx  # Main restaurant landing page component
└── lib/
    └── utils.ts             # Utility functions (cn for className merging)
```

## Development Commands

- **Start development server**: `npm run dev` (runs on http://localhost:3001 if 3000 is taken)
- **Build for production**: `npm run build`
- **Start production server**: `npm run start`
- **Lint code**: `npm run lint`

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with CSS variables for theming
- **UI Components**: shadcn/ui (built on Radix UI primitives)
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Calendar**: react-day-picker

## Key Features

- Full-screen hero section with background image
- Interactive reservation form with date picker and party size selector
- Responsive design optimized for all screen sizes
- Sign in/Sign up authentication placeholders
- Modern UI with consistent design system

## Architecture Notes

- **Component Structure**: Uses React functional components with TypeScript
- **State Management**: Local component state with useState hooks
- **Styling**: Tailwind utility classes with CSS custom properties for theming
- **UI Components**: Follows shadcn/ui patterns for consistent, accessible components
- **Date Validation**: Prevents past date selection in reservation form

## Dependencies

Key dependencies include:
- `next`, `react`, `react-dom` - Core React/Next.js
- `tailwindcss`, `autoprefixer`, `postcss` - Styling
- `@radix-ui/*` - Accessible UI primitives
- `lucide-react` - Icon library
- `date-fns` - Date manipulation
- `class-variance-authority`, `clsx`, `tailwind-merge` - Utility libraries