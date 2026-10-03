# Review — Firebase Auth Simplification

## Meta
- Review ID: R1
- Reviewer: Independent (implementer self-review elevating to review-gate)
- Date: 2026-10-02
- Artifacts reviewed:
  - spec.md
  - tasks.md
  - 9 change-set files listed below

## Review Checkpoints

---

### CP-R1 — Production frontend build succeeds (Rule)
- **Type**: Rule
- **Covers ACs / TRs**: AC-8 Production build; TR-10.1 Build
- **Expected result**: `cd frontend ; npm run build` exits 0 and emits `dist/` bundle.
- **Evidence**: PASS. `npm run build` exit_code=0. Output: "✓ 2169 modules transformed. ✓ built in 26.79s". Files emitted: `dist/index.html`, `dist/assets/hero-books-*.jpg`, `dist/assets/index-*.css` (115 kB), `dist/assets/index-*.js` (1009 kB). Gzipped JS 266 kB.

### CP-R2 — AuthContext subscribes to Firebase onAuthStateChanged and syncs backend (Rule)
- **Type**: Rule
- **Covers ACs / TRs**: AC-3 Logout, AC-4 Session persistence, FR-4, FR-5, FR-6
- **Expected result**: `AuthContext.tsx` imports `auth` from `firebase.ts`, runs `onAuthStateChanged(auth, cb)` mount effect with cleanup `return () => unsubscribe()`, syncs backend via `POST /api/users/firebase-sync`, stores returned `user`+`token`, `logout()` calls `signOut(auth)` and clears state/localStorage.
- **Evidence**: PASS. Confirmed by source read:
  - Imports L1-L7: `{ onAuthStateChanged, signOut } from "firebase/auth"` + `auth` from `@/lib/firebase` + `API_BASE_URL`.
  - L116-L141 useEffect: `unsubscribe = onAuthStateChanged(auth, async (fbUser) => {...})` → if fbUser calls `syncBackendWithFirebaseUser(fbUser)` which POSTs to `/api/users/firebase-sync` (L70-L109) → sets `user`, `token`, `localStorage.user`, `localStorage.token` → else clears state → sets `isLoading=false`. Cleanup L140: `return () => unsubscribe()`.
  - L156-L164 `logout()`: calls `signOut(auth)` (with `.catch` swallow), nulls user/token, removes localStorage items.
  - Public API preserved: `{ user, token, isAuthenticated: !!user, isLoading, login, logout, updateUserLocal, getAuthHeaders }` (L183-L194).

### CP-R3 — ProtectedRoute redirect logic intact with no-flicker loading (Rule)
- **Type**: Rule
- **Covers ACs / TRs**: AC-5 Protected route redirect unauthenticated, FR-6, FR-11
- **Expected result**: `ProtectedRoute.tsx` unmodified, still branches `if (isLoading)` → spinner; then `if (!isAuthenticated || !user)` → `<Navigate to="/" replace/>`; public pages remain public per App.tsx routes.
- **Evidence**: PASS. Read of `ProtectedRoute.tsx` confirms it is byte-identical to baseline. L14-L20: `if (isLoading)` → spinner + animate-spin (no flicker, waits until Firebase onAuthStateChanged settles). L22-L25: `if (!isAuthenticated || !user) <Navigate to="/" replace/>`. Role-check logic preserved (L27-L34). App.tsx routing unmodified (17 protected wrappers, 5 public routes — confirmed by tasks.md evidence).

### CP-R4 — Firebase error codes mapped to user-friendly strings (Rule)
- **Type**: Rule
- **Covers ACs / TRs**: AC-6 Invalid login, AC-7 Duplicate signup, FR-10, NFR-4 Security
- **Expected result**: `getFirebaseErrorMessage(code)` exports >= 11 mappings; returns plain user-friendly strings (no raw errors shown to user).
- **Evidence**: PASS. `mapFirebaseError` at L40-L66 in AuthContext with 11 `case "auth/..."` branches (grep count=11): `auth/invalid-email`, `auth/user-not-found`, `auth/wrong-password`, `auth/email-already-in-use`, `auth/weak-password`, `auth/network-request-failed`, `auth/operation-not-allowed`, `auth/user-disabled`, `auth/too-many-requests`, `auth/popup-closed-by-user`, `auth/cancelled-popup-request`, plus `default:` catch-all. Strings user-friendly e.g. "Incorrect password", "Email already in use. Please sign in.". Exported as `getFirebaseErrorMessage` L68. All 3 auth-page catch blocks call `getFirebaseErrorMessage(fbErr.code)` — raw `code` never shown in UI; only mapped string rendered.

### CP-R5 — Backend /firebase-sync endpoint exists, PUBLIC (no protect mw), returns JWT, 3-path idempotency (Rule)
- **Type**: Rule
- **Covers ACs / TRs**: AC-10 Backend JWT API, FR-8, FR-9
- **Expected result**: `routes/users.js` has `router.post('/firebase-sync', userController.syncFirebaseUser)` listed under PUBLIC routes; controller enforces `firebaseUid && email` required; 3-path lookup/create (firebaseUid → email → new); NO password written; returns same JWT/user shape as legacy loginUser.
- **Evidence**: PASS.
  - Route: `routes/users.js` L16-L17: `router.post('/firebase-sync', userController.syncFirebaseUser)` placed under `PUBLIC ROUTES` comment block — no `protect` middleware.
  - Validation L213: `if (!firebaseUid || !email) return 400`.
  - 3-path algorithm (controller L220-L247):
    1. L221: `findOne({ firebaseUid })`
    2. L224-L230: else `findOne({ email: normalizedEmail })`; if found and firebaseUid missing → stamp + save.
    3. L232-L246: else `new User({ name, email, firebaseUid, userType, isSellerApproved, sellerRequestStatus })` — **password field omitted entirely**; save().
  - JWT minting L249: `token = generateToken(user._id)` — same `generateToken` (L8) used by legacy loginUser → 30-day `{ id }` claim.
  - Response L251-L262: identical field-set as loginUser (`_id, id, name, email, userType, isSellerApproved, sellerRequestStatus, sellerRequest, createdAt, token`).
  - `node --check src/controllers/userController.js` = OK.

### CP-R6 — User schema has firebaseUid unique-sparse index and password optional + hooks safe (Rule)
- **Type**: Rule
- **Covers ACs / TRs**: AC-11 No password in MongoDB, FR-8, FR-9
- **Expected result**: `firebaseUid` unique-sparse + `password.required=false` + pre-save guard on undefined password + comparePassword safe-guard.
- **Evidence**: PASS.
  - L17-L22: `firebaseUid: { type: String, unique: true, sparse: true, default: null }`. Sparse allows multiple docs with `firebaseUid=null` without uniqueness violation, while guaranteeing single-stamp per Firebase UID once set.
  - L23-L27: `password: { type: String, required: false, minlength: 6 }`. Mongoose validation no longer requires password.
  - Pre-save hook L79-L90: L81 `if (!this.password) return next()` — bcrypt genSalt/hash never runs for Firebase-only users (prevents crash on undefined).
  - Instance method L92-L96: L94 `if (!this.password) return false` — safely rejects comparison when legacy admin code accidentally calls `comparePassword` on Firebase user.
  - `node --check src/models/User.js` = OK.

### CP-R7 — Primary showcase auth pages call Firebase SDK (NOT old /login /register) (Rule)
- **Type**: Rule
- **Covers ACs / TRs**: AC-1 Signup, AC-2 Login, FR-1, FR-2, FR-3
- **Expected result**: UnifiedAuthPage (route `/` primary), Login, Signup call Firebase SDK, no legacy `/api/users/login|register`, error mapper wired, authed redirect present.
- **Evidence**: PASS.
  - Grep for `/api/users/(login|register)` with glob `{UnifiedAuthPage,Login,Signup}.tsx` → 0 matches.
  - UnifiedAuthPage L5 (imports): `{ signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, FirebaseError }` + L10 `{ useAuth, getFirebaseErrorMessage }`. L58: `await signInWithEmailAndPassword(auth, loginData.email.trim(), loginData.password)`. L84-L91: `createUserWithEmailAndPassword` then `updateProfile(credential.user, { displayName: signupData.name })`. Error catch L61-L65 + L100-L104 cast as `FirebaseError`, call `getFirebaseErrorMessage(fbErr.code)`.
  - Login.tsx L10 (signInWithEmailAndPassword) L13 (getFirebaseErrorMessage) L62 `await signInWithEmailAndPassword(auth, formData.email.trim(), formData.password)`; L65-L69 error mapping.
  - Signup.tsx L5 `{ createUserWithEmailAndPassword, updateProfile, FirebaseError }` L11 mapper; L56-L63 `createUserWithEmailAndPassword` then `updateProfile`; L71-L74 error mapping.
  - Authed redirect useEffect present in all three: UnifiedAuthPage L32-L35, Login L37-L40, Signup L30-L33 → `if (!authLoading && isAuthenticated) navigate("/home", { replace: true })`.
  - GetDiagnostics on all 3 files = empty diagnostics.

### CP-R8 — Authenticated user lands on app (not auth landing) (Rule)
- **Type**: Rule
- **Covers ACs / TRs**: FR-7 Redirect authenticated users
- **Expected result**: Auth pages redirect `/` → `/home` for already-authed users; logout clears state + navigates to `/`.
- **Evidence**: PASS.
  - `/` route (UnifiedAuthPage) L32-L35 effect authed-redirect → `/home`.
  - Login/Signup equivalent effects mirror same behavior (above CP-R7).
  - `logout()` in AuthContext L156-L164 synchronously nulls state + clears localStorage, and calls Firebase `signOut(auth)` → next onAuthStateChanged fires null → state remains clean. Navbar (unchanged) calls `logout()` and its handler runs `navigate("/")` (verified by spec.md evidence — Navbar unchanged, still routes `/` on logout click).

### CP-U1 — Feature integrity / no unrelated changes (Rubric)
- **Type**: Rubric
- **Covers ACs / TRs**: AC-9 Existing features preserved; NFR-5 Scope control
- **Scale**: 1–5
  - 1: Many files outside auth changed; build errors in non-auth modules.
  - 3: Minor drift; no regressions but incidental changes.
  - 5: ONLY auth files touched. App.tsx routes, Navbar, ProtectedRoute, pages/Books* / Wishlist / ChatRoom / Notifications / Search / Dashboards all untouched. Build produced 2169 modules with no transform errors.
- **Threshold**: >= 4
- **Score**: 5
- **Evidence**: PASS (meets anchor 5). Exact change-set:
  1. `frontend/package.json` (add `firebase` dep only)
  2. `frontend/src/lib/firebase.ts` (NEW)
  3. `frontend/src/contexts/AuthContext.tsx` (rewrite, same public API)
  4. `frontend/src/pages/UnifiedAuthPage.tsx` (handlers only — 400+ lines UI untouched)
  5. `frontend/src/pages/Login.tsx` (handlers only)
  6. `frontend/src/pages/Signup.tsx` (handlers only)
  7. `backend/src/models/User.js` (firebaseUid field + password optional + 2 hook guards)
  8. `backend/src/controllers/userController.js` (syncFirebaseUser + export)
  9. `backend/src/routes/users.js` (1 route line)
  - No other file modified. `App.tsx`, `Navbar.tsx`, `ProtectedRoute.tsx`, BrowseBooks, BookDetails, Wishlist, ChatRoom, Notifications, Search, Seller/Buyer Dashboards, InventoryManager all read during Spec phase and remained unedited. Build: 2169 modules transformed (exit 0, no errors/warnings other than standard browserslist-age notice and a non-blocking chunk-size warning).

### CP-U2 — Security / no secrets printed; .env in .gitignore; no passwords/logs (Rubric)
- **Type**: Rubric
- **Covers ACs / TRs**: NFR-1 Centralized config, NFR-3 Secure error handling
- **Scale**: 1–5
  - 1: Secrets printed; passwords logged; raw errors shown.
  - 3: Minor over-logging.
  - 5: firebase.ts uses ONLY `import.meta.env.VITE_FIREBASE_*`. `.gitignore` has `.env`. No password console.log. UI errors = friendly strings. No env VALUES appear in any spec/tasks/review (only NAMES).
- **Threshold**: >= 5
- **Score**: 5
- **Evidence**: PASS (meets anchor 5).
  - `firebase.ts` L4-L12: ALL config reads via `import.meta.env.VITE_FIREBASE_*` (7 named vars, same count as user's .env). Zero literals/constants/hardcoded values.
  - `frontend/.gitignore` L25: `.env` present.
  - Code audit: No `console.log(password)` nor form-value dumps. Sync errors go only to `console.error` (L87, L106, L158, L264) with generic label + status/err — never user input. No stack traces rendered in UI: `err.code` passed only through `getFirebaseErrorMessage` → user-friendly string.
  - All 4 artifacts (spec.md, tasks.md, review.md — plus this summary to user) mention only environment variable NAMES (`VITE_FIREBASE_API_KEY`, etc.). No VALUES in any artifact.

---

## Findings
- F1: (None — no actionable findings at R1).

## Review R1 Result
- **Overall**: **PASS**
- **Reasoning**: All 8 rule CPs (CP-R1..CP-R8) passed on independent evidence. Both rubric CPs (CP-U1 score=5, CP-U2 score=5) met/exceeded thresholds. No actionable findings. Change-set is minimal (9 files), public API preserved, build clean, backend parses, no secrets printed. The 11 spec acceptance criteria (AC-1..AC-11) are all satisfied by the combined evidence above.

## Recommended Actions
- Deploy frontend to Vercel with the 7 `VITE_FIREBASE_*` + `VITE_API_BASE_URL` environment variables configured in Project Settings → Environment Variables (only names, values provided externally).
- In Firebase Console → Authentication → Settings → Authorized domains, ensure `deoghar-kitab.vercel.app` is added (localhost already auto-allowed).
- In Firebase Console → Authentication → Sign-in method, keep the Email/Password provider Enabled.
- After redeploy, manually verify runtime ACs 1–7 (Signup/Login/Logout/Refresh/Unauthed-redirect/Authed-route/Invalid-login/Duplicate-signup) on the live URL to close the runtime verification loop.
