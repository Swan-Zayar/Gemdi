
import { GoogleGenAI, Type } from "@google/genai";
import { StudyPlan, Flashcard, QuizQuestion, StudyStep } from "../types";
import { intelligenceService } from "./intelligence";

export const geminiService = {
  async processStudyContent(fileBase64: string, fileName: string, fileMimeType: string): Promise<{ studyPlan: StudyPlan; flashcards: Flashcard[]; isStudyMaterial: boolean; validityWarning: string }> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-flash-preview';

    const learnedContext = await intelligenceService.learnFromSessions([]);
    const optimizationInstruction = intelligenceService.getPromptInstruction(learnedContext);

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
      - Use double dollar signs for centered block math ($$E=mc^2$$).
      - CRITICAL: NO spaces between dollar signs and content (e.g., use "$x$" NOT "$ x $").
      - Use standard LaTeX for subscripts (_), superscripts (^), and fractions (\\frac).
      
      ${optimizationInstruction}

      Deliverables:
      1. Study Plan title and overview.
      2. For EACH unit: "title", "description", and exhaustive "detailedNotes" (dash-prefixed technical points).
      3. CRITICAL - FLASHCARDS: For EACH unit, generate EXACTLY 3-5 flashcards with "stepTitle" matching the unit title exactly. MINIMUM 3 flashcards per unit is MANDATORY.
      4. Key topics.
    `;

    try {
      const response = await ai.models.generateContent({
        model,
        contents: {
          parts: [
            { inlineData: { data: fileBase64, mimeType: fileMimeType } },
            { text: prompt }
          ]
        },
        config: {
          thinkingConfig: { thinkingBudget: 24576 }, // 24,576 tokens limit can be scaled as needed
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
                        detailedNotes: { 
                          type: Type.STRING, 
                          description: "Exhaustive technical notes. Every line MUST start with '- '." 
                        }
                      },
                      required: ["title", "description", "detailedNotes"]
                    }
                  }
                },
                required: ["title", "overview", "steps", "topics"]
              },
              flashcards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    answer: { type: Type.STRING },
                    category: { type: Type.STRING },
                    stepTitle: { type: Type.STRING, description: "The title of the step/unit this flashcard belongs to" }
                  },
                  required: ["question", "answer", "stepTitle"]
                }
              }
            },
            required: ["isStudyMaterial", "validityWarning", "studyPlan", "flashcards"]
          }
        }
      });

      let text = response.text || '{}';
      if (text.includes('```')) {
        const match = text.match(/```(?:json)?([\s\S]*?)```/);
        if (match) text = match[1].trim();
      }
      
      const result = JSON.parse(text);
      const studyPlan = { ...result.studyPlan, id: crypto.randomUUID() };

      return {
        studyPlan,
        flashcards: result.flashcards || [],
        isStudyMaterial: result.isStudyMaterial ?? true,
        validityWarning: result.validityWarning || ""
      };
    } catch (error) {
      console.error("Gemini Processing Error:", error);
      throw error;
    }
  },

  async generateQuiz(studyPlan: StudyPlan): Promise<QuizQuestion[]> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-flash-preview';

    const context = `
      Title: ${studyPlan.title}
      Detailed Notes: ${studyPlan.steps.map(s => s.detailedNotes).join('\n\n')}
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
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.STRING },
                explanation: { type: Type.STRING }
              },
              required: ["question", "options", "correctAnswer", "explanation"]
            }
          }
        }
      });

      let text = response.text || '[]';
      if (text.includes('```')) {
        const match = text.match(/```(?:json)?([\s\S]*?)```/);
        if (match) text = match[1].trim();
      }
      return JSON.parse(text);
    } catch (error) {
      console.error("Quiz Generation Error:", error);
      throw error;
    }
  }
};
