import React, { useState } from "react";
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  Users,
  Search,
  Filter,
  Clock,
  MapPin,
  UserCheck,
  Eye,
  Edit,
  Trash2,
  Download,
  CalendarDays,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Star
} from "lucide-react";
import { toast } from "sonner";

const dummyEvents = [
  {
    id: 1,
    title: "Morning Shift - Security Team",
    date: "2025-04-01",
    team: "Security",
    employees: ["Anil Kumar", "Raj Singh", "Priya Sharma"],
    time: "06:00 AM - 02:00 PM",
    location: "DLF Cyber City",
    priority: "high",
    status: "confirmed"
  },
  {
    id: 2,
    title: "Training Session - New Hires",
    date: "2025-04-02",
    team: "HR",
    employees: ["Alice Johnson", "Nina Patel"],
    time: "10:00 AM - 04:00 PM",
    location: "Conference Room A",
    priority: "medium",
    status: "pending"
  },
  {
    id: 3,
    title: "Payroll Processing Workshop",
    date: "2025-04-03",
    team: "Finance",
    employees: ["Suresh Gupta", "Deepika Verma"],
    time: "09:00 AM - 12:00 PM",
    location: "Finance Department",
    priority: "high",
    status: "confirmed"
  },
  {
    id: 4,
    title: "Evening Security Patrol",
    date: "2025-04-01",
    team: "Security",
    employees: ["Ramesh Kumar", "Sita Devi"],
    time: "06:00 PM - 02:00 AM",
    location: "Infosys SEZ",
    priority: "high",
    status: "confirmed"
  },
  {
    id: 5,
    title: "IT System Maintenance",
    date: "2025-04-04",
    team: "IT",
    employees: ["Amit Sharma", "Rohit Singh"],
    time: "11:00 PM - 05:00 AM",
    location: "Server Room",
    priority: "critical",
    status: "confirmed"
  }
];

const dummyStats = [
  { name: "Anil Kumar", status: "working", shift: "Morning", location: "DLF Cyber City" },
  { name: "Raj Singh", status: "leave", shift: "Morning", location: "N/A" },
  { name: "Priya Sharma", status: "working", shift: "Morning", location: "DLF Cyber City" },
  { name: "Alice Johnson", status: "leave", shift: "N/A", location: "N/A" },
  { name: "Nina Patel", status: "future", shift: "Training", location: "Conference Room A" },
  { name: "Suresh Gupta", status: "working", shift: "Day", location: "Finance Dept" },
  { name: "Deepika Verma", status: "working", shift: "Day", location: "Finance Dept" },
  { name: "Ramesh Kumar", status: "working", shift: "Evening", location: "Infosys SEZ" },
  { name: "Sita Devi", status: "working", shift: "Evening", location: "Infosys SEZ" },
  { name: "Amit Sharma", status: "future", shift: "Night", location: "Server Room" },
  { name: "Rohit Singh", status: "future", shift: "Night", location: "Server Room" }
];

const CalenderTeam = ({ shiftDetails, locationDetails }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [search, setSearch] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewMode, setViewMode] = useState("calendar"); // calendar or list
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const formattedDate = selectedDate.toISOString().split("T")[0];
  
  const filteredEvents = dummyEvents.filter(event => {
    const matchesDate = event.date === formattedDate;
    const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase()) ||
                         event.team.toLowerCase().includes(search.toLowerCase()) ||
                         event.employees.some(emp => emp.toLowerCase().includes(search.toLowerCase()));
    const matchesTeam = selectedTeam === "all" || event.team === selectedTeam;
    const matchesStatus = selectedStatus === "all" || event.status === selectedStatus;
    
    return matchesDate && matchesSearch && matchesTeam && matchesStatus;
  });

  // Format current month and year
  const currentMonth = selectedDate.toLocaleString('default', { month: 'long' });
  const currentYear = selectedDate.getFullYear();

  // Handle month navigation
  const handlePrevMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedDate(newDate);
  };

  // Get days in current month
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Check if date has events
  const getDateEvents = (day) => {
    const checkDate = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return dummyEvents.filter(event => event.date === checkDate);
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(selectedDate);
    const firstDay = getFirstDayOfMonth(selectedDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 w-full" />);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = day === selectedDate.getDate() && 
                        selectedDate.getMonth() === new Date().getMonth() &&
                        selectedDate.getFullYear() === new Date().getFullYear();
      const isToday = day === new Date().getDate() && 
                     selectedDate.getMonth() === new Date().getMonth() &&
                     selectedDate.getFullYear() === new Date().getFullYear();
      
      const dayEvents = getDateEvents(day);

      days.push(
        <button
          key={day}
          onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day))}
          className={`h-24 w-full p-2 rounded-xl text-left transition-all duration-200 border-2 hover:shadow-lg hover:-translate-y-1
            ${isSelected ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-300 shadow-lg' : ''}
            ${isToday && !isSelected ? 'bg-gradient-to-br from-emerald-100 to-emerald-50 border-emerald-300 text-emerald-800' : ''}
            ${!isSelected && !isToday ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' : ''}
            ${dayEvents.length > 0 ? 'ring-2 ring-orange-200' : ''}
          `}
        >
          <div className="flex flex-col h-full">
            <span className={`text-sm font-semibold mb-1 ${isSelected ? 'text-white' : 'text-slate-800'}`}>
              {day}
            </span>
            {dayEvents.length > 0 && (
              <div className="flex-1 space-y-1">
                {dayEvents.slice(0, 2).map((event, idx) => (
                  <div 
                    key={idx} 
                    className={`text-xs px-2 py-1 rounded-md truncate ${
                      isSelected 
                        ? 'bg-white/20 text-white' 
                        : event.priority === 'critical' 
                          ? 'bg-red-100 text-red-700' 
                          : event.priority === 'high' 
                            ? 'bg-orange-100 text-orange-700' 
                            : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className={`text-xs ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                    +{dayEvents.length - 2} more
                  </div>
                )}
              </div>
            )}
          </div>
        </button>
      );
    }

    return days;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "working":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "leave":
        return "bg-red-100 text-red-700 border-red-200";
      case "future":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "critical":
        return "bg-red-500 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-blue-500 text-white";
      case "low":
        return "bg-slate-500 text-white";
      default:
        return "bg-slate-500 text-white";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return CheckCircle;
      case "pending":
        return Clock;
      case "cancelled":
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  const uniqueTeams = [...new Set(dummyEvents.map(event => event.team))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-6">
          <div className="flex flex-col lg:flex-row justify-between gap-4 items-start lg:items-center">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                  <CalendarDays className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Team Calendar & Scheduling
                </h1>
              </div>
              <p className="text-slate-600 font-medium">
                Manage team schedules, shifts, and events with comprehensive calendar view
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex bg-slate-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("calendar")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === "calendar" 
                      ? "bg-white text-blue-600 shadow-sm" 
                      : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  <Calendar className="w-4 h-4 mr-2 inline" />
                  Calendar
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === "list" 
                      ? "bg-white text-blue-600 shadow-sm" 
                      : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  <Users className="w-4 h-4 mr-2 inline" />
                  List
                </button>
              </div>
              
              <button 
                onClick={() => toast.success("New event creation coming soon!")}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <Plus size={20} />
                <span>Add Event</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Filter className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-800">Filters & Search</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search events, teams, employees..."
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 bg-slate-50/50 text-slate-900 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 font-medium"
                />
              </div>
            </div>
            
            {/* Team Filter */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Team</label>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full border-2 border-slate-200 bg-slate-50/50 text-slate-900 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 font-medium px-3 py-3"
              >
                <option value="all">All Teams</option>
                {uniqueTeams.map(team => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
            </div>
            
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full border-2 border-slate-200 bg-slate-50/50 text-slate-900 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 font-medium px-3 py-3"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            {/* Export Button */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Actions</label>
              <button
                onClick={() => toast.success("Calendar export coming soon!")}
                className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-3 rounded-xl font-medium transition-all duration-200"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {viewMode === "calendar" ? (
          /* Calendar View */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar Section */}
            <div className="lg:col-span-2">
              <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg p-6">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors duration-200 flex items-center justify-center"
                  >
                    <ChevronLeft className="h-5 w-5 text-slate-600" />
                  </button>
                  
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-slate-800">
                      {currentMonth} {currentYear}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {filteredEvents.length} events on {selectedDate.toLocaleDateString()}
                    </p>
                  </div>
                  
                  <button
                    onClick={handleNextMonth}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors duration-200 flex items-center justify-center"
                  >
                    <ChevronRight className="h-5 w-5 text-slate-600" />
                  </button>
                </div>

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-sm text-slate-600 font-semibold py-2">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2">
                  {generateCalendarDays()}
                </div>
              </div>
            </div>

            {/* Events Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Clock className="w-5 h-5 text-slate-600" />
                  <h3 className="text-lg font-semibold text-slate-800">
                    Events for {selectedDate.toLocaleDateString()}
                  </h3>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => {
                      const StatusIcon = getStatusIcon(event.status);
                      
                      return (
                        <div 
                          key={event.id} 
                          className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowEventModal(true);
                          }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-slate-800 text-sm">{event.title}</h4>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${getPriorityColor(event.priority)}`}>
                              <Star className="w-3 h-3" />
                              {event.priority}
                            </span>
                          </div>
                          
                          <div className="space-y-2 text-xs text-slate-600">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              {event.time}
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </div>
                            <div className="flex items-center gap-2">
                              <StatusIcon className="w-3 h-3" />
                              {event.status}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-3">
                            <Users className="w-3 h-3 text-slate-500" />
                            <span className="text-xs text-slate-600">
                              {event.employees.length} employees
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">No events scheduled for this day</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* List View */
          <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Users className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-800">All Events & Team Status</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Events List */}
              <div>
                <h3 className="text-md font-semibold text-slate-700 mb-4">Scheduled Events</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {dummyEvents.map((event) => {
                    const StatusIcon = getStatusIcon(event.status);
                    
                    return (
                      <div key={event.id} className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-slate-800">{event.title}</h4>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${getPriorityColor(event.priority)}`}>
                            <Star className="w-3 h-3" />
                            {event.priority}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600 mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {event.date}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {event.time}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {event.location}
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusIcon className="w-4 h-4" />
                            {event.status}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {event.employees.map((emp, idx) => (
                            <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-lg">
                              {emp}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Team Status */}
              <div>
                <h3 className="text-md font-semibold text-slate-700 mb-4">Team Status Overview</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {dummyStats.map((person, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
                          <UserCheck className="w-4 h-4 text-slate-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{person.name}</p>
                          <p className="text-xs text-slate-600">{person.shift} • {person.location}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-medium border ${getStatusColor(person.status)}`}>
                        {person.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Event Details Modal */}
        {showEventModal && selectedEvent && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-800">Event Details</h3>
                  <button
                    onClick={() => setShowEventModal(false)}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    <XCircle className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* Event Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900">{selectedEvent.title}</h4>
                      <p className="text-slate-600">{selectedEvent.team} Team</p>
                    </div>
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl text-sm font-medium ${getPriorityColor(selectedEvent.priority)}`}>
                      <Star className="w-4 h-4" />
                      {selectedEvent.priority} Priority
                    </span>
                  </div>
                  
                  {/* Event Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-slate-500" />
                        <div>
                          <p className="text-sm text-slate-600">Date</p>
                          <p className="font-medium text-slate-900">{selectedEvent.date}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-slate-500" />
                        <div>
                          <p className="text-sm text-slate-600">Time</p>
                          <p className="font-medium text-slate-900">{selectedEvent.time}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-slate-500" />
                        <div>
                          <p className="text-sm text-slate-600">Location</p>
                          <p className="font-medium text-slate-900">{selectedEvent.location}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {React.createElement(getStatusIcon(selectedEvent.status), { className: "w-5 h-5 text-slate-500" })}
                        <div>
                          <p className="text-sm text-slate-600">Status</p>
                          <p className="font-medium text-slate-900 capitalize">{selectedEvent.status}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Team Members */}
                  <div>
                    <h5 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Assigned Team Members ({selectedEvent.employees.length})
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedEvent.employees.map((emp, idx) => {
                        const empStat = dummyStats.find((s) => s.name === emp);
                        
                        return (
                          <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
                                <UserCheck className="w-4 h-4 text-slate-600" />
                              </div>
                              <span className="font-medium text-slate-800">{emp}</span>
                            </div>
                            <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(empStat?.status || 'unknown')}`}>
                              {empStat?.status || 'unknown'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => toast.success("Edit functionality coming soon!")}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl font-medium transition-all duration-200"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Event
                    </button>
                    <button
                      onClick={() => toast.success("View functionality coming soon!")}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-xl font-medium transition-all duration-200"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <UserCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Active Today</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {dummyStats.filter(s => s.status === 'working').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">On Leave</p>
                <p className="text-2xl font-bold text-red-600">
                  {dummyStats.filter(s => s.status === 'leave').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Total Events</p>
                <p className="text-2xl font-bold text-blue-600">{dummyEvents.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Efficiency</p>
                <p className="text-2xl font-bold text-amber-600">94%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalenderTeam;