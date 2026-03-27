# Learning Tracker Backend API

Node.js/Express server that provides secure API endpoints for the Learning Tracker app.

## Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Create `config.json`** in the project root (use `config.example.json` as template):
   - Fill in Firebase `firebase` section (from Firebase console)
   - Paste your Firebase service account JSON into the `serviceAccount` field
   - Set `backend.corsOrigins` to allowed frontend origins (default works for same-origin)
   - Optionally set `gemini.apiKey` for AI assistant

3. **Start the server:**
   ```bash
   # Development (with auto-reload)
   npm run dev

   # Production
   npm start
   ```

Server runs on http://localhost:3000 by default and serves the frontend automatically.

## CORS

The server allows requests from origins specified in `config.json` under `backend.corsOrigins`. The default configuration assumes the frontend is served from the same origin (port 3000). If you serve the frontend separately, update `corsOrigins` accordingly.

## API Endpoints

### GET /health
Health check endpoint.

### GET /api/config
Returns public configuration for the frontend (Firebase config and API base URL).

### GET /api/progress
Load user progress from Firestore.
**Auth required**: Firebase ID token in `Authorization: Bearer <token>` header.

Response:
```json
{
  "success": true,
  "progress": { "t_m1t1": true, "notes_m1": "..." },
  "updatedAt": "2024-01-15T12:00:00.000Z"
}
```

### POST /api/progress
Save user progress to Firestore.
**Auth required**: Firebase ID token in `Authorization: Bearer <token>` header.

Body:
```json
{
  "progress": { "t_m1t1": true, "notes_m1": "..." }
}
```

Response:
```json
{
  "success": true,
  "message": "Progress saved successfully"
}
```

### POST /api/gemini/chat (if Gemini enabled)
Send a message to the AI assistant. Streams response.

### GET /api/gemini/conversations
Retrieve conversation history.

### POST /api/gemini/conversations/clear
Clear conversation history.

## Architecture

- **express**: HTTP server & routing
- **firebase-admin**: Server-side Firebase access with service account
- **cors**: Cross-origin request handling
- **express-rate-limit**: Basic rate limiting
- **@google/generative-ai**: Gemini AI integration (optional)

## Environment

All configuration is centralized in `config.json`. No `.env` file needed. For production, you can set `CONFIG_PATH` environment variable to point to an alternative config location.
