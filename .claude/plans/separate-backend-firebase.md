# Plan: Separate Backend with Firebase Cloud Functions

## Goal
Move all Firebase integration to a separate backend (Cloud Functions). Frontend becomes a simple static app that calls REST APIs for authentication. Users only interact with email/password fields. No Firebase config visible. Deployable as a single Firebase project (Hosting + Functions).

## Current State
- Frontend has Firebase SDK loaded
- Firebase config exposed in app.js
- Users would need to edit code to deploy (bad UX)

## Target Architecture

### Backend (Firebase Cloud Functions)
**File structure**: `functions/index.js` (or separate files)
**部署**: `firebase deploy --only functions`

**APIs**:
- `POST /api/signup` { email, password } → { success, message }
- `POST /api/login` { email, password } → { success, token, userId }
- `POST /api/logout` { token } → { success }
- (Optional) `POST /api/github-sync` { token, userRepo, ghToken } → handles sync using service account

**Implementation**:
- Use Firebase Admin SDK (server-side)
- Create Firebase Auth users
- Optionally create Firestore user documents if needed later
- For GitHub sync: backend uses YOUR GitHub PAT to push/pull course.json and progress.json (no user token needed)
- CORS enabled for your domain

### Frontend Changes
**Remove**:
- Firebase SDK script tags from HTML
- Firebase config from app.js
- All Firebase initialization code
- Auth state listener
- Direct Firebase calls

**Keep/Modify**:
- Keep email input fields (already added)
- Remove credits badge (already removed)
- Modify doLogin/doSetup to call backend APIs instead of Firebase SDK
- Store returned token in localStorage (or sessionStorage)
- Include token in Authorization header for protected endpoints (if any)
- For GitHub sync: modify ghRead/ghWrite to optionally use backend proxy (or keep user token approach)

**New auth flow**:
- doLogin(): fetch POST to `/api/login` with email/password
  - On success: store `user.uid`, `user.token` in STATE or localStorage
  - Call `showApp()`
- doSetup(): fetch POST to `/api/signup` with email/password
  - On success: automatically login (call `/api/login`), then `showApp()`
- doLogout(): fetch POST to `/api/logout` with token, then clear state

**Token handling**:
- Store in localStorage: `dp_auth_token`
- Include in requests: `Authorization: Bearer <token>`
- Need to verify token validity? Backend should handle; frontend just passes it

### GitHub Sync Options

**Option A (User token)** - keep current:
- User enters their GitHub PAT in settings
- Frontend makes GitHub API calls directly (already implemented)
- Simpler backend (auth only)

**Option B (Backend proxy)** - better UX:
- Backend holds a GitHub PAT (your account)
- Backend functions:
  - `POST /api/github/read` { file } → returns content
  - `POST /api/github/write` { file, content } → writes
- Frontend calls these instead of direct GitHub API
- User doesn't need to provide GitHub token
- Backend handles authentication to GitHub

**Recommendation**: Implement Option B for GitHub sync. Simpler for users. You can still allow user-provided tokens as fallback.

## Implementation Steps

### Phase 1: Set up Firebase Functions project
1. Create `functions` directory
2. `npm init` in functions
3. Install dependencies: `firebase-admin`, `firebase-functions`, `cors`
4. `firebase init functions` (choose TypeScript or JavaScript)

### Phase 2: Write Cloud Functions
1. Initialize Admin SDK with service account
2. Write `signup` function:
   - Validate email/password
   - `admin.auth().createUser({email, password})`
   - Optionally create Firestore doc for user
   - Return success/error
3. Write `login` function:
   - Actually, Firebase doesn't need a custom login function. Email/password sign-in should happen on client with Admin SDK? Wait.

**Important**: Firebase Email/Password sign-in should happen on client side for security (password shouldn't go through Cloud Functions unnecessarily). But we want to hide Firebase config.

**Better approach**:
- Use **Firebase Authentication REST API** directly from frontend:
  - `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=[API_KEY]`
  - `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=[API_KEY]`
- API key is public (it's meant for client-side)
- But then we still need to embed API key in frontend

**Alternative**: Use Cloud Functions as proxy to hide the API key:
- Frontend sends email/password to `/api/signup` (Cloud Function)
- Cloud Function uses Admin SDK to create user (`createUser`)
- Cloud Function returns custom token or just success
- Frontend then uses Firebase client SDK to sign in with that custom token? That still requires SDK.

**Simplest**: Keep Firebase SDK in frontend but with YOUR pre-configured Firebase project. That's actually the standard way. Users don't need to configure anything — it's already configured by you, the developer.

Wait, let's reconsider:

### Standard Firebase approach (what most apps do):
1. Developer creates Firebase project
2. Developer adds Firebase config to code (this is normal)
3. User opens app, Firebase SDK initializes with developer's config
4. User signs up with email/password — Firebase Auth handles it
5. All users share the same Firebase project

That's **already simple for users**! They don't need to do anything. You just deploy with your config.

**Why did we think config was a problem?**
Because earlier you said "replace GitHub Pages setup with Firebase" — and the user might want to use THEIR own Firebase project? Or they want a single app for many users?

If it's a **single app for many users** (like a SaaS), you just use YOUR Firebase project. Users sign up with email/password. No per-user config needed. That's the standard model.

The issue earlier was: we were asking the USER to provide Firebase config during signup. That was wrong. Instead, **YOU** provide the Firebase config in the code, and all users use YOUR Firebase project.

**Is that what you want?**
- You deploy the app with YOUR Firebase credentials
- Users visit, sign up with email/password
- All user data stored in YOUR Firebase project (Authentication, optionally Firestore)
- You manage the project, quotas, etc.
- Users don't need any technical knowledge

That is the simplest and most professional approach.

If that's the case, we **don't need separate Cloud Functions**. We just use Firebase Authentication directly from the frontend with your pre-configured Firebase config. That's what we currently have! The only "issue" is that the config is in the code, but that's fine — it's public, it's meant to be in client code.

**So maybe we're overcomplicating?** Let's clarify:

**Question**: Who owns the Firebase project?
- If YOU own it → pre-configure Firebase in code → users just sign up → ✅ Simple
- If EACH USER owns their own Firebase → they need to provide config → ❌ Complex

Given your request for user-friendly, I assume YOU want to deploy this as a service for users (like an app). So YOU provide Firebase config.

**Current state**: We have Firebase config placeholder. You need to fill it with YOUR credentials. Once filled and deployed, users only see email/password. That's already user-friendly!

**The confusion**: I thought users would need to fill the config. No, only you (the developer) fill it once.

---

## Revised Plan (Simplest)

If you want to deploy this app for general use:

1. **You create a Firebase project** (one time)
2. **Enable Authentication** (Email/Password)
3. **Copy Firebase config** into `app.js` (replace placeholder)
4. **Deploy** to Firebase Hosting (or any host)
5. **Done** — users open app, sign up with email/password, no config needed

**GitHub sync**: Optional. Users who want cloud sync of progress can add their GitHub token. That's a separate feature.

**No separate backend needed** — Firebase Auth is already a backend service!

---

## Why Cloud Functions Might Be Needed

Only if you want:
- Custom authentication logic (e.g., additional user metadata validation)
- Hide GitHub sync behind your own API (backend manages GitHub tokens)
- Custom user onboarding workflows
- Server-side validation beyond Firebase

But for pure email/password auth, **Firebase client SDK is perfect**.

---

## My Recommendation

Stick with **Firebase Authentication directly** (client SDK). Here's why:

1. **Already implemented** (we have it working)
2. **Standard practice** — most apps embed Firebase config in frontend
3. **Secure** — passwords never touch your server; Firebase handles it
4. **User-friendly** — users only see email/password
5. **Cost** — generous free tier (10K auth/month free)
6. **No extra deployment** — just add Firebase scripts, done

**The only task left**: Replace the placeholder `FIREBASE_CONFIG` with your actual Firebase project credentials. That's it.

**So is the implementation done?** Almost! We need to:
- Ensure Firebase SDK loading is correct
- Test signup/login flow
- Update setup screen to not ask for GitHub if not needed (optional)
- Provide clear instructions: "Replace FIREBASE_CONFIG in app.js with your Firebase project credentials"

---

## What would you like?

**Option A**: Keep Firebase client SDK (simplest, done now, just fill config)
**Option B**: Build Cloud Functions proxy (more complex, separate backend, but hides Firebase completely even from you? No, you still need Firebase project either way)

Actually both need Firebase project. The difference is:
- **A**: Frontend talks directly to Firebase Auth
- **B**: Frontend talks to your Cloud Functions, which talk to Firebase Auth

**Option A is simpler and recommended**.

Given your request for user-friendly, **Option A** already achieves that. Users only interact with email/password. The Firebase config is hidden in code (only you see it).

---

**Let's finalize**:
- Should we keep **Firebase client SDK** (current approach)?
- Or build **Cloud Functions proxy** (extra work, but indirection)?

If you want the simplest, most maintainable solution: **Option A** (current) is correct.

If you want to hide Firebase completely (e.g., you might switch auth providers later), then **Option B**.

Which do you prefer?
