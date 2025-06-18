import { useEffect, useRef } from 'react';
import { Calendar,Bell, UserCircle, Check, Shield, Search } from 'lucide-react';

const FeatureCard = ({ icon, title, description, delay }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('animate-fadeInUp');
              entry.target.classList.remove('opacity-0');
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08}//percentage of element visible/intersecting
    );

    const cardEl = cardRef.current;//gives access to current DOM element
    if (cardEl) {
      observer.observe(cardEl);//start observing once the element is created/mounted
    }

    //useEffect accepts a clean up function like this that runs on unmounting the DOM element during page change or maybe closing a modal etc
    return () => {
      if (cardEl) {
        observer.unobserve(cardEl);
      }
    };
  }, [delay]);

  return (
    <div 
      ref={cardRef}
      className="bg-white rounded-xl shadow-lg p-6 opacity-0 transition-all duration-700 transform hover:scale-105 hover:shadow-xl"
    >
      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

const Features = () => {
  const titleRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
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
    <section id="features" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 
            ref={titleRef}
            className="text-3xl md:text-4xl font-bold mb-4 opacity-0 transition-opacity duration-1000"
          >
            Why Choose <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">MediSlot</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Streamline your healthcare experience with our innovative scheduling platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Calendar className="h-6 w-6 text-emerald-600" />}
            title="Easy Scheduling"
            description="Book appointments with your preferred healthcare providers in just a few clicks, 24/7."
            delay={100}
          />
          <FeatureCard
            icon={<Bell className="h-6 w-6 text-emerald-600" />}
            title="Smart Reminders"
            description="Receive timely notifications about upcoming appointments via email."
            delay={200}
          />
          <FeatureCard
            icon={<UserCircle className="h-6 w-6 text-emerald-600" />}
            title="Patient Profiles"
            description="Store your appointment history, and other information information securely."
            delay={300}
          />
          <FeatureCard
            icon={<Check className="h-6 w-6 text-emerald-600" />}
            title="Instant Confirmation"
            description="Get immediate confirmation of your appointment with all necessary details."
            delay={400}
          />
          <FeatureCard
            icon={<Shield className="h-6 w-6 text-emerald-600" />}
            title="Secure & Private"
            description="Your health information is protected with enterprise-grade security protocols."
            delay={500}
          />
          <FeatureCard
            icon={<Search className="h-6 w-6 text-emerald-600" />}
            title="Find Specialists"
            description="Discover and connect with specialists based on your specific healthcare needs."
            delay={600}
          />
        </div>
      </div>
    </section>
  );
};

export default Features;