import React from "react";
import DepartmentPage from "./DepartmentPage";
import { useNavigate } from "react-router-dom";
import { Users, Building2, ArrowRight } from "lucide-react";

export default function ManageDepartmentAndTeamPage() {
  const navigate = useNavigate();

  const handleDepartmentClick = (departmentId) => {
    navigate(`/employer-dashboard/teams/${departmentId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Manage Departments & Teams
              </h1>
              <p className="text-slate-600 font-medium">
                Organize your workforce structure and manage team hierarchies
              </p>
            </div>
          </div>
          
          {/* Navigation Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <span className="font-medium">Dashboard</span>
            <ArrowRight className="w-4 h-4" />
            <span className="text-slate-800 font-semibold">Departments</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <DepartmentPage onDepartmentClick={handleDepartmentClick} />
        </div>
      </div>
    </div>
  );
}