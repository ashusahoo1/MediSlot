import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { useAppContext } from '../context/AppContext';
import { RiseLoader } from 'react-spinners';

const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DoctorScheduleForm = () => {
  const { user,navigate } = useAppContext()
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleAddDay = () => {
    setSchedule(prev => [
      ...prev,
      {
        day: '',
        startTime: '',
        endTime: '',
        breaks: []
      }
    ]);
  };

  const handleRemoveDay = (index) => {
    setSchedule(prev => prev.filter((_, i) => i !== index));
  };

  const handleScheduleChange = (index, field, value) => {
    const updated = [...schedule];
    updated[index][field] = value;
    setSchedule(updated);
  };

  const handleAddBreak = (index) => {
    const updated = [...schedule];
    updated[index].breaks.push({ breakStart: '', breakEnd: '' });
    setSchedule(updated);
  };

  const handleBreakChange = (dayIndex, breakIndex, field, value) => {
    const updated = [...schedule];
    updated[dayIndex].breaks[breakIndex][field] = value;
    setSchedule(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/doctors/set-schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ schedule })
      });
      console.log(schedule)
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save schedule");
      navigate("/doctors/profile")

      toast.success("Schedule updated successfully!");
    } catch (err) {
      toast.error(err.message);
      console.log(err)
    }
  };

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/doctors/get-doctor-details`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch schedule");

        if (Array.isArray(data?.data?.schedule)) {
          setSchedule(data.data.schedule);
        }
      } catch (err) {
        console.error(err.message);
        toast.error("Could not load existing schedule");
      }finally {
      setLoading(false);
    }
    };

    fetchSchedule();
  }, []);

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
      <div className="max-w-3xl mx-auto p-6 mt-10">
        <h2 className="text-2xl font-semibold mb-4">Set Your Schedule</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {schedule.map((item, index) => (
            <div key={index} className="border p-4 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <select
                  value={item.day}
                  onChange={(e) => handleScheduleChange(index, 'day', e.target.value)}
                  className="p-2 border rounded"
                  required
                >
                  <option value="">Select Day</option>
                  {weekdays.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => handleRemoveDay(index)}
                  className="text-red-500 hover:underline ml-4"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="time"
                  value={item.startTime}
                  onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)}
                  className="p-2 border rounded"
                  required
                />
                <input
                  type="time"
                  value={item.endTime}
                  onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)}
                  className="p-2 border rounded"
                  required
                />
              </div>

              <div className="mt-4">
                <p className="font-semibold mb-2">Breaks</p>
                {item.breaks.map((br, brIdx) => (
                  <div key={brIdx} className="grid grid-cols-2 gap-4 mb-2">
                    <input
                      type="time"
                      value={br.breakStart}
                      onChange={(e) => handleBreakChange(index, brIdx, 'breakStart', e.target.value)}
                      className="p-2 border rounded"
                      required
                    />
                    <input
                      type="time"
                      value={br.breakEnd}
                      onChange={(e) => handleBreakChange(index, brIdx, 'breakEnd', e.target.value)}
                      className="p-2 border rounded"
                      required
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleAddBreak(index)}
                  className="text-blue-500 hover:underline mt-1"
                >
                  Add Break
                </button>
              </div>
            </div>
          ))}

          <div className="flex gap-4">
            <button type="button" onClick={handleAddDay} className="bg-gray-700 text-white px-4 py-2 rounded">
              Add Day
            </button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
              Submit Schedule
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default DoctorScheduleForm;
