import React from 'react';
import { FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import Typography from '../common/Typography';
import { colors } from '../../theme/colors';

export interface HighlightStory {
  id: string;
  title: string;
  summary?: string;
  thumbnailUrl?: string;
  level?: string;
  onPress?: () => void;
}

interface StoryHighlightCarouselProps {
  stories: HighlightStory[];
}

const StoryHighlightCarousel: React.FC<StoryHighlightCarouselProps> = ({ stories }) => {
  if (stories.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Typography variant="subtitle">오늘의 추천 사연</Typography>
        <Typography variant="caption" color={colors.textSecondary}>
          새로운 스토리로 학습 동기를 얻어보세요
        </Typography>
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={stories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={item.onPress}
          >
            {item.thumbnailUrl ? (
              <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
            ) : (
              <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
                <Typography variant="subtitle" color={colors.white}>
                  JP
                </Typography>
              </View>
            )}
            <View style={styles.cardContent}>
              <Typography variant="subtitle" style={styles.title}>
                {item.title}
              </Typography>
              {item.summary ? (
                <Typography variant="body" color={colors.textSecondary} numberOfLines={3}>
                  {item.summary}
                </Typography>
              ) : null}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  header: {
    marginBottom: 12,
  },
  listContent: {
    gap: 16,
    paddingRight: 20,
  },
  card: {
    width: 260,
    borderRadius: 20,
    backgroundColor: colors.white,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: 140,
  },
  thumbnailPlaceholder: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D9D6F7',
  },
  cardContent: {
    padding: 16,
    gap: 8,
  },
  title: {
    marginBottom: 4,
  },
});

export default StoryHighlightCarousel;


