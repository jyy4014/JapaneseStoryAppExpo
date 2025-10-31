import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleProp,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../../theme/colors';

interface StyledButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  style?: StyleProp<ViewStyle>;
}

export default function StyledButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium',
  style,
}: StyledButtonProps) {
  const getButtonStyles = (): ViewStyle => {
    const baseStyles: ViewStyle = {
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    // Size styles
    switch (size) {
      case 'small':
        baseStyles.paddingHorizontal = 12;
        baseStyles.paddingVertical = 6;
        baseStyles.minHeight = 32;
        break;
      case 'large':
        baseStyles.paddingHorizontal = 24;
        baseStyles.paddingVertical = 16;
        baseStyles.minHeight = 56;
        break;
      default: // medium
        baseStyles.paddingHorizontal = 16;
        baseStyles.paddingVertical = 12;
        baseStyles.minHeight = 44;
    }

    // Variant styles
    switch (variant) {
      case 'secondary':
        baseStyles.backgroundColor = colors.backgroundSecondary;
        break;
      case 'outline':
        baseStyles.backgroundColor = 'transparent';
        baseStyles.borderWidth = 1;
        baseStyles.borderColor = colors.primary;
        break;
      default: // primary
        baseStyles.backgroundColor = colors.primary;
    }

    return baseStyles;
  };

  const getTextStyles = () => {
    const baseStyles = {
      fontWeight: '600' as const,
      textAlign: 'center' as const,
    };

    // Size-based font size
    switch (size) {
      case 'small':
        baseStyles.fontSize = 14;
        break;
      case 'large':
        baseStyles.fontSize = 18;
        break;
      default:
        baseStyles.fontSize = 16;
    }

    // Variant-based color
    switch (variant) {
      case 'secondary':
        baseStyles.color = colors.text;
        break;
      case 'outline':
        baseStyles.color = colors.primary;
        break;
      default:
        baseStyles.color = colors.white;
    }

    return baseStyles;
  };

  const buttonStyles = getButtonStyles();
  const textStyles = getTextStyles();

  // Disabled state
  if (disabled || loading) {
    buttonStyles.opacity = 0.6;
  }

  return (
    <TouchableOpacity
      style={[buttonStyles, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.white : colors.primary}
          style={{ marginRight: 8 }}
        />
      )}
      <Text style={textStyles}>
        {loading ? '로딩 중...' : title}
      </Text>
    </TouchableOpacity>
  );
}


