import React, { useState, useEffect } from 'react'
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { lavenderPalette, spacing, typography } from '../../constants/theme'
import { useAuthStore } from '../../stores/authStore'

interface UserPreferences {
  userId: string
  language: string
  difficultyPreference: number
  dailyGoalMinutes: number
  notificationEnabled: boolean
  createdAt: string
  updatedAt: string
}

interface Profile {
  id: string
  email: string
  displayName: string | null
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
}

const difficultyLabels = ['입문', '초급', '초중급', '중급', '중상급']

export default function SettingsScreen() {
  const router = useRouter()
  const { user, setUser } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [editDisplayNameModal, setEditDisplayNameModal] = useState(false)
  const [editDisplayName, setEditDisplayName] = useState('')
  const [editDifficultyModal, setEditDifficultyModal] = useState(false)
  const [editDailyGoalModal, setEditDailyGoalModal] = useState(false)
  const [editDailyGoal, setEditDailyGoal] = useState(10)
  const [saving, setSaving] = useState(false)
  const userId = user?.id || 'e5d4b7b3-de14-4b9a-b6c8-03dfe90fba97' // 테스트용

  // 설정 및 프로필 로드
  useEffect(() => {
    if (userId) {
      loadSettings()
      loadProfile()
    }
  }, [userId])

  const loadSettings = async () => {
    try {
      const baseUrl = 'https://yzcscpcrakpdfsvluyej.supabase.co/functions/v1/api'
      const headers = {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6Y3NjcGNyYWtwZGZzdmx1eWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyOTUzMDgsImV4cCI6MjA3NDg3MTMwOH0.YmMbhPQGml4-AbYhJgrrDf6m-ZBS7KPN3KTgmeNzsZw',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6Y3NjcGNyYWtwZGZzdmx1eWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyOTUzMDgsImV4cCI6MjA3NDg3MTMwOH0.YmMbhPQGml4-AbYhJgrrDf6m-ZBS7KPN3KTgmeNzsZw',
      }

      const res = await fetch(`${baseUrl}/settings?userId=${userId}`, { headers })
      if (!res.ok) {
        throw new Error(`설정 조회 실패: ${res.status}`)
      }
      const data = await res.json()
      setPreferences(data.preferences)
    } catch (error) {
      console.error('Failed to load settings:', error)
      // 기본값 설정
      setPreferences({
        userId,
        language: 'ko',
        difficultyPreference: 3,
        dailyGoalMinutes: 10,
        notificationEnabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }
  }

  const loadProfile = async () => {
    try {
      const baseUrl = 'https://yzcscpcrakpdfsvluyej.supabase.co/functions/v1/api'
      const headers = {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6Y3NjcGNyYWtwZGZzdmx1eWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyOTUzMDgsImV4cCI6MjA3NDg3MTMwOH0.YmMbhPQGml4-AbYhJgrrDf6m-ZBS7KPN3KTgmeNzsZw',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6Y3NjcGNyYWtwZGZzdmx1eWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyOTUzMDgsImV4cCI6MjA3NDg3MTMwOH0.YmMbhPQGml4-AbYhJgrrDf6m-ZBS7KPN3KTgmeNzsZw',
      }

      const res = await fetch(`${baseUrl}/settings/profile?userId=${userId}`, { headers })
      if (!res.ok) {
        throw new Error(`프로필 조회 실패: ${res.status}`)
      }
      const data = await res.json()
      setProfile(data.profile)
    } catch (error) {
      console.error('Failed to load profile:', error)
      // 기본값 설정
      setProfile({
        id: userId,
        email: user?.email || 'test@example.com',
        displayName: user?.display_name || '사용자',
        avatarUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (displayName: string) => {
    if (!userId) return

    setSaving(true)
    try {
      const baseUrl = 'https://yzcscpcrakpdfsvluyej.supabase.co/functions/v1/api'
      const headers = {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6Y3NjcGNyYWtwZGZzdmx1eWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyOTUzMDgsImV4cCI6MjA3NDg3MTMwOH0.YmMbhPQGml4-AbYhJgrrDf6m-ZBS7KPN3KTgmeNzsZw',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6Y3NjcGNyYWtwZGZzdmx1eWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyOTUzMDgsImV4cCI6MjA3NDg3MTMwOH0.YmMbhPQGml4-AbYhJgrrDf6m-ZBS7KPN3KTgmeNzsZw',
      }

      const res = await fetch(`${baseUrl}/settings/profile?userId=${userId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ displayName }),
      })

      if (!res.ok) {
        throw new Error('프로필 업데이트 실패')
      }

      const data = await res.json()
      setProfile(data.profile)
      setUser({ ...user, display_name: data.profile.displayName })
      setEditDisplayNameModal(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
      Alert.alert('오류', '프로필을 업데이트하지 못했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const updateSettings = async (updates: Partial<UserPreferences>) => {
    if (!userId) return

    setSaving(true)
    try {
      const baseUrl = 'https://yzcscpcrakpdfsvluyej.supabase.co/functions/v1/api'
      const headers = {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6Y3NjcGNyYWtwZGZzdmx1eWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyOTUzMDgsImV4cCI6MjA3NDg3MTMwOH0.YmMbhPQGml4-AbYhJgrrDf6m-ZBS7KPN3KTgmeNzsZw',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6Y3NjcGNyYWtwZGZzdmx1eWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyOTUzMDgsImV4cCI6MjA3NDg3MTMwOH0.YmMbhPQGml4-AbYhJgrrDf6m-ZBS7KPN3KTgmeNzsZw',
      }

      const res = await fetch(`${baseUrl}/settings?userId=${userId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updates),
      })

      if (!res.ok) {
        throw new Error('설정 업데이트 실패')
      }

      const data = await res.json()
      setPreferences(data.preferences)
      setEditDifficultyModal(false)
      setEditDailyGoalModal(false)
    } catch (error) {
      console.error('Failed to update settings:', error)
      Alert.alert('오류', '설정을 업데이트하지 못했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    Alert.alert('로그아웃', '로그아웃하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          // TODO: supabase.auth.signOut() 호출
          setUser(null)
          // TODO: 로그인 페이지로 이동
          console.log('Logged out')
        },
      },
    ])
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={lavenderPalette.primary} />
          <Text style={styles.loadingText}>설정을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 프로필 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>프로필</Text>
          <View style={styles.profileCard}>
            <View style={styles.profileInfo}>
              <Ionicons name="person-circle" size={48} color={lavenderPalette.primary} />
              <View style={styles.profileText}>
                <Text style={styles.profileEmail}>{profile?.email || user?.email || 'test@example.com'}</Text>
                <Text style={styles.profileName}>{profile?.displayName || user?.display_name || '사용자'}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                setEditDisplayName(profile?.displayName || '')
                setEditDisplayNameModal(true)
              }}
            >
              <Text style={styles.editButtonText}>수정</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 학습 설정 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>학습 설정</Text>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => {
              setEditDifficultyModal(true)
            }}
          >
            <Text style={styles.settingLabel}>선호 난이도</Text>
            <View style={styles.settingValue}>
              <Text style={styles.settingValueText}>
                {preferences
                  ? `${difficultyLabels[Math.max(0, Math.min(4, preferences.difficultyPreference - 1))]} (Level ${preferences.difficultyPreference})`
                  : '중급 (Level 3)'}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={lavenderPalette.textSecondary} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => {
              setEditDailyGoal(preferences?.dailyGoalMinutes || 10)
              setEditDailyGoalModal(true)
            }}
          >
            <Text style={styles.settingLabel}>일일 학습 목표</Text>
            <View style={styles.settingValue}>
              <Text style={styles.settingValueText}>{preferences?.dailyGoalMinutes || 10} 분</Text>
              <Ionicons name="chevron-forward" size={20} color={lavenderPalette.textSecondary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* 알림 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>알림</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>학습 알림 받기</Text>
            <Switch
              value={preferences?.notificationEnabled ?? true}
              onValueChange={(value) => {
                updateSettings({ notificationEnabled: value })
              }}
              trackColor={{ false: '#E5E5E5', true: lavenderPalette.primaryLight }}
              thumbColor={preferences?.notificationEnabled ? lavenderPalette.primaryDark : '#f4f3f4'}
            />
          </View>
        </View>

        {/* 앱 정보 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>앱 정보</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>버전</Text>
            <Text style={styles.settingValueText}>1.0.0</Text>
          </View>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>서비스 이용 약관</Text>
            <Ionicons name="chevron-forward" size={20} color={lavenderPalette.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>개인정보 처리 방침</Text>
            <Ionicons name="chevron-forward" size={20} color={lavenderPalette.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* 로그아웃 */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>로그아웃</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 닉네임 수정 모달 */}
      <Modal visible={editDisplayNameModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>닉네임 수정</Text>
            <TextInput
              style={styles.modalInput}
              value={editDisplayName}
              onChangeText={setEditDisplayName}
              placeholder="닉네임을 입력하세요"
              placeholderTextColor={lavenderPalette.textSecondary}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setEditDisplayNameModal(false)}
              >
                <Text style={styles.modalButtonTextCancel}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={() => {
                  if (editDisplayName.trim()) {
                    updateProfile(editDisplayName.trim())
                  }
                }}
                disabled={saving || !editDisplayName.trim()}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={lavenderPalette.surface} />
                ) : (
                  <Text style={styles.modalButtonTextSave}>저장</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 난이도 선택 모달 */}
      <Modal visible={editDifficultyModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>선호 난이도 선택</Text>
            {[1, 2, 3, 4, 5].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.modalOption,
                  preferences?.difficultyPreference === level && styles.modalOptionSelected,
                ]}
                onPress={() => {
                  updateSettings({ difficultyPreference: level })
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    preferences?.difficultyPreference === level && styles.modalOptionTextSelected,
                  ]}
                >
                  Level {level}: {difficultyLabels[Math.max(0, Math.min(4, level - 1))]}
                </Text>
                {preferences?.difficultyPreference === level && (
                  <Ionicons name="checkmark" size={20} color={lavenderPalette.primaryDark} />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonCancel, { marginTop: spacing.md }]}
              onPress={() => setEditDifficultyModal(false)}
            >
              <Text style={styles.modalButtonTextCancel}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 일일 학습 목표 수정 모달 */}
      <Modal visible={editDailyGoalModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>일일 학습 목표 (분)</Text>
            <TextInput
              style={styles.modalInput}
              value={editDailyGoal.toString()}
              onChangeText={(text) => {
                const num = parseInt(text, 10)
                if (!isNaN(num) && num > 0) {
                  setEditDailyGoal(num)
                }
              }}
              keyboardType="number-pad"
              placeholder="목표 시간(분)을 입력하세요"
              placeholderTextColor={lavenderPalette.textSecondary}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setEditDailyGoalModal(false)}
              >
                <Text style={styles.modalButtonTextCancel}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={() => {
                  updateSettings({ dailyGoalMinutes: editDailyGoal })
                }}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={lavenderPalette.surface} />
                ) : (
                  <Text style={styles.modalButtonTextSave}>저장</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lavenderPalette.background,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: lavenderPalette.text,
    marginBottom: spacing.md,
  },
  profileCard: {
    backgroundColor: lavenderPalette.surface,
    borderRadius: spacing.md,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  profileText: {
    gap: spacing.xs,
  },
  profileEmail: {
    ...typography.body,
    color: lavenderPalette.text,
    fontSize: 16,
  },
  profileName: {
    ...typography.body,
    color: lavenderPalette.textSecondary,
    fontSize: 14,
  },
  editButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.sm,
    backgroundColor: lavenderPalette.primaryLight,
  },
  editButtonText: {
    ...typography.body,
    color: lavenderPalette.primaryDark,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: lavenderPalette.surface,
    borderRadius: spacing.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  settingLabel: {
    ...typography.body,
    color: lavenderPalette.text,
    fontSize: 16,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  settingValueText: {
    ...typography.body,
    color: lavenderPalette.textSecondary,
    fontSize: 16,
  },
  logoutButton: {
    margin: spacing.lg,
    marginTop: spacing.xl,
    padding: spacing.lg,
    backgroundColor: '#FF6B6B',
    borderRadius: spacing.md,
    alignItems: 'center',
  },
  logoutButtonText: {
    ...typography.body,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: lavenderPalette.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: lavenderPalette.surface,
    borderTopLeftRadius: spacing.xl,
    borderTopRightRadius: spacing.xl,
    padding: spacing.xl,
    paddingBottom: spacing.xl * 2,
  },
  modalTitle: {
    ...typography.h3,
    color: lavenderPalette.text,
    marginBottom: spacing.lg,
  },
  modalInput: {
    backgroundColor: lavenderPalette.background,
    borderRadius: spacing.md,
    padding: spacing.md,
    ...typography.body,
    color: lavenderPalette.text,
    fontSize: 16,
    marginBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonCancel: {
    backgroundColor: lavenderPalette.primaryLight,
  },
  modalButtonSave: {
    backgroundColor: lavenderPalette.primaryDark,
  },
  modalButtonTextCancel: {
    ...typography.button,
    color: lavenderPalette.primaryDark,
    fontWeight: '600',
  },
  modalButtonTextSave: {
    ...typography.button,
    color: lavenderPalette.surface,
    fontWeight: '600',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: lavenderPalette.background,
  },
  modalOptionSelected: {
    backgroundColor: lavenderPalette.primaryLight,
  },
  modalOptionText: {
    ...typography.body,
    color: lavenderPalette.text,
    fontSize: 16,
  },
  modalOptionTextSelected: {
    color: lavenderPalette.primaryDark,
    fontWeight: '600',
  },
})

