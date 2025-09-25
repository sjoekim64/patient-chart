import React, { useState, useMemo, useEffect } from 'react';
import type { PatientData, ChiefComplaintData, MedicalHistoryData, ReviewOfSystemsData, TongueData, DiagnosisAndTreatmentData, AcupunctureMethod } from '../types.ts';
import { GoogleGenAI } from "@google/genai";

interface InputFieldProps {
  label: string;
  id: string;
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  unit?: string;
  required?: boolean;
  className?: string;
  readOnly?: boolean;
  disabled?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ label, id, name, value, onChange, placeholder, type = 'text', unit, required, className='', readOnly=false, disabled=false }) => (
  <div className={className}>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <input
        type={type}
        id={id}
        name={name || id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        readOnly={readOnly}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm read-only:bg-gray-100 read-only:cursor-not-allowed disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
      {unit && (
        <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">
          {unit}
        </span>
      )}
    </div>
  </div>
);

interface CheckboxGroupProps {
    options: {value: string, label: string}[];
    selected: string[];
    onChange: (value: string, checked: boolean) => void;
    gridCols?: string;
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ options, selected, onChange, gridCols = 'grid-cols-2 md:grid-cols-3' }) => (
    <div className={`grid ${gridCols} gap-x-6 gap-y-2`}>
        {options.map(({value, label}) => (
            <div key={value} className="flex items-center">
                <input
                    type="checkbox"
                    id={value.replace(/\s/g, '')}
                    value={value}
                    checked={selected.includes(value)}
                    onChange={(e) => onChange(value, e.target.checked)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor={value.replace(/\s/g, '')} className="ml-2 text-sm text-gray-600">{label}</label>
            </div>
        ))}
    </div>
);

interface RadioGroupProps {
    options: { value: string; label: string }[];
    name: string;
    selectedValue: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
}

const RadioGroup: React.FC<RadioGroupProps> = ({ options, name, selectedValue, onChange, className = "flex flex-wrap gap-x-4 gap-y-2" }) => (
    <div className={className}>
        {options.map(({ value, label }) => (
            <label key={value} className="flex items-center text-sm">
                <input
                    type="radio"
                    name={name}
                    value={value}
                    checked={selectedValue === value}
                    onChange={onChange}
                    className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <span className="ml-2 text-gray-700">{label}</span>
            </label>
        ))}
    </div>
);


interface PatientFormProps {
  initialData: PatientData;
  onSubmit: (data: PatientData) => void;
  onBack: () => void;
  mode: 'new' | 'edit';
}

const commonComplaints = [
    {value: 'Neck Pain', label: 'Neck Pain'}, {value: 'Shoulder Pain', label: 'Shoulder Pain'}, {value: 'Back Pain', label: 'Back Pain'}, {value: 'Knee Pain', label: 'Knee Pain'}, {value: 'Headache', label: 'Headache'}, {value: 'Migraine', label: 'Migraine'},
    {value: 'Insomnia', label: 'Insomnia'}, {value: 'Digestive Issues', label: 'Digestive Issues'}, {value: 'Fatigue / Lethargy', label: 'Fatigue / Lethargy'}, {value: 'Menstrual Issues', label: 'Menstrual Issues'},
    {value: 'Numbness / Tingling', label: 'Numbness / Tingling'}
];
const baseAggravatingFactors = [
    {value: 'Prolonged Sitting / Standing', label: 'Prolonged Sitting / Standing'}, {value: 'Lifting Heavy Objects', label: 'Lifting Heavy Objects'}, {value: 'Stairs / Weight Bearing', label: 'Stairs / Weight Bearing'},
    {value: 'Specific Postures', label: 'Specific Postures'}, {value: 'Weather Changes', label: 'Weather Changes'}
];
const baseAlleviatingFactors = [
    {value: 'Rest / Lying Down', label: 'Rest / Lying Down'}, {value: 'Stretching / Light Exercise', label: 'Stretching / Light Exercise'}, {value: 'Warm Packs / Shower', label: 'Warm Packs / Shower'},
    {value: 'Massage / Acupressure', label: 'Massage / Acupressure'}, {value: 'Medication', label: 'Medication'}
];
const painQualities = [
    {value: 'Sharp', label: 'Sharp'}, {value: 'Dull', label: 'Dull'}, {value: 'Burning', label: 'Burning'}, {value: 'Throbbing', label: 'Throbbing'}, {value: 'Tingling', label: 'Tingling'}, {value: 'Numb', label: 'Numb'}, {value: 'Stiff', label: 'Stiff'}, {value: 'Aching', label: 'Aching'}
];
const basePossibleCauses = [
    {value: 'Traffic Accident', label: 'Traffic Accident'}, {value: 'Fall / Slip', label: 'Fall / Slip'}, {value: 'Overwork / Repetitive Labor', label: 'Overwork / Repetitive Labor'}, {value: 'Excessive Exercise', label: 'Excessive Exercise'},
    {value: 'Poor Posture', label: 'Poor Posture'}, {value: 'Lifting / Sudden Movements', label: 'Lifting / Sudden Movements'}, {value: 'Poor Sleeping Posture', label: 'Poor Sleeping Posture'}, {value: 'Exposure to Cold / Damp', label: 'Exposure to Cold / Damp'},
    {value: 'Degenerative Changes', label: 'Degenerative Changes'}, {value: 'Post-Injury / Surgery', label: 'Post-Injury / Surgery'}
];

const complaintLocationMap: { [key: string]: string[] } = {
    'Neck Pain': ['Left', 'Right', 'Upper', 'Lower'],
    'Shoulder Pain': ['Left', 'Right', 'Both'],
    'Back Pain': ['Upper', 'Middle', 'Lower', 'Left', 'Right'],
    'Knee Pain': ['Left', 'Right', 'Both'],
    'Headache': ['Frontal', 'Temporal', 'Occipital', 'Parietal'],
    'Numbness / Tingling': ['Hands', 'Feet', 'Arms', 'Legs']
};

const pastMedicalHistoryOptions = [
    {value: 'Hypertension', label: 'Hypertension'}, {value: 'Diabetes Mellitus', label: 'Diabetes Mellitus'}, {value: 'Hyperlipidemia', label: 'Hyperlipidemia'}, {value: 'Heart Disease', label: 'Heart Disease'}, {value: 'Cerebrovascular Disease', label: 'Cerebrovascular Disease'},
    {value: 'Asthma / COPD', label: 'Asthma / COPD'}, {value: 'GI Disease', label: 'GI Disease'}, {value: 'Liver Disease', label: 'Liver Disease'}, {value: 'Kidney Disease', label: 'Kidney Disease'}, {value: 'Cancer', label: 'Cancer'}
];
const medicationOptions = [
    {value: 'Antihypertensives', label: 'Antihypertensives'}, {value: 'Antidiabetics', label: 'Antidiabetics'}, {value: 'Statins (Cholesterol)', label: 'Statins (Cholesterol)'}, {value: 'Heart Medication', label: 'Heart Medication'}, {value: 'Blood Thinners', label: 'Blood Thinners'},
    {value: 'GI Medication', label: 'GI Medication'}, {value: 'NSAIDs', label: 'NSAIDs'}, {value: 'Thyroid Medication', label: 'Thyroid Medication'}, {value: 'Hormones', label: 'Hormones'}, {value: 'Psychiatric Meds', label: 'Psychiatric Meds'}
];
const familyHistoryOptions = [
    {value: 'Hypertension', label: 'Hypertension'}, {value: 'Diabetes', label: 'Diabetes'}, {value: 'Heart Disease', label: 'Heart Disease'}, {value: 'Stroke', label: 'Stroke'}, {value: 'Hyperlipidemia', label: 'Hyperlipidemia'},
    {value: 'Cancer', label: 'Cancer'}, {value: 'Tuberculosis', label: 'Tuberculosis'}, {value: 'Liver Disease', label: 'Liver Disease'}, {value: 'Alcoholism', label: 'Alcoholism'}, {value: 'Psychiatric Illness', label: 'Psychiatric Illness'}
];
const allergyOptions = [
    {value: 'Penicillin', label: 'Penicillin'}, {value: 'Aspirin', label: 'Aspirin'}, {value: 'NSAIDs', label: 'NSAIDs'}, {value: 'Anesthetics', label: 'Anesthetics'}, {value: 'Contrast Media', label: 'Contrast Media'},
    {value: 'Seafood', label: 'Seafood'}, {value: 'Peanuts', label: 'Peanuts'}, {value: 'Eggs', label: 'Eggs'}, {value: 'Milk', label: 'Milk'}, {value: 'Other Medications', label: 'Other Medications'}
];

const tongueBodyColorOptions = ['Pale', 'Pink', 'Red', 'Dark Red', 'Purple', 'Reddish Purple', 'Bluish Purple'].map(o => ({value: o, label: o}));
const tongueBodyColorModifierOptions = ['Red Tip', 'Redder side', 'Orange side', 'Purple side'].map(o => ({value: o, label: o}));
const tongueBodyShapeOptions = ['Normal', 'Stiff', 'Long', 'Flaccid', 'Swollen', 'Short', 'Thin', 'Thick', 'Narrow'].map(o => ({value: o, label: o}));
const tongueBodyShapeModifierOptions = ['Cracked', 'Rolled up or Down', 'Ulcerate', 'Tooth-marked', 'Half Swollen', 'Deviation', 'Trembling'].map(o => ({value: o, label: o}));

const tongueCoatingColorOptions = ['White', 'Yellow', 'Gray', 'Black', 'Greenish', 'Half White or Yellow'].map(o => ({value: o, label: o}));
const tongueCoatingQualityOptions = ['Thin', 'Thick', 'Scanty', 'None', 'Dry', 'Wet', 'Slippery', 'Greasy', 'Rough', 'Sticky', 'Graphic', 'Mirror'].map(o => ({value: o, label: o}));
const tongueLocationOptions = ['Heart (Tip)', 'Lung (Upper-mid)', 'Stomach/Spleen (Center)', 'Liver/Gallbladder (Sides)', 'Kidney/Bladder (Root)'].map(o => ({value: o, label: o}));

const pulseQualityPairs = {
    buChim: [{value: 'Floating', label: 'Floating (부)'}, {value: 'Sinking', label: 'Sinking (침)'}],
    jiSak: [{value: 'Slow', label: 'Slow (지)'}, {value: 'Rapid', label: 'Rapid (삭)'}],
    heoSil: [{value: 'Deficient', label: 'Deficient (허)'}, {value: 'Excess', label: 'Excess (실)'}],
};

const excessPulseQualities = [
    {value: 'Slippery', label: 'Slippery (활)'}, {value: 'Wiry', label: 'Wiry (현)'}, 
    {value: 'Tight', label: 'Tight (긴)'}, {value: 'Long', label: 'Long (장)'}, 
    {value: 'Surging', label: 'Surging (홍)'},
];
const deficientPulseQualities = [
    {value: 'Faint', label: 'Faint (미)'}, {value: 'Thready', label: 'Thready (세)'},
    {value: 'Intermittent', label: 'Intermittent (대)'}, {value: 'Short', label: 'Short (단)'},
    {value: 'Weak', label: 'Weak (약)'},
];
const otherRemainingPulseQualities = [
    {value: 'Choppy', label: 'Choppy (삽)'}, {value: 'Knotted', label: 'Knotted (결)'},
];


const otherTreatmentOptions: { value: string; label: string; }[] = [
    {value: 'None', label: 'None'}, {value: 'Tui-Na', label: 'Tui-Na'}, {value: 'Acupressure', label: 'Acupressure'}, {value: 'Moxa', label: 'Moxa'},
    {value: 'Cupping', label: 'Cupping'}, {value: 'Electro Acupuncture', label: 'Electro Acupuncture'}, {value: 'Heat Pack', label: 'Heat Pack'},
    {value: 'Auricular Acupuncture', label: 'Auricular Acupuncture / Ear Seeds'},
    {value: 'Other', label: 'Other'}
];

const acupunctureMethodOptions: { value: AcupunctureMethod, label: string }[] = [
    { value: 'TCM Body', label: 'TCM Body (체침)' },
    { value: 'Saam', label: 'Saam (사암침)' },
    { value: 'Master Tung', label: "Master Tung's (동씨침)" },
    { value: 'Five Element', label: 'Five Element (오행침)' },
    { value: 'Trigger Point', label: 'Trigger Point (근육침)' },
    { value: 'Other', label: 'Other' },
];


export const PatientForm: React.FC<PatientFormProps> = ({ initialData, onSubmit, onBack, mode }) => {
  const [formData, setFormData] = useState<PatientData>(initialData);
  const [isGeneratingHpi, setIsGeneratingHpi] = useState(false);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [needsHpiRegeneration, setNeedsHpiRegeneration] = useState(false);
  
  const isFollowUp = useMemo(() => formData.chartType === 'follow-up', [formData.chartType]);
  const isEditing = useMemo(() => mode === 'edit', [mode]);

  useEffect(() => {
    setFormData(initialData);
    setHasChanges(false);
  }, [initialData]);

  useEffect(() => {
    if (!hasChanges) {
      const initialJson = JSON.stringify(initialData);
      const currentJson = JSON.stringify(formData);
      if (initialJson !== currentJson) {
        setHasChanges(true);
      }
    }
  }, [formData, initialData, hasChanges]);

  // Track changes to selected complaints to detect when HPI needs regeneration
  useEffect(() => {
    const initialComplaints = initialData.chiefComplaint.selectedComplaints;
    const currentComplaints = formData.chiefComplaint.selectedComplaints;
    const initialOtherComplaint = initialData.chiefComplaint.otherComplaint;
    const currentOtherComplaint = formData.chiefComplaint.otherComplaint;
    
    const complaintsChanged = 
      JSON.stringify(initialComplaints) !== JSON.stringify(currentComplaints) ||
      initialOtherComplaint !== currentOtherComplaint;
    
    if (complaintsChanged && formData.chiefComplaint.presentIllness) {
      setNeedsHpiRegeneration(true);
    }
  }, [formData.chiefComplaint.selectedComplaints, formData.chiefComplaint.otherComplaint, initialData.chiefComplaint.selectedComplaints, initialData.chiefComplaint.otherComplaint, formData.chiefComplaint.presentIllness]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, clinicLogo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({ ...prev, clinicLogo: '' }));
    }
  };
  
  const activeLocationSuggestions = useMemo(() => {
    const suggestions = new Set<string>();
    formData.chiefComplaint.selectedComplaints.forEach(complaint => {
      if (complaintLocationMap[complaint]) {
        complaintLocationMap[complaint].forEach(sugg => suggestions.add(sugg));
      }
    });
    return Array.from(suggestions);
  }, [formData.chiefComplaint.selectedComplaints]);

  // Clean up location details and location text when complaints change
  useEffect(() => {
    const currentValidLocations = new Set<string>();
    formData.chiefComplaint.selectedComplaints.forEach(complaint => {
      if (complaintLocationMap[complaint]) {
        complaintLocationMap[complaint].forEach(loc => currentValidLocations.add(loc));
      }
    });

    // Remove invalid location details
    const validLocationDetails = formData.chiefComplaint.locationDetails.filter(detail => 
      currentValidLocations.has(detail)
    );

    // Clean up location text field
    let cleanedLocationText = formData.chiefComplaint.location;
    if (cleanedLocationText) {
      const locationParts = cleanedLocationText.split(',').map(p => p.trim()).filter(Boolean);
      const allPossibleSuggestions = new Set<string>();
      Object.values(complaintLocationMap).forEach(v => v.forEach(s => allPossibleSuggestions.add(s)));
      
      // Remove invalid suggestion-based locations from text
      const validLocationParts = locationParts.filter(part => {
        // Keep manual text entries that are not from the suggestion list
        if (!allPossibleSuggestions.has(part)) return true;
        // Only keep suggestion-based locations that are valid for current complaints
        return currentValidLocations.has(part);
      });
      
      cleanedLocationText = validLocationParts.join(', ');
    }

    const hasLocationDetailsChanged = validLocationDetails.length !== formData.chiefComplaint.locationDetails.length;
    const hasLocationTextChanged = cleanedLocationText !== formData.chiefComplaint.location;

    if (hasLocationDetailsChanged || hasLocationTextChanged) {
      setFormData(prev => ({
        ...prev,
        chiefComplaint: {
          ...prev.chiefComplaint,
          locationDetails: validLocationDetails,
          location: cleanedLocationText
        }
      }));
    }
  }, [formData.chiefComplaint.selectedComplaints, formData.chiefComplaint.locationDetails, formData.chiefComplaint.location]);

  const handleNestedChange = (
    section: keyof PatientData,
    field: string,
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value,
      },
    }));
  };

  const handleReviewOfSystemsChange = (
    subSection: keyof ReviewOfSystemsData,
    field: string,
    value: any
  ) => {
      setFormData(prev => ({
          ...prev,
          reviewOfSystems: {
              ...prev.reviewOfSystems,
              [subSection]: {
                  ...prev.reviewOfSystems[subSection],
                  [field]: value,
              }
          }
      }));
  };
  
  const handleArrayChange = (
    section: 'chiefComplaint' | 'medicalHistory',
    field: keyof ChiefComplaintData | keyof MedicalHistoryData,
    value: string,
    checked: boolean
  ) => {
      setFormData(prev => {
          const sectionData = prev[section];
          const currentValues = (sectionData[field as keyof typeof sectionData] as string[]) || [];
          const newValues = checked
              ? [...currentValues, value]
              : currentValues.filter(item => item !== value);

          // If updating location details, also update the main location string
          if (section === 'chiefComplaint' && field === 'locationDetails') {
              const existingLocation = prev.chiefComplaint.location || '';
              const parts = existingLocation.split(',').map(p => p.trim()).filter(Boolean);
              
              // Get all possible suggestions to filter them out from the manual parts
              const allSuggestions = new Set<string>();
              Object.values(complaintLocationMap).forEach(v => v.forEach(s => allSuggestions.add(s)));
              
              const manualParts = parts.filter(p => !allSuggestions.has(p));
              
              const newLocationString = [...manualParts, ...newValues].join(', ');
              
              return {
                  ...prev,
                  chiefComplaint: {
                      ...prev.chiefComplaint,
                      locationDetails: newValues,
                      location: newLocationString,
                  },
              };
          }
          
          return {
              ...prev,
              [section]: {
                  ...sectionData,
                  [field]: newValues,
              },
          };
      });
  };

  const handleRosArrayChange = (
    subSection: keyof ReviewOfSystemsData,
    field: string,
    value: string,
    checked: boolean
  ) => {
      setFormData(prev => {
          const currentValues = (prev.reviewOfSystems[subSection] as any)[field] as string[];

          // Universal rule: 'normal' is exclusive across all sections
          let updatedValues: string[] = currentValues;

          if (checked) {
              if (value === 'normal') {
                  // Selecting 'normal' clears all others
                  updatedValues = ['normal'];
              } else {
                  // Selecting any non-normal removes 'normal' if present
                  updatedValues = [...currentValues.filter(v => v !== 'normal'), value];
              }
          } else {
              // Unchecking simply removes the value
              updatedValues = currentValues.filter(item => item !== value);
          }

          return {
              ...prev,
              reviewOfSystems: {
                  ...prev.reviewOfSystems,
                  [subSection]: {
                      ...prev.reviewOfSystems[subSection],
                      [field]: updatedValues,
                  }
              }
          };
      });
  };

  const handleTongueBodyChange = (field: keyof TongueData['body'], value: any) => {
    setFormData(prev => ({
        ...prev,
        tongue: {
            ...prev.tongue,
            body: {
                ...prev.tongue.body,
                [field]: value,
            }
        }
    }))
  };

  const handleTongueBodyArrayChange = (
    field: 'colorModifiers' | 'shapeModifiers' | 'locations' | 'shape',
    value: string,
    checked: boolean
    ) => {
        setFormData(prev => {
            const currentValues = prev.tongue.body[field] || [];
            
            // Universal rule: 'Normal' is exclusive across all tongue body fields
            let updatedValues: string[] = currentValues;

            if (checked) {
                if (value === 'Normal') {
                    // Selecting 'Normal' clears all others
                    updatedValues = ['Normal'];
                } else {
                    // Selecting any non-Normal removes 'Normal' if present
                    updatedValues = [...currentValues.filter(v => v !== 'Normal'), value];
                }
            } else {
                // Unchecking simply removes the value
                updatedValues = currentValues.filter(item => item !== value);
            }

            return {
                ...prev,
                tongue: {
                    ...prev.tongue,
                    body: {
                        ...prev.tongue.body,
                        [field]: updatedValues
                    }
                }
            }
        });
  };

  const handleTongueCoatingChange = (field: keyof TongueData['coating'], value: any) => {
    setFormData(prev => ({
        ...prev,
        tongue: {
            ...prev.tongue,
            coating: {
                ...prev.tongue.coating,
                [field]: value
            }
        }
    }));
  };
  
    const handleTongueCoatingArrayChange = (
    field: keyof TongueData['coating'],
    value: string,
    checked: boolean
    ) => {
        setFormData(prev => {
            if (field !== 'quality') return prev;

            const currentValues = (prev.tongue.coating.quality as string[]) || [];
            let newValues;
            
            if (checked) {
                if (currentValues.length < 2) {
                    newValues = [...currentValues, value];
                } else {
                    return prev; // Max 2 selected, do not update state
                }
            } else {
                newValues = currentValues.filter(item => item !== value);
            }

            return {
                ...prev,
                tongue: {
                    ...prev.tongue,
                    coating: {
                        ...prev.tongue.coating,
                        quality: newValues
                    }
                }
            }
        });
  };

  const handlePulseNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const { value } = e.target;
      setFormData(prev => ({
          ...prev,
          pulse: { ...prev.pulse, notes: value }
      }));
  };

  const handlePulseOverallChange = (value: string, checked: boolean) => {
    const pulsePairsMap: { [key: string]: string } = {
        'Floating': 'Sinking', 'Sinking': 'Floating',
        'Slow': 'Rapid', 'Rapid': 'Slow',
        'Deficient': 'Excess', 'Excess': 'Deficient',
    };

    setFormData(prev => {
        let currentValues = [...prev.pulse.overall];
        
        if (checked) {
            currentValues.push(value);
            const opposite = pulsePairsMap[value];
            if (opposite && currentValues.includes(opposite)) {
                currentValues = currentValues.filter(item => item !== opposite);
            }
        } else {
            currentValues = currentValues.filter(item => item !== value);
        }
        
        return {
            ...prev,
            pulse: { ...prev.pulse, overall: currentValues }
        };
    });
  };

  
  const handleLungRateChange = (increment: boolean) => {
    setFormData(prev => {
        const currentRate = parseInt(prev.lungRate, 10) || 0;
        const newRate = increment ? currentRate + 1 : Math.max(0, currentRate - 1);
        return { ...prev, lungRate: newRate.toString() };
    });
  };

  const handleGenerateHpi = async () => {
    setIsGeneratingHpi(true);

    const { age, sex, chiefComplaint } = formData;

    const allComplaints = [...chiefComplaint.selectedComplaints, chiefComplaint.otherComplaint].filter(Boolean).join(', ');
    const locationDisplay = [...chiefComplaint.locationDetails, chiefComplaint.location].filter(Boolean).join(', ');
    const onsetDisplay = chiefComplaint.onsetValue && chiefComplaint.onsetUnit ? `${chiefComplaint.onsetValue} ${chiefComplaint.onsetUnit}` : '';
    const provocationDisplay = [...chiefComplaint.provocation, chiefComplaint.provocationOther].filter(Boolean).join(', ');
    const palliationDisplay = [...chiefComplaint.palliation, chiefComplaint.palliationOther].filter(Boolean).join(', ');
    const qualityDisplay = [...chiefComplaint.quality, chiefComplaint.qualityOther].filter(Boolean).join(', ');
    const causeDisplay = [...chiefComplaint.possibleCause, chiefComplaint.possibleCauseOther].filter(Boolean).join(', ');
    const severityDisplay = [
        chiefComplaint.severityScore ? `${chiefComplaint.severityScore}/10` : '',
        chiefComplaint.severityDescription
    ].filter(Boolean).join(' ');
    
    const openingSentence = isFollowUp
      ? `The patient is a [age]-year-old [sex] who returns for a follow-up regarding...`
      : `The patient is a [age]-year-old [sex] who presents with...`;

    let prompt = `You are a medical scribe creating a "History of Present Illness" (HPI) narrative. 

**CRITICAL REQUIREMENT: You must ONLY include the EXACT symptoms listed in the "Current Symptoms" section below. Do NOT add any symptoms that are not explicitly listed.**

**Patient Demographics:**
- Age: ${age}
- Sex: ${sex === 'M' ? 'Male' : sex === 'F' ? 'Female' : 'Not specified'}

**Current Symptoms (MUST include ONLY these):**
${allComplaints || 'No specific complaints listed'}

**Current Complaint Details:**
`;

    if (locationDisplay) prompt += `- Location: ${locationDisplay}\n`;
    if (onsetDisplay) prompt += `- Onset: Approximately ${onsetDisplay} ago\n`;
    if (qualityDisplay) prompt += `- Pain Quality: ${qualityDisplay}\n`;
    if (severityDisplay) prompt += `- Severity: ${severityDisplay}\n`;
    if (chiefComplaint.frequency) prompt += `- Frequency: ${chiefComplaint.frequency}\n`;
    if (chiefComplaint.timing) prompt += `- Timing: ${chiefComplaint.timing}\n`;
    if (provocationDisplay) prompt += `- Aggravating Factors: ${provocationDisplay}\n`;
    if (palliationDisplay) prompt += `- Alleviate Factors: ${palliationDisplay}\n`;
    if (chiefComplaint.regionRadiation) prompt += `- Radiation: ${chiefComplaint.regionRadiation}\n`;
    if (causeDisplay) prompt += `- Possible Cause: ${causeDisplay}\n`;
    if (chiefComplaint.remark) prompt += `- Remarks: ${chiefComplaint.remark}\n`;
    
    prompt += `
**ABSOLUTE REQUIREMENTS:**
1. ONLY mention the symptoms listed in "Current Symptoms" above
2. If a symptom is NOT in the "Current Symptoms" list, DO NOT mention it
3. Do NOT infer or add symptoms like "back pain", "lower back", "lumbar pain" unless explicitly listed in "Current Symptoms"
4. Write a coherent paragraph in a professional, clinical tone
5. Start with an opening sentence like: "${openingSentence}"
6. Weave the details into a narrative, not just a list
7. Do not use markdown or bullet points in your final output

**Example of what NOT to do:** If "Current Symptoms" only lists "Neck Pain, Shoulder Pain" but you mention "back pain" or "lower back", that is WRONG.

Generate the HPI paragraph below:
`;

    try {
        console.log("Starting HPI generation...");
        console.log("Current selected complaints:", chiefComplaint.selectedComplaints);
        console.log("Other complaint:", chiefComplaint.otherComplaint);
        console.log("All complaints string:", allComplaints);
        console.log("Using API Key:", process.env.GEMINI_API_KEY ? "Present" : "Missing");
        
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "AIzaSyANTMkQtJzhKwxp9sPWdpHHqI9M4RumzRY" });
        console.log("GoogleGenAI instance created");
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        console.log("API response received:", response);

        const generatedText = response.text;
        
        // Validate that the generated text only includes current symptoms
        const currentSymptoms = [...chiefComplaint.selectedComplaints, chiefComplaint.otherComplaint].filter(Boolean);
        const generatedLower = generatedText.toLowerCase();
        
        // Check for common symptoms that might be incorrectly included
        const commonSymptoms = ['back pain', 'lower back', 'lumbar', 'spine', 'backache'];
        const incorrectlyIncluded = commonSymptoms.filter(symptom => 
            generatedLower.includes(symptom) && 
            !currentSymptoms.some(current => current.toLowerCase().includes('back'))
        );
        
        if (incorrectlyIncluded.length > 0) {
            console.warn('Generated text may include symptoms not in current complaints:', incorrectlyIncluded);
            console.warn('Current symptoms:', currentSymptoms);
            console.warn('Generated text:', generatedText);
        }
        
        setFormData(prev => ({
            ...prev,
            chiefComplaint: {
                ...prev.chiefComplaint,
                presentIllness: generatedText.trim(),
            }
        }));
        
        // Reset the regeneration flag after successful generation
        setNeedsHpiRegeneration(false);

    } catch (error) {
        console.error("Error generating Present Illness text:", error);
        console.error("Error details:", {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            name: error instanceof Error ? error.name : undefined
        });
        alert(`Failed to generate Present Illness text. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
        setIsGeneratingHpi(false);
    }
  };


  const handleGenerateDiagnosis = async () => {
    setIsDiagnosing(true);

    const patientSummary = JSON.stringify({
        demographics: { age: formData.age, sex: formData.sex },
        ...(isFollowUp && { respondToCare: formData.respondToCare }),
        chiefComplaint: formData.chiefComplaint,
        reviewOfSystems: formData.reviewOfSystems,
        tongue: formData.tongue,
        pulse: formData.pulse,
        ...(!isFollowUp && { medicalHistory: formData.medicalHistory }),
    }, null, 2);
    
    const { acupunctureMethod, acupunctureMethodOther } = formData.diagnosisAndTreatment;
    const methodsForPrompt = acupunctureMethod
        .map(method => method === 'Other' && acupunctureMethodOther ? acupunctureMethodOther : method)
        .filter(m => m !== 'Other');
    
    const prompt = `Based on the following comprehensive patient data, act as an expert TCM practitioner to generate a diagnosis and treatment plan. Your analysis must be grounded in the principles of 'Chinese Acupuncture and Moxibustion' (中国针灸学). Provide the output in a structured JSON format. ${isFollowUp ? `This is a follow-up visit. Pay close attention to the "respondToCare" data to adjust the diagnosis and treatment plan accordingly.` : ''}

Patient Data:
${patientSummary}

JSON Output Structure:
{
  "eightPrinciples": {
    "exteriorInterior": "Exterior or Interior",
    "heatCold": "Heat or Cold",
    "excessDeficient": "Excess or Deficient",
    "yangYin": "Based on the three principles above (Exterior/Interior, Heat/Cold, Excess/Deficient), determine if the overall pattern is predominantly Yang or Yin. For example, a pattern of Interior, Cold, and Deficient is Yin."
  },
  "etiology": "Describe the root cause and contributing factors. Be very concise; the entire text must not exceed 3 lines.${isFollowUp ? ' Consider changes since the last visit.' : ''}",
  "tcmDiagnosis": "Provide the primary TCM Syndrome/Differentiation diagnosis (e.g., Liver Qi Stagnation, Spleen Qi Deficiency with Dampness), grounded in 'Chinese Acupuncture and Moxibustion' principles.",
  "treatmentPrinciple": "State the clear treatment principle (e.g., Soothe the Liver, tonify Spleen Qi, resolve dampness).",
  "acupuncturePoints": "Suggest primary acupuncture points for EACH of the selected methods: '${methodsForPrompt.join(', ')}'. Your response for this field MUST be a single string. List ONLY the point names/groups. Do NOT include any descriptions or explanations. Structure the output with each method as a heading on a new line, using '\\n' as a separator. For example: 'Saam: HT8, LR1 (sedate); LU8, SP2 (tonify)\\nTCM Body: ST36, SP6, LI4, LV3'. For 'Saam', provide the tonification/sedation combination. For 'Master Tung', list Tung's points. For 'Five Element', list constitutional points. For 'Trigger Point', list relevant muscles or Ashi points. For 'TCM Body', list standard channel points.",
  "herbalTreatment": "Recommend a classic herbal formula using 'Bangyakhappyeon' (방약합편) as the PRIMARY reference. If an exact match cannot be determined, then fallback to 'Donguibogam' (동의보감). Respond with ONLY the formula name (e.g., 'Du Huo Ji Sheng Tang'). Do not include explanations.",
  "otherTreatment": {
    "recommendation": "Suggest only the single most relevant treatment from this list: None, Tui-Na, Acupressure, Moxa, Cupping, Electro Acupuncture, Heat Pack, Auricular Acupuncture, Other. If 'Other' or 'Auricular Acupuncture', specify what it is (e.g., 'Auricular Acupuncture: Shen Men, Liver').",
    "explanation": "Briefly explain why you recommend it."
  }
}

Instructions:
- Analyze the interconnected symptoms from all sections (ROS, tongue, chief complaint).
- Provide a concise and clinically relevant diagnosis and plan.
- For Eight Principles, choose only one from each pair and logically determine Yin/Yang.
- Ensure the output is a valid JSON object only.
`;
    try {
        console.log("API Key for diagnosis:", process.env.API_KEY ? "Present" : "Missing");
        console.log("API Key length for diagnosis:", process.env.API_KEY?.length);
        
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "AIzaSyANTMkQtJzhKwxp9sPWdpHHqI9M4RumzRY" });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        const generatedJsonString = response.text.trim();
        const generatedData = JSON.parse(generatedJsonString);
        
        const recommendation = generatedData.otherTreatment?.recommendation || '';
        const explanation = generatedData.otherTreatment?.explanation || '';
        let selectedTreatment = 'None' as PatientData['diagnosisAndTreatment']['selectedTreatment'];
        let otherTreatmentText = '';

        const foundTreatment = otherTreatmentOptions.find(opt => recommendation.toLowerCase().includes(opt.value.toLowerCase().replace(/\s/g, '')));

        if (foundTreatment) {
            selectedTreatment = foundTreatment.value as typeof selectedTreatment;
            if (foundTreatment.value === 'Other' || foundTreatment.value === 'Auricular Acupuncture') {
                 otherTreatmentText = recommendation.split(':').slice(1).join(':').trim() || explanation;
            } else {
                otherTreatmentText = explanation;
            }
        } else if (recommendation && recommendation.toLowerCase() !== 'none') {
            selectedTreatment = 'Other';
            otherTreatmentText = `${recommendation} (${explanation})`;
        }

        setFormData(prev => ({
            ...prev,
            diagnosisAndTreatment: {
                ...prev.diagnosisAndTreatment,
                eightPrinciples: generatedData.eightPrinciples || prev.diagnosisAndTreatment.eightPrinciples,
                etiology: generatedData.etiology || '',
                tcmDiagnosis: generatedData.tcmDiagnosis || '',
                treatmentPrinciple: generatedData.treatmentPrinciple || '',
                acupuncturePoints: generatedData.acupuncturePoints || '',
                herbalTreatment: generatedData.herbalTreatment || '',
                selectedTreatment: selectedTreatment,
                otherTreatmentText: otherTreatmentText,
            }
        }));

    } catch (error) {
        console.error("Error generating diagnosis:", error);
        alert("Failed to generate AI diagnosis. Please check the console for errors.");
    } finally {
        setIsDiagnosing(false);
    }
};


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fileNo || !formData.sex || !formData.age) {
        alert("Please fill in all required fields: File No., Sex, and Age.");
        return;
    }
    
    // AI generation for Present Illness is now handled by a separate button.
    // Submit the form data as it is.
    onSubmit(formData);
  };
  
  const handleComplaintChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    handleNestedChange('chiefComplaint', e.target.name, e.target.value);
  }
  const handleMedicalHistoryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    handleNestedChange('medicalHistory', e.target.name, e.target.value);
  }
  
  const handleDiagnosisChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
        ...prev,
        diagnosisAndTreatment: {
            ...prev.diagnosisAndTreatment,
            [name]: value
        }
    }));
  };

  const handleDiagnosisArrayChange = (
    field: keyof DiagnosisAndTreatmentData,
    value: string,
    checked: boolean
  ) => {
      setFormData(prev => {
          const diagnosisData = prev.diagnosisAndTreatment;
          const currentValues = (diagnosisData[field as keyof typeof diagnosisData] as string[]) || [];
          const newValues = checked
              ? [...currentValues, value]
              : currentValues.filter(item => item !== value);
          
          return {
              ...prev,
              diagnosisAndTreatment: {
                  ...diagnosisData,
                  [field]: newValues,
              },
          };
      });
  };
  
  const handleOtherTreatmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData(prev => {
        // Base E/M and acupuncture codes per visit type
        const baseCpt = isFollowUp
          ? ['99212']
          : ['99202'];

        // Acupuncture codes: electro vs non-electro
        const acupunctureCodes = isFollowUp
          ? (prev.diagnosisAndTreatment.selectedTreatment === 'Electro Acupuncture' ? ['97813', '97814'] : ['97810', '97811'])
          : (prev.diagnosisAndTreatment.selectedTreatment === 'Electro Acupuncture' ? ['97813', '97814'] : ['97810', '97811']);

        // Manual therapy 97140 applies only for Tui-Na, Acupressure, Cupping
        const manualEligible = value === 'Tui-Na' || value === 'Acupressure' || value === 'Cupping';

        const newCptSet = new Set<string>([...baseCpt, ...acupunctureCodes]);
        if (manualEligible) newCptSet.add('97140');

        // Preserve any previously entered custom codes that are not part of our managed sets
        const managed = new Set<string>([...baseCpt, ...acupunctureCodes, '97140']);
        const existingCpt = prev.diagnosisAndTreatment.cpt.split(',').map(c => c.trim()).filter(Boolean);
        existingCpt.forEach(code => {
            if (!managed.has(code)) newCptSet.add(code);
        });

        return {
            ...prev,
            diagnosisAndTreatment: {
                ...prev.diagnosisAndTreatment,
                [name]: value,
                cpt: Array.from(newCptSet).join(', ')
            }
        };
    });
  };

  const handleEightPrincipleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
        ...prev,
        diagnosisAndTreatment: {
            ...prev.diagnosisAndTreatment,
            eightPrinciples: {
                ...prev.diagnosisAndTreatment.eightPrinciples,
                [name]: value
            }
        }
    }));
  };

  const handleRespondToCareChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, respondToCare: { ...prev.respondToCare!, [name]: value } }));
  };

  const handleBack = () => {
    if (hasChanges && !window.confirm("You have unsaved changes. Are you sure you want to leave? Your changes will be lost.")) {
      return;
    }
    onBack();
  };
  
  const formTitle = isEditing 
      ? 'Edit Patient Record' 
      : isFollowUp 
        ? 'Follow-up Chart' 
        : 'New Patient Registration';

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-800 text-center">{formTitle}</h1>
      
      {/* Clinic Information */}
      {!isFollowUp && (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-800 border-b pb-4 mb-6">Clinic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Clinic Name" id="clinicName" name="clinicName" value={formData.clinicName} onChange={handleChange} placeholder="Enter your clinic's name" />
            <div>
              <label htmlFor="clinicLogo" className="block text-sm font-medium text-gray-700 mb-1">Clinic Logo</label>
              <input
                type="file"
                id="clinicLogo"
                name="clinicLogo"
                onChange={handleLogoChange}
                accept="image/png, image/jpeg, image/gif"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {formData.clinicLogo && (
                <div className="mt-4">
                  <img src={formData.clinicLogo} alt="Clinic Logo Preview" className="h-20 w-auto rounded border p-1" />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, clinicLogo: '' }))}
                    className="mt-2 text-xs text-red-600 hover:text-red-800"
                  >
                    Remove Logo
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Patient Information */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 border-b pb-4 mb-6">Patient Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputField label="File No." id="fileNo" value={formData.fileNo} onChange={handleChange} required readOnly={isEditing} />
          <InputField label="Name" id="name" value={formData.name} onChange={handleChange} placeholder="HIPAA Compliance: Fill on PDF" disabled />
          <InputField label="Date" id="date" value={formData.date} onChange={handleChange} type="date" required />
          
          {!isFollowUp && (
            <>
                <InputField label="Address" id="address" name="address" value={formData.address} onChange={handleChange} placeholder="HIPAA Compliance: Fill on PDF" className="md:col-span-2" disabled/>
                <InputField label="Phone" id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="HIPAA Compliance: Fill on PDF" disabled/>
            </>
          )}
          
          <InputField label="Occupation" id="occupation" value={formData.occupation} onChange={handleChange} />
          <InputField label="Date of Birth" id="dob" value={formData.dob} onChange={handleChange} type="date" disabled placeholder="HIPAA Compliance: Fill on PDF" />
          <InputField label="Age" id="age" value={formData.age} onChange={handleChange} type="number" unit="yrs old" required />
          <div>
            <label htmlFor="sex" className="block text-sm font-medium text-gray-700 mb-1">Sex <span className="text-red-500">*</span></label>
            <select
              id="sex"
              name="sex"
              value={formData.sex}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
            >
              <option value="">Select...</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vitals */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 border-b pb-4 mb-6">Vital Signs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                <div className="flex items-center space-x-2">
                    <InputField type="number" id="heightFt" name="heightFt" value={formData.heightFt} onChange={handleChange} unit="ft" label="" placeholder="Feet" />
                    <InputField type="number" id="heightIn" name="heightIn" value={formData.heightIn} onChange={handleChange} unit="in" label="" placeholder="Inches" />
                </div>
            </div>
            <InputField label="Weight" id="weight" value={formData.weight} onChange={handleChange} type="number" unit="lbs" />
            <InputField label="Temperature" id="temp" value={formData.temp} onChange={handleChange} type="number" unit="°F" />
            <div className="md:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Pressure</label>
                <div className="flex items-center space-x-2">
                    <input type="number" name="bpSystolic" value={formData.bpSystolic} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Systolic"/>
                    <span className="text-gray-500">/</span>
                    <input type="number" name="bpDiastolic" value={formData.bpDiastolic} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Diastolic"/>
                     <span className="text-sm text-gray-500 whitespace-nowrap">mmHg</span>
                </div>
            </div>
             <InputField label="Heart Rate" id="heartRate" value={formData.heartRate} onChange={handleChange} type="number" unit="BPM" />
             <div>
                <label htmlFor="heartRhythm" className="block text-sm font-medium text-gray-700 mb-1">Heart Rhythm</label>
                <select id="heartRhythm" name="heartRhythm" value={formData.heartRhythm} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  <option value="Normal">Normal</option>
                  <option value="Occasionally Irregular">Occasionally Irregular</option>
                  <option value="Constantly Irregular">Constantly Irregular</option>
                </select>
              </div>
            <div>
              <label htmlFor="lungRate" className="block text-sm font-medium text-gray-700 mb-1">Lung Rate</label>
              <div className="flex items-center">
                  <button type="button" onClick={() => handleLungRateChange(false)} className="px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100">-</button>
                  <input type="number" id="lungRate" name="lungRate" value={formData.lungRate} onChange={handleChange} className="w-full px-3 py-2 border-t border-b border-gray-300 text-center focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                  <span className="absolute right-10 pr-3 flex items-center text-sm text-gray-500 pointer-events-none">BPM</span>
                  <button type="button" onClick={() => handleLungRateChange(true)} className="px-3 py-2 border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100">+</button>
              </div>
            </div>
             <div>
                <label htmlFor="lungSound" className="block text-sm font-medium text-gray-700 mb-1">Lung Sound</label>
                <select id="lungSound" name="lungSound" value={formData.lungSound} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  <option value="Clear">Clear</option>
                  <option value="Wheezing">Wheezing</option>
                  <option value="Crackles">Crackles</option>
                  <option value="Rhonchi">Rhonchi</option>
                  <option value="Diminished">Diminished</option>
                  <option value="Apnea">Apnea</option>
                </select>
              </div>
        </div>
      </div>
      
      {/* Respond to Care */}
      {isFollowUp && (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-800 border-b pb-4 mb-6">Respond to Previous Care</h2>
          <div className="space-y-4">
            <RadioGroup 
                name="status"
                selectedValue={formData.respondToCare?.status || ''}
                onChange={handleRespondToCareChange}
                options={[
                    { value: 'Resolved', label: 'Resolved' },
                    { value: 'Improved', label: 'Improved' },
                    { value: 'Same', label: 'Same' },
                    { value: 'Worse', label: 'Worse' },
                ]}
            />
            {formData.respondToCare?.status === 'Improved' && (
                <div className="flex items-center space-x-2 pl-6">
                    <label htmlFor="improvedDays" className="text-sm font-medium text-gray-700">Good for</label>
                    <input
                        type="number"
                        id="improvedDays"
                        name="improvedDays"
                        value={formData.respondToCare?.improvedDays || ''}
                        onChange={handleRespondToCareChange}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <span className="text-sm text-gray-600">days</span>
                </div>
            )}
             <div className="pl-6">
                <label htmlFor="respondToCareNotes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                    id="respondToCareNotes"
                    name="notes"
                    value={formData.respondToCare?.notes || ''}
                    onChange={handleRespondToCareChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="e.g., Patient reports 10% improvement in pain..."
                />
            </div>
          </div>
        </div>
      )}

       {/* Chief Complaint */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 border-b pb-4 mb-6">Chief Complaint(s)</h2>
        <div className="space-y-4 mb-6">
            <label className="block text-sm font-medium text-gray-700">Select common complaints:</label>
            <CheckboxGroup options={commonComplaints} selected={formData.chiefComplaint.selectedComplaints} onChange={(val, checked) => handleArrayChange('chiefComplaint', 'selectedComplaints', val, checked)} />
        </div>
        <InputField label="Other Complaint" id="otherComplaint" name="otherComplaint" value={formData.chiefComplaint.otherComplaint} onChange={handleComplaintChange} placeholder="Enter other complaint if not listed" />
        
        <div className="mt-6 border-t pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <InputField label="Location" id="location" name="location" value={formData.chiefComplaint.location} onChange={handleComplaintChange} placeholder="Describe location details" />
              {activeLocationSuggestions.length > 0 && formData.chiefComplaint.selectedComplaints.includes('Back Pain') && (
                <div className="mt-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Suggestions:</label>
                  <div className="flex flex-wrap gap-2">
                     {activeLocationSuggestions.map(sugg => (
                      <label key={sugg} className="flex items-center text-sm">
                          <input type="checkbox"
                              checked={formData.chiefComplaint.locationDetails.includes(sugg)}
                              onChange={(e) => handleArrayChange('chiefComplaint', 'locationDetails', sugg, e.target.checked)}
                              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />
                          <span className="ml-2">{sugg}</span>
                      </label>
                     ))}
                  </div>
                </div>
              )}
            </div>
            <InputField label="Radiation" id="regionRadiation" name="regionRadiation" value={formData.chiefComplaint.regionRadiation} onChange={handleComplaintChange} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {!isFollowUp && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Onset</label>
                  <div className="flex items-center space-x-2">
                    <input type="number" name="onsetValue" value={formData.chiefComplaint.onsetValue} onChange={handleComplaintChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="e.g., 3" />
                    <select name="onsetUnit" value={formData.chiefComplaint.onsetUnit} onChange={handleComplaintChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                      <option value="">Select unit...</option>
                      <option value="days">Days</option>
                      <option value="weeks">Weeks</option>
                      <option value="months">Months</option>
                      <option value="years">Years</option>
                    </select>
                  </div>
                </div>
             )}
             <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                 <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">P/L = </span>
                    <input type="number" name="severityScore" value={formData.chiefComplaint.severityScore} onChange={handleComplaintChange} className="w-16 px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                     <span className="text-sm text-gray-600">/ 10</span>
                     <select name="severityDescription" value={formData.chiefComplaint.severityDescription} onChange={handleComplaintChange} className="flex-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                         <option value="">Select...</option>
                         <option value="Minimal">Minimal</option>
                         <option value="Slight">Slight</option>
                         <option value="Moderate">Moderate</option>
                         <option value="Severe">Severe</option>
                     </select>
                 </div>
            </div>
          </div>
          
          {!isFollowUp && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Aggravating Factors</label>
                <CheckboxGroup options={baseAggravatingFactors} selected={formData.chiefComplaint.provocation} onChange={(val, checked) => handleArrayChange('chiefComplaint', 'provocation', val, checked)} />
                <InputField label="Other Factors" id="provocationOther" name="provocationOther" value={formData.chiefComplaint.provocationOther} onChange={handleComplaintChange} className="mt-2" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alleviating Factors</label>
                <CheckboxGroup options={baseAlleviatingFactors} selected={formData.chiefComplaint.palliation} onChange={(val, checked) => handleArrayChange('chiefComplaint', 'palliation', val, checked)} />
                <InputField label="Other Factors" id="palliationOther" name="palliationOther" value={formData.chiefComplaint.palliationOther} onChange={handleComplaintChange} className="mt-2" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quality of Pain</label>
                <CheckboxGroup options={painQualities} selected={formData.chiefComplaint.quality} onChange={(val, checked) => handleArrayChange('chiefComplaint', 'quality', val, checked)} gridCols="grid-cols-2 md:grid-cols-4" />
                <InputField label="Other Quality" id="qualityOther" name="qualityOther" value={formData.chiefComplaint.qualityOther} onChange={handleComplaintChange} className="mt-2" />
              </div>
            </>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                <select id="frequency" name="frequency" value={formData.chiefComplaint.frequency} onChange={handleComplaintChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  <option value="">Select...</option>
                  <option value="Occasional">Occasional</option>
                  <option value="Intermittent">Intermittent</option>
                  <option value="Frequent">Frequent</option>
                  <option value="Constant">Constant</option>
                </select>
            </div>
            <InputField label="Timing" id="timing" name="timing" value={formData.chiefComplaint.timing} onChange={handleComplaintChange} placeholder="e.g., Worse in the afternoon" />
          </div>
          
          {!isFollowUp && (
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Possible Cause</label>
                <CheckboxGroup options={basePossibleCauses} selected={formData.chiefComplaint.possibleCause} onChange={(val, checked) => handleArrayChange('chiefComplaint', 'possibleCause', val, checked)} />
                <InputField label="Other Cause" id="possibleCauseOther" name="possibleCauseOther" value={formData.chiefComplaint.possibleCauseOther} onChange={handleComplaintChange} className="mt-2" />
            </div>
          )}

          <div>
             <label htmlFor="remark" className="block text-sm font-medium text-gray-700 mb-1">{isFollowUp ? 'Follow-up Notes / Changes' : 'Remark'}</label>
             <textarea
                id="remark"
                name="remark"
                value={formData.chiefComplaint.remark}
                onChange={handleComplaintChange}
                rows={isFollowUp ? 5 : 2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder={isFollowUp ? "Describe any changes in symptoms, progress, or new issues since the last visit." : ""}
             />
          </div>
        </div>
      </div>
      
       {/* Present Illness */}
      {!isFollowUp && (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center border-b pb-4 mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800">Present Illness</h2>
                  {needsHpiRegeneration && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-yellow-700">
                            <strong>주의:</strong> 주증상이 변경되었습니다. Present Illness를 다시 생성하시기 바랍니다.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <button 
                  type="button" 
                  onClick={handleGenerateHpi}
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:bg-blue-400 disabled:cursor-not-allowed"
                  disabled={isGeneratingHpi || isDiagnosing}
                >
                  {isGeneratingHpi ? 'Generating...' : needsHpiRegeneration ? 'Update with AI' : 'Regenerate with AI'}
                </button>
            </div>
             <div>
                <label htmlFor="presentIllness" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                    id="presentIllness"
                    name="presentIllness"
                    value={formData.chiefComplaint.presentIllness}
                    onChange={handleComplaintChange}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
                    placeholder="Click 'Regenerate with AI' to auto-generate based on Chief Complaint details, or fill in manually."
                ></textarea>
            </div>
            <div className="mt-6">
                <InputField label="Western Medical Diagnosis (Only if the patient brings it)" id="westernMedicalDiagnosis" name="westernMedicalDiagnosis" value={formData.chiefComplaint.westernMedicalDiagnosis} onChange={handleComplaintChange} />
            </div>
          </div>
      )}
      
       {/* Medical History */}
      {!isFollowUp && (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-800 border-b pb-4 mb-6">Medical History</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">Past Medical History</label>
              <div className="space-y-4">
                <CheckboxGroup options={pastMedicalHistoryOptions} selected={formData.medicalHistory.pastMedicalHistory} onChange={(val, checked) => handleArrayChange('medicalHistory', 'pastMedicalHistory', val, checked)} />
                <InputField label="Other" id="pastMedicalHistoryOther" name="pastMedicalHistoryOther" value={formData.medicalHistory.pastMedicalHistoryOther} onChange={handleMedicalHistoryChange} />
              </div>
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">Medication</label>
              <div className="space-y-4">
                <CheckboxGroup options={medicationOptions} selected={formData.medicalHistory.medication} onChange={(val, checked) => handleArrayChange('medicalHistory', 'medication', val, checked)} />
                <InputField label="Other" id="medicationOther" name="medicationOther" value={formData.medicalHistory.medicationOther} onChange={handleMedicalHistoryChange} />
              </div>
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">Family History</label>
              <div className="space-y-4">
                <CheckboxGroup options={familyHistoryOptions} selected={formData.medicalHistory.familyHistory} onChange={(val, checked) => handleArrayChange('medicalHistory', 'familyHistory', val, checked)} />
                <InputField label="Other" id="familyHistoryOther" name="familyHistoryOther" value={formData.medicalHistory.familyHistoryOther} onChange={handleMedicalHistoryChange} />
              </div>
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">Allergy</label>
              <div className="space-y-4">
                <CheckboxGroup options={allergyOptions} selected={formData.medicalHistory.allergy} onChange={(val, checked) => handleArrayChange('medicalHistory', 'allergy', val, checked)} />
                <InputField label="Other" id="allergyOther" name="allergyOther" value={formData.medicalHistory.allergyOther} onChange={handleMedicalHistoryChange} />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Review of Systems */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 border-b pb-4 mb-6">Review of Systems</h2>
        <div className="space-y-6">
            
            {/* Cold / Hot */}
            <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Cold / Hot</label>
                <RadioGroup name="coldHotSensation" selectedValue={formData.reviewOfSystems.coldHot.sensation} options={[{value: 'cold', label: 'Cold'}, {value: 'hot', label: 'Hot'}, {value: 'normal', label: 'Normal'}]} onChange={e => handleReviewOfSystemsChange('coldHot', 'sensation', e.target.value)} />
                {formData.reviewOfSystems.coldHot.sensation !== 'normal' && (
                  <div className="mt-2 pl-2">
                      <label className="block text-sm font-medium text-gray-600 mb-1">Body Parts:</label>
                      <CheckboxGroup options={['hand', 'fingers', 'feet', 'toes', 'knee', 'leg', 'waist', 'back', 'shoulder', 'whole body'].map(o=>({value: o, label: o}))} selected={formData.reviewOfSystems.coldHot.parts} onChange={(val, checked) => handleRosArrayChange('coldHot', 'parts', val, checked)} gridCols="grid-cols-2 md:grid-cols-4 lg:grid-cols-5" />
                  </div>
                )}
                <InputField label="Other" id="coldHotOther" name="other" value={formData.reviewOfSystems.coldHot.other} onChange={e => handleReviewOfSystemsChange('coldHot', 'other', e.target.value)} className="mt-2" />
            </div>

             {/* Sleep */}
             <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Sleep</label>
                 <InputField 
                    label="Duration"
                    id="sleepHours"
                    name="hours"
                    value={formData.reviewOfSystems.sleep.hours}
                    onChange={e => handleReviewOfSystemsChange('sleep', 'hours', e.target.value)}
                    placeholder="e.g., 7-8"
                    className="max-w-xs"
                    unit="hours / day"
                />
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Quality/Issues:</label>
                    <CheckboxGroup options={['O.K.', 'dream', 'nightmare', 'insomnia', 'easily wake up', 'hard to fall asleep', 'pain'].map(o=>({value: o, label: o}))} selected={[...formData.reviewOfSystems.sleep.quality, ...formData.reviewOfSystems.sleep.issues]} onChange={(val, checked) => {
                         const isQuality = ['O.K.', 'dream', 'nightmare'].includes(val);
                         if(isQuality) handleRosArrayChange('sleep', 'quality', val, checked);
                         else handleRosArrayChange('sleep', 'issues', val, checked);
                    }} gridCols="grid-cols-2 md:grid-cols-4" />
                </div>
             </div>

             {/* Sweat */}
             <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Sweat</label>
                <RadioGroup name="sweatPresent" selectedValue={formData.reviewOfSystems.sweat.present} options={[{value: 'yes', label: 'Yes'}, {value: 'no', label: 'No'}]} onChange={e => handleReviewOfSystemsChange('sweat', 'present', e.target.value)} />
                {formData.reviewOfSystems.sweat.present === 'yes' && (
                  <div className="mt-2 pl-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Time:</label>
                        <RadioGroup name="sweatTime" selectedValue={formData.reviewOfSystems.sweat.time} options={[{value: 'night', label: 'Night'}, {value: 'day', label: 'Day'}, {value: 'all time', label: 'Both'}]} onChange={e => handleReviewOfSystemsChange('sweat', 'time', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Parts:</label>
                        <CheckboxGroup options={['hand', 'foot', 'head', 'chest', 'whole body'].map(o=>({value: o, label: o}))} selected={formData.reviewOfSystems.sweat.parts} onChange={(val, checked) => handleRosArrayChange('sweat', 'parts', val, checked)} gridCols="grid-cols-2 md:grid-cols-3 lg:grid-cols-5" />
                    </div>
                  </div>
                )}
             </div>

             {/* Eye, Mouth, Throat */}
            <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Eye</label>
                <CheckboxGroup options={['normal', 'dry', 'sandy', 'redness', 'tearing', 'fatigued', 'pain', 'twitching', 'dizzy', 'vertigo'].map(o=>({value: o, label: o}))} selected={formData.reviewOfSystems.eye.symptoms} onChange={(val, checked) => handleRosArrayChange('eye', 'symptoms', val, checked)} gridCols="grid-cols-2 md:grid-cols-4 lg:grid-cols-5" />
            </div>
            <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Mouth / Tongue</label>
                <RadioGroup name="mouthSymptoms" selectedValue={formData.reviewOfSystems.mouthTongue.symptoms} options={[{value: 'dry', label: 'Dry'}, {value: 'normal', label: 'Normal'}, {value: 'wet (sputum, phlegm)', label: 'Wet (sputum, phlegm)'}]} onChange={e => handleReviewOfSystemsChange('mouthTongue', 'symptoms', e.target.value)} />
                <label className="block text-sm font-medium text-gray-600 mt-2 mb-1">Taste:</label>
                <RadioGroup name="mouthTaste" selectedValue={formData.reviewOfSystems.mouthTongue.taste} options={['sour', 'bitter', 'sweet', 'acrid', 'salty', 'bland'].map(o=>({value: o as any, label: o}))} onChange={e => handleReviewOfSystemsChange('mouthTongue', 'taste', e.target.value)} />
            </div>
            <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Throat / Nose</label>
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Symptoms:</label>
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                        {['normal', 'block', 'itchy', 'pain', 'mucus', 'sputum', 'bloody'].map(o => (
                            <div key={o} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`throatNose_${o}`}
                                    value={o}
                                    checked={formData.reviewOfSystems.throatNose.symptoms.includes(o)}
                                    onChange={(e) => handleRosArrayChange('throatNose', 'symptoms', o, e.target.checked)}
                                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <label htmlFor={`throatNose_${o}`} className="ml-2 text-sm text-gray-600">{o}</label>
                            </div>
                        ))}
                    </div>
                </div>
                {formData.reviewOfSystems.throatNose.symptoms.includes('mucus') && (
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-600 mb-1">Mucus Color:</label>
                        <div className="flex flex-wrap gap-x-6 gap-y-2">
                            {['clear', 'white', 'yellow', 'green'].map(o => (
                                <div key={o} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={`mucusColor_${o}`}
                                        value={o}
                                        checked={formData.reviewOfSystems.throatNose.mucusColor.includes(o)}
                                        onChange={(e) => handleRosArrayChange('throatNose', 'mucusColor', o, e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                    />
                                    <label htmlFor={`mucusColor_${o}`} className="ml-2 text-sm text-gray-600">{o}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

             {/* Edema */}
             <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Edema</label>
                <RadioGroup name="edemaPresent" selectedValue={formData.reviewOfSystems.edema.present} options={[{value: 'yes', label: 'Yes'}, {value: 'no', label: 'No'}]} onChange={e => handleReviewOfSystemsChange('edema', 'present', e.target.value)} />
                {formData.reviewOfSystems.edema.present === 'yes' && (
                  <div className="mt-2 pl-2">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Parts:</label>
                    <CheckboxGroup options={['face', 'hand', 'finger', 'leg', 'foot', 'chest', 'whole body'].map(o=>({value: o, label: o}))} selected={formData.reviewOfSystems.edema.parts} onChange={(val, checked) => handleRosArrayChange('edema', 'parts', val, checked)} gridCols="grid-cols-2 md:grid-cols-4" />
                    <InputField label="Other" id="edemaOther" value={formData.reviewOfSystems.edema.other} onChange={e => handleReviewOfSystemsChange('edema', 'other', e.target.value)} className="mt-2" />
                  </div>
                )}
             </div>
             
             {/* Drink, Digestion, Appetite */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-lg font-medium text-gray-700 mb-2">Drink</label>
                    <RadioGroup name="drinkThirsty" selectedValue={formData.reviewOfSystems.drink.thirsty} options={[{value: 'thirsty', label: 'Thirsty'}, {value: 'normal', label: 'Normal'}, {value: 'no', label: 'Not Thirsty'}]} onChange={e => handleReviewOfSystemsChange('drink', 'thirsty', e.target.value)} />
                    <label className="block text-sm font-medium text-gray-600 mt-2 mb-1">Preference:</label>
                    <RadioGroup name="drinkPreference" selectedValue={formData.reviewOfSystems.drink.preference} options={[{value: 'cold', label: 'Cold'}, {value: 'normal', label: 'Normal'}, {value: 'hot', label: 'Hot'}]} onChange={e => handleReviewOfSystemsChange('drink', 'preference', e.target.value)} />
                     <label className="block text-sm font-medium text-gray-600 mt-2 mb-1">Amount:</label>
                    <RadioGroup name="drinkAmount" selectedValue={formData.reviewOfSystems.drink.amount} options={[{value: 'sip', label: 'Sip'}, {value: 'washes mouth', label: 'Washes Mouth'}, {value: 'drink large amount', label: 'Large Amount'}]} onChange={e => handleReviewOfSystemsChange('drink', 'amount', e.target.value)} />
                </div>
                 <div>
                    <label className="block text-lg font-medium text-gray-700 mb-2">Digestion</label>
                    <CheckboxGroup options={['good', 'ok', 'sometimes bad', 'bad', 'pain', 'acid', 'bloat', 'blech', 'heart burn', 'bad breath', 'nausea'].map(o=>({value: o, label: o}))} selected={formData.reviewOfSystems.digestion.symptoms} onChange={(val, checked) => handleRosArrayChange('digestion', 'symptoms', val, checked)} gridCols="grid-cols-2" />
                </div>
                 <div>
                    <label className="block text-lg font-medium text-gray-700 mb-2">Appetite / Energy</label>
                     <RadioGroup name="appetite" selectedValue={formData.reviewOfSystems.appetiteEnergy.appetite} options={[{value: 'good', label: 'Good'}, {value: 'ok', label: 'OK'}, {value: 'sometimes bad', label: 'Sometimes Bad'}, {value: 'bad', label: 'Bad'}]} onChange={e => handleReviewOfSystemsChange('appetiteEnergy', 'appetite', e.target.value)} />
                     <div className="mt-2">
                        <InputField label="Energy ( /10)" type="number" id="energy" value={formData.reviewOfSystems.appetiteEnergy.energy} onChange={e => handleReviewOfSystemsChange('appetiteEnergy', 'energy', e.target.value)} />
                     </div>
                </div>
            </div>

            {/* Stool & Urine */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 border-t pt-6 mt-6">
                <div>
                    <label className="block text-lg font-medium text-gray-700 mb-2">Urination</label>
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Times a day" id="urineFrequencyDay" value={formData.reviewOfSystems.urine.frequencyDay} onChange={e => handleReviewOfSystemsChange('urine', 'frequencyDay', e.target.value)} />
                        <InputField label="Times at night" id="urineFrequencyNight" value={formData.reviewOfSystems.urine.frequencyNight} onChange={e => handleReviewOfSystemsChange('urine', 'frequencyNight', e.target.value)} />
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-600 mb-1">Amount:</label>
                        <RadioGroup name="urineAmount" selectedValue={formData.reviewOfSystems.urine.amount} options={[{value: 'much', label: 'Much'}, {value: 'normal', label: 'Normal'}, {value: 'scanty', label: 'Scanty'}]} onChange={e => handleReviewOfSystemsChange('urine', 'amount', e.target.value)} />
                    </div>
                    <InputField label="Color" id="urineColor" value={formData.reviewOfSystems.urine.color} onChange={e => handleReviewOfSystemsChange('urine', 'color', e.target.value)} className="mt-4"/>
                </div>

                <div>
                    <label className="block text-lg font-medium text-gray-700 mb-2">Stool</label>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                        <div className="flex items-center space-x-2">
                            <input type="text" name="stoolFrequencyValue" value={formData.reviewOfSystems.stool.frequencyValue} onChange={e => handleReviewOfSystemsChange('stool', 'frequencyValue', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="e.g., 1 or 2-3" />
                            <span className="text-gray-500">time(s) per</span>
                            <select name="stoolFrequencyUnit" value={formData.reviewOfSystems.stool.frequencyUnit} onChange={e => handleReviewOfSystemsChange('stool', 'frequencyUnit', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                              <option value="day">Day</option>
                              <option value="week">Week</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-600 mb-1">Form:</label>
                      <RadioGroup name="stoolForm" selectedValue={formData.reviewOfSystems.stool.form} options={[{value: 'normal', label: 'Normal'}, {value: 'diarrhea', label: 'Diarrhea'}, {value: 'constipation', label: 'Constipation'}, {value: 'alternating', label: 'Alternating'}]} onChange={e => handleReviewOfSystemsChange('stool', 'form', e.target.value)} />
                    </div>
                    <InputField label="Color" id="stoolColor" value={formData.reviewOfSystems.stool.color} onChange={e => handleReviewOfSystemsChange('stool', 'color', e.target.value)} className="mt-4"/>
                </div>
            </div>
            
            {/* Menstruation & Discharge (Conditional) */}
            {formData.sex === 'F' && (
                <div className="border-t pt-6 mt-6">
                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-2">Menstruation</label>
                        <RadioGroup 
                            name="menstruationStatus" 
                            selectedValue={formData.reviewOfSystems.menstruation.status} 
                            options={[
                                {value: 'regular', label: 'Regular'}, 
                                {value: 'irregular', label: 'Irregular'},
                                {value: 'menopause', label: 'Menopause'}
                            ]} 
                            onChange={e => handleReviewOfSystemsChange('menstruation', 'status', e.target.value)} />
                    </div>

                    {formData.reviewOfSystems.menstruation.status === 'menopause' ? (
                        <div className="mt-4">
                            <InputField label="Age at Menopause" id="menopauseAge" type="number" value={formData.reviewOfSystems.menstruation.menopauseAge} onChange={e => handleReviewOfSystemsChange('menstruation', 'menopauseAge', e.target.value)} />
                        </div>
                    ) : formData.reviewOfSystems.menstruation.status !== '' ? (
                        <div className="mt-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <InputField label="LMP (Last Menstrual Period)" id="lmp" type="date" value={formData.reviewOfSystems.menstruation.lmp} onChange={e => handleReviewOfSystemsChange('menstruation', 'lmp', e.target.value)} />
                                <InputField label="Cycle (days)" id="cycleLength" type="number" value={formData.reviewOfSystems.menstruation.cycleLength} onChange={e => handleReviewOfSystemsChange('menstruation', 'cycleLength', e.target.value)} />
                                <InputField label="Duration (days)" id="duration" type="number" value={formData.reviewOfSystems.menstruation.duration} onChange={e => handleReviewOfSystemsChange('menstruation', 'duration', e.target.value)} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Amount:</label>
                                    <RadioGroup name="menstruationAmount" selectedValue={formData.reviewOfSystems.menstruation.amount} options={[{value: 'normal', label: 'Normal'}, {value: 'scanty', label: 'Scanty'}, {value: 'heavy', label: 'Heavy'}]} onChange={e => handleReviewOfSystemsChange('menstruation', 'amount', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Color:</label>
                                    <RadioGroup name="menstruationColor" selectedValue={formData.reviewOfSystems.menstruation.color} options={[{value: 'fresh red', label: 'Fresh Red'}, {value: 'dark', label: 'Dark'}, {value: 'pale', label: 'Pale'}]} onChange={e => handleReviewOfSystemsChange('menstruation', 'color', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Clots:</label>
                                    <RadioGroup name="menstruationClots" selectedValue={formData.reviewOfSystems.menstruation.clots} options={[{value: 'yes', label: 'Yes'}, {value: 'no', label: 'No'}]} onChange={e => handleReviewOfSystemsChange('menstruation', 'clots', e.target.value)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Pain:</label>
                                <RadioGroup name="menstruationPain" selectedValue={formData.reviewOfSystems.menstruation.pain} options={[{value: 'yes', label: 'Yes'}, {value: 'no', label: 'No'}]} onChange={e => handleReviewOfSystemsChange('menstruation', 'pain', e.target.value)} />
                                    {formData.reviewOfSystems.menstruation.pain === 'yes' &&
                                        <InputField label="Pain Details" id="painDetails" value={formData.reviewOfSystems.menstruation.painDetails} onChange={e => handleReviewOfSystemsChange('menstruation', 'painDetails', e.target.value)} className="mt-2" />
                                    }
                                </div>
                                <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">PMS:</label>
                                <CheckboxGroup options={['breast tenderness', 'irritability', 'bloating', 'headache'].map(o=>({value: o, label: o}))} selected={formData.reviewOfSystems.menstruation.pms} onChange={(val, checked) => handleRosArrayChange('menstruation', 'pms', val, checked)} gridCols="grid-cols-2" />
                                </div>
                            </div>
                        </div>
                    ) : null}

                    <div className="mt-6">
                      <label className="block text-lg font-medium text-gray-700 mb-2">Discharge</label>
                       <RadioGroup 
                            name="dischargePresent" 
                            selectedValue={formData.reviewOfSystems.discharge.present} 
                            options={[{value: 'yes', label: 'Yes'}, {value: 'no', label: 'No'}]} 
                            onChange={e => handleReviewOfSystemsChange('discharge', 'present', e.target.value)} 
                        />
                        {formData.reviewOfSystems.discharge.present === 'yes' && (
                            <div className="mt-2 pl-2">
                                <CheckboxGroup options={['watery', 'clear', 'yellow', 'white', 'sticky', 'no smell', 'foul smell'].map(o=>({value: o, label: o}))} selected={formData.reviewOfSystems.discharge.symptoms} onChange={(val, checked) => handleRosArrayChange('discharge', 'symptoms', val, checked)} gridCols="grid-cols-2 md:grid-cols-4" />
                                <InputField label="Other" id="dischargeOther" value={formData.reviewOfSystems.discharge.other} onChange={e => handleReviewOfSystemsChange('discharge', 'other', e.target.value)} className="mt-2" />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
      </div>
      
      {/* Inspection of the Tongue */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 border-b pb-4 mb-6">Inspection of the Tongue</h2>
        <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">BODY</h3>
              <div className="pl-2 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Color (Single Choice):</label>
                  <RadioGroup options={tongueBodyColorOptions} name="tongueBodyColor" selectedValue={formData.tongue.body.color} onChange={e => handleTongueBodyChange('color', e.target.value)} />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Color Modifiers (Multi-Choice):</label>
                  <CheckboxGroup options={tongueBodyColorModifierOptions} selected={formData.tongue.body.colorModifiers} onChange={(val, checked) => handleTongueBodyArrayChange('colorModifiers', val, checked)} gridCols="grid-cols-2 sm:grid-cols-4 lg:grid-cols-6" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Shape (Multi-Choice):</label>
                  <CheckboxGroup options={tongueBodyShapeOptions} selected={formData.tongue.body.shape} onChange={(val, checked) => handleTongueBodyArrayChange('shape', val, checked)} gridCols="grid-cols-2 sm:grid-cols-3 md:grid-cols-4" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Shape Modifiers (Multi-Choice):</label>
                  <CheckboxGroup options={tongueBodyShapeModifierOptions} selected={formData.tongue.body.shapeModifiers} onChange={(val, checked) => handleTongueBodyArrayChange('shapeModifiers', val, checked)} gridCols="grid-cols-2 sm:grid-cols-4 lg:grid-cols-6" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Locations (Multi-Choice):</label>
                    <CheckboxGroup 
                        options={tongueLocationOptions} 
                        selected={formData.tongue.body.locations} 
                        onChange={(val, checked) => handleTongueBodyArrayChange('locations', val, checked)} 
                        gridCols="grid-cols-1 sm:grid-cols-3" 
                    />
                    <InputField
                        label="Location Comments"
                        id="locationComments"
                        name="locationComments"
                        value={formData.tongue.body.locationComments}
                        onChange={(e) => handleTongueBodyChange('locationComments', e.target.value)}
                        placeholder="e.g., Heart (Tip) is cracked"
                        className="mt-4"
                    />
                </div>
              </div>
            </div>
             <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">COATING</h3>
              <div className="pl-2 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Color (Single Choice):</label>
                  <RadioGroup options={tongueCoatingColorOptions} name="tongueCoatingColor" selectedValue={formData.tongue.coating.color} onChange={e => handleTongueCoatingChange('color', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Quality (Max 2 Choices):</label>
                  <CheckboxGroup options={tongueCoatingQualityOptions} selected={formData.tongue.coating.quality} onChange={(val, checked) => handleTongueCoatingArrayChange('quality', val, checked)} gridCols="grid-cols-2 sm:grid-cols-4 lg:grid-cols-6" />
                </div>
                 <div>
                  <label htmlFor="tongueCoatingNotes" className="block text-sm font-medium text-gray-600 mb-1">Notes:</label>
                  <textarea
                    id="tongueCoatingNotes"
                    value={formData.tongue.coating.notes}
                    onChange={(e) => handleTongueCoatingChange('notes', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="e.g., Geographic, covering Stomach/Spleen area"
                  />
                </div>
              </div>
            </div>
        </div>
      </div>
      
      {/* Pulse Diagnosis */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 border-b pb-4 mb-6">Pulse Diagnosis</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Overall Qualities</label>
            <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-2 border rounded-md bg-slate-50">
                        <h4 className="text-sm font-semibold text-center text-gray-600 mb-2">부/침 (Floating/Sinking)</h4>
                        <CheckboxGroup options={pulseQualityPairs.buChim} selected={formData.pulse.overall} onChange={handlePulseOverallChange} gridCols="grid-cols-2" />
                    </div>
                    <div className="p-2 border rounded-md bg-slate-50">
                        <h4 className="text-sm font-semibold text-center text-gray-600 mb-2">지/삭 (Slow/Rapid)</h4>
                        <CheckboxGroup options={pulseQualityPairs.jiSak} selected={formData.pulse.overall} onChange={handlePulseOverallChange} gridCols="grid-cols-2" />
                    </div>
                    <div className="p-2 border rounded-md bg-slate-50">
                        <h4 className="text-sm font-semibold text-center text-gray-600 mb-2">허/실 (Deficient/Excess)</h4>
                        <CheckboxGroup options={pulseQualityPairs.heoSil} selected={formData.pulse.overall} onChange={handlePulseOverallChange} gridCols="grid-cols-2" />
                    </div>
                </div>
                <div className="border-t pt-4">
                     <h4 className="text-md font-semibold text-gray-600 mb-2">실맥 (Excess Pulse)</h4>
                     <CheckboxGroup
                      options={excessPulseQualities}
                      selected={formData.pulse.overall}
                      onChange={(val, checked) => handlePulseOverallChange(val, checked)}
                      gridCols="grid-cols-2 sm:grid-cols-3 md:grid-cols-5"
                    />
                </div>
                 <div className="border-t pt-4">
                     <h4 className="text-md font-semibold text-gray-600 mb-2">허맥 (Deficient Pulse)</h4>
                     <CheckboxGroup
                      options={deficientPulseQualities}
                      selected={formData.pulse.overall}
                      onChange={(val, checked) => handlePulseOverallChange(val, checked)}
                      gridCols="grid-cols-2 sm:grid-cols-3 md:grid-cols-5"
                    />
                </div>
                <div className="border-t pt-4">
                     <h4 className="text-md font-semibold text-gray-600 mb-2">Other Qualities</h4>
                     <CheckboxGroup
                      options={otherRemainingPulseQualities}
                      selected={formData.pulse.overall}
                      onChange={(val, checked) => handlePulseOverallChange(val, checked)}
                      gridCols="grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
                    />
                </div>
            </div>
          </div>
          <div className="border-t pt-6">
              <label htmlFor="pulseNotes" className="block text-lg font-medium text-gray-700 mb-2">Pulse Notes / Details</label>
              <textarea
                id="pulseNotes"
                name="pulseNotes"
                value={formData.pulse.notes}
                onChange={handlePulseNotesChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter any specific positional findings or other pulse-related notes here."
              />
          </div>
        </div>
      </div>

       {/* Diagnosis & Treatment */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center border-b pb-4 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Diagnosis & Treatment</h2>
            <button 
              type="button" 
              onClick={handleGenerateDiagnosis}
              className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200 disabled:bg-teal-400 disabled:cursor-not-allowed"
              disabled={isDiagnosing}
            >
              {isDiagnosing ? 'Generating...' : 'Generate AI Diagnosis & Treatment Plan'}
            </button>
        </div>
        <div className="space-y-6">
            <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Acupuncture Method</label>
                <CheckboxGroup
                    options={acupunctureMethodOptions}
                    selected={formData.diagnosisAndTreatment.acupunctureMethod}
                    onChange={(val, checked) => handleDiagnosisArrayChange('acupunctureMethod', val as AcupunctureMethod, checked)}
                    gridCols="grid-cols-2 md:grid-cols-3"
                />
                {formData.diagnosisAndTreatment.acupunctureMethod.includes('Other') && (
                    <InputField 
                        label="Specify Other Method" 
                        id="acupunctureMethodOther" 
                        name="acupunctureMethodOther" 
                        value={formData.diagnosisAndTreatment.acupunctureMethodOther || ''} 
                        onChange={handleDiagnosisChange} 
                        className="mt-2" 
                    />
                )}
            </div>
            
            <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Eight Principles</label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
                    <RadioGroup name="exteriorInterior" selectedValue={formData.diagnosisAndTreatment.eightPrinciples.exteriorInterior} onChange={handleEightPrincipleChange} options={[{value: 'Exterior', label: 'Exterior'}, {value: 'Interior', label: 'Interior'}]} />
                    <RadioGroup name="heatCold" selectedValue={formData.diagnosisAndTreatment.eightPrinciples.heatCold} onChange={handleEightPrincipleChange} options={[{value: 'Heat', label: 'Heat'}, {value: 'Cold', label: 'Cold'}]} />
                    <RadioGroup name="excessDeficient" selectedValue={formData.diagnosisAndTreatment.eightPrinciples.excessDeficient} onChange={handleEightPrincipleChange} options={[{value: 'Excess', label: 'Excess'}, {value: 'Deficient', label: 'Deficient'}]} />
                    <RadioGroup name="yangYin" selectedValue={formData.diagnosisAndTreatment.eightPrinciples.yangYin} onChange={handleEightPrincipleChange} options={[{value: 'Yang', label: 'Yang'}, {value: 'Yin', label: 'Yin'}]} />
                </div>
            </div>
            
             <InputField label="Etiology" id="etiology" name="etiology" value={formData.diagnosisAndTreatment.etiology} onChange={handleDiagnosisChange} />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="TCM Diagnosis (Syndrome/Differentiation)" id="tcmDiagnosis" name="tcmDiagnosis" value={formData.diagnosisAndTreatment.tcmDiagnosis} onChange={handleDiagnosisChange} />
                <InputField label="Treatment Principle" id="treatmentPrinciple" name="treatmentPrinciple" value={formData.diagnosisAndTreatment.treatmentPrinciple} onChange={handleDiagnosisChange} />
             </div>
             <div>
                <label htmlFor="acupuncturePoints" className="block text-sm font-medium text-gray-700 mb-1">Acupuncture Points</label>
                <textarea id="acupuncturePoints" name="acupuncturePoints" value={formData.diagnosisAndTreatment.acupuncturePoints} onChange={handleDiagnosisChange} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
            </div>
            <div>
                <label htmlFor="herbalTreatment" className="block text-sm font-medium text-gray-700 mb-1">Herbal Treatment</label>
                <textarea id="herbalTreatment" name="herbalTreatment" value={formData.diagnosisAndTreatment.herbalTreatment} onChange={handleDiagnosisChange} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
            </div>
            <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Other Treatments</label>
                <RadioGroup 
                    name="selectedTreatment"
                    selectedValue={formData.diagnosisAndTreatment.selectedTreatment}
                    onChange={handleOtherTreatmentChange}
                    options={otherTreatmentOptions}
                    className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2"
                />
                {(formData.diagnosisAndTreatment.selectedTreatment === 'Other' || formData.diagnosisAndTreatment.selectedTreatment === 'Auricular Acupuncture') && (
                    <InputField 
                        label={formData.diagnosisAndTreatment.selectedTreatment === 'Other' ? "Specify Other Treatment" : "Specify Points/Seeds"} 
                        id="otherTreatmentText" 
                        name="otherTreatmentText" 
                        value={formData.diagnosisAndTreatment.otherTreatmentText} 
                        onChange={handleDiagnosisChange} 
                        className="mt-2" 
                    />
                )}
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="ICD" id="icd" name="icd" value={formData.diagnosisAndTreatment.icd} onChange={handleDiagnosisChange} />
                <InputField label="CPT" id="cpt" name="cpt" value={formData.diagnosisAndTreatment.cpt} onChange={handleDiagnosisChange} />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Therapist Name" id="therapistName" name="therapistName" value={formData.diagnosisAndTreatment.therapistName} onChange={handleDiagnosisChange} />
                <InputField label="Lic #" id="therapistLicNo" name="therapistLicNo" value={formData.diagnosisAndTreatment.therapistLicNo} onChange={handleDiagnosisChange} />
             </div>
        </div>
      </div>


      <div className="flex justify-between items-center pt-8 mt-8 border-t">
        <button 
            type="button" 
            onClick={handleBack} 
            className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors duration-200"
        >
          Back to List
        </button>
        <div className="flex items-center space-x-4">
          <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:bg-indigo-400 disabled:cursor-not-allowed" disabled={isGeneratingHpi || isDiagnosing}>
            Save & View Chart
          </button>
        </div>
      </div>
    </form>
  );
};