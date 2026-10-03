# Deoghar Kitab - Firebase Authentication Simplification (Spec)

## Overview
- **Summary**: Replace the existing broken JWT + MongoDB password-based authentication flow with a simple, reliable Firebase Authentication flow (email/password) as the PRIMARY frontend authentication mechanism, while preserving MongoDB user profiles and all existing application features (books, chat, wishlist, dashboards, etc.).
- **Purpose**: Make authentication reliable for a resume/portfolio showcase so a recruiter can easily open the deployed site, create an account, log in, and explore the project without hitting JWT/server errors.
- **Target Users**: Recruiters, hiring managers, portfolio reviewers.

## Goals
1. Firebase Authentication (email/password) is the only mechanism for frontend Signup, Login, Logout, Session persistence, and route protection.
2. Existing JWT backend tokens continue to work for backend-protected API calls (books, chat, wishlist, notifications, analytics, reservations) via a backend sync endpoint.
3. All MongoDB user/books/chat/wishlist data is preserved (no deletion).
4. No passwords are stored in MongoDB for Firebase-authenticated users.
5. Production build succeeds and protected routes work on Vercel after redeploy.
6. Clean error handling (invalid credentials, duplicate email, weak password, network errors).
7. Auth loading state prevents route flicker.

## Non-Goals
- No new JWT system or JWT fixes to the old password-login endpoints (old /register endpoints remain in the backend unchanged.
- No seller approval/verification redesign.
- No UI redesign (preserve all existing UI in UnifiedAuthPage, Login, Signup exactly where possible).
- No Firebase Social providers (Google, etc.) - only email/password.
- No RBAC beyond the existing simple role system (buyer/seller/admin).
- No database migration or data deletion.
- No new AI/analytics/payment/marketplace features.
- No modification of unrelated app features (Books, Browse, Search, Book Details, Wishlist, Chat, Notifications, Dashboards, Existing routing).

## Background & Context
- Project: Deoghar Kitab — second-hand book marketplace.
- Frontend: Vite + React + TypeScript + React Router.
- Backend: Node.js + Express + MongoDB + JWT middleware.
- Current broken frontend auth pages call `/api/users/login` and `/api/users/register backend endpoints return JWT tokens — these depend on bcrypt password compare (password stored in MongoDB, but the user reports these endpoints are erroring.
- Firebase config env vars (VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID, VITE_FIREBASE_MEASUREMENT_ID).
- package.json. `.gitignore already includes `.env`.
- `User schema password field is currently `required: true — this must become optional so Firebase-synced users don't need a password.
- Frontend files involved:
  - `frontend/src/contexts/AuthContext.tsx (user + token storage, isAuthenticated flag.
  - frontend/src/pages/UnifiedAuthPage.tsx (landing auth page at route "/").
  - frontend/src/pages/Login.tsx, Signup.tsx (alternative pages at "/classic-auth" via "classic-auth`).
  - frontend/src/components/ProtectedRoute.tsx (route guard).
  - frontend/src/components/Navbar.tsx (logout + auth-aware navigation.
- Backend files involved:
  - backend/src/models/User.js (user schema).
  - backend/src/controllers/userController.js.
  - backend/src/routes/users.js.

## Functional Requirements
- **FR-1 Firebase Initialization**: Frontend initializes Firebase App and Auth instance from existing VITE_FIREBASE_* env vars.
- **FR-2 Signup Flow**: UnifiedAuthPage signup → Firebase createUserWithEmailAndPassword → updateProfile(displayName), updateUserProfile (name) → backend sync → AuthContext stores user + JWT → redirect /home.
- **FR-3 Login Flow**: UnifiedAuthPage login → Firebase signInWithEmailAndPassword → backend sync → AuthContext stores user + JWT → redirect /home.
- **FR-4 Session Persistence**: onAuthStateChanged drives AuthContext isLoading. Reload preserves session.
- **FR-5 Logout**: Firebase signOut → AuthContext clear user + token → redirect "/".
- **FR-6 Protected Routes**: ProtectedRoute uses isLoading/isAuthenticated - shows loading while Firebase initializing, redirects "/" when unauthed.
- **FR-7 Authed Redirect**: if user visits "/" while already authed → redirect to /home (avoids landing on login page.
- **FR-8 Backend User Sync**: New backend endpoint POST /api/users/firebase-sync → finds existing user by firebaseUid or email OR creates new user document without password, attaches firebaseUid, returns standard shape + JWT.
- **FR-9 MongoDB User Preserve**: Existing users with existing books/wishlist/chat/notifications/reservations preserved.
- **FR-10 Error Handling**: Firebase errors (auth/invalid-email, auth/user-not-found, auth/wrong-password, auth/email-already-in-use, auth/weak-password, auth/network-request-failed) mapped to user-friendly strings.
- **FR-11 Backend Compat**: getAuthHeaders() still returns Authorization: Bearer <jwt> for existing backend-protected routes.

## Non-Functional Requirements
- **NFR-1 Security**: No secrets printed/hardcoded. No passwords logged. .env stays in .gitignore.
- **NFR-2 Production Builds**: `npm run build` succeeds without TypeScript errors.
- **NFR-3 Vercel Compatible**: Firebase env vars are VITE_ prefixed and read at build.
- **NFR-4 Minimal Changes**: touch only auth-related files.
- **NFR-5 UX**: Loading spinner on protected routes before redirects flash.

## Constraints
- **Technical**:
  - Firebase SDK must be installed.
  - User schema password field must become optional.
  - Backend firebase-sync endpoint is public (no auth required).
  - Existing books/chat/notifications/wishlist/reservations features untouched except via authContext contract (same shape.
- **Business**:
  - No recruiter needs to touch backend JWT or .env values are never printed.
- **Dependencies**:
  - Firebase npm package.
  - Existing VITE_FIREBASE_* env vars already set in .env (verified present).

## Assumptions
- Firebase console already has Email/Password provider enabled in project already set up with the existing VITE_FIREBASE_PROJECT_ID.
- User Vercel env vars will be set: VITE_FIREBASE_* (deploy step for production).
- Firebase console authorized domains include localhost and deoghar-kitab.vercel.app.
- Old /api/users/login and /register endpoints remain but are not used by the new flow (left for historical compatibility).

## Acceptance Criteria

### AC-1: Signup works end-to-end
- **Type**: `rule`
- **Given**: Fresh unauthenticated opens UnifiedAuthPage at "/", switches signup mode, enters valid name, email, password.
- **When**: Submits signup form.
- **Then**: Firebase account created, MongoDB user synced, AuthContext populated, redirects to /home, and can access protected pages without error.
- **Pass Condition**: Full signup, no network errors. Verified via DevTools localStorage has user and token.
- **Evidence**: Manual test run output + browser snapshot.

### AC-2: Login works end-to-end
- **Type**: `rule`
- **Given**: Existing Firebase user visits UnifiedAuthPage "/" in login mode with valid credentials.
- **When**: Submits login.
- **Then**: Firebase signed in, backend sync returns user + JWT, AuthContext, redirects to /home.
- **Pass Condition**: user data and token localStorage, protected routes render.
- **Evidence**: Manual test or build smoke test pass.

### AC-3: Logout works
- **Type**: `rule`
- **Given**: Authenticated user clicks navbar Sign Out button.
- **When**: handleSignOut invoked.
- **Then**: Firebase signOut, AuthContext cleared, localStorage cleared, redirects "/".
- **Pass Condition**: isAuthenticated false, on refresh no longer accesses protected routes redirect.
- **Evidence**: Manual.

### AC-4: Session persistence on refresh
- **Type**: `rule`
- **Given**: User is authenticated and on /home.
- **When**: Refresh browser refresh (F5).
- **Then**: Firebase onAuthStateChanged fires, backend syncs, still Authed, /home renders without redirects.
- **Pass Condition**: No flick "/", no redirect loops, user object.
- **Evidence**: Manual check.

### AC-5: Protected route unauthenticated redirect
- **Type**: `rule`
- **Given**: Not signed out user navigates directly to /profile, /chat, /seller-dashboard, /wishlist, /notifications, /cart, /reservations, /nearby-search, /requests, /inventory-manager, /shopkeeper-insights, /admin.
- **When**: Any of these routes are visited.
- **Then**: Shows loading briefly, then redirects Navigate "/" replaces current entry.
- **Pass Condition**: URL changes to "/". No content renders for.
- **Evidence**: Manual.

### AC-6: Invalid login shows error
- **Type**: `rule`
- **Given**: Wrong email/password in login.
- **When**: Submit.
- **Then**: Inline red error with friendly message (e.g. "Invalid email or password"). No console raw error.
- **Pass Condition**: UI shows readable error. Console log no passwords logged.
- **Evidence**: Screenshot / manual test.

### AC-7: Duplicate signup shows error
- **Type**: `rule`
- **Given**: Signup with existing Firebase email.
- **When**: Submit signup form with same email again.
- **Then**: Inline red error "Email already in use."
- **Pass Condition**: Error string user-friendly.
- **Evidence**: Manual test.

### AC-8: Production build succeeds
- **Type**: `rule`
- **Given**: Frontend project.
- **When**: `npm run build`.
- **Then**: Vite build exits with code 0.
- **Pass Condition**: Exit code 0, no TypeScript or esLint errors (lint optionally).
- **Evidence**: Build output.

### AC-9: Existing features preserved
- **Type**: `rubric`
- **Dimension**: Unaffected feature integrity
- **Scale**: 1-5
- **Anchors**: 1 = multiple existing pages broken; 3 = minor styling; 5 = Books Browse/Search/Book Details/Chat UI routes mount without errors.
- **Pass Threshold**: >= 4
- **Evidence**: Route navigation spot checks build output.

### AC-10: Backend JWT API calls succeed (getAuthHeaders)
- **Type**: `rule`
- **Given**: Signed up user visits Notifications page.
- **When**: fetch notifications fired with Bearer <token> getAuthHeaders().
- **Then**: Backend returns 200 (or empty array []).
- **Pass Condition**: 401/403 Notifications renders.
- **Evidence**: Network tab manual.

### AC-11: No password in MongoDB for Firebase users
- **Type**: `rule`
- **Given**: Firebase user created via signup.
- **When**: Document created/ synced POST /firebase-sync.
- **Then**: MongoDB user document does not require password field; firebaseUid set.
- **Pass Condition**: Inspect database model schema allows password.
- **Evidence**: Schema change model User.js line review.

## Open Questions
- None. All requirements are explicitly stated in the user request. 