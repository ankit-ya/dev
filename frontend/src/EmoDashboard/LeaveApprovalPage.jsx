// C:\Users\ankit\Desktop\shramikFEModule\src\EmoDashboard\LeaveApprovalPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Users, 
  CheckCircle, 
  XCircle, 
  Search,
  Filter,
  User,
  Clock,
  FileText,
  AlertCircle,
  Download,
  Plus,
  Eye,
  MessageSquare,
  ChevronDown,
  MoreHorizontal,
  UserCheck,
  UserX,
  Building2,
  CalendarDays,
  Timer,
  Award
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  getEmployerPayrollIssues, 
  updateLeaveStatus, 
  getAllLeaveTypes,
  getAllDepartments,
  addLeaveType
} from "../API/apiService";

const statusConfig = {
  "Pending": { 
    color: "bg-amber-100 text-amber-700 border-amber-200", 
    icon: Clock,
    gradient: "from-amber-500 to-amber-600"
  },
  "Approved": { 
    color: "bg-emerald-100 text-emerald-700 border-emerald-200", 
    icon: CheckCircle,
    gradient: "from-emerald-500 to-emerald-600"
  },
  "Rejected": { 
    color: "bg-red-100 text-red-700 border-red-200", 
    icon: XCircle,
    gradient: "from-red-500 to-red-600"
  }
};

export default function LeaveApprovalPage() {
  const [activeTab, setActiveTab] = useState('Pending');
  const [filters, setFilters] = useState({ 
    dateFrom: '', 
    dateTo: '', 
    dept: '', 
    type: '', 
    status: '',
    search: ''
  });
  const [sortOrder, setSortOrder] = useState({ field: 'appliedDate', asc: false });
  const [selected, setSelected] = useState(new Set());
  const [viewMode, setViewMode] = useState('cards'); // cards or table
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    balance: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to initialize default leave types
  const initializeDefaultLeaveTypes = async () => {
    try {
      console.log("Initializing default leave types...");
      const defaultLeaveTypes = [
        { id: "CL", name: "Casual Leave", balance: 12, validTill: "2024-12-31" },
        { id: "SL", name: "Sick Leave", balance: 12, validTill: "2024-12-31" },
        { id: "EL", name: "Earned Leave", balance: 15, validTill: "2024-12-31" },
        { id: "ML", name: "Maternity Leave", balance: 180, validTill: "2024-12-31" },
        { id: "PL", name: "Paternity Leave", balance: 15, validTill: "2024-12-31" },
        { id: "BL", name: "Bereavement Leave", balance: 5, validTill: "2024-12-31" },
        { id: "WFH", name: "Work From Home", balance: 10, validTill: "2024-12-31" },
        { id: "COMP", name: "Compensatory Off", balance: 5, validTill: "2024-12-31" }
      ];

      for (const leaveType of defaultLeaveTypes) {
        try {
          await addLeaveType(
            leaveType.id,
            leaveType.name,
            leaveType.balance,
            leaveType.validTill
          );
          console.log(`Added leave type: ${leaveType.name}`);
        } catch (error) {
          console.error(`Error adding leave type ${leaveType.name}:`, error);
        }
      }

      // Refresh leave types after initialization
      const updatedTypes = await getAllLeaveTypes();
      setLeaveTypes(updatedTypes || []);
      toast.success("Leave types initialized successfully!");
    } catch (error) {
      console.error("Error initializing leave types:", error);
      toast.error("Failed to initialize leave types");
    }
  };

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const employerId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");

        // Fetch all required data in parallel
        const [requests, depts, types] = await Promise.all([
          getEmployerPayrollIssues(employerId),
          getAllDepartments(token),
          getAllLeaveTypes()
        ]);

        setLeaveRequests(requests || []);
        setDepartments(depts || []);
        
        // If no leave types exist, initialize default ones
        if (!types || types.length === 0) {
          console.log("No leave types found. Initializing defaults...");
          await initializeDefaultLeaveTypes();
        } else {
          setLeaveTypes(types);
        }

        // Calculate stats
        const stats = requests.reduce((acc, req) => ({
          pending: acc.pending + (req.status === 'Pending' ? 1 : 0),
          approved: acc.approved + (req.status === 'Approved' ? 1 : 0),
          rejected: acc.rejected + (req.status === 'Rejected' ? 1 : 0),
          balance: acc.balance
        }), { pending: 0, approved: 0, rejected: 0, balance: 20 });

        setStats(stats);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message || "Failed to fetch data");
        toast.error("Failed to load leave requests");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Set up polling for real-time updates
    const pollInterval = setInterval(async () => {
      try {
        const employerId = localStorage.getItem("userId");
        const requests = await getEmployerPayrollIssues(employerId);
        setLeaveRequests(requests || []);
        
        // Update stats
        const stats = requests.reduce((acc, req) => ({
          pending: acc.pending + (req.status === 'Pending' ? 1 : 0),
          approved: acc.approved + (req.status === 'Approved' ? 1 : 0),
          rejected: acc.rejected + (req.status === 'Rejected' ? 1 : 0),
          balance: acc.balance
        }), { pending: 0, approved: 0, rejected: 0, balance: 20 });

        setStats(stats);
      } catch (error) {
        console.error("Error in polling:", error);
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(pollInterval);
  }, []);

  const filtered = useMemo(() => {
    return leaveRequests
      .filter(r => (activeTab === 'History' || r.status === activeTab))
      .filter(r => !filters.dept || r.dept === filters.dept)
      .filter(r => !filters.type || r.type === filters.type)
      .filter(r => !filters.status || r.status === filters.status)
      .filter(r => !filters.search || 
        r.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        r.reason.toLowerCase().includes(filters.search.toLowerCase()) ||
        r.employeeId.toLowerCase().includes(filters.search.toLowerCase())
      )
      .sort((a, b) => {
        const f = sortOrder.field;
        if (a[f] < b[f]) return sortOrder.asc ? -1 : 1;
        if (a[f] > b[f]) return sortOrder.asc ? 1 : -1;
        return 0;
      });
  }, [activeTab, filters, sortOrder, leaveRequests]);

  const toggleSelect = id => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const clearSelection = () => setSelected(new Set());

  const handleApprove = async (request) => {
    try {
      await updateLeaveStatus(request.id, "APPROVED");
      
      // Update local state
      const updatedRequests = leaveRequests.map(r => 
        r.id === request.id ? { ...r, status: 'Approved' } : r
      );
      setLeaveRequests(updatedRequests);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pending: prev.pending - 1,
        approved: prev.approved + 1
      }));

      toast.success(`Leave request for ${request.name} approved successfully!`);
    } catch (error) {
      console.error("Error approving leave:", error);
      toast.error("Failed to approve leave request");
    }
  };

  const handleReject = async (request) => {
    try {
      await updateLeaveStatus(request.id, "REJECTED");
      
      // Update local state
      const updatedRequests = leaveRequests.map(r => 
        r.id === request.id ? { ...r, status: 'Rejected' } : r
      );
      setLeaveRequests(updatedRequests);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pending: prev.pending - 1,
        rejected: prev.rejected + 1
      }));

      toast.error(`Leave request for ${request.name} rejected.`);
    } catch (error) {
      console.error("Error rejecting leave:", error);
      toast.error("Failed to reject leave request");
    }
  };

  const handleBulkAction = async (action) => {
    try {
      const promises = Array.from(selected).map(id => {
        const request = leaveRequests.find(r => r.id === id);
        if (!request) return null;

        if (action === 'approve') {
          return updateLeaveStatus(id, "APPROVED");
        } else if (action === 'reject') {
          return updateLeaveStatus(id, "REJECTED");
        }
      }).filter(Boolean);

      await Promise.all(promises);
      
      // Update local state
      const updatedRequests = leaveRequests.map(r => {
        if (selected.has(r.id)) {
          return { ...r, status: action === 'approve' ? 'Approved' : 'Rejected' };
        }
        return r;
      });
      setLeaveRequests(updatedRequests);
      
      // Update stats
      const count = selected.size;
      setStats(prev => ({
        ...prev,
        pending: prev.pending - count,
        [action === 'approve' ? 'approved' : 'rejected']: prev[action === 'approve' ? 'approved' : 'rejected'] + count
      }));

      if (action === 'approve') {
        toast.success(`${count} leave requests approved successfully!`);
      } else if (action === 'reject') {
        toast.error(`${count} leave requests rejected.`);
      } else if (action === 'export') {
        // Handle export logic
        const selectedRequests = leaveRequests.filter(r => selected.has(r.id));
        const csv = generateCSV(selectedRequests);
        downloadCSV(csv, 'leave-requests.csv');
        toast.success(`Exported ${count} records to CSV`);
      }
      
      clearSelection();
    } catch (error) {
      console.error("Error in bulk action:", error);
      toast.error("Failed to process bulk action");
    }
  };

  const generateCSV = (requests) => {
    const headers = ['Employee ID', 'Name', 'Department', 'Leave Type', 'From', 'To', 'Days', 'Status', 'Reason'];
    const rows = requests.map(r => [
      r.employeeId,
      r.name,
      r.dept,
      r.type,
      r.from,
      r.to,
      r.days,
      r.status,
      r.reason
    ]);
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const downloadCSV = (csv, filename) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const resetFilters = () => {
    setFilters({ dateFrom: '', dateTo: '', dept: '', type: '', status: '', search: '' });
  };

  const viewDetails = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-slate-600 font-medium">Loading leave requests...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-6">
          <div className="flex flex-col lg:flex-row justify-between gap-4 items-start lg:items-center">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Leave Approval
                </h1>
              </div>
              <p className="text-slate-600 font-medium">
                Manage and approve employee leave requests efficiently
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex bg-slate-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("cards")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === "cards" 
                      ? "bg-white text-blue-600 shadow-sm" 
                      : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  Cards
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === "table" 
                      ? "bg-white text-blue-600 shadow-sm" 
                      : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  Table
                </button>
              </div>
              
              <button className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                <Plus size={20} />
                <span>New Leave Policy</span>
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Pending Requests</p>
                <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Approved This Month</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.approved}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Rejected This Month</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Award className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Balance Leaves</p>
                <p className="text-2xl font-bold text-blue-600">{stats.balance}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Filter className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-800">Filters & Search</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, reason, or ID..."
                  value={filters.search}
                  onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 bg-slate-50/50 text-slate-900 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 font-medium"
                />
              </div>
            </div>
            
            {/* Date From */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Date From</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 bg-slate-50/50 text-slate-900 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 font-medium"
                />
              </div>
            </div>
            
            {/* Date To */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Date To</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(f => ({ ...f, dateTo: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 bg-slate-50/50 text-slate-900 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 font-medium"
                />
              </div>
            </div>
            
            {/* Department */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Department</label>
              <select
                value={filters.dept}
                onChange={(e) => setFilters(f => ({ ...f, dept: e.target.value }))}
                className="w-full border-2 border-slate-200 bg-slate-50/50 text-slate-900 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 font-medium px-3 py-3"
              >
                <option value="">All Departments</option>
                <option value="HR">HR</option>
                <option value="Security">Security</option>
                <option value="Operations">Operations</option>
                <option value="Finance">Finance</option>
                <option value="IT">IT</option>
              </select>
            </div>
            
            {/* Leave Type */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Leave Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(f => ({ ...f, type: e.target.value }))}
                className="w-full border-2 border-slate-200 bg-slate-50/50 text-slate-900 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 font-medium px-3 py-3"
              >
                <option value="">All Types</option>
                <option value="Casual">Casual</option>
                <option value="Sick">Sick</option>
                <option value="Earned">Earned</option>
                <option value="Maternity">Maternity</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <button
              onClick={resetFilters}
              className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-all duration-200"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg p-6">
          <div className="flex space-x-1 bg-slate-100 rounded-xl p-1">
            {['Pending', 'Approved', 'History'].map(tab => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); clearSelection(); }}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk Actions */}
        {selected.size > 0 && (
          <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-medium">
                {selected.size} request{selected.size > 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('approve')}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-xl font-medium transition-all duration-200"
                >
                  <CheckCircle className="w-4 h-4" />
                  Bulk Approve
                </button>
                <button
                  onClick={() => handleBulkAction('reject')}
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-medium transition-all duration-200"
                >
                  <XCircle className="w-4 h-4" />
                  Bulk Reject
                </button>
                <button
                  onClick={() => handleBulkAction('export')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl font-medium transition-all duration-200"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Display */}
        {viewMode === "cards" ? (
          /* Cards View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((request) => {
              const StatusIcon = statusConfig[request.status].icon;
              
              return (
                <div key={request.id} className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selected.has(request.id)}
                        onChange={() => toggleSelect(request.id)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      <img
                        src={request.avatar}
                        alt={request.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <h3 className="font-semibold text-slate-900">{request.name}</h3>
                        <p className="text-sm text-slate-500">{request.employeeId}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl text-sm font-semibold border ${statusConfig[request.status].color}`}>
                      <StatusIcon className="w-4 h-4" />
                      {request.status}
                    </span>
                  </div>
                  
                  {/* Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-slate-600">
                        <Building2 className="w-4 h-4" />
                        Department:
                      </span>
                      <span className="font-medium text-slate-800">{request.dept}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-slate-600">
                        <FileText className="w-4 h-4" />
                        Leave Type:
                      </span>
                      <span className="font-medium text-slate-800">{request.type}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-slate-600">
                        <CalendarDays className="w-4 h-4" />
                        Duration:
                      </span>
                      <span className="font-medium text-slate-800">
                        {request.from} to {request.to} ({request.days} days)
                      </span>
                    </div>
                    
                    <div className="text-sm">
                      <span className="flex items-center gap-2 text-slate-600 mb-1">
                        <MessageSquare className="w-4 h-4" />
                        Reason:
                      </span>
                      <p className="text-slate-800 line-clamp-2">{request.reason}</p>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => viewDetails(request)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-all duration-200"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    {activeTab === 'Pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(request)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-xl font-medium transition-all duration-200"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(request)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-medium transition-all duration-200"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelected(new Set(filtered.map(r => r.id)));
                          } else {
                            clearSelection();
                          }
                        }}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Employee</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Department</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Leave Type</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">From</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">To</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Days</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filtered.map((request) => {
                    const StatusIcon = statusConfig[request.status].icon;
                    
                    return (
                      <tr key={request.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selected.has(request.id)}
                            onChange={() => toggleSelect(request.id)}
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={request.avatar}
                              alt={request.name}
                              className="w-8 h-8 rounded-full"
                            />
                            <div>
                              <div className="font-semibold text-slate-900">{request.name}</div>
                              <div className="text-sm text-slate-500">{request.employeeId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
                            <Building2 className="w-4 h-4" />
                            {request.dept}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-800 font-medium">{request.type}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-800 font-medium">{request.from}</td>
                        <td className="px-6 py-4 text-slate-800 font-medium">{request.to}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                            <Timer className="w-3 h-3" />
                            {request.days}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl text-sm font-semibold border ${statusConfig[request.status].color}`}>
                            <StatusIcon className="w-4 h-4" />
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => viewDetails(request)}
                              className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </button>
                            {activeTab === 'Pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(request)}
                                  className="flex items-center gap-1 px-3 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg text-sm font-medium transition-colors"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleReject(request)}
                                  className="flex items-center gap-1 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
                                >
                                  <XCircle className="w-4 h-4" />
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="p-4 bg-slate-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <FileText className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No Leave Requests Found</h3>
              <p className="text-slate-600">
                {filters.search || filters.dept || filters.type || filters.status
                  ? "Try adjusting your filters to see more results."
                  : "No leave requests available at the moment."}
              </p>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showModal && selectedRequest && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-800">Leave Request Details</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    <XCircle className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* Employee Info */}
                  <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl">
                    <img
                      src={selectedRequest.avatar}
                      alt={selectedRequest.name}
                      className="w-16 h-16 rounded-full"
                    />
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900">{selectedRequest.name}</h4>
                      <p className="text-slate-600">{selectedRequest.employeeId}</p>
                      <p className="text-slate-600">{selectedRequest.dept} Department</p>
                    </div>
                  </div>
                  
                  {/* Leave Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-slate-600">Leave Type</label>
                        <p className="text-slate-900 font-medium">{selectedRequest.type}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600">From Date</label>
                        <p className="text-slate-900 font-medium">{selectedRequest.from}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600">To Date</label>
                        <p className="text-slate-900 font-medium">{selectedRequest.to}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-slate-600">Total Days</label>
                        <p className="text-slate-900 font-medium">{selectedRequest.days} days</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600">Applied Date</label>
                        <p className="text-slate-900 font-medium">{selectedRequest.appliedDate}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600">Status</label>
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl text-sm font-semibold border ${statusConfig[selectedRequest.status].color}`}>
                          {React.createElement(statusConfig[selectedRequest.status].icon, { className: "w-4 h-4" })}
                          {selectedRequest.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Reason */}
                  <div>
                    <label className="text-sm font-medium text-slate-600">Reason</label>
                    <p className="text-slate-900 mt-1 p-3 bg-slate-50 rounded-xl">{selectedRequest.reason}</p>
                  </div>
                  
                  {/* Actions */}
                  {activeTab === 'Pending' && (
                    <div className="flex gap-3 pt-4 border-t border-slate-200">
                      <button
                        onClick={() => {
                          handleApprove(selectedRequest);
                          setShowModal(false);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-xl font-semibold transition-all duration-200"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Approve Request
                      </button>
                      <button
                        onClick={() => {
                          handleReject(selectedRequest);
                          setShowModal(false);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-semibold transition-all duration-200"
                      >
                        <XCircle className="w-5 h-5" />
                        Reject Request
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}