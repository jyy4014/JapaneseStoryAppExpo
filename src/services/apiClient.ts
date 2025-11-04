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

const resolveBaseUrl = () => {
  return (
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    process.env.API_BASE_URL ||
    DEFAULT_BASE_URL
  )
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

