# 📚 단어장 목록 페이지 기획안

## 📌 개요

**목적**: 사용자가 저장한 단어를 관리하고, SRS(Spaced Repetition System) 기반 복습을 통해 효율적으로 학습할 수 있는 페이지

**위치**: 하단 탭 바의 "내 단어장" 탭

**핵심 가치**: 
- 저장한 단어를 한눈에 확인
- 복습이 필요한 단어를 자동으로 추천
- SRS 알고리즘으로 장기 기억 강화

---

## 🎨 UI/UX 설계

### 1. 메인 화면 구조 (3단 구성)

```
┌─────────────────────────────────┐
│  📈 복습 카드 (Review CTA)      │ ← 상단 고정
│  "오늘 복습할 단어: 12개"        │
│  [복습 시작하기] 버튼             │
├─────────────────────────────────┤
│  🗂️ 단어장 탭 (My Word List)    │
│  ┌─────────┬─────────┐         │
│  │ 전체 단어 │ 레벨별   │ ← 탭 전환
│  └─────────┴─────────┘         │
│  ┌─────────────────────────┐   │
│  │ 🔍 검색 바                │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ 友達 (ともだち)           │   │
│  │ 친구 • N5 • Level 0      │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ 学生 (がくせい)           │   │
│  │ 학생 • N5 • Level 1      │   │
│  └─────────────────────────┘   │
│  ... (스크롤 가능)               │
├─────────────────────────────────┤
│  📊 학습 통계 (Quick Stats)      │ ← 하단 고정
│  총 저장: 45개                   │
│  완전 학습: 12개                 │
│  누적 정답: 128회                │
└─────────────────────────────────┘
```

### 2. 화면별 상세 설계

#### 2.1. 📈 복습 카드 (Review CTA)

**목적**: 사용자가 복습해야 할 단어를 즉시 확인하고 복습을 시작할 수 있게 유도

**UI 구성**:
- **카드 형태**: 큰 버튼 형태의 카드 (보라색 배경, 흰색 텍스트)
- **아이콘**: 📚 또는 🎯
- **텍스트**: 
  - 상단: "오늘 복습할 단어"
  - 중앙: **"12개"** (큰 폰트, 강조)
  - 하단: "복습 시작하기" 버튼

**데이터 로직**:
```sql
SELECT COUNT(*) 
FROM user_word_progress
WHERE user_id = :userId
  AND next_review <= CURRENT_DATE;
```

**액션**:
- 카드 탭 → 플래시카드 복습 화면으로 이동

**상태**:
- 복습할 단어가 0개일 때: "모든 단어를 복습했어요! 🎉" (회색 배경, 비활성화)

---

#### 2.2. 🗂️ 단어장 탭 (My Word List)

**목적**: 저장한 단어를 탐색하고 관리

**탭 구성**:

##### 탭 1: 전체 단어 (All Words)

**UI 구성**:
- **검색 바**: 상단에 검색 입력 필드
  - 플레이스홀더: "단어 검색..."
  - 실시간 검색 (debounce 300ms)
  - 검색 대상: `kanji`, `kana`, `romaji`, `meaning_ko`

- **단어 카드 리스트**: 스크롤 가능한 리스트
  - 각 카드 표시 정보:
    ```
    ┌─────────────────────────────┐
    │ 友達 (ともだち)              │ ← 한자 (큰 폰트)
    │ tomodachi                   │ ← 로마자 (작은 폰트, 회색)
    │ 친구                        │ ← 의미 (중간 폰트)
    │                             │
    │ N5 • Level 0 • 복습 예정    │ ← 메타 정보
    │ 정답: 0회 | 오답: 0회        │
    └─────────────────────────────┘
    ```
  - 카드 탭 → 단어 상세 정보 (Bottom Sheet 또는 새 화면)

**데이터 로직**:
```sql
SELECT 
  uwp.id,
  uwp.level,
  uwp.next_review,
  uwp.correct_count,
  uwp.wrong_count,
  w.kanji,
  w.kana,
  w.romaji,
  w.meaning_ko,
  w.jlpt_level
FROM user_word_progress uwp
JOIN words w ON w.id = uwp.word_id
WHERE uwp.user_id = :userId
ORDER BY uwp.created_at DESC;
```

**필터링**:
- 검색어가 있으면:
  ```sql
  AND (
    w.kanji ILIKE :search
    OR w.kana ILIKE :search
    OR w.romaji ILIKE :search
    OR w.meaning_ko ILIKE :search
  )
  ```

##### 탭 2: 레벨별 (By Level)

**UI 구성**:
- **레벨 그룹**: `level` 값별로 그룹화
  ```
  ┌─────────────────────────────┐
  │ Level 0 (초급) - 20개       │
  │ ┌─────────────────────┐    │
  │ │ 友達 (ともだち)       │    │
  │ │ 学生 (がくせい)       │    │
  │ │ ...                  │    │
  │ └─────────────────────┘    │
  ├─────────────────────────────┤
  │ Level 1 (중급) - 15개       │
  │ ...                         │
  ├─────────────────────────────┤
  │ Level 2 (고급) - 10개        │
  │ ...                         │
  └─────────────────────────────┘
  ```

**데이터 로직**:
```sql
SELECT 
  uwp.level,
  COUNT(*) as count,
  ARRAY_AGG(
    json_build_object(
      'id', uwp.id,
      'kanji', w.kanji,
      'kana', w.kana,
      'romaji', w.romaji,
      'meaning_ko', w.meaning_ko,
      'jlpt_level', w.jlpt_level
    )
  ) as words
FROM user_word_progress uwp
JOIN words w ON w.id = uwp.word_id
WHERE uwp.user_id = :userId
GROUP BY uwp.level
ORDER BY uwp.level ASC;
```

**레벨 의미**:
- **Level 0**: 새로 저장한 단어 (복습 필요)
- **Level 1-2**: 학습 중인 단어
- **Level 3-4**: 거의 완전히 학습한 단어
- **Level 5+**: 완전히 학습한 단어 (장기 기억)

---

#### 2.3. 📊 학습 통계 (Quick Stats)

**목적**: 사용자의 학습 성취도를 시각적으로 확인

**UI 구성**:
- **카드 형태**: 작은 통계 카드들 (가로 스크롤 또는 그리드)
  ```
  ┌──────────┬──────────┬──────────┐
  │ 총 저장   │ 완전 학습 │ 누적 정답 │
  │   45개    │   12개    │  128회   │
  └──────────┴──────────┴──────────┘
  ```

**데이터 로직**:
```sql
-- 총 저장한 단어
SELECT COUNT(*) 
FROM user_word_progress
WHERE user_id = :userId;

-- 완전히 학습한 단어 (level >= 4)
SELECT COUNT(*) 
FROM user_word_progress
WHERE user_id = :userId
  AND level >= 4;

-- 누적 정답 횟수
SELECT SUM(correct_count) 
FROM user_word_progress
WHERE user_id = :userId;
```

---

### 3. 플래시카드 복습 흐름 (핵심 기능)

#### 3.1. 진입점

- **복습 카드** 탭 → 복습 화면으로 이동
- 또는 상단 헤더의 "복습 시작" 버튼

#### 3.2. 데이터 로드

**쿼리**:
```sql
SELECT 
  uwp.id as progress_id,
  uwp.level,
  uwp.next_review,
  uwp.correct_count,
  uwp.wrong_count,
  w.id as word_id,
  w.kanji,
  w.kana,
  w.romaji,
  w.meaning_ko,
  w.jlpt_level
FROM user_word_progress uwp
JOIN words w ON w.id = uwp.word_id
WHERE uwp.user_id = :userId
  AND uwp.next_review <= CURRENT_DATE
ORDER BY uwp.next_review ASC, uwp.level ASC
LIMIT 20; -- 또는 사용자 설정값
```

#### 3.3. 플래시카드 UI

**전체 화면 모드** (full-screen):

```
┌─────────────────────────────────┐
│  ← 뒤로가기    3 / 20            │ ← 상단 헤더
├─────────────────────────────────┤
│                                 │
│                                 │
│        友達                      │ ← 카드 앞면 (큰 폰트)
│      (ともだち)                  │
│                                 │
│      [정답 확인]                  │ ← 버튼
│                                 │
│                                 │
└─────────────────────────────────┘
```

**카드 뒷면** (정답 확인 후):

```
┌─────────────────────────────────┐
│  ← 뒤로가기    3 / 20            │
├─────────────────────────────────┤
│                                 │
│        友達                      │ ← 단어 (유지)
│      (ともだち)                  │
│      tomodachi                  │
│                                 │
│      친구                        │ ← 의미 (표시)
│      N5                          │
│                                 │
│  ┌──────┬──────┬──────┐         │
│  │어려워요│알겠어요│아주쉬워요│   │ ← 피드백 버튼
│  └──────┴──────┴──────┘         │
│                                 │
└─────────────────────────────────┘
```

#### 3.4. SRS 피드백 로직

**버튼별 동작**:

##### ① 어려워요 (Hard)
```javascript
{
  level: Math.max(0, currentLevel - 1), // 최소 0
  wrong_count: currentWrongCount + 1,
  next_review: new Date() + 1일 // 즉시 다시 복습
}
```

##### ② 알겠어요 (Good)
```javascript
{
  level: currentLevel + 1,
  correct_count: currentCorrectCount + 1,
  next_review: new Date() + srsIntervals[newLevel]일
}
```

##### ③ 아주 쉬워요 (Easy)
```javascript
{
  level: Math.min(5, currentLevel + 2), // 최대 5
  correct_count: currentCorrectCount + 1,
  next_review: new Date() + srsIntervals[newLevel]일
}
```

**SRS 간격 설정** (기본값):
```javascript
const srsIntervals = {
  0: 1,   // 1일 후
  1: 3,   // 3일 후
  2: 7,   // 7일 후
  3: 14,  // 14일 후
  4: 30,  // 30일 후
  5: 90   // 90일 후
};
```

#### 3.5. 복습 완료 화면

**표시 정보**:
```
┌─────────────────────────────────┐
│      🎉 복습 완료!                │
│                                 │
│  오늘 맞춘 단어: 15개            │
│  틀린 단어: 5개                  │
│                                 │
│  [단어장으로 돌아가기]           │
└─────────────────────────────────┘
```

---

## 🔧 기술 구현 사항

### API 엔드포인트

#### 1. 단어장 목록 조회
```
GET /api/wordbook
Query Params:
  - userId: string (required)
  - search?: string (optional)
  - level?: number (optional)
  - tab?: 'all' | 'by-level' (default: 'all')
```

#### 2. 복습할 단어 개수 조회
```
GET /api/wordbook/review-count
Query Params:
  - userId: string (required)
```

#### 3. 복습할 단어 목록 조회
```
GET /api/wordbook/review
Query Params:
  - userId: string (required)
  - limit?: number (default: 20)
```

#### 4. 학습 통계 조회
```
GET /api/wordbook/stats
Query Params:
  - userId: string (required)
```

#### 5. 단어 복습 피드백 업데이트
```
POST /api/wordbook/review
Body:
  {
    userId: string,
    progressId: string,
    feedback: 'hard' | 'good' | 'easy'
  }
```

### 데이터베이스 스키마

**이미 존재하는 테이블**:
- `user_word_progress`: 사용자 단어 학습 진행 상태
- `words`: 단어 정보

**필요한 인덱스**:
```sql
-- 복습 쿼리 최적화
CREATE INDEX idx_user_word_progress_review 
ON user_word_progress(user_id, next_review) 
WHERE next_review <= CURRENT_DATE;

-- 레벨별 그룹화 최적화
CREATE INDEX idx_user_word_progress_level 
ON user_word_progress(user_id, level);
```

---

## 📱 화면 흐름도

```
[홈 화면]
    ↓
[하단 탭: 내 단어장]
    ↓
[단어장 메인 화면]
    ├─ [복습 카드] → [플래시카드 복습]
    │                    ↓
    │              [복습 완료 화면]
    │                    ↓
    │              [단어장으로 돌아가기]
    │
    ├─ [전체 단어 탭]
    │    ├─ [검색]
    │    └─ [단어 카드] → [단어 상세]
    │
    ├─ [레벨별 탭]
    │    └─ [레벨 그룹] → [단어 상세]
    │
    └─ [학습 통계]
```

---

## 🎯 MVP vs 확장 기능

### MVP (Phase 1)
- ✅ 복습 카드 (Review CTA)
- ✅ 전체 단어 탭 (검색 포함)
- ✅ 레벨별 탭
- ✅ 학습 통계 (기본 3개)
- ✅ 플래시카드 복습 (Hard/Good/Easy)
- ✅ SRS 알고리즘 (기본 간격)

### 확장 기능 (Phase 2)
- 🔄 단어 상세 정보 (예문, 발음)
- 🔄 단어 삭제 기능
- 🔄 단어 수동 레벨 조정
- 🔄 복습 히스토리 그래프
- 🔄 일일 복습 목표 설정
- 🔄 복습 알림 (Push Notification)
- 🔄 커스텀 SRS 간격 설정

---

## 🎨 디자인 시스템

### 색상
- **복습 카드**: `lavenderPalette.primaryDark` (보라색)
- **단어 카드**: `lavenderPalette.surface` (흰색)
- **레벨 배지**: 
  - Level 0: `#FF6B6B` (빨간색)
  - Level 1-2: `#FFD93D` (노란색)
  - Level 3-4: `#6BCB77` (초록색)
  - Level 5+: `#4D96FF` (파란색)

### 타이포그래피
- **복습 카드 숫자**: `typography.h1` (36px)
- **단어 한자**: `typography.h3` (24px)
- **단어 의미**: `typography.body` (16px)

### 간격
- **카드 간격**: `spacing.md` (16px)
- **섹션 간격**: `spacing.lg` (24px)

---

## ✅ 체크리스트

### 프론트엔드
- [ ] Bottom Tab Bar 구현
- [ ] 단어장 메인 화면 컴포넌트
- [ ] 복습 카드 컴포넌트
- [ ] 단어장 탭 (전체/레벨별)
- [ ] 검색 바 컴포넌트
- [ ] 단어 카드 컴포넌트
- [ ] 학습 통계 컴포넌트
- [ ] 플래시카드 복습 화면
- [ ] SRS 피드백 버튼
- [ ] 복습 완료 화면

### 백엔드
- [ ] Edge Function: 단어장 목록 조회
- [ ] Edge Function: 복습 개수 조회
- [ ] Edge Function: 복습 목록 조회
- [ ] Edge Function: 학습 통계 조회
- [ ] Edge Function: 복습 피드백 업데이트
- [ ] DB 인덱스 추가

### 테스트
- [ ] 단어장 목록 로딩 테스트
- [ ] 검색 기능 테스트
- [ ] 복습 카드 클릭 테스트
- [ ] 플래시카드 복습 플로우 테스트
- [ ] SRS 피드백 업데이트 테스트

---

## 📝 참고사항

1. **성능 최적화**:
   - 단어 목록은 페이지네이션 적용 (20개씩)
   - 검색은 debounce 적용 (300ms)
   - 복습 목록은 최대 20개로 제한

2. **접근성**:
   - 모든 버튼에 적절한 라벨 제공
   - 키보드 네비게이션 지원 (웹)
   - 스크린 리더 지원

3. **오프라인 지원** (향후):
   - 저장된 단어는 로컬 캐시
   - 복습은 오프라인에서도 가능
   - 동기화는 온라인 시 자동 수행

---

**작성일**: 2025-11-05  
**버전**: 1.0  
**작성자**: AI Assistant

