import { httpsCallable } from "firebase/functions";
import { functions } from "../firebaseCLI";
import { StudyPlan, Flashcard, QuizQuestion } from "../types";

export const geminiService = {
  async processStudyContent(
    fileBase64: string,
    fileName: string,
    fileMimeType: string,
    customPrompt?: string,
    fileSize?: number
  ): Promise<{ studyPlan: StudyPlan; flashcards: Flashcard[]; isStudyMaterial: boolean; validityWarning: string }> {
    const callable = httpsCallable(functions, "geminiProxy");
    const result = await callable({
      action: "processStudyContent",
      payload: { fileBase64, fileName, fileMimeType, customPrompt, fileSize }
    });

    const data = result.data as {
      studyPlan: StudyPlan;
      flashcards: Flashcard[];
      isStudyMaterial: boolean;
      validityWarning: string;
    };

    const studyPlan = { ...data.studyPlan, id: crypto.randomUUID() };
    return {
      studyPlan,
      flashcards: data.flashcards || [],
      isStudyMaterial: data.isStudyMaterial ?? true,
      validityWarning: data.validityWarning || ""
    };
  },

  async generateQuiz(studyPlan: StudyPlan): Promise<QuizQuestion[]> {
    const callable = httpsCallable(functions, "geminiProxy");
    const result = await callable({
      action: "generateQuiz",
      payload: { studyPlan }
    });

    return result.data as QuizQuestion[];
  }
};
