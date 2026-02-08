const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");

admin.initializeApp();

const MAX_PROMPT_LENGTH = 500;
const ALLOWED_FILE_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

const sanitizePrompt = (prompt) => {
  if (!prompt) return "";
  return String(prompt)
    .trim()
    .replace(/[<>{}[\]\\|`]/g, "")
    .replace(/\s+/g, " ")
    .substring(0, MAX_PROMPT_LENGTH);
};

const validateCommon = (data) => {
  if (!data || typeof data !== "object") {
    throw new HttpsError("invalid-argument", "Invalid payload");
  }
};

exports.geminiProxy = onCall(async (request) => {
  const { data } = request;
  validateCommon(data);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY environment variable is not set");
    throw new HttpsError("failed-precondition", "API key not configured. Set GEMINI_API_KEY environment variable in Cloud Run.");
  }

  const { action, payload } = data;
  if (!action || !payload) {
    throw new HttpsError("invalid-argument", "Missing action or payload");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  if (action === "processStudyContent") {
    const { fileBase64, fileName, fileMimeType, customPrompt, fileSize } = payload;
    if (!fileBase64 || !fileName || !fileMimeType) {
      throw new HttpsError("invalid-argument", "Missing file payload");
    }

    if (typeof fileSize === "number" && fileSize > MAX_FILE_SIZE_BYTES) {
      throw new HttpsError("invalid-argument", "File exceeds 50 MB limit");
    }

    if (!ALLOWED_FILE_TYPES.has(fileMimeType)) {
      throw new HttpsError("invalid-argument", "Unsupported file type");
    }

    const safeCustomPrompt = sanitizePrompt(customPrompt);

    console.log(`Processing file: ${fileName}, type: ${fileMimeType}, size: ${fileSize || 'unknown'} bytes`);

    const prompt = `
      You are a world-class Lead Professor. Perform an EXHAUSTIVE EXTRACTION of: ${fileName}.
      
      CRITICAL FORMATTING INSTRUCTION: 
      - Use HIGHLY STRUCTURED BULLETED LISTS for all "detailedNotes". 
      - Every line in "detailedNotes" MUST start with a dash (-) followed by a space.
      - Each bullet should contain a complete, technical thought.
      
      STRICT CONSTRAINTS:
      - NO QUESTIONS: Provide only declarative knowledge.
      - NO SUMMARIZATION: Capture 100% of technical details, formulas, and nuances.
      - NO IMAGES: Do not describe or generate visual aids.
      - NO TIME ESTIMATES: Do not calculate study durations.

      MATH/SCIENCE NOTATION RULES:
      - Use ONLY single dollar signs for inline math ($x^2$).
      - CRITICAL: NO spaces between dollar signs and content (e.g., use "$x$" NOT "$ x $").
      - Use standard LaTeX for subscripts (_), superscripts (^), and fractions (\\frac).
      
      Deliverables:
      1. Study Plan title and overview.
      2. For EACH unit: "title", "description", and exhaustive "detailedNotes" (dash-prefixed technical points).
      3. CRITICAL - FLASHCARDS: For EACH unit, generate EXACTLY 3-5 flashcards with "stepTitle" matching the unit title exactly. MINIMUM 3 flashcards per unit is MANDATORY.
      4. Key topics.
      ${safeCustomPrompt ? `\n\nADDITIONAL CUSTOM INSTRUCTIONS FROM USER:\n${safeCustomPrompt}` : ""}
    `;

    try {
      const response = await model.generateContent([
        {
          inlineData: {
            data: fileBase64,
            mimeType: fileMimeType
          }
        },
        { text: prompt }
      ],
      {
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              isStudyMaterial: { type: "boolean" },
              validityWarning: { type: "string" },
              studyPlan: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  overview: { type: "string" },
                  topics: { type: "array", items: { type: "string" } },
                  steps: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        detailedNotes: { type: "string" }
                      },
                      required: ["title", "description", "detailedNotes"]
                    }
                  }
                },
                required: ["title", "overview", "steps", "topics"]
              },
              flashcards: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    question: { type: "string" },
                    answer: { type: "string" },
                    category: { type: "string" },
                    stepTitle: { type: "string" }
                  },
                  required: ["question", "answer", "stepTitle"]
                }
              }
            },
            required: ["isStudyMaterial", "validityWarning", "studyPlan", "flashcards"]
          }
        }
      });

      const result = await response.response;
      let text = result.text() || "{}";
      if (text.includes("```")) {
        const match = text.match(/```(?:json)?([\s\S]*?)```/);
        if (match) text = match[1].trim();
      }

      const parsedResult = JSON.parse(text);
      console.log("Successfully processed file and generated study materials");
      return {
        studyPlan: parsedResult.studyPlan,
        flashcards: parsedResult.flashcards || [],
        isStudyMaterial: parsedResult.isStudyMaterial ?? true,
        validityWarning: parsedResult.validityWarning || ""
      };
    } catch (error) {
      console.error("Error in processStudyContent:", error);
      throw new HttpsError("internal", `Failed to process file: ${error.message}`);
    }
  }

  if (action === "generateQuiz") {
    const { studyPlan } = payload;
    if (!studyPlan || !studyPlan.title || !Array.isArray(studyPlan.steps)) {
      throw new HttpsError("invalid-argument", "Missing study plan");
    }

    const context = `
      Title: ${studyPlan.title}
      Detailed Notes: ${studyPlan.steps.map((s) => s.detailedNotes).join("\n\n")}
    `;

    const prompt = `
      Generate a 10-question MCQ quiz for: "${studyPlan.title}".
      - USE LaTeX notation ($...$) for math.
      - Ensure detailed explanations.
      
      CONTEXT:
      ${context}
    `;

    try {
      const response = await model.generateContent(prompt, {
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "array",
            items: {
              type: "object",
              properties: {
                question: { type: "string" },
                options: { type: "array", items: { type: "string" } },
                correctAnswer: { type: "string" },
                explanation: { type: "string" }
              },
              required: ["question", "options", "correctAnswer", "explanation"]
            }
          }
        }
      });

      const result = await response.response;
      let text = result.text() || "[]";
      if (text.includes("```")) {
        const match = text.match(/```(?:json)?([\s\S]*?)```/);
        if (match) text = match[1].trim();
      }
      console.log("Successfully generated quiz");
      return JSON.parse(text);
    } catch (error) {
      console.error("Error in generateQuiz:", error);
      throw new HttpsError("internal", `Failed to generate quiz: ${error.message}`);
    }
  }

  throw new HttpsError("invalid-argument", "Unsupported action");
});
