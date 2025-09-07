import emailjs from '@emailjs/browser';

// EmailJS 설정 (환경 변수에서 가져오기)
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID || 'service_patient_chart';
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID || 'template_login_notification';
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY || 'your_emailjs_public_key';

// EmailJS 초기화
emailjs.init(EMAILJS_PUBLIC_KEY);

export interface LoginNotificationData {
  username: string;
  clinicName: string;
  therapistName: string;
  loginTime: string;
  userAgent: string;
  ipAddress?: string;
}

export const sendLoginNotification = async (data: LoginNotificationData): Promise<boolean> => {
  try {
    console.log('=== EmailJS 설정 확인 ===');
    console.log('EMAILJS_SERVICE_ID:', EMAILJS_SERVICE_ID);
    console.log('EMAILJS_TEMPLATE_ID:', EMAILJS_TEMPLATE_ID);
    console.log('EMAILJS_PUBLIC_KEY:', EMAILJS_PUBLIC_KEY ? '설정됨' : '설정되지 않음');
    console.log('========================');
    
    const templateParams = {
      to_email: 'stjoe1004@gmail.com',
      to_name: '관리자',
      username: data.username,
      clinic_name: data.clinicName,
      therapist_name: data.therapistName,
      login_time: data.loginTime,
      user_agent: data.userAgent,
      ip_address: data.ipAddress || '알 수 없음',
      subject: `[환자차트시스템] ${data.username} 로그인 알림`,
      message: `
새로운 로그인이 감지되었습니다.

사용자 정보:
- 사용자명: ${data.username}
- 한의원명: ${data.clinicName}
- 치료사명: ${data.therapistName}
- 로그인 시간: ${data.loginTime}
- IP 주소: ${data.ipAddress || '알 수 없음'}
- 브라우저: ${data.userAgent}

관리자 대시보드에서 확인하세요:
https://patient-chart.netlify.app/?admin=true
      `.trim()
    };

    // EmailJS 설정이 제대로 되지 않은 경우 경고
    if (EMAILJS_PUBLIC_KEY === 'your_emailjs_public_key') {
      console.warn('⚠️ EmailJS가 설정되지 않았습니다. .env.local 파일에 EMAILJS_PUBLIC_KEY를 설정해주세요.');
      console.log('📧 로그인 알림 데이터:', data);
      return false;
    }

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    console.log('✅ 로그인 알림 이메일 발송 성공:', response);
    return true;
  } catch (error) {
    console.error('로그인 알림 이메일 발송 실패:', error);
    return false;
  }
};

// IP 주소 가져오기 (간단한 방법)
export const getClientIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('IP 주소 가져오기 실패:', error);
    return '알 수 없음';
  }
};

// 브라우저 정보 가져오기
export const getBrowserInfo = (): string => {
  return navigator.userAgent;
};
