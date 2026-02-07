# Gemdi

Gemdi is an AI-powered study companion that turns uploaded PDFs/DOCX files into structured study plans, flashcards, and quizzes. It supports user profiles, progress tracking, and multilingual UI, with a focus on high-quality extraction and active recall.

## Key Features

- Upload course materials and generate a structured study plan.
- Auto-create flashcards and a multiple-choice quiz.
- Track quiz history and session progress.
- Customize AI behavior with user prompts.
- Profile management with avatar and language preferences.

## Google Services Used

- Firebase Authentication
- Cloud Firestore
- Firebase Functions (Gemini proxy)
- Google Gemini API (Generative AI via @google/genai)

## Tech Stack

- React + Vite + TypeScript
- Firebase SDK
- PDF/DOCX parsing (pdfjs-dist, mammoth)

## Notes

- Gemini requests are proxied through Firebase Functions to keep API keys server-side.
- AI output is rendered safely with KaTeX-only math formatting.
