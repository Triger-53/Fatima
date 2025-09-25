import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Award, 
  GraduationCap, 
  Heart, 
  Users, 
  MapPin, 
  Calendar,
  Phone,
  Mail,
  Star,
  CheckCircle
} from 'lucide-react';
import OnlineIllustration from '../components/OnlineIllustration';
import FeatureIcon from '../components/FeatureIcon';
import CtaIllustration from '../components/CtaIllustration';

const About = () => {
  const credentials = [
    "Licensed Speech-Language Pathologist",
    "Master's Degree in Speech-Language Pathology",
    "Certified by American Speech-Language-Hearing Association",
    "25+ Years of Clinical Experience",
    "Specialized in Pediatric and Adult Therapy"
  ];

  const values = [
    {
      icon: "Heart",
      title: "Compassionate Care",
      description: "We treat every patient with kindness, respect, and understanding, recognizing that each person has unique healthcare needs."
    },
    {
      icon: "Users",
      title: "Patient-Centered",
      description: "Your health goals and preferences are at the center of every decision we make about your care."
    },
    {
      icon: "Award",
      title: "Excellence",
      description: "We maintain the highest standards of medical care through continuous education and evidence-based practices."
    }
  ];

  const team = [
    {
      name: "Dr. Fatima Kasamnath, SLP",
      role: "Speech-Language Pathologist",
      education: "Master's in Speech-Language Pathology",
      experience: "25+ Years",
      image: "👩‍⚕️"
    },
    {
      name: "Jennifer Martinez, RN",
      role: "Registered Nurse",
      education: "NYU School of Nursing",
      experience: "8 Years",
      image: "👩‍⚕️"
    },
    {
      name: "David Chen, PA-C",
      role: "Physician Assistant",
      education: "Yale School of Medicine",
      experience: "6 Years",
      image: "👨‍⚕️"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-blue-50 section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Meet Dr. Fatima Kasamnath
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                A dedicated speech-language pathologist with over 25 years of experience
                providing compassionate, comprehensive speech therapy to patients of all ages.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/appointment" className="btn-primary flex items-center justify-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Book Appointment
                </Link>
                <Link to="/contact" className="btn-secondary flex items-center justify-center">
                  <Phone className="w-5 h-5 mr-2" />
                  Contact Us
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative flex items-center justify-center"
            >
              <OnlineIllustration />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Doctor's Story */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                My Story
              </h2>
              <div className="space-y-6 text-lg text-gray-600">
                <p>
                  I've always been passionate about helping people communicate effectively and confidently. 
                  After completing my Master's degree in Speech-Language Pathology and becoming certified 
                  by the American Speech-Language-Hearing Association, I knew I wanted to specialize in 
                  helping patients of all ages improve their communication skills.
                </p>
                <p>
                  What drives me is the opportunity to help patients find their voice and build confidence 
                  in their communication abilities. I believe that effective communication is fundamental 
                  to quality of life, and I'm committed to providing evidence-based therapy.
                </p>
                <p>
                  Over the past 25 years, I've had the privilege of working with patients from all
                  walks of life, from toddlers learning their first words to seniors recovering from 
                  stroke. Every patient's journey is unique, and I'm committed to providing the highest 
                  quality speech therapy possible.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-gray-50 rounded-2xl p-8"
            >
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                Credentials & Education
              </h3>
              <div className="space-y-4">
                {credentials.map((credential, index) => (
                  <div key={index} className="flex items-start">
                    <Award className="w-6 h-6 text-primary-600 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{credential}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Practice Philosophy */}
      <section className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Practice Philosophy
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We believe in providing comprehensive, compassionate care that puts our patients first.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card text-center"
              >
                <div className="flex justify-center mb-6">
                  <FeatureIcon icon={value.icon} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Office Information */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Office
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Located in the heart of the city, our modern medical facility is designed 
                to provide a comfortable and welcoming environment for all our patients.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <MapPin className="w-6 h-6 text-primary-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">123 Medical Center Dr</p>
                    <p className="text-gray-600">Suite 100, New York, NY 10001</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="w-6 h-6 text-primary-600 mr-3" />
                  <span className="text-gray-700">(555) 123-4567</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-6 h-6 text-primary-600 mr-3" />
                  <span className="text-gray-700">info@drsarahjohnson.com</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-6 h-6 text-primary-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Mon-Fri: 8:00 AM - 6:00 PM</p>
                    <p className="text-gray-600">Sat: 9:00 AM - 2:00 PM</p>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-gray-50 rounded-2xl shadow-lg p-8"
            >
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                Why Choose Us?
              </h3>
              <div className="space-y-4">
                 <div className="flex items-center">
                   <Star className="w-5 h-5 text-accent-500 fill-current mr-3" />
                   <span className="text-gray-700">Licensed speech-language pathologist</span>
                 </div>
                 <div className="flex items-center">
                   <Star className="w-5 h-5 text-accent-500 fill-current mr-3" />
                   <span className="text-gray-700">Flexible appointment scheduling</span>
                 </div>
                 <div className="flex items-center">
                   <Star className="w-5 h-5 text-accent-500 fill-current mr-3" />
                   <span className="text-gray-700">Child-friendly therapy environment</span>
                 </div>
                 <div className="flex items-center">
                   <Star className="w-5 h-5 text-accent-500 fill-current mr-3" />
                   <span className="text-gray-700">Therapy for all age groups</span>
                 </div>
                 <div className="flex items-center">
                   <Star className="w-5 h-5 text-accent-500 fill-current mr-3" />
                   <span className="text-gray-700">Telepractice available</span>
                 </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-primary-600 relative overflow-hidden">
        <CtaIllustration />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Meet Dr. Kasamnath?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Schedule your first appointment and experience the difference that compassionate, 
            comprehensive care can make in your health journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/appointment" className="bg-white text-primary-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center">
              <Calendar className="w-5 h-5 mr-2" />
              Book Your First Visit
            </Link>
            <Link to="/contact" className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-medium py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center">
              <Phone className="w-5 h-5 mr-2" />
              Call to Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
