import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAppContext } from '../context/AppContext';
import { toast } from 'react-hot-toast';
import { Clock } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { RiseLoader } from 'react-spinners';

// Sunday-start days of week matching JS getDay() output
const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];


const DoctorMainPage = () => {
    const { doctorId } = useParams();
    const { user } = useAppContext();

    const [doctor, setDoctor] = useState(null);
    const [schedule, setSchedule] = useState([]);
    const [currSchedule, setCurrSchedule] = useState({});
    const [appointments, setAppointments] = useState([]);
    const [appointmentStart, setAppointmentStart] = useState('');
    const [duration, setDuration] = useState(20);
    const [unavailability, setUnavailability] = useState(null);

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



    // Get upcoming dates for next 7 days starting from Sunday(0)
    const getAllUpcomingDates = () => {
        const today = new Date();//give todays date
        const todayIndex = today.getDay(); //send a number where: 0=Sun,...6=Sat

        return Array.from({ length: 7 }, (_, idx) => {
            const delta = (idx - todayIndex + 7) % 7;
            const result = new Date(today);
            result.setDate(today.getDate() + delta);
            return result;
        });
    };

    // Initial selected day index is today JS day (0-6)
    const [selectedDay, setSelectedDay] = useState(new Date().getDay());
    const [upcomingDates, setUpcomingDates] = useState(getAllUpcomingDates());
    const [selectedDate, setSelectedDate] = useState(upcomingDates[selectedDay]);

    useEffect(() => {
        setSelectedDate(upcomingDates[selectedDay]);
    }, [selectedDay, upcomingDates]);

    const fetchAppointments = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/appointments/fetch?doctorId=${doctorId}`, {
                credentials: 'include',
            });
            const response = await res.json();
            console.log(response)
            if (!res.ok) throw new Error(response.message);
            setAppointments(response.data);
        } catch (err) {
            console.error(err);
            toast.error(err.message || 'Failed to load appointments');
        }
    };

    const fetchDoctor = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/doctors/${doctorId}`, {
                credentials: 'include',
            });

            const response = await res.json();
            if (!res.ok) throw new Error(response.message);

            setDoctor(response.data);
            setSchedule(response.data.schedule);

            // Set current schedule based on JS UTC day index (0–6)
            const currentUTCDay = new Date().getUTCDay();
            setCurrSchedule(response.data.schedule[currentUTCDay] || {});

            // Get most recent unavailability (if any), sort descending by startDate
            const mostRecentUnavail = (response.data.unavailableStatus || [])
                .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0] || null;

            // Only set if doctor is currently unavailable (i.e., current UTC time < endDate UTC)
            const nowUTC = new Date();
            if (mostRecentUnavail && nowUTC < new Date(mostRecentUnavail.endDate)) {
                setUnavailability({
                    ...mostRecentUnavail,
                    startDate: new Date(mostRecentUnavail.startDate).toUTCString(),
                    endDate: new Date(mostRecentUnavail.endDate).toUTCString()
                });
            } else {
                setUnavailability(null);
            }

        } catch (err) {
            toast.error(err.message || 'Failed to load doctor info');
        }
    };



    useEffect(() => {
        if (user) {
            fetchDoctor();
            fetchAppointments();
        }
    }, [user, doctorId]);

    const bookAppointment = async () => {
        if (!appointmentStart) return toast.error('Select a start time');

        try {
            const [hours, minutes] = appointmentStart.split(':').map(Number);

            const startDate = new Date(selectedDate);
            startDate.setHours(hours, minutes, 0, 0);

            const endDate = new Date(startDate.getTime() + duration * 60000);
            console.log(startDate)

            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/appointments/${doctorId}/book`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ startTime: startDate, endTime: endDate }),
            });
            console.log(JSON.stringify({ startTime: startDate, endTime: endDate }))

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            await fetchAppointments()
            toast.success('Appointment booked successfully');

        } catch (err) {
            toast.error(err.message || 'Failed to book appointment');
        }
    };

    if (!doctor)
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <RiseLoader color="#80ff6f" size={15} margin={2} />
            </div>
        );

    return (
        <>
            <Navbar showMiddle={false} />
            <div className="flex min-h-[100vh]">
                {/* Doctor Info Section */}
                <div className="w-full md:w-2/9 bg-white p-6 shadow-md border-r border-gray-200 flex flex-col items-center animate-fadeInUp">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Doctor Details</h2>
                    {doctor ? (
                        <div className="space-y-3 text-center text-gray-700 w-full">
                            {/* Avatar */}
                            {doctor.user.avatar && (
                                <img
                                    src={doctor.user.avatar}
                                    alt="Doctor Avatar"
                                    className="w-24 h-24 rounded-full object-cover mx-auto mb-2 border"
                                />
                            )}

                            {/* Info */}
                            <p>
                                <strong>Name:</strong> {doctor.user.fullName}
                            </p>
                            <p>
                                <strong>Email:</strong> {doctor.user.email}
                            </p>
                            <p>
                                <strong>Specialization:</strong> {doctor.specialization}
                            </p>
                            <p>
                                <strong>Hourly Rate:</strong> ₹{doctor.hourlyRate}
                            </p>
                        </div>
                    ) : (
                        <p>Loading doctor info...</p>
                    )}
                </div>

                {/* Appointment Booking Section */}
                <div className="w-full md:w-7/8 flex flex-col lg:flex-row animate-fadeInRight">
                    <div className="w-full lg:w-2/3 p-6 bg-gray-50 overflow-y-auto">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Book Appointments</h2>

                        <div className="flex gap-2 mb-6">
                            {daysOfWeek.map((day, idx) => (
                                <div key={idx} className="flex flex-col items-center">
                                    <button
                                        onClick={() => {
                                            setSelectedDay(idx);
                                            const jsWeekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                                            const selectedDayName = jsWeekdays[upcomingDates[idx].getDay()];
                                            setCurrSchedule(schedule.find(s => s.day === selectedDayName) || {});
                                        }}
                                        className={`px-4 py-2 rounded-full text-sm font-medium border transition ${selectedDay === idx
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-white text-gray-700 border-gray-300'
                                            }`}
                                    >
                                        {day}
                                    </button>
                                    <span className="text-xs mt-1 text-gray-500">
                                        {upcomingDates[idx].toLocaleDateString(undefined, {
                                            day: 'numeric',
                                            month: 'short',
                                        })}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4">
                            {/* Start & End Time in One Row */}
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-gray-600 font-medium">Start Time</label>
                                    <div className="mt-1 w-full border rounded px-3 py-2 bg-gray-100 text-gray-800">
                                        {currSchedule.startTime || 'Not Set'}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-gray-600 font-medium">End Time</label>
                                    <div className="mt-1 w-full border rounded px-3 py-2 bg-gray-100 text-gray-800">
                                        {currSchedule.endTime || 'Not Set'}
                                    </div>
                                </div>
                            </div>

                            {/* Breaks in Full Row */}
                            <div>
                                <label className="block text-gray-600 font-medium mt-4">Breaks</label>
                                {currSchedule.breaks?.length ? (
                                    currSchedule.breaks.map((item, index) => (
                                        <div
                                            key={index}
                                            className="mt-1 w-full border rounded px-3 py-2 bg-gray-100 text-gray-800"
                                        >
                                            {item.breakStart}-{item.breakEnd}
                                        </div>
                                    ))
                                ) : (
                                    <div className="mt-1 w-full border rounded px-3 py-2 bg-gray-100 text-gray-500">
                                        No Breaks
                                    </div>
                                )}
                            </div>
                            {unavailability && (
                                <div className="mt-4">
                                    <label className="block text-red-600 font-medium">Doctor Unavailable During:</label>
                                    <div className="mt-1 w-full border rounded px-3 py-2 bg-red-100 text-red-800">
                                        From <strong>{formatUTC(unavailability.startDate)}</strong> to <strong>{formatUTC(unavailability.endDate)}</strong>
                                    </div>
                                </div>
                            )}


                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">All Appointments</h3>
                                <div className="space-y-2">
                                    {appointments.length ? (
                                        appointments
                                            .filter((appt) => appt.status !== 'cancelled')
                                            .map((appt, idx) => (
                                                <div
                                                    key={idx}
                                                    className="p-3 animate-fadeInRight bg-white rounded shadow text-sm flex items-center justify-between gap-4"
                                                >
                                                    {/* Avatar */}
                                                    <img
                                                        src={appt.patient.user.avatar}
                                                        alt="Patient Avatar"
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
                                                    </div>

                                                    {/* Fee */}
                                                    <div className="text-center text-gray-800 font-semibold min-w-[80px]">
                                                        ₹{appt.fee}
                                                    </div>

                                                    {/* Status */}
                                                    <div
                                                        className={`px-3 py-1 rounded-full text-xs font-semibold text-white text-center min-w-[80px] ${appt.status === 'pending'
                                                            ? 'bg-yellow-500'
                                                            : appt.status === 'completed'
                                                                ? 'bg-green-600'
                                                                : 'bg-gray-400'
                                                            }`}
                                                    >
                                                        {appt.status}
                                                    </div>
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
                    </div>

                    {/* Appointment Time Selection */}
                    <div className="w-full lg:w-1/3 p-6 bg-white border-l border-gray-200 animate-fadeInUp">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Clock size={20} className="text-blue-500" /> Select Time Slot
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-600 font-medium">Appointment Start Time</label>
                                <input
                                    type="time"
                                    value={appointmentStart}
                                    onChange={(e) => setAppointmentStart(e.target.value)}
                                    className="mt-1 w-full border rounded px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-600 font-medium">Duration</label>
                                <select
                                    value={duration}
                                    onChange={(e) => setDuration(Number(e.target.value))}
                                    className="mt-1 w-full border rounded px-3 py-2"
                                >
                                    <option value={20}>20 minutes</option>
                                    <option value={30}>30 minutes</option>
                                    <option value={60}>60 minutes</option>
                                </select>

                                <button
                                    onClick={() => {
                                        bookAppointment();
                                    }}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded mt-4 transition"
                                >
                                    Book Appointment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DoctorMainPage;
