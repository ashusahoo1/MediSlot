import React, { useEffect, useRef } from 'react';
import { Search, Calendar, FileCheck, Users } from 'lucide-react';

const Step = ({ number, icon, title, description, delay }) => {
  const stepRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('animate-fadeInRight');
              entry.target.classList.remove('opacity-0');
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const stepEl = stepRef.current;
    if (stepEl) {
      observer.observe(stepEl);
    }

    return () => {
      if (stepEl) {
        observer.unobserve(stepEl);
      }
    };
  }, [delay]);

  return (
    <div ref={stepRef} className="flex items-start opacity-0 transition-all duration-700">
      <div className="mr-6 flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xl">
          {number}
        </div>
      </div>
      <div>
        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 mb-8">{description}</p>
      </div>
    </div>
  );
};

const HowItWorks = () => {
  const titleRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fadeIn');
            entry.target.classList.remove('opacity-0');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const titleEl = titleRef.current;
    if (titleEl) {
      observer.observe(titleEl);
    }

    return () => {
      if (titleEl) {
        observer.unobserve(titleEl);
      }
    };
  }, []);

  return (
    <section id="how-it-works" className="py-20">
      
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 
            ref={titleRef}
            className="text-3xl md:text-4xl font-bold mb-4 opacity-0 transition-opacity duration-1000"
          >
            How <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">MediSlot</span> Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Book your medical appointments in four simple steps
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Step
            number={1}
            icon={<Search className="h-6 w-6 text-emerald-600" />}
            title="Find Your Provider"
            description="Search for healthcare providers by specialty, location, or availability. Filter results based on your preferences and insurance coverage."
            delay={100}
          />
          <Step
            number={2}
            icon={<Calendar className="h-6 w-6 text-emerald-600" />}
            title="Select a Time Slot"
            description="Browse available time slots and choose one that fits your schedule. See real-time availability without back-and-forth phone calls."
            delay={300}
          />
          <Step
            number={3}
            icon={<FileCheck className="h-6 w-6 text-emerald-600" />}
            title="Confirm Booking"
            description="Complete your booking by providing necessary information. Receive instant confirmation via email or text message."
            delay={500}
          />
          <Step
            number={4}
            icon={<Users className="h-6 w-6 text-emerald-600" />}
            title="Attend Appointment"
            description="Visit your provider in person. Get reminders before your appointment."
            delay={700}
          />
        </div>
      </div>
    </section>
  );
};

export default HowItWorks; 