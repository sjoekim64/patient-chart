
import React from 'react';
import type { PatientData } from '../types';

interface PatientListProps {
  patients: PatientData[];
  onSelectPatient: (patient: PatientData) => void;
  onNewPatient: () => void;
  onStartFollowUp: () => void;
  onDeletePatient: (fileNo: string) => void;
}

export const PatientList: React.FC<PatientListProps> = ({ patients, onSelectPatient, onNewPatient, onStartFollowUp, onDeletePatient }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
      <div className="border-b pb-4 mb-6 text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Patient Management</h2>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onNewPatient}
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            Register New Patient
          </button>
          <button
            onClick={onStartFollowUp}
            className="px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200"
          >
            Create Follow-up Chart
          </button>
        </div>
      </div>
      
      {patients.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No patient records found. Click "Add New Patient" to get started.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {patients.sort((a, b) => (a.name || a.fileNo).localeCompare(b.name || b.fileNo)).map((patient) => (
            <li key={patient.fileNo} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div className="mb-4 sm:mb-0">
                <p className="text-lg font-medium text-indigo-600">{patient.name || `Patient (${patient.fileNo})`}</p>
                <p className="text-sm text-gray-500">File No: {patient.fileNo} | DOB: {patient.dob || 'N/A'}</p>
              </div>
              <div className="flex-shrink-0 flex space-x-2">
                <button
                  onClick={() => onSelectPatient(patient)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors duration-200 text-sm"
                >
                  View / Edit
                </button>
                <button
                  onClick={(e) => {
                      e.stopPropagation();
                      onDeletePatient(patient.fileNo);
                  }}
                  className="px-4 py-2 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 transition-colors duration-200 text-sm"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
