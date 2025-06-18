import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { RiseLoader } from 'react-spinners';

const specializations = [
  "Cardiology", "Dermatology", "Orthopedics", "Pediatrics", "Psychiatry",
  "General Medicine", "Neurology", "ENT", "Radiology"
];

const CompleteDoctor = () => {
  const { user } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [specialization, setSpecialization] = useState('');
  const [experience, setExperience] = useState('');
  const [HRN, setHRN] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const navigate = useNavigate();

  const checkAndFetchDoctor = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/doctors/get-doctor-details`, {
        credentials: 'include',
      });
      const data = await res.json();

      if (res.ok && data?.data) {
        navigate('/doctors/profile'); // redirect if doctor already exists
      }
    } catch (err) {
      console.error("Error checking doctor:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkAndFetchDoctor();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/doctors/create-doctor`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          specialization,
          experience,
          HRN,
          hourlyRate,
          registrationNumber
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Something went wrong');

      toast.success('Doctor profile saved successfully');
      navigate('/doctors/profile');
    } catch (err) {
      toast.error(err.message || 'Failed to save doctor info');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <RiseLoader color="#80ff6f" size={15} margin={2} />
      </div>
    );
  }

  return (
    <>
      <Navbar showMiddle={false} />
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
        <h1 className="text-2xl font-semibold mb-6">Complete Doctor Profile</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col text-gray-700">
            Specialization
            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              required
              className="mt-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="" disabled>Select Specialization</option>
              {specializations.map((spec) => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col text-gray-700">
            Experience (in years)
            <input
              type="number"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              required
              min="0"
              className="mt-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>

          <label className="flex flex-col text-gray-700">
            Hospital Registration Number (HRN)
            <input
              type="text"
              value={HRN}
              onChange={(e) => setHRN(e.target.value)}
              required
              className="mt-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>

          <label className="flex flex-col text-gray-700">
            Hourly Rate (₹)
            <input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              required
              min="0"
              className="mt-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>

          <label className="flex flex-col text-gray-700">
            Doctor Registration Number
            <input
              type="text"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              required
              className="mt-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>

          <button
            type="submit"
            className="mt-4 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
          >
            Submit
          </button>
        </form>
      </div>
    </>
  );
};

export default CompleteDoctor;
