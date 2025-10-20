import React, { useEffect, useMemo } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Typography from '../components/common/Typography';
import StyledButton from '../components/common/StyledButton';
import QuestionCard from '../components/quiz/QuestionCard';
import ResultBanner from '../components/quiz/ResultBanner';
import { colors } from '../theme/colors';
import { ApiService } from '../services/api';
import useQuizAttempt, { QuizData, QuizQuestion } from '../hooks/useQuizAttempt';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Quiz'>;

interface ApiQuizQuestion {
  id: string;
  question: string;
  question_type: 'multiple_choice' | 'fill_blank' | 'matching';
  choices?: string[];
  metadata?: Record<string, unknown>;
}

interface ApiQuizData {
  id: string;
  episode_id: string;
  quiz_questions: ApiQuizQuestion[];
}

function mapApiQuiz(data: ApiQuizData): QuizData {
  const questions: QuizQuestion[] = data.quiz_questions.map((q) => ({
    id: q.id,
    question: q.question,
    questionType: q.question_type,
    choices: q.choices,
    metadata: q.metadata,
  }));

  return {
    id: data.id,
    episodeId: data.episode_id,
    questions,
  };
}

function QuizScreen({ route, navigation }: Props) {
  const { episodeId } = route.params;
  const [quiz, setQuiz] = React.useState<QuizData | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();

  const {
    attemptId,
    currentIndex,
    currentQuestion,
    score,
    isSubmitting,
    isCompleted,
    answers,
    error: attemptError,
    startAttempt,
    recordAnswer,
    goToNext,
    goToPrevious,
    submit,
  } = useQuizAttempt({ quiz });

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: '퀴즈',
      headerBackVisible: true,
    });
  }, [navigation]);

  useEffect(() => {
    const fetchQuiz = async () => {
      setIsLoading(true);
      setError(undefined);
      try {
        const response = await ApiService.getStoryById(episodeId);
        const quizData = (response as { quiz?: ApiQuizData | null })?.quiz;
        if (quizData) {
          setQuiz(mapApiQuiz(quizData));
        } else {
          setError('퀴즈 데이터를 찾을 수 없습니다.');
        }
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : '퀴즈를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [episodeId]);

  useEffect(() => {
    if (quiz) {
      startAttempt();
    }
  }, [quiz, startAttempt]);

  useEffect(() => {
    if (attemptError) {
      Alert.alert('오류', attemptError);
    }
  }, [attemptError]);

  const totalQuestions = quiz?.questions.length ?? 0;
  const correctCount = useMemo(() => Object.values(answers).filter((answer) => answer.isCorrect).length, [answers]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Typography variant="body" color={colors.secondary}>
          {error}
        </Typography>
        <StyledButton title="다시 시도" onPress={() => navigation.goBack()} style={styles.retryButton} />
      </View>
    );
  }

  if (!quiz || !currentQuestion || !attemptId) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <QuestionCard
          index={currentIndex}
          total={totalQuestions}
          question={currentQuestion.question}
          questionType={currentQuestion.questionType}
          choices={currentQuestion.choices}
          selectedChoice={answers[currentQuestion.id]?.response as string | undefined}
          onSelectChoice={(choice) =>
            recordAnswer(currentQuestion.id, choice, currentQuestion.answer?.includes(choice) ?? false)
          }
        />

        <View style={styles.navigationRow}>
          <StyledButton title="이전" onPress={goToPrevious} />
          <StyledButton title="다음" onPress={goToNext} variant="secondary" />
        </View>

        <StyledButton
          title={isCompleted ? '퀴즈 제출' : '문제 풀기 완료 후 제출 가능'}
          onPress={() => submit()}
          disabled={!isCompleted || isSubmitting}
          style={styles.submitButton}
        />

        {score !== null && (
          <ResultBanner
            score={score}
            total={totalQuestions}
            correctCount={correctCount}
            onRetry={() => startAttempt()}
            onClose={() => navigation.goBack()}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  retryButton: {
    marginTop: 16,
  },
  navigationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  submitButton: {
    marginTop: 24,
  },
});

export default QuizScreen;

