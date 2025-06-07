import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Menu, 
  MenuItem, 
  Modal, 
  TextField, 
  Select, 
  FormControl, 
  InputLabel, 
  IconButton, 
  Link 
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { 
  createLeave, 
  getAllLeaveTypes, 
  getLeavesByEmployeeId,
  deleteLeave,
  updateLeave 
} from "../../API/apiService";
import LeaveHistory from "./LeaveHistory";
import { useNavigate } from "react-router-dom";
import { Download, Calendar, Clock, MapPin, CheckCircle, AlertCircle, FileText, Plus, Filter, Users, Award, TrendingUp } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { toast } from 'sonner';

const LeaveAndAttendance = () => {
  // Add default leave types
  const DEFAULT_LEAVE_TYPES = [
    { id: 'CL', name: 'Casual Leave', balance: 12 },
    { id: 'SL', name: 'Sick Leave', balance: 12 },
    { id: 'PL', name: 'Privilege Leave', balance: 15 },
    { id: 'ML', name: 'Maternity Leave', balance: 180 },
    { id: 'PTL', name: 'Paternity Leave', balance: 15 },
    { id: 'LWP', name: 'Leave Without Pay', balance: 0 },
    { id: 'WFH', name: 'Work From Home', balance: 10 }
  ];

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
  const [anchorEl, setAnchorEl] = useState(null);
  const [isLeaveRequestOpen, setIsLeaveRequestOpen] = useState(false);
  const [leaveData, setLeaveData] = useState({
    from: "",
    to: "",
    typeOfLeave: "",
    reason: "",
    otherReason: "",
    attachment: null,
  });
  const [leaveTypes, setLeaveTypes] = useState([]);
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("main");
  const [filter, setFilter] = useState("week");
  const [attendanceType, setAttendanceType] = useState("All");
  const [taskFilter, setTaskFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        const [types, history] = await Promise.all([
          getAllLeaveTypes(),
          getLeavesByEmployeeId(employeeId)
        ]);
        
        // If API returns empty array or fails, use default leave types
        const effectiveLeaveTypes = (types && types.length > 0) ? types : DEFAULT_LEAVE_TYPES;
        setLeaveTypes(effectiveLeaveTypes);
        setLeaveHistory(history || []);
        
        // Calculate leave balances
        const balances = effectiveLeaveTypes.reduce((acc, type) => ({
          ...acc,
          [type.id]: type.balance
        }), {});
        setLeaveBalances(balances);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        // If API fails, use default leave types
        setLeaveTypes(DEFAULT_LEAVE_TYPES);
        setLeaveBalances(DEFAULT_LEAVE_TYPES.reduce((acc, type) => ({
          ...acc,
          [type.id]: type.balance
        }), {}));
        setError(error.message || "Failed to fetch data");
        if (error === "No token found. Please log in.") {
          navigate("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();

    // Set up polling for real-time updates
    const pollInterval = setInterval(async () => {
      try {
        const [types, history] = await Promise.all([
          getAllLeaveTypes(),
          getLeavesByEmployeeId(employeeId)
        ]);
        // If API returns empty array, keep using current leave types
        if (types && types.length > 0) {
          setLeaveTypes(types);
        }
        setLeaveHistory(history || []);
      } catch (error) {
        console.error("Error in polling:", error);
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(pollInterval);
  }, [employeeId, navigate]);

  const today = new Date();
  const isPast = (date) => date < new Date(today.setHours(0, 0, 0, 0));

  const attendanceTypes = ["Present", "Sick Leave", "Absent", "Holiday"];
  const tags = ["Office", "Remote", "Site A", "Site B"];
  const tagColor = {
    "Present": "bg-green-100 text-green-800 border-green-200",
    "Absent": "bg-red-100 text-red-800 border-red-200",
    "Sick Leave": "bg-amber-100 text-amber-800 border-amber-200",
    "Holiday": "bg-blue-100 text-blue-800 border-blue-200"
  };

  const getShiftData = (date) => {
    const weekday = date.getDay();
    const status = isPast(date) ? "Completed" : "Upcoming";
    const worked = isPast(date) ? "8h" : "--";
    const tag = tags[weekday % tags.length];
    const attendance = attendanceTypes[weekday % attendanceTypes.length];

    return {
      date,
      status,
      shift: weekday % 2 === 0 ? "Morning" : "Evening",
      timing: weekday % 2 === 0 ? "9:00 AM - 5:00 PM" : "2:00 PM - 10:00 PM",
      worked,
      attendance,
      tag,
      tagStyle: tagColor[attendance],
      isCompleted: isPast(date)
    };
  };

  const getFilteredDates = () => {
    const base = new Date();
    let range = [];

    if (filter === "week") {
      const start = new Date(base);
      start.setDate(start.getDate() - start.getDay());
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        range.push(d);
      }
    } else if (filter === "month") {
      const year = base.getFullYear();
      const month = base.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        range.push(new Date(year, month, i));
      }
    }

    return range;
  };

  const filteredDates = getFilteredDates()
    .map((date) => getShiftData(date))
    .filter((entry) => (attendanceType === "All" || entry.attendance === attendanceType) &&
                       (taskFilter === "All" || entry.tag === taskFilter));

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLeaveRequestOpen = () => {
    setIsLeaveRequestOpen(true);
  };

  const handleLeaveRequestClose = () => {
    setIsLeaveRequestOpen(false);
  };

  const handleInputChange = (field, value) => {
    setLeaveData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      const leaveRequestData = {
        employeeId: employeeId || localStorage.getItem("userId"),
        fromDate: leaveData.from,
        toDate: leaveData.to,
        leaveTypeId: String(leaveData.typeOfLeave).trim(),
        reason: leaveData.reason || undefined,
      };
      
      const response = await createLeave(leaveRequestData, leaveData.attachment);
      
      // Update leave history
      const updatedHistory = await getLeavesByEmployeeId(employeeId);
      setLeaveHistory(updatedHistory);
      
      toast.success("Leave request submitted successfully!");
      
      setIsLeaveRequestOpen(false);
      setLeaveData({
        from: "",
        to: "",
        typeOfLeave: "",
        reason: "",
        otherReason: "",
        attachment: null,
      });
    } catch (error) {
      console.error("Error submitting leave request:", error);
      toast.error(error.message || "Failed to submit leave request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLeave = async (leaveId) => {
    try {
      await deleteLeave(leaveId);
      
      // Update leave history after deletion
      const updatedHistory = await getLeavesByEmployeeId(employeeId);
      setLeaveHistory(updatedHistory);
      
      toast.success("Leave request deleted successfully!");
    } catch (error) {
      console.error("Error deleting leave:", error);
      toast.error("Failed to delete leave request");
    }
  };

  const handleUpdateLeave = async (leaveId, updatedData) => {
    try {
      await updateLeave(leaveId, updatedData);
      
      // Update leave history after update
      const updatedHistory = await getLeavesByEmployeeId(employeeId);
      setLeaveHistory(updatedHistory);
      
      toast.success("Leave request updated successfully!");
    } catch (error) {
      console.error("Error updating leave:", error);
      toast.error("Failed to update leave request");
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add header
    doc.text(`Leave and Attendance Report - ${userName}`, 14, 16);
    doc.text(`Employee ID: ${employeeId}`, 14, 26);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 36);
    
    // Add leave history table
    const tableData = leaveHistory.map(leave => [
      leave.leaveType,
      leave.fromDate,
      leave.toDate,
      leave.days,
      leave.status,
      leave.reason
    ]);
    
    doc.autoTable({
      startY: 50,
      head: [['Type', 'From', 'To', 'Days', 'Status', 'Reason']],
      body: tableData,
    });
    
    doc.save("leave-attendance-report.pdf");
  };

  // Get attendance statistics
  const getAttendanceStats = () => {
    const stats = filteredDates.reduce((acc, entry) => {
      if (entry.isCompleted) {
        acc.total++;
        if (entry.attendance === "Present") acc.present++;
        else if (entry.attendance === "Absent") acc.absent++;
        else if (entry.attendance === "Sick Leave") acc.sickLeave++;
        else if (entry.attendance === "Holiday") acc.holiday++;
      }
      return acc;
    }, { present: 0, absent: 0, sickLeave: 0, holiday: 0, total: 0 });

    stats.percentage = stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : 0;
    return stats;
  };

  const attendanceStats = getAttendanceStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-slate-600 font-medium">Loading leave data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200">
          <div className="flex flex-col items-center space-y-4">
            <AlertCircle className="w-16 h-16 text-red-500" />
            <p className="text-slate-800 font-medium text-lg">Error Loading Data</p>
            <p className="text-slate-600">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Leave & Attendance
              </h1>
              <p className="text-slate-600 mt-1">Manage your time off and track attendance</p>
              <p className="text-sm text-slate-500 mt-1">Employee: {userName} | ID: {employeeId}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={exportToPDF}
                className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors duration-200 text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Export PDF
              </button>
              <button 
                onClick={handleLeaveRequestOpen}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Request Leave
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeSection === "main" && (
          <div className="space-y-8">
            
            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Attendance Rate</p>
                    <p className="text-3xl font-bold mt-1">{attendanceStats.percentage}%</p>
                    <p className="text-green-100 text-sm mt-1">{attendanceStats.present}/{attendanceStats.total} days</p>
                  </div>
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Present Days</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{attendanceStats.present}</p>
                    <p className="text-slate-500 text-sm mt-1">This period</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Sick Leaves</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{attendanceStats.sickLeave}</p>
                    <p className="text-slate-500 text-sm mt-1">Taken</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Leave Balance</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">12</p>
                    <p className="text-slate-500 text-sm mt-1">Days remaining</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <button 
                className="bg-white hover:bg-slate-50 p-6 rounded-2xl border border-slate-200 transition-all duration-200 text-left shadow-lg hover:shadow-xl hover:-translate-y-1 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors duration-200">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-1">Absent Days</h3>
                    <p className="text-slate-600 text-sm">Current & Last Month</p>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => setActiveSection("leaveHistory")}
                className="bg-white hover:bg-slate-50 p-6 rounded-2xl border border-slate-200 transition-all duration-200 text-left shadow-lg hover:shadow-xl hover:-translate-y-1 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-1">Leave History</h3>
                    <p className="text-slate-600 text-sm">View past requests</p>
                  </div>
                </div>
              </button>

              <button 
                className="bg-white hover:bg-slate-50 p-6 rounded-2xl border border-slate-200 transition-all duration-200 text-left shadow-lg hover:shadow-xl hover:-translate-y-1 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors duration-200">
                    <Award className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-1">Reconciliation</h3>
                    <p className="text-slate-600 text-sm">Balance adjustments</p>
                  </div>
                </div>
              </button>

              <button 
                onClick={handleLeaveRequestOpen}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 p-6 rounded-2xl transition-all duration-200 text-left shadow-lg hover:shadow-xl hover:-translate-y-1 group text-white"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center group-hover:bg-opacity-30 transition-all duration-200">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Leave Request</h3>
                    <p className="text-blue-100 text-sm">Apply for time off</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Attendance Calendar Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              {/* Header with filters */}
              <div className="p-6 border-b border-slate-200 bg-slate-50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-1 flex items-center">
                      <Calendar className="w-6 h-6 mr-2 text-blue-600" />
                      Attendance Calendar
                    </h3>
                    <p className="text-slate-600 text-sm">Track your daily attendance and schedule</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <select 
                      value={filter} 
                      onChange={(e) => setFilter(e.target.value)}
                      className="bg-white border border-slate-300 text-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                    </select>

                    <select 
                      value={attendanceType} 
                      onChange={(e) => setAttendanceType(e.target.value)}
                      className="bg-white border border-slate-300 text-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="All">All Status</option>
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="Sick Leave">Sick Leave</option>
                      <option value="Holiday">Holiday</option>
                    </select>
                  </div>
                </div>

                {/* Status Legend */}
                <div className="flex flex-wrap gap-3 mt-4">
                  {Object.entries(tagColor).map(([status, className]) => (
                    <div key={status} className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${className}`}>
                      <div className={`w-2 h-2 rounded-full ${className.includes('green') ? 'bg-green-600' : className.includes('red') ? 'bg-red-600' : className.includes('amber') ? 'bg-amber-600' : 'bg-blue-600'}`}></div>
                      {status}
                    </div>
                  ))}
                </div>
              </div>

              {/* Date Grid */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredDates.map((data, i) => (
                    <div
                      key={i}
                      className={`p-6 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md ${
                        data.isCompleted 
                          ? 'border-slate-200 bg-slate-50 hover:bg-slate-100' 
                          : 'border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300'
                      }`}
                      onClick={() => setSelectedDate(data.date)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-slate-800 text-lg">
                            {data.date.toLocaleDateString('en-US', { weekday: 'short' })}
                          </h4>
                          <p className="text-sm text-slate-600">
                            {data.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${data.tagStyle}`}>
                          {data.attendance}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-slate-600">
                          <Clock className="w-4 h-4 mr-2 text-slate-400" />
                          <span className="font-medium">{data.shift} Shift</span>
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                          <span>{data.timing}</span>
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                          <span>{data.tag}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Hours Worked:</span>
                          <span className={`font-semibold ${data.isCompleted ? 'text-green-600' : 'text-slate-400'}`}>
                            {data.worked}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredDates.length === 0 && (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-800 mb-2">No Records Found</h3>
                    <p className="text-slate-600">No attendance records match your current filters.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Leave History Section */}
        {activeSection === "leaveHistory" && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <button 
                onClick={() => setActiveSection("main")}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors duration-200"
              >
                ← Back to Dashboard
              </button>
            </div>
            <LeaveHistory />
          </div>
        )}

        {/* Leave Request Modal */}
        {isLeaveRequestOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div>
                  <h3 className="text-xl font-semibold text-slate-800">Leave Request</h3>
                  <p className="text-slate-600 text-sm mt-1">Submit your time off request</p>
                </div>
                <button 
                  onClick={handleLeaveRequestClose}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors duration-200"
                >
                  <CloseIcon />
                </button>
              </div>
              
              {/* Modal Content */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      From Date *
                    </label>
                    <input
                      type="date"
                      value={leaveData.from}
                      onChange={(e) => handleInputChange("from", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      To Date
                    </label>
                    <input
                      type="date"
                      value={leaveData.to}
                      onChange={(e) => handleInputChange("to", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Type of Leave *
                  </label>
                  <select
                    value={leaveData.typeOfLeave}
                    onChange={(e) => handleInputChange("typeOfLeave", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select leave type</option>
                    {leaveTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name} ({type.balance} days available)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Reason
                  </label>
                  <textarea
                    value={leaveData.reason}
                    onChange={(e) => handleInputChange("reason", e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Please provide a reason for your leave request..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Attachment (Optional)
                  </label>
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setLeaveData((prevData) => ({ ...prevData, attachment: file }));
                      }
                    }}
                    className="hidden"
                    id="leave-attachment"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <label 
                    htmlFor="leave-attachment" 
                    className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200"
                  >
                    <div className="text-center">
                      <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <span className="text-sm text-slate-600">
                        {leaveData.attachment ? leaveData.attachment.name : "Click to upload file or drag here"}
                      </span>
                    </div>
                  </label>
                </div>

                {/* Modal Footer */}
                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <button 
                    onClick={handleLeaveRequestClose}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSubmit}
                    disabled={loading || !leaveData.from || !leaveData.typeOfLeave}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Submitting..." : "Submit Request"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveAndAttendance;