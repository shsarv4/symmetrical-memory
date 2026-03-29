# ✨ SwatiArc - Learning Tracker

A beautiful, highly animated learning progress tracker built with **React + Express + Firebase**. Features Pinterest-style aesthetics, admin panel, dynamic content management, and seamless cloud sync.

---

## 🎯 Quick Start (TL;DR)

1. **Firebase**: Create project → enable Email/Password auth + Firestore
2. **Config**: Copy `config.example.json` → `config.json` and fill in Firebase credentials
3. **Backend**: `cd backend && npm install && npm run dev`
4. **Frontend**: `cd frontend && npm install && npm run dev`
5. Open **http://localhost:5173** (Vite) or **http://localhost:3000** (backend serves frontend)

**Full detailed setup** → See [SETUP GUIDE](#-complete-setup-guide) below.

---

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   React App     │────▶│   Express API    │────▶│   Firebase      │
│  (Vite Build)   │     │  (Cloud Funcs)   │     │   Firestore     │
│                 │◀────│                  │◀────│   Auth          │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                        │                        │
        └────────────────────────┼────────────────────────┘
                                 │
                         ┌───────▼────────┐
                         │   Firebase      │
                         │   Hosting       │
                         └─────────────────┘
```

**Deployment**: All hosted on Firebase (Hosting + Cloud Functions)

---

## ✨ Features

### User Features
- 🔐 **Firebase Authentication** - Secure email/password login
- 📚 **13 Learning Modules** - Python, NumPy, Pandas, ML, DL, NLP, CV & more
- ✅ **Progress Tracking** - Topics, subtopics, exercises with checkboxes
- 📝 **Notes System** - Personal notes per module, auto-saved
- 🎨 **4 Beautiful Themes** - Lavender, Peach, Mint, Rose (each with dark mode)
- 🌟 **Magical Animations** - Particles, sparkles, 3D tilt, ripple effects
- 📱 **Responsive Design** - Works on desktop, tablet, mobile

### Admin Features
- 👑 **Admin Dashboard** - Statistics: users, modules, announcements
- 📝 **Module Editor** - Create/edit modules with dynamic topics & resources
- 📢 **Announcement Manager** - Site-wide banners with carousel display
- 👥 **User Management** - View users, assign admin roles
- 🔄 **Real-time Updates** - Changes reflect instantly across the app

---

## 📁 Key Project Files

```
config.json                # ⚠️  YOUR SECRETS (Firebase config + service account)
config.example.json        # Template for config.json
firebase.json              # Firebase Hosting + Functions config
.firebaserc                # Firebase project alias

frontend/                  # React + Vite app
  ├── src/
  │   ├── contexts/        # AuthContext, ThemeContext
  │   ├── components/      # All UI components
  │   ├── services/        # API service functions
  │   └── utils/constants.js  # Theme definitions (light/dark)
  └── build/               # Production build (generated)

backend/                   # Express API server
  ├── server.js            # Main server + Cloud Function export
  ├── src/config.js        # Config loader (local & Functions)
  ├── firebase/admin.js    # Firebase Admin SDK init
  ├── middleware/          # auth.js (verify token), admin.js (verify role)
  └── routes/              # API route handlers (modules, announcements, admin, etc.)

functions/                # Cloud Functions wrapper (deploy only)
  └── index.js             # Exports Express app as function
```

---

## 🔧 Configuration

### config.json Structure (Create from config.example.json)

```json
{
  "firebase": {
    "apiKey": "AIzaSy...",
    "authDomain": "your-project.firebaseapp.com",
    "projectId": "your-project-id",
    "storageBucket": "your-project.appspot.com",
    "messagingSenderId": "123456789",
    "appId": "1:123456789:web:abcdef"
  },
  "serviceAccount": { /* downloaded service account JSON */ },
  "backend": {
    "port": 3000,
    "corsOrigins": ["http://localhost:3000", "http://localhost:5173"]
  },
  "app": {
    "apiBaseUrl": ""
  },
  "openrouter": {
    "apiKey": "YOUR_OPENROUTER_API_KEY",
    "model": "anthropic/claude-3.5-sonnet"
  }
}
```

**How to get values**:
1. `firebase.*` → Firebase Console → Project Settings → "Your apps" → Web app config
2. `serviceAccount` → Firebase Console → Project Settings → "Service accounts" → "Generate new private key"
3. `openrouter.apiKey` → OpenRouter.ai (for AI chatbot feature)

---

## 🎨 Themes & Customization

### Built-in Themes
1. **Lavender Dreams** (default) - Purple/pink/mint
2. **Peach Blush** - Warm peach/coral
3. **Mint Fresh** - Cool green/teal
4. **Rose Gold** - Rose/pink/gold

**Each theme has light and dark mode variants!**

### Access Theme Selector
Click the **palette icon** 🎨 in the top-right corner.

### Customize Colors
Edit `frontend/src/utils/constants.js` → `THEMES` object. Each theme has `light` and `dark` variants with color palettes.

---

## 👑 Admin Setup

### First Admin User (Manual)

1. Run the app and create a regular user
2. Go to **Firebase Console** → **Firestore Database**
3. Find your user document in `users/{uid}` collection (UID from Firebase Console → Authentication → Users)
4. Create/update document with:
   ```json
   {
     "email": "your-email@example.com",
     "role": "admin",
     "displayName": "Your Name"
   }
   ```
5. Refresh the app → **Admin** button appears in topbar
6. Click **Admin** to access dashboard

### Admin Capabilities
- **Manage Modules**: Add, edit, delete course modules (topics, resources, exercises)
- **Manage Announcements**: Create site-wide banners (carousel) with type colors
- **User Management**: View all users, promote/demote admin roles
- **Dashboard Stats**: View user count, modules, progress

---

## ☁️ Deployment to Firebase

### Prerequisites
- Firebase CLI: `npm install -g firebase-tools`
- Logged in: `firebase login`
- Firebase project created

### Deploy Everything
```bash
firebase deploy
```

This deploys:
- **Hosting**: React app (frontend/build)
- **Functions**: Express backend (Cloud Function)
- **Firestore indexes**: Composite indexes for queries

### Deploy Steps (Optional Control)
```bash
# 1. Deploy Firestore indexes first (takes 1-2 min to build)
firebase deploy --only firestore

# 2. Deploy backend Cloud Function
firebase deploy --only functions

# 3. Deploy frontend Hosting
firebase deploy --only hosting
```

### Production Configuration

Set Firebase Functions config once (before first deploy):

```bash
firebase functions:config:set \
  firebase.api_key="YOUR_API_KEY" \
  firebase.auth_domain="YOUR_PROJECT.firebaseapp.com" \
  firebase.project_id="YOUR_PROJECT_ID" \
  firebase.storage_bucket="YOUR_PROJECT.appspot.com" \
  firebase.messaging_sender_id="YOUR_SENDER_ID" \
  firebase.app_id="YOUR_APP_ID"
```

The backend's `config.js` auto-detects environment: uses `functions.config()` in production, `config.json` in development.

---

## 🧪 Development Workflow

### Start Backend (API)
```bash
cd backend
npm install
npm run dev   # or: npm start
```
Server runs on **http://localhost:3000**

### Start Frontend (React Dev)
```bash
cd frontend
npm install
npm run dev   # Vite dev server on http://localhost:5173
```
Vite proxies `/api` requests to `http://localhost:3000`.

### Build for Production
```bash
cd frontend
npm run build   # Outputs to frontend/build/
```

### Backend Serves Frontend Locally
The backend (`server.js`) automatically serves the `frontend/` directory when running locally. Just start the backend and open **http://localhost:3000**.

---

## 🔌 API Endpoints Reference

### Public (with auth)
- `GET    /api/modules` - All modules (ordered)
- `GET    /api/modules/:id` - Single module
- `GET    /api/announcements` - Active announcements only
- `POST   /api/progress` - Save user progress
- `GET    /api/progress` - Load user progress
- `GET    /api/config` - Firebase config for frontend (public)

### Admin Only (requires admin role in Firestore users collection)
- `POST   /api/modules` - Create module
- `PUT    /api/modules/:id` - Update module
- `DELETE /api/modules/:id` - Delete module
- `POST   /api/announcements` - Create announcement
- `GET    /api/announcements/all` - All announcements (including inactive)
- `PUT    /api/announcements/:id` - Update announcement
- `DELETE /api/announcements/:id` - Delete announcement
- `GET    /api/admin/stats` - Dashboard statistics
- `GET    /api/admin/users` - List all users
- `GET    /api/admin/users/:uid` - Get user details
- `PUT    /api/admin/users/:uid/role` - Change user role
- `GET    /api/admin/ai-model` - Get AI model setting
- `PUT    /api/admin/ai-model` - Update AI model

### AI Assistant (authenticated users)
- `GET    /api/gemini/test` - Test AI connectivity (public)
- `POST   /api/gemini/chat` - Send message, get streaming response
- `GET    /api/gemini/conversations` - Load conversation history
- `POST   /api/gemini/conversations/clear` - Clear history

---

## 🗂️ Data Model (Firestore Collections)

### `modules/{moduleId}`
```javascript
{
  id, title, subtitle, icon, accent, order,
  topics: [{ id, title, subtopics: [] }],
  resources: [{ type, label, title, url }],
  exercises: [{ title, url, desc }],
  createdAt, updatedAt
}
```

### `announcements/{announcementId}`
```javascript
{
  title, message, type ("info"|"warning"|"success"|"update"),
  active, startDate?, endDate?,
  createdAt, updatedAt
}
```

### `users/{uid}`
```javascript
{
  email, role ("admin"|"user"), displayName?, photoURL?,
  createdAt, lastLogin,
  progress: {
    "t_topicId": true,           // topic completed
    "s_topicId_0": true,         // subtopic completed
    "e_moduleId_0": true,        // exercise completed
    "notes_moduleId": "text..."  // notes
  }
}
```

### `appSettings` (optional)
```javascript
{
  aiModel: "anthropic/claude-3.5-sonnet"  // AI model ID from OpenRouter
}
```

### `geminiConversations/{uid}`
```javascript
{
  conversations: [
    { userMessage, aiResponse, context, timestamp }
  ],
  lastUpdated
}
```

---

## 🐛 Troubleshooting

### Backend won't start
- Verify `config.json` exists and contains valid JSON
- Check `serviceAccount.private_key` is complete (multi-line string with `\n`)
- Ensure port 3000 is not in use
- Run `npm install` in `backend/` folder

### Firebase auth errors (400 Bad Request)
- **Enable Email/Password auth** in Firebase Console → Authentication → Sign-in methods
- Verify `firebase.*` config in `config.json` matches your Firebase project exactly
- Restart backend after config changes

### Frontend API calls fail (401, 403)
- Ensure you're logged in (check user icon in top-right)
- For admin endpoints: user must have `role: "admin"` in Firestore `users/{uid}` document
- Check CORS: `backend.corsOrigins` should include frontend URL (localhost:5173 for Vite dev, localhost:3000 for backend-served)

### Announcement banner not showing
- Ensure announcements exist in Firestore with `active: true`
- Check that current date is within `startDate`/`endDate` range if specified
- Dismissed announcements are stored in `sessionStorage` - clear session storage to see them again

### Theme not applying correctly
- Check browser console (F12) for CSS variable errors
- Verify `data-theme` and `data-mode` attributes on `<html>` element
- ThemeContext requires `<ThemeProvider>` wrapper in `App.jsx` (already there)

---

## 📦 Scripts Reference

**Backend**:
- `npm start` - Start server (production)
- `npm run dev` - Start with nodemon (auto-reload)

**Frontend**:
- `npm run dev` - Vite dev server (HMR)
- `npm run build` - Production build (`frontend/build/`)
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

**Functions**:
- `npm run serve` - Firebase emulators
- `npm run deploy` - Deploy only functions
- `npm run logs` - View function logs

---

## 🔄 Migration from Legacy

The original vanilla JS app is preserved in `frontend_legacy/`.

Course data was migrated via:
```bash
node backend/scripts/migrate-course.js
```

This creates `modules` collection in Firestore from `frontend/public/course.json`.

To re-run (force overwrite):
```bash
node backend/scripts/migrate-course.js --force
```

---

## ⚠️ Important Notes

- **No local-only mode**: This version requires Firebase Authentication
- **Single config source**: Frontend fetches Firebase config from backend `/api/config` (no config in frontend)
- **First admin**: Must be manually created via Firestore console with `role: "admin"`
- **Dynamic content**: Edit modules via Admin Panel → changes saved to Firestore instantly
- **Serverless**: Backend runs as Firebase Cloud Function (auto-scales, pay-per-use)
- **Build size**: Vite build ~87KB gzipped

---

## 🎯 Current Status

| Component | Status |
|-----------|--------|
| Backend server | ✅ Running (localhost:3000) |
| Frontend build | ✅ Rebuilt (347KB JS, 40KB CSS) |
| Layout | ✅ Proper grid layout |
| Theme modal | ✅ Opens correctly |
| Day/night toggle | ✅ Works |
| Colors | ✅ Vibrant modern palette |
| Admin role gating | ✅ Secure |
| Responsive design | ✅ Working |

---

## 📚 Quick Reference

**API Base**: All routes prefixed with `/api` (when running locally, proxied through same origin)

**Default Ports**:
- Backend: 3000
- Frontend (Vite): 5173
- Firebase Emulators: Firestore 8080, Auth 9099, Hosting 5000

**Key Directories**:
- Frontend components: `frontend/src/components/`
- Backend routes: `backend/routes/`
- Firebase config: `config.json` (root)

**Essential Middleware**:
- `verifyFirebaseToken` - Checks Firebase ID token, attaches `req.user`
- `verifyAdmin` - Checks Firestore user doc for `role: 'admin'`

**Critical Dependencies**:
- Frontend: react, react-dom, react-router-dom
- Backend: express, firebase-admin, cors, express-rate-limit

---

## 🎉 Ready to Deploy?

All critical bugs fixed, code quality improved, and build tested. See [SETUP GUIDE](#-complete-setup-guide) above for full instructions.

**Built with ❤️ and React + Express + Firebase**

**Version**: 3.0 (MERN Stack)
**License**: MIT
**Last Updated**: March 2026
