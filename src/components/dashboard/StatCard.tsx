import React from 'react';
import { View, StyleSheet } from 'react-native';
import Typography from '../common/Typography';
import { colors } from '../../theme/colors';

interface StatCardProps {
  label: string;
  value: string;
  description?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, description }) => {
  return (
    <View style={styles.container}>
      <Typography variant="caption" color={colors.textSecondary}>
        {label}
      </Typography>
      <Typography variant="title" style={styles.value}>
        {value}
      </Typography>
      {description ? (
        <Typography variant="caption" color={colors.textSecondary}>
          {description}
        </Typography>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.white,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 3,
    marginRight: 12,
    marginBottom: 12,
  },
  value: {
    marginTop: 8,
    marginBottom: 4,
  },
});

export default StatCard;
