# 📋 V2 룰즈 새로 추가된 요구사항

## 새로 추가된 항목 (RULE 파일 388-458줄)

### 🗃️ 2. 단어 사전 자동화 (DB 리스크 해결)
**상태**: ❌ 미구현

**요구사항**:
- 사용자가 단어를 클릭할 때 외부 API를 통해 단어 정보를 동적으로 채워 넣기
- `src/services/wordService.ts`에 `getOrFetchWordDefinition(lemma: string)` 함수 생성
- DB에 단어가 없으면:
  1. 무료 사전 API (예: https://api.dictionaryapi.dev/api/v2/entries/en/{lemma}) 호출
  2. API 응답 파싱하여 definition, pos(품사), example(예문) 추출
  3. `supabase.from('words').insert(...)` 실행하여 words 테이블에 저장
- 플레이어의 `handleWordClick`이 이 함수를 사용하도록 수정

**참고**: 
- 현재는 Edge Function에서 단어를 조회하고 있지만, words 테이블이 비어있을 경우를 대비한 자동화가 필요
- 일본어 단어의 경우 적절한 사전 API를 찾아야 함 (예: Jisho API)

---

### 🔥 4. 동기부여 장치 (학습 연속)
**상태**: ❌ 미구현

**요구사항**:

1. **DB 변경**:
   - `app_users` (또는 `user_preferences`) 테이블에 다음 컬럼 추가:
     - `current_streak INT DEFAULT 0`
     - `last_completed_date DATE`

2. **서비스 함수**:
   - `src/services/userService.ts` (또는 `progressService.ts`)에 `updateDailyGoalProgress()` 함수 생성
   - 이 함수는:
     - `episode_progress`나 `event_log`를 확인하여 오늘 `daily_goal_minutes`를 달성했는지 확인
     - 목표를 달성했고 `last_completed_date`가 어제라면: `current_streak`를 1 증가
     - 오늘이 아니라면: `current_streak`를 0으로 리셋

3. **UI 추가**:
   - `pages/HomePage.tsx`와 `stores/authStore.ts` 수정
   - 로그인 시 `current_streak` 값을 가져와서 홈 화면에 '🔥 5일 연속 학습 중!'과 같이 표시

---

## ✅ 이미 구현된 항목

### 🎨 1. 플레이어 UX 개선 (핵심 1순위)
- ✅ 단어 클릭 및 저장 기능
  - `parseScript` 유틸리티로 문장 파싱
  - `WordBottomSheet` 컴포넌트로 단어 정보 표시
  - 단어 저장 기능 (Edge Function API 호출)

### 🧠 3. SRS 복습 로직 구체화
- ✅ SRS 피드백 로직 구현
  - `FlashcardReview` 컴포넌트에 '어려워요', '알겠어요', '아주 쉬워요' 버튼
  - `handleUpdateReviewFeedback` Edge Function에서 SRS 로직 처리:
    - 'hard': level = 0, wrong_count + 1, next_review = 1일 후
    - 'good': level + 1, correct_count + 1, next_review = srs_interval_days[newLevel]일 후
    - 'easy': level + 2 (최대 5), correct_count + 1, next_review = srs_interval_days[newLevel]일 후

---

## 🎯 우선순위

### 높은 우선순위
1. **단어 사전 자동화** - DB에 단어가 없을 경우 자동으로 채워넣기 (사용자 경험 개선)

### 중간 우선순위
2. **학습 연속(Streak) 기능** - 사용자 동기부여를 위한 기능

---

**작성일**: 2025-11-05  
**작성자**: AI Assistant

