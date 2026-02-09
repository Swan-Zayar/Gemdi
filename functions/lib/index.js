"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.geminiProxy = void 0;
const https_1 = require("firebase-functions/v2/https");
const genai_1 = require("@google/genai");
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
exports.geminiProxy = (0, https_1.onCall)({ secrets: ["GEMINI_API_KEY"] }, async (request) => {
    var _a;
    validateCommon(request.data);
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("GEMINI_API_KEY environment variable is not set");
        throw new https_1.HttpsError("failed-precondition", "API key not configured. Set GEMINI_API_KEY environment variable in Cloud Run.");
    }
    const { action, payload } = request.data;
    if (!action || !payload) {
        throw new https_1.HttpsError("invalid-argument", "Missing action or payload");
    }
    const ai = new genai_1.GoogleGenAI({ apiKey });
    const model = "gemini-3.0-flash";
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
        console.log(`Processing file: ${fileName}, type: ${fileMimeType}, size: ${fileSize || 'unknown'} bytes`);
        const prompt = `
      You are a world-class Lead Professor. Perform an EXHAUSTIVE EXTRACTION of: ${fileName}.
      
      CRITICAL FORMATTING INSTRUCTION: 
      - Use HIGHLY STRUCTURED BULLETED LISTS for all "detailedNotes". 
      - Every distinch line inside "detailedNotes" MUST be a bullet point.
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
        try {
            const response = await ai.models.generateContent({
                model,
                contents: {
                    parts: [
                        { inlineData: { data: fileBase64, mimeType: fileMimeType } },
                        { text: prompt },
                    ],
                },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: genai_1.Type.OBJECT,
                        properties: {
                            isStudyMaterial: { type: genai_1.Type.BOOLEAN },
                            validityWarning: { type: genai_1.Type.STRING },
                            studyPlan: {
                                type: genai_1.Type.OBJECT,
                                properties: {
                                    title: { type: genai_1.Type.STRING },
                                    overview: { type: genai_1.Type.STRING },
                                    topics: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } },
                                    steps: {
                                        type: genai_1.Type.ARRAY,
                                        items: {
                                            type: genai_1.Type.OBJECT,
                                            properties: {
                                                title: { type: genai_1.Type.STRING },
                                                description: { type: genai_1.Type.STRING },
                                                detailedNotes: { type: genai_1.Type.STRING },
                                            },
                                            required: ["title", "description", "detailedNotes"],
                                        },
                                    },
                                },
                                required: ["title", "overview", "steps", "topics"],
                            },
                            flashcards: {
                                type: genai_1.Type.ARRAY,
                                items: {
                                    type: genai_1.Type.OBJECT,
                                    properties: {
                                        question: { type: genai_1.Type.STRING },
                                        answer: { type: genai_1.Type.STRING },
                                        category: { type: genai_1.Type.STRING },
                                        stepTitle: { type: genai_1.Type.STRING },
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
            const parsedResult = JSON.parse(text);
            console.log("Successfully processed file and generated study materials");
            return {
                studyPlan: parsedResult.studyPlan,
                flashcards: parsedResult.flashcards || [],
                isStudyMaterial: (_a = parsedResult.isStudyMaterial) !== null && _a !== void 0 ? _a : true,
                validityWarning: parsedResult.validityWarning || "",
            };
        }
        catch (error) {
            console.error("Error in processStudyContent:", error);
            throw new https_1.HttpsError("internal", `Failed to process file: ${error.message}`);
        }
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
        try {
            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: genai_1.Type.ARRAY,
                        items: {
                            type: genai_1.Type.OBJECT,
                            properties: {
                                question: { type: genai_1.Type.STRING },
                                options: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } },
                                correctAnswer: { type: genai_1.Type.STRING },
                                explanation: { type: genai_1.Type.STRING },
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
            console.log("Successfully generated quiz");
            return JSON.parse(text);
        }
        catch (error) {
            console.error("Error in generateQuiz:", error);
            throw new https_1.HttpsError("internal", `Failed to generate quiz: ${error.message}`);
        }
    }
    throw new https_1.HttpsError("invalid-argument", "Unsupported action");
});
//# sourceMappingURL=index.js.map