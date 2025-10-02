import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface StyledButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

const StyledButton: React.FC<StyledButtonProps> = ({ title, onPress, variant = 'primary' }) => {
  const buttonStyle = variant === 'primary' ? styles.primary : styles.secondary;

  return (
    <TouchableOpacity style={[styles.button, buttonStyle]} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#A49EE4',
  },
  secondary: {
    backgroundColor: '#F9D770',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default StyledButton;
