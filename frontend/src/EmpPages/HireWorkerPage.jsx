import React, { useState, useEffect } from "react";
import { sendAffiliationRequest, fetchDepartmentDetails, fetchTeamsByCompany, fetchUserProfile } from "../API/apiService";
import { 
  UserPlus, 
  Users, 
  Briefcase, 
  Building2, 
  Plus, 
  Trash2, 
  Send, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Building,
  UserCheck
} from "lucide-react";

export default function HireWorkerPage() {
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [workers, setWorkers] = useState([{ 
    employeeId: "", 
    department: "", 
    team: "", 
    position: "" 
  }]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const deptRes = await fetchDepartmentDetails();
        const companyId = localStorage.getItem('userId');
        const teamRes = await fetchTeamsByCompany(companyId);

        const token = localStorage.getItem("token");
        const employeeRes = await fetchUserProfile(token);
        
        const employeeData = employeeRes?.res ? [employeeRes.res] : [];
        
        setDepartments(deptRes);
        setTeams(teamRes);
        setEmployees(employeeData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleChange = (index, field, value) => {
    const updated = [...workers];
    updated[index][field] = value;

    if (field === "department") {
      updated[index].team = "";
      updated[index].position = "";
    }
    if (field === "team") {
      updated[index].position = "";
    }

    setWorkers(updated);
  };

  const handleAddRow = () => {
    setWorkers([
      ...workers,
      { employeeId: "", department: "", team: "", position: "" },
    ]);
  };

  const handleRemoveRow = (index) => {
    if (workers.length > 1) {
      const updated = workers.filter((_, i) => i !== index);
      setWorkers(updated);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    
    try {
      const responses = await Promise.all(
        workers.map(async (worker) => {
          const payload = {
            id: "",
            employeeId: worker.employeeId,
            department: worker.department,
            team: worker.team,
            position: worker.position,
            status: "pending",
          };

          return await sendAffiliationRequest(payload);
        })
      );

      console.log("Affiliation submitted for all workers", responses);
      setSuccess(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        setWorkers([{ employeeId: "", department: "", team: "", position: "" }]);
        setSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error(error);
      setError("Failed to send affiliation requests. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = () => {
    return workers.every(worker => 
      worker.employeeId && 
      worker.department && 
      worker.team && 
      worker.position
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading departments and teams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Hire New Workers
              </h1>
              <p className="text-slate-600 font-medium">
                Send affiliation requests to expand your workforce
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Departments</p>
                <p className="text-2xl font-bold text-slate-800">{departments.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Teams</p>
                <p className="text-2xl font-bold text-slate-800">{teams.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <UserCheck className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Requests to Send</p>
                <p className="text-2xl font-bold text-slate-800">{workers.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-green-800 font-semibold">Success!</p>
              <p className="text-green-700 text-sm">Affiliation requests sent successfully to all workers.</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-semibold">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Worker Details</h3>
              <button
                onClick={handleAddRow}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span>Add Worker</span>
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {workers.map((worker, index) => {
                const selectedDept = departments.find((d) => d.name === worker.department);
                const departmentTeams = teams.filter((t) => t.departmentId === selectedDept?.id);

                return (
                  <div key={index} className="relative p-6 bg-slate-50 rounded-xl border border-slate-200">
                    {/* Remove button for multiple workers */}
                    {workers.length > 1 && (
                      <button
                        onClick={() => handleRemoveRow(index)}
                        className="absolute top-4 right-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <div className="mb-4">
                      <h4 className="text-lg font-semibold text-slate-800 mb-2">
                        Worker #{index + 1}
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {/* Employee ID */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700">
                          Employee ID <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <UserCheck className="h-5 w-5 text-slate-400" />
                          </div>
                          <input
                            type="text"
                            placeholder="e.g., EMP123"
                            className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 bg-white text-slate-900 rounded-xl focus:outline-none focus:border-blue-500 transition-all duration-200 font-medium"
                            value={worker.employeeId}
                            onChange={(e) => handleChange(index, "employeeId", e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Department */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700">
                          Department <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Building className="h-5 w-5 text-slate-400" />
                          </div>
                          <select
                            className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 bg-white text-slate-900 rounded-xl focus:outline-none focus:border-blue-500 transition-all duration-200 font-medium appearance-none"
                            value={worker.department}
                            onChange={(e) => handleChange(index, "department", e.target.value)}
                          >
                            <option value="">Select Department</option>
                            {departments.map((dept, idx) => (
                              <option key={idx} value={dept.name}>
                                {dept.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Team */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700">
                          Team <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Users className="h-5 w-5 text-slate-400" />
                          </div>
                          <select
                            className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 bg-white text-slate-900 rounded-xl focus:outline-none focus:border-blue-500 transition-all duration-200 font-medium appearance-none disabled:bg-slate-100 disabled:text-slate-500"
                            value={worker.team}
                            onChange={(e) => handleChange(index, "team", e.target.value)}
                            disabled={!worker.department}
                          >
                            <option value="">Select Team</option>
                            {departmentTeams.map((team, idx) => (
                              <option key={idx} value={team.teamName}>
                                {team.teamName}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Position */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700">
                          Position <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Briefcase className="h-5 w-5 text-slate-400" />
                          </div>
                          <input
                            type="text"
                            placeholder="e.g., Software Engineer"
                            className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 bg-white text-slate-900 rounded-xl focus:outline-none focus:border-blue-500 transition-all duration-200 font-medium disabled:bg-slate-100 disabled:text-slate-500"
                            value={worker.position}
                            onChange={(e) => handleChange(index, "position", e.target.value)}
                            disabled={!worker.team}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Submit Section */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 p-6 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200">
              <div className="text-center sm:text-left">
                <p className="text-slate-800 font-semibold">
                  Ready to send {workers.length} affiliation request{workers.length > 1 ? 's' : ''}?
                </p>
                <p className="text-slate-600 text-sm">
                  Workers will receive invitation notifications to join your company.
                </p>
              </div>
              
              <button
                onClick={handleSubmit}
                disabled={!isFormValid() || submitting}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Send Requests</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Helper Information */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">How it works</h4>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Enter the employee ID of the worker you want to hire</li>
                <li>• Select the appropriate department and team</li>
                <li>• Specify their position within the team</li>
                <li>• Send the affiliation request - they'll receive a notification</li>
                <li>• Once accepted, they'll join your company structure</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}