import React, { useState, useEffect } from 'react';
import { getEmployerPayrollIssues, resolvePayrollIssue } from '../../API/apiService';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const PayrollIssueList = ({ employerId }) => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [resolution, setResolution] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchIssues();
  }, [employerId]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const response = await getEmployerPayrollIssues(employerId);
      if (response.resCode === 200 && response.res) {
        setIssues(response.res);
      }
    } catch (error) {
      console.error('Error fetching payroll issues:', error);
      toast.error('Failed to fetch payroll issues');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedIssue || !resolution.trim()) {
      toast.warning('Please provide a resolution');
      return;
    }

    try {
      const response = await resolvePayrollIssue(selectedIssue.id, resolution);
      if (response.resCode === 200) {
        toast.success('Issue resolved successfully');
        setSelectedIssue(null);
        setResolution('');
        fetchIssues();
      }
    } catch (error) {
      console.error('Error resolving issue:', error);
      toast.error('Failed to resolve issue');
    }
  };

  const filteredIssues = issues.filter(issue => {
    if (filter === 'ALL') return true;
    return issue.status === filter;
  });

  const getStatusColor = (status) => {
    const colors = {
      OPEN: 'bg-yellow-100 text-yellow-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      RESOLVED: 'bg-green-100 text-green-800',
      CLOSED: 'bg-slate-100 text-slate-800'
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      HIGH: 'text-red-600',
      MEDIUM: 'text-orange-600',
      LOW: 'text-green-600'
    };
    return colors[priority] || 'text-slate-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-800">Payroll Issues</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="ALL">All Issues</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      <div className="grid gap-4">
        {filteredIssues.map(issue => (
          <div
            key={issue.id}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">{issue.title}</h3>
                <p className="text-sm text-slate-500">
                  Raised by {issue.employeeId} on {format(new Date(issue.createdAt), 'MMM d, yyyy')}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor(issue.status)}`}>
                {issue.status}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-slate-600">{issue.description}</p>
              </div>

              <div className="flex gap-4 text-sm">
                <span className="text-slate-500">
                  Category: <span className="font-medium">{issue.category}</span>
                </span>
                <span className="text-slate-500">
                  Priority: <span className={`font-medium ${getPriorityColor(issue.priority)}`}>{issue.priority}</span>
                </span>
              </div>

              {issue.status === 'OPEN' && (
                <div className="pt-4 border-t border-slate-200">
                  <button
                    onClick={() => setSelectedIssue(issue)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
                  >
                    Resolve Issue
                  </button>
                </div>
              )}

              {issue.resolution && (
                <div className="pt-4 border-t border-slate-200">
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Resolution</h4>
                  <p className="text-slate-600 text-sm">{issue.resolution}</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredIssues.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No payroll issues found
          </div>
        )}
      </div>

      {/* Resolution Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-slate-800">Resolve Issue</h2>
              <button
                onClick={() => {
                  setSelectedIssue(null);
                  setResolution('');
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Resolution
                </label>
                <textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Provide resolution details..."
                  required
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedIssue(null);
                    setResolution('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResolve}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
                >
                  Submit Resolution
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollIssueList; 