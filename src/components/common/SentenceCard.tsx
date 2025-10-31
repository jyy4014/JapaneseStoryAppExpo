import React from 'react';
import { View, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import Typography from './Typography';
import { colors } from '../../theme/colors';

interface SentenceCardProps {
  order: number;
  jpText: string;
  koText?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function SentenceCard({
  order,
  jpText,
  koText,
  onPress,
  style,
}: SentenceCardProps) {
  // props 검증
  if (typeof order !== 'number' || order < 0) {
    console.warn('[SentenceCard] Invalid order prop:', order);
  }

  if (!jpText || typeof jpText !== 'string') {
    console.warn('[SentenceCard] Invalid jpText prop:', jpText);
  }

  const CardContent = () => (
    <View style={[{ padding: 16, backgroundColor: colors.white, borderRadius: 8, marginVertical: 4 }, style]}>
      {/* 순서 표시 */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <View style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 8,
        }}>
          <Typography variant="caption" color={colors.white} style={{ fontWeight: 'bold' }}>
            {typeof order === 'number' ? order : '?'}
          </Typography>
        </View>
        <Typography variant="caption" color={colors.textSecondary}>
          문장 {typeof order === 'number' ? order : '?'}
        </Typography>
      </View>

      {/* 일본어 텍스트 */}
      <Typography variant="body" style={{ marginBottom: 8, fontWeight: '500' }}>
        {jpText || '일본어 텍스트가 없습니다.'}
      </Typography>

      {/* 한국어 번역 */}
      {koText && typeof koText === 'string' && koText.trim() && (
        <Typography variant="caption" color={colors.textSecondary}>
          {koText}
        </Typography>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <CardContent />
      </TouchableOpacity>
    );
  }

  return <CardContent />;
}
