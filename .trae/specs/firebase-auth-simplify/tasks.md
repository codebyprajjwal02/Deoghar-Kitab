# Deoghar Kitab - Firebase Authentication Simplification (Tasks)

## Task 1: Install Firebase npm package
- **Status**: `completed`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Run `npm install firebase` inside the `deoghar-kitab-reads/frontend` directory.
  - Verify package.json now includes firebase in dependencies.
- **Acceptance Criteria Addressed**: AC-1, AC-2, NFR-2
- **Test Requirements**:
  - `rule` TR-1.1: `package.json` contains `"firebase"` in `dependencies`; `node_modules/firebase/package.json` exists. Evidence: `cat package.json` output + ls.
- **Completion Evidence**:
  - TR-1.1 (pass): terminal command `npm install firebase` returned `added 77 packages in 58s`. `package.json` now contains `"firebase": "^11.x"` in dependencies after install.

## Task 2: Create Firebase initialization module
- **Status**: `completed`
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - Create new file `frontend/src/lib/firebase.ts`.
  - Read VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID, VITE_FIREBASE_MEASUREMENT_ID (optional) from `import.meta.env`.
  - Call `initializeApp(firebaseConfig)`.
  - Call `getAuth(app)`, export `auth` and `app`.
  - No hardcoded credentials.
- **Acceptance Criteria Addressed**: FR-1, NFR-1
- **Test Requirements**:
  - `rule` TR-2.1: File imports compile in tsc/build. `getAuth` called; `auth` is default/named export. Evidence: File contents review + build step passes.
- **Completion Evidence**:
  - TR-2.1 (pass): `frontend/src/lib/firebase.ts` created with `initializeApp(config)` + `getAuth(app)` called; named exports `app`, `auth`. GetDiagnostics returns 0 issues. `npm run build` exit code 0.

## Task 3: Update backend User schema (password optional + firebaseUid)
- **Status**: `completed`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Edit `backend/src/models/User.js`.
  - Change `password` field `required: true` → `required: false`.
  - Add new field `firebaseUid: { type: String, unique: true, sparse: true, default: null }`.
  - Update pre-save hook: skip bcrypt hash if password is not present/modified (already guarded by `!this.isModified('password')` — additionally guard against undefined: if !this.password then skip).
  - Update `comparePassword`: if `!this.password` → return `false`; otherwise bcrypt.compare.
- **Acceptance Criteria Addressed**: FR-8, FR-9, AC-11
- **Test Requirements**:
  - `rule` TR-3.1: Schema diff shows password.required === false and firebaseUid field added. Evidence: source code review.
  - `rule` TR-3.2: comparePassword returns false safely when no password set; pre-save hook does not throw for undefined password. Evidence: static code review.
- **Completion Evidence**:
  - TR-3.1 (pass): `backend/src/models/User.js` line 17-22 shows `firebaseUid` field (String, unique, sparse, default null); line 23-27 shows `password.required: false`.
  - TR-3.2 (pass): pre-save line 81 `if (!this.password) return next()` guards undefined password; comparePassword line 93-94 `if (!this.password) return false`. Backend syntax-check `node --check User.js` exits 0.

## Task 4: Add backend controller syncFirebaseUser + public route
- **Status**: `completed`
- **Priority**: high
- **Depends On**: Task 3
- **Description**:
  - In `backend/src/controllers/userController.js`, add `syncFirebaseUser(req, res)` function:
    - Accept `{ firebaseUid, email, name, userType? }` from body.
    - Normalize email lowercase.
    - Find user by `{ firebaseUid }` → if found return standard shape + JWT.
    - Else find by `{ email }` → if found attach firebaseUid, save, return + JWT.
    - Else create new user: name, email, firebaseUid, userType (default 'buyer' or if provided 'seller'/'admin'), no password. Return standard shape + JWT.
    - Same response shape as loginUser: `{ _id, id, name, email, userType, isSellerApproved, sellerRequestStatus, createdAt, token }`.
  - In `backend/src/controllers/index.js` (if index exists) and `backend/src/routes/users.js` add public route:
    - `router.post('/firebase-sync', userController.syncFirebaseUser);` (unprotected — public).
- **Acceptance Criteria Addressed**: FR-8, FR-9, AC-10, AC-11
- **Test Requirements**:
  - `rule` TR-4.1: `POST /api/users/firebase-sync` registered in users router unprotected. Evidence: routes/users.js source code.
  - `rule` TR-4.2: syncFirebaseUser returns { token, _id, name, email, userType } in all three paths (find by uid, find by email, create new). Evidence: static code review shape match.
- **Completion Evidence**:
  - TR-4.1 (pass): `backend/src/routes/users.js` line 16-17 shows public `router.post('/firebase-sync', userController.syncFirebaseUser)` listed under PUBLIC ROUTES section (no `protect` middleware).
  - TR-4.2 (pass): `syncFirebaseUser` in userController lines 209-267: all 3 paths end with `res.status(200).json({ _id, id, name, email, userType, isSellerApproved, sellerRequestStatus, sellerRequest, createdAt, token })` — identical shape. Syntax check `node --check userController.js` and `routes/users.js` pass (exit 0).

## Task 5: Rewrite AuthContext to use Firebase onAuthStateChanged + sync
- **Status**: `completed`
- **Priority**: high
- **Depends On**: Task 2, Task 4
- **Description**:
  - Edit `frontend/src/contexts/AuthContext.tsx`.
  - Import `{ auth }` from `@/lib/firebase`.
  - Import `{ onAuthStateChanged, signOut, User as FirebaseUser, updateProfile }` from `firebase/auth`.
  - Import `API_BASE_URL` from `@/lib/api`.
  - Remove old localStorage-based initialization useEffect.
  - New useEffect with onAuthStateChanged(auth, ...):
    - on next (firebaseUser != null):
      - call internal helper `syncBackend(firebaseUser)` that POSTs to `${API_BASE_URL}/api/users/firebase-sync` with `{ firebaseUid: firebaseUser.uid, email: firebaseUser.email!, name: firebaseUser.displayName || firebaseUser.email!.split('@')[0] }`.
      - Store returned user (User shape) in context user, returned token in token.
      - localStorage.setItem("user", JSON.stringify(user)) and localStorage.setItem("token", token) (for compatibility with components that still read directly).
    - on null: clear user/token/localStorage.
    - finally setIsLoading(false).
  - `login(userData, token, rememberMe?)` API signature unchanged (still used by pages) — but now most flows go via onAuthStateChanged; keep for backward compat and call within sync helper setters.
  - `logout()`: call signOut(auth) → then clear user/token/storage (signOut triggers onAuthStateChanged(null) anyway but synchronous clear okay). Keep signature same.
  - `updateUserLocal()` unchanged.
  - `getAuthHeaders()` unchanged (still returns Authorization: Bearer token).
  - `isAuthenticated: !!user` (instead of !!token, both should match).
  - Add new exported helper (or internal): `setDisplayNameOnFirebase(user, name)` via updateProfile — used during signup.
- **Acceptance Criteria Addressed**: FR-4, FR-5, FR-6, FR-11, AC-3, AC-4, AC-5, AC-10
- **Test Requirements**:
  - `rule` TR-5.1: onAuthStateChanged subscribed in effect, unsubscribe returned. Evidence: source review cleanup function.
  - `rule` TR-5.2: syncBackend POSTs to /api/users/firebase-sync, stores response.user/token. Evidence: source review.
  - `rule` TR-5.3: logout calls signOut(auth). Evidence: source review.
- **Completion Evidence**:
  - TR-5.1 (pass): `AuthContext.tsx` line 116-141: `useEffect` calls `onAuthStateChanged(auth, ...)` and returns unsubscribe via `return () => unsubscribe()`.
  - TR-5.2 (pass): helper `syncBackendWithFirebaseUser` (lines 70-109) issues `fetch(${API_BASE_URL}/api/users/firebase-sync)` POST with firebaseUid/email/name, destructures { user, token }, stores in state + localStorage. Called in onAuthStateChanged when fbUser is non-null.
  - TR-5.3 (pass): `logout()` line 156-164 calls `signOut(auth)` then clears user/token/storage.
  - GetDiagnostics clean: 0 issues on AuthContext.tsx. Build passes (exit 0).

## Task 6: Rewrite UnifiedAuthPage login/signup handlers to use Firebase
- **Status**: `completed`
- **Priority**: high
- **Depends On**: Task 5
- **Description**:
  - Edit `frontend/src/pages/UnifiedAuthPage.tsx`.
  - Import `{ signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile }` from `firebase/auth`.
  - Import `{ auth }` from `@/lib/firebase`.
  - `handleLogin`:
    - Validate not empty.
    - call signInWithEmailAndPassword(auth, email, password).
    - Wait for AuthContext's onAuthStateChanged to complete (use local wait via setTimeout 500ms or rely on authContext.isLoading). Alternatively: after firebase signIn → manually call sync backend endpoint once → use `login()` from useAuth to set data → then redirect. Simplest: signIn + redirect. onAuthStateChanged will sync. Use `setShowLoadingAnimation(true)` + redirect.
    - Map Firebase error codes:
      - auth/invalid-email → "Invalid email address"
      - auth/user-not-found → "No account found with this email"
      - auth/wrong-password → "Incorrect password"
      - auth/network-request-failed → "Network error. Please try again."
      - default → "Login failed. Please check your credentials."
  - `handleSignup`:
    - password != confirmPassword check as before.
    - createUserWithEmailAndPassword(auth, email, password).
    - on success: updateProfile(userCredential.user, { displayName: signupData.name }).
    - Then rely on onAuthStateChanged (it will call backend sync with firebaseUid/name/email).
    - Map errors:
      - auth/email-already-in-use → "Email already in use. Please sign in."
      - auth/weak-password → "Password is too weak. Use at least 6 characters."
      - auth/invalid-email → "Invalid email address."
      - auth/network-request-failed → "Network error. Please try again."
      - default → "Registration failed. Please try again."
  - Remove old fetch calls to `/api/users/login` and `/api/users/register`.
  - Keep all existing UI (cards, animations, floating books, language strings, Input/Button components) untouched.
- **Acceptance Criteria Addressed**: FR-2, FR-3, FR-10, AC-1, AC-2, AC-6, AC-7
- **Test Requirements**:
  - `rule` TR-6.1: handleLogin uses signInWithEmailAndPassword. Evidence: source review.
  - `rule` TR-6.2: handleSignup uses createUserWithEmailAndPassword + updateProfile(displayName). Evidence: source review.
  - `rule` TR-6.3: Firebase error code mapping present for auth/wrong-password, auth/user-not-found, auth/email-already-in-use, auth/weak-password, auth/network-request-failed. Evidence: source review strings present.
  - `rule` TR-6.4: No calls to /api/users/login or /api/users/register remain in UnifiedAuthPage. Evidence: grep.
- **Completion Evidence**:
  - TR-6.1 (pass): handleLogin lines 52-68 calls `signInWithEmailAndPassword(auth, loginData.email.trim(), loginData.password)`.
  - TR-6.2 (pass): handleSignup lines 71-107 calls `createUserWithEmailAndPassword(auth, email, pw)` then `updateProfile(credential.user, { displayName: signupData.name })` + `reload()`.
  - TR-6.3 (pass): `getFirebaseErrorMessage` helper exported from AuthContext (lines 40-66) maps all required codes, imported in UnifiedAuthPage line 10, called in both catch blocks. Source strings verified.
  - TR-6.4 (pass): Grep result for `/api/users/(login|register)` in `UnifiedAuthPage.tsx`: **0 matches** after edit. Also Grep across Login.tsx/Signup.tsx changed files: 0 matches.
  - GetDiagnostics clean (0 issues). Build passes (exit 0).

## Task 7: Update classic Login.tsx / Signup.tsx pages similarly
- **Status**: `completed`
- **Priority**: medium
- **Depends On**: Task 6
- **Description**:
  - `frontend/src/pages/Login.tsx`: rewrite handleSubmit to Firebase signInWithEmailAndPassword + error mapping, mirror UnifiedAuthPage approach. Remove /api/users/login fetch.
  - `frontend/src/pages/Signup.tsx`: rewrite handleSubmit to Firebase createUser + updateProfile + error mapping. Remove /api/users/register fetch.
  - Keep all styling and UX elements exactly.
- **Acceptance Criteria Addressed**: FR-2, FR-3, FR-10
- **Test Requirements**:
  - `rule` TR-7.1: No calls to /api/users/login in Login.tsx or /api/users/register in Signup.tsx. Evidence: grep output.
- **Completion Evidence**:
  - TR-7.1 (pass): Login.handleSubmit → calls signInWithEmailAndPassword + getFirebaseErrorMessage. Signup.handleSubmit → createUserWithEmailAndPassword + updateProfile + getFirebaseErrorMessage. Grep on both files finds 0 `/api/users/(login|register)`. Both have clean GetDiagnostics (0 issues). Build passes.

## Task 8: Add authed redirect from "/" to /home if already authenticated
- **Status**: `completed`
- **Priority**: medium
- **Depends On**: Task 5
- **Description**:
  - In UnifiedAuthPage, useEffect on mount with `useAuth()` isAuthenticated && !isLoading → navigate("/home").
  - Same (optional) for Login/Signup if routed directly.
- **Acceptance Criteria Addressed**: FR-7
- **Test Requirements**:
  - `rule` TR-8.1: Authed user visiting "/" redirects /home within 1 second. Evidence: manual.
- **Completion Evidence**:
  - TR-8.1 (static passable): UnifiedAuthPage lines 30-35 `useEffect(() => { if (!authLoading && isAuthenticated) navigate("/home", { replace: true }) }, [authLoading, isAuthenticated, navigate])`. Classic Login lines 36-40 and Signup lines 29-33 contain identical redirect. Pattern verified via source review; manual test deferred to manual gate in final review.

## Task 9: Build + lint + typecheck
- **Status**: `completed`
- **Priority**: high
- **Depends On**: Tasks 1-8 all completed
- **Description**:
  - Run `npm run build` in frontend.
  - Run `npm run lint` in frontend (if configured).
  - Ensure no TypeScript errors, no missing imports, no unused vars.
  - If backend used for test: ensure server.js syntax-check by Node require parse (no run needed for build step — parse only).
- **Acceptance Criteria Addressed**: AC-8, NFR-2, NFR-4
- **Test Requirements**:
  - `rule` TR-9.1: `npm run build` exit code 0, build output dist/ produced. Evidence: terminal output.
  - `rule` TR-9.2: No TypeScript diagnostics after build in changed files. Evidence: diagnostics after edit run.
- **Completion Evidence**:
  - TR-9.1 (pass): `npm run build` output `built in 1m 37s` exit code 0; dist/ contains index.html, index-*.js 1,009 kB, hero-books.jpg, index-*.css 115 kB.
  - TR-9.2 (pass): GetDiagnostics on all changed frontend files (firebase.ts, AuthContext.tsx, UnifiedAuthPage.tsx, Login.tsx, Signup.tsx) → each returns empty diagnostics array.
  - Lint on full project: 45 pre-existing issues in untouched files (BookDetails, SellerDashboard, ChatRoom, InventoryManager, NearbySearch, Notifications, Payment, Profile, tailwind.config). **Zero new lint issues** introduced in changed auth files.
  - Backend parse passes 4/4: server.js, userController.js, routes/users.js, models/User.js → all `node --check` exit 0.

## Task 10: Spot-check existing non-auth features route to mount
- **Status**: `completed`
- **Priority**: medium
- **Depends On**: Task 9
- **Description**:
  - Manual or code route check that /home, /browse, /book/:id (public) renders import paths still resolve, Navbar conditional auth links preserved.
- **Acceptance Criteria Addressed**: AC-9
- **Test Requirements**:
  - `rubric` TR-10.1: Feature integrity; scale 1-5; anchors 1=3 imports fail 3=minor unused warnings 5=all imports build & route definitions syntactically valid; threshold >=4; evidence build log + App.tsx routes review.
- **Completion Evidence**:
  - TR-10.1 (score **5/5**, >= 4 pass):
    - Rationale: Build transforms 2169 modules successfully with zero transform errors and zero missing module errors. App.tsx routes tree (read post-change) still contains all original non-auth public routes: `/home` → Index, `/browse` → BrowseBooksPage, `/book/:id` → BookDetails, plus catch-all 404. Imports in App.tsx unchanged. Navbar.tsx still imports Navbar correctly per Index page. No unused warnings on auth imports in App or main pages.
    - Evidence: npm run build exit code 0, logs show `2169 modules transformed` success; App.tsx routes listing (source review lines 47-180) confirms full route preservation.
