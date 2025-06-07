import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Building2, 
  Users, 
  Crown, 
  CheckCircle, 
  XCircle,
  Search,
  Filter,
  Grid3X3,
  List,
  Save,
  X,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { getAllDepartments, createDepartment } from '../API/apiService';
import { useMediaQuery } from '@mui/material';

const DepartmentCard = ({ department, onDepartmentClick }) => {
  const dept = {
    name: 'N/A',
    status: 'Active',
    id: 'N/A',
    teamCount: 0,
    employeeName: 'N/A',
    ...department,
    headOfDepartment: department.headOfDepartment || {
      firstName: department.employeeName || 'N/A'
    }
  };

  return (
    <div 
      className="group relative bg-white rounded-2xl border-2 border-slate-200 hover:border-blue-400 p-6 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
      onClick={() => onDepartmentClick(dept.id)}
    >
      {/* Status Badge */}
      <div className="absolute top-4 right-4">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
          dept.status === 'Active' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {dept.status === 'Active' ? (
            <CheckCircle className="w-3 h-3 mr-1" />
          ) : (
            <XCircle className="w-3 h-3 mr-1" />
          )}
          {dept.status}
        </span>
      </div>

      {/* Department Icon */}
      <div className="mb-4">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
          <Building2 className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Department Info */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
          {dept.name}
        </h3>
        <p className="text-sm text-slate-500 font-medium">ID: {dept.id}</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <Crown className="w-4 h-4 text-amber-600 mr-1" />
          </div>
          <p className="text-xs text-slate-600 mb-1">Department Head</p>
          <p className="font-semibold text-slate-800 truncate">{dept.headOfDepartment.firstName}</p>
        </div>
        <div className="text-center p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <Users className="w-4 h-4 text-blue-600 mr-1" />
          </div>
          <p className="text-xs text-slate-600 mb-1">Teams</p>
          <p className="font-semibold text-slate-800">{dept.teamCount}</p>
        </div>
      </div>

      {/* Action Indicator */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500 font-medium">View Teams</span>
        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  );
};

const DepartmentRow = ({ department, onDepartmentClick }) => {
  const dept = {
    name: 'N/A',
    status: 'Active',
    id: 'N/A',
    teamCount: 0,
    employeeName: 'N/A',
    ...department,
    headOfDepartment: department.headOfDepartment || {
      firstName: department.employeeName || 'N/A'
    }
  };

  return (
    <tr 
      key={dept.id} 
      className="group border-b border-slate-100 hover:bg-blue-50 cursor-pointer transition-colors"
      onClick={() => onDepartmentClick(dept.id)}
    >
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-medium text-slate-800">{dept.id}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
          {dept.name}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <Crown className="w-4 h-4 text-amber-600" />
          <span className="text-slate-700">{dept.headOfDepartment.firstName}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
          dept.status === 'Active' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {dept.status === 'Active' ? (
            <CheckCircle className="w-3 h-3 mr-1" />
          ) : (
            <XCircle className="w-3 h-3 mr-1" />
          )}
          {dept.status}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end space-x-2">
          <Users className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-slate-800">{dept.teamCount}</span>
        </div>
      </td>
    </tr>
  );
};

export default function DepartmentPage({ onDepartmentClick }) {
  const [departments, setDepartments] = useState([]);
  const [deptName, setDeptName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const isMobile = useMediaQuery('(max-width:768px)');
  const token = localStorage.getItem('token');

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const data = await getAllDepartments(token);
      setDepartments(data);
    } catch (error) {
      console.error('Failed to load departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDepartment = async () => {
    if (!deptName.trim()) return;

    try {
      const newDept = { name: deptName };
      await createDepartment(newDept, token);
      setDeptName('');
      setIsCreating(false);
      fetchDepartments(); // Refresh list
    } catch (error) {
      console.error('Create error:', error);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Filter departments based on search and status
  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = dept.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || dept.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading departments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Department Overview</h2>
          <p className="text-slate-600">Manage and organize your company departments</p>
        </div>
        
        <button 
          onClick={() => setIsCreating(!isCreating)} 
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Add Department</span>
        </button>
      </div>

      {/* Create Department Form */}
      {isCreating && (
        <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Create New Department</h3>
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                placeholder="Enter department name..."
                className="w-full px-4 py-3 border-2 border-slate-200 bg-white text-slate-900 rounded-xl focus:outline-none focus:border-blue-500 transition-all duration-200 font-medium"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateDepartment()}
              />
            </div>
            <button
              onClick={handleCreateDepartment}
              disabled={!deptName.trim()}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setDeptName('');
              }}
              className="flex items-center space-x-2 px-4 py-3 bg-slate-500 hover:bg-slate-600 text-white font-semibold rounded-xl transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-slate-200 bg-white rounded-lg focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border-2 border-slate-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          {!isMobile && (
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Department Count */}
      <div className="mb-6">
        <p className="text-sm text-slate-600">
          Showing <span className="font-semibold text-slate-800">{filteredDepartments.length}</span> of{' '}
          <span className="font-semibold text-slate-800">{departments.length}</span> departments
        </p>
      </div>

      {/* Department List/Grid */}
      {filteredDepartments.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-lg font-medium">No departments found</p>
          <p className="text-slate-400 text-sm">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Create your first department to get started'
            }
          </p>
        </div>
      ) : (
        <>
          {(isMobile || viewMode === 'grid') ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDepartments.map((dept) => (
                <DepartmentCard key={dept.id} department={dept} onDepartmentClick={onDepartmentClick} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Department ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Head</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Teams</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDepartments.map((dept) => (
                    <DepartmentRow key={dept.id} department={dept} onDepartmentClick={onDepartmentClick} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
