# AI Project Guidelines: Deoghar Kitab

This document serves as the permanent constitution for the **Deoghar Kitab** project. Every AI developer and automated agent must read and adhere to this document before planning, modifying, or creating any files.

---

## 1. Project Overview & Vision
Deoghar Kitab is an active online marketplace for buying and selling second-hand books, targeting school students, college students, competitive exam aspirants, and government exam candidates.
The platform is transitioning into a **Smart Local Book Commerce Platform** that connects students, local book stores, libraries, coaching institutes, schools, and publishers in one integrated ecosystem.

---

## 2. Architecture & Tech Stack

### Frontend
- **Framework:** React with TypeScript (Vite as build tool)
- **Styling:** Tailwind CSS & Custom CSS
- **Routing:** React Router v6
- **Animations:** Framer Motion (Glassmorphism, hover transitions, micro-animations)
- **UI Components:** Shadcn UI (using Radix Primitives under the hood)

### Backend
- **Framework:** Node.js + Express.js
- **Database:** MongoDB (via Mongoose)
- **Authentication:** Firebase Authentication & JWT (JSON Web Token)
- **APIs:** RESTful API architecture

### Deployment
- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas

---

## 3. Directory Structure

```
deoghar-kitab-reads/
├── frontend/                     # React Single Page Application (Vite)
│   ├── src/
│   │   ├── components/           # Reusable UI & Layout Components
│   │   ├── pages/                # Pages and Views
│   │   ├── contexts/             # Global React Contexts (Auth, Theme, etc.)
│   │   ├── hooks/                # Custom React Hooks
│   │   ├── lib/                  # Library bindings (e.g. utils)
│   │   ├── App.tsx               # Primary router and app setup
│   │   └── main.tsx              # React mounting entry point
│   ├── public/                   # Static assets
│   ├── tailwind.config.ts        # Styling tokens and Tailwind settings
│   └── tsconfig.json             # TypeScript rules
├── backend/                      # Node.js/Express Server API
│   ├── src/
│   │   ├── config/               # Database & service configurations
│   │   ├── controllers/          # API Request Handlers
│   │   ├── middleware/           # Route guards, error handlers, and validations
│   │   ├── models/               # Mongoose Schemas (User, Book, Reservation, etc.)
│   │   ├── routes/               # API endpoint routing
│   │   └── server.js             # Express app entry point
└── package.json                  # Root runner scripts
```

---

## 4. Database Rules & Collections
- **Backward Compatibility:** NEVER delete existing columns, tables, or database fields.
- **Auto-Approval:** Every user is treated as a seller automatically. The fields `isSellerApproved` defaults to `true` and `sellerRequestStatus` defaults to `'approved'`.
- **Destructive Migrations:** Avoid removing production tables or renaming active fields. Always use incremental schemas with fallback default values.
- **Search Demand Collection:** A new tracking mechanism must record searches to feed insights, logging even when books are out of stock.

---

## 5. Security & Environment Variables
- **Secrets Exposure:** Never print, log, or expose API keys, JWT secrets, database connection URIs, or credentials.
- **Credentials Security:** `.env` files must NEVER be committed to Git. If new parameters are introduced, document them in `.env.example` ONLY.
- **Access Guarding:** Always verify token signature in the `protect` middleware before returning sensitive data.

---

## 6. AI Development Rules
1. **Analyze First:** Read `AI_PROJECT_GUIDELINES.md` and check current routing/APIs before changing any code.
2. **Backward Compatibility:** Do not duplicate or rewrite existing modules (e.g. Chat, Authentication). Rather, integrate with them.
3. **TypeScript Compliance:** Maintain strict types. Ensure there are no TypeScript compiler warnings (`npm run build` must have exit code 0).
4. **Consistency:** Match the established coding standards (ES6 modules for Frontend, CommonJS for Backend).
