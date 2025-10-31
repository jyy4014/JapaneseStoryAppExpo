import Constants from 'expo-constants'

type DebugExtra = {
  useMockAuth?: boolean
  mockUserEmail?: string
}

const rawExtra =
  (Constants.expoConfig?.extra as Record<string, unknown> | undefined) ??
  ((Constants as unknown as { manifest?: { extra?: Record<string, unknown> } }).manifest?.extra ??
    (Constants as unknown as { manifest2?: { extra?: Record<string, unknown> } }).manifest2?.extra ??
  {})

const extra = (rawExtra.debug as DebugExtra | undefined) ?? (rawExtra as DebugExtra)

const envMockFlag =
  typeof process.env.EXPO_PUBLIC_USE_MOCK_AUTH === 'string'
    ? process.env.EXPO_PUBLIC_USE_MOCK_AUTH.toLowerCase() === 'true'
    : undefined

const resolvedMockFlag =
  envMockFlag !== undefined
    ? envMockFlag
    : typeof extra.useMockAuth === 'boolean'
      ? extra.useMockAuth
      : false

export const debugAuthConfig = {
  useMockAuth: __DEV__ && resolvedMockFlag,
  mockUser: {
    id: 'debug-user',
    email: extra.mockUserEmail ?? 'debug@example.com',
  },
}


