# ✨ SwatiArc - Learning Tracker

A beautiful, highly animated learning progress tracker with Pinterest-style aesthetics.

## 🏗️ Architecture (v2.0+)

**Securely separated frontend and backend:**

```
Frontend (Static HTML/CSS/JS) ↔ Backend API (Node.js) ↔ Firebase Firestore
```

- 🔐 **Secure**: Firebase credentials never exposed in browser
- 🚀 **Scalable**: Backend handles authentication & data access
- ☁️ **Synced**: Progress syncs across devices via cloud
- 📱 **Responsive**: Works on all devices with beautiful animations

> **Note**: This version uses a Node.js backend. See [SETUP.md](SETUP.md) for complete instructions.

## 🆕 Firebase Authentication

SwatiArc supports Firebase Authentication:

- **Email/Password sign-in** via Firebase Auth
- **Persistent sessions** across browser restarts
- **Cloud sync** via secure backend API
- **Backward compatible** with legacy local-only mode

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| **SETUP.md** | Complete setup guide from zero to production ⭐ **START HERE** |
| **backend/README.md** | Backend API documentation |

---

## 🚀 Quick Start (TL;DR)

1. **Firebase**: Create project → enable Email/Password auth
2. **Config**: Update `config.json` with Firebase config and service account
3. **Backend**: `cd backend && npm install && npm run dev`
4. **Done**: Open http://localhost:3000 (backend serves frontend)

See [SETUP.md](SETUP.md) for detailed steps.

---

## 📁 Project Structure

```
.
├── config.example.json     # Configuration template (copy to config.json)
├── frontend/               # Static frontend files (served by backend)
│   ├── index.html          # Main app UI
│   ├── styles.css          # Beautiful feminine styling
│   ├── app.js              # Frontend logic (calls backend API)
│   └── course.json         # 13 modules with learning content
│
├── backend/                # Node.js API server
│   ├── server.js           # Express server
│   ├── package.json        # Dependencies
│   ├── src/
│   │   └── config.js       # Configuration loader
│   ├── routes/
│   │   ├── progress.js     # Progress sync API
│   │   └── gemini.js       # AI assistant API
│   ├── middleware/
│   │   └── auth.js         # Firebase token verification
│   └── firebase/
│       └── admin.js        # Firebase Admin SDK
│
├── config.json             # ⚠️  YOUR SECRETS (create from example)
└── README.md               # This file
```

## 🚀 Features

### 1. First-Time User Experience
- ✨ Animated lock screen with SVG logo
- 📚 Detailed 3-step setup instructions
- 🔒 Secure password hashing (SHA-256)
- ☁️ Optional GitHub sync for cross-device access
- 🌟 Beautiful illustrations (no emojis!)

### 2. Beautiful SVG Icons
All 13 module icons are custom SVG with gradients:
- 🐍 Python Programming
- 🔢 NumPy
- 🐼 Pandas
- 📊 Data Visualization
- 🔍 Exploratory Data Analysis
- 🚀 APIs & Streamlit
- 🗄️ SQL & Databases
- 📈 Power BI & Tableau
- 📋 Excel & Power Query
- 🤖 Machine Learning
- 🧠 Deep Learning
- 💬 NLP
- 👁️ Computer Vision

### 3. Theme Selector (4 Pinterest-Style Themes)
Click the palette icon (🎨) in the topbar to choose:

1. **Lavender Dreams** (Default)
   - Soft purple/pink/mint pastels
   - Dreamy and feminine

2. **Peach Blush**
   - Warm peach/coral tones
   - Cozy and inviting

3. **Mint Fresh**
   - Cool green/teal/cyan palette
   - Clean and refreshing

4. **Rose Gold**
   - Rich rose/pink/gold accents
   - Elegant and luxurious

All themes maintain the same Pinterest aesthetic with different color palettes.

### 4. Magical Animations & Effects

- ✅ **Ripple clicks** on all buttons
- ✅ **Floating hearts** burst on login/setup
- ✅ **Confetti celebration** with emojis when module completes
- ✅ **3D parallax tilt** on cards (mouse follow)
- ✅ **Spotlight glow** follows cursor
- ✅ **Logo sparkle easter egg** (click the logo!)
- ✅ **Rising particles** with rotation
- ✅ **Bouncing icons** throughout
- ✅ **Smooth page transitions** with fade/slide
- ✅ **Hover lift effects** with multi-layer shadows

### 5. Enhanced Typography
- Larger text sizes for better readability
- Beautiful gradient headings
- Consistent font hierarchy

### 6. Core Functionality (Preserved)
- ✅ Password protection
- ✅ GitHub sync (optional)
- ✅ 13 complete modules with topics & subtopics
- ✅ Progress tracking (overall & per module)
- ✅ Exercise completion tracking
- ✅ Notes area for each module
- ✅ Resource links (videos, docs, practice)
- ✅ Responsive design for mobile
- ✅ Local storage persistence

## 🚀 Quick Start & Deployment

### 📁 Files
- **index.html** - Main HTML structure with Firebase SDK
- **styles.css** - 2100+ lines of beautiful styling with animations
- **app.js** - Full functionality including Firebase Auth

### ⚡ Local Development (No Setup)
1. Simply open `index.html` in any modern browser
2. Choose **Legacy Mode** (skip Firebase) or set up Firebase (see below)
3. Works entirely offline after first load

---

## 🔥 Firebase Setup (Authentication Only)

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** → Enter project name → Enable Google Analytics (optional) → Create
3. Wait for project to be ready (~30 seconds)

### Step 2: Enable Authentication
1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click **"Email/Password"** → Enable → Save

**Note**: No Firestore database needed. This app uses Firebase Authentication only.

### Step 3: Get Firebase Config
1. In Firebase Console, click the gear icon ⚙️ → **Project settings**
2. Scroll to **"Your apps"** → Click **" web"** (</>) icon
3. Register app (nickname: `swatiarc`) → **Register app**
4. Copy the `firebaseConfig` object
5. Paste into **app.js** at line ~20, replacing the `FIREBASE_CONFIG` placeholder:

```javascript
const FIREBASE_CONFIG = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

**Important**: Keep this config public (it's meant for client-side use). Do NOT commit real credentials to public repos.   

### Step 4: Deploy Your App
Choose any static hosting:

#### Option A: Firebase Hosting (Recommended)
```bash
npm install -g firebase-tools
firebase login
firebase init
  - Select Hosting
  - Choose your project
  - Set public directory: (leave empty or ".")
  - Configure as single-page app: Yes
  - Set up automatic builds: No

firebase deploy
```
Your app will be live at: `https://your-project.web.app`

#### Option B: GitHub Pages
1. Push your files to a GitHub repository
2. Go to repo → Settings → Pages
3. Source: `Deploy from branch`
4. Branch: `main` → `/ (root)`
5. Save → Your site will be at: `https://username.github.io/repo-name`

#### Option C: Vercel / Netlify
- Drag and drop the folder containing `index.html`, `styles.css`, `app.js`
- Or connect Git repository for automatic deployments

---

## 🎯 How to Use

### First-Time User (Firebase Mode):
1. Open the app → Click **"Begin your adventure"**
2. **Check** the "Use Firebase" checkbox
3. Enter email & password (min 6 characters)
4. (Optional) Add GitHub credentials for course content sync
5. Click **"Start My Learning Journey"**
6. Start tracking progress freely — no credit limits!

### First-Time User (Legacy Mode):
1. Open `index.html` in browser
2. Click **"Begin your adventure"** → skip Firebase checkbox
3. Set password (min 6 characters)
4. (Optional) Add GitHub credentials for cloud sync
5. Click **"Start My Learning Journey"**

### Returning User:
1. Enter your email (if Firebase) or password (if legacy)
2. Progress auto-loads from localStorage (and GitHub if configured)
3. Continue where you left off

### Tracking Progress:
- **Topics/Subtopics**: Click checkbox to mark complete
- **Exercises**: Check the box when done
- **Notes**: Type in the notes area → auto-saved

### Logout:
- Click the **lock icon** 🔒 in top-right
- Returns to lock screen

### Syncing GitHub (Optional):
- Click **"LOCAL"** badge in topbar
- Enter GitHub username, repo name, and Personal Access Token
- Course content (`course.json`) syncs automatically
- Progress (`progress.json`) syncs to your repo
- Token must have **repo** scope

### Changing Theme:
1. Click the palette icon (🎨) in top-right
2. Select your preferred theme
3. Transform happens instantly!

---

## 🎨 Customization

### Adding New Themes:
Edit `app.js` → `THEMES` object and add a new color palette. Then add the theme option in `index.html` inside `#themeModalBody`.

### Modifying Course Content:
Course data is in `app.js` → `DEFAULT_COURSE` constant (lines ~70-458). Edit modules, topics, resources, and exercises directly. Or update `course.json` if using GitHub sync.

---

## 🛠 Technical Details

- **No build process required** - pure HTML/CSS/JS
- **No backend server** - fully client-side
- **Works offline** after first load (Firebase auth persists)
- **Secure**: Passwords hashed with SHA-256 (legacy) or Firebase Auth (modern)
- **Responsive** - optimized for mobile & desktop
- **Modern browsers** - Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Firebase SDK**: v10.6.0 (compat libraries)

---

## 🐛 Troubleshooting

### Firebase not initializing:
- Check browser console for errors
- Ensure `FIREBASE_CONFIG` is properly filled with your credentials
- Verify Firebase SDK scripts are loading (check Network tab)
- Confirm Authentication is enabled in Firebase Console

### Login issues:
- Check email/password are correct
- If using legacy mode, ensure password is at least 6 characters
- Clear localStorage if switching between modes

### GitHub sync failing:
- Token must have `repo` scope (full repo access)
- Repo must exist and be accessible with the token
- Check Network tab for CORS or network errors
- Try generating a new token

### Progress not saving:
- Check localStorage is enabled (not in private/incognito mode)
- Check console for errors
- `scheduleSave()` debounces 900ms; wait a moment after changes

---

## 📝 Notes

- All emojis replaced with custom SVG icons for performance
- Course data automatically loads from `course.json` if GitHub sync enabled
- Progress saves automatically (debounced 900ms)
- Theme preference saved to localStorage
- Particles regenerate when theme changes

---

## 🎉 Enjoy Your Beautiful Learning Journey!

**Version**: 3.0 (Firebase Auth Added)
**Design**: Pinterest-style feminine aesthetic
**Animations**: Highly dynamic throughout
**Icons**: Custom SVG illustrations
**Themes**: 4 beautiful color palettes
**Auth**: Password (legacy) or Firebase Email/Password

## 🎨 Customization

### Adding New Themes:
Edit `app.js` → `THEMES` object and add new color palette.

### Modifying Course Content:
Course data is in `app.js` → `DEFAULT_COURSE` constant.
If GitHub sync is enabled, course.json is also fetched from the repository.

## 🔧 Technical Details

- **No build process required** - pure HTML/CSS/JS
- **No external dependencies** (except Google Fonts)
- **Works offline** after first load
- **Secure** - passwords hashed with SHA-256
- **Responsive** - works on all screen sizes
- **Modern browsers** - Chrome, Firefox, Safari, Edge

## 📝 Notes

- All emojis replaced with custom SVG icons
- Course data automatically loads from `course.json` if GitHub sync enabled
- Progress saves automatically (debounced 900ms)
- Theme preference saved to localStorage
- Particles regenerate when theme changes

## 🎉 Enjoy Your Beautiful Learning Journey!

---

**Version**: 2.0
**Design**: Pinterest-style feminine aesthetic
**Animations**: Highly dynamic throughout
**Icons**: Custom SVG illustrations
**Themes**: 4 beautiful color palettes
