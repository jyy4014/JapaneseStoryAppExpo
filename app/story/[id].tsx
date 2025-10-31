import { useLocalSearchParams } from 'expo-router';
import StoryDetailScreen from '../../src/screens/StoryDetailScreen';

export default function StoryDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) {
    return null; // ID가 없으면 렌더링하지 않음
  }

  return <StoryDetailScreen storyId={id} />;
}
