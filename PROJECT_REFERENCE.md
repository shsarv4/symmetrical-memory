# SwatiArc - Complete Project Master Reference

**Purpose**: Single source of truth for understanding the entire SwatiArc Learning Tracker project. Contains architecture, setup, deployment, code patterns, fixes applied, and complete workflow. For developers (including future Claude sessions) who need full context.

**Last Updated**: March 29, 2026
**Version**: 3.0 (MERN + Firebase)
**Status**: Production Ready

---

## 📋 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Configuration](#configuration)
4. [Authentication & Authorization](#authentication--authorization)
5. [Theme System](#theme-system)
6. [API Endpoints](#api-endpoints)
7. [Database Schema](#database-schema)
8. [Critical Fixes Applied](#critical-fixes-applied)
9. [Known Issues & Solutions](#known-issues--solutions)
10. [Development Workflow](#development-workflow)
11. [Deployment Guide](#deployment-guide)
12. [Troubleshooting](#troubleshooting)
13. [Code Patterns](#code-patterns)
14. [Files to Watch](#files-to-watch)

---

## Architecture Overview

**Stack**: React 19 + Vite + Express 4 + Firebase (Auth, Firestore, Hosting, Functions)

**Deployment**: Firebase Hosting (frontend) + Cloud Functions (backend). SPA with API rewrites.

**Data Flow**:
```
User → React App (frontend/build) → Express API (Cloud Function) → Firestore
         ↑                               ↑
   Firebase Hosting               Firebase Auth (ID tokens)
```

**Key Design Decisions**:
- Backend serves built frontend in development (`server.js` line 90-106)
- Frontend fetches Firebase config from `/api/config` (no config in frontend code)
- All API routes (except `/api/config` and `/api/gemini/test`) require Firebase auth
- Admin routes additionally check Firestore `users/{uid}.role === 'admin'`
- Theme system uses CSS variables updated via React Context
- Course content fully dynamic via Firestore `modules` collection

---

## Project Structure

```
project-root/
├── .claude/                       # Claude Code memory (DO NOT DELETE)
│   ├── plans/                    # Implementation plans
│   ├── settings.local.json      # User preferences
│   └── worktrees/               # Git worktrees
│
├── config.json                   # ⚠️  SECRETS - Firebase config + service account + OpenRouter key
├── config.example.json           # Template for config.json
├── firebase.json                 # Firebase Hosting + Functions config
├── .firebaserc                   # Firebase project alias
├── .gitignore                    # Excludes config.json, node_modules, etc.
├── README.md                     # User-facing guide
└── PROJECT_REFERENCE.md         # Quick dev reference (this file is master)
│
├── frontend/                     # React + Vite app
│   ├── index.html               # HTML entry
│   ├── index.css                # Global styles (2800+ lines)
│   ├── package.json             # Dependencies
│   ├── vite.config.js           # Vite config (proxy /api to localhost:3000)
│   ├── build/                   # Production build (generated)
│   │   ├── index.html
│   │   ├── assets/
│   │   └── course.json          # Bundled course data (fallback)
│   ├── src/
│   │   ├── main.jsx             # React entry (renders App with providers)
│   │   ├── App.jsx              # Router + ProtectedRoute + AdminRoute
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx  # Firebase auth state + login/logout
│   │   │   └── ThemeContext.jsx # Theme state (themeName, mode, toggleMode)
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── LoginScreen.jsx   # Lock screen with floating hearts
│   │   │   │   └── SetupScreen.jsx   # Registration form
│   │   │   ├── layout/
│   │   │   │   ├── Header.jsx        # Topbar: logo, theme toggle, admin link, logout
│   │   │   │   ├── Sidebar.jsx       # Module list navigation
│   │   │   │   └── Layout.jsx        # Main wrapper (Header+Sidebar+main)
│   │   │   ├── modules/
│   │   │   │   ├── ModuleList.jsx    # Grid of ModuleCard components
│   │   │   │   ├── ModuleCard.jsx    # Individual card with 3D tilt effect
│   │   │   │   └── ModuleDetail.jsx  # Module view: topics, resources, exercises, notes
│   │   │   ├── admin/
│   │   │   │   ├── AdminPanel.jsx       # Dashboard stats + user management + AI model
│   │   │   │   ├── AdminModules.jsx     # CRUD interface for modules
│   │   │   │   └── AdminAnnouncements.jsx # CRUD for announcements
│   │   │   └── common/
│   │   │       ├── AnnouncementBanner.jsx  # Carousel banner (dismissible)
│   │   │       ├── ParticleBackground.jsx  # Floating particle animation
│   │   │       ├── ThemeSelector.jsx       # Modal theme picker (4 themes)
│   │   │       ├── GeminiChatbot.jsx       # AI assistant chat widget
│   │   │       ├── ProgressDashboard.jsx   # User progress stats widget
│   │   │       ├── FloatingShapes.jsx      # Background gradient shapes
│   │   │       ├── Spotlight.jsx           # Mouse-following spotlight effect
│   │   │       └── CountUp.jsx             # Animated number counter
│   │   ├── services/
│   │   │   ├── api.js           # Generic fetch wrapper (adds auth token)
│   │   │   ├── moduleService.js # Module CRUD API calls
│   │   │   ├── announcementService.js
│   │   │   ├── adminService.js  # Admin stats, user management
│   │   │   ├── authService.js   # login(), register()
│   │   │   ├── modelService.js  # AI model get/set
│   │   │   └── configService.js # fetch('/api/config')
│   │   ├── utils/
│   │   │   └── constants.js     # THEMES object (4 themes × light/dark)
│   │   └── assets/              # Images, icons
│   └── public/
│       ├── course.json          # Original course data (legacy, migrated to Firestore)
│       ├── favicon.svg
│       └── icons.svg
│
├── backend/                      # Express API server
│   ├── server.js                # Main entry: Express app + Cloud Function export
│   ├── package.json             # Dependencies: express, firebase-admin, cors, etc.
│   ├── src/
│   │   └── config.js            # Config loader (local config.json or Functions.config())
│   ├── firebase/
│   │   └── admin.js             # Firebase Admin SDK init (with service account)
│   ├── middleware/
│   │   ├── auth.js              # verifyFirebaseToken(req, res, next)
│   │   └── admin.js             # verifyAdmin(req, res, next) - checks Firestore role
│   ├── routes/
│   │   ├── modules.js           # GET (public read), POST/PUT/DELETE (admin only)
│   │   ├── announcements.js     # GET / (active), GET /all (admin), POST/PUT/DELETE (admin)
│   │   ├── admin.js             # stats, users list, user details, role change, ai-model
│   │   ├── progress.js          # GET/POST user progress tracking
│   │   └── gemini.js            # AI chat via OpenRouter streaming
│   └── scripts/
│       └── migrate-course.js    # One-time: import course.json to Firestore modules
│
└── functions/                    # Firebase Cloud Functions wrapper
    ├── package.json             # Subset of backend deps (for deployment)
    └── index.js                 # Exports Express app as Cloud Function
```

---

## Configuration

### config.json (Project Root) - KEY FILE

**Structure**:
```json
{
  "firebase": {
    "apiKey": "...",
    "authDomain": "...",
    "projectId": "...",
    "storageBucket": "...",
    "messagingSenderId": "...",
    "appId": "..."
  },
  "serviceAccount": { /* full JSON from downloaded key file */ },
  "backend": {
    "port": 3000,
    "corsOrigins": ["http://localhost:3000", "http://localhost:5173"]
  },
  "app": {
    "apiBaseUrl": ""
  },
  "openrouter": {
    "apiKey": "sk-or-...",
    "model": "anthropic/claude-3.5-sonnet"
  }
}
```

**How to Get Values**:
1. `firebase.*` → Firebase Console → Project Settings → "Your apps" → Web app config (copy `firebaseConfig` object)
2. `serviceAccount` → Firebase Console → Project Settings → "Service accounts" → "Generate new private key" → download JSON → paste entire object
3. `openrouter.apiKey` → OpenRouter.ai → Create account → API Keys

**Location**: Must be at project root (same level as `backend/`, `frontend/`). Backend loads via `backend/src/config.js` with path `../../config.json`.

**Important**: `config.json` is in `.gitignore` - never commit secrets!

---

## Authentication & Authorization

### Authentication Flow

1. **Frontend**: User enters email/password in `LoginScreen.jsx`
2. **Firebase Auth**: `auth.signInWithEmailAndPassword(email, password)` from `firebase.js`
3. **Token**: Firebase returns ID token (JWT)
4. **API Calls**: `api.js` helper attaches `Authorization: Bearer <token>` to all requests
5. **Backend**: `verifyFirebaseToken` middleware validates token via `getAuth().verifyIdToken(idToken)`
6. **User attached**: `req.user = { uid, email, emailVerified }`

### Authorization (Admin Routes)

**Two layers**:

**Layer 1 - Frontend Route Guard** (`App.jsx` `AdminRoute` component):
```javascript
// Calls fetchAdminUser(user.uid) from adminService.js
// If response.user.role === 'admin', renders admin route
// This is UX only - not secure
```

**Layer 2 - Backend Middleware** (`backend/routes/admin.js` + `backend/middleware/admin.js`):
```javascript
// verifyAdmin middleware:
// 1. Gets uid from req.user.uid (set by verifyFirebaseToken)
// 2. Queries Firestore: db.collection('users').doc(uid).get()
// 3. Checks userDoc.data().role === 'admin'
// 4. If not admin → 403
```

**Critical**: Backend is authoritative. Even if frontend shows admin UI, backend will reject non-admin requests.

### Making a User Admin

**Manual method** (no admin panel access initially):
1. Create user via app (Firebase Auth automatically creates user)
2. Get Firebase UID from Firebase Console → Authentication → Users → copy UID
3. Go to Firestore Database → Create collection `users` (if doesn't exist)
4. Create document with ID = UID
5. Add fields:
   ```json
   {
     "email": "user@example.com",
     "role": "admin",
     "displayName": "Name",
     "createdAt": timestamp (auto),
     "lastLogin": timestamp (auto)
   }
   ```
6. Refresh app → Admin button appears

---

## Theme System

### How Themes Work

**State** (`ThemeContext.jsx`):
- `themeName`: 'lavender' | 'peach' | 'mint' | 'rose'
- `mode`: 'light' | 'dark'

**Persistence**:
- `localStorage` keys: `'dp_theme'`, `'dp_mode'`
- Initial state reads from localStorage with fallbacks

**CSS Application** (`ThemeContext.jsx` useEffect):
1. Look up `THEMES[themeName][mode]` from `constants.js`
2. For each color key (camelCase), convert to kebab-case and set `--key` on `:root`
3. Set `data-theme` and `data-mode` attributes on `<html>`

**Theme Colors** (`frontend/src/utils/constants.js`):
```javascript
THEMES = {
  lavender: {
    light: { bg, bg2, bg3, lavender, lavender2, lavender3, pink, pink2, ... },
    dark: { ... }
  },
  peach: { light, dark },
  mint: { light, dark },
  rose: { light, dark }
}
```

**Default Theme**: `'lavender'` (was `'pastelPop'` which caused crashes - FIXED)

**Color Palette** (post-vibrant-update):
- Accent colors: Purple `#8b5cf6`, Pink `#ec4899`, Mint `#10b981`, Gold `#f59e0b`, Sky `#0ea5e9`, Rose `#f43f5e`
- All themes share these vibrant accents (only background gradients differ)

---

## API Endpoints

### Public (with Firebase Auth required except where noted)

All routes prefixed `/api` (except static frontend files).

**No Auth Required**:
- `GET /api/config` - Returns Firebase config for frontend initialization
- `GET /api/gemini/test` - Test AI connectivity (public health check)

**Auth Required** (`verifyFirebaseToken` applied):
- `GET /api/modules` - List all modules (ordered by `order`)
- `GET /api/modules/:id` - Get single module
- `GET /api/announcements` - Get active announcements (filters by `active: true` and date range)
- `POST /api/progress` - Save user progress (body: `{ progress: { topicId: true, ... } }`)
- `GET /api/progress` - Load user progress
- `POST /api/gemini/chat` - Send message, get streaming AI response
- `GET /api/gemini/conversations` - Load user's chat history
- `POST /api/gemini/conversations/clear` - Clear chat history

**Admin Only** (`verifyFirebaseToken` + `verifyAdmin`):
- `POST /api/modules` - Create module
- `PUT /api/modules/:id` - Update module
- `DELETE /api/modules/:id` - Delete module
- `POST /api/announcements` - Create announcement
- `GET /api/announcements/all` - Get all announcements (including inactive)
- `PUT /api/announcements/:id` - Update announcement
- `DELETE /api/announcements/:id` - Delete announcement
- `GET /api/admin/stats` - Dashboard: total users, modules, active announcements, users with progress
- `GET /api/admin/users` - List all users (ordered by createdAt desc)
- `GET /api/admin/users/:uid` - Get user details (self or any user if admin)
- `PUT /api/admin/users/:uid/role` - Change user role (admin ↔ user)
- `GET /api/admin/ai-model` - Get current AI model setting
- `PUT /api/admin/ai-model` - Update AI model (saves to Firestore `appSettings/aiModel`)

**Response Format** (all endpoints):
```json
{
  "success": true,
  "data": {...}  // or specific fields like "module", "modules", "stats", etc.
}
```

**Error Format**:
```json
{
  "error": "Error message"
}
```

---

## Database Schema

### Collections

**modules**
```javascript
{
  id: string,              // Firestore doc ID (also stored as field for convenience)
  title: string,           // e.g., "Python Programming"
  subtitle: string,        // e.g., "Basics → OOP → File Handling"
  icon: string,            // emoji, e.g., "🐍"
  accent: string,          // hex color for module card
  topics: [
    {
      id: string,
      title: string,
      subtopics: [string]  // array of subtopic strings
    }
  ],
  resources: [
    { type: "video"|"link"|"doc", label: string, title: string, url: string }
  ],
  exercises: [
    { title: string, url: string, desc?: string }
  ],
  order: number,           // display order (lower = earlier)
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**announcements**
```javascript
{
  id: string,
  title: string,
  message: string,
  type: "info" | "warning" | "success" | "update",
  active: boolean,
  startDate?: Timestamp,   // optional - announcement starts showing from this date
  endDate?: Timestamp,     // optional - announcement stops showing after this date
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**users** (document ID = Firebase UID)
```javascript
{
  uid: string,             // Firebase Auth UID (same as doc ID)
  email: string,
  role: "admin" | "user",
  displayName?: string,
  photoURL?: string,
  createdAt: Timestamp,
  lastLogin: Timestamp,
  progress: {              // user's learning progress
    "t_<topicId>": true,           // topic completed
    "s_<topicId>_<index>": true,  // subtopic completed
    "e_<moduleId>_<index>": true, // exercise completed
    "notes_<moduleId>": "text..."  // notes for module
  }
}
```

**appSettings** (optional)
```javascript
{
  aiModel: "anthropic/claude-3.5-sonnet"  // OpenRouter model ID
}
```

**geminiConversations** (document ID = user UID)
```javascript
{
  conversations: [
    {
      userMessage: string,
      aiResponse: string,
      context: object,
      timestamp: Timestamp
    }
  ],
  lastUpdated: Timestamp
}
```

**Indexes** (`firestore.indexes.json`):
- `announcements`: composite index on `active ASC, createdAt DESC`

---

## Critical Fixes Applied

These are MUST-KEEP fixes that resolved critical bugs:

### 1. Theme Modal Not Opening
**File**: `frontend/src/components/common/ThemeSelector.jsx:15`
**Problem**: Modal overlay had `className="modal-ov"` but CSS required `.modal-ov.open` to display.
**Fix**: Changed to `className="modal-ov open"` and removed inline `display: 'flex'`.
**Impact**: Theme selector modal now opens when clicking palette icon.

### 2. App Crash on Load (Missing Theme)
**Files**: `frontend/src/contexts/ThemeContext.jsx:7, 28`
**Problem**: Default theme `'pastelPop'` didn't exist in `THEMES` object → `undefined` → errors.
**Fix**: Changed default to `'lavender'` (valid theme). Also added fallback in error handler to reset to `'lavender'`.
**Impact**: App no longer crashes if localStorage has invalid theme.

### 3. Admin Route Security Vulnerability
**File**: `backend/routes/admin.js:115-171` (specifically lines 144-150)
**Problem**: Code was using `verifyAdmin` middleware in callback pattern `await verifyAdmin(req, res, async () => { ... })`, but `verifyAdmin` doesn't work that way (it expects `next()` callback, not returning a promise). This meant admin checks were bypassed for user profile endpoint.
**Fix**: Replaced with direct Firestore query checking admin role before proceeding:
```javascript
if (req.user.role !== 'admin') {
  const userDoc = await db.collection('users').doc(req.user.uid).get();
  if (!userDoc.exists || userDoc.data()?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
}
```
**Impact**: Admin-only endpoints now properly enforce role checks. Critical security fix.

### 4. Vibrant Color Enhancement
**File**: `frontend/src/utils/constants.js`
**Problem**: Pastel colors (e.g., `#c8b6ff`, `#f8c8dc`) looked dull compared to Pinterest inspiration.
**Fix**: Updated all accent colors to vibrant equivalents across all 4 themes (light and dark variants):
- Lavender: `#8b5cf6` (purple 500)
- Pink: `#ec4899` (pink 500)
- Mint: `#10b981` (emerald 500)
- Gold: `#f59e0b` (amber 500)
- Sky: `#0ea5e9` (sky 500)
- Rose: `#f43f5e` (rose 500)
**Impact**: Modern, bold, eye-catching aesthetic.

---

## Known Issues & Solutions

### Issue: Backend Won't Start
**Symptoms**: Error about config not found or invalid service account.

**Checklist**:
- ✅ `config.json` exists at project root (not in `backend/`)
- ✅ `config.json` is valid JSON (no trailing commas, proper quotes)
- ✅ `serviceAccount.private_key` is complete multi-line string (includes `\n`)
- ✅ Run `npm install` in `backend/` first
- ✅ Port 3000 not in use

**Debug**: Backend logs:
- `✅ Configuration loaded from config.json` → config OK
- `❌ Configuration not found` → check path/permissions

### Issue: Firebase Auth 400 Bad Request
**Symptoms**: Login/register fails with `auth/invalid-credential` or 400.

**Fixes**:
- ✅ Enable Email/Password in Firebase Console → Authentication → Sign-in methods
- ✅ Verify `firebase.*` fields in `config.json` match Firebase project settings exactly
- ✅ `apiKey` is from Web app config (not Admin SDK)
- ✅ Restart backend after config changes

### Issue: Frontend API Calls 401/403
**Symptoms**: Modules don't load, progress save fails.

**Checklist**:
- ✅ User is logged in (check top-right Firebase icon)
- ✅ For admin endpoints: user has `role: "admin"` in Firestore `users/{uid}`
- ✅ CORS: `backend.corsOrigins` includes frontend URL (localhost:5173 for Vite, localhost:3000 for backend-served)
- ✅ Auth token not expired (logout/login again)

### Issue: Theme Not Applying
**Symptoms**: Colors don't change when selecting theme or toggling day/night.

**Checklist**:
- ✅ `<ThemeProvider>` wraps `<AppRoutes>` in `App.jsx` (it does)
- ✅ `ThemeContext` properly providing values
- ✅ Check browser DevTools → `:root` element has CSS variables (`--lavender`, `--bg`, etc.)
- ✅ Check `data-theme` and `data-mode` attributes on `<html>`
- ✅ No JavaScript errors in console from `ThemeContext`

### Issue: Announcements Not Showing
**Symptoms**: Banner carousel empty or not appearing.

**Checklist**:
- ✅ Announcements exist in Firestore with `active: true`
- ✅ Current date within `startDate`/`endDate` range if specified
- ✅ `type` is one of: `info`, `warning`, `success`, `update`
- ✅ Dismissed announcements stored in `sessionStorage` - clear to reset
- ✅ `AnnouncementBanner` component present in `Layout.jsx`

### Issue: AI Chatbot Not Responding
**Symptoms**: Chat input shows error or no response.

**Checklist**:
- ✅ OpenRouter API key in `config.json` → `openrouter.apiKey`
- ✅ Key is valid (test at openrouter.ai)
- ✅ Backend logs: should show OpenRouter connection
- ✅ Test endpoint: `GET /api/gemini/test` should return success
- ✅ User is authenticated (chat endpoint requires auth)

---

## Development Workflow

### Local Setup (First Time)

1. **Install dependencies**:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Create Firebase project**:
   - Enable Authentication (Email/Password)
   - Create Firestore database
   - Get Web app config (`firebaseConfig` object)
   - Generate service account key (JSON)

3. **Create `config.json`** at project root:
   ```bash
   cp config.example.json config.json
   # Edit with your Firebase credentials and service account
   ```

4. **Start backend**:
   ```bash
   cd backend
   npm run dev
   # Should log: "✅ Configuration loaded from config.json"
   # Server: http://localhost:3000
   ```

5. **Start frontend** (optional):
   ```bash
   cd frontend
   npm run dev
   # Dev server: http://localhost:5173 (proxies /api to localhost:3000)
   ```

6. **Or use backend-served frontend**:
   - Backend automatically serves `frontend/` directory
   - Open http://localhost:3000 directly

7. **Create first admin user** (see "Admin Setup" in README)

### Daily Development

```bash
# Terminal 1: Backend (auto-restart on changes)
cd backend
npm run dev

# Terminal 2: Frontend (HMR)
cd frontend
npm run dev
```

**Making changes**:
- Frontend: Edit files in `frontend/src/` → Vite hot reloads
- Backend: Edit files in `backend/` → nodemon restarts
- No need to rebuild frontend for dev (Vite serves source)

### Building for Production

```bash
cd frontend
npm run build
# Output: frontend/build/ (index.html + assets)

# Backend will serve these files when running locally (server.js line 90)
```

---

## Deployment Guide

### Pre-Deployment Checklist

- [ ] `config.json` updated with production Firebase credentials (or plan to use Functions config)
- [ ] OpenRouter API key set (if using AI chatbot)
- [ ] Firebase project created
- [ ] `firebase login` completed
- [ ] `firebase use --add` selected correct project
- [ ] Firebase services enabled: Authentication, Firestore, Hosting, Functions
- [ ] Firestore indexes deployed (`firebase deploy --only firestore`) - takes 2-3 minutes
- [ ] Build frontend: `cd frontend && npm run build`
- [ ] Test locally: `cd backend && npm run dev` → verify all features
- [ ] Create admin user in Firestore (if not done)

### Deploy to Firebase

**Option 1: Deploy everything**:
```bash
firebase deploy
```

**Option 2: Staged deployment** (recommended for control):
```bash
# 1. Deploy Firestore indexes first (they take time to build)
firebase deploy --only firestore
# Wait ~2 minutes for indexes to show "Enabled" in Firebase Console

# 2. Deploy Cloud Functions (backend)
firebase deploy --only functions

# 3. Deploy Hosting (frontend)
firebase deploy --only hosting
```

### Production Configuration

**Method A: Use config.json (simpler for small projects)**:
- Commit `config.json` to repository (⚠️ ONLY if repo is private!)
- Backend will load it directly
- Note: `functions/` package.json must include all backend dependencies

**Method B: Use Firebase Functions config (more secure)**:
```bash
firebase functions:config:set \
  firebase.api_key="..." \
  firebase.auth_domain="..." \
  firebase.project_id="..." \
  firebase.storage_bucket="..." \
  firebase.messaging_sender_id="..." \
  firebase.app_id="..." \
  openrouter.api_key="sk-or-..." \
  openrouter.model="anthropic/claude-3.5-sonnet"
```

Backend `config.js` automatically uses `functions.config()` in Cloud Functions environment.

**Important**: `backend/package.json` must have ALL dependencies (not just production ones) because Functions deploy uploads `node_modules`. Currently includes: express, firebase-admin, firebase-functions, cors, express-rate-limit, @google/generative-ai.

### Post-Deployment

1. **Verify functions deployed**:
   ```bash
   firebase functions:list
   ```

2. **Test live site**:
   - Open your Firebase Hosting URL
   - Try login/register
   - Check that modules load
   - Verify admin panel (if you set admin role)

3. **View logs**:
   ```bash
   firebase functions:log
   ```

4. **Set up monitoring** (optional):
   - Firebase Console → Functions → View in Google Cloud
   - Set up error reporting, alerts

---

## Debugging & Troubleshooting

### Quick Diagnosis Flow

**Backend not starting**:
1. Check `config.json` exists and valid JSON
2. Verify `serviceAccount.private_key` is complete (multi-line)
3. `cd backend && npm install`
4. Check port 3000 free

**Auth errors**:
1. Firebase Console → Authentication → Enable Email/Password
2. Verify `firebase.*` config in `config.json` matches project
3. Check API key is from Web app config, not service account

**Admin access denied**:
1. Firestore → `users/{uid}` document exists?
2. Document has field `role: "admin"` (string, not boolean)
3. User is logged in with same UID

**Theme broken**:
1. `ThemeContext.jsx` exports `ThemeProvider` - wraps `AppRoutes` in `App.jsx`
2. `constants.js` has `THEMES[themeName][mode]` defined
3. Check browser DevTools → :root has CSS variables
4. No JS errors related to theme

**Build errors**:
1. `cd frontend && npm install`
2. Delete `frontend/node_modules/.vite` if exists
3. `npm run build` fresh

### Useful Commands

```bash
# Check backend logs (when running locally)
cd backend
# Just run with npm run dev - logs go to console

# Check Firestore data
firebase firestore:data:get users
firebase firestore:data:get modules

# Test API endpoint locally (no auth)
curl http://localhost:3000/api/config

# Test with auth (need Firebase ID token)
# Get token from browser console after login:
# firebase.auth().currentUser.getIdToken()
curl -H "Authorization: Bearer TOKEN" http://localhost:3000/api/modules

# Clear all Firestore data (⚠️ DESTRUCTIVE)
firebase firestore:delete --recursive modules
firebase firestore:delete --recursive announcements
# Keep users if desired

# Rollback to previous commit
git log --oneline  # copy SHA
git reset --hard <SHA>
cd frontend && npm run build
cd backend && npm start  # or redeploy

# View Cloud Function logs
firebase functions:log --only <functionName>
# functionName is "backend" (from functions/index.js)
```

---

## Code Patterns

### Middleware Chain

**In `server.js`**:
```javascript
// Public route (no middleware)
app.get('/api/config', ...);

// Protected routes - verifyFirebaseToken applied at mount
app.use('/api/modules', verifyFirebaseToken, modulesRoutes);
app.use('/api/announcements', verifyFirebaseToken, announcementsRoutes);
app.use('/api/admin', verifyFirebaseToken, adminRoutes);
app.use('/api/progress', verifyFirebaseToken, progressRoutes);

// Note: gemini routes have special structure (test endpoint public, others auth)
```

**Inside admin routes** (`backend/routes/admin.js`):
```javascript
// Route itself may have additional verifyAdmin middleware
router.get('/stats', verifyAdmin, async (req, res) => { ... });

// Or inline check for nuanced scenarios (like user profile endpoint):
router.get('/users/:uid', async (req, res) => {
  // Users can view own profile without admin check
  if (req.user.uid === uid) { ... return; }

  // For other users, require admin
  if (req.user.role !== 'admin') {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    if (!userDoc.exists || userDoc.data()?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
  }
  // Admin viewing another user
  ...
});
```

### Theme Context Usage

**State**:
```javascript
const { themeName, mode, setTheme, toggleMode, colors } = useTheme();
```

**Applying theme to component**:
```javascript
<div style={{
  background: colors.lavender,
  color: colors.txt,
  border: `1px solid ${colors.border}`
}}>
```

**Theme colors source**: `colors` object from `ThemeContext` comes from `THEMES[themeName][mode]`. Keys: `lavender`, `pink`, `mint`, `gold`, `sky`, `rose`, `txt`, `txt2`, `txt3`, `border`, `border2`, `card`, `bg`, `bg2`, `bg3`, etc.

### Firebase Timestamps

**Writing**:
```javascript
createdAt: admin.firestore.FieldValue.serverTimestamp()
updatedAt: admin.firestore.FieldValue.serverTimestamp()
```

**Reading**:
```javascript
const data = doc.data();
const createdAt = data.createdAt?.toDate?.()?.toISOString() || data.createdAt;
```
The `?.toDate?.()` handles both Timestamp objects and ISO strings (for backward compatibility).

### API Fetch Pattern

**Standard authenticated fetch** (`frontend/src/services/api.js`):
```javascript
export async function fetchWithAuth(endpoint, options = {}) {
  const user = auth.currentUser;
  const token = await user.getIdToken();
  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  });
  return response.json();
}
```

---

## Files to Watch (Critical)

If something breaks, check these files first:

**Frontend**:
- `frontend/src/contexts/ThemeContext.jsx` - Theme state and CSS application
- `frontend/src/utils/constants.js` - Theme color definitions
- `frontend/src/components/common/ThemeSelector.jsx` - Modal (check `open` class)
- `frontend/src/App.jsx` - Route definitions and guards
- `frontend/src/components/layout/Header.jsx` - Theme toggle button

**Backend**:
- `backend/src/config.js` - Config loading logic (local vs Functions)
- `backend/server.js` - Middleware mounting, static file serving
- `backend/firebase/admin.js` - Firebase initialization
- `backend/middleware/auth.js` - Token verification
- `backend/middleware/admin.js` - Role verification
- `backend/routes/admin.js` - Admin endpoints (security critical)

**Configuration**:
- `config.json` (project root) - All credentials
- `firebase.json` - Hosting rewrites (ensure `/api/**` → function)

---

## Testing Checklist

### Backend API
- [x] GET `/api/modules` returns ordered list
- [x] GET `/api/modules/:id` returns single module with topics
- [x] POST `/api/modules` (admin) creates module
- [x] PUT `/api/modules/:id` (admin) updates module
- [x] DELETE `/api/modules/:id` (admin) deletes module
- [x] GET `/api/announcements` returns only active + date-valid announcements
- [x] POST `/api/announcements` (admin) creates announcement
- [x] GET `/api/announcements/all` (admin) returns all
- [x] GET `/api/admin/stats` (admin) returns counts
- [x] GET `/api/admin/users` (admin) returns user list
- [x] PUT `/api/admin/users/:uid/role` (admin) changes role
- [x] GET/POST `/api/progress` (auth) saves/loads progress
- [x] GET `/api/gemini/test` (public) returns AI status
- [x] POST `/api/gemini/chat` (auth) streams response

### Frontend Features
- [x] Login/register works
- [x] Modules display in grid
- [x] Module detail: topics expand/collapse, resources/exercises links, notes auto-save
- [x] Progress checkboxes update Firestore
- [x] Theme modal opens and switches themes
- [x] Day/night toggle works
- [x] Announcement banner shows active announcements, carousel works, dismiss works
- [x] Admin button visible only to admins
- [x] Admin modules CRUD works
- [x] Admin announcements CRUD works
- [x] Admin user management role toggle works
- [x] Particle background animates
- [x] Responsive: sidebar mobile toggle

---

## Performance & Optimization

- **Build size**: ~87KB gzipped (frontend)
- **Code splitting**: Vite default chunking (consider lazy loading routes if needed)
- **Images**: Use SVG icons where possible (inline or as assets)
- **Animations**: CSS keyframes + requestAnimationFrame (CountUp)
- **API calls**: Debounced/saved appropriately (notes auto-save on change)

---

## Security Considerations

- **Firebase Auth**: All user data scoped by `uid`. Users can only modify their own progress.
- **Admin routes**: Both frontend guard AND backend middleware check admin role.
- **Service account**: Keep `config.json` out of version control (`.gitignore`).
- **OpenRouter keys**: Treated as secrets (in `config.json` or Functions config).
- **CORS**: Configured from `config.json` → only allowed origins.
- **Rate limiting**: Currently disabled (commented out in `server.js` line 69-78). Enable in production if needed.

---

## Future Enhancements

Potential improvements (not implemented):
- Lazy loading routes for faster initial load
- Image optimization/compression pipeline
- Advanced admin analytics dashboard
- Bulk course import via CSV/JSON
- User profile customization (avatar, preferences)
- Push notifications for new announcements
- Offline mode with service worker
- Multi-language support

---

## Emergency Procedures

**Backend down / errors**:
1. Check logs: `firebase functions:log`
2. Rollback: `git reset --hard <previous-commit>` + redeploy
3. Verify config: `config.json` or Functions config

**Data corruption**:
1. Firestore backups: Use Firebase Console → Firestore → Data → Export/Import
2. Restore from backup
3. Re-run `migrate-course.js` if modules lost

**Feature broken after deploy**:
1. Verify build: `cd frontend && npm run build` (no errors)
2. Check Firebase hosting: Files actually updated?
3. Check Functions logs for runtime errors
4. Rollback to previous version if needed

**User locked out / need to revoke admin**:
1. Manually edit Firestore `users/{uid}` → set `role: "user"`
2. Or use Firebase CLI: `firebase firestore:set users/<uid> '{"role":"user"}'`

---

## Contact & Support

- **Project Repository**: [link if hosted]
- **Firebase Console**: https://console.firebase.google.com/
- **OpenRouter**: https://openrouter.ai/
- **Issues**: Check `PROJECT_REFERENCE.md` (this file) first for known issues

---

**Built with**: React 19, Express 4, Firebase, Vite
**Design**: Feminine pastel aesthetics with modern vibrant palette
**Status**: ✅ Production Ready (March 2026)

---

## Quick Reference Card

**Start dev**: `cd backend && npm run dev` + `cd frontend && npm run dev`
**Build**: `cd frontend && npm run build`
**Deploy**: `firebase deploy`
**Make admin**: Firestore `users/{uid}` → set `role: "admin"`
**Reset progress**: Delete `users/{uid}.progress` field
**View logs**: `firebase functions:log`
**Clear all data**: `firebase firestore:delete --recursive modules announcements`
**Rollback**: `git reset --hard <SHA>` + rebuild + redeploy

**Key paths**:
- Theme colors: `frontend/src/utils/constants.js`
- Theme component: `frontend/src/components/common/ThemeSelector.jsx`
- Admin middleware: `backend/middleware/admin.js`
- Config loader: `backend/src/config.js`
- API routes: `backend/routes/`

---

**END OF MASTER REFERENCE**
Keep this file updated with any major changes!
