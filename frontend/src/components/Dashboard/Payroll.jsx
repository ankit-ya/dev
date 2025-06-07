import React, { useEffect, useState } from "react";
import { Download, AlertTriangle, Plus, MessageCircle, DollarSign, Calendar, CreditCard, TrendingUp, FileText, Clock, CheckCircle, User, Building } from "lucide-react";
import { format } from "date-fns";
import Swal from "sweetalert2";

import { 
  calculateEmployeeSalary, 
  generateSalarySlip, 
  getEmployeePayslips, 
  requestSalaryAdvance, 
  raisePayrollIssue,
  fetchUserProfile,
  getTaxSummary
} from "../../API/apiService";

export default function EmployeePayrollPage() {
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
  const employeeId = currentUser?.id || currentUser?.userId || currentUser?.username || localStorage.getItem("userId");
  const userName = currentUser ? 
    `${currentUser.firstName || currentUser.fullName || currentUser.name || 'Unknown'} ${currentUser.lastName || ''}`.trim() : 
    "Unknown User";

  // Generate available months (current month and past 11 months)
  const generateAvailableMonths = () => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthString = format(date, "MMMM yyyy");
      months.push({
        label: monthString,
        value: format(date, "yyyy-MM-dd"),
        date: date
      });
    }
    
    return months;
  };

  const availableMonths = generateAvailableMonths();
  const [selectedMonth, setSelectedMonth] = useState(availableMonths[0]);
  const [payrollData, setPayrollData] = useState(null);
  const [bankInfo, setBankInfo] = useState(null);
  const [pastPayslips, setPastPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [issueText, setIssueText] = useState("");
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [advanceReason, setAdvanceReason] = useState("");

  useEffect(() => {
    if (selectedMonth) {
      fetchPayrollData(selectedMonth);
    }
    fetchPayslipHistory();
  }, [selectedMonth, employeeId]);

  // Fetch payroll data for selected month
  const fetchPayrollData = async (monthData) => {
    if (!employeeId) {
      setError("Employee ID not found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Calculate dates for the selected month
      const startDate = format(monthData.date, "yyyy-MM-dd");
      const endDate = format(new Date(monthData.date.getFullYear(), monthData.date.getMonth() + 1, 0), "yyyy-MM-dd");

      // Fetch salary calculation for the month
      const salaryResponse = await calculateEmployeeSalary(employeeId, startDate, endDate);
      
      if (salaryResponse.resCode === 200 && salaryResponse.res) {
        const payrollRes = salaryResponse.res;
        
        // Transform API response to component format
        const transformedPayroll = {
          paymentDate: new Date(),
          netSalary: parseFloat(payrollRes.netSalary || 0),
          grossSalary: parseFloat(payrollRes.grossSalary || 0),
          deductions: parseFloat(payrollRes.totalDeductions || 0),
          paymentStatus: payrollRes.status === "CALCULATED" ? "Processed" : "Pending",
          earnings: [
            { label: "Basic Pay", amount: parseFloat(payrollRes.basicSalary || 0) },
            { label: "HRA", amount: parseFloat(payrollRes.hra || 0) },
            { label: "Conveyance", amount: parseFloat(payrollRes.conveyanceAllowance || 0) },
            { label: "Medical", amount: parseFloat(payrollRes.medicalAllowance || 0) },
            { label: "Special Allowance", amount: parseFloat(payrollRes.specialAllowance || 0) },
          ].filter(item => item.amount > 0),
          deductionsList: [
            { label: "EPF", amount: parseFloat(payrollRes.epfEmployee || 0) },
            { label: "ESI", amount: parseFloat(payrollRes.esiEmployee || 0) },
            { label: "Professional Tax", amount: parseFloat(payrollRes.professionalTax || 0) },
            { label: "Income Tax", amount: parseFloat(payrollRes.incomeTax || 0) },
            { label: "Loan Deduction", amount: parseFloat(payrollRes.loanDeduction || 0) },
          ].filter(item => item.amount > 0),
          workingDays: payrollRes.totalWorkingDays || 0,
          paidDays: payrollRes.actualWorkingDays || 0,
          overtimeHours: payrollRes.overtimeHours || 0,
          overtimeAmount: parseFloat(payrollRes.overtimeAmount || 0),
        };

        setPayrollData(transformedPayroll);
      }

      // Fetch bank details from user profile
      if (currentUser?.bankDetails) {
        setBankInfo({
          bankName: currentUser.bankDetails.bankName || "Not provided",
          accountNumber: currentUser.bankDetails.accountNumber ? 
            `****${currentUser.bankDetails.accountNumber.slice(-4)}` : "Not provided",
          ifsc: currentUser.bankDetails.ifsc || "Not provided",
          paymentMode: "NEFT",
          transactionId: `TXN${Date.now()}`,
        });
      }

    } catch (error) {
      console.error("Error fetching payroll data:", error);
      setError(error.message || "Failed to load payroll data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch payslip history
  const fetchPayslipHistory = async () => {
    if (!employeeId) return;

    try {
      const endDate = format(new Date(), "yyyy-MM-dd");
      const startDate = format(new Date(new Date().getFullYear() - 1, new Date().getMonth(), 1), "yyyy-MM-dd");
      
      const response = await getEmployeePayslips(employeeId, startDate, endDate);
      
      if (response.resCode === 200 && response.res) {
        // Transform payslip data
        const payslipHistory = availableMonths.slice(1, 6).map((month, index) => ({
          month: month.label,
          amount: 45000 + (index * 500), // Placeholder calculation
          date: month.date,
        }));
        
        setPastPayslips(payslipHistory);
      }
    } catch (error) {
      console.error("Error fetching payslip history:", error);
    }
  };

  const handleDownloadPayslip = async () => {
    try {
      const selectedDate = new Date(selectedMonth);
      const month = format(selectedDate, "yyyy-MM-dd");
      
      const response = await generateSalarySlip(employeeId, month);
      
      // Create a blob from the response and download it
      const blob = new Blob([response.res], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payslip-${format(selectedDate, "MMM-yyyy")}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading payslip:", err);
      setError("Failed to download payslip");
    }
  };

  const submitIssue = async () => {
    if (!issueText.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Please describe the issue",
        text: "Issue description is required."
      });
      return;
    }

    try {
      const issueData = {
        employeeId: employeeId,
        title: "Payroll Issue",
        description: issueText,
        category: "PAYROLL",
        priority: "MEDIUM"
      };

      await raisePayrollIssue(issueData);
      
      Swal.fire({
        icon: "success",
        title: "Issue Submitted",
        text: "Your payroll issue has been submitted successfully."
      });
      
      setShowIssueModal(false);
      setIssueText("");
    } catch (error) {
      console.error("Error submitting issue:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to submit issue. Please try again."
      });
    }
  };

  const submitAdvance = async () => {
    if (!advanceAmount || !advanceReason.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Please fill all fields",
        text: "Amount and reason are required."
      });
      return;
    }

    try {
      const advanceData = {
        employeeId: employeeId,
        amount: advanceAmount.toString(),  // Send amount as string to preserve precision
        reason: advanceReason,
        requestDate: new Date().toISOString().split('T')[0],
        numberOfInstallments: 3  // Using numberOfInstallments instead of repaymentMonths
      };

      const response = await requestSalaryAdvance(advanceData);
      
      if (response.resCode === 200) {
        Swal.fire({
          icon: "success",
          title: "Advance Requested",
          text: "Your salary advance request has been submitted successfully."
        });
        
        setShowAdvanceModal(false);
        setAdvanceAmount("");
        setAdvanceReason("");
        
        // Refresh payroll data to show updated status
        fetchPayrollData(selectedMonth);
      } else {
        throw new Error(response.resMsg || 'Failed to submit advance request');
      }
    } catch (error) {
      console.error("Error submitting advance request:", error.response?.data || error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || error.message || "Failed to submit advance request. Please try again."
      });
    }
  };

  const downloadPayslip = async (monthData) => {
    try {
      setLoading(true);
      const response = await generateSalarySlip(employeeId, monthData?.value || selectedMonth.value);
      
      if (response.resCode === 200) {
        Swal.fire({
          icon: "success",
          title: "Payslip Generated",
          text: "Your payslip has been generated successfully."
        });
      }
    } catch (error) {
      console.error("Error downloading payslip:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to download payslip. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !payrollData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-slate-600 font-medium">Loading payroll data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-red-200 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Error Loading Data</h2>
            <p className="text-red-600 text-sm">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!payrollData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">No Payroll Data</h2>
            <p className="text-slate-600 text-sm">No payroll data found for the selected month.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Payroll Summary
              </h1>
              <p className="text-slate-600 mt-1 text-sm sm:text-base">View your salary details and payment history</p>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">Employee: {userName} | ID: {employeeId}</p>
            </div>
            
            {/* Month Selector & Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedMonth.label}
                onChange={(e) => {
                  const selected = availableMonths.find(month => month.label === e.target.value);
                  setSelectedMonth(selected);
                }}
                className="px-3 sm:px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              >
                {availableMonths.map((month, index) => (
                  <option key={index} value={month.label}>{month.label}</option>
                ))}
              </select>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => setShowAdvanceModal(true)}
                  className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Request Advance
                </button>
                <button
                  onClick={() => setShowIssueModal(true)}
                  className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-200 text-sm font-medium"
                >
                  <MessageCircle className="w-4 h-4" />
                  Raise Issue
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-6 sm:space-y-8">
          {/* Current Month Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Net Salary Card */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Net Salary</p>
                  <p className="text-3xl font-bold mt-1">₹{payrollData.netSalary.toLocaleString()}</p>
                  <p className="text-green-100 text-sm mt-2">{selectedMonth.label}</p>
                </div>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Payment Status Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Payment Status</p>
                  <div className="flex items-center gap-2 mt-2">
                    <CheckCircle className={`w-5 h-5 ${payrollData.paymentStatus === 'Processed' ? 'text-green-500' : 'text-amber-500'}`} />
                    <span className="text-lg font-semibold text-slate-800">{payrollData.paymentStatus}</span>
                  </div>
                  <p className="text-slate-500 text-sm mt-1">
                    {format(new Date(payrollData.paymentDate), "dd MMM yyyy")}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  payrollData.paymentStatus === 'Processed' ? 'bg-green-100' : 'bg-amber-100'
                }`}>
                  <CheckCircle className={`w-6 h-6 ${
                    payrollData.paymentStatus === 'Processed' ? 'text-green-600' : 'text-amber-600'
                  }`} />
                </div>
              </div>
            </div>

            {/* Gross Salary Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Gross Salary</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">₹{payrollData.grossSalary.toLocaleString()}</p>
                  <p className="text-slate-500 text-sm mt-1">Before deductions</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Salary Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Earnings */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Earnings</h3>
                  <p className="text-slate-500 text-sm">Your income components</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {payrollData.earnings.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                    <span className="text-slate-700 font-medium">{item.label}</span>
                    <span className="text-green-700 font-semibold">+₹{item.amount.toLocaleString()}</span>
                  </div>
                ))}
                <div className="pt-3 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-800 font-semibold">Total Earnings</span>
                    <span className="text-green-600 font-bold text-lg">₹{payrollData.grossSalary.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Deductions</h3>
                  <p className="text-slate-500 text-sm">Your deduction components</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {payrollData.deductionsList.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                    <span className="text-slate-700 font-medium">{item.label}</span>
                    <span className="text-red-700 font-semibold">-₹{item.amount.toLocaleString()}</span>
                  </div>
                ))}
                <div className="pt-3 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-800 font-semibold">Total Deductions</span>
                    <span className="text-red-600 font-bold text-lg">₹{payrollData.deductions.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Attendance Info */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Attendance Summary</h3>
                  <p className="text-slate-500 text-sm">Working days breakdown</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-600 text-sm">Total Working Days</span>
                  <span className="text-slate-800 font-medium">{payrollData.workingDays}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-600 text-sm">Days Present</span>
                  <span className="text-slate-800 font-medium">{payrollData.paidDays}</span>
                </div>
                {payrollData.overtimeHours > 0 && (
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <span className="text-slate-600 text-sm">Overtime Hours</span>
                    <span className="text-blue-700 font-medium">{payrollData.overtimeHours}h</span>
                  </div>
                )}
                {payrollData.overtimeAmount > 0 && (
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <span className="text-slate-600 text-sm">Overtime Amount</span>
                    <span className="text-blue-700 font-medium">₹{payrollData.overtimeAmount.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bank Information */}
            {bankInfo && (
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Building className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">Bank Information</h3>
                    <p className="text-slate-500 text-sm">Payment details</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-600 text-sm">Bank Name</span>
                    <span className="text-slate-800 font-medium">{bankInfo.bankName}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-600 text-sm">Account Number</span>
                    <span className="text-slate-800 font-medium">{bankInfo.accountNumber}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-600 text-sm">IFSC Code</span>
                    <span className="text-slate-800 font-medium">{bankInfo.ifsc}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-600 text-sm">Payment Mode</span>
                    <span className="text-slate-800 font-medium">{bankInfo.paymentMode}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payslip History */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Payslip History</h3>
                  <p className="text-slate-500 text-sm">Download previous payslips</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  <div>
                    <span className="text-slate-800 font-medium">{selectedMonth.label}</span>
                    <p className="text-slate-500 text-sm">Current Month</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-indigo-700 font-semibold">₹{payrollData.netSalary.toLocaleString()}</span>
                  <button 
                    onClick={() => downloadPayslip()}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    {loading ? "Generating..." : "Download"}
                  </button>
                </div>
              </div>
              
              {pastPayslips.map((slip, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    <div>
                      <span className="text-slate-800 font-medium">{slip.month}</span>
                      <p className="text-slate-500 text-sm">{format(new Date(slip.date), "dd MMM yyyy")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-700 font-semibold">₹{slip.amount.toLocaleString()}</span>
                    <button 
                      onClick={() => downloadPayslip({ value: format(slip.date, "yyyy-MM-dd") })}
                      className="flex items-center gap-2 px-3 py-1.5 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors duration-200 text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alert Banner */}
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h4 className="font-semibold text-amber-800 mb-1">Payroll Information</h4>
                <p className="text-amber-700 text-sm">
                  All salary data is calculated based on your attendance and configured salary structure. 
                  For any discrepancies, please raise an issue using the "Raise Issue" button.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Issue Modal */}
      {showIssueModal && (
        <Modal
          title="Raise Payroll Issue"
          onClose={() => setShowIssueModal(false)}
          onSubmit={submitIssue}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Describe your issue
              </label>
              <textarea
                value={issueText}
                onChange={(e) => setIssueText(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Please describe the payroll issue you're experiencing..."
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Advance Request Modal */}
      {showAdvanceModal && (
        <Modal
          title="Request Salary Advance"
          onClose={() => setShowAdvanceModal(false)}
          onSubmit={submitAdvance}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Amount Requested
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                <input
                  type="number"
                  value={advanceAmount}
                  onChange={(e) => setAdvanceAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter amount"
                  min="1000"
                  max="50000"
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                You can request between ₹1,000 and ₹50,000
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Reason for Advance
              </label>
              <textarea
                value={advanceReason}
                onChange={(e) => setAdvanceReason(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Please provide a detailed reason for the advance request..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Repayment Period
              </label>
              <select
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                defaultValue="3"
              >
                <option value="1">1 Month</option>
                <option value="2">2 Months</option>
                <option value="3">3 Months</option>
                <option value="4">4 Months</option>
                <option value="6">6 Months</option>
              </select>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Important Note</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Maximum advance amount is limited to 50% of your basic salary</li>
                <li>• Repayment will be deducted from your monthly salary</li>
                <li>• Approval is subject to company policy and your eligibility</li>
              </ul>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Modal Component
const Modal = ({ title, children, onClose, onSubmit }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      {children}
      
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <button
          onClick={onSubmit}
          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 sm:py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium text-sm sm:text-base"
        >
          Submit
        </button>
        <button
          onClick={onClose}
          className="px-4 sm:px-6 py-2.5 sm:py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors duration-200 font-medium text-sm sm:text-base"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);

