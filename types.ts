export interface ChiefComplaintData {
  selectedComplaints: string[];
  otherComplaint: string;
  location: string;
  locationDetails: string[];
  onsetValue: string;
  onsetUnit: 'days' | 'weeks' | 'months' | 'years' | '';
  provocation: string[];
  provocationOther: string;
  palliation: string[];
  palliationOther: string;
  quality: string[];
  qualityOther: string;
  regionRadiation: string;
  severityScore: string;
  severityDescription: 'Minimal' | 'Slight' | 'Moderate' | 'Severe' | '';
  frequency: 'Occasional' | 'Intermittent' | 'Frequent' | 'Constant' | '';
  timing: string;
  possibleCause: string[];
  possibleCauseOther: string;
  remark: string;
  presentIllness: string;
  westernMedicalDiagnosis: string;
}

export interface MedicalHistoryData {
  pastMedicalHistory: string[];
  pastMedicalHistoryOther: string;
  medication: string[];
  medicationOther: string;
  familyHistory: string[];
  familyHistoryOther: string;
  allergy: string[];
  allergyOther: string;
}

export interface ReviewOfSystemsData {
  coldHot: {
    sensation: 'cold' | 'hot' | 'normal' | '';
    parts: string[];
    other: string;
  };
  sleep: {
    hours: string;
    quality: string[];
    issues: string[];
    other: string;
  };
  sweat: {
    present: 'yes' | 'no' | '';
    time: string[];
    parts: string[];
    other: string;
  };
  eye: {
    symptoms: string[];
    other: string;
  };
  mouthTongue: {
    symptoms: string[];
    taste: string[];
    other: string;
  };
  throatNose: {
    symptoms: string[];
    mucusColor: string[];
    other: string;
  };
  edema: {
    present: 'yes' | 'no' | '';
    parts: string[];
    other: string;
  };
  drink: {
    thirsty: 'thirsty' | 'normal' | 'no' | '';
    preference: 'cold' | 'normal' | 'hot' | '';
    amount: 'sip' | 'washes mouth' | 'drink large amount' | '';
    other: string;
  };
  digestion: {
    symptoms: string[];
    other: string;
  };
  appetiteEnergy: {
    appetite: 'good' | 'ok' | 'sometimes bad' | 'bad' | '';
    energy: string;
    other: string;
  };
  stool: {
    frequencyValue: string;
    frequencyUnit: 'day' | 'week' | '';
    form: 'normal' | 'diarrhea' | 'constipation' | 'alternating' | '';
    color: string;
    symptoms: string[];
    other: string;
  };
  urine: {
    frequencyDay: string;
    frequencyNight: string;
    amount: 'much' | 'normal' | 'scanty' | '';
    color: string;
    symptoms: string[];
    other: string;
  };
  menstruation: {
    status: 'regular' | 'irregular' | 'menopause' | '';
    menopauseAge: string;
    lmp: string;
    cycleLength: string;
    duration: string;
    amount: 'normal' | 'scanty' | 'heavy' | '';
    color: 'fresh red' | 'dark' | 'pale' | '';
    clots: 'yes' | 'no' | '';
    pain: 'yes' | 'no' | '';
    painDetails: string;
    pms: string[];
    other: string;
  };
  discharge: {
    present: 'yes' | 'no' | '';
    symptoms: string[];
    other: string;
  };
}

export interface TongueData {
    body: {
        color: string[];
        shape: string[];
        locations: string[];
        locationComments: { [key: string]: string };
    };
    coating: {
        color: string[];
        quality: string[];
        notes: string;
    };
}

export interface DiagnosisAndTreatmentData {
  eightPrinciples: {
    exteriorInterior: 'Exterior' | 'Interior' | '';
    heatCold: 'Heat' | 'Cold' | '';
    excessDeficient: 'Excess' | 'Deficient' | '';
    yangYin: 'Yang' | 'Yin' | '';
  };
  etiology: string;
  tcmDiagnosis: string;
  treatmentPrinciple: string;
  acupuncturePoints: string;
  herbalTreatment: string;
  selectedTreatment: 'None' | 'Tui-Na' | 'Acupressure' | 'Moxa' | 'Cupping' | 'Electro Acupuncture' | 'Heat Pack' | 'Auricular Acupuncture' | 'Other' | '';
  otherTreatmentText: string;
  icd: string;
  cpt: string;
  therapistName: string;
  therapistLicNo: string;
}

export interface RespondToCareData {
  status: 'Resolved' | 'Improved' | 'Same' | 'Worse' | '';
  improvedDays: string;
  notes?: string;
}

export interface PatientData {
  chartType: 'new' | 'follow-up';
  clinicName: string;
  clinicLogo: string; // Base64 string
  fileNo: string;
  name: string;
  date: string;
  address: string;
  phone: string;
  occupation: string;
  dob: string;
  age: string;
  sex: 'M' | 'F' | '';
  heightFt: string;
  heightIn: string;
  weight: string; // in lbs
  temp: string; // in °F
  bpSystolic: string;
  bpDiastolic: string;
  heartRate: string; // BPM
  heartRhythm: string;
  lungRate: string; // BPM
  lungSound: string;
  chiefComplaint: ChiefComplaintData;
  medicalHistory: MedicalHistoryData;
  reviewOfSystems: ReviewOfSystemsData;
  tongue: TongueData;
  diagnosisAndTreatment: DiagnosisAndTreatmentData;
  respondToCare?: RespondToCareData;
}