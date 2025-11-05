import React, { ReactNode } from 'react'
import { Text, TextStyle } from 'react-native'

export interface ParsedWord {
  wordId: string
  text: string
}

export interface ParsedSegment {
  type: 'text' | 'word'
  text: string
  wordId?: string
}

/**
 * Script에서 <w word_id="...">텍스트</w> 태그를 파싱
 * 
 * 예: "어제 카페에서 <w word_id=\"friend-123\">친구</w>를 만났어요."
 * → [
 *     { type: 'text', text: '어제 카페에서 ' },
 *     { type: 'word', text: '친구', wordId: 'friend-123' },
 *     { type: 'text', text: '를 만났어요.' }
 *   ]
 */
export function parseScript(script: string): ParsedSegment[] {
  const segments: ParsedSegment[] = []
  const regex = /<w\s+word_id="([^"]+)">([^<]+)<\/w>/g
  
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(script)) !== null) {
    // 태그 이전의 일반 텍스트
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        text: script.substring(lastIndex, match.index),
      })
    }

    // 단어 태그
    segments.push({
      type: 'word',
      text: match[2],
      wordId: match[1],
    })

    lastIndex = regex.lastIndex
  }

  // 마지막 남은 텍스트
  if (lastIndex < script.length) {
    segments.push({
      type: 'text',
      text: script.substring(lastIndex),
    })
  }

  return segments
}

/**
 * ParsedSegment 배열을 React Native Text 컴포넌트로 렌더링
 * 
 * @param segments - parseScript()의 결과
 * @param onWordPress - 단어 클릭 핸들러
 * @param textStyle - 일반 텍스트 스타일
 * @param wordStyle - 단어 텍스트 스타일
 */
export function renderParsedScript(
  segments: ParsedSegment[],
  onWordPress: (wordId: string, wordText: string) => void,
  textStyle?: TextStyle,
  wordStyle?: TextStyle,
): ReactNode {
  return segments.map((segment, index) => {
    if (segment.type === 'word' && segment.wordId) {
      return (
        <Text
          key={`${segment.wordId}-${index}`}
          style={[textStyle, wordStyle]}
          onPress={() => onWordPress(segment.wordId!, segment.text)}
        >
          {segment.text}
        </Text>
      )
    }

    return (
      <Text key={`text-${index}`} style={textStyle}>
        {segment.text}
      </Text>
    )
  })
}

