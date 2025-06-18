import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { RiseLoader } from 'react-spinners';
import { useAppContext } from '../context/AppContext';

const CompleteHospital = () => {
  const {user,navigate}=useAppContext()
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    HRN: '',
    contactNumber: '',
    address: {
      name: '',
      street: '',
      city: '',
      state: '',
      country: '',
      postcode: ''
    },
    latitude: '',
    longitude: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('address.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [key]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      location: {
        type: "Point",
        coordinates: [
          parseFloat(formData.longitude),
          parseFloat(formData.latitude)
        ]
      }
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/hospitals/create-hospital`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Submission failed');
      alert('Hospital information saved!');
    } catch (err) {
      alert(err.message);
    }
  };

  const checkAndFetchHospital = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/hospitals/get-hospital`, {
        credentials: 'include',
      });
      const data = await res.json();

      if (res.ok && data?.data) {
        navigate('/hospitals/profile'); // redirect if patient already exists
      }
    } catch (err) {
      console.error("Error checking hospital:", err);
      //no toast error, since it may just mean patient doesn't exist yet
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkAndFetchHospital();
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
      <div className="max-w-3xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Complete Hospital Information</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" placeholder="Hospital Name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded" required />
          <input name="HRN" placeholder="Hospital Registration Number" value={formData.HRN} onChange={handleChange} className="w-full p-2 border rounded" required />
          <input name="contactNumber" placeholder="Contact Number" value={formData.contactNumber} onChange={handleChange} className="w-full p-2 border rounded" required />

          <h2 className="text-lg font-semibold mt-4">Address</h2>
          <input name="address.name" placeholder="Address Name" value={formData.address.name} onChange={handleChange} className="w-full p-2 border rounded" required />
          <input name="address.street" placeholder="Street" value={formData.address.street} onChange={handleChange} className="w-full p-2 border rounded" required />
          <input name="address.city" placeholder="City" value={formData.address.city} onChange={handleChange} className="w-full p-2 border rounded" required />
          <input name="address.state" placeholder="State" value={formData.address.state} onChange={handleChange} className="w-full p-2 border rounded" required />
          <input name="address.country" placeholder="Country" value={formData.address.country} onChange={handleChange} className="w-full p-2 border rounded" required />
          <input name="address.postcode" placeholder="Postcode" value={formData.address.postcode} onChange={handleChange} className="w-full p-2 border rounded" required />

          <h2 className="text-lg font-semibold mt-4">Coordinates (Optional)</h2>
          <input name="latitude" type="number" step="any" placeholder="Latitude" value={formData.latitude} onChange={handleChange} className="w-full p-2 border rounded" />
          <input name="longitude" type="number" step="any" placeholder="Longitude" value={formData.longitude} onChange={handleChange} className="w-full p-2 border rounded" />

          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded mt-4">Submit</button>
        </form>
      </div>
    </>
  );
};

export default CompleteHospital;
