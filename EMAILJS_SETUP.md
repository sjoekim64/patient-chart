# EmailJS 설정 가이드

## 1. EmailJS 계정 생성 및 설정

### 1.1 EmailJS 계정 생성
1. https://www.emailjs.com/ 방문
2. "Sign Up" 클릭하여 무료 계정 생성
3. 이메일 인증 완료

### 1.2 이메일 서비스 연결
1. EmailJS 대시보드에서 "Email Services" 클릭
2. "Add New Service" 클릭
3. Gmail 선택 (또는 원하는 이메일 서비스)
4. Gmail 계정 연결
5. 서비스 ID 기록 (예: `service_xxxxxxx`)

### 1.3 이메일 템플릿 생성
1. "Email Templates" 클릭
2. "Create New Template" 클릭
3. 다음 내용으로 템플릿 작성:

**템플릿 내용:**
```
제목: {{subject}}

안녕하세요 {{to_name}}님,

{{message}}

감사합니다.
환자차트시스템
```

**템플릿 변수:**
- `{{to_name}}`: 관리자 이름
- `{{subject}}`: 이메일 제목
- `{{message}}`: 이메일 내용
- `{{username}}`: 로그인한 사용자명
- `{{clinic_name}}`: 한의원명
- `{{therapist_name}}`: 치료사명
- `{{login_time}}`: 로그인 시간
- `{{user_agent}}`: 브라우저 정보
- `{{ip_address}}`: IP 주소

4. 템플릿 ID 기록 (예: `template_xxxxxxx`)

### 1.4 API 키 확인
1. "Account" → "General" 클릭
2. "Public Key" 복사

## 2. 환경 변수 설정

`.env.local` 파일에 다음 내용 추가:

```env
# EmailJS 설정
EMAILJS_SERVICE_ID=service_xxxxxxx
EMAILJS_TEMPLATE_ID=template_xxxxxxx
EMAILJS_PUBLIC_KEY=your_public_key_here
```

## 3. 테스트

1. 웹앱에서 로그인 테스트
2. `stjoe1004@gmail.com`으로 이메일 수신 확인

## 4. 무료 플랜 제한

- **월 200개 이메일** 무료 제공
- 한의원에서 사용하기에는 충분한 양

## 5. 문제 해결

### 이메일이 발송되지 않는 경우:
1. EmailJS 서비스 연결 상태 확인
2. 템플릿 변수명 확인
3. API 키 정확성 확인
4. 브라우저 콘솔에서 오류 메시지 확인

### 이메일이 스팸함에 들어가는 경우:
1. Gmail에서 `noreply@emailjs.com`을 허용 발신자로 추가
2. 이메일 제목에 "알림" 키워드 포함
