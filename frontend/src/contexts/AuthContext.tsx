import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, LoginRequest, AuthContextType } from '../types/Auth';
import { authService } from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 自動ログアウトのタイマー（30分）
  const AUTO_LOGOUT_TIME = 30 * 60 * 1000; // 30分
  let logoutTimer: NodeJS.Timeout | null = null;

  const resetLogoutTimer = () => {
    if (logoutTimer) {
      clearTimeout(logoutTimer);
    }
    
    if (token) {
      logoutTimer = setTimeout(() => {
        logout();
      }, AUTO_LOGOUT_TIME);
    }
  };

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      const response = await authService.login(credentials);
      
      if (response.success) {
        setUser(response.user);
        setToken(response.token);
        resetLogoutTimer();
      } else {
        throw new Error('ログインに失敗しました');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    if (logoutTimer) {
      clearTimeout(logoutTimer);
      logoutTimer = null;
    }
    
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const isAuthenticated = !!token && !!user;

  // 初期化時にトークンの検証を行う
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = authService.getToken();
      const storedUser = authService.getUser();
      
      if (storedToken && storedUser) {
        try {
          const verifiedUser = await authService.verifyToken();
          if (verifiedUser) {
            setUser(verifiedUser);
            setToken(storedToken);
            resetLogoutTimer();
          } else {
            authService.clearAuthData();
          }
        } catch (error) {
          authService.clearAuthData();
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();

    // クリーンアップ
    return () => {
      if (logoutTimer) {
        clearTimeout(logoutTimer);
      }
    };
  }, []);

  // ユーザーアクティビティの監視（マウス移動、キーボード入力など）
  useEffect(() => {
    if (!isAuthenticated) return;

    const resetTimer = () => resetLogoutTimer();
    
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  }, [isAuthenticated]);

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated,
  };

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};