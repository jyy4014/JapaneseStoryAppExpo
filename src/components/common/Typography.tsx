import React from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';
import { colors } from '../../theme/colors';

type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'title'
  | 'subtitle'
  | 'body'
  | 'caption'
  | 'small';

interface TypographyProps {
  variant?: TypographyVariant;
  color?: string;
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
}

const getVariantStyles = (variant: TypographyVariant): TextStyle => {
  switch (variant) {
    case 'h1':
      return {
        fontSize: 32,
        fontWeight: 'bold',
        lineHeight: 40,
        color: colors.text,
      };
    case 'h2':
      return {
        fontSize: 24,
        fontWeight: 'bold',
        lineHeight: 32,
        color: colors.text,
      };
    case 'h3':
      return {
        fontSize: 20,
        fontWeight: '600',
        lineHeight: 28,
        color: colors.text,
      };
    case 'title':
      return {
        fontSize: 18,
        fontWeight: '600',
        lineHeight: 24,
        color: colors.text,
      };
    case 'subtitle':
      return {
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 22,
        color: colors.text,
      };
    case 'body':
      return {
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 24,
        color: colors.text,
      };
    case 'caption':
      return {
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 20,
        color: colors.textSecondary,
      };
    case 'small':
      return {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 16,
        color: colors.textLight,
      };
    default:
      return {
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 24,
        color: colors.text,
      };
  }
};

export default function Typography({
  variant = 'body',
  color,
  style,
  children
}: TypographyProps) {
  const variantStyles = getVariantStyles(variant);
  const textColor = color || variantStyles.color;

  return (
    <Text
      style={[
        variantStyles,
        { color: textColor },
        style,
      ]}
    >
      {children}
    </Text>
  );
}


