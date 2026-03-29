# SwatiArc - Quick Technical Reference

**Purpose**: Fast lookup for project structure, configs, and known issues. For developers (including Claude) who need to understand the system quickly, especially when debugging or making changes.

---

## 🏗️ Architecture Overview

**Stack**: React (Vite) + Express + Firebase (Auth, Firestore, Hosting, Functions)

**Flow**: Frontend → Express API (Cloud Function) → Firebase Firestore

**Auth**: Firebase ID tokens. Middleware `verifyFirebaseToken` attaches `req.user`. Admin routes additionally use `verifyAdmin` (checks Firestore `users/{uid}.role`).

**Deployment**: Firebase Hosting (frontend) + Cloud Functions (backend). `firebase.json` rewrites `/api/**` to functions.

---

## 🔑 Critical Configuration

### Root Files
- **`config.json`** (LOCAL): Firebase web config + service account key + backend port + OpenRouter API key
- **`config.example.json`**: Template for `config.json`
- **`firebase.json`**: Hosting + Functions deployment config
- **`.firebaserc`**: Firebase project alias

### Environment Detection
Backend `config.js` (line 4-40):
- **Local**: Loads `config.json` (relative path `../../config.json`)
- **Production**: Uses `firebase functions:config()` (set via `firebase functions:config:set`)

**Important**: Production config keys are `firebase.*`, while local uses exact `config.json` structure.

---

## 📁 Key File Locations

### Frontend
- **Entry**: `frontend/src/main.jsx`
- **Router**: `frontend/src/App.jsx`
- **Theme System**: `frontend/src/contexts/ThemeContext.jsx` (defines `THEMES` from `utils/constants.js`)
- **Theme Colors**: `frontend/src/utils/constants.js` - Edit here for color palette changes
- **Theme Selector Component**: `frontend/src/components/common/ThemeSelector.jsx`
- **Header Theme Toggle**: `frontend/src/components/layout/Header.jsx` (sun/moon icon calls `toggleMode()`)
- **Styles**: `frontend/src/index.css` (~2800 lines, CSS variables for themes)

### Backend
- **Server Entry**: `backend/server.js` - Serves frontend in dev, exports Cloud Function
- **Config Loader**: `backend/src/config.js` - CRITICAL: Understand fallback logic
- **Firebase Admin**: `backend/firebase/admin.js` - Auth & Firestore initialization
- **Middleware**:
  - `backend/middleware/auth.js` - `verifyFirebaseToken()` (uses `getAuth().verifyIdToken()`)
  - `backend/middleware/admin.js` - `verifyAdmin()` (checks `users/{uid}.role === 'admin'`)
- **Routes**: `backend/routes/` - All mounted with `verifyFirebaseToken` in `server.js` line 65-67

---

## 🎨 Theme System - How It Works

1. **ThemeContext** holds state: `themeName` (lavender|peach|mint|rose), `mode` (light|dark)
2. **Default theme**: `'lavender'` (changed from `'pastelPop'` which caused crashes)
3. **CSS Application**: `ThemeContext.jsx` line 42-45 converts camelCase to kebab-case and sets `--var-name` on `:root`
4. **CSS Variables**: Defined in `index.css` for default, but overridden by ThemeContext
5. **Theme Selector Modal**: `ThemeSelector.jsx` - Requires `className="modal-ov open"` to display (fixed bug)
6. **Day/Night Toggle**: `Header.jsx` line 123-141 - Calls `toggleMode()` from ThemeContext

**If themes break**:
- Check `THEMES[themeName][mode]` exists in `constants.js`
- Verify `ThemeProvider` wraps `AppRoutes` in `App.jsx`
- Inspect `:root` element in browser DevTools for CSS variable values

---

## 🔐 Admin Authorization Flow

**Important**: TWO separate mechanisms:

1. **Frontend Route Guard** (`App.jsx` `AdminRoute` component):
   - Calls `fetchAdminUser(user.uid)` from `adminService.js`
   - If response has `user.role === 'admin'`, renders admin route
   - This is a UI convenience, NOT security

2. **Backend Middleware** (`backend/routes/admin.js` and others):
   - `verifyAdmin()` middleware checks Firestore `users/{uid}` directly
   - **THIS IS THE REAL SECURITY**
   - Even if frontend shows admin link, backend will reject if `role !== 'admin'`

**Admin check in `admin.js` line 144-150**: Fixed bug where it was using `verifyAdmin` incorrectly as callback. Now does direct Firestore lookup.

**To make user admin**:
Create/update Firestore document `users/{uid}` with field `role: "admin"` (string, not boolean).

---

## ⚠️ Known Fragile Points (Things That Might Break)

### 1. Theme Modal Not Opening
**Cause**: Missing `open` class on modal overlay.
**Fix**: `ThemeSelector.jsx` line 15 must have `className="modal-ov open"` not `className="modal-ov"`.
**Why**: CSS rule `.modal-ov.open { display: flex; }` only applies with `.open` class.

### 2. App Crashes on Load (Missing Theme)
**Cause**: `localStorage.getItem('dp_theme')` returns theme name not in `THEMES` object.
**Fix**: Default changed from `'pastelPop'` (nonexistent) to `'lavender'` in `ThemeContext.jsx` line 7.
**Fallback**: If theme not found, code sets `setThemeName('lavender')` at line 28.

### 3. Backend Can't Find config.json
**Path**: `backend/src/config.js` line 4: `CONFIG_PATH = path.join(__dirname, '..', '..', 'config.json')`
- This resolves from `backend/src/` → project root `config.json`
- Must exist at project root, not inside `backend/`
- Windows path: `C:\path\project\config.json`

### 4. CORS Issues in Development
**Vite dev server** runs on port 5173, backend on 3000.
`config.json` must have: `"backend": { "corsOrigins": ["http://localhost:3000", "http://localhost:5173"] }`
Backend `server.js` line 20-24 uses these origins.

### 5. Firebase Auth 400 Errors
- **Enable Email/Password** in Firebase Console → Authentication → Sign-in methods
- Verify ALL fields in `config.json` `firebase` object are correct from Firebase project settings

### 6. Admin Routes 403 Despite Being Admin
- Check Firestore: `users/{uid}` document exists with `role: "admin"` (string, not boolean)
- Backend `verifyAdmin` middleware directly queries Firestore - must have document
- Frontend `AdminRoute` does its own check via API - could be stale, but backend is authoritative

### 7. Announcements Not Showing
- `active: true` required
- Date filtering: `startDate` and `endDate` must include current time (checked in `announcements.js` line 24-30)
- Dismissed announcements stored in `sessionStorage` - clearing session resets

### 8. Chatbot AI Not Responding
- Need OpenRouter API key in `config.json` → `openrouter.apiKey`
- Backend `gemini.js` line 95-100 checks this and returns 500 if missing
- Test endpoint `/api/gemini/test` returns error if key missing (public, no auth)

---

## 🧪 Quick Test Commands

```bash
# Backend
cd backend && npm run dev
# Should log: "✅ Configuration loaded from config.json"

# Frontend
cd frontend && npm run dev
# Opens http://localhost:5173

# Build frontend
cd frontend && npm run build
# Outputs to frontend/build/

# Test backend API (no auth for public endpoints)
curl http://localhost:3000/api/config
curl http://localhost:3000/api/gemini/test

# Test with auth (replace TOKEN with Firebase ID token)
curl -H "Authorization: Bearer TOKEN" http://localhost:3000/api/modules
```

---

## 🔄 Important Code Patterns

### Middleware Chain in server.js
```javascript
// Public endpoints: verifyFirebaseToken NOT applied
app.get('/api/config', ...);

// Protected routes: verifyFirebaseToken applied at mount
app.use('/api/modules', verifyFirebaseToken, modulesRoutes);
app.use('/api/announcements', verifyFirebaseToken, announcementsRoutes);
app.use('/api/admin', verifyFirebaseToken, adminRoutes);  // admin routes additionally check role inside

// Note: admin.js route handlers use `verifyAdmin` middleware inline or as wrapper
```

### Theme State Persistence
- `localStorage` keys: `'dp_theme'` and `'dp_mode'`
- Initial state reads from localStorage with fallbacks
- Changes saved automatically via `useEffect`

### Firestore Timestamps
- Server timestamps: `admin.firestore.FieldValue.serverTimestamp()`
- When reading, convert: `data.createdAt?.toDate?.()?.toISOString() || data.createdAt`
- Pattern used in all route responses for JSON serialization

---

## 📝 Deployment Checklist

- [ ] `config.json` created with Firebase config + service account
- [ ] `firebase login` completed
- [ ] `firebase use --add` selected project
- [ ] Firestore indexes deployed: `firebase deploy --only firestore`
- [ ] OpenRouter API key set in `config.json` (if using AI chatbot)
- [ ] Build frontend: `cd frontend && npm run build`
- [ ] Test backend locally: `cd backend && npm run dev` → http://localhost:3000
- [ ] Deploy: `firebase deploy` (or `--only functions` then `--only hosting`)
- [ ] Post-deploy: Create admin user in Firestore `users/{uid}` with `role: "admin"`
- [ ] Verify: App loads, login works, admin panel accessible

---

## 🎯 Critical Files for Debugging

If something breaks, check in order:

1. **Backend not starting**: `backend/src/config.js` → `config.json` validity
2. **Auth errors**: `firebase.json` (for Hosting rewrites), `config.json` (Firebase creds)
3. **Theme issues**: `frontend/src/contexts/ThemeContext.jsx`, `frontend/src/utils/constants.js`
4. **Admin access**: Firestore `users/{uid}` document `role` field
5. **API 404/rewrites**: `firebase.json` hosting rewrites configuration
6. **Build errors**: `frontend/vite.config.js`, `frontend/package.json` dependencies

---

## 📊 Database Schema Quick View

**Collections**:
- `modules` - Course content
- `announcements` - Site banners
- `users` - Firebase UID as doc ID + `role`, `progress` map
- `appSettings` - Optional settings like AI model
- `geminiConversations` - Chat history by user UID

**Indexes** (`firestore.indexes.json`):
- `announcements`: composite on `active ASC, createdAt DESC` (for banner queries)

---

## 🔧 Common Admin Tasks

### Reset user progress
Delete or update `users/{uid}.progress` map in Firestore.

### Change AI model
1. As admin, go to Admin Panel → AI Model section
2. Enter OpenRouter model ID (e.g., `anthropic/claude-3.5-sonnet`)
3. Click Save → stored in `appSettings/aiModel` document
4. Chatbot uses this on next request

### Add new module
Admin → Manage Modules → "+ Add Module" → fill form → Save
Creates document in `modules` collection with auto-generated ID.

### Bulk import modules
Use `backend/scripts/migrate-course.js` (reads `frontend/public/course.json` or custom file)

---

## 🚨 Emergencies

### Rollback to previous commit
```bash
git log --oneline   # find commit SHA
git reset --hard <SHA>
cd frontend && npm run build
cd backend && npm start   # or restart Firebase functions
```

### Clear all Firebase data (start fresh)
**WARNING**: Destructive
```bash
# Using Firebase CLI
firebase firestore:delete --recursive modules
firebase firestore:delete --recursive announcements
firebase firestore:delete --recursive users
# Keep appSettings if needed
```

### Disable a misbehaving feature
- **AI chatbot**: Remove OpenRouter API key from `config.json` → requests fail gracefully
- **Announcements**: Set all `active: false` in Firestore collection
- **Theme**: Revert `constants.js` to original pastel colors

---

**Keep this file handy for quick debugging!**
