import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import Navbar from "../components/Navbar";
import { RiseLoader } from "react-spinners";
import { useAppContext } from "../context/AppContext";
import { Crosshair } from "lucide-react";
import MapContainer from "../components/MapContainer";


const HospitalMainPage = () => {
    const { navigate, user } = useAppContext()
    const { hospitalId } = useParams();
    const [hospital, setHospital] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [filters, setFilters] = useState({
        search: "",
        specialization: [],
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

    const [showMap, setShowMap] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [markerIndex, setMarkerIndex] = useState(-1);
    const [locInfo, setLocInfo] = useState([]);
    const [viewPort, setViewPort] = useState({
        latitude: 22.5726,
        longitude: 88.3639,
        zoom: 12,
        pitch: 0,//makes the map more 3d higher the value is
    });

    const focusOnMarkerHandler = (index) => {
        if (!locInfo[index]) return;
        setMarkerIndex(index);
        setViewPort((prevData) => {
            return {
                ...prevData,
                latitude: locInfo[index].lat,
                longitude: locInfo[index].lon,
            };
        });
    };

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setUserLocation({ lat: latitude, lon: longitude });

                setViewPort((prev) => ({
                    ...prev,
                    latitude,
                    longitude
                }));

                setLocInfo((prev) => [
                    ...prev,
                    {
                        lon: longitude,
                        lat: latitude,
                        name: "You",
                    }
                ])
            },
            (err) => console.error("Geolocation error:", err),
            { enableHighAccuracy: true }
        );
    }, []);



    const fetchHospital = async () => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/hospitals/${hospitalId}`,
                {
                    credentials: "include",
                }
            );
            const data = await res.json();
            console.log(data);
            if (!res.ok) throw new Error(data.message);
            setHospital(data.data);
            setLocInfo((prev) => [
                ...prev,
                {
                    lon: data.data.location.coordinates[0],
                    lat: data.data.location.coordinates[1],
                    name: data.data.name,
                    place: "Hospital"
                }
            ])
        } catch (err) {
            toast.error(err.message);
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

            // console.log(queryParams.toString());
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/doctors/get-all-doctors?${queryParams.toString()}`,
                { credentials: "include" }
            );
            const data = await res.json();
            // console.log(data)
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
    }, [hospitalId]);

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
                <div className="w-3/4 space-y-6 ">
                    {/* Hospital Info */}
                    {hospital && (
                        <div className="bg-white p-6 rounded-xl shadow flex gap-6 items-center animate-fadeInRight">
                            <img
                                src={hospital.user?.avatar}
                                alt="Hospital Avatar"
                                className="w-28 h-28 object-cover rounded-full border"
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
                            <button
                                title="Show Location"
                                className="ml-auto bg-red-500 hover:bg-red-600 text-white p-2 rounded-full flex items-center justify-center w-10 h-10"
                                onClick={() => setShowMap(true)}
                            >
                                <Crosshair size={20} />
                            </button>


                        </div>
                    )}

                    {/* map pop up */}
                    {showMap && hospital?.location?.coordinates[0] && hospital?.location?.coordinates[1] && userLocation && (
                        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fadeInUp">
                            <div className="relative bg-white w-[90vw] max-w-[700px] aspect-square rounded-lg shadow-lg">


                                {/* Optional Close Button - top center */}
                                <button
                                    onClick={() => setShowMap(false)}
                                    className="absolute z-10 top-2 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-3 py-1 rounded-full text-sm shadow hover:bg-red-600 transition"
                                >
                                    Close Map
                                </button>

                                <MapContainer
                                    markerIndex={markerIndex}
                                    locInfo={locInfo}
                                    viewPort={viewPort}
                                    onviewPortChange={(vp) => {
                                        setViewPort(vp);
                                        if (markerIndex !== -1) setMarkerIndex(-1);
                                    }}
                                    focusOnMarker={focusOnMarkerHandler}
                                />
                            </div>
                        </div>
                    )}



                    {/* Doctor List */}
                    <div className="space-y-4 ">
                        <h1 className="text-4xl animate-fadeInRight"><strong>Doctors</strong></h1>
                        {doctors.length ? (
                            doctors.map((doc) => (
                                <div
                                    key={doc._id}
                                    className="bg-white p-4 animate-fadeInRight rounded-lg shadow hover:shadow-lg transition flex justify-between items-center"
                                >
                                    <div className="flex gap-4 items-start">
                                        <img
                                            src={doc.user?.avatar}
                                            alt={doc.user?.fullName}
                                            className="w-20 h-20 object-cover rounded-full border"
                                        />
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h2 className="text-xl font-semibold">{doc.user?.fullName}</h2>
                                                {doc.verified && (
                                                    <span className="text-green-600 text-sm font-semibold">✔ Verified</span>
                                                )}
                                            </div>
                                            <p><strong>Specialization:</strong> {doc.specialization}</p>
                                            <p><strong>Experience:</strong> {doc.experience} years</p>
                                            <p><strong>Hourly Fee:</strong> ₹{doc.hourlyRate}</p>
                                        </div>
                                    </div>

                                    <button
                                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                                        onClick={() => {
                                            // TODO: add your booking logic here, e.g. navigate or open modal
                                            navigate(`/doctors/${doc._id}`)
                                        }}
                                    >
                                        Book Appointment
                                    </button>
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
                </div>
            </div>
        </>
    );
};

export default HospitalMainPage;
