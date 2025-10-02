import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface WordChipProps {
  label: string;
  color?: string;
  onPress?: () => void;
  textColor?: string;
}

function WordChip({ label, color = '#E5E7EB', textColor = '#1F2933', onPress }: WordChipProps) {
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: color }]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default WordChip;

