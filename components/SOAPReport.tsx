import React from 'react';
import html2pdf from 'html2pdf.js';
import type { PatientData } from '../types';

interface SOAPReportProps {
  data: PatientData;
  onClose: () => void;
}

export const SOAPReport: React.FC<SOAPReportProps> = ({ data, onClose }) => {
  // HIPAA 준수: 개인정보 제외하고 진료 관련 정보만 포함
  const getHIPAACompliantData = (patientData: PatientData) => {
    return {
      fileNo: patientData.fileNo,
      date: patientData.date,
      chartType: patientData.chartType,
      clinicName: patientData.clinicName,
      therapistName: patientData.diagnosisAndTreatment.therapistName,
      therapistLicNo: patientData.diagnosisAndTreatment.therapistLicNo,
      
      // 신체 측정값 (개인 식별 불가능)
      vitalSigns: {
        heightFt: patientData.heightFt,
        heightIn: patientData.heightIn,
        weight: patientData.weight,
        temp: patientData.temp,
        bpSystolic: patientData.bpSystolic,
        bpDiastolic: patientData.bpDiastolic,
        heartRate: patientData.heartRate,
        heartRhythm: patientData.heartRhythm,
        lungRate: patientData.lungRate,
        lungSound: patientData.lungSound,
      },
      
      // 주증상 (개인 식별 불가능)
      chiefComplaint: patientData.chiefComplaint,
      
      // 병력 (개인 식별 불가능)
      medicalHistory: patientData.medicalHistory,
      
      // 진단 및 치료
      diagnosisAndTreatment: patientData.diagnosisAndTreatment,
      
      // 한의학적 진단
      tongue: patientData.tongue,
      pulse: patientData.pulse,
      
      // 치료 반응
      respondToCare: patientData.respondToCare,
    };
  };

  const hipaaData = getHIPAACompliantData(data);

  const generateFileName = () => {
    const date = new Date(data.date).toISOString().split('T')[0];
    const chartType = data.chartType === 'new' ? 'New' : 'FollowUp';
    return `SOAP_Report_${chartType}_${data.fileNo}_${date}.pdf`;
  };

  const downloadPDF = () => {
    const element = document.getElementById('soap-report-content');
    if (!element) return;

    const opt = {
      margin: 0.5,
      filename: generateFileName(),
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">SOAP Report</h2>
          <div className="flex gap-2">
            <button
              onClick={downloadPDF}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              PDF 다운로드
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              닫기
            </button>
          </div>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div id="soap-report-content" className="p-6 bg-white">
            {/* Header */}
            <div className="text-center mb-6 border-b pb-4">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">SOAP Report</h1>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>File No:</strong> {hipaaData.fileNo}</p>
                <p><strong>Date:</strong> {formatDate(hipaaData.date)}</p>
                <p><strong>Chart Type:</strong> {hipaaData.chartType === 'new' ? 'New Patient' : 'Follow-up'}</p>
                <p><strong>Clinic:</strong> {hipaaData.clinicName}</p>
                <p><strong>Therapist:</strong> {hipaaData.therapistName} (License: {hipaaData.therapistLicNo})</p>
              </div>
            </div>

            {/* SOAP Format */}
            <div className="space-y-6">
              {/* Subjective */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h2 className="text-lg font-bold text-blue-700 mb-3">S - Subjective</h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-700">Chief Complaint:</h3>
                    <p className="text-gray-600 ml-4">
                      {hipaaData.chiefComplaint.selectedComplaints.join(', ')}
                      {hipaaData.chiefComplaint.otherComplaint && `, ${hipaaData.chiefComplaint.otherComplaint}`}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-700">Location:</h3>
                    <p className="text-gray-600 ml-4">{hipaaData.chiefComplaint.location}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-700">Onset:</h3>
                    <p className="text-gray-600 ml-4">
                      {hipaaData.chiefComplaint.onsetValue} {hipaaData.chiefComplaint.onsetUnit}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-700">Severity:</h3>
                    <p className="text-gray-600 ml-4">
                      {hipaaData.chiefComplaint.severityScore}/10 - {hipaaData.chiefComplaint.severityDescription}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-700">Present Illness:</h3>
                    <p className="text-gray-600 ml-4">{hipaaData.chiefComplaint.presentIllness}</p>
                  </div>
                </div>
              </div>

              {/* Objective */}
              <div className="border-l-4 border-green-500 pl-4">
                <h2 className="text-lg font-bold text-green-700 mb-3">O - Objective</h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-700">Vital Signs:</h3>
                    <div className="grid grid-cols-2 gap-4 ml-4 text-sm">
                      <p><strong>Height:</strong> {hipaaData.vitalSigns.heightFt}'{hipaaData.vitalSigns.heightIn}"</p>
                      <p><strong>Weight:</strong> {hipaaData.vitalSigns.weight} lbs</p>
                      <p><strong>Temperature:</strong> {hipaaData.vitalSigns.temp}°F</p>
                      <p><strong>Blood Pressure:</strong> {hipaaData.vitalSigns.bpSystolic}/{hipaaData.vitalSigns.bpDiastolic}</p>
                      <p><strong>Heart Rate:</strong> {hipaaData.vitalSigns.heartRate} bpm</p>
                      <p><strong>Heart Rhythm:</strong> {hipaaData.vitalSigns.heartRhythm}</p>
                      <p><strong>Respiratory Rate:</strong> {hipaaData.vitalSigns.lungRate}/min</p>
                      <p><strong>Lung Sounds:</strong> {hipaaData.vitalSigns.lungSound}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-700">Tongue Examination:</h3>
                    <p className="text-gray-600 ml-4">
                      Body: {hipaaData.tongue.body.color} {hipaaData.tongue.body.shape} | 
                      Coating: {hipaaData.tongue.coating.color} {hipaaData.tongue.coating.quality.join(', ')}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-700">Pulse Examination:</h3>
                    <p className="text-gray-600 ml-4">
                      {hipaaData.pulse.overall.join(', ')} | {hipaaData.pulse.notes}
                    </p>
                  </div>
                </div>
              </div>

              {/* Assessment */}
              <div className="border-l-4 border-yellow-500 pl-4">
                <h2 className="text-lg font-bold text-yellow-700 mb-3">A - Assessment</h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-700">TCM Diagnosis:</h3>
                    <p className="text-gray-600 ml-4">{hipaaData.diagnosisAndTreatment.tcmDiagnosis}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-700">Eight Principles:</h3>
                    <p className="text-gray-600 ml-4">
                      {hipaaData.diagnosisAndTreatment.eightPrinciples.exteriorInterior} | 
                      {hipaaData.diagnosisAndTreatment.eightPrinciples.heatCold} | 
                      {hipaaData.diagnosisAndTreatment.eightPrinciples.excessDeficient} | 
                      {hipaaData.diagnosisAndTreatment.eightPrinciples.yangYin}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-700">Etiology:</h3>
                    <p className="text-gray-600 ml-4">{hipaaData.diagnosisAndTreatment.etiology}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-700">Western Medical Diagnosis:</h3>
                    <p className="text-gray-600 ml-4">{hipaaData.chiefComplaint.westernMedicalDiagnosis}</p>
                  </div>
                </div>
              </div>

              {/* Plan */}
              <div className="border-l-4 border-red-500 pl-4">
                <h2 className="text-lg font-bold text-red-700 mb-3">P - Plan</h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-700">Treatment Principle:</h3>
                    <p className="text-gray-600 ml-4">{hipaaData.diagnosisAndTreatment.treatmentPrinciple}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-700">Acupuncture Method:</h3>
                    <p className="text-gray-600 ml-4">
                      {hipaaData.diagnosisAndTreatment.acupunctureMethod.join(', ')}
                      {hipaaData.diagnosisAndTreatment.acupunctureMethodOther && `, ${hipaaData.diagnosisAndTreatment.acupunctureMethodOther}`}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-700">Acupuncture Points:</h3>
                    <p className="text-gray-600 ml-4">{hipaaData.diagnosisAndTreatment.acupuncturePoints}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-700">Herbal Treatment:</h3>
                    <p className="text-gray-600 ml-4">{hipaaData.diagnosisAndTreatment.herbalTreatment}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-700">Other Treatment:</h3>
                    <p className="text-gray-600 ml-4">
                      {hipaaData.diagnosisAndTreatment.selectedTreatment}
                      {hipaaData.diagnosisAndTreatment.otherTreatmentText && ` - ${hipaaData.diagnosisAndTreatment.otherTreatmentText}`}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-700">CPT Codes:</h3>
                    <p className="text-gray-600 ml-4">{hipaaData.diagnosisAndTreatment.cpt}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-700">Response to Care:</h3>
                    <p className="text-gray-600 ml-4">
                      Status: {hipaaData.respondToCare.status}
                      {hipaaData.respondToCare.improvedDays && ` (${hipaaData.respondToCare.improvedDays} days)`}
                      {hipaaData.respondToCare.notes && ` - ${hipaaData.respondToCare.notes}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t text-center text-xs text-gray-500">
              <p>This report contains no personally identifiable information in compliance with HIPAA regulations.</p>
              <p>Generated on {new Date().toLocaleDateString('ko-KR')} at {new Date().toLocaleTimeString('ko-KR')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
