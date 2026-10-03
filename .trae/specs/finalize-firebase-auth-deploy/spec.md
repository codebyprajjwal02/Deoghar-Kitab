# Deoghar Kitab - Finalize Firebase Auth + Git Push + Vercel Deploy (Spec)

## Overview
- **Summary**: Finalize the Firebase authentication implementation (2 minor quality fixes), commit all previous AI uncommitted changes to the existing GitHub repository on `main` branch, and verify the Vercel Git integration triggers a successful production deployment. Ensure authentication works for recruiters visiting the live portfolio site.
- **Purpose**: Get the Firebase-auth-enabled Deoghar Kitab code into GitHub mainline and successfully deployed on Vercel so that the showcase is live.
- **Target Users**: Recruiters, hiring managers, portfolio reviewers visiting the live Vercel URL.

## Goals
1. Fix the 2 identified minor issues before commit (Signup submit button disabled state; broken AdminDashboard.backup.tsx causing tsc parse errors).
2. Frontend production build succeeds with exit code 0.
3. Backend Node syntax-check passes for changed files.
4. No `.env` / secret / credential files tracked in git.
5. No secret values present in the git diff.
6. All completed Firebase-auth changes are committed to the existing GitHub repo (`origin` = `https://github.com/codebyprajjwal02/Deoghar-Kitab.git`), branch `main`, with a descriptive commit message.
7. Push succeeds without force-push.
8. Vercel Git integration triggers a production deployment and succeeds.
9. Firebase auth env var NAMES required for Vercel are clearly reported (not values).
10. Final report lists auth status, files changed, build, GitHub, Vercel, and security confirmation.

## Non-Goals
- No rewriting / refactoring of existing working auth code.
- No changes to Books, Browse/Search, Book Details, Wishlist, Chat, Notifications, Dashboards, inventory, reservations, requests, payments logic (beyond what the previous AI already changed).
- No new Firebase providers (Google / phone / OTP / social).
- No new JWT implementation; existing JWT in backend is untouched.
- No MongoDB schema changes (previous AI already applied the 1 needed schema change).
- No new API endpoints.
- No creation of a new Vercel project; rely on existing GitHub→Vercel integration.
- No database data deletion or migration.
- No fixing of pre-existing lint errors in unrelated files (BookDetails `any` types, SellerDashboard `any` types, etc.).

## Background & Context
- **Previous work already in working tree (uncommitted)**:
  - Previous Spec `firebase-auth-simplify` (`.trae/specs/firebase-auth-simplify/`) — all 10 tasks already `completed` per `tasks.md`.
  - Frontend: Firebase SDK installed (`firebase@^12.19.0`), `frontend/src/lib/firebase.ts` created, `AuthContext.tsx` rewritten with `onAuthStateChanged` + backend sync, `UnifiedAuthPage.tsx` / `Login.tsx` / `Signup.tsx` now call Firebase SDK directly with user-friendly error mapping, `ProtectedRoute.tsx` shows loading spinner and redirects unauthed to `/`, authed redirect from `/` → `/home` is present.
  - Backend: `User.js` schema has `firebaseUid` (unique, sparse, default null) + password field is `required: false`; bcrypt pre-save hook and comparePassword guard undefined password safely; `syncFirebaseUser` controller does 3-path idempotent sync (by UID → by email → create new); `POST /api/users/firebase-sync` is registered as PUBLIC route in users router; CORS whitelist includes `https://deoghar-kitab.vercel.app` + localhost origins.
- **Verified by inspection (this session)**:
  - `git status` → on `main`, up to date with `origin/main`; lots of modified + untracked files pending commit.
  - `git log -1` → `445f159 fix: use deployed backend API for production` (last commit).
  - `git remote -v` → `origin  https://github.com/codebyprajjwal02/Deoghar-Kitab.git`.
  - `git ls-files | Select-String \.env` → **0 matches** (no .env tracked currently).
  - `npm run build` (frontend) → exit 0, 2169 modules transformed, dist/ produced.
  - Backend: `node --check` on server.js, userController.js, routes/users.js, models/User.js → **all passed**.
  - Lint → pre-existing unrelated errors in untouched files (BookDetails, SellerDashboard, ChatRoom, InventoryManager, NearbySearch, Notifications, Payment, tailwind.config, command.tsx, textarea.tsx); **0 new lint issues** in auth-changed files.
  - tsc (strict typecheck) → only errors in `AdminDashboard.backup.tsx` (a backup file with broken syntax not imported anywhere; not in App.tsx route tree).
- **Identified remaining issues (2)**:
  1. `Signup.tsx` line 218 submit Button: missing `disabled={isSubmitting}` (Login.tsx & UnifiedAuthPage have equivalent guard; Signup doesn't → double-submit possible).
  2. `AdminDashboard.backup.tsx` in src/pages: invalid TypeScript syntax around lines 1447-1504; file is never imported/routed; Vite build passes because SWC only transpiles imported files; but tsc --noEmit fails for the entire src include. Deleting this unused backup file resolves tsc noise.
- **Firebase env var NAMES used by frontend (VITE_ prefixed, build-time)**:
  VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID, VITE_FIREBASE_MEASUREMENT_ID (optional), VITE_API_BASE_URL.

## Functional Requirements
- **FR-1 Signup submit disabled**: While signup form is submitting (`isSubmitting=true`), the submit button must be disabled to prevent double-click duplicate account creation.
- **FR-2 No tsc noise from backup**: TypeScript `tsc --noEmit -p tsconfig.app.json` must not report parse errors from unused backup files in src/.
- **FR-3 Git hygiene**: Only source files, assets, and configs are staged. `.env`, `.env.local`, `.env.production` variants, `node_modules/`, `dist/`, build caches are NEVER staged. Diff must contain zero secret value strings.
- **FR-4 Descriptive commit**: Single commit with message `fix: finalize firebase authentication for showcase` (or similar) on branch `main`.
- **FR-5 Push without force**: `git push origin main` succeeds non-destructively (no `--force` / `--force-with-lease`).
- **FR-6 Vercel deploy success**: After push completes, the connected Vercel project Git integration triggers a production build and deployment that succeeds.

## Non-Functional Requirements
- **NFR-1 Security absolute**: No `.env` values, Firebase keys, MongoDB URI, JWT secrets, passwords, tokens, or private keys are ever printed to logs, diffs, terminal output, or committed files. Only variable NAMES may be mentioned.
- **NFR-2 Minimal files changed**: Only the 2 identified issues are touched before commit. No unrelated files are modified.
- **NFR-3 Build idempotency**: After fixes applied, `npm run build` exit 0 (identical structure to passing pre-fix build).
- **NFR-4 Diff review before commit**: `git status` and `git diff` (and `git diff --cached` after staging) are explicitly reviewed in this session and confirmed clean before commit.
- **NFR-5 Vercel compatibility**: Vite base is `./` (already set); SPA rewrites already in vercel.json (`/(.*)` → `/index.html`). Firebase env vars are `VITE_` prefixed (correct for Vercel dashboard config).

## Constraints
- **Technical**:
  - Existing repository ONLY: `https://github.com/codebyprajjwal02/Deoghar-Kitab.git`. Existing branch ONLY: `main`. No new repo, no new branch.
  - No force-push, no rewriting of commits before `445f159`.
  - No creation of new Vercel project / no manual Vercel CLI deploy. Use existing Git-integrated Vercel trigger.
  - `.env` files MUST remain untracked. Do not modify their contents.
  - Do NOT ask user for Firebase keys or .env values.
- **Business**:
  - Recruiter must be able to visit `https://deoghar-kitab.vercel.app`, click sign up, create account, and be signed in.
  - Showcase deadline: code must be live this session.
- **Dependencies**:
  - Network connectivity to GitHub and (for deploy verification step) ability to check deployment status.
  - Firebase console already authorized `deoghar-kitab.vercel.app` domain.

## Assumptions
1. Firebase project `VITE_FIREBASE_PROJECT_ID` already has Email/Password Sign-in method ENABLED in Firebase Console → Authentication → Sign-in method.
2. Firebase Console → Authentication → Settings → Authorized domains already includes `localhost` (for dev) AND `deoghar-kitab.vercel.app` (for production). If missing, auth will fail in production with `auth/unauthorized-domain` error; this is a Firebase-console-side fix (not code).
3. Vercel project dashboard already has the 7 `VITE_FIREBASE_*` env var NAMES configured with correct values AND `VITE_API_BASE_URL` pointing to the deployed backend, and they will be applied to the Production environment.
4. The deployed backend (rendered at whatever `VITE_API_BASE_URL` points to in prod) already has the new `firebase-sync` route running because the backend code is part of the same push.
5. User has valid GitHub credentials configured in this environment to `git push origin main`.

## Acceptance Criteria

### AC-1: Signup button disabled during submit
- **Type**: `rule`
- **Given**: User opens Signup.tsx page (via `/classic-auth` Signup mode) with valid form data entered.
- **When**: User clicks "Create Account" and the form is in the `isSubmitting=true` async window.
- **Then**: The submit `<Button>` must have `disabled` attribute set.
- **Pass Condition**: Signup.tsx source code line 218 (Button element) contains `disabled={isSubmitting}` or equivalent.
- **Evidence**: Static diff of Signup.tsx + tsc --noEmit passes on changed files.

### AC-2: tsc no longer reports parse errors from AdminDashboard.backup
- **Type**: `rule`
- **Given**: Project tsconfig.app.json `include: ["src"]`.
- **When**: `npx tsc --noEmit -p tsconfig.app.json` runs.
- **Then**: TypeScript compiler must NOT emit the 12 previous parse errors for `src/pages/AdminDashboard.backup.tsx` lines 1447-1504.
- **Pass Condition**: AdminDashboard.backup.tsx is removed OR is excluded from tsconfig.app.json include paths; tsc exit for those 12 errors no longer occurs.
- **Evidence**: tsc terminal output.

### AC-3: Frontend production build succeeds
- **Type**: `rule`
- **Given**: Fixes applied, clean working tree OR all intended changes staged.
- **When**: `cd deoghar-kitab-reads/frontend && npm run build` executed.
- **Then**: Vite process exits with code `0` and prints `built in Xs`.
- **Pass Condition**: Terminal exit code 0; dist directory contains index.html + JS/CSS assets.
- **Evidence**: Build output captured.

### AC-4: No secrets in diff / no .env tracked
- **Type**: `rule`
- **Given**: Before commit, after `git add -A` or selective staging.
- **When**: `git status`, `git diff`, `git diff --cached` are inspected; AND `git ls-files | Select-String \.env` run.
- **Then**:
  - `.env`, `.env.local`, `.env.production` appear only in "Untracked" or are ignored (NOT in "Changes to be committed").
  - Diff contains zero occurrences of Firebase API key value patterns, MongoDB connection strings, JWT secret literal values, or passwords.
  - `.trae/` artifact folder + `.vercel/` + Vercel config + root vercel.json + doc files (README/CHANGELOG/etc) are acceptable per user's instruction that project-level workspace docs are part of repo.
- **Pass Condition**: Explicit checkmarks for both sub-conditions above.
- **Evidence**: Terminal command outputs.

### AC-5: Commit pushed successfully to origin/main
- **Type**: `rule`
- **Given**: Clean diff.
- **When**: `git commit` then `git push origin main`.
- **Then**: Push completes with exit code 0. `git log -1` shows the new commit ahead of previous `445f159`. `git status` reports "Your branch is up to date with 'origin/main'."
- **Pass Condition**: Push stdout does not contain "rejected", "force", "non-fast-forward".
- **Evidence**: Terminal git push output.

### AC-6: Vercel deployment status verified
- **Type**: `rule`
- **Given**: GitHub push succeeded.
- **When**: Vercel Git integration triggers automatically (poll or wait for confirmation available).
- **Then**: Production deployment completes with a success status. OR: if auto-deploy verification tooling is unavailable, clearly state manual steps the user should perform in Vercel dashboard.
- **Pass Condition**: A clear statement: either (a) deployment log or status API indicates success; OR (b) explicitly documented that it couldn't be auto-verified, with step-by-step manual test instructions for the user to run against `https://deoghar-kitab.vercel.app`.
- **Evidence**: Screenshot / fetch of deployment status, OR enumerated manual test plan.

### AC-7: Existing non-auth features integrity (rubric)
- **Type**: `rubric`
- **Dimension**: Minimal-change fidelity
- **Scale**: 1-5
- **Anchors**:
  - 1 = 5+ unrelated source files were modified / deleted in this session; build transforms dropped modules.
  - 3 = 2-3 unrelated files touched; no new imports/exports changed in route tree.
  - 5 = exactly 2 source-file changes (Signup.tsx + remove backup) + docs/workspace-config files; all 2169 modules still transform.
- **Pass Threshold**: >= 4
- **Evidence**: git diff --stat output after fixes.

### AC-8: Backend syntax still clean
- **Type**: `rule`
- **Given**: Backend server.js + 3 changed backend source files already passed previous session.
- **When**: `node --check` re-run on backend/src/server.js, userController.js, routes/users.js, models/User.js.
- **Then**: All four exit code 0 and stdout contains only "All backend syntax checks passed".
- **Pass Condition**: 4/4 parse checks pass.
- **Evidence**: Terminal output.

## Open Questions
- None. Codebase is well-understood from inspection.
