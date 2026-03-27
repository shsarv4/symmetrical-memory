# SwatiArc Learning Tracker - Easy Setup

**No technical knowledge needed! Follow these simple steps.**

---

## 📦 What You're Building

A beautiful learning tracker where you can:
- ✅ Track which topics you've completed
- ✅ Save your progress in the cloud (accessible from any device)
- ✅ Get help from an AI assistant (optional)
- ✅ Choose from 4 beautiful color themes

---

## ⏱️ Time Required

**First time setup**: 15-20 minutes
**After that**: Just open and use!

---

## 📋 Step 1: Get Your Firebase Project (5 minutes)

Firebase is Google's free service that will store your data securely.

### 1.1 Create a Firebase Account

1. Go to https://firebase.google.com/
2. Click **"Get started"** (top right)
3. Sign in with your Google account
4. Click **"Create a project"** or **"Add project"**

### 1.2 Name Your Project

1. Project name: `swati-tracker` (or any name you like)
2. Click **"Continue"**
3. **Disable** Google Analytics (optional) - you can skip this
4. Click **"Create project"**
5. Wait 30 seconds → Click **"Continue"**

### 1.3 Turn On Email Login

1. In the left menu, click **"Authentication"**
2. Click the **"Get started"** button
3. Click **"Email/Password"** icon
4. Click **"Enable"**
5. Click **"Save"**

✅ Done! Your project is ready.

### 1.4 Get Your Firebase Config (Important!)

1. Click the **gear icon** ⚙️ (top right) → **"Project settings"**
2. Scroll down to **"Your apps"** section
3. Click the **Web icon** `</>` (it says "Add app")
4. **Nickname**: `swati-tracker-web` (or any name)
5. **Check the box** that says "Also set up Firebase Hosting?" → **NO, skip this**
6. Click **"Register app"**
7. You'll see a code block that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyB-...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

8. **Copy all of this** (click the copy icon on the right)
9. **Keep this tab open** - you'll need it in Step 3

---

## 💻 Step 2: Install Software on Your Computer (5 minutes)

### Windows/Mac Users:

1. **Download Node.js**:
   - Go to https://nodejs.org/
   - Click the big green **LTS** button
   - Install it (like any normal program)
   - **Restart your computer** after installation

2. **Open Command Prompt/Terminal**:
   - Windows: Press `Win + R`, type `cmd`, press Enter
   - Mac: Open "Terminal" from Applications

3. **Check Node.js installed**:
   Type this and press Enter:
   ```bash
   node --version
   ```
   You should see something like `v18.x.x` or `v20.x.x` ✅

---

## 🗂️ Step 3: Prepare the Configuration File (3 minutes)

### 3.1 Create config.json

1. In your project folder, create a new file named **`config.json`**
2. Copy the entire content from **`config.example.json`** and paste it into `config.json`
3. Fill in your values:
   - `firebase.apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`, `measurementId` → paste from Step 1.4
   - `serviceAccount` → copy the entire JSON from Firebase Service Account (see Step 4)
   - `backend.corsOrigins` → keep as `["http://localhost:3000"]` for now (same origin since backend serves frontend)
   - `app.apiBaseUrl` → leave empty `""` for same origin (or "http://localhost:3000")
   - `gemini.apiKey` (optional) → get from https://makersuite.google.com/app/apikey

✅ This single file contains ALL configuration!

---

## 🔑 Step 4: Get the Firebase Service Account Key (3 minutes)

### 4.1 Download Service Account Key

1. Go back to your Firebase tab in the browser
2. Click the **gear icon** ⚙️ → **"Project settings"**
3. Click **"Service accounts"** tab (top row)
4. Click **"Generate new private key"** button
5. A warning pops up → click **"Generate key"**
6. A `.json` file will download (something like `swati-tracker-firebase-adminsdk-xxxxx.json`)

### 4.2 Copy the Key into config.json

1. Open the downloaded `.json` file
2. **Select ALL the text** (`Ctrl + A`)
3. **Copy** (`Ctrl + C`)
4. Open your project's `config.json` file
5. Find the line `"serviceAccount": { ... }`
6. Replace the entire `{ ... }` object with the JSON you copied (make sure it's a valid object, no trailing commas)
7. Save the file (`Ctrl + S`)

✅ This key is secret and stays on your computer only!

---

## 🚀 Step 5: Install and Run (2 minutes)

### 5.1 Install Backend Dependencies

Open a terminal in your project folder and run:

```bash
cd backend
npm install
```

Wait about 1 minute while it installs.

### 5.2 Start the Backend Server

In the same terminal (still in `backend` folder), run:

```bash
npm run dev
```

You should see:
```
✅ Firebase Admin initialized with service account from config.json
🚀 Backend server running on http://localhost:3000
🔐 Firebase Admin initialized
🌐 Frontend served from /path/to/frontend
```

✅ **Leave this terminal window open!**

---

## 🌐 Step 6: Open Your App!

1. Open your web browser (Chrome, Firefox, etc.)
2. Type in the address bar: **http://localhost:3000**
3. Press Enter

You should see a beautiful purple/pink screen with a lock icon!

---

## 🎉 Step 7: Create Your Account

1. Click **"Begin your adventure ✨"**
2. Choose a password (at least 6 characters)
3. ✅ **Check the box** that says "Use Firebase for login & credits"
4. Enter your email
5. Click **"Start My Learning Journey"**

🎊 **You're in!** The app should load with your learning dashboard.

---

## ✅ Test That It Works

1. Click on **"Python Programming"** module
2. Check a topic as complete (click the checkbox)
3. **Look at the backend terminal** - you should see:
   ```
   ✅ Progress saved to backend
   ```
4. Refresh the page (`F5`)
5. Your checkmarks should still be there ✅

**Congrats! Your app is working!** 🎉

---

## 🔧 If Something Goes Wrong

### "npm install" fails or hangs

**Problem**: Node.js not installed correctly

**Fix**:
1. Restart your computer
2. Re-run Step 2 to verify `node --version` works
3. Try `npm install` again

### Backend says "Firebase Admin initialization failed"

**Problem**: The `config.json` file is missing or has invalid service account

**Fix**:
1. Make sure `config.json` exists in project root
2. Make sure the `serviceAccount` field contains valid JSON (should start with `{` and end with `}`)
3. If unsure, repeat **Step 4**

### "localhost:3000 refused to connect" in browser

**Problem**: Backend not running

**Fix**:
1. Check backend terminal - is it running? Should say "server running on http://localhost:3000"
2. If not, restart it: `cd backend && npm run dev`

### "No token provided" error in console

**Problem**: Not logged in

**Fix**:
1. Log out (click 🔒 in top right)
2. Log back in
3. Make sure you checked "Use Firebase for login & credits" during signup

### Page is blank or styles not loading

**Fix**:
1. Make sure the backend is running (Step 5.2)
2. Try hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
3. Check browser console (`F12`) for errors

### Firebase signup/login returns 400 (Bad Request)

**Problem**: Firebase Authentication is not enabled OR Firebase config values are incorrect.

**Why this happens**: The Firebase Identity Toolkit API returns 400 when:
- Email/Password authentication is not enabled in your Firebase project
- The API key doesn't match the project
- The authDomain is incorrect
- The project doesn't have Authentication service activated

**Fix**:

1. **Enable Email/Password Authentication** (MOST COMMON):
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Click **Authentication** in left menu
   - Click **"Get started"** (or **Sign-in methods** tab)
   - Click **Email/Password**
   - Click **Enable**
   - Click **Save**

2. **Verify Firebase Config in `config.json`**:
   - In Firebase Console, click the **gear icon** ⚙️ → **Project settings**
   - Scroll to **"Your apps"** section
   - Click your web app (or create one if missing)
   - Copy the entire `firebaseConfig` object
   - Paste into your `config.json` under `"firebase"` field
   - Must have: `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`

3. **Restart backend**:
   ```bash
   cd backend
   npm run dev
   ```

4. **Check browser console** (`F12`) for detailed Firebase error codes:
   - `auth/operation-not-allowed` → Enable Email/Password (step 1)
   - `auth/invalid-api-key` → Fix API key in config.json
   - `auth/invalid-email` → Enter valid email

---

## 🌟 Optional: Add AI Assistant (Gemini)

Make your app smarter with an AI helper!

### Get a Free Gemini API Key

1. Go to https://makersuite.google.com/app/apikey
2. Click **"Create API Key"**
3. Copy the key

### Add the Key

In your `config.json`, set:
```json
"gemini": {
  "enabled": true,
  "apiKey": "YOUR_GEMINI_API_KEY_HERE"
}
```

Restart backend (`Ctrl+C` then `npm run dev`)

✅ You'll see a purple floating button appear → click it to chat with AI about your learning!

---

## 📱 Using Your App

### Day-to-Day Use

1. Start the backend (if not already running):
   ```bash
   cd backend && npm run dev
   ```
2. Open browser → **http://localhost:3000**
3. Login with your email and password
4. Start learning! ✅

### To Add New Course Content

Edit the `course.json` file in the project root. It's just a readable format. Each module has:
- `title`: What shows in the sidebar
- `topics`: List of topics
- `subtopics`: Details under each topic
- `resources`: Links to videos and tutorials
- `exercises`: Practice tasks

### To Change Colors

Edit `frontend/styles.css` and search for `--lavender:` - those are the color variables.
Or use the **palette icon** 🎨 in the app to switch between 4 premade themes.

---

## ☁️ Deploying Online (Make It Public)

Want to share this with friends or access from anywhere?

### Backend (Render - Free)

1. Push your code to GitHub (create a free repo)
2. Sign up at https://render.com
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repo
5. Name: `learning-tracker-api`
6. Build: `npm install`
7. Start: `npm start`
8. Add environment variable: `CONFIG_PATH=/opt/render/project/src/config.json` (optional, defaults to project root/config.json)
9. **Upload your `config.json` file** in Render (Files section) or set it as a secret file
10. Click **"Create"**
11. Wait 2-3 minutes → Copy the URL (like `https://learning-tracker-api.onrender.com`)

### Frontend (Netlify - Free)

1. Go to https://app.netlify.com/drop
2. Drag your project folder (the whole folder) onto the window
3. Netlify gives you a URL like `https://your-site.netlify.app`

**Important**: In your `config.json` on Render, set:
```json
"app": {
  "apiBaseUrl": "https://learning-tracker-api.onrender.com"
}
```

Push the change to GitHub to update Render's config.

---

## 📞 Need Help?

### Quick Checklist

- [ ] Firebase project created
- [ ] Authentication turned ON (Email/Password)
- [ ] Service Account key downloaded and added to `config.json`
- [ ] `config.json` contains all Firebase config values
- [ ] Node.js installed (`node --version` works)
- [ ] Ran `cd backend && npm install`
- [ ] Backend running on port 3000
- [ ] Can open http://localhost:3000
- [ ] Can create account and login

### Common Questions

**Q: Do I need to pay for anything?**
A: No! Firebase and Render/Netlify have free tiers that are enough for personal use.

**Q: Is my data safe?**
A: Yes. Firebase stores data encrypted. Only you can access your account (and you have the service account key).

**Q: Can I backup my progress?**
A: Firebase automatically backs up your data. You can also export manually in Firebase Console.

**Q: Why is everything running on one port now?**
A: The backend now serves the frontend files too, simplifying setup. No need for two servers!

---

## 🎊 You're Done!

If you completed all steps, congratulations! 🎉

You now have a fully functional, beautiful learning tracker with:
- ✅ Cloud sync (access from anywhere)
- ✅ Secure login
- ✅ Beautiful themes
- ✅ Optional AI assistant
- ✅ Single configuration file
- ✅ No need to run multiple servers

**Enjoy your learning journey!** ✨

---

*Last updated: March 2025*
