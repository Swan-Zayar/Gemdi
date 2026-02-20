import { useState, useCallback } from 'react';
import { geminiService } from '../services/gemini';
import { StudySession, QuizQuestion } from '../types';

export function useQuiz(
  activeSession: StudySession | null,
  onQuizStart: () => void,
  onQuizError: () => void
) {
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion[]>([]);
  const [isQuizLoading, setIsQuizLoading] = useState(false);

  const handleStartQuiz = useCallback(async () => {
    if (!activeSession?.studyPlan || isQuizLoading) return;
    setIsQuizLoading(true);
    setCurrentQuiz([]);
    onQuizStart();
    try {
      const quiz = await geminiService.generateQuiz(activeSession.studyPlan);
      setCurrentQuiz(quiz);
    } catch (e) {
      console.error('Failed to generate quiz:', e);
      onQuizError();
    } finally {
      setIsQuizLoading(false);
    }
  }, [activeSession, isQuizLoading]);

  return { currentQuiz, isQuizLoading, handleStartQuiz };
}
