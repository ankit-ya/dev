import React, { useState, useEffect } from 'react';
import { requestSalaryAdvance, getEmployeePayslips, raisePayrollIssue, getAdvanceRequests, getEmployeePayrollIssues } from '../../services/api';
import { toast } from 'react-toastify';
import { DollarSign, Clock, AlertTriangle, FileText, MessageCircle } from 'lucide-react';
import PayrollIssueModal from './PayrollIssueModal';

const PayrollDashboard = () => {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [advanceRequests, setAdvanceRequests] = useState([]);
  const [advanceRequest, setAdvanceRequest] = useState({
    amount: '',
    reason: '',
    repaymentMonths: 1
  });
  const [payrollIssue, setPayrollIssue] = useState({
    title: '',
    description: '',
    category: 'SALARY'
  });
  const [issues, setIssues] = useState([]);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);

  const employeeId = localStorage.getItem('userId');

  useEffect(() => {
    fetchPayslips();
    fetchAdvanceRequests();
    fetchIssues();
  }, []);

  const fetchPayslips = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const response = await getEmployeePayslips(
        employeeId,
        sixMonthsAgo.toISOString().split('T')[0],
        today.toISOString().split('T')[0]
      );
      setPayslips(response);
    } catch (error) {
      toast.error('Failed to fetch payslips');
      console.error('Error fetching payslips:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdvanceRequests = async () => {
    try {
      const response = await getAdvanceRequests(employeeId);
      if (response.resCode === 200 && response.res) {
        setAdvanceRequests(response.res);
      }
    } catch (error) {
      console.error('Error fetching advance requests:', error);
    }
  };

  const fetchIssues = async () => {
    try {
      const response = await getEmployeePayrollIssues(employeeId);
      if (response.resCode === 200 && response.res) {
        setIssues(response.res);
      }
    } catch (error) {
      console.error('Error fetching payroll issues:', error);
    }
  };

  const handleAdvanceRequest = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await requestSalaryAdvance({
        ...advanceRequest,
        employeeId,
        requestDate: new Date().toISOString().split('T')[0]
      });
      toast.success('Salary advance request submitted successfully');
      setAdvanceRequest({ amount: '', reason: '', repaymentMonths: 1 });
      fetchAdvanceRequests(); // Refresh the list
    } catch (error) {
      toast.error('Failed to submit salary advance request');
      console.error('Error submitting advance request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayrollIssue = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await raisePayrollIssue({
        ...payrollIssue,
        employeeId
      });
      toast.success('Payroll issue raised successfully');
      setPayrollIssue({ title: '', description: '', category: 'SALARY' });
    } catch (error) {
      toast.error('Failed to raise payroll issue');
      console.error('Error raising payroll issue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRaiseIssue = (month) => {
    setSelectedMonth(month);
    setShowIssueModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      OPEN: 'bg-yellow-100 text-yellow-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      RESOLVED: 'bg-green-100 text-green-800',
      CLOSED: 'bg-slate-100 text-slate-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Salary Advance Request Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-800">Request Salary Advance</h2>
              <p className="text-slate-600 text-sm">Submit your advance salary request</p>
            </div>
          </div>

          <form onSubmit={handleAdvanceRequest} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                <input
                  type="number"
                  value={advanceRequest.amount}
                  onChange={(e) => setAdvanceRequest({...advanceRequest, amount: e.target.value})}
                  className="w-full pl-8 pr-4 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
                  placeholder="Enter amount"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Reason</label>
              <textarea
                value={advanceRequest.reason}
                onChange={(e) => setAdvanceRequest({...advanceRequest, reason: e.target.value})}
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
                rows={3}
                placeholder="Explain the reason for advance request"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Repayment Period</label>
              <select
                value={advanceRequest.repaymentMonths}
                onChange={(e) => setAdvanceRequest({...advanceRequest, repaymentMonths: parseInt(e.target.value)})}
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
              >
                {[1, 2, 3, 4, 5, 6].map(month => (
                  <option key={month} value={month}>{month} month{month > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>

        {/* Recent Advance Requests */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-800">Recent Advance Requests</h2>
              <p className="text-slate-600 text-sm">Track your advance request status</p>
            </div>
          </div>

          <div className="space-y-4">
            {advanceRequests.length > 0 ? (
              advanceRequests.map((request) => (
                <div key={request.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                      <p className="mt-2 text-lg font-semibold text-slate-800">₹{request.amount.toLocaleString()}</p>
                    </div>
                    <p className="text-sm text-slate-500">
                      {new Date(request.requestDate).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-sm text-slate-600">{request.reason}</p>
                  <p className="text-xs text-slate-500 mt-2">Repayment: {request.repaymentMonths} months</p>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-500">
                No advance requests found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payroll Issue Form */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Raise Payroll Issue</h2>
            <p className="text-slate-600 text-sm">Report any payroll related concerns</p>
          </div>
        </div>

        <form onSubmit={handlePayrollIssue} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
            <input
              type="text"
              value={payrollIssue.title}
              onChange={(e) => setPayrollIssue({...payrollIssue, title: e.target.value})}
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea
              value={payrollIssue.description}
              onChange={(e) => setPayrollIssue({...payrollIssue, description: e.target.value})}
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
              rows={3}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
            <select
              value={payrollIssue.category}
              onChange={(e) => setPayrollIssue({...payrollIssue, category: e.target.value})}
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
            >
              <option value="SALARY">Salary</option>
              <option value="DEDUCTION">Deduction</option>
              <option value="TAX">Tax</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-2 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Issue'}
          </button>
        </form>
      </div>

      {/* Recent Payslips */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
            <FileText className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Recent Payslips</h2>
            <p className="text-slate-600 text-sm">View and download your payslips</p>
          </div>
        </div>

        <div className="space-y-4">
          {payslips.map((payslip, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-blue-500 transition-colors"
            >
              <div>
                <h3 className="font-medium text-slate-800">{payslip.month}</h3>
                <p className="text-sm text-slate-500">Net Pay: ₹{payslip.netPay}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleRaiseIssue(payslip.month)}
                  className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                  title="Raise Issue"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
                <button
                  onClick={() => window.open(payslip.downloadUrl, '_blank')}
                  className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                  title="Download"
                >
                  <FileText className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}

          {payslips.length === 0 && !loading && (
            <div className="text-center py-8 text-slate-500">
              No payslips found
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
      </div>

      {/* Issues Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Payroll Issues</h2>
            <p className="text-slate-600 text-sm">Track your raised issues</p>
          </div>
        </div>

        <div className="space-y-4">
          {issues.map((issue) => (
            <div
              key={issue.id}
              className="p-4 border border-slate-200 rounded-xl"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-slate-800">{issue.title}</h3>
                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(issue.status)}`}>
                  {issue.status}
                </span>
              </div>
              <p className="text-sm text-slate-600 mb-2">{issue.description}</p>
              <div className="flex gap-4 text-xs text-slate-500">
                <span>Category: {issue.category}</span>
                <span>Priority: {issue.priority}</span>
              </div>
              {issue.resolution && (
                <div className="mt-2 pt-2 border-t border-slate-100">
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Resolution:</span> {issue.resolution}
                  </p>
                </div>
              )}
            </div>
          ))}

          {issues.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No issues raised
            </div>
          )}
        </div>
      </div>

      {/* Payroll Issue Modal */}
      <PayrollIssueModal
        isOpen={showIssueModal}
        onClose={() => {
          setShowIssueModal(false);
          setSelectedMonth(null);
        }}
        employeeId={employeeId}
        payrollMonth={selectedMonth}
      />
    </div>
  );
};

export default PayrollDashboard; 