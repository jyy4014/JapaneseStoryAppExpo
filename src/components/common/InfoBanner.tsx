import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Typography from './Typography';
import { colors } from '../../theme/colors';

type Variant = 'info' | 'success' | 'error';

interface InfoBannerProps {
  message: string;
  variant?: Variant;
  style?: StyleProp<ViewStyle>;
}

const variantStyles: Record<Variant, { background: string; text: string }> = {
  info: { background: '#EFF6FF', text: colors.info },
  success: { background: '#ECFDF5', text: colors.success },
  error: { background: '#FEF2F2', text: colors.error },
};

const InfoBanner: React.FC<InfoBannerProps> = ({ message, variant = 'info', style }) => {
  const palette = variantStyles[variant];

  return (
    <View style={[styles.container, { backgroundColor: palette.background }, style]}>
      <Typography variant="body" color={palette.text}>
        {message}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 12,
  },
});

export default InfoBanner;



