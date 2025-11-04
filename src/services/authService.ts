import { supabase } from './supabase'
import type { User, Session, AuthError } from '@supabase/supabase-js'

export interface AuthResult {
  data: {
    user: User | null
    session: Session | null
  } | null
  error: AuthError | null
}

export interface Profile {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface UserPreferences {
  user_id: string
  language: string
  difficulty_preference: number
  daily_goal_minutes: number
  notification_enabled: boolean
  created_at: string
  updated_at: string
}

export class AuthService {
  // 회원가입
  static async signUp(email: string, password: string): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: email.split('@')[0], // 이메일 앞부분을 기본 닉네임으로
          }
        }
      })

      if (error) throw error

      // 회원가입 성공 시 프로필 자동 생성
      if (data.user && !error) {
        await this.createInitialProfile(data.user)
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as AuthError }
    }
  }

  // 로그인
  static async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as AuthError }
    }
  }

  // 로그아웃
  static async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  // 현재 사용자 정보 가져오기
  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    } catch {
      return null
    }
  }

  // 현재 세션 정보 가져오기
  static async getCurrentSession(): Promise<Session | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      return session
    } catch {
      return null
    }
  }

  // 프로필 정보 가져오기 (Edge Function을 통해 처리)
  static async getProfile(userId: string): Promise<{ data: Profile | null; error: any }> {
    try {
      const { data, error } = await supabase.functions.invoke('user-profile', {
        body: { action: 'get', userId }
      })

      if (error) throw error

      return { data: data?.profile || null, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // 프로필 업데이트 (Edge Function을 통해 처리)
  static async updateProfile(
    userId: string,
    updates: Partial<Pick<Profile, 'display_name' | 'avatar_url'>>
  ): Promise<{ data: Profile | null; error: any }> {
    try {
      const { data, error } = await supabase.functions.invoke('user-profile', {
        body: {
          action: 'update',
          userId,
          updates
        }
      })

      if (error) throw error

      return { data: data?.profile || null, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // 사용자 설정 가져오기 (Edge Function을 통해 처리)
  static async getUserPreferences(userId: string): Promise<{ data: UserPreferences | null; error: any }> {
    try {
      const { data, error } = await supabase.functions.invoke('user-profile', {
        body: { action: 'get-preferences', userId }
      })

      if (error) throw error

      return { data: data?.preferences || null, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // 사용자 설정 업데이트 (Edge Function을 통해 처리)
  static async updateUserPreferences(
    userId: string,
    updates: Partial<Omit<UserPreferences, 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<{ data: UserPreferences | null; error: any }> {
    try {
      const { data, error } = await supabase.functions.invoke('user-profile', {
        body: {
          action: 'update-preferences',
          userId,
          updates
        }
      })

      if (error) throw error

      return { data: data?.preferences || null, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // 비밀번호 재설정 이메일 보내기
  static async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  // 비밀번호 업데이트
  static async updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  // 인증 상태 변경 리스너
  static onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }

  // 초기 프로필 생성 (회원가입 시 자동 호출)
  private static async createInitialProfile(user: User): Promise<void> {
    try {
      // app_users 테이블에 프로필 생성
      const { error: profileError } = await supabase
        .from('app_users')
        .insert({
          id: user.id,
          email: user.email!,
          display_name: user.user_metadata?.display_name || user.email!.split('@')[0],
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        return
      }

      // 기본 사용자 설정 생성
      await this.createDefaultPreferences(user.id)
    } catch (error) {
      console.error('Initial profile creation error:', error)
    }
  }

  // 기본 사용자 설정 생성
  private static async createDefaultPreferences(userId: string): Promise<{ data: UserPreferences | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .insert({
          user_id: userId,
          language: 'en',
          difficulty_preference: 2,
          daily_goal_minutes: 10,
          notification_enabled: true,
        })
        .select()
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  // 이메일 인증 확인
  static async resendConfirmationEmail(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: (await this.getCurrentUser())?.email || '',
      })
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  }
}
