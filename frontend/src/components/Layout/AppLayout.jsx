import React, { useState, useEffect } from 'react';
import { 
  FaBell,
  FaSearch, 
  FaCog,
  FaChevronLeft,
  FaSignOutAlt
} from 'react-icons/fa';
import { 
  MdDashboard,
  MdAccessTime,
  MdPerson,
  MdPayment,
  MdSchedule,
  MdEventNote,
  MdAssignment,
  MdExitToApp,
  MdNotifications,
  MdSettings,
  MdHelp,
  MdExpandLess,
  MdExpandMore
} from 'react-icons/md';
import { 
  HiHome,
  HiClock,
  HiUser,
  HiCreditCard,
  HiCalendar,
  HiClipboardList,
  HiDocumentText,
  HiMenu,
  HiX
} from 'react-icons/hi';

const AppLayout = ({ children, activeSection, onSectionChange, userInfo }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notificationCount] = useState(3);
  const [searchOpen, setSearchOpen] = useState(false);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Responsive sidebar handling
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize(); // Set initial state
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { 
      name: "Dashboard", 
      icon: <MdDashboard className="w-5 h-5" />, 
      section: "Home", 
      gradient: "from-blue-600 to-indigo-600",
      description: "Overview & insights",
      color: "blue"
    },
    { 
      name: "Punch Clock", 
      icon: <MdAccessTime className="w-5 h-5" />, 
      section: "PunchClock", 
      gradient: "from-emerald-500 to-emerald-600",
      description: "Clock in/out",
      color: "emerald"
    },
    { 
      name: "Profile", 
      icon: <HiUser className="w-5 h-5" />, 
      section: "Profile", 
      gradient: "from-purple-600 to-purple-700",
      description: "Personal info",
      color: "purple"
    },
    { 
      name: "Payroll", 
      icon: <MdPayment className="w-5 h-5" />, 
      section: "Payroll", 
      gradient: "from-indigo-500 to-indigo-600",
      description: "Salary & benefits",
      color: "indigo"
    },
    { 
      name: "Calendar", 
      icon: <HiCalendar className="w-5 h-5" />, 
      section: "Calendar", 
      gradient: "from-amber-500 to-amber-600",
      description: "Schedule & events",
      color: "amber"
    },
    { 
      name: "Leave & Attendance", 
      icon: <MdEventNote className="w-5 h-5" />, 
      section: "LeaveAndAttendance", 
      gradient: "from-pink-500 to-pink-600",
      description: "Time off",
      color: "pink"
    },
    { 
      name: "Tasks", 
      icon: <MdAssignment className="w-5 h-5" />, 
      section: "TaskManager", 
      gradient: "from-emerald-600 to-teal-600",
      description: "Work assignments",
      color: "emerald"
    },
    { 
      name: "Travel History", 
      icon: <HiClock className="w-5 h-5" />, 
      section: "TravelHistory", 
      gradient: "from-slate-500 to-slate-600",
      description: "Track movements",
      color: "slate"
    },
  ];

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userType");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white bg-opacity-98 backdrop-blur-lg border-b border-slate-200 shadow-lg">
        {/* Subtle gradient overlay for branding */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-transparent to-purple-50/30"></div>
        
        <div className="relative flex items-center justify-between h-16 px-6">
          
          {/* Left: Logo & Menu Toggle */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-slate-50 transition-all duration-200 lg:hidden"
            >
              {sidebarOpen ? (
                <HiX className="w-5 h-5 text-slate-600" />
              ) : (
                <HiMenu className="w-5 h-5 text-slate-600" />
              )}
            </button>
            
            {/* Logo Section */}
            <button
              onClick={() => onSectionChange("Home")}
              className="flex items-center gap-3 hover:opacity-90 transition-all duration-200 group min-w-0"
            >
              <div className="flex items-center gap-3">
                {/* Enhanced Shramii Logo */}
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 border border-white border-opacity-20">
                    {/* Logo Icon/Text */}
                    <div className="relative">
                      <span className="text-white font-bold text-xl tracking-tight drop-shadow-sm">S</span>
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-sm"></div>
                    </div>
                  </div>
                  {/* Decorative gradient border */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm"></div>
                </div>
                
                {/* Company Name & PRO Badge */}
                <div className="hidden sm:block">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:via-purple-700 group-hover:to-indigo-700 transition-all duration-300 drop-shadow-sm">
                      Shramii
                    </h1>
                    <div className="px-2 py-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-sm">
                      <span className="text-white text-xs font-semibold tracking-wide">PRO</span>
                    </div>
                  </div>
                </div>
                
                {/* Mobile Company Name */}
                <div className="sm:hidden">
                  <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
                    Shramii
                  </h1>
                </div>
              </div>
            </button>
          </div>

          {/* Center: Search Bar (Desktop) */}
          <div className="hidden md:flex items-center justify-center flex-1 max-w-lg px-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaSearch className="text-slate-400 w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search anything..."
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-2xl bg-white bg-opacity-90 backdrop-blur-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200 text-sm placeholder-slate-400 shadow-sm hover:shadow-md hover:border-slate-300"
              />
            </div>
          </div>

          {/* Right: User Actions */}
          <div className="flex items-center gap-6 min-w-0 flex-1 justify-end">
            
            {/* Search Toggle (Mobile) */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2.5 rounded-xl hover:bg-slate-50 transition-all duration-200 md:hidden"
            >
              <FaSearch className="w-4 h-4 text-slate-600" />
            </button>

            {/* Time & Greeting Display */}
            <div className="hidden lg:block text-right">
              <p className="text-sm font-semibold text-slate-800">{getGreeting()}</p>
              <p className="text-xs text-slate-500 -mt-0.5">{formatTime(currentTime)}</p>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button className="p-2.5 rounded-xl hover:bg-slate-50 transition-all duration-200 group relative">
                <MdNotifications className="w-6 h-6 text-slate-600 group-hover:text-blue-600 transition-colors" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-lg animate-pulse border-2 border-white">
                    {notificationCount}
                  </span>
                )}
              </button>
            </div>

            {/* User Profile */}
            <button 
              onClick={() => onSectionChange("YourProfile")}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow border border-white border-opacity-20">
                <span className="text-white font-semibold text-sm drop-shadow-sm">
                  {userInfo?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="hidden xl:block text-left">
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors block">
                  {userInfo?.name?.split(' ')[0] || 'User'}
                </span>
                <span className="text-xs text-slate-500">
                  {userInfo?.designation || 'Employee'}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {searchOpen && (
          <div className="md:hidden border-t border-slate-200 p-4 bg-white bg-opacity-95 backdrop-blur-sm">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaSearch className="text-slate-400 w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search anything..."
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-2xl bg-white focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200 text-sm placeholder-slate-400 shadow-sm"
                autoFocus
              />
            </div>
          </div>
        )}
        
        {/* Subtle bottom border with gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 opacity-20"></div>
      </header>

      {/* Sidebar */}
      <aside className={`fixed top-16 left-0 bottom-0 z-30 w-72 bg-white border-r border-slate-200 shadow-lg transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 flex flex-col`}>
        
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Shramii Portal
                </h3>
              </div>
            </div>
            <p className="text-sm text-slate-600 font-medium">Employee Workspace</p>
            <div className="mt-3 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                onSectionChange(item.section);
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
              className={`group flex items-center w-full p-3 rounded-xl transition-all duration-200 ${
                activeSection === item.section 
                  ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg scale-105` 
                  : 'text-slate-700 hover:bg-slate-50 hover:scale-105'
              }`}
            >
              {/* Icon Container */}
              <div className={`p-2 rounded-lg mr-3 transition-all duration-200 ${
                activeSection === item.section 
                  ? 'bg-white bg-opacity-20 backdrop-blur-sm' 
                  : 'bg-slate-100 group-hover:bg-slate-200'
              }`}>
                <div className={`transition-transform group-hover:scale-110 ${
                  activeSection === item.section ? 'text-white' : 'text-slate-600'
                }`}>
                  {item.icon}
                </div>
              </div>
              
              {/* Text Content */}
              <div className="flex-1 text-left">
                <span className="font-semibold text-sm block">{item.name}</span>
                <span className={`text-xs transition-colors ${
                  activeSection === item.section ? 'text-white text-opacity-80' : 'text-slate-500'
                }`}>
                  {item.description}
                </span>
              </div>
              
              {/* Active Indicator */}
              {activeSection === item.section && (
                <div className="w-2 h-2 bg-white rounded-full animate-pulse ml-2"></div>
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200 bg-gradient-to-r from-red-50 to-pink-50">
          <button
            onClick={handleLogout}
            className="group flex items-center w-full p-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 transform hover:scale-105 border-2 border-red-200 hover:border-red-300 bg-white"
          >
            <div className="p-2 rounded-lg mr-3 bg-red-100 group-hover:bg-red-200 transition-all duration-200">
              <MdExitToApp className="w-4 h-4 text-red-600 transition-transform group-hover:scale-110" />
            </div>
            
            <div className="flex-1 text-left">
              <span className="font-semibold text-sm block">Sign Out</span>
              <span className="text-red-500 text-xs">Logout securely</span>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${
        sidebarOpen ? 'lg:ml-72' : 'ml-0'
      } pt-16`}>
        <div className="p-6">
          {children}
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AppLayout; 