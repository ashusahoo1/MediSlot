import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { toast } from 'react-hot-toast';
import { Search, MapPin, Navigation, Building, Heading1 } from 'lucide-react';
import { formatAddress } from '../utils/formatAdress';
import { RiseLoader } from "react-spinners";
import { useAppContext } from '../context/AppContext';

const PatientMainPage = () => {
    const { user, navigate } = useAppContext()
    const [hospitals, setHospitals] = useState([]);
    const [filters, setFilters] = useState({
        city: '',
        state: '',
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [location, setLocation] = useState({ city: '', state: '' });

    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
    });

    const fetchHospitals = async (page = 1) => {
        try {
            const queryString = new URLSearchParams({
                page,
                limit: 4,
                query: `${searchQuery} ${filters.city} ${filters.state}`.trim(),
                sortBy: 'name',
                sortType: '1'
            });

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/hospitals/get-all-hospital?${queryString.toString()}`,
                { credentials: 'include' }
            );
            const response = await res.json();
            console.log(response)
            if (!res.ok) throw new Error(response.message);

            setHospitals(response.data.docs);
            setPagination({
                page: response.data.page,
                totalPages: response.data.totalPages,
                hasNextPage: response.data.hasNextPage,
                hasPrevPage: response.data.hasPrevPage,
            });
            setLocation(response.location || {});
        } catch (err) {
            toast.error(err.message || 'Failed to fetch hospitals');
        }
    };

    const fetchNearbyHospital=async()=>{
        try {
            
        } catch (err) {
            toast.error(err.message || 'Failed to fetch hospitals');
        }
    }

    const handleSearch = () => {
        fetchHospitals(1);
    };

    const handleFindNearby = () => {
        fetchHospitals(1);
    };

    const handleInputChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        fetchHospitals(1);
    }, []);

    if (!user) return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <RiseLoader color="#80ff6f" size={15} margin={2} />
        </div>
    );

    return (
        <>
            <Navbar showMiddle={false} />
            <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-160 p-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
                    {/* Left Section */}
                    <div className="flex-1">
                        <div className="mb-8">
                            <h2 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3 animate-fadeInRight">
                                <Building className="text-blue-600" size={28} />
                                Search For Hospitals in Your Area
                            </h2>
                            <p className="text-gray-600 text-lg animate-fadeInRight">Discover quality healthcare near you</p>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {hospitals.length ? hospitals.map(hospital => (
                                <div
                                    onClick={()=>{
                                        navigate(`hospitals/${hospital._id}`)
                                    }}
                                    key={hospital._id}
                                    className="group p-4 rounded-2xl cursor-pointer animate-fadeInRight bg-white shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-blue-500"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="bg-blue-100 p-4 rounded-lg">
                                            <MapPin className="text-blue-600" size={32} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-800 mb-1">{hospital.name}</h3>
                                            <p className="text-gray-600 mb-2">
                                                {formatAddress(hospital.address)}
                                            </p>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                                                    {hospital.city}
                                                </span>
                                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                                    {hospital.state}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) : (<h1 className="text-center text-2xl font-semibold text-gray-500 mt-12 p-6">
                                🚫 No Hospitals Found 
                            </h1>)
                            }
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="mt-6 flex justify-center items-center gap-3 animate-fadeInRight">
                                <button
                                    disabled={!pagination.hasPrevPage}
                                    onClick={() => fetchHospitals(pagination.page - 1)}
                                    className="px-4 py-2 rounded bg-blue-100 text-blue-800 font-semibold disabled:opacity-50"
                                >
                                    Prev
                                </button>
                                <span className="font-medium text-gray-700">
                                    Page {pagination.page} of {pagination.totalPages}
                                </span>
                                <button
                                    disabled={!pagination.hasNextPage}
                                    onClick={() => fetchHospitals(pagination.page + 1)}
                                    className="px-4 py-2 rounded bg-blue-100 text-blue-800 font-semibold disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right Section */}
                    <div className="w-full md:w-96 animate-fadeInUp">
                        <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 sticky top-6">
                            <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                                <Search className="text-blue-600" size={24} />
                                Find Hospitals
                            </h3>

                            <div className="space-y-5">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search hospitals..."
                                        value={searchQuery}
                                        onChange={handleInputChange}
                                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                                    />
                                    <Search className="absolute left-4 top-4 text-gray-400" size={20} />
                                </div>

                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        name="city"
                                        placeholder="City"
                                        value={filters.city}
                                        onChange={handleFilterChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                                    />
                                    <input
                                        type="text"
                                        name="state"
                                        placeholder="State"
                                        value={filters.state}
                                        onChange={handleFilterChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                                    />
                                </div>

                                <button
                                    onClick={handleSearch}
                                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-4 rounded-xl font-semibold transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                                >
                                    <Search size={20} />
                                    Search Hospitals
                                </button>

                                <button
                                    onClick={handleFindNearby}
                                    className="w-full bg-gray-50 cursor-pointer hover:bg-gray-100 text-gray-800 py-4 rounded-xl font-semibold transition-all border-2 border-dashed border-gray-200 hover:border-solid hover:border-blue-200 flex items-center justify-center gap-2"
                                >
                                    <Navigation className="text-blue-500" size={20} />
                                    Find Nearby Hospitals
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PatientMainPage;
