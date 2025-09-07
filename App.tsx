import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthWrapper } from './components/AuthWrapper';
import { PatientForm } from './components/PatientForm.tsx';
import { PrintableView } from './components/PrintableView.tsx';
import { PatientList } from './components/PatientList.tsx';
import { AdminDashboard } from './components/AdminDashboard';
import type { PatientData } from './types.ts';
import { database } from './lib/database';
import { initializeSampleData, getNewPatientSample, getFollowUpPatientSample, initializeTestUser } from './lib/sampleData';


const getNewPatientState = (chartType: 'new' | 'follow-up', clinicInfo?: any): PatientData => {
  // Base state with sensible defaults to speed up charting
  const baseState: PatientData = {
    chartType,
    clinicName: clinicInfo?.clinicName || '',
    clinicLogo: clinicInfo?.clinicLogo || '',
    fileNo: '', name: '', date: new Date().toISOString().split('T')[0],
    address: '', phone: '',
    occupation: '', dob: '', age: '', sex: '',
    heightFt: '', heightIn: '', weight: '',
    temp: '97', bpSystolic: '', bpDiastolic: '', heartRate: '', heartRhythm: 'Normal',
    lungRate: '17', lungSound: 'Clear',
    chiefComplaint: {
      selectedComplaints: [], otherComplaint: '', location: '', locationDetails: [], onsetValue: '', onsetUnit: '',
      provocation: [], provocationOther: '', palliation: [], palliationOther: '', quality: [], qualityOther: '',
      regionRadiation: '', severityScore: '', severityDescription: '', frequency: '', timing: '',
      possibleCause: [], possibleCauseOther: '', remark: '', presentIllness: '', westernMedicalDiagnosis: '',
    },
    medicalHistory: {
      pastMedicalHistory: [], pastMedicalHistoryOther: '', medication: [], medicationOther: '',
      familyHistory: [], familyHistoryOther: '', allergy: [], allergyOther: '',
    },
    reviewOfSystems: {
        coldHot: { sensation: 'normal', parts: [], other: '' },
        sleep: { hours: '7-8', quality: ['O.K.'], issues: [], other: '' },
        sweat: { present: 'no', time: '', parts: [], other: '' },
        eye: { symptoms: ['normal'], other: '' },
        mouthTongue: { symptoms: 'normal', taste: 'bland', other: '' },
        throatNose: { symptoms: ['normal'], mucusColor: [], other: '' },
        edema: { present: 'no', parts: [], other: '' },
        drink: { thirsty: 'normal', preference: 'normal', amount: '', other: '' },
        digestion: { symptoms: ['good'], other: '' },
        appetiteEnergy: { appetite: 'good', energy: '8', other: '' },
        stool: { frequencyValue: '1', frequencyUnit: 'day', form: 'normal', color: 'brown', symptoms: [], other: '' },
        urine: { frequencyDay: '4-6', frequencyNight: '0-1', amount: 'normal', color: 'pale yellow', symptoms: [], other: '' },
        menstruation: { status: '', menopauseAge: '', lmp: '', cycleLength: '', duration: '', amount: 'normal', color: 'fresh red', clots: 'no', pain: 'no', painDetails: '', pms: [], other: '' },
        discharge: { present: 'no', symptoms: [], other: '' }
    },
    tongue: {
        body: { color: 'Pink', colorModifiers: [], shape: 'Normal', shapeModifiers: [], locations: [], locationComments: '' },
        coating: { color: 'White', quality: ['Thin'], notes: '' },
    },
    pulse: {
        overall: [],
        notes: '',
    },
    diagnosisAndTreatment: {
      eightPrinciples: { exteriorInterior: '', heatCold: '', excessDeficient: '', yangYin: '' },
      etiology: '', tcmDiagnosis: '', treatmentPrinciple: '', 
      acupunctureMethod: ['TCM Body'],
      acupunctureMethodOther: '',
      acupuncturePoints: '', herbalTreatment: '',
      selectedTreatment: 'None', otherTreatmentText: '', icd: '', cpt: '',
      therapistName: clinicInfo?.therapistName || '', therapistLicNo: clinicInfo?.therapistLicenseNo || '',
    },
    respondToCare: {
        status: 'Same',
        improvedDays: '',
        notes: '',
    }
  };

  if (chartType === 'follow-up') {
    return {
        ...baseState,
        chiefComplaint: {
            ...baseState.chiefComplaint,
            // Follow-up charts don't need these pre-filled, will be hidden
        },
        diagnosisAndTreatment: {
            ...baseState.diagnosisAndTreatment,
            cpt: '99212, 97813, 97814'
        }
    };
  }

  return {
    ...baseState,
    diagnosisAndTreatment: {
        ...baseState.diagnosisAndTreatment,
        cpt: '99202, 97810, 97811, 97026'
    }
  };
};

const PatientChartApp: React.FC = () => {
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [currentPatient, setCurrentPatient] = useState<PatientData | null>(null);
  const [view, setView] = useState<'list' | 'form' | 'print'>('list');
  const [formMode, setFormMode] = useState<'new' | 'edit'>('new');
  const [clinicInfo, setClinicInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();

  // URL 파라미터 확인 (관리자 대시보드) - 상태로 관리
  const [isAdminMode, setIsAdminMode] = useState(false);

  // URL 파라미터 확인 (관리자 대시보드)
  useEffect(() => {
    const checkAdminMode = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const adminParam = urlParams.get('admin') === 'true';
      console.log('🔍 URL 파라미터 확인:', { 
        url: window.location.href,
        admin: urlParams.get('admin'), 
        isAdminMode: adminParam 
      });
      setIsAdminMode(adminParam);
    };
    
    checkAdminMode();
    
    // URL 변경 감지 (이메일 링크 클릭 시)
    const handlePopState = () => {
      checkAdminMode();
    };
    
    // 페이지 로드 시에도 확인
    const handleLoad = () => {
      checkAdminMode();
    };
    
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('load', handleLoad);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  // 사용자 인증 상태에 따라 데이터 로드
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserData();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, authLoading]);

  const loadUserData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // 데이터베이스 초기화
      await database.initialize();
      
      // 테스트 사용자 초기화 (앱 시작 시 항상 실행)
      await initializeTestUser();
      
      // 환자 데이터 로드
      const charts = await database.getPatientCharts(user.id);
      const patientData = charts.map(chart => JSON.parse(chart.chartData));
      setPatients(patientData);

      // 클리닉 정보 로드
      const clinicData = await database.getClinicInfo(user.id);
      if (clinicData) {
        setClinicInfo(clinicData);
      } else {
        // 기본 클리닉 정보 설정
        setClinicInfo({
          clinicName: user.clinicName,
          therapistName: user.therapistName,
          therapistLicenseNo: user.therapistLicenseNo,
        });
      }

      // 샘플 데이터 초기화 (처음 로그인한 사용자에게만)
      if (patientData.length === 0) {
        const sampleResult = await initializeSampleData(user.id, clinicData || {
          clinicName: user.clinicName,
          therapistName: user.therapistName,
          therapistLicenseNo: user.therapistLicenseNo,
        });
        
        if (sampleResult.newSampleAdded || sampleResult.followUpSampleAdded) {
          // 샘플 데이터가 추가되었으므로 다시 로드
          const updatedCharts = await database.getPatientCharts(user.id);
          const updatedPatientData = updatedCharts.map(chart => JSON.parse(chart.chartData));
          setPatients(updatedPatientData);
        }
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePatients = async (updatedPatients: PatientData[]) => {
    if (!user) return;
    
    try {
      // 각 환자 데이터를 개별적으로 저장
      for (const patient of updatedPatients) {
        await database.savePatientChart(user.id, patient);
      }
      setPatients(updatedPatients);
    } catch (error) {
      console.error("Failed to save patient records:", error);
    }
  };

  const handleFormSubmit = async (data: PatientData) => {
    if (!user) return;
    
    // 클리닉 정보 저장
    try {
        const infoToStore = {
            clinicName: data.clinicName,
            clinicLogo: data.clinicLogo,
            therapistName: data.diagnosisAndTreatment.therapistName,
            therapistLicenseNo: data.diagnosisAndTreatment.therapistLicNo,
        };
        await database.saveClinicInfo(user.id, infoToStore);
        setClinicInfo(infoToStore);
    } catch (error) {
        console.error("Failed to save clinic info:", error);
    }
    
    // 환자 데이터 저장
    try {
      await database.savePatientChart(user.id, data);
      
      // 로컬 상태 업데이트
    const existingPatientIndex = patients.findIndex(p => p.fileNo === data.fileNo);
    let updatedPatients;
    if (existingPatientIndex > -1) {
      updatedPatients = [...patients];
      updatedPatients[existingPatientIndex] = data;
    } else {
      updatedPatients = [...patients, data];
    }
      setPatients(updatedPatients);
    
    setCurrentPatient(data);
    setView('print');
    } catch (error) {
      console.error("Failed to save patient record:", error);
    }
  };

  const handleNewPatient = () => {
    setCurrentPatient(getNewPatientSample(clinicInfo));
    setFormMode('new');
    setView('form');
  }
  
  const handleNewFollowUpChart = () => {
    setCurrentPatient(getFollowUpPatientSample(clinicInfo));
    setFormMode('new');
    setView('form');
  };

  const handleSelectPatient = (patient: PatientData) => {
    setCurrentPatient(patient);
    setFormMode('edit');
    setView('form');
  }

  const handleDeletePatient = async (fileNo: string) => {
    if (!user) return;
    
    if (window.confirm(`Are you sure you want to delete patient record ${fileNo}? This action cannot be undone.`)) {
      try {
        await database.deletePatientChart(user.id, fileNo);
        const updatedPatients = patients.filter(p => p.fileNo !== fileNo);
        setPatients(updatedPatients);
      } catch (error) {
        console.error("Failed to delete patient record:", error);
      }
    }
  }
  
  const handleGoToList = () => {
    setCurrentPatient(null);
    setView('list');
  };

  const handleEdit = () => {
    setView('form');
  };

  const renderView = () => {
    switch (view) {
      case 'form':
        return <PatientForm 
                  initialData={currentPatient!} 
                  onSubmit={handleFormSubmit}
                  onBack={handleGoToList}
                  mode={formMode}
               />;
      case 'print':
        return <PrintableView data={currentPatient!} onEdit={handleEdit} onGoToList={handleGoToList} />;
      case 'list':
      default:
        return <PatientList 
                    patients={patients} 
                    onSelectPatient={handleSelectPatient} 
                    onNewPatient={handleNewPatient} 
                    onDeletePatient={handleDeletePatient} 
                    onStartFollowUp={handleNewFollowUpChart} 
                />;
    }
  };

  // 로딩 중이거나 인증되지 않은 경우
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthWrapper />;
  }

  // 관리자 대시보드 모드
  if (isAdminMode) {
    return <AdminDashboard />;
  }

  return (
    <div className="min-h-screen container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="text-left">
        <h1 className="text-4xl font-bold text-slate-800">Patient Chart System</h1>
        <p className="text-slate-600 mt-2">A modern solution for digital patient records.</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">환영합니다, {user?.therapistName}님</p>
            <p className="text-xs text-gray-500">{user?.clinicName}</p>
            <button
              onClick={logout}
              className="mt-2 px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>
      
      <main>
        {renderView()}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <PatientChartApp />
    </AuthProvider>
  );
};

export default App;