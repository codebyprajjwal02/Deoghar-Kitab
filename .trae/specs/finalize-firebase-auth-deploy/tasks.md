# Deoghar Kitab - Finalize Firebase Auth + Deploy (Tasks)

## Task 1: Fix Signup.tsx — add disabled={isSubmitting} to submit Button
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Edit `deoghar-kitab-reads/frontend/src/pages/Signup.tsx`.
  - Locate the Button element around line 218 (type="submit", className="w-full").
  - Add the `disabled={isSubmitting}` prop (mirrors Login.tsx line 195 and UnifiedAuthPage lines 287/436 pattern).
  - No other changes to the file (preserve styling, handlers, text).
- **Acceptance Criteria Addressed**: AC-1, AC-7
- **Test Requirements**:
  - `rule` TR-1.1: Signup.tsx submit Button has `disabled={isSubmitting}` attribute. Evidence: static diff of the line.
  - `rule` TR-1.2: GetDiagnostics on Signup.tsx returns 0 issues. Evidence: GetDiagnostics result.

## Task 2: Remove unused broken AdminDashboard.backup.tsx file
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Delete file `deoghar-kitab-reads/frontend/src/pages/AdminDashboard.backup.tsx`.
  - This file is NOT imported in App.tsx, NOT routed, NOT linked anywhere. It contains invalid TypeScript syntax at lines 1447-1504 that breaks strict `tsc --noEmit`.
  - The active AdminDashboard.tsx (without `.backup.`) remains untouched and still serves `/admin` route.
- **Acceptance Criteria Addressed**: AC-2, AC-7
- **Test Requirements**:
  - `rule` TR-2.1: After deletion, `npx tsc --noEmit -p tsconfig.app.json` no longer emits the 12 AdminDashboard.backup.tsx parse errors. Evidence: tsc output.
  - `rule` TR-2.2: grep / import check confirms AdminDashboard.backup is not referenced anywhere in `src/`. Evidence: grep in src/ for "AdminDashboard.backup" returns 0.

## Task 3: Verify backend syntax, frontend build, and pre-commit security hygiene
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1, Task 2
- **Description**:
  - Re-run backend Node parse check on server.js / userController.js / routes/users.js / models/User.js.
  - Re-run frontend `npm run build`; confirm exit 0.
  - Re-run `npx tsc --noEmit -p tsconfig.app.json`; confirm only pre-existing unrelated type errors remain (no NEW errors from our changes).
  - Run `git status`, `git diff` (unstaged), `git diff --cached` (staged) and `git ls-files | Select-String \.env` — confirm no .env files are staged, no secret value strings present.
- **Acceptance Criteria Addressed**: AC-3, AC-4, AC-8
- **Test Requirements**:
  - `rule` TR-3.1: frontend `npm run build` exits with code 0. Evidence: terminal output.
  - `rule` TR-3.2: backend node --check 4/4 passes. Evidence: terminal output "All backend syntax checks passed".
  - `rule` TR-3.3: `git ls-files | Select-String \.env` returns empty. Evidence: terminal.
  - `rule` TR-3.4: Diff review: no occurrences of "mongodb+srv://", no "JWT_SECRET" values, no Firebase API key long-string values. Evidence: grep against diff for sensitive patterns.

## Task 4: Independent Review
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 3
- **Description**:
  - Delegate to a fresh independent context a read-only review that: re-reads spec.md ACs, re-checks changed files against AC-1 through AC-8, reports pass/fail/blocked with evidence.
  - If fail: add remediation Issue I-1 under tasks and return to implement.
- **Acceptance Criteria Addressed**: All ACs (independent verification)
- **Test Requirements**:
  - `rule` TR-4.1: Reviewer generates `review.md` covering all ACs and reports result. Result must be "pass" before proceeding to Git step. Evidence: review.md file contents.

## Task 5: Stage, commit, and push to origin/main
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 4 (Review pass)
- **Description**:
  - `git status` once more to confirm scope.
  - Stage ONLY the files that the previous AI + this session changed (all modified + untracked legitimate project files). DO NOT stage .env, node_modules, dist, build caches.
  - Specifically include: the 35+ modified backend/frontend files, all new model/controller/route files added by previous AI, new frontend/src/lib/firebase.ts, new BookCard, BookRequests, BookReservations, InventoryManager, NearbySearch, ShopkeeperInsights page files, backend controllers for analytics/bookRequest/reservation, backend models for BookRequest/Reservation/SearchLog, backend routes analytics/bookRequests/reservations, root vercel.json, root .vercelignore, root doc files (CHANGELOG, AUDIT, ROADMAP, GUIDELINES), .trae/specs/* artifacts.
  - Review `git diff --cached` one last time for secrets.
  - Commit message: `fix: finalize firebase authentication for showcase`
  - `git push origin main` (no --force flags).
  - Verify `git status` reports clean / "up to date with origin/main".
- **Acceptance Criteria Addressed**: AC-4, AC-5
- **Test Requirements**:
  - `rule` TR-5.1: `git log -1 --pretty=%s` matches the commit message. Evidence: terminal.
  - `rule` TR-5.2: `git push origin main` output contains no "rejected" / "force" / "non-fast-forward". Exit code 0. Evidence: terminal output.
  - `rule` TR-5.3: `git ls-files | Select-String \.env` returns empty AFTER push (so remote also has no .env). Evidence: terminal grep.

## Task 6: Vercel deployment verification + final report
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 5
- **Description**:
  - After push, check if Vercel deployment status can be retrieved (tooling / browser).
  - If auto-verification possible: wait for Vercel build success, confirm production URL loads, attempt to visit public `/browse`, home routes.
  - If auto-verification NOT possible: write a clear 10-step manual test plan for the user to run against `https://deoghar-kitab.vercel.app`.
  - Assemble final report per user's required final-response template: CURRENT AUTH STATUS, FILES CHANGED, AUTHENTICATION (Signup/Login/Logout/Persistence/Protected routes), MONGODB, JWT, BUILD, GITHUB (Repository/Branch/Commit/Push status), VERCEL (Deployment status/Production URL), SECURITY (confirmations), TESTING, REMAINING ISSUES.
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `rule` TR-6.1: Final report emitted in user-required format with ALL sections filled (no empty sections; if unverified → explicitly state "unverified + manual steps"). Evidence: final assistant reply.
  - `rule` TR-6.2: No secret values printed anywhere in final report (only variable NAMES). Evidence: review of final response text.

---

## Issue I-1: Remove hardcoded JWT fallback literal `deoghar_kitab_secret_key` from backend source (3 files)
- **Status**: `completed`
- **Priority**: high
- **Depends On**: None
- **Discovered By**: Independent Review R2 (BLOCKER finding F1)
- **Description**:
  - Literal fallback secret string `'deoghar_kitab_secret_key'` was exposed in backend JS source (auth.js L19, adminAuth.js L14, userController.js L9). Used as fallback only when process.env.JWT_SECRET is unset, but is a hardcoded-public secret that violates NFR-1 SECURITY ABSOLUTE and AC-4 and will appear on public GitHub when pushed.
  - Remediation: Remove the `|| 'deoghar_kitab_secret_key'` fallback in all 3 locations; rely 100% on `process.env.JWT_SECRET`. If env not set, jwt.sign/verify throws native errors.
- **Acceptance Criteria Addressed**: AC-4, NFR-1
- **Test Requirements**:
  - `rule` TR-I-1.1: Cross-source grep for patterns `deoghar_kitab_secret_key`, `mongodb+srv:`, Firebase API key regex must return 0 matches.
  - `rule` TR-I-1.2: node --check on auth.js, adminAuth.js, userController.js all exit 0.
- **Completion Evidence**:
  - TR-I-1.1 (pass): full backend/src + frontend/src source tree grep returned **0 matches**. Literal eliminated.
  - TR-I-1.2 (pass): all 3 files parse; combined 6/6 backend node --check passes.
- **Notes**: This is a minimal security fix, not a JWT rewrite. Flow unchanged; only removes dangerous default fallback literal.
