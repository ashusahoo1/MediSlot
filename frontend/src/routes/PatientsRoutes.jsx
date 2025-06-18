import {Route } from 'react-router-dom';
import CompletePatient from '../pages/CompletePatient';

export default function PatientsRoutes() {
  return (
    <>
      {/* <Route index element={<PatientDashboard />} /> */}
      <Route path="complete" element={<CompletePatient />} />
    </>
  );
}
