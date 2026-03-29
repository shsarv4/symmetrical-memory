# ✨ SwatiArc - Learning Tracker

A beautiful, highly animated learning progress tracker built with **React + Express + Firebase**. Features Pinterest-style aesthetics, admin panel, dynamic content management, and seamless cloud sync.

---

## 🎯 What's New (v3.0 - MERN Stack)

**Full-stack JavaScript architecture** with React frontend and Express backend:

- ⚛️ **React Frontend** - Component-based UI with React Router, Vite build system
- 🔧 **Express Backend** - RESTful API with middleware, rate limiting, admin auth
- 🔥 **Firebase Firestore** - Dynamic course content and user progress
- 📱 **Modern Admin Panel** - CRUD modules, announcements, user management
- 🌓 **Day/Night Mode** - Enhanced theme system with light/dark variants
- 🎊 **Preserved Animations** - All original magic: particles, sparkles, ripple clicks, confetti

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

### Technical
- ⚡ **Vite Build System** - Fast HMR, optimized production builds
- 🔄 **React Router** - Client-side routing with protected routes
- 🎯 **Context API** - Global state for theme, auth, UI
- 🔌 **RESTful API** - Clean endpoint structure with middleware
- 🛡️ **Admin Middleware** - Role-based access control at API layer
- ☁️ **Firebase Deployment** - Serverless backend, static frontend hosting

---

## 📁 Project Structure

```
.
├── config.example.json              # Configuration template
├── config.json                      # ⚠️  YOUR SECRETS (create from example)
├── firebase.json                    # Firebase Hosting + Functions config
├── .firebaserc                      # Firebase project alias
│
├── frontend/                        # React application (Vite)
│   ├── index.html                   # HTML entry point
│   ├── index.css                    # Global styles (~2800 lines)
│   ├── package.json                 # Dependencies (React, React Router)
│   ├── vite.config.js               # Build configuration
│   └── src/
│       ├── main.jsx                 # React entry point
│       ├── App.jsx                  # Router + route definitions
│       ├── contexts/
│       │   ├── AuthContext.jsx      # Authentication state
│       │   └── ThemeContext.jsx     # Theme + day/night mode
│       ├── components/
│       │   ├── auth/
│       │   │   ├── LoginScreen.jsx  # Lock screen
│       │   │   └── SetupScreen.jsx  # Registration
│       │   ├── layout/
│       │   │   ├── Header.jsx       # Topbar with theme toggle, logout
│       │   │   ├── Sidebar.jsx      # Module navigation
│       │   │   └── Layout.jsx       # Main wrapper
│       │   ├── modules/
│       │   │   ├── ModuleList.jsx   # Grid of all modules
│       │   │   ├── ModuleCard.jsx   # Individual card (3D tilt)
│       │   │   └── ModuleDetail.jsx # Module view with progress
│       │   ├── admin/
│       │   │   ├── AdminPanel.jsx      # Dashboard
│       │   │   ├── AdminModules.jsx    # Module CRUD
│       │   │   └── AdminAnnouncements.jsx  # Announcement CRUD
│       │   └── common/
│       │       ├── AnnouncementBanner.jsx  # Carousel banner
│       │       ├── ParticleBackground.jsx  # Animated particles
│       │       └── ThemeSelector.jsx       # Modal theme picker
│       ├── services/
│       │   ├── api.js                # Generic API client (auth token)
│       │   ├── moduleService.js      # Module API calls
│       │   ├── announcementService.js
│       │   ├── adminService.js
│       │   ├── authService.js
│       │   └── configService.js      # Fetch config from backend
│       └── utils/
│           └── constants.js          # THEMES object (light/dark)
│
├── backend/                         # Express API server
│   ├── server.js                    # Express app + Cloud Function export
│   ├── package.json                 # Dependencies (Express, Firebase Admin)
│   ├── src/
│   │   └── config.js                # Config loader (supports local + Functions)
│   ├── firebase/
│   │   └── admin.js                 # Firebase Admin SDK initialization
│   ├── middleware/
│   │   └── admin.js                 # Admin role verification middleware
│   ├── routes/
│   │   ├── modules.js               # Module CRUD (public read, admin write)
│   │   ├── announcements.js         # Announcement CRUD (public read, admin write)
│   │   ├── admin.js                 # Admin-only: stats, users, role changes
│   │   ├── progress.js              # User progress tracking
│   │   └── gemini.js                # AI assistant (optional)
│   └── scripts/
│       └── migrate-course.js        # One-time: import course.json to Firestore
│
├── functions/                       # Firebase Cloud Functions wrapper
│   ├── package.json                 # Dependencies (subset of backend)
│   └── index.js                     # Exports Express app as Cloud Function
│
├── frontend_legacy/                 # Backup of original vanilla JS app
│   ├── index.html
│   ├── styles.css
│   └── app.js
│
└── course.json (legacy)             # Original course data (migrated to Firestore)

```

---

## 🚀 Quick Start (TL;DR)

1. **Firebase**: Create project → enable Email/Password auth
2. **Config**: Create `config.json` from `config.example.json` + fill Firebase config + service account
3. **Backend**: `cd backend && npm install && npm run dev`
4. **Frontend**: `cd frontend && npm install && npm run dev`
5. Open **http://localhost:5173** (Vite) or **http://localhost:3000** (backend serves frontend)

See [SETUP.md](SETUP.md) for complete detailed instructions.

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| **[SETUP.md](SETUP.md)** | Complete step-by-step setup guide ⭐ **START HERE** |
| **backend/README.md** | Backend API reference |
| **config.example.json** | Configuration template with all fields |
| **firebase.json** | Firebase deployment configuration |

---

## 🔧 Configuration

### config.json Structure

Create `config.json` in the project root:

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
  "serviceAccount": {
    "type": "service_account",
    "project_id": "your-project-id",
    "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----",
    "client_email": "firebase-adminsdk-xxxx@your-project.iam.gserviceaccount.com",
    "...": "..."
  },
  "backend": {
    "port": 3000,
    "corsOrigins": ["http://localhost:3000", "http://localhost:5173"]
  },
  "app": {
    "apiBaseUrl": ""
  }
}
```

**Where to get values:**

- `firebase.*` → Firebase Console → Project Settings → "Your apps" → Web app config
- `serviceAccount` → Firebase Console → Project Settings → "Service accounts" → "Generate new private key"
- `backend.corsOrigins` → Add frontend dev server URL (localhost:5173) and backend URL (localhost:3000)
- `app.apiBaseUrl` → Leave empty `""` for same-origin, or set to backend URL if separate

---

## 🎨 Themes & Customization

### Built-in Themes (4 Pastel Palettes)
1. **Lavender Dreams** (default) - Purple/pink/mint
2. **Peach Blush** - Warm peach/coral
3. **Mint Fresh** - Cool green/teal
4. **Rose Gold** - Rose/pink/gold

**Each theme has light and dark mode variants!**

### Access Theme Selector
Click the **palette icon** 🎨 in the top-right corner.

### Customize Colors
Edit `frontend/src/utils/constants.js` → `THEMES` object. Add new theme keys and update `ThemeSelector.jsx`.

---

## 👑 Admin Setup

### First Admin User (Manual)

1. Run the app and create a regular user (login with Firebase)
2. Go to **Firebase Console** → **Firestore Database**
3. Navigate to `users/{uid}` collection (where `{uid}` is the Firebase UID of your user)
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

## ☁️ Firebase Deployment

### Prerequisites
- Firebase CLI installed: `npm install -g firebase-tools`
- Logged in: `firebase login`
- Firebase project created

### Deploy Everything (One Command)
```bash
firebase deploy
```

This deploys:
- **Hosting**: React app (frontend/build) → `firebase.json` hosting config
- **Functions**: Express backend → `functions/index.js` Cloud Function

### Configuration for Production

Set Firebase Functions config once:

```bash
firebase functions:config:set \
  firebase.api_key="YOUR_API_KEY" \
  firebase.auth_domain="YOUR_PROJECT.firebaseapp.com" \
  firebase.project_id="YOUR_PROJECT_ID" \
  firebase.storage_bucket="YOUR_PROJECT.appspot.com" \
  firebase.messaging_sender_id="YOUR_SENDER_ID" \
  firebase.app_id="YOUR_APP_ID"
```

**Note**: The backend's `config.js` will automatically use `functions.config()` in production (Cloud Functions), falling back to `config.json` in development.

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

### Run All Together (Backend serves frontend)
The backend (`server.js`) automatically serves the `frontend/` directory when running locally (not in Cloud Functions). Just start the backend and open **http://localhost:3000**.

---

## 🗂️ Data Model (Firestore)

### modules/{moduleId}
```javascript
{
  id: "m1",
  title: "Python Programming",
  subtitle: "Basics → OOP → File Handling",
  icon: "🐍",
  accent: "#c084fc",
  topics: [
    {
      id: "m1t1",
      title: "Python Fundamentals",
      subtopics: ["Variables", "Data Types", "Operators"]
    }
  ],
  resources: [
    { type: "video", label: "Tutorial", title: "Python 101", url: "https://..." }
  ],
  exercises: [
    { title: "Build a Calculator", url: "https://...", desc: "Create a CLI calculator" }
  ],
  order: 1,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### announcements/{announcementId}
```javascript
{
  id: "abc123",
  title: "New Features!",
  message: "We've added dark mode.",
  type: "update",           // info | warning | success | update
  active: true,
  startDate: timestamp,     // optional - when to show
  endDate: timestamp,       // optional - when to hide
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### users/{uid}
```javascript
{
  uid: "firebase-uid-xxx",
  email: "user@example.com",
  role: "admin" | "user",
  displayName: "Swati",
  photoURL: null,
  createdAt: timestamp,
  lastLogin: timestamp,
  progress: {
    "t_m1t1": true,
    "s_m1t1_0": false,
    "e_m1_0": true,
    "notes_m1": "My notes..."
  }
}
```

---

## 🧪 Testing Checklist

### Backend
- [x] GET `/api/modules` returns all modules (ordered)
- [x] GET `/api/modules/:id` returns single module
- [x] POST `/api/modules` (admin) creates module
- [x] PUT `/api/modules/:id` (admin) updates module
- [x] DELETE `/api/modules/:id` (admin) deletes module
- [x] GET `/api/announcements` returns active announcements
- [x] POST `/api/announcements` (admin) creates announcement
- [x] GET `/api/admin/users` (admin) returns user list
- [x] PUT `/api/admin/users/:uid/role` (admin) changes role
- [x] Admin middleware blocks non-admin users
- [x] Config endpoint `/api/config` serves Firebase config to frontend

### Frontend
- [x] Login works (Firebase Auth)
- [x] Registration works
- [x] Modules load and display correctly
- [x] Progress tracking works (checkboxes save)
- [x] Theme switching works (all 4 themes)
- [x] Day/night mode switching works
- [x] Announcement banner carousel (auto-slide, navigation, dismiss)
- [x] Admin panel visible only to admins
- [x] Module editor form (create/edit with dynamic topics)
- [x] Announcement manager CRUD
- [x] All animations preserved (particles, ripple, sparkles, 3D tilt)
- [x] Responsive layout (sidebar collapses on mobile)

### Deployment
- [ ] `firebase deploy` succeeds (Hosting + Functions)
- [ ] Backend Cloud Function responds
- [ ] Frontend loads from Hosting
- [ ] API rewrites work (`/api/*` → Cloud Function)
- [ ] SPA fallback works (refresh on `/module/:id`)
- [ ] Firebase Auth works in production

---

## 🔄 Migration from Legacy

The original vanilla JS app is preserved in `frontend_legacy/`. Course data was automatically migrated via:

```bash
node backend/scripts/migrate-course.js
```

This creates `modules` collection in Firestore from `frontend/course.json`.

To re-run (e.g., force overwrite):
```bash
node backend/scripts/migrate-course.js --force
```

---

## 🐛 Troubleshooting

### Backend won't start
- Verify `config.json` exists and is valid JSON
- Check that `serviceAccount.private_key` is complete (multi-line string)
- Ensure port 3000 is not in use

### Firebase auth errors (400 Bad Request)
- **Enable Email/Password auth** in Firebase Console → Authentication → Sign-in methods
- Verify `firebase.*` config in `config.json` matches your Firebase project
- Restart backend after config changes

### Frontend API calls fail (401, 403)
- Ensure you're logged in (check top-right icon)
- For admin endpoints, make sure user has `role: "admin"` in Firestore
- Check CORS: `backend.corsOrigins` should include frontend URL (localhost:5173 for Vite)

### Announcement banner not showing
- Ensure announcements exist in Firestore with `active: true`
- Check that current date is within `startDate`/`endDate` range if specified
- Dismissed announcements are stored in `sessionStorage` - clear to see them again

### Theme not applying correctly
- Check browser console for CSS variable errors
- Verify `data-theme` and `data-mode` attributes on `<html>` element
- ThemeContext requires `ThemeProvider` wrapper in `App.jsx`

---

## 📦 Package Scripts

**Backend** (`backend/package.json`):
- `npm start` - Start server (production)
- `npm run dev` - Start with nodemon (auto-reload)

**Frontend** (`frontend/package.json`):
- `npm run dev` - Start Vite dev server (with HMR)
- `npm run build` - Build for production (`frontend/build/`)
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

**Functions** (`functions/package.json`):
- `npm run serve` - Start Firebase emulators
- `npm run deploy` - Deploy only functions
- `npm run logs` - View function logs

---

## 📝 Notes

- **No legacy mode**: This version **requires** Firebase Authentication. Local-only mode removed.
- **Single config source**: Frontend fetches Firebase config from backend `/api/config` (no config files in frontend).
- **Admin assigns admin**: First admin must be created manually via Firestore console.
- **Course content dynamic**: Edit modules via Admin Panel → changes saved to Firestore instantly.
- **Cloud Functions ready**: Backend exports as Cloud Function; `config.js` auto-detects environment.
- **Performance**: Vite build ~87KB gzipped; lazy loading possible for future components.

---

## 🎉 Getting Help

- **SETUP.md** - Detailed step-by-step setup from zero
- **backend/README.md** - API endpoint reference
- **Firebase Console** - Manage users, view Firestore data
- **GitHub Issues** - Report bugs or request features

---

**Built with ❤️ and React + Express + Firebase**

**Version**: 3.0 (MERN Stack)
**License**: MIT
**Last Updated**: March 2025
