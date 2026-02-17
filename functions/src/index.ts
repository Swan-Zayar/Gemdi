import {onCall, onRequest, HttpsError} from "firebase-functions/v2/https";
import {GoogleGenAI, Type} from "@google/genai";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
admin.initializeApp();
const bucket = admin.storage().bucket();

const MAX_PROMPT_LENGTH = 500;
const ALLOWED_FILE_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

const sanitizePrompt = (prompt?: string) => {
  if (!prompt) return "";
  return String(prompt)
    .trim()
    .replace(/[<>{}[\]\\|`]/g, "")
    .replace(/\s+/g, " ")
    .substring(0, MAX_PROMPT_LENGTH);
};

const validateCommon = (data: unknown) => {
  if (!data || typeof data !== "object") {
    throw new HttpsError("invalid-argument", "Invalid payload");
  }
};

const handleGeminiRequest = async (data: unknown) => {
  validateCommon(data);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY environment variable is not set");
    throw new HttpsError("failed-precondition", "API key not configured. Set GEMINI_API_KEY environment variable in Cloud Run.");
  }

  const {action, payload} = (data as any) as {
    action?: string;
    payload?: Record<string, unknown>;
  };

  if (!action || !payload) {
    throw new HttpsError("invalid-argument", "Missing action or payload");
  }

  const ai = new GoogleGenAI({apiKey});
  const model = "gemini-2.5-flash";

  if (action === "processStudyContent") {
    const {
      storagePath,
      fileName,
      fileMimeType,
      customPrompt,
      fileSize,
    } = payload as {
      storagePath?: string;
      fileName?: string;
      fileMimeType?: string;
      customPrompt?: string;
      fileSize?: number;
    };

    if (!storagePath || !fileName || !fileMimeType) {
      throw new HttpsError("invalid-argument", "Missing storagePath, fileName, or fileMimeType");
    }

    if (typeof fileSize === "number" && fileSize > MAX_FILE_SIZE_BYTES) {
      throw new HttpsError("invalid-argument", "File exceeds 50 MB limit");
    }

    if (!ALLOWED_FILE_TYPES.has(fileMimeType)) {
      throw new HttpsError("invalid-argument", "Unsupported file type");
    }

    const safeCustomPrompt = sanitizePrompt(customPrompt);

    console.log(`Processing file: ${fileName}, type: ${fileMimeType}, size: ${fileSize || 'unknown'} bytes, storagePath: ${storagePath}`);

    try {
      // Upload file to Gemini File API directly from Cloud Storage
      // This avoids base64 bloat and is faster for large files
      const storageFile = bucket.file(storagePath);
      const [fileContent] = await storageFile.download();

      console.log(`Downloaded file from Storage, size: ${fileContent.length} bytes, uploading to Gemini File API...`);

      const geminiFile = await ai.files.upload({
        file: new Blob([new Uint8Array(fileContent)], {type: fileMimeType}),
        config: {mimeType: fileMimeType, displayName: fileName},
      });

      console.log(`Uploaded to Gemini File API: ${geminiFile.name}, state: ${geminiFile.state}`);

      // Wait for file to be processed if needed
      let currentFile = geminiFile;
      while (currentFile.state === "PROCESSING") {
        await new Promise((r) => setTimeout(r, 2000));
        currentFile = await ai.files.get({name: currentFile.name!});
      }

      if (currentFile.state === "FAILED") {
        throw new Error("Gemini File API processing failed");
      }

      const prompt = `
      You are an expert tutor creating a focused study guide from: ${fileName}.

      YOUR GOAL: Produce a well-structured study plan that feels like a
      mini-textbook — with clear headings, explanatory paragraphs, organized
      bullet points, and highlighted formulas. A student should be able to
      scan headings, read explanations, and reference key facts and formulas
      at a glance.

      STUDY PLAN:
      - "title": A clear, specific title for the material (not the filename).
      - "overview": 2-3 sentences explaining what this material covers, why it
        matters, and what the student will be able to do after studying it.
      - "topics": Ordered list of the core concepts covered. Only major themes,
        no minor subtopics.

      STEPS (one per major topic):
      - "title": Short, descriptive heading (e.g. "Functional Groups & Naming").
      - "description": 1-2 sentences that answer "What is this topic and why
        does it matter?" — written so a student immediately understands the
        scope before reading the notes.
      - "detailedNotes": An array of sections. Each section is an object with:
          - "heading" (REQUIRED): A specific, descriptive section heading that
            tells the student exactly what this section covers. Use meaningful
            headings like "How Covalent Bonds Form", "Types of Chemical
            Reactions", "Newton's Laws of Motion" — NOT generic labels like
            "Overview", "Key Points", or "Summary".
          - "body" (OPTIONAL): A short explanatory paragraph (2-4 sentences)
            that gives context, explains the "why" behind the topic, connects
            ideas, or walks through a process in plain language. Write as if
            teaching a student face-to-face. Skip this field if the bullets
            alone are sufficient — but use it for topics that benefit from
            narrative explanation.
          - "bullets" (REQUIRED): An array of concise, self-contained key
            points — definitions, facts, key distinctions, or important
            details. Each bullet should be one complete sentence or thought.
            3-8 bullets per section. You may include inline math using
            $...$ where relevant.
          - "formulas" (OPTIONAL): An array of important formulas, equations,
            or mathematical expressions relevant to this section. Each entry
            should be a display-math LaTeX string wrapped in $$...$$.
            Only include this field when the section involves math, physics,
            chemistry, or other formula-heavy content. Examples:
            ["$$ F = ma $$", "$$ E = mc^2 $$"]

        Break each step into 2-5 logical sections. Mix explanatory paragraphs
        with bullet points and highlighted formulas for maximum clarity.

      FLASHCARDS:
      - Generate 3-5 flashcards PER step. "stepTitle" must exactly match
        the step's "title".
      - Questions should test understanding, not just recall. Good: "Why does
        X cause Y?" or "How do A and B differ?" Bad: "Define X."
      - Answers should be concise (1-3 sentences) but complete enough to
        learn from.

      CONSTRAINTS:
      - Do NOT include questions in detailedNotes — only declarative knowledge.
      - Do NOT describe images or generate visual aids.
      - Do NOT include time estimates or study durations.
      - One topic per step — split unrelated ideas into separate steps.
      - No duplicate step titles or topic names.

      MATH NOTATION (if applicable):
      - Use $...$ for inline math and $$...$$ for display math.
      - Do NOT use \\( \\) or \\[ \\] delimiters — they break in JSON.
      - EVERY LaTeX expression MUST be wrapped in $ or $$ delimiters.
        Never output bare LaTeX like \\vert\\lambda\\vert — always write
        $\\vert\\lambda\\vert$ instead.
      - Do NOT use LaTeX text commands like \\textbf{}, \\textit{},
        \\emph{}, or \\text{} outside of math mode. Use plain text instead.
        Wrong: "\\textbf{Equality}" → Right: "Equality"
      - Use standard LaTeX commands: \\frac, \\sum, \\int, \\alpha, etc.
      - NEVER output LaTeX document preambles or structure commands such as
        \\documentclass, \\usepackage, \\begin{document}, \\end{document},
        \\title, \\maketitle, or any \\begin{...}/\\end{...} environment
        wrappers. Output ONLY the math content itself.
      - To emphasise or highlight plain text, use **bold** markdown syntax.
      - NEVER wrap formulas in \\mathbf{}, \\textbf{}, \\boldsymbol{},
        or any bold command. Formulas must be plain LaTeX only.
        Wrong: $\\mathbf{F = ma}$  Right: $F = ma$
        Wrong: \\mathbf{\\frac{a}{b}}  Right: $\\frac{a}{b}$
      - NEVER output bare LaTeX without dollar-sign delimiters.
      - Always pair \\left and \\right with explicit delimiters:
        \\left( ... \\right), \\left[ ... \\right], \\left| ... \\right|.
        NEVER write \\left immediately followed by a command like
        \\left\\frac — always include the delimiter: \\left(\\frac{a}{b}\\right).
      ${safeCustomPrompt ?
        `\nADDITIONAL INSTRUCTIONS FROM USER:\n${safeCustomPrompt}` :
        ""}
    `;

      try {
        const response = await ai.models.generateContent({
          model,
          contents: {
            parts: [
              {fileData: {fileUri: currentFile.uri!, mimeType: fileMimeType}},
              {text: prompt},
            ],
          },
          config: {
            responseMimeType: "application/json",
            maxOutputTokens: 65536,
            thinkingConfig: {thinkingBudget: 2048},
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                isStudyMaterial: {type: Type.BOOLEAN},
                validityWarning: {type: Type.STRING},
                studyPlan: {
                  type: Type.OBJECT,
                  properties: {
                    title: {type: Type.STRING},
                    overview: {type: Type.STRING},
                    topics: {type: Type.ARRAY, items: {type: Type.STRING}},
                    steps: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          title: {type: Type.STRING},
                          description: {type: Type.STRING},
                          detailedNotes: {
                            type: Type.ARRAY,
                            items: {
                              type: Type.OBJECT,
                              properties: {
                                heading: {type: Type.STRING},
                                body: {type: Type.STRING},
                                bullets: {type: Type.ARRAY, items: {type: Type.STRING}},
                                formulas: {type: Type.ARRAY, items: {type: Type.STRING}},
                              },
                              required: ["heading", "bullets"],
                            },
                          },
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
                      question: {type: Type.STRING},
                      answer: {type: Type.STRING},
                      category: {type: Type.STRING},
                      stepTitle: {type: Type.STRING},
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

        // Log response metadata for diagnostics
        const candidate = response.candidates?.[0];
        const finishReason = candidate?.finishReason;
        const usage = response.usageMetadata;
        console.log(`Response metadata — finishReason: ${finishReason}, ` +
          `promptTokens: ${usage?.promptTokenCount}, ` +
          `outputTokens: ${usage?.candidatesTokenCount}`);

        if (finishReason === "MAX_TOKENS") {
          console.error("WARNING: Response was truncated due to MAX_TOKENS");
        }

        let text = response.text || "{}";
        if (text.includes("```")) {
          const match = text.match(/```(?:json)?([\s\S]*?)```/);
          if (match) text = match[1].trim();
        }

        let parsedResult: {
          studyPlan: unknown;
          flashcards?: unknown[];
          isStudyMaterial?: boolean;
          validityWarning?: string;
        };

        try {
          parsedResult = JSON.parse(text);
        } catch (parseErr) {
          console.error("JSON parse failed, attempting LaTeX backslash repair...");
          console.error("Raw text snippet:", text.slice(0, 1000));
          try {
            // Repair: double-escape lone backslashes that aren't valid JSON escapes.
            // Valid JSON escapes after \: " \ / b f n r t u
            // LaTeX commands like \alpha, \sum, \pi, \sigma start with invalid
            // JSON escape chars and cause parse errors.
            const repaired = text.replace(/\\(?!["\\/bfnrtu\\])/g, "\\\\");
            parsedResult = JSON.parse(repaired);
            console.log("JSON LaTeX repair succeeded");
          } catch (repairErr) {
            console.error("JSON repair also failed. text length:",
              typeof text === "string" ? text.length : "unknown");
            console.error("Parsed snippet:",
              typeof text === "string" ? text.slice(0, 2000) : "not a string");
            throw new HttpsError(
              "internal",
              finishReason === "MAX_TOKENS"
                ? "Response was truncated (too many tokens). Try a smaller file."
                : "Model returned malformed JSON. See function logs for snippet."
            );
          }
        }

        // Repair silently corrupted LaTeX in parsed strings.
        // When Gemini outputs \frac in JSON, \f becomes formfeed (valid JSON escape).
        // Similarly \theta→\t+heta, \nu→\n+u, \beta→\b+eta, \rho→\r+ho.
        // We detect these by looking for control chars followed by LaTeX command tails.
        const repairLatex = (s: string): string => {
          if (!s) return s;
          return s
            .replace(/\f(rac|lat|loor|orall)\b/g, "\\f$1")
            .replace(/\t(ilde|heta|au|imes|ext|o(?:\s|$)|op|riangle)\b/g, "\\t$1")
            .replace(/\n(u(?:\s|$)|abla|eg|eq|ot|i(?:\s|$)|subset|parallel|rightarrow)/g, "\\n$1")
            .replace(/\x08(eta|inom|ar|egin|ig|oldsymbol)\b/g, "\\b$1")
            .replace(/\r(ho|ightarrow|Rightarrow)\b/g, "\\r$1");
        };

        // Apply latex repair recursively to all string values in the result
        const deepRepairLatex = (obj: unknown): unknown => {
          if (typeof obj === "string") return repairLatex(obj);
          if (Array.isArray(obj)) return obj.map(deepRepairLatex);
          if (obj && typeof obj === "object") {
            const result: Record<string, unknown> = {};
            for (const [k, v] of Object.entries(obj)) {
              result[k] = deepRepairLatex(v);
            }
            return result;
          }
          return obj;
        };

        parsedResult = deepRepairLatex(parsedResult) as typeof parsedResult;

        console.log("Successfully processed file and generated study materials");
        return {
          studyPlan: parsedResult.studyPlan,
          flashcards: parsedResult.flashcards || [],
          isStudyMaterial: parsedResult.isStudyMaterial ?? true,
          validityWarning: parsedResult.validityWarning || "",
        };
      } catch (error) {
        console.error("Error in processStudyContent:", error);
        throw new HttpsError("internal", `Failed to process file: ${(error as Error).message}`);
      } finally {
        // Delete the file from Storage after processing (success or failure)
        try {
          const storageCleanup = bucket.file(storagePath);
          await storageCleanup.delete();
          console.log(`Deleted file from Storage: ${storagePath}`);
        } catch (deleteErr) {
          console.error("Failed to delete file from Storage:", deleteErr);
        }

        // Delete the file from Gemini File API
        try {
          if (currentFile?.name) {
            await ai.files.delete({name: currentFile.name});
            console.log(`Deleted file from Gemini File API: ${currentFile.name}`);
          }
        } catch (geminiDeleteErr) {
          console.error("Failed to delete Gemini file:", geminiDeleteErr);
        }
      }
    } catch (error) {
      console.error("Error in processStudyContent:", error);
      throw new HttpsError("internal", `Failed to process file: ${(error as Error).message}`);
    }
  }

  if (action === "generateQuiz") {
    const {studyPlan} = payload as {
      studyPlan?: {
        title?: string;
        steps?: Array<{detailedNotes?: unknown}>;
      };
    };

    if (!studyPlan || !studyPlan.title || !Array.isArray(studyPlan.steps)) {
      throw new HttpsError("invalid-argument", "Missing study plan");
    }

    // Convert detailedNotes to plain text regardless of format
    const notesToText = (notes: unknown): string => {
      if (typeof notes === "string") return notes;
      if (!Array.isArray(notes)) return "";
      return notes.map((sec: Record<string, unknown>) => {
        const parts: string[] = [];
        if (sec.heading) parts.push(String(sec.heading));
        if (sec.body) parts.push(String(sec.body));
        if (Array.isArray(sec.bullets)) {
          parts.push(...sec.bullets.map((b: unknown) => `- ${b}`));
        }
        if (Array.isArray(sec.formulas)) {
          parts.push(...sec.formulas.map((f: unknown) => String(f)));
        }
        return parts.join("\n");
      }).join("\n\n");
    };

    const context = `
      Title: ${studyPlan.title}
      Detailed Notes: ${studyPlan.steps
    .map((s) => notesToText(s.detailedNotes))
    .join("\n\n")}
    `;

    const prompt = `
      Generate a 20-question MCQ quiz for: "${studyPlan.title}".
      - Use $...$ for inline math and $$...$$ for display math.
      - Do NOT use \\( \\) or \\[ \\] delimiters — they break in JSON.
      - Ensure detailed explanations.
      - IMPORTANT: The question text must NEVER reveal or contain the correct
        answer. Do not repeat the answer verbatim in the question stem.
        Questions should test understanding, not give away the answer.
      - All four options should be plausible. Avoid obviously wrong distractors.

      CONTEXT:
      ${context}
    `;

    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          maxOutputTokens: 32768,
          thinkingConfig: {thinkingBudget: 1024},
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: {type: Type.STRING},
                options: {type: Type.ARRAY, items: {type: Type.STRING}},
                correctAnswer: {type: Type.STRING},
                explanation: {type: Type.STRING},
              },
              required: ["question", "options", "correctAnswer", "explanation"],
            },
          },
        },
      });

      let text = response.text || "[]";
      if (text.includes("```")) {
        const match = text.match(/```(?:json)?([\s\S]*?)```/);
        if (match) text = match[1].trim();
      }
      // Repair corrupted LaTeX in quiz results (same logic as processStudyContent)
      const repairQuizLatex = (s: string): string => {
        if (!s) return s;
        return s
          .replace(/\f(rac|lat|loor|orall)\b/g, "\\f$1")
          .replace(/\t(ilde|heta|au|imes|ext|o(?:\s|$)|op|riangle)\b/g, "\\t$1")
          .replace(/\n(u(?:\s|$)|abla|eg|eq|i(?:\s|$)|subset|parallel|rightarrow|ot)/g, "\\n$1")
          .replace(/\x08(eta|inom|ar|egin|ig|oldsymbol)\b/g, "\\b$1")
          .replace(/\r(ho|ightarrow|Rightarrow)\b/g, "\\r$1");
      };
      const deepRepairQuizLatex = (obj: unknown): unknown => {
        if (typeof obj === "string") return repairQuizLatex(obj);
        if (Array.isArray(obj)) return obj.map(deepRepairQuizLatex);
        if (obj && typeof obj === "object") {
          const r: Record<string, unknown> = {};
          for (const [k, v] of Object.entries(obj)) r[k] = deepRepairQuizLatex(v);
          return r;
        }
        return obj;
      };

      try {
        let parsed = JSON.parse(text);
        parsed = deepRepairQuizLatex(parsed);
        console.log("Successfully generated quiz");
        return parsed;
      } catch (parseErr) {
        console.error("Failed to parse JSON for quiz. text length:",
          typeof text === 'string' ? text.length : 'unknown');
        console.error("Parsed snippet:",
          typeof text === 'string' ? text.slice(0, 2000) : 'not a string');
        throw new HttpsError("internal", "Model returned malformed JSON for quiz.");
      }
    } catch (error) {
      console.error("Error in generateQuiz:", error);
      throw new HttpsError("internal", `Failed to generate quiz: ${(error as Error).message}`);
    }
  }

  throw new HttpsError("invalid-argument", "Unsupported action");
};

export const geminiProxy = onCall({
  region: 'asia-northeast2',
  secrets: ["GEMINI_API_KEY"],
  timeoutSeconds: 540,
  memory: "1GiB",
}, async (request) => {
  return handleGeminiRequest(request.data as unknown);
});

export const geminiProxyHttp = onRequest({ region: 'asia-northeast2' }, async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  try {
    const result = await handleGeminiRequest(req.body);
    res.json(result);
  } catch (err) {
    const e: any = err;
    if (e && e.code) {
      const statusMap: Record<string, number> = {
        "invalid-argument": 400,
        "failed-precondition": 412,
        "internal": 500,
        "permission-denied": 403,
      };
      const status = statusMap[e.code] || 500;
      res.status(status).json({error: e.message || String(e)});
    } else {
      res.status(500).json({error: (err as Error).message || "Internal error"});
    }
  }
});
