import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Mail, Globe, ChevronRight, Lock, User, Bell, Cookie, Database, FileText, MapPin } from 'lucide-react';

const PrivacyPolicy = () => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const sections = [
    {
      title: "Information We Collect",
      icon: User,
      items: [
        "Full name, contact details, email, and phone number",
        "Login and registration details",
        "Form submissions via contact or onboarding forms",
        "Usage and browser data via analytics tools like Google Analytics",
        "Cookies for user experience enhancement and analytics"
      ]
    },
    {
      title: "How We Use Your Information",
      icon: FileText,
      items: [
        "To register and manage user accounts",
        "To respond to inquiries and support requests",
        "To improve platform features and user experience",
        "To monitor site traffic, analytics, and trends",
        "To communicate important updates and service notifications"
      ]
    },
    {
      title: "Cookies & Tracking",
      icon: Cookie,
      content: "We use cookies and similar technologies to enhance your browsing experience and analyze website performance. By using our website, you consent to our use of cookies in accordance with this policy."
    },
    {
      title: "Data Security",
      icon: Lock,
      content: "We implement industry-standard security measures to protect your personal information. However, no method of transmission or storage is 100% secure."
    },
    {
      title: "User Rights",
      icon: Shield,
      items: [
        "Right to access, update, or delete your information",
        "Right to withdraw consent at any time",
        "Right to contact us for any data-related queries"
      ]
    },
    {
      title: "Third-Party Services",
      icon: Database,
      content: "We may use third-party tools like Google Analytics for understanding user behavior. These tools may collect non-personal data based on your usage patterns."
    },
    {
      title: "Regional Applicability",
      icon: MapPin,
      content: "Our services are currently intended for users based in India. We comply with applicable data protection laws within the Indian jurisdiction."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-block p-3 bg-indigo-100 rounded-2xl mb-4">
            <Shield className="w-10 h-10 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-4">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-600">
            Last updated: May 29, 2025
          </p>
        </div>

        {/* Introduction */}
        <motion.div 
          className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100"
          {...fadeIn}
        >
          <p className="text-lg text-gray-700 leading-relaxed">
            Shramii ("we", "our", or "us") is committed to safeguarding the privacy of our users in accordance with applicable Indian laws.
            This Privacy Policy outlines how we collect, use, and protect your personal data through our website and mobile application.
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-indigo-100 rounded-xl">
                  {React.createElement(section.icon, { className: "w-6 h-6 text-indigo-600" })}
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {section.title}
                </h2>
              </div>

              {section.items ? (
                <ul className="space-y-3">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700">
                      <ChevronRight className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-700 leading-relaxed">
                  {section.content}
                </p>
              )}
            </motion.div>
          ))}

          {/* Contact Section */}
          <motion.div
            className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-8 text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Mail className="w-6 h-6" />
              Contact Us
            </h2>
            <p className="leading-relaxed mb-6">
              If you have any questions about this Privacy Policy, please don't hesitate to reach out to us:
            </p>
            <div className="space-y-4">
              <a 
                href="mailto:contact@shramii.com" 
                className="flex items-center gap-3 text-white hover:text-indigo-100 transition-colors"
              >
                <Mail className="w-5 h-5" />
                contact@shramii.com
              </a>
              <a 
                href="https://www.shramii.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-3 text-white hover:text-indigo-100 transition-colors"
              >
                <Globe className="w-5 h-5" />
                www.shramii.com
              </a>
            </div>
          </motion.div>

          {/* Footer Note */}
          <motion.p 
            className="text-center text-sm text-gray-600 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            This Privacy Policy is subject to change. Updates will be posted on this page with a revised effective date.
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyPolicy;