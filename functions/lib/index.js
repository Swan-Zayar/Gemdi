"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.geminiProxy = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { GoogleGenAI, Type } = require("@google/genai");
admin.initializeApp();
const MAX_PROMPT_LENGTH = 500;
const ALLOWED_FILE_TYPES = new Set([
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;
const sanitizePrompt = (prompt) => {
    if (!prompt)
        return "";
    return String(prompt)
        .trim()
        .replace(/[<>{}[\]\\|`]/g, "")
        .replace(/\s+/g, " ")
        .substring(0, MAX_PROMPT_LENGTH);
};
const validateCommon = (data) => {
    if (!data || typeof data !== "object") {
        throw new https_1.HttpsError("invalid-argument", "Invalid payload");
    }
};
exports.geminiProxy = onCall({ secrets: ["GEMINI_API_KEY"] }, async (request) => {
    var _a;
    validateCommon(request.data);
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Authentication required");
    }
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new https_1.HttpsError("failed-precondition", "Missing GEMINI_API_KEY");
    }
    const { action, payload } = request.data;
    if (!action || !payload) {
        throw new https_1.HttpsError("invalid-argument", "Missing action or payload");
    }
    const ai = new GoogleGenAI({ apiKey });
    const model = "gemini-3-flash-preview";
    if (action === "processStudyContent") {
        const { fileBase64, fileName, fileMimeType, customPrompt, fileSize, } = payload;
        if (!fileBase64 || !fileName || !fileMimeType) {
            throw new https_1.HttpsError("invalid-argument", "Missing file payload");
        }
        if (typeof fileSize === "number" && fileSize > MAX_FILE_SIZE_BYTES) {
            throw new https_1.HttpsError("invalid-argument", "File exceeds 50 MB limit");
        }
        if (!ALLOWED_FILE_TYPES.has(fileMimeType)) {
            throw new https_1.HttpsError("invalid-argument", "Unsupported file type");
        }
        const safeCustomPrompt = sanitizePrompt(customPrompt);
        const prompt = `
      You are a world-class Lead Professor. Perform an EXHAUSTIVE EXTRACTION of:
      ${fileName}.

      CRITICAL FORMATTING INSTRUCTION:
      - Use HIGHLY STRUCTURED BULLETED LISTS for all "detailedNotes".
      - Every line in "detailedNotes" MUST start with a dash (-) followed by a
        space.
      - Each bullet should contain a complete, technical thought.

      STRICT CONSTRAINTS:
      - NO QUESTIONS: Provide only declarative knowledge.
      - NO SUMMARIZATION: Capture 100% of technical details, formulas, and
        nuances.
      - NO IMAGES: Do not describe or generate visual aids.
      - NO TIME ESTIMATES: Do not calculate study durations.

      MATH/SCIENCE NOTATION RULES:
      - Use ONLY single dollar signs for inline math ($x^2$).
      - CRITICAL: NO spaces between dollar signs and content (use "$x$").
      - Use standard LaTeX for subscripts (_), superscripts (^), and fractions
        (\\frac).

      Deliverables:
      1. Study Plan title and overview.
      2. For EACH unit: "title", "description", and exhaustive "detailedNotes"
         (dash-prefixed technical points).
      3. CRITICAL - FLASHCARDS: For EACH unit, generate EXACTLY 3-5 flashcards
         with "stepTitle" matching the unit title exactly. MINIMUM 3 flashcards
         per unit is MANDATORY.
      4. Key topics.
      ${safeCustomPrompt ?
            `\n\nADDITIONAL CUSTOM INSTRUCTIONS FROM USER:\n${safeCustomPrompt}` :
            ""}
    `;
        const response = await ai.models.generateContent({
            model,
            contents: {
                parts: [
                    { inlineData: { data: fileBase64, mimeType: fileMimeType } },
                    { text: prompt },
                ],
            },
            config: {
                thinkingConfig: { thinkingBudget: 24576 },
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        isStudyMaterial: { type: Type.BOOLEAN },
                        validityWarning: { type: Type.STRING },
                        studyPlan: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                overview: { type: Type.STRING },
                                topics: { type: Type.ARRAY, items: { type: Type.STRING } },
                                steps: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            title: { type: Type.STRING },
                                            description: { type: Type.STRING },
                                            detailedNotes: { type: Type.STRING },
                                        },
                                        required: ["title", "description", "detailedNotes"],
                                    },
                                },
                            },
                            required: ["title", "overview", "steps", "topics"],
                        },
                        flashcards: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    question: { type: Type.STRING },
                                    answer: { type: Type.STRING },
                                    category: { type: Type.STRING },
                                    stepTitle: { type: Type.STRING },
                                },
                                required: ["question", "answer", "stepTitle"],
                            },
                        },
                    },
                    required: [
                        "isStudyMaterial",
                        "validityWarning",
                        "studyPlan",
                        "flashcards",
                    ],
                },
            },
        });
        let text = response.text || "{}";
        if (text.includes("```")) {
            const match = text.match(/```(?:json)?([\s\S]*?)```/);
            if (match)
                text = match[1].trim();
        }
        const result = JSON.parse(text);
        return {
            studyPlan: result.studyPlan,
            flashcards: result.flashcards || [],
            isStudyMaterial: (_a = result.isStudyMaterial) !== null && _a !== void 0 ? _a : true,
            validityWarning: result.validityWarning || "",
        };
    }
    if (action === "generateQuiz") {
        const { studyPlan } = payload;
        if (!studyPlan || !studyPlan.title || !Array.isArray(studyPlan.steps)) {
            throw new https_1.HttpsError("invalid-argument", "Missing study plan");
        }
        const context = `
      Title: ${studyPlan.title}
      Detailed Notes: ${studyPlan.steps
            .map((s) => s.detailedNotes || "")
            .join("\n\n")}
    `;
        const prompt = `
      Generate a 10-question MCQ quiz for: "${studyPlan.title}".
      - USE LaTeX notation ($...$) for math.
      - Ensure detailed explanations.

      CONTEXT:
      ${context}
    `;
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            correctAnswer: { type: Type.STRING },
                            explanation: { type: Type.STRING },
                        },
                        required: ["question", "options", "correctAnswer", "explanation"],
                    },
                },
            },
        });
        let text = response.text || "[]";
        if (text.includes("```")) {
            const match = text.match(/```(?:json)?([\s\S]*?)```/);
            if (match)
                text = match[1].trim();
        }
        return JSON.parse(text);
    }
    throw new https_1.HttpsError("invalid-argument", "Unsupported action");
});
//# sourceMappingURL=index.js.map