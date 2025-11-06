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

// GET 요청에는 Content-Type을 보내지 않아 CORS preflight를 피함
const DEFAULT_HEADERS = {
  Accept: 'application/json',
}

const DEFAULT_BASE_URL = 'https://yzcscpcrakpdfsvluyej.supabase.co/functions/v1/api'

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
  
  // URL 인코딩을 방지하기 위해 문자열로 직접 구성
  let urlString = `${baseUrl}${normalizedPath}`
  
  if (query) {
    const searchParams = new URLSearchParams()
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null) return
      searchParams.append(key, String(value))
    })
    const queryString = searchParams.toString()
    if (queryString) {
      urlString += `?${queryString}`
    }
  }

  return new URL(urlString)
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
  static async request<T>(path: string, options: RequestOptions = {}, retryCount = 0): Promise<{ data: T | null; error: ApiError | null }> {
    const { method = 'GET', query, headers, body, ...rest } = options
    const url = buildUrl(path, query)
    const requestId = Math.random().toString(36).substring(7)
    const startTime = Date.now()
    const maxRetries = 2
    const retryDelay = 500 // 500ms

    const fetchOptions: RequestInit = {
      method,
      // credentials: 'include'를 제거하여 CORS 문제 방지
      headers: {
        ...DEFAULT_HEADERS,
        ...getAuthHeaders(),
        ...(headers || {}),
      },
      ...rest,
    }

    // POST/PUT 등 body가 있는 경우에만 Content-Type 추가 (CORS preflight 방지)
    if (body !== undefined) {
      const payload = typeof body === 'string' ? body : JSON.stringify(body)
      fetchOptions.body = payload as any
      // body가 있을 때만 Content-Type 추가
      if (!fetchOptions.headers) {
        fetchOptions.headers = {}
      }
      if (!(fetchOptions.headers as Record<string, string>)['Content-Type']) {
        ;(fetchOptions.headers as Record<string, string>)['Content-Type'] = 'application/json'
      }
    }

    // 요청 시작 로그
    console.log(`[ApiClient:${requestId}] Request started${retryCount > 0 ? ` (retry ${retryCount})` : ''}`, {
      method,
      path,
      url: url.toString(),
      hasBody: !!body,
      retryCount,
      headers: {
        ...fetchOptions.headers,
        // 민감한 정보는 마스킹
        apikey: fetchOptions.headers?.['apikey'] ? '[REDACTED]' : undefined,
        Authorization: fetchOptions.headers?.['Authorization'] ? '[REDACTED]' : undefined,
      },
    })

    try {
      const response = await fetch(url.toString(), fetchOptions)
      const duration = Date.now() - startTime

      // 응답 로그
      console.log(`[ApiClient:${requestId}] Response received`, {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        duration: `${duration}ms`,
        retryCount,
        headers: Object.fromEntries(response.headers.entries()),
      })

      const payload = await parseBody(response)

      if (!response.ok) {
        console.error(`[ApiClient:${requestId}] Request failed`, {
          status: response.status,
          statusText: response.statusText,
          payload,
          url: response.url,
          retryCount,
        })

        const error: ApiError = {
          message: payload?.message || 'Request failed',
          status: response.status,
          payload,
        }
        return { data: null as T | null, error }
      }

      console.log(`[ApiClient:${requestId}] Request succeeded`, {
        status: response.status,
        hasData: !!payload,
        duration: `${duration}ms`,
        retryCount,
      })

      return { data: payload as T, error: null }
    } catch (error) {
      const duration = Date.now() - startTime

      // 네트워크 에러 상세 로그
      console.error(`[ApiClient:${requestId}] Network error`, {
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
        url: url.toString(),
        method,
        duration: `${duration}ms`,
        retryCount,
        errorType: error instanceof TypeError ? 'TypeError (CORS/Network)' : 
                  error instanceof Error ? error.constructor.name : 'Unknown',
      })

      // 재시도 로직: 네트워크 에러이고 재시도 횟수가 남아있으면 재시도
      if (retryCount < maxRetries && error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.log(`[ApiClient:${requestId}] Retrying request after ${retryDelay}ms...`)
        await new Promise(resolve => setTimeout(resolve, retryDelay * (retryCount + 1)))
        return this.request<T>(path, options, retryCount + 1)
      }

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
