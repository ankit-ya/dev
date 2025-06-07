import React, { useEffect, useState ,useRef} from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import bannerIllustration from "../assets/banner-illustration.jpeg"
import SHRAMII from "/SHRAMII.png";


import AOS from "aos";
import "aos/dist/aos.css";
import {
    Building2,
    BusFront,
    School,
    Stethoscope,
    Factory,
    TentTree,
    Menu as MenuIcon,
    X as CloseIcon,
    UserRoundCog,
    ShieldCheck,
    ChevronLeft,
    ChevronRight,
    Menu,
    X,
    Clock,
    Fingerprint,
    Banknote,
    UserPlus,
    FileText,
    MonitorCheck,
    CalendarCheck2,
    Workflow ,
   
    CheckCircle,
    BarChart3,
  } from "lucide-react";
  

export default function HRMSHomepage() {
  const [isYearly, setIsYearly] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const [activeCategory, setActiveCategory] = React.useState("All");

  const scrollRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  

  
  
  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
    });
}

};

const handleScrollTrack = () => {
    if (scrollRef.current) {
        const scrollLeft = scrollRef.current.scrollLeft;
      const cardWidth = scrollRef.current.children[0].offsetWidth + 24;
      const index = Math.round(scrollLeft / cardWidth);
      setCurrentIndex(index);
    }
};

const features = [
    {
        category: "HR",
        title: "Smart Attendance & AI Face Recognition",
        icon: <Fingerprint className="h-7 w-7 text-white" />,
        points: [
            "AI-enabled facial recognition + Geo-tagging",
            "Real-time location tracking of on-duty staff",
            "Automated alerts if workers leave assigned posts"
        ]
    },
    {
        category: "Operations",
        title: "AI-Driven Shift & Duty Management",
      icon: <Clock className="h-7 w-7 text-white" />,
      points: [
        "Auto-create shifts based on manpower availability",
        "Dynamic reallocation if someone is absent",
        "Real-time duty rosters for every site"
    ]
},
{
    category: "HR",
    title: "Digital Onboarding & Offboarding",
    icon: <UserPlus className="h-7 w-7 text-white" />,
    points: [
        "Paperless joining process",
        "Document upload, ID verification, and compliance tracking",
        "Smooth exit workflow with final settlements"
    ]
},
{
    category: "Operations",
    title: "Live Site Monitoring Dashboard",
    icon: <MonitorCheck className="h-7 w-7 text-white" />,
    points: [
        "Know who is working where—in real-time!",
        "Panic/alarm triggers if a guard leaves his post",
        "Centralized view of all ongoing shifts & attendance"
    ]
},
{
    category: "Operations",
    title: "To-Do Task Management",
    badge: "NEW",
    icon: <Clock className="h-7 w-7 text-white" />,
    points: [
        "Assign, Track & Manage Tasks Efficiently",
        "Real-time Updates & Reminders",
        "Collaboration & Productivity Enhancements"
    ]
},
{
    category: "HR",
    title: "Leave Management Made Easy",
    icon: <CalendarCheck2 className="h-7 w-7 text-white" />,
    points: [
        "App-based leave requests and approvals",
        "Auto-adjustments in shift allocation",
        "Holiday calendars, paid/unpaid leave reports"
    ]
},
{
    category: "HR",
    title: "Integrated Payroll & Compliance",
    icon: <Banknote className="h-7 w-7 text-white" />,
    points: [
        "One-click salary disbursement via bank or UPI",
        "Auto-generated EPF, ESIC, TDS reports",
        "Download-ready statutory files for submissions"
    ]
},
{
    category: "HR",
    title: "Organizational Chart",
    icon: <Workflow className="h-7 w-7 text-white" />,
    points: [
        "Visual hierarchy of your workforce",
        "Drag-and-drop team updates",
        "Helps in tracking reporting structure"
    ]
},
{
    category: "Operations",
    title: "Reports & Analytics",
    icon: <BarChart3 className="h-7 w-7 text-white" />,
    points: [
        "Site-wise & employee-wise performance reports",
        "Weekly/monthly dashboards",
        "Identify absenteeism, overtime, and labor cost trends"
    ]
}
];
const filteredFeatures = activeCategory === "All"
  ? features
  : features.filter((f) => f.category === activeCategory);

const industries = [
    {
      icon: <Building2 className="h-8 w-8 animate-bounce" />,
      title: "Retail Sector",
      desc: "Boost efficiency with mobile-ready HR tools.",
    },
    {
      icon: <Stethoscope className="h-8 w-8 animate-bounce" />,
      title: "Health Sector",
      desc: "Minimize admin workload with smart automation.",
    },
    {
      icon: <Factory className="h-8 w-8 animate-bounce" />,
      title: "Manufacturing",
      desc: "Track workforce and shifts in real-time.",
    },
    {
      icon: <School className="h-8 w-8 animate-bounce" />,
      title: "Education",
      desc: "Streamlined staff & operations management.",
    },
    {
      icon: <BusFront className="h-8 w-8 animate-bounce" />,
      title: "Transport & Logistics",
      desc: "Automate shift planning and geo-attendance.",
    },
    {
      icon: <TentTree className="h-8 w-8 animate-bounce" />,
      title: "Leisure & Travel",
      desc: "Real-time tracking of seasonal & hourly staff.",
    },
    {
      icon: <UserRoundCog className="h-8 w-8 animate-bounce" />,
      title: "Frontline Workforce",
      desc: "Built for field & contract staff management.",
    },
    {
      icon: <ShieldCheck className="h-8 w-8 animate-bounce" />,
      title: "Security & HR Services",
      desc: "Smart HRMS for guarding, housekeeping & field staff.",
    },
  ];
  

  

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans">
      {/* Navbar */}
    {/* Navbar */}
    <header className="bg-white shadow-lg py-4 px-6 md:px-20 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
    <div className="flex items-center">
                      <img 
                        src={SHRAMII} 
                        className="h-18 sm:h-16 object-contain pl-1 scale-[2] sm:scale-[3.5] ml-2 sm:ml-6" 
                        alt="Shramii Logo" 
                      />
                    </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-700">
          <button onClick={() => scrollToSection("features")}>Solutions</button>
          <button onClick={() => scrollToSection("industries")}>Industries</button>
          <button onClick={() => scrollToSection("testimonials")}>Testimonials</button>
          <button onClick={() => scrollToSection("pricing")}>Pricing</button>
          <button onClick={() => scrollToSection("about")}>About</button>
          <button onClick={() => navigate("/contact-form")}>Contact</button>
          
          <button onClick={() => { navigate("/login"); setMobileMenuOpen(false); }}>Login</button>
          <button onClick={() => { navigate("/sign-up"); setMobileMenuOpen(false); }}>SignUp</button>
        </nav>

        {/* Mobile Toggle Button using Icons */}
        <button className="md:hidden text-gray-700 ml-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </header>

      {/* Overlay Mobile Menu */}
     {/* Mobile Menu Sidebar */}
{mobileMenuOpen && (
  <>
    {/* Backdrop */}
    <div
      className="fixed inset-0 bg-black bg-opacity-40 z-40"
      onClick={() => setMobileMenuOpen(false)}
    />

    {/* Sidebar - Full width on mobile, centered content */}
    <div className="fixed top-0 left-0 h-full w-full sm:w-4/5 sm:max-w-sm bg-white z-50 shadow-xl overflow-y-auto transition-transform duration-300 ease-in-out">
      <div className="min-h-full flex flex-col justify-center px-6 py-10">
        <button
          className="absolute top-4 right-4 text-gray-700 hover:text-gray-900"
          onClick={() => setMobileMenuOpen(false)}
        >
          <CloseIcon className="h-6 w-6" />
        </button>
        
        <nav className="flex flex-col gap-4 text-base font-medium text-gray-800">
          <button 
            className="py-2 text-centre hover:text-blue-600 transition-colors"
            onClick={() => { scrollToSection("features"); setMobileMenuOpen(false); }}
          >
            Solutions
          </button>
          <button 
            className="py-2 text-centre hover:text-blue-600 transition-colors"
            onClick={() => { scrollToSection("industries"); setMobileMenuOpen(false); }}
          >
            Industries
          </button>
          <button 
            className="py-2 text-centre hover:text-blue-600 transition-colors"
            onClick={() => { scrollToSection("testimonials"); setMobileMenuOpen(false); }}
          >
            Testimonials
          </button>
          <button 
            className="py-2 text-centre hover:text-blue-600 transition-colors"
            onClick={() => { scrollToSection("pricing"); setMobileMenuOpen(false); }}
          >
            Pricing
          </button>
          <button 
            className="py-2 text-centre hover:text-blue-600 transition-colors"
            onClick={() => { scrollToSection("about"); setMobileMenuOpen(false); }}
          >
            About
          </button>
          <button 
            className="py-2 text-centre hover:text-blue-600 transition-colors"
            onClick={() => { navigate("/contact-form"); setMobileMenuOpen(false); }}
          >
            Contact
          </button>
   

          
          <button 
            className="py-2 text-centre hover:text-blue-600 transition-colors"
            onClick={() => { navigate("/login"); setMobileMenuOpen(false); }}
          >
            Login
          </button>
          <button 
            className="py-2 text-centre hover:text-blue-600 transition-colors"
            onClick={() => { navigate("/sign-up"); setMobileMenuOpen(false); }}
          >
            SignUp
          </button>
        </nav>
      </div>
    </div>
  </>
)}



      {/* Hero */}
      <section className="bg-[#F7FAFC] py-20 px-6 md:px-20" data-aos="fade-up">
        <div className="max-w-6xl mx-auto flex flex-col-reverse lg:flex-row items-center justify-between gap-10">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Smarter Workforce.<br />Simpler Management.
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-4">
              Real-time Attendance | Shift Planning<br />Employee Records — All in One App
            </p>
            <p className="text-gray-600 max-w-xl mb-6">
              Say goodbye to manual registers and endless WhatsApp updates. Track shifts, reduce supervisor workload, and manage your entire team — from your mobile or desktop.
            </p>
            <div className="flex justify-center items-center mt-4">
  <button
    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-blue-700"
    onClick={() => {
      navigate("/sign-up");
    }}
  >
    Book a Free Demo
  </button>
</div>


          </div>
          <div>
            <img   src={bannerIllustration} alt="Shift Management" className="w-full max-w-sm lg:max-w-md  mx-auto" />
          </div>
        </div>
      </section>

      {/* Clients Carousel 
      <section className="py-12 px-6 md:px-20 bg-white" data-aos="fade-up">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-xl font-semibold mb-6 text-gray-700">Trusted by Security Companies</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 items-center opacity-70">
            {[...Array(6)].map((_, i) => (
              <img
                key={i}
                src={`/logos/logo${i + 1}.png`}
                alt={`Client Logo ${i + 1}`}
                className="h-10 object-contain mx-auto grayscale hover:grayscale-0 transition"
              />
            ))}
          </div>
        </div>
      </section>  */}

      {/* Features */}
      <section
      className="bg-white py-20 px-6 md:px-20 text-center text-gray-900"
      id="features"
      data-aos="fade-up"
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-wrap justify-center gap-3">
          {["All", "HR", "Operations"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-sm font-semibold rounded-full border transition duration-300 ${
                activeCategory === cat
                  ? "bg-blue-700 text-white border-blue-700"
                  : "bg-white text-blue-700 border-blue-300 hover:bg-blue-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold mb-6 text-blue-700 flex items-center justify-center gap-2">
          <BarChart3 className="h-6 w-6 text-blue-700" /> Products
        </h2>
        <p className="text-gray-700 text-lg mb-12">
          Run your <span className="font-semibold text-blue-700">HR & Operations</span> seamlessly
          on one unified platform.
          <br />
          Smart Scheduling, Paperless Onboarding, Geo-Face Attendance, and
          Integrated Payroll – all in one.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-center items-start">
          {filteredFeatures.map((feature, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-blue-800 to-blue-600 rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transform transition-all duration-500 ease-in-out text-left text-white flex flex-col h-full"
              data-aos="zoom-in"
              data-aos-delay={index * 100}
            >
              <div className="flex items-center gap-3 mb-4">
                {feature.icon}
                <h3 className="text-lg font-bold tracking-wide leading-snug text-white">
                  {feature.title}
                </h3>
              </div>
              <ul className="space-y-3 text-sm text-blue-100 mt-auto">
                {feature.points.map((point, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
      {/* Industries We Serve */}
      <section
  id="industries"
  className="py-20 px-4 md:px-20 bg-white text-center"
  data-aos="fade-up"
>
  <h2 className="text-3xl font-extrabold mb-10 text-gray-900">Industries We Serve</h2>

  <div className="relative max-w-7xl mx-auto">
    {/* Swipe fade effect */}
    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

    {/* Scroll Arrows */}
    <button
      onClick={() => handleScroll("left")}
      className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20 p-2 bg-white border rounded-full shadow hover:bg-blue-100"
    >
      <ChevronLeft className="h-6 w-6 text-blue-600" />
    </button>

    <div
      ref={scrollRef}
      onScroll={handleScrollTrack}
      className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory px-4 md:px-10 py-2 scrollbar-none transition-all duration-500 ease-in-out touch-auto"
    >
      {industries.map((item, index) => (
        <div
          key={index}
          onClick={() => handleCardClick(item.title)}
          className="cursor-pointer w-[140px] h-[140px] sm:w-[160px] sm:h-[160px] md:w-[180px] md:h-[180px] flex-shrink-0 group bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-100 hover:from-blue-200 hover:to-white shadow-md hover:shadow-lg p-3 rounded-xl transition-all duration-300 ease-in-out transform hover:scale-105 snap-start flex flex-col items-center justify-center"
        >
          <div className="bg-white p-2 rounded-full mb-2 shadow group-hover:bg-blue-600">
            <div className="text-blue-600 group-hover:text-white transition-all duration-300 ease-in-out">{item.icon}</div>
          </div>
          <h3 className="text-xs font-semibold text-gray-800 group-hover:text-blue-700 transition-colors text-center">
            {item.title}
          </h3>
          <p className="text-[10px] text-gray-600 mt-1 text-center leading-snug">
            {item.desc}
          </p>
        </div>
      ))}
    </div>

    <button
      onClick={() => handleScroll("right")}
      className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20 p-2 bg-white border rounded-full shadow hover:bg-blue-100"
    >
      <ChevronRight className="h-6 w-6 text-blue-600" />
    </button>
  </div>

  {/* Pagination Dots */}
  <div className="flex justify-center gap-2 mt-6">
    {industries.map((_, index) => (
      <span
        key={index}
        className={`h-2 w-2 rounded-full ${
          index === currentIndex ? "bg-blue-600 scale-125" : "bg-gray-300"
        } transition-all`}
      />
    ))}
  </div>
</section>


  {/* Pricing Section (Starter = Free Badge) */}
<section id="pricing" className="py-20 px-6 md:px-20 bg-white text-center" data-aos="fade-up">
  <h2 className="text-3xl font-extrabold mb-4 text-gray-900">Pricing</h2>
  <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
    Flexible HR Software. With flexible solutions.
  </p>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
    {[
      {
        name: "Starter",
        desc: "Digitise HR tasks and manage day-to-day administration.",
        features: [
          "Smart Attendance & AI Face Recognition",
          "Digital Onboarding & Offboarding",
          "Organizational Chart",
          "Standard Workflows",
          "Basic Reporting",
          "Document management",
          "Manage Department & Team"
        ],
        cta: "TRY FOR FREE",
        free: true // ✅ new flag added here
      },
      {
        name: "Growth",
        desc: "All features from Starter, plus more power and automation.",
        features: [
          "All Starter Features",
          "Live Site Monitoring Dashboard",
          "AI-Driven Shift & Duty Management",
          "Leave Management Made Easy",
          "Integrated Payroll & Compliance",
          "Task management",
          "Reports & Analytics"
        ],
        cta: "TRY FOR FREE",
        popular: true,
        hasPrice: true // ✅ price only for growth
      },
      {
        name: "Connect",
        desc: "Advanced reporting, integrations & enterprise-grade features.",
        features: [
          "All Growth Features",
          "APIs & Bulk Operations",
          "Non-compliance Alerts",
          "Shift Templates & Automation",
          "Priority Support"
        ],
        cta: "BOOK A DEMO",
        connect: true // ✅ Add a custom flag to identify "Connect"
      }
    ].map((plan, i) => (
      <div
        key={i}
        className={`rounded-xl p-6 shadow hover:shadow-xl ${
          plan.popular ? "bg-blue-100" : "bg-blue-50"
        } flex flex-col justify-between`}
      >
        <div>
          {/* ✅ Free Badge for Starter */}
          {plan.free && (
            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold mb-2 inline-block">
              FREE
            </span>
          )}
          
          {/* ✅ Most Popular Badge for Growth */}
          {plan.popular && (
            <span className="bg-blue-700 text-white px-3 py-1 rounded-full text-xs font-semibold mb-2 inline-block">
              MOST POPULAR
            </span>
          )}

          <h3 className="text-xl font-bold mb-2 text-gray-900">{plan.name}</h3>
          {/* ✅ Show price only for Growth */}
          {plan.hasPrice && (
            <p className="text-3xl font-extrabold mb-2 text-gray-800">
              ₹{isYearly ? "529" : "89"}
            </p>
          )}
          {plan.hasPrice && (
            <p className="text-sm text-gray-600 mb-4">
              PER EMPLOYEE / {isYearly ? "YEAR" : "MONTH"}
            </p>
          )}

          {/* ✅ Price removed */}

          <p className="text-gray-600 mb-6">{plan.desc}</p>
          <ul className="text-left text-sm text-gray-700 space-y-1">
            {plan.features.map((f, j) => (
              <li key={j}>✔ {f}</li>
            ))}
          </ul>
        </div>
        <button
       onClick={() => navigate("/sign-up")}
          className={`mt-6 ${
            plan.popular
              ? "bg-blue-700 text-white"
              : "border-2 border-blue-700 text-blue-700"
          } py-2 rounded-md font-semibold hover:bg-blue-800 hover:text-white transition`}
        >
          {plan.cta}
        </button>
      </div>
    ))}
  </div>
</section>



      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6 md:px-20 bg-gray-50 text-center" data-aos="fade-up">
        <h2 className="text-3xl font-extrabold mb-6 text-gray-900">What Our Clients Say</h2>
        <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
          Discover how SHRAMII is helping companies optimize operations and reduce costs.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              quote:
                "By opting SHRAMII, we reduced our workforce handling cost by over 30%. The automation is seamless and efficient.",
              name: "Ajay Mehra",
              role: "Director, SecureGuard Pvt. Ltd."
            },
            {
              quote:
                "Real-time visibility and attendance tracking helped us streamline operations and focus more on growth.",
              name: "Priya Shah",
              role: "Operations Head, ShieldForce Security"
            },
            {
              quote:
                "Managing 300+ guards across locations used to be chaos. SHRAMII gave us control, insights, and peace of mind.",
              name: "Rakesh Thakur",
              role: "HR Manager, MetroSafe Services"
            }
          ].map((t, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition text-left">
              <p className="text-sm text-gray-700 italic mb-4">"{t.quote}"</p>
              <h4 className="font-semibold text-blue-700">{t.name}</h4>
              <p className="text-xs text-gray-500">{t.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Us */}
      <section id="about" className="py-20 px-6 md:px-20 bg-white text-center" data-aos="fade-up">
        <h2 className="text-3xl font-extrabold mb-6 text-gray-900">About Us</h2>
        <p className="text-gray-600 max-w-3xl mx-auto">
          SHRAMII is a technology-driven HRMS platform built specifically for security and manpower companies. With a mission to simplify field force operations, we bring real-time visibility, automation, and compliance support to your fingertips.
        </p>
      </section>

      {/* CTA Banner */}
      <section className="bg-[#174AE2] text-white py-20 px-6 md:px-20 text-center" data-aos="fade-up">
        <h2 className="text-3xl font-extrabold mb-4">Ready to Empower Your Workforce?</h2>
        <p className="text-lg mb-8">Complete SignUp & Book a demo and get started with smart HRMS for your field teams.</p>
        <button className="bg-white text-[#174AE2] px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 shadow-md" onClick={() => { navigate("/sign-up")}}>
          Request a Demo →
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 px-6 md:px-20" id="contact">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            

            <div className="flex items-center">
                      <img 
                        src={SHRAMII} 
                        className="h-18 sm:h-16 object-contain pl-7 scale-[2] sm:scale-[3.5] ml-2 sm:ml-6" 
                        alt="Shramii Logo" 
                      />
                    </div>
            
            <p className="text-sm mt-2 opacity-80">
              The all-in-one HR platform crafted specifically for manpower and security companies.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Quick Links</h4>
            <ul className="text-sm space-y-1">
              <li>
                <button onClick={() => scrollToSection("features")} className="hover:underline">
                  Solutions
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection("industries")} className="hover:underline">
                  Industries
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection("testimonials")} className="hover:underline">
                  Testimonials
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection("pricing")} className="hover:underline">
                  Pricing
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection("about")} className="hover:underline">
                  About
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/contact-form")} className="hover:underline">
                  Contact
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/privacy-policy")} className="hover:underline">
                  Privacy Policy
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Contact Us</h4>
            <p className="text-sm">Email: contact@shramii.com</p>
            <p className="text-sm">Phone: +91 62320-62302</p>
            <p className="text-sm">Address: 235, 2nd Floor, 13th Cross Road, Indira Nagar, Bengaluru - 560038</p>
          </div>
        </div>
        <div className="text-center mt-10 text-xs text-gray-400">
          © {new Date().getFullYear()} SHRAMII. All rights reserved.
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/917880023696"
        className="fixed bottom-6 right-6 z-50 bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition-all"
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.24 7.76a6 6 0 11-8.48 8.48L3 21l4.76-4.76a6 6 0 018.48-8.48z" />
        </svg>
      </a>

      {/* Mobile CTA Button */}
      <a
        href="#"
        onClick={() => scrollToSection("contact")}
        className="fixed bottom-6 left-6 md:hidden z-50 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition-all"
      >
        Request Demo
      </a>
    </div>
  );
}



