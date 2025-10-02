import { useCallback, useMemo, useState } from 'react';
import { ApiService } from '../services/api';

export interface QuizQuestion {
  id: string;
  question: string;
  questionType: 'multiple_choice' | 'fill_blank' | 'matching';
  choices?: string[];
  answer?: string[];
  metadata?: Record<string, unknown>;
}

export interface QuizData {
  id: string;
  episodeId: string;
  questions: QuizQuestion[];
}

interface UseQuizAttemptOptions {
  quiz: QuizData | null;
}

export default function useQuizAttempt({ quiz }: UseQuizAttemptOptions) {
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { response: unknown; isCorrect: boolean }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [error, setError] = useState<string | undefined>();

  const currentQuestion = useMemo(() => quiz?.questions[currentIndex], [quiz?.questions, currentIndex]);
  const isCompleted = useMemo(
    () => quiz !== null && Object.keys(answers).length === (quiz.questions?.length ?? 0),
    [answers, quiz],
  );

  const startAttempt = useCallback(async () => {
    if (!quiz) {
      return;
    }
    setError(undefined);
    try {
      const response = await ApiService.createQuizAttempt(quiz.id);
      setAttemptId(response.id);
      setCurrentIndex(0);
      setAnswers({});
      setScore(null);
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : '퀴즈 시도를 시작할 수 없습니다.');
    }
  }, [quiz]);

  const recordAnswer = useCallback(
    (questionId: string, response: unknown, isCorrect: boolean) => {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: { response, isCorrect },
      }));
    },
    [],
  );

  const goToNext = useCallback(() => {
    if (!quiz) {
      return;
    }
    setCurrentIndex((prev) => Math.min(prev + 1, quiz.questions.length - 1));
  }, [quiz]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const submit = useCallback(async () => {
    if (!quiz || !attemptId) {
      return;
    }

    setIsSubmitting(true);
    setError(undefined);

    try {
      const responses = quiz.questions.map((question) => ({
        questionId: question.id,
        response: answers[question.id]?.response ?? null,
        isCorrect: answers[question.id]?.isCorrect ?? false,
      }));

      const correctCount = responses.filter((response) => response.isCorrect).length;
      const computedScore = Math.round((correctCount / quiz.questions.length) * 100);

      const submission = await ApiService.submitQuizAttempt(attemptId, {
        responses,
        score: computedScore,
      });

      setScore(submission.score ?? computedScore);
      return submission;
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '퀴즈 제출에 실패했습니다.');
      throw submitError;
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, attemptId, quiz]);

  return {
    attemptId,
    currentIndex,
    currentQuestion,
    answers,
    score,
    isSubmitting,
    isCompleted,
    error,
    startAttempt,
    recordAnswer,
    goToNext,
    goToPrevious,
    submit,
  };
}

