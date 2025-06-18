import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import Navbar from "../components/Navbar";
import { RiseLoader } from "react-spinners";
import { useAppContext } from "../context/AppContext";
import { Check, X } from "lucide-react";


const HospitalProfile = () => {
    const { navigate, fetchUser } = useAppContext()
    const { hospitalId } = useParams();
    const [hospital, setHospital] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const [filters, setFilters] = useState({
        search: "",
        specialization: [],
        verificationStatus: "all"
    });

    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
    });


    const specializationOptions = [
        "Cardiology",
        "Dermatology",
        "Orthopedics",
        "Pediatrics",
        "Psychiatry",
        "General Medicine",
        "Neurology",
        "ENT",
        "Radiology",

    ];

    const fetchHospital = async () => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/hospitals/get-hospital`,
                {
                    credentials: "include",
                }
            );
            const data = await res.json();
            // console.log(data);
            if (!res.ok) throw new Error(data.message);
            setHospital(data.data);
        } catch (err) {
            toast.error(err.message);
            console.log(err.message)
        }
    };

    const fetchDoctors = async (page = 1) => {
        try {
            const queryParams = new URLSearchParams({
                hospitalId,
                page,
                limit: 4,
                query: filters.search || filters.specialization
            });

            if (filters.verificationStatus !== "all") {
                queryParams.append("verified", filters.verificationStatus === "verified");
            }

            console.log(queryParams.toString());
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/doctors/get-all-doctors?${queryParams.toString()}`,
                { credentials: "include" }
            );
            const data = await res.json();
            console.log(data)
            if (!res.ok) throw new Error(data.message);

            setDoctors(data.data.docs);
            setPagination({
                page: data.data.page,
                totalPages: data.data.totalPages,
                hasNextPage: data.data.hasNextPage,
                hasPrevPage: data.data.hasPrevPage,
            });
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleToggleVerification = async (doctorId) => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/doctors/change-verification`,
                {
                    method: "PATCH",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ doctorId }),
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            toast.success("Verification status updated.");
            fetchDoctors(pagination.page); // Refresh the list
        } catch (err) {
            toast.error(err.message || "Failed to update verification.");
        }
    };


    const handleCheckboxChange = (value) => {
        setFilters((prev) => {
            const alreadySelected = prev.specialization.includes(value);
            const updated = alreadySelected
                ? prev.specialization.filter((item) => item !== value)
                : [...prev.specialization, value];
            return { ...prev, specialization: updated };
        });
    };

    const handleSearchSubmit = () => {
        fetchDoctors(1);
    };

    const handleReset = () => {
        setFilters({ search: "", specialization: [] });
        fetchDoctors(1);
    };

    useEffect(() => {
        fetchHospital();
        fetchDoctors(1);
    }, [hospitalId, filters.verificationStatus]);

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

    if (!hospital) return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <RiseLoader color="#80ff6f" size={15} margin={2} />
        </div>
    );

    return (
        <>
            <Navbar showMiddle={false} />
            <div className="p-6 flex gap-6 min-h-screen bg-gray-50">
                {/* Left Filter Panel */}
                <div className="w-1/4 space-y-6 bg-white rounded-xl shadow p-4 h-fit sticky top-20 animate-fadeInUp">
                    <input
                        type="text"
                        placeholder="Search doctor by name"
                        value={filters.search}
                        onChange={(e) =>
                            setFilters((prev) => ({ ...prev, search: e.target.value }))
                        }
                        className="w-full p-2 border rounded"
                    />

                    <div className="space-y-2">
                        {specializationOptions.map((spec) => (
                            <label key={spec} className="block text-sm">
                                <input
                                    type="checkbox"
                                    value={spec}
                                    checked={filters.specialization.includes(spec)}
                                    onChange={() => handleCheckboxChange(spec)}
                                    className="mr-2"
                                />
                                {spec}
                            </label>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleSearchSubmit}
                            className="bg-blue-500 text-white px-4 py-1 rounded"
                        >
                            Search
                        </button>
                        <button
                            onClick={handleReset}
                            className="border px-4 py-1 rounded cursor-pointer"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="w-3/4 space-y-6">
                    {/* Hospital Info */}
                    {hospital && (
                        <div className="bg-white p-6 rounded-xl shadow flex gap-6 items-center animate-fadeInRight">
                            <img
                                src={hospital.user?.avatar}
                                alt="Hospital Avatar"
                                onClick={() => setShowAvatarModal(true)}
                                className="w-28 h-28 object-cover rounded-full border cursor-pointer hover:opacity-90 "
                            />
                            <div className="space-y-1">
                                <h1 className="text-2xl font-bold">{hospital.name}</h1>
                                <p><strong>HRN:</strong> {hospital.HRN}</p>
                                <p><strong>Contact:</strong> {hospital.contactNumber}</p>
                                <p><strong>Email:</strong> {hospital.user?.email}</p>
                                <p>
                                    <strong>Address:</strong>{" "}
                                    {`${hospital.name}, ${hospital.address.street}, ${hospital.address.city}, ${hospital.address.state}, ${hospital.address.country}, ${hospital.address.postcode}`}
                                </p>
                                {hospital.verified && (
                                    <span className="text-green-600 font-semibold">✔ Verified</span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Doctor List */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h1 className="text-4xl font-bold animate-fadeInRight">Doctors</h1>
                            <select
                                value={filters.verificationStatus}
                                onChange={(e) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        verificationStatus: e.target.value,
                                    }))
                                }
                                className="border px-3 py-1 rounded"
                            >
                                <option value="verified">Verified</option>
                                <option value="unverified">Unverified</option>
                                <option value="all">All</option>
                            </select>
                        </div>

                        {doctors.length ? (
                            doctors.map((doc) => (
                                <div
                                    key={doc._id}
                                    className="bg-white animate-fadeInRight p-4 rounded-lg shadow hover:shadow-lg transition flex justify-between items-center"
                                >
                                    <div className="flex gap-4 items-start">
                                        <img
                                            src={doc.user?.avatar}
                                            alt={doc.user?.fullName}
                                            onClick={() => { navigate(`doctors/${doc._id}`) }}
                                            className="w-20 h-20 object-cover rounded-full border hover:brightness-90 cursor-pointer"
                                        />
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h2
                                                    onClick={() => { navigate(`doctors/${doc._id}`) }}
                                                    className="text-xl font-semibold cursor-pointer"
                                                >
                                                    {doc.user?.fullName}
                                                </h2>
                                                {doc.verified && (
                                                    <span className="text-green-600 text-sm font-semibold">✔ Verified</span>
                                                )}
                                            </div>
                                            <p><strong>Specialization:</strong> {doc.specialization}</p>
                                            <p><strong>Experience:</strong> {doc.experience} years</p>
                                            <p><strong>Hourly Fee:</strong> ₹{doc.hourlyRate}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 items-center">
                                        <button
                                            onClick={() => handleToggleVerification(doc._id)}
                                            className={`p-2 rounded-full border transition hover:scale-110 ${doc.verified ?  "text-red-600 border-red-600" :"text-green-600 border-green-600" 
                                                }`}
                                            title={doc.verified ? "Unverify" : "Verify"}
                                        >
                                            {doc.verified ? <X size={20} /> : <Check size={20} />}
                                        </button>
                                    </div>
                                </div>

                            ))
                        ) : (
                            <p className="text-gray-500 text-center mt-4 text-lg">
                                No doctors found.
                            </p>
                        )}
                    </div>


                    {/* Pagination Controls */}
                    {pagination.totalPages > 1 && (
                        <div className="mt-6 flex justify-center items-center gap-3">
                            <button
                                disabled={!pagination.hasPrevPage}
                                onClick={() => fetchDoctors(pagination.page - 1)}
                                className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold disabled:opacity-50"
                            >
                                Prev
                            </button>
                            <span className="font-medium text-gray-700">
                                Page {pagination.page} of {pagination.totalPages}
                            </span>
                            <button
                                disabled={!pagination.hasNextPage}
                                onClick={() => fetchDoctors(pagination.page + 1)}
                                className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}

                    {showEditModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                            <div className="bg-white p-6 rounded-xl shadow max-w-lg w-full">
                                <h2 className="text-xl font-bold mb-4">Edit Hospital Profile</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium">Hospital Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full p-2 border rounded"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium">Contact Number</label>
                                        <input
                                            type="text"
                                            name="contactNumber"
                                            value={formData.contactNumber}
                                            onChange={handleChange}
                                            className="w-full p-2 border rounded"
                                        />
                                    </div>

                                    {Object.keys(formData.address).map((field) => (
                                        <div key={field}>
                                            <label className="block text-sm font-medium capitalize">{field}</label>
                                            <input
                                                type="text"
                                                name={field}
                                                value={formData.address[field]}
                                                onChange={handleChange}
                                                className="w-full p-2 border rounded"
                                            />
                                        </div>
                                    ))}

                                    <div className="flex gap-2 justify-end">
                                        <button
                                            onClick={() => setShowEditModal(false)}
                                            className="px-4 py-2 rounded border"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showAvatarModal && (
                <div className="fixed inset-0 bg-black/70 flex justify-center items-center  z-50">
                    <div className="bg-white p-6 rounded-xl shadow-md w-[90%] max-w-md">
                        <h3 className="text-xl font-bold mb-4">Upload New Avatar</h3>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setSelectedAvatar(e.target.files[0])}
                            className="w-full p-2 border rounded"
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
        </>
    );
};

export default HospitalProfile;


