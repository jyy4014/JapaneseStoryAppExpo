import React from 'react';
import { TextInput, View, StyleSheet, TextInputProps } from 'react-native';
import Typography from './Typography';
import { colors } from '../../theme/colors';

interface Props extends TextInputProps {
  label?: string;
  errorMessage?: string;
}

const TextInputField: React.FC<Props> = ({ label, errorMessage, style, ...props }) => {
  return (
    <View style={styles.container}>
      {label ? (
        <Typography variant="caption" color={colors.textSecondary} style={styles.label}>
          {label}
        </Typography>
      ) : null}
      <TextInput
        style={[styles.input, errorMessage ? styles.inputError : null, style]}
        placeholderTextColor={colors.muted}
        {...props}
      />
      {errorMessage ? (
        <Typography variant="caption" color={colors.error} style={styles.error}>
          {errorMessage}
        </Typography>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    marginBottom: 4,
  },
  input: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.muted,
    backgroundColor: colors.white,
    color: colors.textPrimary,
    fontSize: 16,
  },
  inputError: {
    borderColor: colors.error,
  },
  error: {
    marginTop: 4,
  },
});

export default TextInputField;

