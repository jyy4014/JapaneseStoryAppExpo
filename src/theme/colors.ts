export const colors = {
  // 기본 색상
  primary: '#2563EB',      // 파란색
  secondary: '#DC2626',    // 빨간색
  accent: '#F59E0B',       // 노란색

  // 텍스트 색상
  text: '#1F2937',         // 진한 회색
  textSecondary: '#6B7280', // 중간 회색
  textLight: '#9CA3AF',    // 연한 회색

  // 배경색
  background: '#FFFFFF',   // 흰색
  backgroundSecondary: '#F9FAFB', // 연한 회색
  backgroundDark: '#F3F4F6', // 중간 회색

  // 테두리 색상
  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  // 상태 색상
  success: '#10B981',      // 초록색
  warning: '#F59E0B',      // 노란색
  error: '#EF4444',        // 빨간색

  // 흰색
  white: '#FFFFFF',
  black: '#000000',

  // JLPT 레벨 색상
  jlpt: {
    N5: '#10B981',  // 초록
    N4: '#3B82F6',  // 파랑
    N3: '#F59E0B',  // 노랑
    N2: '#F97316',  // 주황
    N1: '#EF4444',  // 빨강
  }
} as const;

export type Colors = typeof colors;


