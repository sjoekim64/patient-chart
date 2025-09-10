import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { WaitingForApproval } from './WaitingForApproval';

export const AuthWrapper: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showWaiting, setShowWaiting] = useState(false);

  if (showWaiting) {
    return <WaitingForApproval onBackToLogin={() => setShowWaiting(false)} />;
  }

  return (
    <>
      {isLogin ? (
        <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
      ) : (
        <RegisterForm 
          onSwitchToLogin={() => setIsLogin(true)}
          onRegistrationSuccess={() => {
            // 테스트용으로 회원가입 성공 시 바로 메인 화면으로 이동
            // (운영 시 승인 대기 화면으로 변경: setShowWaiting(true))
            window.location.reload(); // 페이지 새로고침으로 메인 화면으로 이동
          }}
        />
      )}
    </>
  );
};
