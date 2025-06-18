import Navbar from './components/Navbar'
import Home from './pages/Home'
import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './routes/ProtectedRoute'
import PatientsRoutes from './routes/PatientsRoutes'
import CompletePatient from './pages/CompletePatient'
import CompleteHospital from './pages/CompleteHospital'
import CompleteDoctor from './pages/CompleteDoctor'
import DoctorScheduleForm from './pages/DoctorScheduleForm'
import PatientProfile from './pages/PatientProfile'
import DoctorProfile from './pages/DoctorProfile'
import PatientMainPage from './pages/PatientMainPage'
import HospitalMainPage from './pages/HospitalMainPage'
import HospitalProfile from './pages/HospitalProfile'
import DoctorMainPage from './pages/DoctorMainPage'
import PaymentSuccess from './pages/PaymentSuccess'

const App = () => {
  return (
    <div>

      <Routes>
        <Route path='/' element={<Home />
        } />

        {/* Patient pages */}
        <Route path='/patients' element={<PatientMainPage/>}></Route>
        <Route path='/patients/complete' element={<CompletePatient/>}></Route>
        <Route path='/patients/profile' element={<PatientProfile/>}></Route>
        {/* Hospital pages */}
        <Route path='/hospitals/complete' element={<CompleteHospital/>}></Route>
        <Route path='/hospitals/profile' element={<HospitalProfile/>}></Route>
        <Route path='/hospitals/:hospitalId' element={<HospitalMainPage/>}></Route>
        {/* Doctor pages */}
        <Route path='/doctors/complete' element={<CompleteDoctor/>}></Route>
        <Route path='/doctors/set-schedule' element={<DoctorScheduleForm/>}></Route>
        <Route path='/doctors/profile' element={<DoctorProfile/>}></Route>
        <Route path='/doctors/:doctorId' element={<DoctorMainPage/>}></Route>
        {/* payment  */}
        <Route path="/payment-success" element={<PaymentSuccess />} />
      </Routes>

    </div>
  )
}

export default App
