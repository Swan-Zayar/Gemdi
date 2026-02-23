# Gemdi

https://gemdi-933398348693.asia-northeast2.run.app - Google Cloud link

### What is Gemdi

Gemdi is an AI-powered study companion that turns course files into structured study plans, flashcards, and quizzes so students can move from passive reading to active recall in minutes.

Gemdi uses AI to extract key concepts from uploaded files, generate study plans, create flashcards, and design quizzes. This enables students to transition from passive reading to active recall efficiently.

---

## Repository Overview + Team Introduction

This repository contains the source code for Gemdi, a modern web application designed to enhance the learning experience. The project is maintained by a dedicated team of developers, designers, and AI researchers:

- **Team Members:**
  - Swan

---

## Project Overview

### Problem Statement

Students often struggle with dense course materials and unstructured notes, leading to inefficient study habits and poor retention. Gemdi addresses this by transforming course files into structured, interactive study tools.

### SDG Alignment

Gemdi aligns with the United Nations Sustainable Development Goal (SDG) **4: Quality Education**. By leveraging AI, Gemdi promotes inclusive and equitable quality education and lifelong learning opportunities for all.

## Key Features

- **File Uploads:** Upload PDF/DOCX notes to generate structured study plans.
- **Flashcards & Quizzes:** Auto-generate flashcards and multiple-choice quizzes.
- **Progress Tracking:** Track session progress and quiz history.
- **Customizable AI:** Personalize AI behavior with user prompts that has robust sanitization
- **User Profiles:** Manage profiles with avatars and language preferences.

---

## Overview of Technologies Used

### Google Technologies

- **Firebase Authentication:** Secure user authentication.
- **Cloud Firestore:** Real-time database for sessions and profiles.
- **Firebase Functions:** Serverless backend for proxying Gemini API requests.
- **Firebase Storage:** A storage used for firebase functions to retrieve the PDF/DOCX files
- **Google Gemini API:** Generative AI for extracting and structuring study materials. (Google AI Studio)
- **Google Cloud Console:** Maintains the production-ready website of Gemdi

### Other Supporting Tools / Libraries

- **React + Vite + TypeScript:** Frontend development stack.
- **Tailwind CSS:** Utility-first CSS framework for styling.
- **KaTeX:** Safe rendering of mathematical/physics expressions.
- **i18next:** Internationalization for multi-language support. (Hope to expand soon with Gemini)
- **Pencil:** Extension used to plan the design of the project
- **21st dev magic:** Design ideas
- **Claude Code:** Assistance with API implementation, Design implementation and code review

---

## Implementation Details & Innovation

### System Architecture

- **Frontend:** Built with React, Vite, and TypeScript for a fast and responsive user interface.
- **Backend:** Firebase Functions act as a proxy for the Google Gemini API, ensuring secure and efficient communication.
- **Database:** Cloud Firestore stores user sessions, profiles, and study data and Firebase storage temporarily stores PDF/DOCX files

### Workflow

1. **File Upload:** Users upload course files.
2. **AI Processing:** Google Gemini API extracts key concepts and generates study materials.
3. **Rendering:** Gemdi renders the study plan, flashcards, and quizzes with KaTeX-safe math formatting.
4. **User Interaction:** Students interact with the generated materials, track progress, and customize their experience.

---

## Challenges Faced

- **AI Output Quality:** Ensuring the accuracy and relevance of AI-generated study materials and most importantly, fixing the structure of the study materials that Gemini produced so that it's not just a block with text; but with readable and understandable flow of the lessons.
- **Performance Optimization:** Handling large file uploads and processing efficiently. (Changed from base64 (local dev) to Firebase storage (production ready) which temporarily stores PDF/DOCX for Gemini proxy function to processs)
- **Cross-Browser Compatibility:** Ensuring consistent behavior across different browsers.
- **Localization:** Implementing multi-language support for a global audience. (Aimed for scalability and spread the usage for a much stronger alignment with SDG 4 - Quality Education)

---

---

## Installation & Setup

### Prerequisites

- Node.js 18+
- Firebase project (Remember the credentials)

### Environment Variables

Create a `.env` file with the following Firebase client configuration (for local dev):

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

```

For production (in Google Cloud Run):

`gcloud run deploy gemdi   --source .   --region asia-northeast2   --allow-unauthenticated   --set-env-vars PORT=3000,VITE_FIREBASE_API_KEY=your-api-`

Set the Gemini API key as a Firebase Functions secret:

```
firebase functions:secrets:set YOUR_GEMINI_API_KEY
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
firebase deploy --only functions,firestore:rules,storage
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

---

## Future Roadmap

- **More options for Uploads:** Support for larger documents via Cloud Storage and also addition of URLs and YouTube video links to also process study materials.
- **Adaptive Quizzes:** Smarter quizzes tailored to user performance. (Better Tensorflow implementation)
- **Gamification:** Add achievements and rewards to boost engagement.
- **Monetization:** Better Gemini model for hardcore users with a paid subscription
- **Personal Gemini:** Built-in Gemini to ask questions on the spot while studying
