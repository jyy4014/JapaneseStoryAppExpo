import { ExpoRoot } from 'expo-router'

export default function App() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ctx = require.context('./src/app')
  return <ExpoRoot context={ctx} />
}

