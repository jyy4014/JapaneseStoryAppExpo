import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

export interface SentenceCardProps {
  order: number;
  jpText: string;
  koText?: string;
  isTarget?: boolean;
}

function SentenceCard({ order, jpText, koText, isTarget = false }: SentenceCardProps) {
  return (
    <View style={[styles.container, isTarget && styles.targetBorder]}>
      <View style={styles.orderBadge}>
        <Text style={styles.orderText}>{order}</Text>
      </View>
      <View style={styles.body}>
        <Text style={[styles.jpText, isTarget && styles.highlight]}>{jpText}</Text>
        {koText && <Text style={styles.koText}>{koText}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.white,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    marginBottom: 12,
  },
  targetBorder: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  orderBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  orderText: {
    color: colors.white,
    fontWeight: '700',
  },
  body: {
    flex: 1,
  },
  jpText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  koText: {
    marginTop: 4,
    fontSize: 14,
    color: colors.textSecondary,
  },
  highlight: {
    color: colors.primary,
  },
});

export default SentenceCard;

