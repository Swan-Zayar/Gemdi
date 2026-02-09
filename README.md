# Gemdi

Gemdi is an AI-powered study companion that turns course files into structured study plans, flashcards, and quizzes so students can move from passive reading to active recall in minutes.

## Why It Matters

Students often get overwhelmed by dense PDFs and messy notes. Gemdi extracts the knowledge, structures it into a roadmap, and builds drills and quizzes to reinforce learning.

## Demo

- Live Demo: (add link)
- Video Demo: (add link)

## What It Does

- Upload PDF/DOCX notes and generate a structured study plan.
- Auto-create flashcards and a multiple-choice quiz.
- Track session progress and quiz history.
- Customize AI behavior with user prompts.
- Manage user profiles with avatar and language preferences.

## How It Works

1. Upload a file.
2. Gemini extracts a study plan and flashcards.
3. Gemdi renders the material with KaTeX-safe math formatting.
4. Users drill flashcards and take a quiz to validate mastery.

## Architecture

- Frontend: React + Vite + TypeScript
- Backend: Firebase Functions proxy for Gemini
- Data: Cloud Firestore (sessions + profiles)

## Google Services Used

- Firebase Authentication
- Cloud Firestore
- Firebase Functions (Gemini proxy)
- Google Gemini API (Generative AI via @google/genai)

## Setup

### Prerequisites

- Node.js 18+
- Firebase project

### Environment Variables

Local development uses a .env file with Firebase client config:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Cloud Run expects these values as runtime environment variables (the container generates `/config.js` on startup).

Set the Gemini API key as a Firebase Functions secret:

```
firebase functions:secrets:set GEMINI_API_KEY
```

### Install

```
npm install
cd functions && npm install
```

### Run

```
npm run dev
```

### Deploy

```
firebase deploy --only functions,firestore:rules
```

### Cloud Run (Docker)

```
docker build -t gemdi .
docker run --rm -e PORT=3000 \
	-e VITE_FIREBASE_API_KEY=... \
	-e VITE_FIREBASE_AUTH_DOMAIN=... \
	-e VITE_FIREBASE_PROJECT_ID=... \
	-e VITE_FIREBASE_STORAGE_BUCKET=... \
	-e VITE_FIREBASE_MESSAGING_SENDER_ID=... \
	-e VITE_FIREBASE_APP_ID=... \
	-p 3000:3000 gemdi
```

```
gcloud run deploy gemdi \
	--source . \
	--region asia-northeast2 \
	--allow-unauthenticated \
	--set-env-vars PORT=3000,VITE_FIREBASE_API_KEY=...,VITE_FIREBASE_AUTH_DOMAIN=...,VITE_FIREBASE_PROJECT_ID=...,VITE_FIREBASE_STORAGE_BUCKET=...,VITE_FIREBASE_MESSAGING_SENDER_ID=...,VITE_FIREBASE_APP_ID=...
```

## Security Notes

- Gemini requests are proxied through Firebase Functions to keep API keys server-side.
- AI output is rendered safely with KaTeX-only math formatting.
- Upload size is capped to preserve extraction quality.

## Team

- (add team members and roles)

## Future Work

- File uploads via Cloud Storage for larger documents.
- Smarter adaptive quizzes per user performance.
- Export study plan to Notion/Markdown.
