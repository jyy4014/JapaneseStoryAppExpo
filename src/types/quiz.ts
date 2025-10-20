export interface QuizAttemptResponse {
  id: string;
  quizId: string;
  createdAt: string;
}

export interface QuizSubmissionResponse {
  id: string;
  attemptId: string;
  score?: number;
  submittedAt: string;
}

