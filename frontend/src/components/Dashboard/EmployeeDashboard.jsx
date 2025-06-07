import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { PieChart, Pie, Cell as PieCell, Tooltip as PieTooltip } from "recharts";
import { 
  FaSearch, 
  FaClock, 
  FaCalendarCheck, 
  FaMapMarkerAlt, 
  FaBell,
  FaChartLine,
  FaUserTie,
  FaShieldAlt,
  FaAward
} from "react-icons/fa";
import { 
  MdTrendingUp, 
  MdAccessTime, 
  MdNotifications,
  MdLocationOn,
  MdVerified,
  MdDashboard,
  MdInsights
} from "react-icons/md";
import { 
  HiOutlineLocationMarker,
  HiOutlineClock,
  HiOutlineCalendar,
  HiOutlineChartBar
} from "react-icons/hi";
import { 
  BiTime,
  BiCalendarCheck,
  BiTrendingUp,
  BiShield
} from "react-icons/bi";

const EmployeeDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [animateCharts, setAnimateCharts] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second for live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Trigger chart animation on component mount
  useEffect(() => {
    const timer = setTimeout(() => setAnimateCharts(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const employee = {
    photo: "https://via.placeholder.com/100/3B82F6/FFFFFF?text=RK",
    name: "Ravi Kumar",
    userName: "s500069",
    designation: "Security Officer",
    department: "Field Operations",
    email: "ravi.kumar@shrami.in",
    phone: "+91 98765 43210",
    status: "Active",
    location: "Site A - Main Gate",
    shiftTime: "9:00 AM - 5:00 PM",
    joinDate: "Jan 15, 2023",
    experience: "2+ Years"
  };

  const attendanceStats = {
    present: 20,
    absent: 2,
    late: 1,
    leaves: 5,
    efficiency: 95.2
  };

  const leavesBalance = {
    sick: 3,
    casual: 4,
    earned: 6,
  };

  const notices = [
    { 
      date: "2025-05-10", 
      message: "Annual health check-up scheduled for May 20th.", 
      priority: "high",
      type: "Health",
      icon: "🏥"
    },
    { 
      date: "2025-05-05", 
      message: "Submit Form-16 documents by May 15th for tax filing.", 
      priority: "medium",
      type: "Finance",
      icon: "💼"
    },
    { 
      date: "2025-05-01", 
      message: "Welcome to the enhanced employee portal experience!", 
      priority: "low",
      type: "System",
      icon: "📋"
    },
  ];

  const quickActions = [
    { 
      label: "Clock In/Out", 
      action: () => alert("Redirecting to punch clock..."), 
      icon: "⏰", 
      gradient: "from-blue-600 to-indigo-600",
      description: "Track attendance"
    },
    { 
      label: "Request Leave", 
      action: () => alert("Leave request initiated"), 
      icon: "📅", 
      gradient: "from-emerald-500 to-emerald-600",
      description: "Apply for time off"
    },
    { 
      label: "View Payslip", 
      action: () => alert("Opening Payslip"), 
      icon: "💰", 
      gradient: "from-purple-600 to-purple-700",
      description: "Check earnings"
    },
    { 
      label: "Report Issue", 
      action: () => alert("Contact support initiated"), 
      icon: "🛡️", 
      gradient: "from-slate-600 to-slate-700",
      description: "Get assistance"
    },
  ];

  const upcomingShifts = [
    { 
      date: "Today", 
      fullDate: "May 12, 2025",
      shift: "Morning Shift", 
      time: "9:00 AM - 5:00 PM", 
      location: "Site A - Main Gate",
      status: "current"
    },
    { 
      date: "Tomorrow", 
      fullDate: "May 13, 2025",
      shift: "Afternoon Shift", 
      time: "1:00 PM - 9:00 PM", 
      location: "Site B - Parking",
      status: "upcoming"
    },
    { 
      date: "May 14", 
      fullDate: "May 14, 2025",
      shift: "Night Shift", 
      time: "9:00 PM - 5:00 AM", 
      location: "Site A - Main Gate",
      status: "upcoming"
    },
  ];

  const chartData = [
    { name: "Present", value: attendanceStats.present, color: "#22C55E", percentage: 71.4 },
    { name: "Absent", value: attendanceStats.absent, color: "#EF4444", percentage: 7.1 },
    { name: "Late", value: attendanceStats.late, color: "#F59E0B", percentage: 3.6 },
    { name: "Leaves", value: attendanceStats.leaves, color: "#8B5CF6", percentage: 17.9 },
  ];

  const leaveData = [
    { name: "Sick Leave", value: leavesBalance.sick, color: "#3B82F6", total: 12 },
    { name: "Casual Leave", value: leavesBalance.casual, color: "#8B5CF6", total: 15 },
    { name: "Earned Leave", value: leavesBalance.earned, color: "#6366F1", total: 21 },
  ];

  const filteredNotices = notices.filter(notice =>
    notice.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityStyles = (priority) => {
    switch(priority) {
      case 'high': 
        return {
          border: 'border-l-red-500',
          bg: 'bg-red-50',
          badge: 'bg-red-100 text-red-800 border border-red-200'
        };
      case 'medium': 
        return {
          border: 'border-l-amber-500',
          bg: 'bg-amber-50',
          badge: 'bg-amber-100 text-amber-800 border border-amber-200'
        };
      default: 
        return {
          border: 'border-l-blue-500',
          bg: 'bg-blue-50',
          badge: 'bg-blue-100 text-blue-800 border border-blue-200'
        };
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="min-h-screen space-y-6 bg-transparent">
      
      {/* Professional Employee Header Card */}
      <div className="relative bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Brand Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"></div>
        
        {/* Content */}
        <div className="relative p-4 sm:p-6 lg:p-8 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
            
            {/* Left: Profile Section */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              <div className="relative flex-shrink-0">
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl bg-white bg-opacity-20 backdrop-blur-sm border-2 border-white border-opacity-30 p-1">
                  <img 
                    src={employee.photo} 
                    alt="Profile" 
                    className="h-full w-full rounded-lg object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center border-2 border-white shadow-lg">
                  <MdVerified className="text-xs" />
                </div>
              </div>
              
              <div className="space-y-2 text-center sm:text-left">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold mb-1">{employee.name}</h1>
                  <p className="text-blue-100 text-base sm:text-lg font-medium">{employee.designation}</p>
                  <p className="text-blue-200 text-sm">{employee.userName} • {employee.department}</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 text-sm">
                  <span className="flex items-center justify-center sm:justify-start gap-2 bg-blue-500 bg-opacity-20 backdrop-blur-sm px-3 py-2 rounded-lg border border-blue-300 border-opacity-30">
                    <span className="text-blue-100">⏰</span>
                    <span className="font-medium text-white">{employee.shiftTime}</span>
                  </span>
                  <span className="flex items-center justify-center sm:justify-start gap-2 bg-purple-500 bg-opacity-20 backdrop-blur-sm px-3 py-2 rounded-lg border border-purple-300 border-opacity-30">
                    <span className="text-purple-100">📍</span>
                    <span className="font-medium text-white">{employee.location}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Status & Live Time */}
            <div className="flex flex-col items-center lg:items-end gap-3">
              <div className="text-center lg:text-right">
                <p className="text-blue-200 text-sm">{getGreeting()}</p>
                <p className="text-lg sm:text-xl font-bold">{formatTime(currentTime)}</p>
                <p className="text-blue-200 text-xs sm:text-sm">{currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-emerald-500 text-white shadow-md">
                  <span className="w-2 h-2 bg-emerald-300 rounded-full mr-2 animate-pulse"></span>
                  {employee.status}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Info Bar */}
        <div className="relative bg-gradient-to-r from-slate-100 to-blue-100 border-t border-white border-opacity-20 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-sm text-slate-700">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 w-full sm:w-auto">
              <span className="flex items-center gap-2 bg-white bg-opacity-70 px-3 py-1 rounded-lg">
                <span className="text-blue-600">📧</span>
                <span className="font-medium text-xs sm:text-sm">{employee.email}</span>
              </span>
              <span className="flex items-center gap-2 bg-white bg-opacity-70 px-3 py-1 rounded-lg">
                <span className="text-green-600">📱</span>
                <span className="font-medium">{employee.phone}</span>
              </span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 w-full sm:w-auto">
              <span className="flex items-center gap-2 bg-white bg-opacity-70 px-3 py-1 rounded-lg">
                <span className="text-purple-600">👤</span>
                <span className="font-medium">Since {employee.joinDate}</span>
              </span>
              <span className="flex items-center gap-2 bg-white bg-opacity-70 px-3 py-1 rounded-lg">
                <span className="text-amber-600">🏆</span>
                <span className="font-medium">{employee.experience} Experience</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Quick Actions Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className={`group bg-gradient-to-r ${action.gradient} p-4 sm:p-6 rounded-xl text-white shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
          >
            <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
              <div className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform duration-200 bg-white bg-opacity-20 backdrop-blur-sm p-2 sm:p-3 rounded-lg flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16">
                <span className="text-white text-xl sm:text-2xl">{action.icon}</span>
              </div>
              <div>
                <span className="font-semibold text-xs sm:text-sm block">{action.label}</span>
                <span className="text-white text-opacity-80 text-xs hidden sm:block">{action.description}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Professional Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Attendance Overview */}
        <section className="lg:col-span-2 bg-white rounded-xl shadow-md border border-slate-200 p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-6">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-1">Attendance Overview</h3>
              <p className="text-slate-600 text-sm">Performance tracking for this month</p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium border border-blue-200">
                This Month
              </span>
              <div className="text-left sm:text-right">
                <p className="text-xl font-bold text-emerald-600">{attendanceStats.efficiency}%</p>
                <p className="text-xs text-slate-500">Efficiency</p>
              </div>
            </div>
          </div>
          
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748B' }}
                />
                <YAxis 
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    padding: '12px'
                  }}
                  formatter={(value, name) => [`${value} days (${chartData.find(d => d.name === name)?.percentage}%)`, name]}
                />
                <Bar 
                  dataKey="value" 
                  radius={[6, 6, 0, 0]}
                  animationDuration={animateCharts ? 1000 : 0}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Attendance Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6 pt-4 border-t border-slate-200">
            {chartData.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: stat.color }}
                  ></div>
                  <span className="text-xs font-medium text-slate-700">{stat.name}</span>
                </div>
                <p className="text-lg font-bold text-slate-800">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.percentage}%</p>
              </div>
            ))}
          </div>
        </section>

        {/* Leave Balance */}
        <section className="bg-white rounded-xl shadow-md border border-slate-200 p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-1">Leave Balance</h3>
            <p className="text-slate-600 text-sm">Available time off</p>
          </div>
          
          <div className="h-40 sm:h-48 mb-4 sm:mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={leaveData} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={60}
                  innerRadius={35}
                  strokeWidth={0}
                  animationDuration={animateCharts ? 1000 : 0}
                >
                  {leaveData.map((entry, index) => (
                    <PieCell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <PieTooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    padding: '12px'
                  }}
                  formatter={(value, name) => [`${value} available out of ${leaveData.find(d => d.name === name)?.total}`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Leave Balance Details */}
          <div className="space-y-3">
            {leaveData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="font-medium text-slate-700 text-sm">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-800">{item.value}</span>
                  <span className="text-slate-500 text-sm">/{item.total}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Content Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Upcoming Shifts */}
        <section className="bg-white rounded-xl shadow-md border border-slate-200 p-6 hover:shadow-lg transition-shadow duration-200">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg flex items-center justify-center w-10 h-10">
              <span className="text-blue-600 text-lg">⏰</span>
            </div>
            Upcoming Shifts
          </h3>
          
          <div className="space-y-3">
            {upcomingShifts.map((shift, index) => (
              <div key={index} className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                shift.status === 'current' 
                  ? 'bg-blue-50 border-blue-500 shadow-md' 
                  : 'bg-slate-50 border-slate-200 hover:bg-blue-50 hover:border-blue-300'
              }`}>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-800">{shift.date}</h4>
                      {shift.status === 'current' && (
                        <span className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-md">
                          CURRENT
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 text-sm">{shift.fullDate}</p>
                    <p className="text-blue-600 font-semibold">{shift.shift}</p>
                    <p className="text-slate-700 font-medium text-sm">{shift.time}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-slate-600 text-sm">
                      <MdLocationOn className="text-amber-500" />
                      <span>{shift.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Notices */}
        <section className="bg-white rounded-xl shadow-md border border-slate-200 p-6 hover:shadow-lg transition-shadow duration-200">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg flex items-center justify-center w-10 h-10">
              <span className="text-purple-600 text-lg">🔔</span>
            </div>
            Recent Notices
          </h3>
          
          {/* Search */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-slate-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search notices..."
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
            />
          </div>
          
          {/* Notices List */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {filteredNotices.map((notice, index) => {
              const styles = getPriorityStyles(notice.priority);
              return (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${styles.border} ${styles.bg} transition-all duration-200 hover:shadow-md`}>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm flex items-center justify-center w-10 h-10">
                      <span className="text-lg">{notice.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{notice.date}</p>
                          <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded">
                            {notice.type}
                          </span>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${styles.badge}`}>
                          {notice.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-slate-700 text-sm leading-relaxed">{notice.message}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
