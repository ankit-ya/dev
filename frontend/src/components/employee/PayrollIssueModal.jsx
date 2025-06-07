import React, { useState } from 'react';
import { createPayrollIssue } from '../../API/apiService';
import { toast } from 'react-toastify';

const PayrollIssueModal = ({ isOpen, onClose, employeeId, payrollMonth }) => {
  const [issueData, setIssueData] = useState({
    title: '',
    description: '',
    category: 'SALARY',
    priority: 'MEDIUM'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await createPayrollIssue({
        ...issueData,
        employeeId,
        payrollMonth,
        raisedBy: employeeId // Since employee is raising the issue
      });

      if (response.resCode === 200) {
        toast.success('Payroll issue raised successfully');
        onClose();
      } else {
        throw new Error(response.resMsg || 'Failed to raise payroll issue');
      }
    } catch (error) {
      console.error('Error raising payroll issue:', error);
      toast.error(error.message || 'Failed to raise payroll issue');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-800">Raise Payroll Issue</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Issue Title
            </label>
            <input
              type="text"
              value={issueData.title}
              onChange={(e) => setIssueData({ ...issueData, title: e.target.value })}
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter issue title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Category
            </label>
            <select
              value={issueData.category}
              onChange={(e) => setIssueData({ ...issueData, category: e.target.value })}
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="SALARY">Salary</option>
              <option value="DEDUCTION">Deduction</option>
              <option value="BONUS">Bonus</option>
              <option value="ADVANCE">Advance</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Priority
            </label>
            <select
              value={issueData.priority}
              onChange={(e) => setIssueData({ ...issueData, priority: e.target.value })}
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>
            <textarea
              value={issueData.description}
              onChange={(e) => setIssueData({ ...issueData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Please describe your issue in detail..."
              required
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
            >
              Submit Issue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PayrollIssueModal; 