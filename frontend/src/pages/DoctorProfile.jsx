import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useAppContext } from '../context/AppContext';
import { toast } from 'react-hot-toast';
import { RiseLoader } from 'react-spinners';
import { XCircle, Trash2, CheckCircle } from 'lucide-react';


const DoctorProfile = () => {
  const { user, fetchUser, navigate } = useAppContext();
  const [doctor, setDoctor] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    userName: '',
    email: '',
    specialization: '',
    experience: '',
    hourlyRate: '',
    registrationNumber: ''
  });

  const [unavailability, setUnavailability] = useState(null);
  const [showUnavailableModal, setShowUnavailableModal] = useState(false);




  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName || '',
        userName: user.userName || '',
        email: user.email || '',
      }));

      fetchDoctorDetails();
    }
  }, [user]);

  const fetchDoctorDetails = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/doctors/get-doctor-details`, {
        credentials: 'include',
      });

      const data = await res.json();
      console.log(data);

      if (res.ok) {
        const doctorData = data.data;

        setDoctor(doctorData);

        setFormData(prev => ({
          ...prev,
          specialization: doctorData.specialization || '',
          experience: doctorData.experience || '',
          hourlyRate: doctorData.hourlyRate || '',
          registrationNumber: doctorData.registrationNumber || ''
        }));

        const mostRecent = (doctorData.unavailableStatus || [])
          .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))[0];

        console.log(new Date(mostRecent.startDate).toLocaleString(), new Date(mostRecent.endDate).toLocaleString());
        if (mostRecent) {
          setUnavailability({
            ...mostRecent,
            startDate: new Date(mostRecent.startDate).toUTCString(),
            endDate: new Date(mostRecent.endDate).toUTCString(),
          });
        } else {
          setUnavailability(null);
        }

      } else {
        toast.error('Failed to fetch doctor data');
      }
    } catch (err) {
      toast.error('Error fetching doctor data');
      console.error(err);
    }
  };


  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const submitUnavailableStatus = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end date/time");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/doctors/set-unavailable`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate, endDate }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Unavailable status set");
      setShowUnavailableModal(false);
      setStartDate(""); setEndDate("");
      fetchDoctorDetails()
    } catch (err) {
      toast.error(err.message || "Failed to set unavailable status");
    }
  };
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      // Update user data
      const userRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/update-account`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fullName: formData.fullName,
          userName: formData.userName,
          email: formData.email,
        }),
      });
      if (!userRes.ok) throw new Error('Failed to update user');

      // Update doctor data
      const doctorRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/doctors/update-doctor`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          specialization: formData.specialization,
          experience: formData.experience,
          hourlyRate: formData.hourlyRate,
          registrationNumber: formData.registrationNumber
        }),
      });
      if (!doctorRes.ok) throw new Error('Failed to update doctor data');

      toast.success('Profile updated!');
      setShowEditModal(false);
      await fetchUser();
      await fetchDoctorDetails();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Update failed');
    }
  };


  const fetchAppointments = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/doctors/get-appointments-for-doctor`, {
        credentials: 'include'
      });
      const response = await res.json();
      console.log(response)
      if (!res.ok) throw new Error(response.message || 'Failed to fetch appointments');
      setAppointments(response.data);
      console.log(appointments)
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    }
  };

  const cancelAppointment = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/appointments/change-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          appointmentId: id,
          status: "cancelled"
        }),
      })

      console.log(res)
      if (!res.ok) throw new Error('Failed to cancel appointment');
      toast.success('appointment cancelled')
      await fetchAppointments()

    } catch (err) {
      console.error(err);
      toast.error(err.message || 'deletion failed');
    }
  }

  const completeAppointment = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/appointments/change-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          appointmentId: id,
          status: "completed"
        }),
      });

      if (!res.ok) throw new Error('Failed to complete appointment');
      toast.success('Appointment marked as completed');
      await fetchAppointments();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Completion failed');
    }
  };


  const deleteAppointment = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/appointments/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete appointment');
      }

      toast.success('Appointment deleted');
      await fetchAppointments(); // re-fetch updated list
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Deletion failed');
    }
  };




  useEffect(() => {
    if (!doctor) return;
    fetchAppointments();
  }, [doctor]);


  const handleAvatarUpload = async () => {
    if (!selectedAvatar) {
      toast.error("Please select an image.");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", selectedAvatar);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/avatar`, {
        method: 'PATCH',
        credentials: 'include',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to upload avatar");

      toast.success("Avatar updated!");
      setShowAvatarModal(false);
      setSelectedAvatar(null);
      await fetchUser(); // Refresh avatar
    } catch (err) {
      toast.error(err.message || "Upload failed");
      console.error(err);
    }
  };

  const formatUTC = (isoString) =>
    new Date(isoString).toLocaleString("en-GB", {
      timeZone: "UTC",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });


  if (!doctor) return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <RiseLoader color="#80ff6f" size={15} margin={2} />
    </div>
  );

  return (
    <>
      <Navbar showMiddle={false} />
      <div className="p-6 flex flex-col gap-6">
        <h2 className="text-2xl font-semibold">Doctor Profile</h2>
        <div className="flex gap-10">
          {/* Left Section */}
          <div className="w-1/3 bg-white rounded-xl p-4 shadow-md text-center animate-fadeInRight">
            <img
              src={user.avatar}
              alt="Avatar"
              onClick={() => setShowAvatarModal(true)}
              className="w-24 h-24 mx-auto rounded-full object-cover cursor-pointer hover:brightness-85 transition"
            />
            <h3 className="mt-4 text-xl font-bold">{user.userName}</h3>
            <p className="text-gray-600">{user.email}</p>
          </div>

          {/* Right Section */}
          <div className="w-2/3 bg-white rounded-xl p-4 shadow-md animate-fadeInUp">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Details</h3>
              <button
                className="bg-blue-500 text-white px-4 py-1 rounded-md cursor-pointer hover:bg-primary-dull "
                onClick={() => setShowEditModal(true)}
              >
                Edit
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <p><strong>Full Name:</strong> {user.fullName}</p>
              <p><strong>Specialization:</strong> {doctor.specialization}</p>
              <p><strong>Experience:</strong> {doctor.experience} years</p>
              <p><strong>Hourly Rate:</strong> ₹{doctor.hourlyRate}</p>
              <p><strong>Registration Number:</strong> {doctor.registrationNumber}</p>
              <p><strong>Affiliated Hospital:</strong> {doctor.hospital.name}</p>
            </div>
          </div>
        </div>

        {/* Optional lower section */}
        <div className="bg-white rounded-xl p-4 shadow-md min-h-[350px]">
          <div className='flex justify-between items-center'>
            <h2 className="text-4xl font-semibold animate-fadeInRight">Appointments</h2>
            <div className='flex gap-4 animate-fadeInRight'>
              <button
                onClick={() => { navigate("/doctors/set-schedule") }}
                className="cursor-pointer px-8 py-2 ml-80 bg-primary hover:bg-primary-dull hover:rounded-3xl border border-gray-800 hover:scale-110 transition text-gray-800 hover:text-white rounded-2xl">
                Set Schedule
              </button>
              <button
                onClick={() => setShowUnavailableModal(true)}
                className="cursor-pointer animate-fadeInRight px-8 py-2  bg-primary hover:bg-primary-dull hover:rounded-3xl border border-gray-800 hover:scale-110 transition text-gray-800 hover:text-white rounded-2xl">
                Set Unavailability
              </button>
            </div>
          </div>
          <div className="grid gap-4 mt-4">
            {appointments.length ? appointments.map((appt) => (
              <div
                key={appt._id}
                className="p-3 bg-white rounded shadow text-sm flex items-center justify-between gap-4 animate-fadeInRight"
              >
                {/* Avatar */}
                <img
                  src={appt.patient.user.avatar}
                  alt="Doctor Avatar"
                  className="w-14 h-14 rounded-full object-cover border"
                />

                {/* Info */}
                <div className="flex-1">
                  <p>
                    <strong>Patient:</strong> {appt.patient.user.fullName}
                  </p>
                  <p>
                    <strong>Date:</strong>{' '}
                    {new Date(appt.startTime).toLocaleDateString(undefined, {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p>
                    <strong>Time:</strong>{' '}
                    {new Date(appt.startTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    -{' '}
                    {new Date(appt.endTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  {appt.status === 'pending' && (
                    <button className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
                      Pay Online
                    </button>
                  )}
                </div>

                {/* Fee + Status */}
                <div className="text-center space-y-1 min-w-[90px]">
                  <div className="text-gray-800 font-semibold">₹{appt.fee}</div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-semibold text-white text-center ${appt.status === 'pending'
                      ? 'bg-yellow-500'
                      : appt.status === 'completed'
                        ? 'bg-green-600'
                        : appt.status === 'cancelled'
                          ? 'bg-red-600' : 'bg-gray-500'
                      }`}
                  >
                    {appt.status}
                  </div>
                </div>


                {/* Cancel/Delete Button */}
                {appt.status === 'cancelled' ? (
                  <button
                    title="Delete Appointment"
                    className="text-grey-500 cursor-pointer text-xl p-2 rounded-full hover:scale-110 hover:text-red-600 hover:bg-red-200 transition"
                    onClick={() => deleteAppointment(appt._id)}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                ) : (
                  <>
                    {appt.status !== 'completed' && <button
                      title="Cancel Appointment"
                      className="text-red-500 cursor-pointer text-xl p-2 rounded-full hover:scale-110 hover:text-red-600 hover:bg-red-200 transition"
                      onClick={() => cancelAppointment(appt._id)}
                    >
                      <XCircle className="w-5 h-5" />
                    </button>}

                    {/* ✅ Complete Appointment Button */}
                    {appt.status !== 'completed' && (
                      <button
                        title="Mark as Completed"
                        className="text-green-600 cursor-pointer text-xl p-2 rounded-full hover:scale-110 hover:text-green-700 hover:bg-green-200 transition"
                        onClick={() => completeAppointment(appt._id)}
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                  </>
                )}


              </div>
            )) : (<h1 className="text-center text-2xl font-semibold text-gray-500 mt-12 p-6">
              🚫 No Appointments Found
            </h1>)}
          </div>

        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 animate-fadeInUp">
          <div className="bg-white p-6 rounded-xl shadow-md w-[90%] max-w-md">
            <h3 className="text-xl font-bold mb-4">Edit Profile</h3>
            <div className="space-y-3">
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Full Name" className="w-full p-2 border rounded" />
              <input type="text" name="userName" value={formData.userName} onChange={handleChange} placeholder="Username" className="w-full p-2 border rounded" />
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="w-full p-2 border rounded" />
              <input type="text" name="specialization" value={formData.specialization} onChange={handleChange} placeholder="Specialization" className="w-full p-2 border rounded" />
              <input type="number" name="experience" value={formData.experience} onChange={handleChange} placeholder="Experience (years)" className="w-full p-2 border rounded" />
              <input type="number" name="hourlyRate" value={formData.hourlyRate} onChange={handleChange} placeholder="Hourly Rate" className="w-full p-2 border rounded" />
              <input type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} placeholder="Registration Number" className="w-full p-2 border rounded" />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button className="px-4 py-1 border rounded cursor-pointer" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="px-4 py-1 bg-blue-500 cursor-pointer hover:bg-primary-dull text-white rounded" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}

      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-md w-[90%] max-w-md">
            <h3 className="text-xl font-bold mb-4">Upload New Avatar</h3>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedAvatar(e.target.files[0])}
              className="w-full p-2 border rounded cursor-pointer"
            />

            <div className="mt-4 flex justify-end gap-2">
              <button className="px-4 py-1 border rounded" onClick={() => {
                setShowAvatarModal(false);
                setSelectedAvatar(null);
              }}>
                Cancel
              </button>
              <button
                className="px-4 py-1 bg-primary hover:bg-primary-dull text-white rounded"
                onClick={handleAvatarUpload}
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
      {showUnavailableModal && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-md w-[90%] max-w-md">
            <h3 className="text-xl font-bold mb-4">Set Unavailable Period</h3>

            {unavailability && (
              <div className="mb-4 text-sm text-gray-600">
                <p>
                  Unavailable From:{" "}
                  <strong>{formatUTC(unavailability.startDate)}</strong> to{" "}
                  <strong>{formatUTC(unavailability.endDate)}</strong>
                </p>

              </div>
            )}

            <input type="datetime-local" className="w-full mb-3 p-2 border rounded" onChange={(e) => setStartDate(e.target.value)} />
            <input type="datetime-local" className="w-full mb-4 p-2 border rounded" onChange={(e) => setEndDate(e.target.value)} />

            <div className="flex justify-end gap-2">
              <button className="px-4 py-1 border rounded" onClick={() => setShowUnavailableModal(false)}>Cancel</button>
              <button className="px-4 py-1 bg-primary hover:bg-primary-dull text-white rounded" onClick={submitUnavailableStatus}>Save</button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default DoctorProfile;
