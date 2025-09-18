import React, { useState, useEffect } from 'react';
import { PatientForm } from './components/PatientForm';
import { PrintableView } from './components/PrintableView';
import { PatientList } from './components/PatientList';
import type { PatientData } from './types';

const CLINIC_INFO_KEY = 'clinicTherapistInfo';
const PATIENT_RECORDS_KEY = 'patientRecords';

interface StoredInfo {
  clinicName: string;
  clinicLogo: string;
  therapistName: string;
  therapistLicNo: string;
}

const getClinicInfo = (): StoredInfo => {
  try {
    const storedData = localStorage.getItem(CLINIC_INFO_KEY);
    return storedData ? JSON.parse(storedData) : { clinicName: '', clinicLogo: '', therapistName: '', therapistLicNo: '' };
  } catch (error) {
    console.error("Failed to load clinic info from localStorage:", error);
    return { clinicName: '', clinicLogo: '', therapistName: '', therapistLicNo: '' };
  }
};

const getSamplePatientState = (): PatientData => {
  // 1. Define the full sample patient data as the base state.
  const samplePatient: PatientData = {
    chartType: 'new',
    clinicName: 'East-West Wellness Center',
    clinicLogo: '',
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
        sweat: { present: 'yes', time: ['night'], parts: ['head'], other: '' },
        eye: { symptoms: ['dry', 'fatigued'], other: '' },
        mouthTongue: { symptoms: ['dry'], taste: ['bland'], other: '' },
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
        body: { color: ['Pink', 'Red Tip'], shape: ['Tooth-marked', 'Normal'], locations: ['Heart (Tip)'], locationComments: { 'Heart (Tip)': 'cracked' } },
        coating: { color: ['White'], quality: ['Thin', 'Slippery'], notes: 'Covers Stomach/Spleen area' },
    },
    diagnosisAndTreatment: {
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
      therapistName: 'John Smith, L.Ac.',
      therapistLicNo: '12345',
    },
    respondToCare: {
        status: 'Improved',
        improvedDays: '3',
        notes: 'Patient reports mild improvement after last session.',
    }
  };

  const clinicInfo = getClinicInfo();
  samplePatient.clinicName = clinicInfo.clinicName || samplePatient.clinicName;
  samplePatient.clinicLogo = clinicInfo.clinicLogo || samplePatient.clinicLogo;
  samplePatient.diagnosisAndTreatment.therapistName = clinicInfo.therapistName || samplePatient.diagnosisAndTreatment.therapistName;
  samplePatient.diagnosisAndTreatment.therapistLicNo = clinicInfo.therapistLicNo || samplePatient.diagnosisAndTreatment.therapistLicNo;

  return samplePatient;
};

const getNewPatientState = (chartType: 'new' | 'follow-up'): PatientData => {
  const clinicInfo = getClinicInfo();
  // Base state with sensible defaults to speed up charting
  const baseState: PatientData = {
    chartType,
    clinicName: clinicInfo.clinicName,
    clinicLogo: clinicInfo.clinicLogo,
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
        sweat: { present: 'no', time: [], parts: [], other: '' },
        eye: { symptoms: ['normal'], other: '' },
        mouthTongue: { symptoms: ['normal'], taste: [], other: '' },
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
        body: { color: ['Pink'], shape: ['Normal'], locations: [], locationComments: {} },
        coating: { color: ['White'], quality: ['Thin'], notes: '' },
    },
    diagnosisAndTreatment: {
      eightPrinciples: { exteriorInterior: '', heatCold: '', excessDeficient: '', yangYin: '' },
      etiology: '', tcmDiagnosis: '', treatmentPrinciple: '', acupuncturePoints: '', herbalTreatment: '',
      selectedTreatment: 'None', otherTreatmentText: '', icd: '', cpt: '',
      therapistName: clinicInfo.therapistName, therapistLicNo: clinicInfo.therapistLicNo,
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
            provocation: ['Same as before'],
            palliation: ['Same as before'],
            possibleCause: ['Same as before'],
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


const App: React.FC = () => {
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [currentPatient, setCurrentPatient] = useState<PatientData | null>(null);
  const [view, setView] = useState<'list' | 'form' | 'print'>('list');
  const [formMode, setFormMode] = useState<'new' | 'edit'>('new');

  useEffect(() => {
    try {
      const storedPatients = localStorage.getItem(PATIENT_RECORDS_KEY);
      let patientsData: PatientData[] = storedPatients ? JSON.parse(storedPatients) : [];

      if (patientsData.length === 0) {
        // If storage is empty or cleared, initialize with the sample patient.
        const samplePatient = getSamplePatientState();
        patientsData = [samplePatient];
        localStorage.setItem(PATIENT_RECORDS_KEY, JSON.stringify(patientsData));
      }
      
      setPatients(patientsData);
    } catch (error) {
      console.error("Failed to load patient records from localStorage:", error);
      // If there's a parsing error, fallback to sample data to ensure app is usable
      const samplePatient = getSamplePatientState();
      localStorage.setItem(PATIENT_RECORDS_KEY, JSON.stringify([samplePatient]));
      setPatients([samplePatient]);
    }
  }, []);

  const savePatients = (updatedPatients: PatientData[]) => {
    try {
      localStorage.setItem(PATIENT_RECORDS_KEY, JSON.stringify(updatedPatients));
      setPatients(updatedPatients);
    } catch (error) {
       console.error("Failed to save patient records to localStorage:", error);
    }
  };

  const handleFormSubmit = (data: PatientData) => {
    // Save clinic and therapist info to localStorage
    try {
        const infoToStore: StoredInfo = {
            clinicName: data.clinicName,
            clinicLogo: data.clinicLogo,
            therapistName: data.diagnosisAndTreatment.therapistName,
            therapistLicNo: data.diagnosisAndTreatment.therapistLicNo,
        };
        localStorage.setItem(CLINIC_INFO_KEY, JSON.stringify(infoToStore));
    } catch (error) {
        console.error("Failed to save clinic info to localStorage:", error);
    }
    
    // Save/update patient record
    const existingPatientIndex = patients.findIndex(p => p.fileNo === data.fileNo);
    let updatedPatients;
    if (existingPatientIndex > -1) {
      updatedPatients = [...patients];
      updatedPatients[existingPatientIndex] = data;
    } else {
      updatedPatients = [...patients, data];
    }
    savePatients(updatedPatients);
    
    setCurrentPatient(data);
    setView('print');
  };

  const handleNewPatient = () => {
    setCurrentPatient(getNewPatientState('new'));
    setFormMode('new');
    setView('form');
  }
  
  const handleNewFollowUpChart = () => {
    setCurrentPatient(getNewPatientState('follow-up'));
    setFormMode('new');
    setView('form');
  };

  const handleSelectPatient = (patient: PatientData) => {
    setCurrentPatient(patient);
    setFormMode('edit');
    setView('form');
  }

  const handleDeletePatient = (fileNo: string) => {
    if (window.confirm(`Are you sure you want to delete patient record ${fileNo}? This action cannot be undone.`)) {
        const updatedPatients = patients.filter(p => p.fileNo !== fileNo);
        savePatients(updatedPatients);
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

  return (
    <div className="min-h-screen container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-slate-800">Patient Chart System</h1>
        <p className="text-slate-600 mt-2">A modern solution for digital patient records.</p>
      </header>
      
      <main>
        {renderView()}
      </main>
    </div>
  );
};

export default App;