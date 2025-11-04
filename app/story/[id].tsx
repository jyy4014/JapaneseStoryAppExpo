import { View, Text, StyleSheet } from 'react-native'
import { useLocalSearchParams } from 'expo-router'

export default function StoryDetailPlaceholder() {
  const { id } = useLocalSearchParams<{ id?: string }>()

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>스토리 상세 페이지 준비 중입니다.</Text>
      {id ? <Text style={styles.caption}>요청한 스토리 ID: {id}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F8F6FF',
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3D2E72',
    textAlign: 'center',
  },
  caption: {
    marginTop: 12,
    fontSize: 14,
    color: '#6C5A9B',
  },
})
