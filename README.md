# Docmate

AI-powered multilingual healthcare companion

Docmate is a TypeScript-first web application that provides an AI-assisted, multilingual assistant for healthcare scenarios. It combines a responsive React + Vite front end, a TypeScript Node server that integrates with generative AI providers (Google Generative AI SDK used in this repository), and Firebase for authentication and optional persistence. The app supports PDF export and multilingual output.

---

Table of contents

- Project overview
- Tech stack
- Repository structure
- Prerequisites
- Environment variables
- Local setup (frontend & backend)
- AI integration & implementation notes
- Building and deployment
- Testing and linting
- Troubleshooting
- Contributing
- License

---

Project overview

This repository contains the Docmate application: an AI-powered, multilingual healthcare companion. The core idea is to provide an assistant that can understand patients' needs, summarize health information, generate medical documents (PDFs), and assist in multiple languages. The repository is split into at least two main parts:

- client/ — Vite + React + TypeScript single-page application (SPA). It contains the UI, PDF export utilities, and Firebase client setup.
- server/ — Node + TypeScript backend that handles AI calls, server-side business logic, and any server-side rendering or PDF creation if used.

The repository uses TypeScript for the majority of code (≈95%).

Tech stack

- Frontend: React, Vite, TypeScript, TailwindCSS (in devDependencies), framer-motion, react-router-dom, @react-pdf/renderer, html2canvas, jspdf
- Backend: Node.js (TypeScript), Google Generative AI SDK (@google/generative-ai) (requires Node >=18), optional other LLM providers can be integrated
- Authentication & Storage: Firebase (client-side usage seen in package.json)
- Build tools & tooling: Vite, TypeScript, ESLint, Prettier (if configured)

Repository structure (top-level)

A typical tree (only the top-level folders and files common in this repo):

- client/                 # React + Vite frontend
  - package.json          # frontend dependencies & scripts
  - src/                  # React source files
- server/                 # Node + TypeScript backend
  - package.json          # server dependencies (may include @google/generative-ai)
  - src/                  # backend source files
- README.md               # (this file)
- .gitignore

Note: Please open the repo to inspect the exact server package.json and src files for route names and exact scripts.

Prerequisites

- Node.js (v18 or later recommended because the Google Generative AI SDK often requires Node >=18)
- npm (or yarn/pnpm) — examples below use npm
- Firebase project (if you want to enable auth/firestore/storage)
- Google Cloud project with Generative AI API access OR alternative LLM API keys (OpenAI, Anthropic, etc.)

Environment variables

This repo separates client and server configuration. Use two env files locally:

- client/.env.local (loaded by Vite)
- server/.env (or server/.env.local) loaded by your backend config

Example client/.env.local

VITE_FIREBASE_API_KEY="your-firebase-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="..."
VITE_FIREBASE_APP_ID="1:...:web:..."
VITE_API_BASE_URL="http://localhost:4000"  # where your server runs

Notes: Vite exposes variables prefixed with VITE_ to the client. Do NOT store private server-side keys here.

Example server/.env

PORT=4000
NODE_ENV=development
# If using Google Generative AI via API key
GOOGLE_API_KEY="your-google-api-key"
# Alternatively, you may use a JSON service account credentials file and set GOOGLE_APPLICATION_CREDENTIALS
# GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"

# If using Firebase Admin in server
FIREBASE_CLIENT_EMAIL="..."
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FIREBASE_PROJECT_ID="your-project-id"

# Optional: OpenAI
OPENAI_API_KEY="sk-..."

Make sure to restrict keys in production and rotate them periodically.

Local setup (step-by-step)

1. Clone the repo

   git clone https://github.com/Dineshkumar2006471/Docmate.git
   cd Docmate

2. Install dependencies

   # Frontend
   cd client
   npm install

   # Backend
   cd ../server
   npm install

3. Create environment files

   - Add client/.env.local using the example variables above.
   - Add server/.env using the example variables above.

4. Firebase setup (if used)

   - In the Firebase Console (https://console.firebase.google.com/), create a new project.
   - Enable Authentication providers you plan to use (Email/Password, Google sign-in, etc.).
   - (Optional) Enable Firestore or Realtime Database and Storage if the app persists data.
   - Copy the client Firebase config into client/.env.local (VITE_FIREBASE_* values).

5. Google Generative AI setup

   Option A: API key
   - In Google Cloud Console, enable the Generative AI API for your project and create an API key.
   - Put that key in server/.env as GOOGLE_API_KEY.

   Option B: Service account (recommended for server-side usage)
   - Create a service account with appropriate roles for the Generative AI API.
   - Download the JSON credentials file and either set GOOGLE_APPLICATION_CREDENTIALS to its path or load it directly in your server code.

6. Start development servers

   # In two terminals

   # Terminal 1 — start server
   cd server
   npm run dev
   # or if the server uses ts-node or nodemon: npm run start:dev

   # Terminal 2 — start client
   cd client
   npm run dev

   Open http://localhost:5173 (default Vite port) for the frontend; the client should proxy or call the API at http://localhost:4000 (adjust according to API_BASE_URL).

AI integration & implementation notes

- The server directory in this repository includes the Google Generative AI SDK in node_modules, indicating server-side calls to Google AI. The server should contain an adapter/service that:
  - Accepts requests from the client (e.g., /api/ai/chat or /api/ai/summarize)
  - Forwards prompt + context to the Generative AI API
  - Receives the model response, optionally post-processes it (translation, redaction, formatting), and returns structured data to the client

- Security:
  - Never expose server-side API keys to the client. Keep LLM provider keys in server-side env.
  - Enforce rate-limiting and quotas on your server endpoints to avoid unexpected costs.

- Switching providers:
  - Implement a service layer (AIAdapter) that decouples your app from a single provider. You can then plug in OpenAI or Anthropic by implementing the same interface.

Example pseudo-code server flow (TypeScript)

```ts
// server/src/controllers/aiController.ts
import { Request, Response } from 'express';
import { aiService } from '../services/aiService';

export const chat = async (req: Request, res: Response) => {
  const { messages, language } = req.body;
  const result = await aiService.chat({ messages, language });
  res.json(result);
};
```

PDF export and document generation

- The frontend includes @react-pdf/renderer and jspdf + html2canvas. Typical approaches:
  - Use @react-pdf/renderer to generate printable PDF on the client or server.
  - Use html2canvas + jspdf when you want to capture the rendered DOM and export it as a PDF.

- For large or sensitive documents, consider generating PDFs server-side to avoid sending full content to the client for generation.

Building and deployment

Build steps (production):

# Frontend
cd client
npm run build
# Vite will output static files to dist/ by default

# Backend
cd server
npm run build
# or tsc -b depending on the repo scripts

Deployment options:

- Frontend
  - Vercel, Netlify: deploy the client/dist as a static site
  - Firebase Hosting: serve the client via Firebase Hosting

- Backend
  - Google Cloud Run (recommended for Google AI integration)
  - Firebase Functions (if you want serverless functions close to your Firebase project)
  - Heroku / Render / Railway

Make sure to set environment variables on the hosting provider (API keys, Firebase admin creds).

Testing & linting

- Frontend: run npm run lint in the client directory.
- Backend: run any server tests (npm test) if present.
- Type checking: tsc --noEmit or any configured typecheck scripts.

Troubleshooting

- 401/403 from Google Generative AI: verify API key or service account permissions and that the Generative AI API is enabled in the Google Cloud project.
- Firebase auth errors: ensure the client config matches the Firebase console values and that the auth provider is enabled.
- CORS errors: ensure the server sends Access-Control-Allow-Origin or configure proxying in Vite during development.

Contributing

Contributions are welcome. Suggested workflow:

1. Fork the repository
2. Create a feature branch
   git checkout -b feat/clear-description
3. Make changes and add tests
4. Push and open a pull request

Please follow the existing TypeScript ESLint rules and add unit tests when adding significant features.

License

Add a LICENSE file to this repository with your preferred license. If you want to use MIT, add an MIT LICENSE.

Contact

If you need help or want to discuss improvements, open an issue or contact the maintainer @Dineshkumar2006471.

----

Notes about this README

This README is written to be a comprehensive, practical guide for local development and deployment. It intentionally avoids asserting exact script names that may differ in your server package.json; inspect server/package.json and adjust the commands (npm run dev, npm run start:dev, npm run build) accordingly.