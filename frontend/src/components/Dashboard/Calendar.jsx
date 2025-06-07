import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Plus, 
  Filter,
  Briefcase,
  Coffee,
  Moon,
  Sun,
  BarChart3,
  Download,
  X
} from "lucide-react";
import { getHolidaysByCompany } from "../../API/apiService";
import { toast } from "react-toastify";

export default function AttendanceCalendarPage() {
  // Get user data from localStorage
  const getUserData = () => {
    const userData = localStorage.getItem("user");
    const profileData = localStorage.getItem("profileData");
    
    let user = null;
    if (userData) {
      try {
        user = JSON.parse(userData);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    
    if (profileData) {
      try {
        const profile = JSON.parse(profileData);
        user = { ...user, ...profile };
      } catch (e) {
        console.error('Error parsing profile data:', e);
      }
    }
    
    return user;
  };

  const currentUser = getUserData();
  const userName = currentUser ? 
    `${currentUser.firstName || currentUser.fullName || currentUser.name || 'Unknown'} ${currentUser.lastName || ''}`.trim() : 
    "Unknown User";
  const employeeId = currentUser?.id || currentUser?.userId || currentUser?.username || localStorage.getItem("userId");

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState("month"); // month, week, agenda
  const [filterStatus, setFilterStatus] = useState("all");
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);

  // Enhanced mock attendance data with more details
  const attendanceData = {
    "2024-12-01": { 
      status: "present", 
      checkIn: "09:15 AM", 
      checkOut: "05:30 PM", 
      shift: "Day Shift",
      location: "Office",
      notes: "On time",
      hours: 8.25
    },
    "2024-12-02": { 
      status: "absent", 
      reason: "Sick Leave", 
      shift: "Day Shift",
      location: "Office",
      notes: "Medical certificate provided"
    },
    "2024-12-03": { 
      status: "present", 
      checkIn: "08:45 AM", 
      checkOut: "05:15 PM", 
      shift: "Day Shift",
      location: "Remote",
      notes: "Early arrival",
      hours: 8.5
    },
    "2024-12-04": { 
      status: "late", 
      checkIn: "09:45 AM", 
      checkOut: "05:30 PM", 
      shift: "Day Shift",
      location: "Office",
      notes: "Traffic delay",
      hours: 7.75
    },
    "2024-12-05": { 
      status: "present", 
      checkIn: "09:00 AM", 
      checkOut: "05:00 PM", 
      shift: "Day Shift",
      location: "Office",
      notes: "Standard hours",
      hours: 8
    },
    "2024-12-06": { 
      status: "holiday", 
      reason: "Weekend", 
      shift: "Off",
      location: "-",
      notes: "Scheduled off day"
    },
    "2024-12-07": { 
      status: "holiday", 
      reason: "Weekend", 
      shift: "Off",
      location: "-",
      notes: "Scheduled off day"
    },
    "2024-12-08": { 
      status: "present", 
      checkIn: "09:10 AM", 
      checkOut: "05:20 PM", 
      shift: "Day Shift",
      location: "Office",
      notes: "Productive day",
      hours: 8.17
    }
  };

  const getAttendanceStats = () => {
    const stats = Object.values(attendanceData).reduce((acc, entry) => {
      acc.total++;
      if (entry.status === "present") acc.present++;
      else if (entry.status === "absent") acc.absent++;
      else if (entry.status === "late") acc.late++;
      else if (entry.status === "holiday") acc.holidays++;
      return acc;
    }, { present: 0, absent: 0, late: 0, holidays: 0, total: 0 });

    stats.percentage = stats.total > 0 ? ((stats.present / (stats.total - stats.holidays)) * 100).toFixed(1) : 0;
    stats.totalHours = Object.values(attendanceData).reduce((sum, entry) => sum + (entry.hours || 0), 0);
    return stats;
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setShowModal(true);
  };

  // Fetch holidays when component mounts or month/year changes
  useEffect(() => {
    fetchHolidays();
  }, [selectedMonth, selectedYear, employeeId]);

  const fetchHolidays = async () => {
    if (!employeeId) {
      toast.error("User ID not found. Please log in again.");
      return;
    }

    try {
      setLoading(true);
      const response = await getHolidaysByCompany(employeeId);
      if (response) {
        // Filter holidays for the selected month and year
        const filteredHolidays = response.filter(holiday => {
          const holidayDate = new Date(holiday.date);
          return holidayDate.getMonth() === selectedMonth && 
                 holidayDate.getFullYear() === selectedYear;
        });
        setHolidays(filteredHolidays);
      }
    } catch (error) {
      console.error('Error fetching holidays:', error);
      toast.error('Failed to load holidays. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Modify getDayData to include holiday information
  const getDayData = (date) => {
    const formattedDate = date.toISOString().split("T")[0];
    
    // Check if it's a holiday
    const holiday = holidays.find(h => h.date.split('T')[0] === formattedDate);
    if (holiday) {
      return {
        status: "holiday",
        reason: holiday.holidayName,
        shift: "Holiday",
        location: holiday.location || "-",
        notes: `${holiday.calendarName} - ${holiday.duration}`,
        isHoliday: true,
        holidayDetails: holiday
      };
    }

    // Return attendance data if exists
    return attendanceData[formattedDate] || null;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "present": 
        return "bg-green-500 border-green-600 text-white";
      case "absent":
        return "bg-red-500 border-red-600 text-white";
      case "late":
        return "bg-amber-500 border-amber-600 text-white";
      case "holiday":
        return "bg-blue-500 border-blue-600 text-white";
      default:
        return "bg-slate-200 border-slate-300 text-slate-600";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "present":
        return <CheckCircle className="w-3 h-3" />;
      case "absent":
        return <XCircle className="w-3 h-3" />;
      case "late":
        return <AlertCircle className="w-3 h-3" />;
      case "holiday":
        return <Coffee className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dayData = getDayData(date);
      if (dayData) {
        return (
          <div className="flex items-center justify-center mt-1">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(dayData.status).split(' ')[0]}`}></div>
          </div>
        );
      }
    }
    return null;
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dayData = getDayData(date);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
      
      let className = "relative transition-all duration-200 hover:bg-blue-50 ";
      
      if (isToday) {
        className += "bg-blue-100 border-2 border-blue-500 ";
      }
      
      if (isSelected) {
        className += "bg-blue-200 border-2 border-blue-600 ";
      }
      
      if (dayData) {
        className += "font-semibold ";
      }
      
      return className;
    }
    return null;
  };

  const stats = getAttendanceStats();

  // Update the modal content to show holiday details
  const renderModalContent = (dayData) => {
    if (!dayData) {
      return (
        <div className="text-center py-8">
          <CalendarIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-800 mb-2">No Data Available</h3>
          <p className="text-slate-600">No attendance or holiday data recorded for this date.</p>
        </div>
      );
    }

    if (dayData.isHoliday) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-center">
            <div className="px-4 py-2 rounded-full flex items-center gap-2 bg-purple-500 text-white">
              <Coffee className="w-4 h-4" />
              <span className="font-medium">Public Holiday</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-medium text-purple-800 mb-2">Holiday Details</h4>
              <div className="space-y-2">
                <p className="text-purple-700">
                  <span className="font-medium">Name:</span> {dayData.reason}
                </p>
                <p className="text-purple-700">
                  <span className="font-medium">Calendar:</span> {dayData.holidayDetails.calendarName}
                </p>
                <p className="text-purple-700">
                  <span className="font-medium">Duration:</span> {dayData.holidayDetails.duration}
                </p>
                {dayData.holidayDetails.location && (
                  <p className="text-purple-700">
                    <span className="font-medium">Location:</span> {dayData.holidayDetails.location}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Return existing attendance data display
    return (
      <div className="space-y-6">
        {/* Status Badge */}
        <div className="flex items-center justify-center">
          <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${getStatusColor(dayData.status)}`}>
            {getStatusIcon(dayData.status)}
            <span className="font-medium capitalize">{dayData.status}</span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 gap-4">
          {dayData.checkIn && (
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Sun className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">Check In</p>
                  <p className="text-green-600 font-semibold">{dayData.checkIn}</p>
                </div>
              </div>
            </div>
          )}

          {dayData.checkOut && (
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Moon className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">Check Out</p>
                  <p className="text-orange-600 font-semibold">{dayData.checkOut}</p>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-slate-800">Shift</p>
                <p className="text-blue-600 font-semibold">{dayData.shift}</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-slate-800">Location</p>
                <p className="text-purple-600 font-semibold">{dayData.location}</p>
              </div>
            </div>
          </div>

          {dayData.hours && (
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">Total Hours</p>
                  <p className="text-indigo-600 font-semibold">{dayData.hours} hours</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        {dayData.notes && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="font-medium text-amber-800 mb-2">Notes</h4>
            <p className="text-amber-700 text-sm">{dayData.notes}</p>
          </div>
        )}

        {/* Reason for absence */}
        {dayData.reason && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-medium text-red-800 mb-2">Reason</h4>
            <p className="text-red-700 text-sm">{dayData.reason}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Attendance Calendar
              </h1>
              <p className="text-slate-600 mt-1">Track your daily attendance and schedule</p>
              <p className="text-sm text-slate-500 mt-1">Employee: {userName} | ID: {employeeId}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors duration-200 text-sm font-medium">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm font-medium">
                <Plus className="w-4 h-4" />
                Add Event
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Sidebar - Stats */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                Attendance Overview
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-green-700 font-medium">Present Days</p>
                      <p className="text-xs text-green-600">This month</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-green-800">{stats.present}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-red-700 font-medium">Absent Days</p>
                      <p className="text-xs text-red-600">This month</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-red-800">{stats.absent}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-amber-700 font-medium">Late Arrivals</p>
                      <p className="text-xs text-amber-600">This month</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-amber-800">{stats.late}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Coffee className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-700 font-medium">Holidays</p>
                      <p className="text-xs text-blue-600">This month</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-blue-800">{stats.holidays}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Attendance Rate</p>
                    <p className="text-2xl font-bold">{stats.percentage}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-100 text-sm">Total Hours</p>
                    <p className="text-lg font-semibold">{stats.totalHours.toFixed(1)}h</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Status Legend</h3>
              
              <div className="space-y-3">
                {[
                  { status: "present", label: "Present", description: "On time arrival" },
                  { status: "absent", label: "Absent", description: "Not present" },
                  { status: "late", label: "Late", description: "Late arrival" },
                  { status: "holiday", label: "Holiday", description: "Scheduled off" }
                ].map(({ status, label, description }) => (
                  <div key={status} className="flex items-center gap-3 p-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${getStatusColor(status)}`}>
                      {getStatusIcon(status)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{label}</p>
                      <p className="text-xs text-slate-600">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              
              {/* Calendar Header */}
              <div className="p-6 border-b border-slate-200 bg-slate-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 flex items-center">
                      <CalendarIcon className="w-6 h-6 mr-2 text-blue-600" />
                      {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                    <p className="text-slate-600 text-sm mt-1">Click on any date to view details</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <select 
                      value={filterStatus} 
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="late">Late</option>
                      <option value="holiday">Holiday</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Calendar Component */}
              <div className="p-6">
                <div className="calendar-container">
                  <Calendar
                    onClickDay={handleDateClick}
                    tileContent={tileContent}
                    tileClassName={tileClassName}
                    value={selectedDate}
                    onActiveStartDateChange={({ activeStartDate }) => setCurrentDate(activeStartDate)}
                    className="w-full border-none shadow-none"
                    next2Label={null}
                    prev2Label={null}
                    showNeighboringMonth={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Modal */}
      {showModal && selectedDate && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div>
                <h3 className="text-xl font-semibold text-slate-800">Day Details</h3>
                <p className="text-slate-600 text-sm mt-1">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6">
              {renderModalContent(getDayData(selectedDate))}
            </div>
          </div>
        </div>
      )}

      {/* Custom Calendar Styles */}
      <style jsx>{`
        .calendar-container .react-calendar {
          width: 100%;
          background: transparent;
          border: none;
          font-family: inherit;
        }
        
        .calendar-container .react-calendar__tile {
          max-width: none;
          background: none;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          margin: 2px;
          padding: 12px 8px;
          transition: all 0.2s;
        }
        
        .calendar-container .react-calendar__tile:hover {
          background-color: #f1f5f9;
          transform: scale(1.05);
        }
        
        .calendar-container .react-calendar__tile--active {
          background: #3b82f6 !important;
          color: white;
        }
        
        .calendar-container .react-calendar__tile--now {
          background: #dbeafe;
          border-color: #3b82f6;
          font-weight: 600;
        }
        
        .calendar-container .react-calendar__month-view__weekdays {
          color: #64748b;
          font-weight: 600;
          font-size: 0.875rem;
        }
        
        .calendar-container .react-calendar__navigation button {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          color: #475569;
          font-weight: 600;
          padding: 8px 16px;
          margin: 0 4px;
          transition: all 0.2s;
        }
        
        .calendar-container .react-calendar__navigation button:hover {
          background: #e2e8f0;
          color: #1e293b;
        }
      `}</style>
    </div>
  );
}
