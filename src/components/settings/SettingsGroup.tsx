import React from 'react';
import { View, StyleSheet } from 'react-native';
import Typography from '../common/Typography';
import { colors } from '../../theme/colors';

interface SettingsGroupProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

const SettingsGroup: React.FC<SettingsGroupProps> = ({ title, description, children }) => {
  return (
    <View style={styles.container}>
      <Typography variant="subtitle" style={styles.title}>
        {title}
      </Typography>
      {description ? (
        <Typography variant="caption" color={colors.textSecondary}>
          {description}
        </Typography>
      ) : null}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  title: {
    marginBottom: 4,
  },
  content: {
    marginTop: 12,
    gap: 12,
  },
});

export default SettingsGroup;
