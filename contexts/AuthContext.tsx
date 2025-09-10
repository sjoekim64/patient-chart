import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import type { User, AuthState, LoginCredentials, RegisterData, AuthResponse } from '../types/auth';
import { database } from '../lib/database';
import { sendLoginNotification, sendRegistrationNotification, getClientIP, getBrowserInfo } from '../lib/emailService';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => void;
  verifyToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'VERIFY_START' }
  | { type: 'VERIFY_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'VERIFY_FAILURE' };

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('auth_token'),
  isAuthenticated: false,
  isLoading: true,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
    case 'VERIFY_START':
      return {
        ...state,
        isLoading: true,
      };
    case 'LOGIN_SUCCESS':
    case 'VERIFY_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGIN_FAILURE':
    case 'VERIFY_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const result = await database.loginUser(credentials);
      
      localStorage.setItem('auth_token', result.token);
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { 
          user: result.user, 
          token: result.token 
        } 
      });

      // URL 파라미터 유지 (관리자 대시보드 접근용)
      const currentUrl = new URL(window.location.href);
      if (currentUrl.searchParams.get('admin') === 'true') {
        console.log('🔗 관리자 모드 URL 파라미터 유지');
        // URL 파라미터가 이미 있으므로 추가 작업 불필요
      }

      // 로그인 성공 시 이메일 알림 발송 (비동기로 처리하여 로그인 속도에 영향 없음)
      console.log('📧 로그인 알림 이메일 발송 시작...');
      sendLoginNotification({
        username: result.user.username,
        clinicName: result.user.clinicName,
        therapistName: result.user.therapistName,
        loginTime: new Date().toLocaleString('ko-KR'),
        userAgent: getBrowserInfo(),
        ipAddress: await getClientIP()
      }).then(success => {
        console.log('📧 로그인 알림 이메일 발송 결과:', success ? '성공' : '실패');
      }).catch(error => {
        console.error('❌ 로그인 알림 이메일 발송 실패:', error);
        // 이메일 발송 실패는 로그인에 영향을 주지 않음
      });
      
      return { success: true, data: result };
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다.'
      };
    }
  };

  const register = async (data: RegisterData): Promise<AuthResponse> => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      console.log('🔐 회원가입 시작:', data.username);
      const result = await database.registerUser({
        username: data.username,
        password: data.password,
        clinicName: data.clinicName,
        therapistName: data.therapistName,
        therapistLicenseNo: data.therapistLicenseNo,
      });
      console.log('✅ 회원가입 성공:', result);
      
      // 회원가입 성공 시 이메일 알림 발송 (비동기로 처리)
      console.log('📧 회원가입 알림 이메일 발송 시작...');
      sendRegistrationNotification({
        username: data.username,
        clinicName: data.clinicName,
        therapistName: data.therapistName,
        therapistLicenseNo: data.therapistLicenseNo,
        registrationTime: new Date().toLocaleString('ko-KR'),
        userAgent: getBrowserInfo(),
        ipAddress: await getClientIP()
      }).then(success => {
        console.log('📧 회원가입 알림 이메일 발송 결과:', success ? '성공' : '실패');
      }).catch(error => {
        console.error('❌ 회원가입 알림 이메일 발송 실패:', error);
        // 이메일 발송 실패는 회원가입에 영향을 주지 않음
      });
      
      // 테스트용으로 회원가입 후 바로 로그인 (운영 시 승인 대기로 변경)
      console.log('🔑 토큰 저장 및 로그인 처리:', result.token);
      localStorage.setItem('auth_token', result.token);
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { 
          user: result.user, 
          token: result.token 
        } 
      });
      
      console.log('🎉 회원가입 및 자동 로그인 완료');
      return { success: true, data: result };
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '회원가입 중 오류가 발생했습니다.' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    dispatch({ type: 'LOGOUT' });
  };

  const verifyToken = async (): Promise<boolean> => {
    if (!state.token) {
      dispatch({ type: 'VERIFY_FAILURE' });
      return false;
    }

    dispatch({ type: 'VERIFY_START' });
    
    try {
      const user = await database.verifyToken(state.token);
      
      dispatch({ 
        type: 'VERIFY_SUCCESS', 
        payload: { 
          user, 
          token: state.token 
        } 
      });
      return true;
    } catch (error) {
      localStorage.removeItem('auth_token');
      dispatch({ type: 'VERIFY_FAILURE' });
      return false;
    }
  };

  // 앱 시작 시 토큰 검증
  useEffect(() => {
    if (state.token) {
      verifyToken();
    } else {
      dispatch({ type: 'VERIFY_FAILURE' });
    }
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    verifyToken,
  };

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
