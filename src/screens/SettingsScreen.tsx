import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Typography from '../components/common/Typography';
import StyledButton from '../components/common/StyledButton';
import SettingsGroup from '../components/settings/SettingsGroup';
import WordChip from '../components/common/WordChip';
import useUserSettingsStore from '../store/useUserSettingsStore';
import { colors } from '../theme/colors';

const levels: Array<'N5' | 'N4' | 'N3' | 'N2' | 'N1'> = ['N5', 'N4', 'N3', 'N2', 'N1'];
const languages = [
  { value: 'ko', label: '한국어' },
  { value: 'ja', label: '日本語' },
  { value: 'en', label: 'English' },
];

function SettingsScreen() {
  const { settings, isLoading, error, loadSettings, saveProfile, savePreferences, saveNotifications } =
    useUserSettingsStore();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handlePreferredLevel = async (level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1') => {
    setSaving(true);
    try {
      await saveProfile({ preferredLevel: level });
    } finally {
      setSaving(false);
    }
  };

  const handleDailyTarget = async (minutes: number) => {
    setSaving(true);
    try {
      await savePreferences({ dailyTargetMinutes: minutes });
    } finally {
      setSaving(false);
    }
  };

  const handleReviewReminder = async (enabled: boolean) => {
    setSaving(true);
    try {
      await saveNotifications({ reviewReminder: enabled });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading && !settings) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loader}>
          <Typography variant="body">설정을 불러오는 중입니다...</Typography>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !settings) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loader}>
          <Typography variant="body" color={colors.secondary}>
            {error}
          </Typography>
          <StyledButton title="다시 시도" onPress={loadSettings} style={styles.retryButton} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Typography variant="title" style={styles.title}>
          설정
        </Typography>
        <Typography variant="body" color={colors.textSecondary}>
          선호 옵션을 조정하여 최적의 학습 환경을 만들어보세요.
        </Typography>

        {error ? (
          <View style={styles.errorBanner}>
            <Typography variant="body" color={colors.secondary}>
              {error}
            </Typography>
            <StyledButton title="다시 시도" onPress={loadSettings} style={styles.retryButton} />
          </View>
        ) : null}

        {settings ? (
          <>
            <SettingsGroup title="사용자 정보">
              <Typography variant="body">{settings.profile.displayName ?? '닉네임 미지정'}</Typography>
              <Typography variant="caption" color={colors.textSecondary}>
                {settings.profile.email}
              </Typography>
              <View style={styles.chipRow}>
                {levels.map((level) => (
                  <WordChip
                    key={level}
                    label={level}
                    color={settings.profile.preferredLevel === level ? colors.primary : colors.muted}
                    textColor={settings.profile.preferredLevel === level ? colors.white : colors.textPrimary}
                    onPress={() => handlePreferredLevel(level)}
                  />
                ))}
              </View>
            </SettingsGroup>

            <SettingsGroup title="학습 목표" description="하루 학습 목표 시간을 선택하세요.">
              <View style={styles.chipRow}>
                {[15, 30, 45, 60, 90].map((minutes) => (
                  <WordChip
                    key={minutes}
                    label={`${minutes}분`}
                    color={settings.preferences.dailyTargetMinutes === minutes ? colors.primary : colors.muted}
                    textColor={
                      settings.preferences.dailyTargetMinutes === minutes ? colors.white : colors.textPrimary
                    }
                    onPress={() => handleDailyTarget(minutes)}
                  />
                ))}
              </View>
            </SettingsGroup>

            <SettingsGroup title="알림 설정">
              <View style={styles.rowBetween}>
                <Typography variant="body">복습 알림</Typography>
                <StyledButton
                  title={settings.notifications.reviewReminder ? '켜짐' : '꺼짐'}
                  onPress={() => handleReviewReminder(!settings.notifications.reviewReminder)}
                  variant={settings.notifications.reviewReminder ? 'secondary' : 'primary'}
                />
              </View>
            </SettingsGroup>

            <SettingsGroup title="언어">
              <View style={styles.chipRow}>
                {languages.map((item) => (
                  <WordChip
                    key={item.value}
                    label={item.label}
                    color={settings.preferences.language === item.value ? colors.primary : colors.muted}
                    textColor={settings.preferences.language === item.value ? colors.white : colors.textPrimary}
                    onPress={() => savePreferences({ language: item.value as any })}
                  />
                ))}
              </View>
            </SettingsGroup>

            <SettingsGroup title="계정 관리">
              <StyledButton title="토큰 갱신" onPress={() => {}} />
              <StyledButton title="로그아웃" onPress={() => {}} variant="secondary" />
            </SettingsGroup>
          </>
        ) : null}

        {saving ? (
          <View style={styles.savingBanner}>
            <Typography variant="caption">변경 사항을 저장 중입니다...</Typography>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButton: {
    marginTop: 12,
  },
  errorBanner: {
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.white,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  savingBanner: {
    marginTop: 24,
    alignItems: 'center',
  },
});

export default SettingsScreen;

