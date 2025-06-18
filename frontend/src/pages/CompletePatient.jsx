import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { RiseLoader } from 'react-spinners';

const CompletePatient = () => {
  const {user} = useAppContext(); // if fetchUser exists
  const [loading, setLoading] = useState(true);
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const navigate = useNavigate();

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/patients/create-patient`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dob, gender }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Something went wrong');
      
      toast.success('Patient info saved successfully');
      navigate('/patients');
    } catch (err) {
      toast.error(err.message || 'Failed to save patient info');
    }
  };
  const checkAndFetchPatient = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/patients/get-patient-details`, {
        credentials: 'include',
      });
      const data = await res.json();

      if (res.ok && data?.data) {
        navigate('/patients'); // redirect if patient already exists
      }
    } catch (err) {
      console.error("Error checking patient:", err);
      //no toast error, since it may just mean patient doesn't exist yet
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkAndFetchPatient();
    } 
  }, [user]);

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
        <h1 className="text-2xl font-semibold mb-6">Complete Patient Information</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col text-gray-700">
            Date of Birth
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
              className="mt-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>

          <label className="flex flex-col text-gray-700">
            Gender
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
              className="mt-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="" disabled>Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
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

export default CompletePatient;
