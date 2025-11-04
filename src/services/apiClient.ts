export interface ApiError {
  message: string
  status?: number
  payload?: unknown
}

export type RequestQuery = Record<string, string | number | boolean | null | undefined>

export type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
  query?: RequestQuery
}

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
}

const DEFAULT_BASE_URL = 'http://127.0.0.1:54321/functions/v1/api'

// Supabase anon key for mock auth
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6Y3NjcGNyYWtwZGZzdmx1eWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyOTUzMDgsImV4cCI6MjA3NDg3MTMwOH0.YmMbhPQGml4-AbYhJgrrDf6m-ZBS7KPN3KTgmeNzsZw'

const resolveBaseUrl = () => {
  return (
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    process.env.API_BASE_URL ||
    DEFAULT_BASE_URL
  )
}

const getAuthHeaders = () => {
  // 항상 anon key를 헤더에 포함 (테스트 및 개발용)
  // 프로덕션에서는 실제 사용자 토큰으로 교체 필요
  return {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  }
}

const buildUrl = (path: string, query?: RequestQuery) => {
  const baseUrl = resolveBaseUrl().replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = new URL(`${baseUrl}${normalizedPath}`)

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null) return
      url.searchParams.append(key, String(value))
    })
  }

  return url
}

const parseBody = async (response: Response) => {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch (error) {
    console.warn('ApiClient: failed to parse response body as JSON', error)
    return text
  }
}

export class ApiClient {
  static async request<T>(path: string, options: RequestOptions = {}) {
    const { method = 'GET', query, headers, body, ...rest } = options
    const url = buildUrl(path, query)

    const fetchOptions: RequestInit = {
      method,
      credentials: 'include',
      headers: {
        ...DEFAULT_HEADERS,
        ...getAuthHeaders(),
        ...(headers || {}),
      },
      ...rest,
    }

    if (body !== undefined) {
      const payload = typeof body === 'string' ? body : JSON.stringify(body)
      fetchOptions.body = payload as any
    }

    try {
      const response = await fetch(url.toString(), fetchOptions)
      const payload = await parseBody(response)

      if (!response.ok) {
        const error: ApiError = {
          message: payload?.message || 'Request failed',
          status: response.status,
          payload,
        }
        return { data: null as T | null, error }
      }

      return { data: payload as T, error: null }
    } catch (error) {
      const apiError: ApiError = {
        message: error instanceof Error ? error.message : 'Network request failed',
        payload: error,
      }
      return { data: null as T | null, error: apiError }
    }
  }

  static get<T>(path: string, query?: RequestQuery) {
    return this.request<T>(path, { method: 'GET', query })
  }

  static post<T>(path: string, body?: unknown, query?: RequestQuery) {
    return this.request<T>(path, { method: 'POST', body, query })
  }
}
