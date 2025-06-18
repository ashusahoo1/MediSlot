import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { RiseLoader } from 'react-spinners';
import Footer from '../components/Footer';
import { Calendar, Clock, CheckCircle } from 'lucide-react';
import HowItWorks from '../components/HowItWorks';
import Features from '../components/Features';
import Testimonials from '../components/Testimonials';
import RotatingText from '../components/RotatingText ';


const Home = () => {
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setIsVisible(true);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <RiseLoader color="#80ff6f" size={15} margin={2} />
      </div>
    );
  }

  return (

    <>
      <Navbar />
      <section className="pt-28 pb-20 md:pt-32 md:pb-24 bg-gradient-to-b from-emerald-50 to-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            {/* Hero Text */}
            <div
              className={`w-full md:w-1/2 transition-opacity duration-700 ${isVisible ? 'animate-fadeInUp opacity-100' : 'opacity-0'
                }`}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Medical Appointments
                <div className='flex gap-5 items-center'>
                <p>Made</p>
                <RotatingText
                  texts={['Simple!', 'Easy!', 'Smart!']}
                  mainClassName="px-4 bg-green-800 text-white text-3xl sm:text-4xl overflow-hidden py-2 justify-center rounded-lg w-fit"
                  staggerFrom={'first'}
                />
                </div>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Schedule, manage, and attend your medical appointments with ease. No more waiting on hold or filling out paper forms.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-9 py-4 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-medium  rounded-md hover:opacity-90 transition-opacity shadow-lg shadow-emerald-200">
                  Get Started
                </button>
              </div>
              <div className="mt-8 flex items-center space-x-6">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mr-2" />
                  <span className="text-gray-700">Easy Booking</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mr-2" />
                  <span className="text-gray-700">24/7 Access</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mr-2" />
                  <span className="text-gray-700">Secure</span>
                </div>
              </div>
            </div>

            {/* Appointment Card */}
            <div className="w-full md:w-1/2 relative opacity-0 animate-fadeIn animation-delay-500">
              <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 transform hover:scale-105 transition-transform duration-500 relative z-10">
                <div className="absolute -top-4 -right-4 bg-emerald-100 rounded-full p-3">
                  <Calendar className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Upcoming Appointment</h3>
                <div className="space-y-4">
                  <div className="flex items-center p-3 border-l-4 border-emerald-500 bg-emerald-50 rounded-r-md">
                    <div className="mr-4">
                      <Calendar className="h-8 w-8 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium">Dr. Sarah Johnson</p>
                      <p className="text-sm text-gray-600">General Checkup</p>
                    </div>
                    <div className="ml-auto flex items-center">
                      <Clock className="h-4 w-4 text-emerald-600 mr-1" />
                      <span className="text-sm">Tomorrow, 10:30 AM</span>
                    </div>
                  </div>

                  <div className="flex items-center p-3 border border-gray-200 rounded-md">
                    <div className="mr-4">
                      <Calendar className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium">Dr. Michael Lee</p>
                      <p className="text-sm text-gray-600">Dental Cleaning</p>
                    </div>
                    <div className="ml-auto flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm">May 15, 2:00 PM</span>
                    </div>
                  </div>

                  <button className="w-full py-3 mt-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-medium rounded-md transition-opacity">
                    Book New Appointment
                  </button>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-teal-100 rounded-full opacity-70"></div>
              <div className="absolute -top-8 -right-8 w-16 h-16 bg-emerald-200 rounded-full opacity-70"></div>
            </div>
          </div>
        </div>
      </section>
      <div id='features'>
        <Features />
      </div>
      <HowItWorks />
      <Testimonials />
      <div id='footer'>
        <Footer />
      </div>
    </>
  );
};

export default Home;
