import { useState, useEffect } from 'react';

export const useAdminMode = () => {
  const [isAdminMode, setIsAdminMode] = useState(false);

  useEffect(() => {
    const checkAdminMode = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const adminParam = urlParams.get('admin') === 'true';
      
      // URL 파라미터가 있으면 localStorage에 저장, 없으면 정리
      if (adminParam) {
        localStorage.setItem('adminMode', 'true');
        localStorage.setItem('adminModeTimestamp', Date.now().toString());
        console.log('💾 관리자 모드 URL 파라미터를 localStorage에 저장');
      } else {
        // 5분 이상 지난 관리자 모드는 자동 정리
        const timestamp = localStorage.getItem('adminModeTimestamp');
        if (timestamp) {
          const timeDiff = Date.now() - parseInt(timestamp);
          if (timeDiff > 5 * 60 * 1000) { // 5분
            localStorage.removeItem('adminMode');
            localStorage.removeItem('adminModeTimestamp');
            console.log('🧹 5분 경과로 관리자 모드 localStorage 자동 정리');
          }
        } else {
          localStorage.removeItem('adminMode');
          console.log('🧹 관리자 모드 localStorage 정리');
        }
      }
      
      // localStorage에서 관리자 모드 확인
      const savedAdminMode = localStorage.getItem('adminMode') === 'true';
      const finalAdminMode = adminParam || savedAdminMode;
      
      console.log('🔍 URL 파라미터 확인:');
      console.log('  URL:', window.location.href);
      console.log('  Search:', window.location.search);
      console.log('  Admin param:', urlParams.get('admin'));
      console.log('  Saved admin mode:', savedAdminMode);
      console.log('  Final IsAdminMode:', finalAdminMode);
      
      setIsAdminMode(finalAdminMode);
    };
    
    // 즉시 확인
    checkAdminMode();
    
    // 짧은 지연 후 다시 확인 (이메일 링크 클릭 시)
    const timeoutId1 = setTimeout(checkAdminMode, 100);
    const timeoutId2 = setTimeout(checkAdminMode, 500);
    const timeoutId3 = setTimeout(checkAdminMode, 1000);
    
    // URL 변경 감지
    const handlePopState = () => {
      checkAdminMode();
    };
    
    // 페이지 로드 시에도 확인
    const handleLoad = () => {
      checkAdminMode();
    };
    
    // 주기적으로 URL 확인 (이메일 링크 문제 해결)
    const intervalId = setInterval(checkAdminMode, 1000);
    
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('load', handleLoad);
    
    return () => {
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
      clearTimeout(timeoutId3);
      clearInterval(intervalId);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  const clearAdminMode = () => {
    localStorage.removeItem('adminMode');
    setIsAdminMode(false);
  };

  return { isAdminMode, clearAdminMode };
};
