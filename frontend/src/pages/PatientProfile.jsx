import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAppContext } from '../context/AppContext';
import { toast } from 'react-hot-toast';
import { RiseLoader } from "react-spinners";
import { XCircle } from 'lucide-react';
import { assets } from '../assets_frontend/assets';


const PatientProfile = () => {
    const { user, fetchUser, navigate, globalRole } = useAppContext();
    const [showEditModal, setShowEditModal] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const [patient, setPatient] = useState(null);
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        userName: '',
        email: '',
        gender: '',
        dob: ''
    });
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [appointmentToCancel, setAppointmentToCancel] = useState(null);


    useEffect(() => {
        const fetchPatient = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/patients/get-patient-details`, {
                    credentials: 'include'
                });
                const response = await res.json();
                if (!res.ok) throw new Error(response.message || 'Failed to fetch patient');
                console.log(response);
                setPatient(response.data);
            } catch (err) {
                toast.error(err.message);
                console.error(err);
            }
        };

        if (user) {
            setFormData(prev => ({
                ...prev,
                fullName: user.fullName || '',
                userName: user.userName || '',
                email: user.email || ''
            }));
            fetchPatient();
        }
    }, [user]);

    useEffect(() => {
        if (patient) {
            setFormData(prev => ({
                ...prev,
                gender: patient.gender || '',
                dob: patient.dob ? patient.dob.split('T')[0] : ''
            }));
        }
    }, [patient]);

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            const userRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/update-account`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    fullName: formData.fullName,
                    userName: formData.userName,
                    email: formData.email
                })
            });

            if (!userRes.ok) throw new Error('Failed to update user');

            const patientRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/patients/update-patient`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    gender: formData.gender,
                    dob: formData.dob
                })
            });

            if (!patientRes.ok) throw new Error('Failed to update patient info');

            toast.success('Profile updated!');
            setShowEditModal(false);
            await fetchUser();
        } catch (err) {
            console.error(err);
            toast.error(err.message || 'Update failed');
        }
    };

    const fetchAppointments = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/patients/get-appointments-for-patient`, {
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

            if (!res.ok) throw new Error('Failed to cancel appointment');
            toast.success('appointment cancelled')
            await fetchAppointments()

        } catch (err) {
            console.error(err);
            toast.error(err.message || 'deletion failed');
        }
    }


    const handlePayOnline = async (appointmentId) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/appointments/${appointmentId}/checkout`, {
                method: 'POST',
                credentials: 'include',
                
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to initiate payment');

            // Redirect to Stripe's Checkout page
            window.location.href = data.url;
        } catch (err) {
            toast.error(err.message || 'Something went wrong');
            console.error(err);
        }
    };



    useEffect(() => {
        if (!patient) return;
        fetchAppointments();
    }, [patient]);

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


    useEffect(()=>{
        toast("please complete payment of any pending appointment to confirm it", {
                position: 'top-center',
                duration: 3000,
                icon: 'ℹ️',
            })
    },[])


    if (!patient) return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <RiseLoader color="#80ff6f" size={15} margin={2} />
        </div>
    );

    return (
        <>
            <Navbar showMiddle={false} />
            <div className="p-6 flex flex-col gap-6">
                <h2 className="text-2xl font-semibold">Patient Profile</h2>
                <div className="flex gap-10">
                    {/* Left Section */}
                    <div className="w-1/3 bg-white rounded-xl p-4 shadow-md text-center animate-fadeInRight">
                        <img
                            src={user.avatar}
                            alt="Avatar"
                            onClick={() => setShowAvatarModal(true)}
                            className="w-24 h-24 mx-auto rounded-full object-cover cursor-pointer hover:opacity-80 transition"
                        />

                        <h3 className="mt-4 text-xl font-bold">{user.userName}</h3>
                        <p className="text-gray-600">{user.email}</p>
                    </div>

                    {/* Right Section */}
                    <div className="w-2/3 bg-white rounded-xl p-4 shadow-md animate-fadeInUp">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-semibold">Details</h3>
                            <button
                                className="bg-blue-500 hover:bg-primary-dull cursor-pointer text-white px-4 py-1 rounded-md"
                                onClick={() => setShowEditModal(true)}
                            >
                                Edit
                            </button>
                        </div>

                        <div className="mt-4 space-y-3">
                            <p><strong>Full Name:</strong> {user.fullName}</p>
                            <p><strong>Gender:</strong> {patient?.gender || 'Not provided'}</p>
                            <p><strong>Date of Birth:</strong> {patient?.dob ? patient.dob.split('T')[0] : 'Not provided'}</p>
                        </div>
                    </div>
                </div>

                {/* Optional lower section */}
                <div className="bg-white rounded-xl p-4 shadow-md min-h-[350px] animate-fadeInUp">
                    <div className='flex justify-between items-center'>
                        <h2 className="text-4xl font-semibold">Appointments</h2>
                        <button
                            onClick={() => {
                                navigate(`${globalRole}s/`)
                            }}
                            className="cursor-pointer px-8 py-2 ml-80 bg-primary hover:bg-primary-dull hover:rounded-3xl border border-gray-800 hover:scale-110 transition text-gray-800 hover:text-white rounded-2xl">
                            Book Appointments
                        </button>

                    </div>
                    <div className="space-y-2 mt-4">
                        {appointments.length ? (
                            appointments
                                .map((appt) => (
                                    <div
                                        key={appt._id}
                                        className="p-3 bg-white rounded shadow text-sm flex items-center justify-between gap-4 animate-fadeInRight"
                                    >
                                        {/* Avatar */}
                                        <img
                                            src={appt.doctor.user.avatar}
                                            alt="Doctor Avatar"
                                            className="w-14 h-14 rounded-full object-cover border"
                                        />

                                        {/* Info */}
                                        <div className="flex-1">
                                            <p>
                                                <strong>Doctor:</strong> {appt.doctor.user.fullName}
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
                                                <img
                                                    src={assets.stripe_logo}
                                                    title='Pay with stripe'
                                                    alt="Pay with Stripe"
                                                    onClick={() => handlePayOnline(appt._id)}
                                                    className="mt-2 px-3 py-1 cursor-pointer border hover:brightness-80 border-black rounded h-6"
                                                />

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
                                                            ? 'bg-red-600' : 'bg-gray-400'
                                                    }`}
                                            >
                                                {appt.status}
                                            </div>
                                        </div>

                                        {/* Cancel Button */}
                                        {appt.status === 'cancelled' ? (
                                            ""
                                        ) : (
                                            <button
                                                title="Cancel Appointment"
                                                className="text-red-500 z-10 cursor-pointer text-xl p-2 rounded-full hover:scale-110 hover:text-red-600 hover:bg-red-200 transition"
                                                onClick={() => {
                                                    setAppointmentToCancel(appt._id);
                                                    setConfirmModalOpen(true);
                                                }}
                                            >
                                                <XCircle className="w-5 h-5" />
                                            </button>

                                        )}
                                    </div>
                                ))
                        ) : (
                            <h1 className="text-center text-2xl font-semibold text-gray-500 mt-12 p-6">
                                🚫 No Appointments Found
                            </h1>
                        )}
                    </div>



                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 animate-fadeInUp">
                    <div className="bg-white p-6 rounded-xl shadow-md w-[90%] max-w-md">
                        <h3 className="text-xl font-bold mb-4">Edit Profile</h3>
                        <div className="space-y-3">
                            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Full Name" className="w-full p-2 border rounded" />
                            <input type="text" name="userName" value={formData.userName} onChange={handleChange} placeholder="Username" className="w-full p-2 border rounded" />
                            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="w-full p-2 border rounded" />
                            <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full p-2 border rounded" />
                            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-2 border rounded">
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="mt-4 flex justify-end gap-2">
                            <button className="px-4 py-1 cursor-pointer border rounded" onClick={() => setShowEditModal(false)}>Cancel</button>
                            <button className="px-4 py-1 cursor-pointer bg-primary hover:bg-primary-dull  border text-white rounded" onClick={handleSave}>Save</button>
                        </div>
                    </div>
                </div>
            )}

            {/* upload avatar modal  */}
            {showAvatarModal && (
                <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-md w-[90%] max-w-md">
                        <h3 className="text-xl font-bold mb-4">Upload New Avatar</h3>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setSelectedAvatar(e.target.files[0])}
                            className="w-full p-2 border rounded"
                        />

                        <div className="mt-4 flex justify-end gap-2">
                            <button className="px-4 py-1 border rounded cursor-pointer" onClick={() => {
                                setShowAvatarModal(false);
                                setSelectedAvatar(null);
                            }}>
                                Cancel
                            </button>
                            <button
                                className="px-4 py-1 bg-primary hover:bg-primary-dull cursor-pointer text-white rounded"
                                onClick={handleAvatarUpload}
                            >
                                Upload
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* appointment cancel modal */}
            {confirmModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-md w-[90%] max-w-sm">
                        <h3 className="text-lg font-semibold mb-4">Confirm Cancellation</h3>
                        <p>Are you sure you want to cancel this appointment?</p>
                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                className="px-4 py-1 border cursor-pointer rounded"
                                onClick={() => {
                                    setConfirmModalOpen(false);
                                    setAppointmentToCancel(null);
                                }}
                            >
                                No
                            </button>
                            <button
                                className="px-4 py-1 cursor-pointer bg-red-600 hover:bg-red-700 text-white rounded"
                                onClick={async () => {
                                    await cancelAppointment(appointmentToCancel);
                                    setConfirmModalOpen(false);
                                    setAppointmentToCancel(null);
                                }}
                            >
                                Yes, Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </>
    );
};

export default PatientProfile;
