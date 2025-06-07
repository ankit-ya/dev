import React, { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Download,
  Search,
  Filter,
  DollarSign,
  Users,
  Calculator,
  FileText,
  TrendingUp,
  Eye,
  EyeOff,
  Building2,
  Briefcase,
  Calendar,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Zap,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import { toast } from "sonner";

import {
  getPayrollSummary,
  generateESIReport,
  generateEPFReport,
  calculateEmployeeSalary,
  getComplianceDashboard,
  getAdvanceRequests,
  updateAdvanceRequest
} from "../API/apiService";

/*******************************************
 * Constants
 *******************************************/
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

/***************************
 * Utility Helpers
 ***************************/
const formatCurrency = (amount) => `₹${amount.toLocaleString()}`;

const flattenEmployees = (data) => {
  return data.flatMap(dept => 
    dept.teams.flatMap(team => 
      team.payroll.map(emp => ({
        ...emp,
        department: dept.departmentName,
        team: team.teamName
      }))
    )
  );
};

const csvBuilders = {
  salary: (employees) => {
    const headers = ["ID", "Name", "Department", "Team", "Basic", "Allowances", "Deductions", "Net Pay", "Bank Account", "IFSC"];
    const rows = employees.map(emp => [
      emp.id, emp.name, emp.department, emp.team, emp.basic, emp.allowances, 
      emp.deductions, emp.basic + emp.allowances - emp.deductions, emp.bankAccount, emp.ifsc
    ]);
    return [headers, ...rows].map(row => row.join(",")).join("\n");
  },
  epf: (employees) => {
    const headers = ["ID", "Name", "Basic Salary", "EPF Contribution (12%)", "Employer EPF (12%)", "Total EPF"];
    const rows = employees.map(emp => {
      const epfEmp = Math.round(emp.basic * 0.12);
      const epfEmployer = Math.round(emp.basic * 0.12);
      return [emp.id, emp.name, emp.basic, epfEmp, epfEmployer, epfEmp + epfEmployer];
    });
    return [headers, ...rows].map(row => row.join(",")).join("\n");
  },
  esi: (employees) => {
    const headers = ["ID", "Name", "Gross Salary", "ESI Employee (0.75%)", "ESI Employer (3.25%)", "Total ESI"];
    const rows = employees.map(emp => {
      const gross = emp.basic + emp.allowances;
      const esiEmp = Math.round(gross * 0.0075);
      const esiEmployer = Math.round(gross * 0.0325);
      return [emp.id, emp.name, gross, esiEmp, esiEmployer, esiEmp + esiEmployer];
    });
    return [headers, ...rows].map(row => row.join(",")).join("\n");
  }
};

const downloadFile = (filename, content) => {
  const blob = new Blob([content], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
  toast.success(`${filename} downloaded successfully!`);
};

// Enhanced Employee Card Component
const EmployeeCard = ({ employee, isExpanded, onToggle }) => {
  const gross = employee.basic + employee.allowances;
  const net = gross - employee.deductions;
  const epf = Math.round(employee.basic * 0.12);
  const esi = Math.round(gross * 0.0075);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              {employee.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">{employee.name}</h3>
              <p className="text-slate-600 text-sm">{employee.designation}</p>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-lg font-medium">
                  {employee.id}
                </span>
                <span className="text-xs text-slate-500">
                  {employee.department} • {employee.team}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(net)}
            </div>
            <p className="text-sm text-slate-500">Net Pay</p>
            <button
              onClick={() => onToggle(employee.id)}
              className="mt-2 p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded-xl">
            <p className="text-xs text-blue-600 font-medium">Basic</p>
            <p className="text-sm font-bold text-blue-800">{formatCurrency(employee.basic)}</p>
          </div>
          <div className="text-center p-3 bg-emerald-50 rounded-xl">
            <p className="text-xs text-emerald-600 font-medium">Allowances</p>
            <p className="text-sm font-bold text-emerald-800">{formatCurrency(employee.allowances)}</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-xl">
            <p className="text-xs text-red-600 font-medium">Deductions</p>
            <p className="text-sm font-bold text-red-800">{formatCurrency(employee.deductions)}</p>
          </div>
        </div>

        {isExpanded && (
          <div className="border-t border-slate-200 pt-4 space-y-4">
            {/* Detailed Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-800 flex items-center">
                  <Calculator className="w-4 h-4 mr-2 text-blue-600" />
                  Salary Breakdown
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Basic Salary:</span>
                    <span className="font-medium">{formatCurrency(employee.basic)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Allowances:</span>
                    <span className="font-medium">{formatCurrency(employee.allowances)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Gross Salary:</span>
                    <span className="font-medium">{formatCurrency(gross)}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t pt-2">
                    <span className="text-slate-600">Deductions:</span>
                    <span className="font-medium text-red-600">-{formatCurrency(employee.deductions)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold border-t pt-2">
                    <span className="text-slate-800">Net Pay:</span>
                    <span className="text-emerald-600">{formatCurrency(net)}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-800 flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-emerald-600" />
                  Statutory Details
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">EPF (12%):</span>
                    <span className="font-medium">{formatCurrency(epf)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">ESI (0.75%):</span>
                    <span className="font-medium">{formatCurrency(esi)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Join Date:</span>
                    <span className="font-medium">{new Date(employee.joinDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Status:</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-700">
                      {employee.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bank Details */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h4 className="font-semibold text-slate-800 mb-3 flex items-center">
                <Building2 className="w-4 h-4 mr-2 text-purple-600" />
                Bank Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-slate-500">Account Number</span>
                  <p className="font-mono text-sm font-medium">{employee.bankAccount}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">IFSC Code</span>
                  <p className="font-mono text-sm font-medium">{employee.ifsc}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Summary Statistics Component
const StatCard = ({ icon: Icon, label, value, trend, trendValue, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-600",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-600",
    purple: "bg-purple-50 border-purple-200 text-purple-600",
    orange: "bg-orange-50 border-orange-200 text-orange-600"
  };

  return (
    <div className={`border rounded-2xl p-6 ${colorClasses[color]} transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-white shadow-sm`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-xs font-medium ${
            trend === 'up' ? 'text-emerald-600' : 'text-red-600'
          }`}>
            {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            <span>{trendValue}%</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium opacity-75 mb-1">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
};

// Loading Skeleton
const Skeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 5 }, (_, i) => (
      <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-3 bg-slate-200 rounded w-1/4"></div>
            </div>
            <div className="h-8 bg-slate-200 rounded w-20"></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }, (_, j) => (
              <div key={j} className="h-16 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Add this after the EmployeeCard component
const AdvanceRequestCard = ({ request, onStatusUpdate }) => {
  const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800"
  };

  const handleUpdate = async (status) => {
    try {
      await onStatusUpdate(request.id, status);
      toast.success(`Request ${status.toLowerCase()} successfully`);
    } catch (error) {
      toast.error(`Failed to ${status.toLowerCase()} request`);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-lg text-slate-800">{request.employeeName}</h3>
          <p className="text-sm text-slate-600">Employee ID: {request.employeeId}</p>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${statusColors[request.status]}`}>
            {request.status}
          </span>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-emerald-600">₹{request.amount.toLocaleString()}</p>
          <p className="text-sm text-slate-500">Requested Amount</p>
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <p className="text-sm text-slate-600">Reason:</p>
          <p className="text-slate-800 mt-1">{request.reason}</p>
        </div>
        <div>
          <p className="text-sm text-slate-600">Request Date:</p>
          <p className="text-slate-800">{new Date(request.requestDate).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-sm text-slate-600">Repayment Terms:</p>
          <p className="text-slate-800">{request.repaymentMonths} months</p>
        </div>
      </div>

      {request.status === 'PENDING' && (
        <div className="flex gap-3 mt-4 pt-4 border-t border-slate-200">
          <button
            onClick={() => handleUpdate('APPROVED')}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            Approve
          </button>
          <button
            onClick={() => handleUpdate('REJECTED')}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <XCircle className="w-4 h-4" />
            Reject
          </button>
        </div>
      )}
    </div>
  );
};

export default function PayrollPage() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState("nameAsc");
  const [expandedEmployee, setExpandedEmployee] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [complianceData, setComplianceData] = useState(null);
  const [viewMode, setViewMode] = useState("cards"); // cards or table
  const [advanceRequests, setAdvanceRequests] = useState([]);
  const [showAdvanceRequests, setShowAdvanceRequests] = useState(false);

  const employerId = localStorage.getItem("userId");

  // Fetch real payroll data
  useEffect(() => {
    const fetchPayrollData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Format dates for API
        const startDate = new Date(year, month, 1).toISOString().split('T')[0];
        const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

        // Fetch payroll summary and compliance data
        const [payrollRes, complianceRes] = await Promise.all([
          getPayrollSummary(startDate, endDate, employerId),
          getComplianceDashboard(startDate, employerId)
        ]);

        if (payrollRes.resCode === 0 && payrollRes.res) {
          setData(payrollRes.res);
          setComplianceData(complianceRes.res);
        } else {
          throw new Error(payrollRes.resMsg || 'Failed to fetch payroll data');
        }
      } catch (err) {
        console.error('Error fetching payroll data:', err);
        setError(err.message || 'Failed to fetch payroll data');
      } finally {
        setLoading(false);
      }
    };

    fetchPayrollData();
  }, [month, year, employerId]);

  // Add this to your existing useEffect
  useEffect(() => {
    const fetchAdvanceRequests = async () => {
      try {
        const response = await getAdvanceRequests(employerId);
        if (response.resCode === 200 && response.res) {
          setAdvanceRequests(response.res);
        }
      } catch (error) {
        console.error('Error fetching advance requests:', error);
      }
    };

    fetchAdvanceRequests();
  }, [employerId]);

  // Derived data
  const allEmps = useMemo(() => flattenEmployees(data), [data]);
  
  const filteredEmps = useMemo(() => {
    let list = [...allEmps];
    if (selectedDept !== "all") list = list.filter(e => e.department === selectedDept);
    if (selectedTeam !== "all") list = list.filter(e => e.team === selectedTeam);
    if (searchTerm.trim()) list = list.filter(e => 
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.designation.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    list.sort((a, b) => {
      const netA = a.basic + a.allowances - a.deductions;
      const netB = b.basic + b.allowances - b.deductions;
      if (sortKey === "netDesc") return netB - netA;
      if (sortKey === "netAsc") return netA - netB;
      if (sortKey === "nameDesc") return b.name.localeCompare(a.name);
      return a.name.localeCompare(b.name);
    });
    
    return list;
  }, [allEmps, selectedDept, selectedTeam, searchTerm, sortKey]);

  // Calculate totals and statistics
  const statistics = useMemo(() => {
    const totalPayout = filteredEmps.reduce((s, e) => s + e.basic + e.allowances - e.deductions, 0);
    const totalEPF = filteredEmps.reduce((s, e) => s + Math.round(e.basic * 0.12), 0);
    const totalESI = filteredEmps.reduce((s, e) => s + Math.round((e.basic + e.allowances) * 0.0075), 0);
    const avgSalary = filteredEmps.length > 0 ? totalPayout / filteredEmps.length : 0;
    
    return {
      totalPayout,
      totalEPF,
      totalESI,
      avgSalary,
      employeeCount: filteredEmps.length,
      departmentCount: new Set(filteredEmps.map(e => e.department)).size,
      teamCount: new Set(filteredEmps.map(e => e.team)).size
    };
  }, [filteredEmps]);

  const deptOptions = useMemo(() => data.map(d => d.departmentName), [data]);
  
  const teamOptions = useMemo(() => {
    if (selectedDept === "all") return [];
    const found = data.find(d => d.departmentName === selectedDept);
    return found ? found.teams.map(t => t.teamName) : [];
  }, [data, selectedDept]);

  const handleDownload = async (list, type, prefix = "ALL") => {
    try {
      const startDate = new Date(year, month, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
      
      let response;
      let content;
      
      switch (type) {
        case 'epf':
          response = await generateEPFReport(startDate, employerId);
          content = response.res;
          break;
        case 'esi':
          response = await generateESIReport(startDate, employerId);
          content = response.res;
          break;
        case 'salary':
          // Use the existing CSV builder for salary as it's a simpler format
          content = csvBuilders.salary(list);
          break;
        default:
          throw new Error('Invalid report type');
      }
      
      downloadFile(`${prefix}_${type.toUpperCase()}_${MONTHS[month]}_${year}.csv`, content);
    } catch (err) {
      console.error(`Error generating ${type} report:`, err);
      setError(`Failed to generate ${type.toUpperCase()} report`);
    }
  };

  const toggleEmployeeExpand = (id) => {
    setExpandedEmployee(expandedEmployee === id ? null : id);
  };

  const handleAdvanceRequestUpdate = async (requestId, status) => {
    try {
      const response = await updateAdvanceRequest(requestId, status);
      if (response.resCode === 200) {
        setAdvanceRequests(prevRequests =>
          prevRequests.map(req =>
            req.id === requestId ? { ...req, status } : req
          )
        );
      }
    } catch (error) {
      console.error('Error updating advance request:', error);
      throw error;
    }
  };

  // Add this section after your Statistics Cards section
  const renderAdvanceRequests = () => (
    <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Salary Advance Requests</h3>
            <p className="text-slate-500 text-sm">Manage employee advance requests</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium">
            {advanceRequests.filter(r => r.status === 'PENDING').length} Pending
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {advanceRequests.map(request => (
          <AdvanceRequestCard
            key={request.id}
            request={request}
            onStatusUpdate={handleAdvanceRequestUpdate}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-6">
          <div className="flex flex-col lg:flex-row justify-between gap-4 items-start lg:items-center">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Payroll Management
                </h1>
              </div>
              <p className="text-slate-600 font-medium">
                Comprehensive payroll processing and management system
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center space-x-2 bg-emerald-100 px-4 py-2 rounded-xl">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-emerald-700 font-medium text-sm">
                  {MONTHS[month]} {year}
                </span>
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <Filter size={20} />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Filter className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-800">Filters & Controls</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Period Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Month</label>
                <select 
                  value={month} 
                  onChange={e => setMonth(+e.target.value)} 
                  className="w-full px-3 py-2 border-2 border-slate-200 bg-white rounded-xl focus:outline-none focus:border-blue-500 transition-all duration-200"
                >
                  {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Year</label>
                <input 
                  type="number" 
                  value={year} 
                  onChange={e => setYear(+e.target.value)} 
                  className="w-full px-3 py-2 border-2 border-slate-200 bg-white rounded-xl focus:outline-none focus:border-blue-500 transition-all duration-200" 
                />
              </div>
              
              {/* Department & Team */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Department</label>
                <select 
                  value={selectedDept} 
                  onChange={e => { setSelectedDept(e.target.value); setSelectedTeam("all"); }} 
                  className="w-full px-3 py-2 border-2 border-slate-200 bg-white rounded-xl focus:outline-none focus:border-blue-500 transition-all duration-200"
                >
                  <option value="all">All Departments</option>
                  {deptOptions.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Team</label>
                <select 
                  value={selectedTeam} 
                  onChange={e => setSelectedTeam(e.target.value)} 
                  disabled={selectedDept === "all"}
                  className="w-full px-3 py-2 border-2 border-slate-200 bg-white rounded-xl focus:outline-none focus:border-blue-500 transition-all duration-200 disabled:opacity-50"
                >
                  <option value="all">All Teams</option>
                  {teamOptions.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              
              {/* Search */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    placeholder="Search employees..." 
                    className="w-full pl-10 pr-4 py-2 border-2 border-slate-200 bg-white rounded-xl focus:outline-none focus:border-blue-500 transition-all duration-200"
                  />
                </div>
              </div>
              
              {/* Sort */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Sort By</label>
                <select
                  value={sortKey}
                  onChange={e => setSortKey(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-slate-200 bg-white rounded-xl focus:outline-none focus:border-blue-500 transition-all duration-200"
                >
                  <option value="nameAsc">Name A-Z</option>
                  <option value="nameDesc">Name Z-A</option>
                  <option value="netAsc">Net Pay (Low-High)</option>
                  <option value="netDesc">Net Pay (High-Low)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Users}
            label="Total Employees"
            value={statistics.employeeCount}
            color="blue"
            trend="up"
            trendValue="5.2"
          />
          <StatCard
            icon={DollarSign}
            label="Total Payout"
            value={formatCurrency(statistics.totalPayout)}
            color="emerald"
            trend="up"
            trendValue="8.1"
          />
          <StatCard
            icon={Calculator}
            label="Average Salary"
            value={formatCurrency(Math.round(statistics.avgSalary))}
            color="purple"
            trend="up"
            trendValue="3.4"
          />
          <StatCard
            icon={FileText}
            label="Total EPF + ESI"
            value={formatCurrency(statistics.totalEPF + statistics.totalESI)}
            color="orange"
            trend="up"
            trendValue="2.7"
          />
        </div>

        {/* View Mode Toggle & Download Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg p-6">
          <div className="flex bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode("cards")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === "cards" 
                  ? "bg-white text-blue-600 shadow-sm" 
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              <BarChart3 className="w-4 h-4 mr-2 inline" />
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
              <PieChart className="w-4 h-4 mr-2 inline" />
              Table
            </button>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {['salary', 'epf', 'esi'].map(type => (
              <button 
                key={type} 
                onClick={() => handleDownload(filteredEmps, type, 'PAYROLL')} 
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
              >
                <Download className="w-4 h-4" />
                {type.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Employee List */}
        <div className="space-y-6">
          {loading ? (
            <Skeleton />
          ) : filteredEmps.length === 0 ? (
            <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg p-12 text-center">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 mb-2">No employees found</h3>
              <p className="text-slate-500">Try adjusting your filters or search criteria</p>
            </div>
          ) : (
            <>
              {/* Results Header */}
              <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-slate-600">Showing</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-bold">
                        {filteredEmps.length}
                      </span>
                      <span className="text-sm font-medium text-slate-600">employees</span>
                    </div>
                    
                    {(selectedDept !== "all" || selectedTeam !== "all" || searchTerm) && (
                      <div className="flex items-center space-x-2">
                        {selectedDept !== "all" && (
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium">
                            {selectedDept}
                          </span>
                        )}
                        {selectedTeam !== "all" && (
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                            {selectedTeam}
                          </span>
                        )}
                        {searchTerm && (
                          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-medium">
                            "{searchTerm}"
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-sm text-slate-500">
                    Total Payout: <span className="font-bold text-emerald-600">{formatCurrency(statistics.totalPayout)}</span>
                  </div>
                </div>
              </div>

              {/* Employee List Content */}
              {viewMode === "cards" ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredEmps.map(employee => (
                    <EmployeeCard
                      key={employee.id}
                      employee={employee}
                      isExpanded={expandedEmployee === employee.id}
                      onToggle={toggleEmployeeExpand}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-100">
                        <tr>
                          <th className="text-left p-4 font-semibold text-slate-700">Employee</th>
                          <th className="text-left p-4 font-semibold text-slate-700">Department</th>
                          <th className="text-left p-4 font-semibold text-slate-700">Team</th>
                          <th className="text-right p-4 font-semibold text-slate-700">Basic</th>
                          <th className="text-right p-4 font-semibold text-slate-700">Allowances</th>
                          <th className="text-right p-4 font-semibold text-slate-700">Deductions</th>
                          <th className="text-right p-4 font-semibold text-slate-700">Net Pay</th>
                          <th className="text-center p-4 font-semibold text-slate-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEmps.map(employee => {
                          const net = employee.basic + employee.allowances - employee.deductions;
                          const isExpanded = expandedEmployee === employee.id;
                          
                          return (
                            <React.Fragment key={employee.id}>
                              <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                                <td className="p-4">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                      {employee.name.charAt(0)}
                                    </div>
                                    <div>
                                      <p className="font-medium text-slate-800">{employee.name}</p>
                                      <p className="text-xs text-slate-500">{employee.id} • {employee.designation}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4 text-slate-600">{employee.department}</td>
                                <td className="p-4 text-slate-600">{employee.team}</td>
                                <td className="p-4 text-right font-medium">{formatCurrency(employee.basic)}</td>
                                <td className="p-4 text-right font-medium">{formatCurrency(employee.allowances)}</td>
                                <td className="p-4 text-right font-medium text-red-600">{formatCurrency(employee.deductions)}</td>
                                <td className="p-4 text-right font-bold text-emerald-600">{formatCurrency(net)}</td>
                                <td className="p-4 text-center">
                                  <button
                                    onClick={() => toggleEmployeeExpand(employee.id)}
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                  >
                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                  </button>
                                </td>
                              </tr>
                              
                              {isExpanded && (
                                <tr className="bg-slate-50">
                                  <td colSpan="8" className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                      <div className="space-y-3">
                                        <h4 className="font-semibold text-slate-800">Salary Details</h4>
                                        <div className="space-y-2 text-sm">
                                          <div className="flex justify-between">
                                            <span className="text-slate-600">Gross:</span>
                                            <span className="font-medium">{formatCurrency(employee.basic + employee.allowances)}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-slate-600">EPF:</span>
                                            <span className="font-medium">{formatCurrency(Math.round(employee.basic * 0.12))}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-slate-600">ESI:</span>
                                            <span className="font-medium">{formatCurrency(Math.round((employee.basic + employee.allowances) * 0.0075))}</span>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="space-y-3">
                                        <h4 className="font-semibold text-slate-800">Bank Details</h4>
                                        <div className="space-y-2 text-sm">
                                          <div>
                                            <span className="text-slate-600">Account:</span>
                                            <p className="font-mono font-medium">{employee.bankAccount}</p>
                                          </div>
                                          <div>
                                            <span className="text-slate-600">IFSC:</span>
                                            <p className="font-mono font-medium">{employee.ifsc}</p>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="space-y-3">
                                        <h4 className="font-semibold text-slate-800">Employment</h4>
                                        <div className="space-y-2 text-sm">
                                          <div className="flex justify-between">
                                            <span className="text-slate-600">Join Date:</span>
                                            <span className="font-medium">{new Date(employee.joinDate).toLocaleDateString()}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-slate-600">Status:</span>
                                            <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-700">
                                              {employee.status}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Add this after the Statistics Cards */}
        {renderAdvanceRequests()}

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center text-sm text-slate-500 py-4">
          © {new Date().getFullYear()} Shramii Payroll
        </footer>
      </div>
    </div>
  );
}