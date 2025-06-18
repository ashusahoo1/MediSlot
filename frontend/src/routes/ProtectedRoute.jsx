import { Navigate, Outlet } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useEffect } from 'react';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useAppContext(); // ✅ access loading
    useEffect(() => {
        console.log("Current user:", user);
    }, [user]);

    if (loading) {
        return <div>Loading...</div>; // or a spinner
    }


    if (!user) {
        console.log("no user found");
        return <Navigate to="/" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        console.log("incorrect role");
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;

