import { assets } from "../assets_frontend/assets";
import { NavLink } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-black/90 text-white px-6 md:px-16 py-10">
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-10 text-sm">
        {/* Logo & Description */}
        <div>
          <img className="mb-5 w-45 mx-auto md:mx-0" src={assets.logo} alt="MediSlot Logo" />
          <p className="text-gray-300 leading-6 text-center md:text-left">
            MediSlot is committed to excellence in healthcare technology. We continuously enhance our platform with the latest advancements to ensure a smooth experience—whether you're booking appointments or managing ongoing care.
          </p>
        </div>

        {/* Information Links */}
        <div>
          <p className="text-lg font-semibold mb-4">Information</p>
          <ul className="flex flex-col gap-2 text-gray-400">
            <p onClick={() => scrollTo(0, 0)} className="hover:text-white transition duration-200 cursor-pointer">Home</p>
            <p onClick={() => scrollTo(0, 0)} className="hover:text-white transition duration-200 cursor-pointer">About Us</p>
            <p onClick={() => scrollTo(0, 0)} className="hover:text-white transition duration-200 cursor-pointer">Book A ppointment</p>
          </ul>
        </div>

        {/* Add Optional Column 1 (e.g., Services) */}
        <div>
          <p className="text-lg font-semibold mb-4">Services</p>
          <ul className="flex flex-col gap-2 text-gray-400">
            <li className="hover:text-white transition duration-200 cursor-pointer">Online Booking</li>
            <li className="hover:text-white transition duration-200 cursor-pointer">Patient Support</li>
            <li className="hover:text-white transition duration-200 cursor-pointer">Doctor Dashboard</li>
          </ul>
        </div>

        {/* Add Optional Column 2 (e.g., Support) */}
        <div>
          <p className="text-lg font-semibold mb-4">Support</p>
          <ul className="flex flex-col gap-2 text-gray-400">
            <li className="hover:text-white transition duration-200 cursor-pointer">Help Center</li>
            <li className="hover:text-white transition duration-200 cursor-pointer">Privacy Policy</li>
            <li className="hover:text-white transition duration-200 cursor-pointer">Terms of Service</li>
          </ul>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="border-t border-gray-700 mt-10 pt-5 text-center text-gray-500 text-xs">
        &copy; {new Date().getFullYear()} MediSlot. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
