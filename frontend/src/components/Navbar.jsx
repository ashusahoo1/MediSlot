import { useState } from "react";
import { assets } from "../assets_frontend/assets";
import AuthModal from "./AuthModal";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const Navbar = (props) => {
  const { isAuthenticated, avatar, navigate, globalRole, setIsAuthenticated } = useAppContext();
  const showMiddle = props.showMiddle ?? true;
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('login');

  const openModal = (type) => {
    setModalType(type);
    setModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/logout`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error("Logout failed");
      setIsAuthenticated(false);
      navigate('/');
      toast.success("logged out")
    } catch (err) {
      console.error(err);
      toast.error(err.message)
    }
  };

  return (
    <>
      <nav className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-1 border-b border-gray-300 bg-white relative transition-all ">
        <div className="cursor-pointer">
          <img className="h-15 w-15 scale-200 -p-10 object-cover " onClick={() => navigate("/")} src={assets.logo} />
        </div>

        {/* Desktop Menu */}
        <div className="hidden sm:flex items-center gap-18">
          {showMiddle && (
            <>
              <a href="#" className="hover:scale-110 hover:text-gray-600">Home</a>
              <a href="#features" className="hover:scale-110 hover:text-gray-600">About</a>
              <a href="#footer" className="hover:scale-110 hover:text-gray-600">Contact</a>
            </>
          )}
          {!isAuthenticated ? (
            <button
              onClick={() => openModal('login')}
              className="cursor-pointer px-8 py-2 ml-80 bg-gradient-to-br from-emerald-600 to-teal-500 hover:from-primary-dull hover:to-primary-dull
                hover:scale-110 transition-all duration-300 text-white rounded-full">
              Login
            </button>
          ) : (
            <div className="relative ml-80">
              <img
                src={avatar}
                alt="avatar"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="cursor-pointer border hover:brightness-90 rounded-full h-12 w-12"
              />
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <button
                    onClick={() => {
                      navigate(`/${globalRole}s/profile`);
                      setDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500 cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <button onClick={() => setOpen(!open)} aria-label="Menu" className="sm:hidden">
          <svg width="21" height="15" viewBox="0 0 21 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="21" height="1.5" rx=".75" fill="#426287" />
            <rect x="8" y="6" width="13" height="1.5" rx=".75" fill="#426287" />
            <rect x="6" y="13" width="15" height="1.5" rx=".75" fill="#426287" />
          </svg>
        </button>

        {/* Mobile Menu */}
        <div className={`${open ? 'flex' : 'hidden'} absolute top-[60px] left-0 w-full bg-white shadow-md py-4 flex-col items-start gap-2 px-5 text-sm md:hidden`}>
          {showMiddle && (
            <>
              <a href="#" className="block">Home</a>
              <a href="#" className="block">About</a>
              <a href="#" className="block">Contact</a>
            </>
          )}

          {!isAuthenticated ? (
            <button
              onClick={() => openModal('login')}
              className="cursor-pointer px-6 py-2 mt-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full text-sm"
            >
              Login
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  navigate(`/${globalRole}s/profile`);
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                Profile
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500 cursor-pointer"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </nav>

      <AuthModal isOpen={modalOpen} onClose={() => setModalOpen(false)} type={modalType} setType={setModalType} />
    </>
  );
};

export default Navbar;
