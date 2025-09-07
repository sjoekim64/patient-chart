import { useState, useEffect } from 'react';

export const useAdminMode = () => {
  const [isAdminMode, setIsAdminMode] = useState(false);

  useEffect(() => {
    const checkAdminMode = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const adminParam = urlParams.get('admin') === 'true';
      
      console.log('🔍 URL 파라미터 확인:');
      console.log('  URL:', window.location.href);
      console.log('  Search:', window.location.search);
      console.log('  Admin param:', urlParams.get('admin'));
      console.log('  IsAdminMode:', adminParam);
      
      setIsAdminMode(adminParam);
    };
    
    // 즉시 확인
    checkAdminMode();
    
    // URL 변경 감지
    const handlePopState = () => {
      checkAdminMode();
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const clearAdminMode = () => {
    // URL에서 admin 파라미터 제거
    const url = new URL(window.location.href);
    url.searchParams.delete('admin');
    window.history.replaceState({}, '', url.toString());
    setIsAdminMode(false);
  };

  return { isAdminMode, clearAdminMode };
};
