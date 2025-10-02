import React from 'react';
import { Text, TextProps } from 'react-native';

type Variant = 'title' | 'subtitle' | 'body' | 'caption';

interface TypographyProps extends TextProps {
  variant?: Variant;
  color?: string;
  children: React.ReactNode;
}

const stylesByVariant: Record<Variant, TextProps['style']> = {
  title: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
};

function Typography({ variant = 'body', color = '#1F2933', style, children, ...rest }: TypographyProps) {
  return (
    <Text style={[stylesByVariant[variant], { color }, style]} {...rest}>
      {children}
    </Text>
  );
}

export default Typography;


