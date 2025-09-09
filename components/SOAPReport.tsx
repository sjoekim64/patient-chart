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

            {/* Narrative SOAP Format */}
            <div className="space-y-6">
              {/* Subjective */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h2 className="text-lg font-bold text-blue-700 mb-3">S - Subjective</h2>
                <div className="text-gray-700 leading-relaxed">
                  <p className="mb-3">
                    환자는 <strong>{hipaaData.chiefComplaint.selectedComplaints.join(', ')}{hipaaData.chiefComplaint.otherComplaint && `, ${hipaaData.chiefComplaint.otherComplaint}`}</strong>을(를) 주증상으로 호소합니다.
                    {hipaaData.chiefComplaint.location && ` 증상은 주로 ${hipaaData.chiefComplaint.location}에 국한되어 있으며,`}
                    {hipaaData.chiefComplaint.onsetValue && hipaaData.chiefComplaint.onsetUnit && ` 약 ${hipaaData.chiefComplaint.onsetValue} ${hipaaData.chiefComplaint.onsetUnit} 전부터 시작되었습니다.`}
                  </p>
                  
                  {hipaaData.chiefComplaint.severityScore && (
                    <p className="mb-3">
                      통증의 강도는 10점 척도에서 <strong>{hipaaData.chiefComplaint.severityScore}점</strong>으로 평가되며, 
                      {hipaaData.chiefComplaint.severityDescription && ` ${hipaaData.chiefComplaint.severityDescription}한 상태입니다.`}
                    </p>
                  )}
                  
                  {hipaaData.chiefComplaint.presentIllness && (
                    <p className="mb-3">
                      <strong>현재 병력:</strong> {hipaaData.chiefComplaint.presentIllness}
                    </p>
                  )}
                  
                  {hipaaData.chiefComplaint.provocation.length > 0 && (
                    <p className="mb-3">
                      증상이 악화되는 상황: {hipaaData.chiefComplaint.provocation.join(', ')}
                      {hipaaData.chiefComplaint.provocationOther && `, ${hipaaData.chiefComplaint.provocationOther}`}
                    </p>
                  )}
                  
                  {hipaaData.chiefComplaint.palliation.length > 0 && (
                    <p className="mb-3">
                      증상이 완화되는 요인: {hipaaData.chiefComplaint.palliation.join(', ')}
                      {hipaaData.chiefComplaint.palliationOther && `, ${hipaaData.chiefComplaint.palliationOther}`}
                    </p>
                  )}
                  
                  {hipaaData.chiefComplaint.quality.length > 0 && (
                    <p className="mb-3">
                      증상의 성질: {hipaaData.chiefComplaint.quality.join(', ')}
                      {hipaaData.chiefComplaint.qualityOther && `, ${hipaaData.chiefComplaint.qualityOther}`}
                    </p>
                  )}
                </div>
              </div>

              {/* Objective */}
              <div className="border-l-4 border-green-500 pl-4">
                <h2 className="text-lg font-bold text-green-700 mb-3">O - Objective</h2>
                <div className="text-gray-700 leading-relaxed">
                  <p className="mb-3">
                    <strong>신체 측정:</strong> 
                    {hipaaData.vitalSigns.heightFt && hipaaData.vitalSigns.heightIn && ` 신장 ${hipaaData.vitalSigns.heightFt}피트 ${hipaaData.vitalSigns.heightIn}인치,`}
                    {hipaaData.vitalSigns.weight && ` 체중 ${hipaaData.vitalSigns.weight}파운드,`}
                    {hipaaData.vitalSigns.temp && ` 체온 ${hipaaData.vitalSigns.temp}°F,`}
                    {hipaaData.vitalSigns.bpSystolic && hipaaData.vitalSigns.bpDiastolic && ` 혈압 ${hipaaData.vitalSigns.bpSystolic}/${hipaaData.vitalSigns.bpDiastolic}mmHg,`}
                    {hipaaData.vitalSigns.heartRate && ` 심박수 ${hipaaData.vitalSigns.heartRate}회/분,`}
                    {hipaaData.vitalSigns.heartRhythm && ` 심박 리듬 ${hipaaData.vitalSigns.heartRhythm},`}
                    {hipaaData.vitalSigns.lungRate && ` 호흡수 ${hipaaData.vitalSigns.lungRate}회/분,`}
                    {hipaaData.vitalSigns.lungSound && ` 폐음 ${hipaaData.vitalSigns.lungSound}로 측정되었습니다.`}
                  </p>
                  
                  <p className="mb-3">
                    <strong>설진:</strong> 
                    {hipaaData.tongue.body.color && ` 설체는 ${hipaaData.tongue.body.color}색이며 ${hipaaData.tongue.body.shape}한 형태를 보입니다.`}
                    {hipaaData.tongue.coating.color && ` 설태는 ${hipaaData.tongue.coating.color}색으로 ${hipaaData.tongue.coating.quality.join(', ')}한 상태입니다.`}
                    {hipaaData.tongue.coating.notes && ` ${hipaaData.tongue.coating.notes}`}
                  </p>
                  
                  <p className="mb-3">
                    <strong>맥진:</strong> 
                    {hipaaData.pulse.overall.length > 0 && ` 맥상은 ${hipaaData.pulse.overall.join(', ')}으로 나타났습니다.`}
                    {hipaaData.pulse.notes && ` ${hipaaData.pulse.notes}`}
                  </p>
                </div>
              </div>

              {/* Assessment */}
              <div className="border-l-4 border-yellow-500 pl-4">
                <h2 className="text-lg font-bold text-yellow-700 mb-3">A - Assessment</h2>
                <div className="text-gray-700 leading-relaxed">
                  {hipaaData.diagnosisAndTreatment.tcmDiagnosis && (
                    <p className="mb-3">
                      <strong>한의학 진단:</strong> {hipaaData.diagnosisAndTreatment.tcmDiagnosis}
                    </p>
                  )}
                  
                  {(hipaaData.diagnosisAndTreatment.eightPrinciples.exteriorInterior || 
                    hipaaData.diagnosisAndTreatment.eightPrinciples.heatCold || 
                    hipaaData.diagnosisAndTreatment.eightPrinciples.excessDeficient || 
                    hipaaData.diagnosisAndTreatment.eightPrinciples.yangYin) && (
                    <p className="mb-3">
                      <strong>팔강 변증:</strong> 
                      {hipaaData.diagnosisAndTreatment.eightPrinciples.exteriorInterior && ` 표리에서는 ${hipaaData.diagnosisAndTreatment.eightPrinciples.exteriorInterior},`}
                      {hipaaData.diagnosisAndTreatment.eightPrinciples.heatCold && ` 한열에서는 ${hipaaData.diagnosisAndTreatment.eightPrinciples.heatCold},`}
                      {hipaaData.diagnosisAndTreatment.eightPrinciples.excessDeficient && ` 허실에서는 ${hipaaData.diagnosisAndTreatment.eightPrinciples.excessDeficient},`}
                      {hipaaData.diagnosisAndTreatment.eightPrinciples.yangYin && ` 음양에서는 ${hipaaData.diagnosisAndTreatment.eightPrinciples.yangYin}으로 판단됩니다.`}
                    </p>
                  )}
                  
                  {hipaaData.diagnosisAndTreatment.etiology && (
                    <p className="mb-3">
                      <strong>병인:</strong> {hipaaData.diagnosisAndTreatment.etiology}
                    </p>
                  )}
                  
                  {hipaaData.chiefComplaint.westernMedicalDiagnosis && (
                    <p className="mb-3">
                      <strong>서양의학 진단:</strong> {hipaaData.chiefComplaint.westernMedicalDiagnosis}
                    </p>
                  )}
                </div>
              </div>

              {/* Plan */}
              <div className="border-l-4 border-red-500 pl-4">
                <h2 className="text-lg font-bold text-red-700 mb-3">P - Plan</h2>
                <div className="text-gray-700 leading-relaxed">
                  {hipaaData.diagnosisAndTreatment.treatmentPrinciple && (
                    <p className="mb-3">
                      <strong>치료 원칙:</strong> {hipaaData.diagnosisAndTreatment.treatmentPrinciple}
                    </p>
                  )}
                  
                  {(hipaaData.diagnosisAndTreatment.acupunctureMethod.length > 0 || hipaaData.diagnosisAndTreatment.acupunctureMethodOther) && (
                    <p className="mb-3">
                      <strong>침구 치료:</strong> 
                      {hipaaData.diagnosisAndTreatment.acupunctureMethod.length > 0 && ` ${hipaaData.diagnosisAndTreatment.acupunctureMethod.join(', ')} 방법을 사용하며,`}
                      {hipaaData.diagnosisAndTreatment.acupunctureMethodOther && ` ${hipaaData.diagnosisAndTreatment.acupunctureMethodOther} 방법도 병행합니다.`}
                    </p>
                  )}
                  
                  {hipaaData.diagnosisAndTreatment.acupuncturePoints && (
                    <p className="mb-3">
                      <strong>침구 혈위:</strong> {hipaaData.diagnosisAndTreatment.acupuncturePoints}
                    </p>
                  )}
                  
                  {hipaaData.diagnosisAndTreatment.herbalTreatment && (
                    <p className="mb-3">
                      <strong>한약 치료:</strong> {hipaaData.diagnosisAndTreatment.herbalTreatment}
                    </p>
                  )}
                  
                  {(hipaaData.diagnosisAndTreatment.selectedTreatment !== 'None' || hipaaData.diagnosisAndTreatment.otherTreatmentText) && (
                    <p className="mb-3">
                      <strong>기타 치료:</strong> 
                      {hipaaData.diagnosisAndTreatment.selectedTreatment !== 'None' && ` ${hipaaData.diagnosisAndTreatment.selectedTreatment}`}
                      {hipaaData.diagnosisAndTreatment.otherTreatmentText && ` - ${hipaaData.diagnosisAndTreatment.otherTreatmentText}`}
                    </p>
                  )}
                  
                  {hipaaData.diagnosisAndTreatment.cpt && (
                    <p className="mb-3">
                      <strong>CPT 코드:</strong> {hipaaData.diagnosisAndTreatment.cpt}
                    </p>
                  )}
                  
                  <p className="mb-3">
                    <strong>치료 반응:</strong> 
                    {hipaaData.respondToCare.status && ` 현재 상태는 ${hipaaData.respondToCare.status}이며,`}
                    {hipaaData.respondToCare.improvedDays && ` ${hipaaData.respondToCare.improvedDays}일간의 치료를 통해 개선되었습니다.`}
                    {hipaaData.respondToCare.notes && ` ${hipaaData.respondToCare.notes}`}
                  </p>
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
