import React, { useState } from 'react';
import type { PatientData } from '../types';
import { GoogleGenAI } from "@google/genai";

// To prevent type errors with the global html2pdf library
declare const html2pdf: any;

interface PrintableViewProps {
  data: PatientData;
  onEdit: () => void;
  onGoToList: () => void;
}

const DataCell: React.FC<{ label: string; value: React.ReactNode; className?: string; }> = ({ label, value, className = '' }) => (
  <div className={`flex border-b border-black ${className}`}>
    <div className={`w-1/3 font-bold p-2 border-r border-black bg-slate-50 flex items-center`}>{label}</div>
    <div className={`w-2/3 p-2 flex items-center`}>{value || <span>&nbsp;</span>}</div>
  </div>
);

const VitalsCell: React.FC<{ label: string; value: string; unit: string; className?: string }> = ({ label, value, unit, className='' }) => (
    <div className={`flex items-baseline p-2 ${className}`}>
        <span className="font-bold mr-2">{label}</span>
        <span className="flex-grow border-b border-dotted border-gray-400 text-center">{value || <>&nbsp;</>}</span>
        <span className="ml-2 text-sm text-gray-600">{unit}</span>
    </div>
);

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <div className="bg-gray-300 text-center font-bold p-2 border-b-2 border-black">
    {title}
  </div>
);

const PairedComplaintRow: React.FC<{ item1: {label: string, value: React.ReactNode}, item2: {label: string, value: React.ReactNode} }> = ({ item1, item2 }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 border-b border-black">
      <div className="grid grid-cols-[auto_1fr] border-r border-black">
         <div className="font-bold p-1 border-r border-black bg-slate-50 flex items-center w-28 justify-start pl-2">{item1.label}</div>
         <div className="p-1 break-words min-w-0 flex items-center">{item1.value || <span className="text-gray-400">N/A</span>}</div>
      </div>
      <div className="grid grid-cols-[auto_1fr]">
         <div className="font-bold p-1 border-r border-black bg-slate-50 flex items-center w-28 justify-start pl-2">{item2.label}</div>
         <div className="p-1 break-words min-w-0 flex items-center">{item2.value || <span className="text-gray-400">N/A</span>}</div>
      </div>
    </div>
);

const SingleComplaintRow: React.FC<{ label: string; value: React.ReactNode; }> = ({ label, value }) => (
    <div className="grid grid-cols-[auto_1fr] border-b border-black">
        <div className="font-bold p-1 border-r border-black bg-slate-50 flex items-center w-28 justify-start pl-2">{label}</div>
        <div className="p-1 break-words min-w-0 flex items-center">{value || <span className="text-gray-400">N/A</span>}</div>
    </div>
);


const FullWidthRow: React.FC<{ label: string; value: React.ReactNode; isLast?: boolean }> = ({ label, value, isLast=false }) => (
    <div className={`grid grid-cols-[200px_1fr] ${!isLast ? 'border-b border-black' : ''}`}>
        <div className="font-bold p-2 border-r border-black bg-slate-50 flex items-center justify-center">{label}</div>
        <div className="p-2 break-words min-w-0">{value || <span className="text-gray-400">N/A</span>}</div>
    </div>
);

const SoapModal: React.FC<{ content: string; onClose: () => void; }> = ({ content, onClose }) => {
    const [copySuccess, setCopySuccess] = useState('');

    const copyToClipboard = () => {
        navigator.clipboard.writeText(content).then(() => {
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000); // Reset message after 2 seconds
        }, () => {
            setCopySuccess('Failed to copy.');
            setTimeout(() => setCopySuccess(''), 2000);
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl relative">
                <h3 className="text-2xl font-bold mb-4">Generated SOAP Note</h3>
                <pre className="bg-gray-100 p-4 rounded-md whitespace-pre-wrap font-sans text-sm max-h-[60vh] overflow-y-auto">
                    {content}
                </pre>
                <div className="mt-6 flex justify-end space-x-4">
                    <button
                        onClick={copyToClipboard}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {copySuccess || 'Copy to Clipboard'}
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};


export const PrintableView: React.FC<PrintableViewProps> = ({ data, onEdit, onGoToList }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [soapNote, setSoapNote] = useState<string | null>(null);
  const [isGeneratingSoap, setIsGeneratingSoap] = useState(false);
  const isFollowUp = data.chartType === 'follow-up';

  const handleDownloadPdf = () => {
    setIsDownloading(true);
    const element = document.getElementById('print-area');
    if (!element) {
        console.error('Print area not found');
        setIsDownloading(false);
        return;
    }

    const fileName = `${data.fileNo}_${data.name.replace(/\s/g, '_')}.pdf`;

    const opt = {
      margin:       0.25,
      filename:     fileName,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, letterRendering: true, scrollY: 0 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' },
      pagebreak:    { mode: ['css'], before: '.break-before-page' }
    };

    html2pdf().from(element).set(opt).toPdf().get('pdf').then((pdf: any) => {
        const totalPages = pdf.internal.getNumberOfPages();
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        pdf.setFontSize(8);
        pdf.setTextColor(100);

        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            const footerText = `${data.name}  |  File No.: ${data.fileNo}  |  Page ${i} of ${totalPages}`;
            pdf.text(footerText, pageWidth / 2, pageHeight - 0.15, { align: 'center' });
        }
    }).save().finally(() => {
        setIsDownloading(false);
    });
  };

    const handleGenerateSoapNote = async () => {
        setIsGeneratingSoap(true);
        setSoapNote('Generating, please wait...');

        // Construct a detailed summary of the patient chart
        const chartSummary = `
        Patient: ${data.name}, Age: ${data.age}, Sex: ${data.sex}
        Date: ${data.date}
        ---
        CHIEF COMPLAINT:
        ${[...data.chiefComplaint.selectedComplaints, data.chiefComplaint.otherComplaint].filter(Boolean).join(', ')}
        
        PRESENT ILLNESS (HPI):
        ${data.chiefComplaint.presentIllness}
        
        REVIEW OF SYSTEMS SUMMARY:
        ${rosItems.map(item => `- ${item.label}: ${typeof item.value === 'string' ? item.value : 'Complex data'}`).join('\n')}
        
        OBJECTIVE FINDINGS:
        - Vitals: BP ${data.bpSystolic}/${data.bpDiastolic}, HR ${data.heartRate}, Temp ${data.temp}°F
        - Tongue Body: ${data.tongue.body.color.join(', ')}, ${data.tongue.body.shape.join(', ')}
        - Tongue Coating: ${data.tongue.coating.color.join(', ')}, ${data.tongue.coating.quality.join(', ')}
        
        ASSESSMENT (DIAGNOSIS):
        - TCM Diagnosis: ${data.diagnosisAndTreatment.tcmDiagnosis}
        - Etiology: ${data.diagnosisAndTreatment.etiology}
        - Eight Principles: ${Object.values(data.diagnosisAndTreatment.eightPrinciples).join(', ')}
        
        PLAN (TREATMENT):
        - Principle: ${data.diagnosisAndTreatment.treatmentPrinciple}
        - Acupuncture Points: ${data.diagnosisAndTreatment.acupuncturePoints}
        - Herbal Treatment: ${data.diagnosisAndTreatment.herbalTreatment}
        - Other Treatments: ${renderCombinedOtherTreatments()}
        ${isFollowUp ? `\nRESPONSE TO PREVIOUS CARE:\n${renderRespondToCare()}` : ''}
        `;

        const prompt = `Based on the provided patient chart summary, generate a concise and professional SOAP note.

        Chart Summary:
        ${chartSummary}
        
        Instructions:
        - S (Subjective): Synthesize the Chief Complaint, HPI, and relevant Review of Systems into a narrative.
        - O (Objective): List the key objective findings like vitals and tongue diagnosis.
        - A (Assessment): State the TCM Diagnosis clearly.
        - P (Plan): Detail the treatment plan, including principles, acupuncture, herbs, and other modalities.
        - The output should be plain text, clearly structured with S, O, A, P headings.`;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            setSoapNote(response.text.trim());
        } catch (error) {
            console.error("Error generating SOAP note:", error);
            setSoapNote("Failed to generate SOAP note. Please check the console for details.");
        } finally {
            setIsGeneratingSoap(false);
        }
    };


  const heightValue = [
    data.heightFt ? `${data.heightFt}'` : null,
    data.heightIn ? `${data.heightIn}"` : null,
  ].filter(Boolean).join(' ');

  const allComplaints = [
      ...data.chiefComplaint.selectedComplaints,
      data.chiefComplaint.otherComplaint,
  ].filter(Boolean).join(', ');

  const locationDisplay = [...data.chiefComplaint.locationDetails, data.chiefComplaint.location].filter(Boolean).join(', ');
  const onsetDisplay = data.chiefComplaint.onsetValue ? `${data.chiefComplaint.onsetValue} ${data.chiefComplaint.onsetUnit}` : '';
  const provocationDisplay = [...data.chiefComplaint.provocation, data.chiefComplaint.provocationOther].filter(Boolean).join(', ');
  const palliationDisplay = [...data.chiefComplaint.palliation, data.chiefComplaint.palliationOther].filter(Boolean).join(', ');
  const qualityDisplay = [...data.chiefComplaint.quality, data.chiefComplaint.qualityOther].filter(Boolean).join(', ');
  const causeDisplay = [...data.chiefComplaint.possibleCause, data.chiefComplaint.possibleCauseOther].filter(Boolean).join(', ');
  const severityDisplay = [
      data.chiefComplaint.severityScore ? `P/L= ${data.chiefComplaint.severityScore} / 10` : '',
      data.chiefComplaint.severityDescription
  ].filter(Boolean).join(', ');

  const formatHistory = (items: string[], other: string) => {
    return [...items, other].filter(Boolean).join(', ');
  }

  const pastMedicalHistoryDisplay = formatHistory(data.medicalHistory.pastMedicalHistory, data.medicalHistory.pastMedicalHistoryOther);
  const medicationDisplay = formatHistory(data.medicalHistory.medication, data.medicalHistory.medicationOther);
  const familyHistoryDisplay = formatHistory(data.medicalHistory.familyHistory, data.medicalHistory.familyHistoryOther);
  const allergyDisplay = formatHistory(data.medicalHistory.allergy, data.medicalHistory.allergyOther);

  const ros = data.reviewOfSystems;
  const formatRos = (items: (string | undefined | null)[], other?: string) => [ ...(items || []), other].filter(Boolean).join(', ');

  const renderMenstruation = () => {
    const { menstruation } = ros;
    if (menstruation.status === 'menopause') {
      return `Menopause (Age: ${menstruation.menopauseAge || 'N/A'})`;
    }
    if (menstruation.status === 'regular' || menstruation.status === 'irregular') {
      const parts = [
        `Status: ${menstruation.status}`,
        menstruation.lmp ? `LMP: ${menstruation.lmp}` : null,
        menstruation.cycleLength ? `Cycle: ${menstruation.cycleLength}d` : null,
        menstruation.duration ? `Duration: ${menstruation.duration}d` : null,
        `Amount: ${menstruation.amount}`,
        `Color: ${menstruation.color}`,
        `Clots: ${menstruation.clots}`,
        `Pain: ${menstruation.pain}${menstruation.pain === 'yes' ? ` (${menstruation.painDetails || 'N/A'})` : ''}`,
        menstruation.pms.length > 0 ? `PMS: ${menstruation.pms.join(', ')}` : null,
        menstruation.other ? `Other: ${menstruation.other}` : null,
      ].filter(Boolean).join('; ');
      return parts;
    }
    return <span className="text-gray-400">N/A</span>;
  };
  
  const getFormulaName = (treatment: string) => {
      if (!treatment) return <span className="text-gray-400">N/A</span>;
      // Handle "Formula: [Name]" and just "[Name]" from AI or user input
      return treatment.replace(/^Formula:\s*/i, '').split('\n')[0].trim();
  };
  
  const renderCombinedOtherTreatments = () => {
    const { selectedTreatment, otherTreatmentText } = data.diagnosisAndTreatment;
    
    if (!selectedTreatment || selectedTreatment === 'None') {
        return 'None';
    }

    if (selectedTreatment === 'Other' || selectedTreatment === 'Auricular Acupuncture') {
        const label = selectedTreatment === 'Auricular Acupuncture' ? 'Auricular Acupuncture / Ear Seeds' : selectedTreatment;
        return otherTreatmentText ? `${label}: ${otherTreatmentText}` : label;
    }
    
    return selectedTreatment;
  };

  const renderTongueSection = () => {
    const { body, coating } = data.tongue;
    
    const bodyLocations = body.locations.map(loc => {
      const comment = body.locationComments[loc];
      return comment ? `${loc} (${comment})` : loc;
    }).join(', ');

    const bodyDisplay = [
      `Color: ${body.color.join(', ') || 'N/A'}`,
      `Shape: ${body.shape.join(', ') || 'N/A'}`,
      `Locations: ${bodyLocations || 'N/A'}`
    ].filter(s => !s.endsWith('N/A')).join('; ');
    
    const coatingDisplay = [
      `Color: ${coating.color.join(', ') || 'N/A'}`,
      `Quality: ${coating.quality.join(', ') || 'N/A'}`,
      coating.notes ? `Notes: ${coating.notes}` : null
    ].filter(Boolean).join('; ');

    return (
      <>
        <div className="grid grid-cols-[100px_1fr] border-b border-black">
          <div className="font-bold p-2 border-r border-black bg-slate-50 flex items-center justify-center">BODY</div>
          <div className="p-2 break-words min-w-0">{bodyDisplay}</div>
        </div>
        <div className="grid grid-cols-[100px_1fr]">
          <div className="font-bold p-2 border-r border-black bg-slate-50 flex items-center justify-center">COATING</div>
          <div className="p-2 break-words min-w-0">{coatingDisplay}</div>
        </div>
      </>
    );
  }
  
  const rosItems: { label: string, value: React.ReactNode }[] = [
      { label: "Cold / Hot", value: formatRos(ros.coldHot.parts, `${ros.coldHot.sensation}, ${ros.coldHot.other}`) },
      { label: "Sleep", value: formatRos([...ros.sleep.quality, ...ros.sleep.issues], `${ros.sleep.hours} hrs, ${ros.sleep.other}`) },
      { label: "Sweat", value: ros.sweat.present === 'yes' ? formatRos([...ros.sweat.time, ...ros.sweat.parts], ros.sweat.other) : 'No' },
      { label: "Eye", value: formatRos(ros.eye.symptoms, ros.eye.other) },
      { label: "Mouth / Tongue", value: formatRos([...ros.mouthTongue.symptoms, ...ros.mouthTongue.taste], ros.mouthTongue.other) },
      { label: "Throat / Nose", value: formatRos([...ros.throatNose.symptoms, ...ros.throatNose.mucusColor], ros.throatNose.other) },
      { label: "Edema", value: ros.edema.present === 'yes' ? formatRos(ros.edema.parts, ros.edema.other) : 'No' },
      { label: "Drink", value: formatRos([ros.drink.thirsty, ros.drink.preference, ros.drink.amount], ros.drink.other) },
      { label: "Digestion", value: formatRos(ros.digestion.symptoms, ros.digestion.other) },
      { label: "Appetite / Energy", value: `Appetite: ${ros.appetiteEnergy.appetite}, Energy: ${ros.appetiteEnergy.energy}/10 ${ros.appetiteEnergy.other || ''}`.trim() },
      { label: "Urination", value: `Day: ${ros.urine.frequencyDay}, Night: ${ros.urine.frequencyNight}, Amount: ${ros.urine.amount}, Color: ${ros.urine.color}` },
      { label: "Stool", value: `Freq: ${ros.stool.frequencyValue} / ${ros.stool.frequencyUnit}, Form: ${ros.stool.form}, Color: ${ros.stool.color}` },
  ];

  if (data.sex === 'F') {
      rosItems.push({ label: "Menstruation", value: renderMenstruation() });
      rosItems.push({ label: "Discharge", value: ros.discharge.present === 'yes' ? formatRos(ros.discharge.symptoms, ros.discharge.other) : 'No' });
  }

  const renderRespondToCare = () => {
    if (!data.respondToCare || !data.respondToCare.status) return <span className="text-gray-400">N/A</span>;
    const { status, improvedDays, notes } = data.respondToCare;
    let text = status;
    if (status === 'Improved' && improvedDays) {
      text += ` (Good for ${improvedDays} days)`;
    }
    if (notes) {
      text += ` - Notes: ${notes}`;
    }
    return text;
  }

  return (
    <div className="max-w-4xl mx-auto">
       {soapNote && <SoapModal content={soapNote} onClose={() => setSoapNote(null)} />}
      <div className="bg-white p-2 sm:p-4 md:p-8" id="print-area">
        
        {/* PAGE 1 CONTAINER */}
        <div className="border-2 border-black">
          {/* Clinic Header */}
          {(data.clinicName || data.clinicLogo) && (
            <div className="p-4 flex justify-between items-center min-h-[6rem] border-b-2 border-black">
              {data.clinicLogo && (
                <div className="w-1/4 flex justify-start items-center">
                  <img src={data.clinicLogo} alt="Clinic Logo" className="max-h-20 max-w-full object-contain" />
                </div>
              )}
              <div className={`text-right ${data.clinicLogo ? 'w-3/4' : 'w-full text-center'}`}>
                {data.clinicName && <h1 className="text-3xl font-bold text-slate-800">{data.clinicName}</h1>}
                <h2 className="text-2xl font-semibold text-slate-600">{isFollowUp ? 'Follow-up Patient Chart' : 'New Patient Chart'}</h2>
              </div>
            </div>
          )}

          {/* Patient Info Section */}
          <div className="border-b-2 border-black">
            <div className="grid grid-cols-1 md:grid-cols-3">
              <DataCell label="FILE NO." value={data.fileNo} className="border-b-0 md:border-b border-r-0 md:border-r"/>
              <DataCell label="Name" value={data.name} className="border-b-0 md:border-b border-r-0 md:border-r"/>
              <DataCell label="Date:" value={data.date} className="border-b-0 md:border-b border-r-0"/>
            </div>
            {!isFollowUp && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3">
                        <DataCell label="Address" value={data.address} className="md:col-span-2 border-b-0 md:border-b border-r-0 md:border-r" />
                        <DataCell label="Phone" value={data.phone} className="border-b-0 md:border-b border-r-0" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr]">
                        <DataCell label="Occupation" value={data.occupation} className="border-b-0 border-r-0 md:border-r"/>
                        <DataCell label="DOB" value={data.dob} className="border-b-0 border-r-0 md:border-r" />
                        <DataCell label="Age" value={`${data.age}`} className="border-b-0 border-r-0 md:border-r" />
                        <DataCell label="Sex" value={data.sex} className="border-b-0 border-r-0" />
                    </div>
                </>
            )}
            {isFollowUp && (
                <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr]">
                    <DataCell label="Occupation" value={data.occupation} className="border-b-0 border-r-0 md:border-r"/>
                    <DataCell label="DOB" value={data.dob} className="border-b-0 border-r-0 md:border-r" />
                    <DataCell label="Age" value={`${data.age}`} className="border-b-0 border-r-0 md:border-r" />
                    <DataCell label="Sex" value={data.sex} className="border-b-0 border-r-0" />
                </div>
            )}
          </div>

          {/* Vitals Section */}
          <div className="border-b-2 border-black">
            <SectionHeader title="VITAL SIGNS" />
            <div className="grid grid-cols-1 md:grid-cols-3">
              <VitalsCell label="HT." value={heightValue} unit="" className="border-r border-black" />
              <VitalsCell label="WT." value={data.weight} unit="lbs" className="border-r border-black" />
              <VitalsCell label="Temp." value={data.temp} unit="°F" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-black">
              <div className="flex border-r border-black">
                  <div className="font-bold p-2 w-1/4 border-r border-black bg-slate-50 flex items-center justify-center">Heart</div>
                  <div className="w-3/4">
                      <VitalsCell label="Rate:" value={data.heartRate} unit="BPM" className="border-b border-black" />
                      <VitalsCell label="Rhythm:" value={data.heartRhythm} unit="" className="border-b border-black" />
                      <VitalsCell label="B.P.:" value={data.bpSystolic && data.bpDiastolic ? `${data.bpSystolic}/${data.bpDiastolic}` : ''} unit="mmHg" />
                  </div>
              </div>
              <div className="flex">
                  <div className="font-bold p-2 w-1/4 border-r border-black bg-slate-50 flex items-center justify-center">LUNG</div>
                  <div className="w-3/4">
                      <VitalsCell label="Rate:" value={data.lungRate} unit="BPM" className="border-b border-black" />
                      <VitalsCell label="Sound:" value={data.lungSound} unit="" />
                  </div>
              </div>
            </div>
          </div>

          {/* Response to Care Section */}
          {isFollowUp && (
              <div className="border-b-2 border-black">
                  <SectionHeader title="RESPONSE TO PREVIOUS CARE" />
                  <div className="p-2">{renderRespondToCare()}</div>
              </div>
          )}

          {/* Chief Complaint Section */}
          <div className="border-b-2 border-black">
            <SectionHeader title="CHIEF COMPLAINT(S)" />
            <div className="flex border-b border-black">
                <div className="grid grid-cols-[auto_1fr] w-full">
                    <div className="font-bold p-2 border-r border-black bg-gray-300 flex items-center justify-center w-full md:w-auto">CHIEF COMPLAINT(S)</div>
                    <div className="p-2 flex items-center">{allComplaints}</div>
                </div>
            </div>
            <PairedComplaintRow item1={{label: "Location", value: locationDisplay}} item2={{label: "Onset", value: onsetDisplay}} />
            <PairedComplaintRow item1={{label: "Aggravate", value: provocationDisplay}} item2={{label: "Alleviation", value: palliationDisplay}} />
            <PairedComplaintRow item1={{label: "Quality", value: qualityDisplay}} item2={{label: "Radiation", value: data.chiefComplaint.regionRadiation}} />
            <PairedComplaintRow item1={{label: "Severity", value: severityDisplay}} item2={{label: "Frequency", value: data.chiefComplaint.frequency}} />
            <PairedComplaintRow item1={{label: "Timing", value: data.chiefComplaint.timing}} item2={{label: "Possible Cause", value: causeDisplay}} />
            <SingleComplaintRow label="Remark" value={data.chiefComplaint.remark} />
          </div>

          {/* Present Illness Section */}
          <div>
            <SectionHeader title="PRESENT ILLNESS" />
            <div className="p-2 space-y-2 text-sm">
                <p className="whitespace-pre-wrap">{data.chiefComplaint.presentIllness || <span className="text-gray-400">N/A</span>}</p>
                {!isFollowUp && data.chiefComplaint.westernMedicalDiagnosis && (
                    <div className="pt-2">
                        <p className="font-semibold">Western Medical Diagnosis:</p>
                        <p>{data.chiefComplaint.westernMedicalDiagnosis}</p>
                    </div>
                )}
            </div>
          </div>
        </div>

        {/* PAGE 2 CONTAINER */}
        <div className="border-2 border-black break-before-page mt-4 print:mt-0">
          {/* Medical History Section */}
          {!isFollowUp && (
              <div className="grid grid-cols-2 border-b-2 border-black">
                  <div className="border-r border-b border-black flex">
                      <div className="w-1/3 bg-gray-300 p-2 font-bold flex items-center text-center justify-center border-r border-black">Past Medical History</div>
                      <div className="w-2/3 p-2 break-words min-w-0">{pastMedicalHistoryDisplay || <span className="text-gray-400">N/A</span>}</div>
                  </div>
                  <div className="border-b border-black flex">
                      <div className="w-1/3 bg-gray-300 p-2 font-bold flex items-center text-center justify-center border-r border-black">Medication</div>
                      <div className="w-2/3 p-2 break-words min-w-0">{medicationDisplay || <span className="text-gray-400">N/A</span>}</div>
                  </div>
                  <div className="border-r border-black flex">
                      <div className="w-1/3 bg-gray-300 p-2 font-bold flex items-center text-center justify-center border-r border-black">Family Hx.</div>
                      <div className="w-2/3 p-2 break-words min-w-0">{familyHistoryDisplay || <span className="text-gray-400">N/A</span>}</div>
                  </div>
                  <div className="flex">
                      <div className="w-1/3 bg-gray-300 p-2 font-bold flex items-center text-center justify-center border-r border-black">Allergy</div>
                      <div className="w-2/3 p-2 break-words min-w-0">{allergyDisplay || <span className="text-gray-400">N/A</span>}</div>
                  </div>
              </div>
          )}

          {/* Review of Systems Section - Compact Layout */}
          <div className="p-2 border-b-2 border-black">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  {rosItems.map(item => (
                      <p key={item.label}>
                          <span className="font-bold">{item.label}:</span>{' '}
                          {item.value || <span className="text-gray-400">N/A</span>}
                      </p>
                  ))}
              </div>
          </div>

          {/* Inspection of the Tongue Section */}
          <div className="border-b-2 border-black">
            <SectionHeader title="INSPECTION OF THE TONGUE" />
            <div>
                {renderTongueSection()}
            </div>
          </div>

          {/* Diagnosis Section */}
          <div className="border-b-2 border-black">
            <SectionHeader title="DIAGNOSIS" />
            <div>
                <div className="grid grid-cols-[200px_1fr] border-b border-black">
                    <div className="font-bold p-2 border-r border-black bg-slate-50 flex items-center justify-center">EIGHT PRINCIPLES</div>
                    <div className="grid grid-cols-4">
                        <div className="p-2 border-r border-black text-center">{data.diagnosisAndTreatment.eightPrinciples.exteriorInterior || <span className="text-gray-400">Ext/Int</span>}</div>
                        <div className="p-2 border-r border-black text-center">{data.diagnosisAndTreatment.eightPrinciples.heatCold || <span className="text-gray-400">Heat/Cold</span>}</div>
                        <div className="p-2 border-r border-black text-center">{data.diagnosisAndTreatment.eightPrinciples.excessDeficient || <span className="text-gray-400">Exc/Def</span>}</div>
                        <div className="p-2 text-center">{data.diagnosisAndTreatment.eightPrinciples.yangYin || <span className="text-gray-400">Yang/Yin</span>}</div>
                    </div>
                </div>
                <FullWidthRow label="ETIOLOGY" value={data.diagnosisAndTreatment.etiology} />
                <FullWidthRow label="TCM DIAGNOSIS" value={data.diagnosisAndTreatment.tcmDiagnosis} />
            </div>
          </div>
          
          {/* Treatment Section */}
          <div className="border-b-2 border-black">
            <SectionHeader title="TREATMENT" />
            <div>
              <FullWidthRow label="TREATMENT PRINCIPLE" value={data.diagnosisAndTreatment.treatmentPrinciple} />
              <FullWidthRow label="ACUPUNCTURE POINTS" value={data.diagnosisAndTreatment.acupuncturePoints} />
              <FullWidthRow label="HERBAL TREATMENT" value={getFormulaName(data.diagnosisAndTreatment.herbalTreatment)} />
              <FullWidthRow label="OTHER TREATMENTS" value={renderCombinedOtherTreatments()} />

              <div className="grid grid-cols-2">
                  <div className="flex border-r border-black">
                      <div className="w-1/3 font-bold p-2 border-r border-black bg-slate-100 flex items-center justify-center">ICD</div>
                      <div className="w-2/3 p-2 flex items-center">{data.diagnosisAndTreatment.icd}</div>
                  </div>
                  <div className="flex">
                      <div className="w-1/3 font-bold p-2 border-r border-black bg-slate-100 flex items-center justify-center">CPT</div>
                      <div className="w-2/3 p-2 flex items-center">{data.diagnosisAndTreatment.cpt}</div>
                  </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* PAGE 3 CONTAINER - Consent Form */}
        {!isFollowUp && (
            <div className="pt-8 text-black break-before-page">
                <div>
                    <h2 className="text-center font-bold text-lg mb-4">Consent for Treatments and Arbitration Agreement</h2>
                    <div className="text-xs space-y-2 text-justify">
                        <p><span className="font-bold">Agreement to Arbitrate :</span> It is understood that any dispute as to medical malpractice, including whether any medical services rendered under this contract were unnecessary or unauthorized or were improperly, negligently or incompetently rendered, will be determined by submission to arbitration as provided by state and federal law, and not by a lawsuit or resort to court process, except as state and federal law provides for judicial review of arbitration proceedings. Both parties to this contract, by entering into it, are giving up their constitutional right to have any such dispute decided in a court of law before a jury, and instead are accepting the use of arbitration.</p>
                        <p><span className="font-bold">All Claims Must be Arbitrated:</span> It is also understood that any dispute that does not relate to medical malpractice, including disputes as to whether or not a dispute is subject to arbitration, as to whether this agreement is unconscionable, and any procedural disputes, will also be determined by submission to binding arbitration. It is intention of the parties that this agreement bind all parties as to all claims, including claims arising out of or relating to treatment or services provided by the health care provider, including any heirs or past, present or future spouse(s) of the patient in relation to all claims, including loss of consortium. This agreement is also intended to bind any children of the patient whether born or unborn at the time of the occurrence, giving rise to any claim. This agreement is intended to bind the patient and the health care provider and/or other licensed health care providers, preceptors, or interns who now or in the future treat the patient while employed by, working or associated with or serving as a backup for the health care provider, including those working at the health care provider’s clinic or office or any other clinic or office whether signatories to this form or not. All claims for monetary damages exceeding the jurisdictional limit of the small claims court against the health care provider, and/or the health care provider’s associates, corporation, partnership, employees, agents and estate, must be arbitrated including, without limitation, claims for loss of consortium, wrongful death, emotional distress, injunctive relief, or punitive damages. This agreement is intended to create an open book account unless and until revoked.</p>
                        <p><span className="font-bold">General provision:</span> All claims based upon the same incident, transaction, or related circumstances shall be arbitrated in one proceeding. A claim shall be waived and forever barred if (1) on the date notice thereof is received, the claim, if asserted in a civil action, would be barred by the applicable legal statute of limitations, or (2) the claimant fails to pursue the arbitration claim in accordance with the procedures prescribed herein with reasonable diligence.</p>
                        <p>I, the undersigned, fully understand that there is no implied or stated guarantee of success or effectiveness of a specific treatment of series of treatment. Every attempt will be made to protect me from harm, but there may be unfavorable skin reaction, unexpected bleeding, and/or other complications not anticipated. I realize that I may withdraw from the program at any time. By voluntarily signing below, I show that I have read, or have had read to me, the above consent to treatment, have been told about the risks and benefits of acupuncture and other procedures, and have had an opportunity to ask questions. I intend this consent form to cover the entire course of treatment for my present condition and for any future condition(s) for which I seek treatment. Both parties to this contract, by entering it, are giving up their constitutional right to have any such dispute decided in court of law before jury and instead are accepting the use of arbitration. Further, the parties will not have the right to participate as a member of any class of claimants, and there shall be no authority for any dispute to be decided on a class action basis. Any arbitration can only decide a dispute between the parties and may not consolidate or join the claims of other persons who have similar claims. By Signing this contract, you are agreeing to have any issue of medical malpractice decided by neutral arbitration, and You are giving up your right to a jury or court trial.</p>
                    </div>
                    <div className="mt-8 text-sm space-y-8">
                        <div className="flex items-end space-x-4">
                        <span className="font-bold whitespace-nowrap">Patient’s signature : ×</span>
                        <div className="flex-grow border-b border-black"></div>
                        <span className="font-bold whitespace-nowrap">Date :</span>
                        <div className="w-40 border-b border-black"></div>
                        </div>
                        <div className="flex items-end space-x-4">
                        <span className="font-bold whitespace-nowrap">Therapist Name:</span>
                        <div className="flex-grow border-b border-black text-center">{data.diagnosisAndTreatment.therapistName}</div>
                        <span className="font-bold whitespace-nowrap">Lic #: AC</span>
                        <div className="w-40 border-b border-black text-center">{data.diagnosisAndTreatment.therapistLicNo}</div>
                        </div>
                        <div className="flex items-end space-x-4">
                        <span className="font-bold whitespace-nowrap">Signature:</span>
                        <div className="flex-grow border-b border-black"></div>
                        <span className="font-bold whitespace-nowrap">Date:</span>
                        <div className="w-40 border-b border-black"></div>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>

      <div className="mt-8 flex justify-center space-x-4 print:hidden">
        <button onClick={onGoToList} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
          Patient List
        </button>
        <button onClick={onEdit} className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200">
          Edit
        </button>
        <button 
          onClick={handleGenerateSoapNote}
          disabled={isGeneratingSoap}
          className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200 disabled:bg-purple-400 disabled:cursor-not-allowed">
          {isGeneratingSoap ? 'Generating...' : 'Generate SOAP Note'}
        </button>
        <button 
          onClick={handleDownloadPdf}
          disabled={isDownloading}
          className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 disabled:bg-green-400 disabled:cursor-not-allowed">
          {isDownloading ? 'Downloading...' : 'Download PDF'}
        </button>
      </div>
    </div>
  );
};