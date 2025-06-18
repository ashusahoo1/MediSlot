import { Children, createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets_frontend/assets.js"
import toast from "react-hot-toast";


//step1: create context
export const AppContext = createContext();

//step3:make context provider i.e create and pass values, only created here passing is done below in value attribute 
export const AppContextProvider = ({ children }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [globalRole, setGlobalRole] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [avatar, setAvatar] = useState(assets.default_avatar);

    const fetchUser = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/current-user`, {
                credentials: "include", // important,to send cookies!
            });
            const response = await res.json();
            // console.log(response);

            if (res.ok) {
                setAvatar(response.data.avatar?.trim() || assets.default_avatar)
                setUser(response.data);
                setIsAuthenticated(true);
                // console.log(response.data.role)
                const newRole = response.data.role;
                setGlobalRole(newRole);
                
            } else {
                setUser(null);
                setIsAuthenticated(false);
                setGlobalRole(null);
                setAvatar(assets.default_avatar);

            }
        } catch (err) {
            setUser(null);
            setIsAuthenticated(false);
            setGlobalRole(null);
            setAvatar(assets.default_avatar);
            toast.error(err.message)
            console.log(err.message)

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);


    //!Important: call fetchUser() after login/signup to refresh context,also remove all states during logout

    const value = { user, setUser, navigate, isAuthenticated,setIsAuthenticated, loading, setLoading, globalRole, avatar, fetchUser };

    //step2:wrap everything u want to send in a context provider 
    return <AppContext.Provider value={value}>
        {children}{/* This will render whatever is inside <Parent> where parent is <ContextProvider> in main.jsx*/}
    </AppContext.Provider>
}

//step4: go to the component you want to use these variables in and use it
export const useAppContext = () => {
    return useContext(AppContext)
}