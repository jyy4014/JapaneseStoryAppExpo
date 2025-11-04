export interface BaseComponentProps {
  testID?: string
  accessibilityLabel?: string
  style?: unknown
}

export type ComponentVariant<T extends string = string> = T

