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
            // 회원가입 성공 시 승인 대기 화면으로 이동
            setShowWaiting(true);
          }}
        />
      )}
    </>
  );
};
