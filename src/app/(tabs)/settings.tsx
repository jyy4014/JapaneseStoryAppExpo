import React from 'react'
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { lavenderPalette, spacing, typography } from '../../constants/theme'
import { useAuthStore } from '../../stores/authStore'

export default function SettingsScreen() {
  const { user } = useAuthStore()

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
                <Text style={styles.profileEmail}>{user?.email || 'test@example.com'}</Text>
                <Text style={styles.profileName}>{user?.display_name || '사용자'}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>수정</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 학습 설정 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>학습 설정</Text>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>선호 난이도</Text>
            <View style={styles.settingValue}>
              <Text style={styles.settingValueText}>중급 (Level 3)</Text>
              <Ionicons name="chevron-forward" size={20} color={lavenderPalette.textSecondary} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>일일 학습 목표</Text>
            <View style={styles.settingValue}>
              <Text style={styles.settingValueText}>10 분</Text>
              <Ionicons name="chevron-forward" size={20} color={lavenderPalette.textSecondary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* 알림 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>알림</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>학습 알림 받기</Text>
            <Ionicons name="toggle" size={24} color={lavenderPalette.primary} />
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
        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>로그아웃</Text>
        </TouchableOpacity>
      </ScrollView>
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
})

