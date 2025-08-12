import { LoginRequest, LoginResponse, User } from '../types/Auth';
import { api } from './api';

class AuthService {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly USER_KEY = 'auth_user';

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/auth/login', credentials);
      
      if (response.data.success) {
        this.setToken(response.data.token);
        this.setUser(response.data.user);
      }
      
      return response.data;
    } catch (error) {
      throw new Error('ログインに失敗しました');
    }
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // ログアウトAPIが失敗してもローカルの認証情報は削除する
      console.warn('ログアウトAPIの呼び出しに失敗しました:', error);
    } finally {
      this.clearAuthData();
    }
  }

  async verifyToken(): Promise<User | null> {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const response = await api.get<{ user: User }>('/auth/verify');
      return response.data.user;
    } catch (error) {
      this.clearAuthData();
      return null;
    }
  }

  setToken(token: string): void {
    localStorage.setItem(AuthService.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(AuthService.TOKEN_KEY);
  }

  setUser(user: User): void {
    localStorage.setItem(AuthService.USER_KEY, JSON.stringify(user));
  }

  getUser(): User | null {
    const userStr = localStorage.getItem(AuthService.USER_KEY);
    if (!userStr) {
      return null;
    }
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  clearAuthData(): void {
    localStorage.removeItem(AuthService.TOKEN_KEY);
    localStorage.removeItem(AuthService.USER_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();