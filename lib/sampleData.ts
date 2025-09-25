import type { PatientData } from '../types';
import type { User } from './database';

// 신규환자 샘플 데이터
export const getNewPatientSample = (clinicInfo?: any): PatientData => ({
  chartType: 'new',
  clinicName: clinicInfo?.clinicName || 'East-West Wellness Center',
  clinicLogo: clinicInfo?.clinicLogo || '',
  fileNo: 'CH-12345',
  name: 'Jane Doe',
  date: new Date().toISOString().split('T')[0],
  address: '123 Wellness Ave, Suite 100, Healthville, ST 98765',
  phone: '(123) 456-7890',
  occupation: 'Software Engineer',
  dob: '1990-05-15',
  age: '34',
  sex: 'F',
  heightFt: '5',
  heightIn: '6',
  weight: '140',
  temp: '98.6',
  bpSystolic: '120',
  bpDiastolic: '80',
  heartRate: '72',
  heartRhythm: 'Normal',
  lungRate: '17',
  lungSound: 'Clear',
  chiefComplaint: {
    selectedComplaints: ['Back Pain', 'Headache'],
    otherComplaint: '',
    location: 'Lower, Right, Lower back, radiating to right leg',
    locationDetails: ['Lower', 'Right'],
    onsetValue: '3',
    onsetUnit: 'weeks',
    provocation: ['Prolonged Sitting / Standing'],
    provocationOther: 'Driving for more than 30 minutes',
    palliation: ['Stretching / Light Exercise', 'Warm Packs / Shower'],
    palliationOther: '',
    quality: ['Dull', 'Aching'],
    qualityOther: '',
    regionRadiation: 'Radiates down the posterior right thigh',
    severityScore: '6',
    severityDescription: 'Moderate',
    frequency: 'Intermittent',
    timing: 'Worse in the morning and after sitting.',
    possibleCause: ['Poor Posture'],
    possibleCauseOther: '',
    remark: 'Patient has a desk job and reports stress.',
    presentIllness: 'The patient is a 34-year-old female who presents with complaints of back pain and headache. The back pain began approximately 3 weeks ago, primarily located in the lower right back and radiating down the posterior right thigh. She describes the pain as dull and aching, rating it 6/10 in severity. The pain is intermittent, worsening in the morning and after sitting, and is aggravated by prolonged sitting, standing, and driving for more than 30 minutes. She reports some relief with stretching, light exercise, and warm packs or showers. She attributes her symptoms to poor posture, noting her desk job and reported stress.',
    westernMedicalDiagnosis: '',
  },
  medicalHistory: {
    pastMedicalHistory: ['GI Disease'],
    pastMedicalHistoryOther: 'History of GERD, managed with diet.',
    medication: ['NSAIDs'],
    medicationOther: 'Ibuprofen as needed for pain.',
    familyHistory: ['Hypertension', 'Diabetes'],
    familyHistoryOther: '',
    allergy: ['Penicillin'],
    allergyOther: '',
  },
  reviewOfSystems: {
    coldHot: { sensation: 'cold', parts: ['feet', 'hands'], other: '' },
    sleep: { hours: '6-7', quality: [], issues: ['hard to fall asleep'], other: '' },
    sweat: { present: 'yes', time: 'night', parts: ['head'], other: '' },
    eye: { symptoms: ['dry', 'fatigued'], other: '' },
    mouthTongue: { symptoms: 'dry', taste: 'bland', other: '' },
    throatNose: { symptoms: ['block', 'mucus'], mucusColor: ['clear'], other: '' },
    edema: { present: 'yes', parts: ['leg'], other: 'Ankles in the evening' },
    drink: { thirsty: 'thirsty', preference: 'normal', amount: 'sip', other: '' },
    digestion: { symptoms: ['bloat', 'sometimes bad'], other: '' },
    appetiteEnergy: { appetite: 'ok', energy: '6', other: '' },
    stool: { frequencyValue: '1', frequencyUnit: 'day', form: 'normal', color: 'brown', symptoms: [], other: '' },
    urine: { frequencyDay: '5-6', frequencyNight: '1', amount: 'normal', color: 'pale yellow', symptoms: [], other: '' },
    menstruation: { status: 'regular', menopauseAge: '', lmp: '2024-07-10', cycleLength: '28', duration: '5', amount: 'normal', color: 'fresh red', clots: 'no', pain: 'yes', painDetails: 'Mild cramping on day 1', pms: ['bloating', 'irritability'], other: '' },
    discharge: { present: 'yes', symptoms: ['white', 'sticky'], other: '' }
  },
  tongue: {
    body: { 
      color: 'Pink', colorModifiers: ['Red Tip'], 
      shape: 'Normal', shapeModifiers: ['Tooth-marked'], 
      locations: ['Heart (Tip)'], 
      locationComments: 'Heart (Tip): cracked' 
    },
    coating: { color: 'White', quality: ['Thin', 'Slippery'], notes: 'Covers Stomach/Spleen area' },
  },
  pulse: {
    overall: ['Wiry', 'Rapid', 'Thready'],
    notes: 'Left: Cun - Floating, Rapid; Guan - Wiry; Chi - Deep, Weak\nRight: Cun - Floating; Guan - Slippery; Chi - Weak',
  },
  diagnosisAndTreatment: {
    acupunctureMethod: ['TCM Body'],
    acupunctureMethodOther: '',
    eightPrinciples: { exteriorInterior: 'Interior', heatCold: 'Cold', excessDeficient: 'Deficient', yangYin: 'Yin' },
    etiology: 'Spleen Qi deficiency leading to damp accumulation, combined with Liver Qi stagnation from stress, obstructing the channels in the lower back and head.',
    tcmDiagnosis: 'Spleen Qi Deficiency with Dampness, Liver Qi Stagnation',
    treatmentPrinciple: 'Tonify Spleen Qi, resolve dampness, soothe the Liver, and unblock the channels.',
    acupuncturePoints: 'ST36, SP6, LI4, LV3, GB20, UB23, UB40, Ashi points',
    herbalTreatment: 'Du Huo Ji Sheng Tang',
    selectedTreatment: 'Moxa',
    otherTreatmentText: '',
    icd: 'M54.5 (Low back pain), R51 (Headache)',
    cpt: '99202, 97810, 97811, 97026',
    therapistName: clinicInfo?.therapistName || 'John Smith, L.Ac.',
    therapistLicNo: clinicInfo?.therapistLicenseNo || '12345',
  },
  respondToCare: {
    status: 'Improved',
    improvedDays: '3',
    notes: 'Patient reports mild improvement after last session.',
  }
});

// 재방문 환자 샘플 데이터 1 - 목/어깨 통증
export const getFollowUpPatientSample = (clinicInfo?: any): PatientData => ({
  chartType: 'follow-up',
  clinicName: clinicInfo?.clinicName || 'East-West Wellness Center',
  clinicLogo: clinicInfo?.clinicLogo || '',
  fileNo: 'CH-67890',
  name: 'John Smith',
  date: new Date().toISOString().split('T')[0],
  address: '456 Health Street, Apt 2B, Wellness City, ST 12345',
  phone: '(555) 123-4567',
  occupation: 'Teacher',
  dob: '1985-03-22',
  age: '39',
  sex: 'M',
  heightFt: '6',
  heightIn: '0',
  weight: '180',
  temp: '98.4',
  bpSystolic: '130',
  bpDiastolic: '85',
  heartRate: '78',
  heartRhythm: 'Normal',
  lungRate: '16',
  lungSound: 'Clear',
  chiefComplaint: {
    selectedComplaints: ['Neck Pain', 'Shoulder Pain'],
    otherComplaint: '',
    location: 'Right shoulder and neck area',
    locationDetails: ['Right'],
    onsetValue: '',
    onsetUnit: '',
    provocation: ['Computer Work', 'Stress'],
    provocationOther: '',
    palliation: ['Heat Pack', 'Massage'],
    palliationOther: '',
    quality: ['Stiff', 'Tight'],
    qualityOther: '',
    regionRadiation: 'Radiates to right arm',
    severityScore: '4',
    severityDescription: 'Slight',
    frequency: 'Frequent',
    timing: 'Worse after work and in the evening',
    possibleCause: ['Poor Posture', 'Overwork / Repetitive Labor'],
    possibleCauseOther: '',
    remark: 'Patient reports 40% improvement since last visit. Neck mobility has increased, but still experiences stiffness after long computer sessions. Sleep quality has improved. Patient is very satisfied with the treatment progress.',
    presentIllness: '',
    westernMedicalDiagnosis: '',
  },
  medicalHistory: {
    pastMedicalHistory: [],
    pastMedicalHistoryOther: '',
    medication: [],
    medicationOther: '',
    familyHistory: ['Hypertension'],
    familyHistoryOther: '',
    allergy: [],
    allergyOther: '',
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
    appetiteEnergy: { appetite: 'good', energy: '7', other: '' },
    stool: { frequencyValue: '1', frequencyUnit: 'day', form: 'normal', color: 'brown', symptoms: [], other: '' },
    urine: { frequencyDay: '4-5', frequencyNight: '0-1', amount: 'normal', color: 'pale yellow', symptoms: [], other: '' },
    menstruation: { status: '', menopauseAge: '', lmp: '', cycleLength: '', duration: '', amount: 'normal', color: 'fresh red', clots: 'no', pain: 'no', painDetails: '', pms: [], other: '' },
    discharge: { present: 'no', symptoms: [], other: '' }
  },
  tongue: {
    body: { 
      color: 'Pink', colorModifiers: [], 
      shape: 'Normal', shapeModifiers: [], 
      locations: [], 
      locationComments: '' 
    },
    coating: { color: 'White', quality: ['Thin'], notes: '' },
  },
  pulse: {
    overall: ['Normal', 'Slightly Wiry'],
    notes: 'Overall improvement noted. Less wiry compared to initial visit.',
  },
  diagnosisAndTreatment: {
    acupunctureMethod: ['TCM Body'],
    acupunctureMethodOther: '',
    eightPrinciples: { exteriorInterior: 'Interior', heatCold: 'Normal', excessDeficient: 'Excess', yangYin: 'Yang' },
    etiology: 'Continued improvement in Liver Qi stagnation. Some residual tension remains from work stress.',
    tcmDiagnosis: 'Liver Qi Stagnation (Improving)',
    treatmentPrinciple: 'Continue to soothe Liver Qi, relax muscles, and improve circulation.',
    acupuncturePoints: 'GB20, GB21, LI4, LV3, ST36, Ashi points',
    herbalTreatment: 'Xiao Yao San',
    selectedTreatment: 'Tui-Na',
    otherTreatmentText: '',
    icd: 'M54.2 (Cervicalgia), M25.5 (Pain in joint)',
    cpt: '99212, 97813, 97814',
    therapistName: clinicInfo?.therapistName || 'John Smith, L.Ac.',
    therapistLicNo: clinicInfo?.therapistLicenseNo || '12345',
  },
  respondToCare: {
    status: 'Improved',
    improvedDays: '5',
    notes: 'Patient reports 40% improvement since last visit. Neck mobility has increased, but still experiences stiffness after long computer sessions. Sleep quality has improved. Patient is very satisfied with the treatment progress.',
  }
});

// 재방문 환자 샘플 데이터 2 - 요통
export const getFollowUpPatientSample2 = (clinicInfo?: any): PatientData => ({
  chartType: 'follow-up',
  clinicName: clinicInfo?.clinicName || 'East-West Wellness Center',
  clinicLogo: clinicInfo?.clinicLogo || '',
  fileNo: 'CH-54321',
  name: 'Sarah Johnson',
  date: new Date().toISOString().split('T')[0],
  address: '789 Healing Lane, Unit 5, Therapy Town, ST 54321',
  phone: '(555) 987-6543',
  occupation: 'Nurse',
  dob: '1988-07-14',
  age: '36',
  sex: 'F',
  heightFt: '5',
  heightIn: '4',
  weight: '135',
  temp: '98.2',
  bpSystolic: '115',
  bpDiastolic: '75',
  heartRate: '68',
  heartRhythm: 'Normal',
  lungRate: '18',
  lungSound: 'Clear',
  chiefComplaint: {
    selectedComplaints: ['Back Pain'],
    otherComplaint: '',
    location: 'Lower back, bilateral',
    locationDetails: ['Lower'],
    onsetValue: '',
    onsetUnit: '',
    provocation: ['Lifting', 'Bending'],
    provocationOther: 'Patient works 12-hour shifts as a nurse',
    palliation: ['Rest', 'Heat Pack'],
    palliationOther: '',
    quality: ['Dull', 'Aching'],
    qualityOther: '',
    regionRadiation: 'Occasionally radiates to both hips',
    severityScore: '3',
    severityDescription: 'Slight',
    frequency: 'Intermittent',
    timing: 'Worse after long shifts and in the morning',
    possibleCause: ['Overwork / Repetitive Labor'],
    possibleCauseOther: '',
    remark: 'Significant improvement since initial treatment. Patient reports 70% reduction in pain intensity. Can now work full shifts without major discomfort. Sleep quality has improved dramatically. Patient is very pleased with the results and wants to continue maintenance treatments.',
    presentIllness: '',
    westernMedicalDiagnosis: '',
  },
  medicalHistory: {
    pastMedicalHistory: [],
    pastMedicalHistoryOther: '',
    medication: ['NSAIDs'],
    medicationOther: 'Ibuprofen as needed (rarely used now)',
    familyHistory: ['Diabetes'],
    familyHistoryOther: '',
    allergy: [],
    allergyOther: '',
  },
  reviewOfSystems: {
    coldHot: { sensation: 'normal', parts: [], other: '' },
    sleep: { hours: '7-8', quality: ['O.K.'], issues: [], other: '' },
    sweat: { present: 'no', time: '', parts: [], other: '' },
    eye: { symptoms: ['normal'], other: '' },
    mouthTongue: { symptoms: 'normal', taste: 'normal', other: '' },
    throatNose: { symptoms: ['normal'], mucusColor: [], other: '' },
    edema: { present: 'no', parts: [], other: '' },
    drink: { thirsty: 'normal', preference: 'normal', amount: '', other: '' },
    digestion: { symptoms: ['good'], other: '' },
    appetiteEnergy: { appetite: 'good', energy: '8', other: '' },
    stool: { frequencyValue: '1', frequencyUnit: 'day', form: 'normal', color: 'brown', symptoms: [], other: '' },
    urine: { frequencyDay: '5-6', frequencyNight: '0-1', amount: 'normal', color: 'pale yellow', symptoms: [], other: '' },
    menstruation: { status: 'regular', menopauseAge: '', lmp: '2024-07-15', cycleLength: '30', duration: '4', amount: 'normal', color: 'fresh red', clots: 'no', pain: 'no', painDetails: '', pms: [], other: '' },
    discharge: { present: 'no', symptoms: [], other: '' }
  },
  tongue: {
    body: { 
      color: 'Pink', colorModifiers: [], 
      shape: 'Normal', shapeModifiers: [], 
      locations: [], 
      locationComments: '' 
    },
    coating: { color: 'White', quality: ['Thin'], notes: '' },
  },
  pulse: {
    overall: ['Normal', 'Slightly Deep'],
    notes: 'Kidney pulse shows improvement. Less deep compared to initial visit.',
  },
  diagnosisAndTreatment: {
    acupunctureMethod: ['TCM Body'],
    acupunctureMethodOther: '',
    eightPrinciples: { exteriorInterior: 'Interior', heatCold: 'Normal', excessDeficient: 'Deficient', yangYin: 'Yang' },
    etiology: 'Kidney Yang deficiency improving with treatment. Some residual weakness from overwork.',
    tcmDiagnosis: 'Kidney Yang Deficiency (Improving)',
    treatmentPrinciple: 'Continue to tonify Kidney Yang, strengthen the lower back, and improve circulation.',
    acupuncturePoints: 'UB23, UB40, ST36, SP6, KI3, GV4, Ashi points',
    herbalTreatment: 'Du Huo Ji Sheng Tang',
    selectedTreatment: 'Moxa',
    otherTreatmentText: '',
    icd: 'M54.5 (Low back pain)',
    cpt: '99212, 97813, 97814',
    therapistName: clinicInfo?.therapistName || 'John Smith, L.Ac.',
    therapistLicNo: clinicInfo?.therapistLicenseNo || '12345',
  },
  respondToCare: {
    status: 'Improved',
    improvedDays: '7',
    notes: 'Significant improvement since initial treatment. Patient reports 70% reduction in pain intensity. Can now work full shifts without major discomfort. Sleep quality has improved dramatically. Patient is very pleased with the results and wants to continue maintenance treatments.',
  }
});

// 재방문 환자 샘플 데이터 3 - 불면증/스트레스
export const getFollowUpPatientSample3 = (clinicInfo?: any): PatientData => ({
  chartType: 'follow-up',
  clinicName: clinicInfo?.clinicName || 'East-West Wellness Center',
  clinicLogo: clinicInfo?.clinicLogo || '',
  fileNo: 'CH-98765',
  name: 'Michael Chen',
  date: new Date().toISOString().split('T')[0],
  address: '321 Balance Blvd, Suite 10, Harmony Heights, ST 67890',
  phone: '(555) 456-7890',
  occupation: 'Software Developer',
  dob: '1992-11-08',
  age: '32',
  sex: 'M',
  heightFt: '5',
  heightIn: '10',
  weight: '165',
  temp: '98.6',
  bpSystolic: '125',
  bpDiastolic: '82',
  heartRate: '75',
  heartRhythm: 'Normal',
  lungRate: '17',
  lungSound: 'Clear',
  chiefComplaint: {
    selectedComplaints: ['Insomnia', 'Anxiety'],
    otherComplaint: '',
    location: 'Generalized',
    locationDetails: [],
    onsetValue: '',
    onsetUnit: '',
    provocation: ['Work Stress', 'Deadlines'],
    provocationOther: 'High-pressure software development environment',
    palliation: ['Meditation', 'Exercise'],
    palliationOther: '',
    quality: ['Restless', 'Worried'],
    qualityOther: '',
    regionRadiation: '',
    severityScore: '5',
    severityDescription: 'Moderate',
    frequency: 'Daily',
    timing: 'Worse in the evening and before sleep',
    possibleCause: ['Stress', 'Overwork / Repetitive Labor'],
    possibleCauseOther: '',
    remark: 'Patient reports 60% improvement in sleep quality and anxiety levels. Can now fall asleep within 30 minutes (previously 2+ hours). Work performance has improved. Still experiences occasional stress but feels much more equipped to handle it. Patient is committed to continuing treatment.',
    presentIllness: '',
    westernMedicalDiagnosis: '',
  },
  medicalHistory: {
    pastMedicalHistory: [],
    pastMedicalHistoryOther: '',
    medication: [],
    medicationOther: '',
    familyHistory: ['Anxiety', 'Depression'],
    familyHistoryOther: '',
    allergy: [],
    allergyOther: '',
  },
  reviewOfSystems: {
    coldHot: { sensation: 'normal', parts: [], other: '' },
    sleep: { hours: '6-7', quality: ['O.K.'], issues: ['hard to fall asleep'], other: 'Much improved from initial visit' },
    sweat: { present: 'no', time: '', parts: [], other: '' },
    eye: { symptoms: ['normal'], other: '' },
    mouthTongue: { symptoms: 'normal', taste: 'normal', other: '' },
    throatNose: { symptoms: ['normal'], mucusColor: [], other: '' },
    edema: { present: 'no', parts: [], other: '' },
    drink: { thirsty: 'normal', preference: 'normal', amount: '', other: '' },
    digestion: { symptoms: ['good'], other: '' },
    appetiteEnergy: { appetite: 'good', energy: '7', other: '' },
    stool: { frequencyValue: '1', frequencyUnit: 'day', form: 'normal', color: 'brown', symptoms: [], other: '' },
    urine: { frequencyDay: '4-5', frequencyNight: '1', amount: 'normal', color: 'pale yellow', symptoms: [], other: '' },
    menstruation: { status: '', menopauseAge: '', lmp: '', cycleLength: '', duration: '', amount: 'normal', color: 'fresh red', clots: 'no', pain: 'no', painDetails: '', pms: [], other: '' },
    discharge: { present: 'no', symptoms: [], other: '' }
  },
  tongue: {
    body: { 
      color: 'Pink', colorModifiers: ['Red Tip'], 
      shape: 'Normal', shapeModifiers: [], 
      locations: ['Heart (Tip)'], 
      locationComments: 'Heart (Tip): slightly red, improving' 
    },
    coating: { color: 'White', quality: ['Thin'], notes: '' },
  },
  pulse: {
    overall: ['Rapid', 'Slightly Wiry'],
    notes: 'Heart pulse less rapid than initial visit. Some improvement in wiry quality.',
  },
  diagnosisAndTreatment: {
    acupunctureMethod: ['TCM Body'],
    acupunctureMethodOther: '',
    eightPrinciples: { exteriorInterior: 'Interior', heatCold: 'Heat', excessDeficient: 'Excess', yangYin: 'Yang' },
    etiology: 'Heart Fire and Liver Qi stagnation improving with treatment. Some residual heat from work stress.',
    tcmDiagnosis: 'Heart Fire, Liver Qi Stagnation (Improving)',
    treatmentPrinciple: 'Continue to clear Heart Fire, soothe Liver Qi, and calm the spirit.',
    acupuncturePoints: 'HT7, PC6, LV3, GB20, ST36, SP6, Yintang, Anmian',
    herbalTreatment: 'Gan Mai Da Zao Tang',
    selectedTreatment: 'None',
    otherTreatmentText: '',
    icd: 'F51.01 (Primary insomnia), F41.9 (Anxiety disorder, unspecified)',
    cpt: '99212, 97813, 97814',
    therapistName: clinicInfo?.therapistName || 'John Smith, L.Ac.',
    therapistLicNo: clinicInfo?.therapistLicenseNo || '12345',
  },
  respondToCare: {
    status: 'Improved',
    improvedDays: '10',
    notes: 'Patient reports 60% improvement in sleep quality and anxiety levels. Can now fall asleep within 30 minutes (previously 2+ hours). Work performance has improved. Still experiences occasional stress but feels much more equipped to handle it. Patient is committed to continuing treatment.',
  }
});

// 샘플 데이터 초기화 함수
export const initializeSampleData = async (userId: string, clinicInfo?: any) => {
  const { database } = await import('./database');
  
  try {
    console.log('샘플 데이터 초기화 시작...');
    
    // 기존 샘플 데이터가 있는지 확인
    const existingCharts = await database.getPatientCharts(userId);
    console.log('기존 차트 수:', existingCharts.length);
    
    const hasNewSample = existingCharts.some(chart => chart.fileNo === 'CH-12345');
    const hasFollowUpSample1 = existingCharts.some(chart => chart.fileNo === 'CH-67890');
    const hasFollowUpSample2 = existingCharts.some(chart => chart.fileNo === 'CH-54321');
    const hasFollowUpSample3 = existingCharts.some(chart => chart.fileNo === 'CH-98765');
    
    console.log('샘플 존재 여부:', {
      newSample: hasNewSample,
      followUp1: hasFollowUpSample1,
      followUp2: hasFollowUpSample2,
      followUp3: hasFollowUpSample3
    });
    
    let samplesAdded = 0;
    
    // 신규환자 샘플 추가
    if (!hasNewSample) {
      const newPatientSample = getNewPatientSample(clinicInfo);
      await database.savePatientChart(userId, newPatientSample);
      console.log('신규환자 샘플 데이터가 추가되었습니다.');
      samplesAdded++;
    }
    
    // 재방문 환자 샘플 1 (목/어깨 통증) 추가
    if (!hasFollowUpSample1) {
      const followUpSample1 = getFollowUpPatientSample(clinicInfo);
      await database.savePatientChart(userId, followUpSample1);
      console.log('재방문 환자 샘플 데이터 1 (목/어깨 통증)이 추가되었습니다.');
      samplesAdded++;
    }
    
    // 재방문 환자 샘플 2 (요통) 추가
    if (!hasFollowUpSample2) {
      const followUpSample2 = getFollowUpPatientSample2(clinicInfo);
      await database.savePatientChart(userId, followUpSample2);
      console.log('재방문 환자 샘플 데이터 2 (요통)이 추가되었습니다.');
      samplesAdded++;
    }
    
    // 재방문 환자 샘플 3 (불면증/스트레스) 추가
    if (!hasFollowUpSample3) {
      const followUpSample3 = getFollowUpPatientSample3(clinicInfo);
      await database.savePatientChart(userId, followUpSample3);
      console.log('재방문 환자 샘플 데이터 3 (불면증/스트레스)가 추가되었습니다.');
      samplesAdded++;
    }
    
    console.log('총 추가된 샘플 수:', samplesAdded);
    
    return { 
      newSampleAdded: !hasNewSample, 
      followUpSampleAdded: !hasFollowUpSample1 || !hasFollowUpSample2 || !hasFollowUpSample3,
      totalSamplesAdded: samplesAdded
    };
  } catch (error) {
    console.error('샘플 데이터 초기화 실패:', error);
    return { newSampleAdded: false, followUpSampleAdded: false, totalSamplesAdded: 0 };
  }
};

// 강제로 모든 샘플 데이터를 다시 생성하는 함수
export const forceInitializeAllSamples = async (userId: string, clinicInfo?: any) => {
  const { database } = await import('./database');
  
  try {
    console.log('강제로 모든 샘플 데이터를 다시 생성합니다...');
    
    // 기존 샘플 데이터 삭제
    const existingCharts = await database.getPatientCharts(userId);
    const sampleFileNos = ['CH-12345', 'CH-67890', 'CH-54321', 'CH-98765'];
    
    for (const chart of existingCharts) {
      if (sampleFileNos.includes(chart.fileNo)) {
        await database.deletePatientChart(userId, chart.fileNo);
        console.log(`기존 샘플 삭제: ${chart.fileNo}`);
      }
    }
    
    // 모든 샘플 데이터 다시 생성
    const newPatientSample = getNewPatientSample(clinicInfo);
    await database.savePatientChart(userId, newPatientSample);
    console.log('신규환자 샘플 데이터가 추가되었습니다.');
    
    const followUpSample1 = getFollowUpPatientSample(clinicInfo);
    await database.savePatientChart(userId, followUpSample1);
    console.log('재방문 환자 샘플 데이터 1 (목/어깨 통증)이 추가되었습니다.');
    
    const followUpSample2 = getFollowUpPatientSample2(clinicInfo);
    await database.savePatientChart(userId, followUpSample2);
    console.log('재방문 환자 샘플 데이터 2 (요통)이 추가되었습니다.');
    
    const followUpSample3 = getFollowUpPatientSample3(clinicInfo);
    await database.savePatientChart(userId, followUpSample3);
    console.log('재방문 환자 샘플 데이터 3 (불면증/스트레스)가 추가되었습니다.');
    
    console.log('모든 샘플 데이터가 성공적으로 생성되었습니다!');
    return { success: true, totalSamples: 4 };
  } catch (error) {
    console.error('강제 샘플 데이터 생성 실패:', error);
    return { success: false, totalSamples: 0 };
  }
};

// 테스트용 사용자 계정 초기화 함수
export const initializeTestUser = async () => {
  const { database } = await import('./database');
  
  try {
    // 테스트 사용자 정보
    const testUserData = {
      username: 'sjoekim',
      password: 'Joe007007',
      clinicName: 'Test Wellness Center',
      therapistName: '김선생',
      therapistLicenseNo: 'TEST12345'
    };
    
    // 기존 사용자가 있는지 확인
    const existingUsers = await database.getAllUsers();
    const existingUser = existingUsers.find(user => user.username === 'sjoekim');
    
    if (!existingUser) {
      // 테스트 사용자 생성
      const result = await database.registerUser(testUserData);
      console.log('테스트 사용자 계정이 생성되었습니다:', result.user.username);
      
      // 관리자 승인 처리
      await database.approveUser(result.user.id, 'admin');
      console.log('테스트 사용자 계정이 승인되었습니다.');
      
      return { userCreated: true, userApproved: true };
    } else {
      console.log('테스트 사용자 계정이 이미 존재합니다.');
      
      // 기존 사용자는 승인 상태를 변경하지 않음 (관리자가 수동으로 승인해야 함)
      return { userCreated: false, userApproved: existingUser.isApproved };
    }
  } catch (error) {
    console.error('테스트 사용자 초기화 실패:', error);
    return { userCreated: false, userApproved: false };
  }
};
