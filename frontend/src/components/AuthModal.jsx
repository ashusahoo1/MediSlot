import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';

const AuthModal = ({ isOpen, onClose, type, setType }) => {
  const {fetchUser, navigate}=useAppContext()

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [userName, setUserName] = useState('');
  const [role, setRole] = useState("");
  const [isLogin, setIsLogin] = useState(true);
 
  if (!isOpen) return null;

const handleSubmit = async (e) => {
  e.preventDefault();

  const url = isLogin
    ? `${import.meta.env.VITE_BACKEND_URL}/users/login`
    : `${import.meta.env.VITE_BACKEND_URL}/users/register`;

  const payload = isLogin
    ? { email, password }
    : {
        fullName: name,
        email,
        password,
        userName,
        role: role.toLowerCase(),
      };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      credentials: "include"
    });

    const res = await response.json();


    if (!response.ok) {
      throw new Error(res.message || (isLogin ? "Login failed" : "Registration failed"));
    }

    console.log(isLogin ? "User logged in:" : "User registered:", res);
    await fetchUser();//TODO: Check if this is working or not

    const roleToNavigate = res.data.user.role;
    console.log(res.data.user.role)
    navigate(`/${roleToNavigate}s/complete`)
    onClose(); // Close modal
  } catch (error) {
    console.error(isLogin ? "Login error:" : "Registration error:", error.message);
    toast.error(error.message)
  }
};



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fadeIn">
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-md relative overflow-hidden animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X size={24} onClick={()=>{
            setIsLogin(true);
          }}/>
        </button>
        
        {/* Colorful top bar */}
        <div className="h-2 bg-gradient-to-r from-emerald-600 to-teal-500"></div>
        
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">
            {type === 'login' ? 'Welcome Back' : 'Create an Account'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            {type === 'signup' && (
              <>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  User Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter your username"
                    required
                  />
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-400"
                    placeholder="Enter your username"
                    required
                  >
                    <option value="" disabled selected hidden>Select a role</option>
                    <option value="Doctor" className='text-black'>Doctor</option>
                    <option value="Patient" className='text-black'>Patient</option>
                    <option value="Hospital" className='text-black'>Hospital</option>
                  </select>
                 
                </div>
              </div>
              </>
            )}
            
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder={type === 'login' ? "Enter your password" : "Create a password"}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            {type === 'login' && (
              <div className="flex justify-end mb-6">
                <a href="#" className="text-sm text-emerald-600 hover:text-emerald-800 transition-colors">
                  Forgot your password?
                </a>
              </div>
            )}
            
            <button
              type="submit"
              className="w-full cursor-pointer py-2 px-4 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-medium rounded-md hover:opacity-90 transition-opacity shadow-md"
            >
              {type === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {type === 'login' ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => {
                  setType(type === 'login' ? 'signup' : 'login');
                  setIsLogin(!isLogin);
                  // console.log(isLogin)
                }}
                className="ml-1 text-emerald-600 hover:text-emerald-800 transition-colors font-medium"
              >
                {type === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
          
          {/* <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="py-2 px-4 border border-gray-300 rounded-md flex justify-center items-center text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </button>
              <button
                type="button"
                className="py-2 px-4 border border-gray-300 rounded-md flex justify-center items-center text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    fill="#1877F2"
                  />
                </svg>
                Facebook
              </button>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;