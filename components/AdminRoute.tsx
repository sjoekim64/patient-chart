import React from 'react';
import { AdminDashboard } from './AdminDashboard';

interface AdminRouteProps {
  isAuthenticated: boolean;
  isAdminMode: boolean;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ isAuthenticated, isAdminMode }) => {
  console.log('🔍 렌더링 시점 확인:');
  console.log('  isAuthenticated:', isAuthenticated);
  console.log('  isAdminMode:', isAdminMode);
  console.log('  URL:', window.location.href);
  console.log('  Search:', window.location.search);
  
  if (isAuthenticated && isAdminMode) {
    console.log('✅ 관리자 대시보드 렌더링');
    return <AdminDashboard />;
  }
  
  return null;
};
