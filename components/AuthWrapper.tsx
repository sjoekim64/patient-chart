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
          onRegistrationSuccess={() => setShowWaiting(true)}
        />
      )}
    </>
  );
};
