import React, { useState, useEffect, useMemo } from "react";
import { 
  Calendar,
  Users,
  MapPin,
  Clock,
  Filter,
  Download,
  CheckCircle2,
  AlertCircle,
  Building2,
  Target,
  Layers,
  Search,
  ChevronDown,
  Save,
  Settings,
  BarChart3,
  TrendingUp,
  UserCheck,
  Building,
  X,
  Loader
} from "lucide-react";
import { toast } from "sonner";
import {
  planShifts,
  getShiftPlans,
  getAvailableEmployees,
  getTeamShiftStatistics,
  generateTeamBasedShiftPlan,
  swapShift,
  fetchTeamsByCompany,
  fetchDepartments
} from "../API/apiService";

// Enhanced Shift Planning Component with Multi-Employer & Team Support
export default function ShiftPlanEnhanced() {
  // Core states
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  const [shiftPlans, setShiftPlans] = useState([]);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [teams, setTeams] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [statistics, setStatistics] = useState({});
  
  // Filter states
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('calendar'); // calendar, list, kanban
  
  // User context
  const [userType, setUserType] = useState(localStorage.getItem('userType'));
  const [employerId, setEmployerId] = useState(localStorage.getItem('employerId'));
  const [companyId, setCompanyId] = useState(localStorage.getItem('companyId'));

  // Shift templates
  const shiftTemplates = [
    { id: "morning", name: "Morning Shift", startTime: "06:00", endTime: "14:00", color: "bg-blue-500" },
    { id: "evening", name: "Evening Shift", startTime: "14:00", endTime: "22:00", color: "bg-purple-500" },
    { id: "night", name: "Night Shift", startTime: "22:00", endTime: "06:00", color: "bg-indigo-500" }
  ];

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Load teams if employer
      if (userType === 'EMPLOYER' && companyId) {
        const teamsData = await fetchTeamsByCompany(companyId);
        setTeams(teamsData.res || []);
      }

      // Load departments
      const token = localStorage.getItem('token');
      const deptData = await fetchDepartments();
      setDepartments(deptData.res || []);

      // Load existing shift plans
      await loadShiftPlans();
    } catch (error) {
      console.error("Error loading initial data:", error);
      toast.error("Failed to load initial data");
    } finally {
      setLoading(false);
    }
  };

  const loadShiftPlans = async () => {
    try {
      const params = {
        date: startDate.toISOString().split('T')[0],
        ...(selectedTeam !== 'all' && { teamId: selectedTeam }),
        ...(selectedLocation !== 'all' && { locationId: selectedLocation }),
        ...(userType === 'EMPLOYER' && employerId && { employerId })
      };

      const response = await getShiftPlans(params);
      if (response.resCode === 200) {
        setShiftPlans(response.res || []);
      }
    } catch (error) {
      console.error("Error loading shift plans:", error);
    }
  };

  const loadAvailableEmployees = async (date, shiftTemplateId) => {
    try {
      const params = {
        date: date.toISOString().split('T')[0],
        shiftTemplateId,
        ...(selectedTeam !== 'all' && { teamId: selectedTeam }),
        ...(userType === 'EMPLOYER' && employerId && { employerId })
      };

      const response = await getAvailableEmployees(params);
      if (response.resCode === 200) {
        setAvailableEmployees(response.res || []);
      }
    } catch (error) {
      console.error("Error loading available employees:", error);
    }
  };

  const loadTeamStatistics = async (teamId) => {
    try {
      const response = await getTeamShiftStatistics(
        teamId,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      if (response.resCode === 200) {
        setStatistics(response.res || {});
      }
    } catch (error) {
      console.error("Error loading team statistics:", error);
    }
  };

  // Generate shift plan
  const generateShiftPlan = async () => {
    setLoading(true);
    try {
      const requestData = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        ...(selectedTeam !== 'all' && { teamId: selectedTeam }),
        useTeamBalancing: true,
        shiftDetails: {
          "Morning Shift": {
            name: "Morning Shift",
            startTime: "06:00",
            endTime: "14:00"
          },
          "Evening Shift": {
            name: "Evening Shift", 
            startTime: "14:00",
            endTime: "22:00"
          },
          "Night Shift": {
            name: "Night Shift",
            startTime: "22:00",
            endTime: "06:00"
          }
        },
        locationDetails: [
          {
            name: selectedLocation !== 'all' ? selectedLocation : "Main Location",
            shifts: [
              {
                shift: "Morning Shift",
                personsRequired: 10,
                femaleRequired: 3,
                supervisorRequired: true,
                workingDays: "Mon-Fri",
                customDays: []
              },
              {
                shift: "Evening Shift",
                personsRequired: 8,
                femaleRequired: 2,
                supervisorRequired: true,
                workingDays: "Mon-Fri",
                customDays: []
              }
            ]
          }
        ]
      };

      const response = selectedTeam !== 'all' 
        ? await generateTeamBasedShiftPlan(requestData)
        : await planShifts(requestData);

      if (response.resCode === 200) {
        toast.success("Shift plan generated successfully!");
        await loadShiftPlans();
      } else {
        toast.error(response.resMsg || "Failed to generate shift plan");
      }
    } catch (error) {
      console.error("Error generating shift plan:", error);
      toast.error("Failed to generate shift plan");
    } finally {
      setLoading(false);
    }
  };

  // Render calendar view
  const renderCalendarView = () => {
    const dates = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return (
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-xl font-bold text-slate-800 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Shift Calendar View
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-4 text-left text-sm font-semibold text-slate-700">Date</th>
                {shiftTemplates.map(shift => (
                  <th key={shift.id} className="p-4 text-left text-sm font-semibold text-slate-700">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${shift.color} mr-2`}></div>
                      {shift.name}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dates.map((date, index) => (
                <tr key={index} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="p-4">
                    <div className="text-sm font-medium text-slate-800">
                      {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                  </td>
                  {shiftTemplates.map(shift => (
                    <td key={shift.id} className="p-4">
                      <ShiftCell 
                        date={date} 
                        shift={shift}
                        onLoadEmployees={() => loadAvailableEmployees(date, shift.id)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Shift cell component
  const ShiftCell = ({ date, shift, onLoadEmployees }) => {
    const [showEmployees, setShowEmployees] = useState(false);
    const assignments = shiftPlans.filter(plan => 
      plan.date === date.toISOString().split('T')[0] &&
      plan.assignments?.some(a => a.shiftTemplateId === shift.id)
    );

    const assignedCount = assignments.reduce((sum, plan) => 
      sum + plan.assignments.filter(a => a.shiftTemplateId === shift.id).length, 0
    );

    return (
      <div className="relative">
        <button
          onClick={() => {
            setShowEmployees(!showEmployees);
            if (!showEmployees) onLoadEmployees();
          }}
          className="w-full p-3 rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">
              {assignedCount} assigned
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showEmployees ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {showEmployees && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-slate-200 z-10 p-4">
            <h4 className="font-semibold text-sm text-slate-800 mb-3">Available Employees</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availableEmployees.map(emp => (
                <div key={emp.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {emp.name.charAt(0)}
                    </div>
                    <span className="ml-2 text-sm text-slate-700">{emp.name}</span>
                  </div>
                  <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                    Assign
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render statistics dashboard
  const renderStatistics = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Shifts"
        value={statistics.totalShiftsAssigned || 0}
        icon={<Calendar className="w-5 h-5" />}
        color="blue"
      />
      <StatCard
        title="Hours Worked"
        value={statistics.totalHoursWorked || 0}
        icon={<Clock className="w-5 h-5" />}
        color="purple"
      />
      <StatCard
        title="Team Utilization"
        value={`${Math.round((statistics.averageShiftsPerEmployee || 0) * 10)}%`}
        icon={<TrendingUp className="w-5 h-5" />}
        color="emerald"
      />
      <StatCard
        title="Team Size"
        value={statistics.teamSize || 0}
        icon={<Users className="w-5 h-5" />}
        color="amber"
      />
    </div>
  );

  const StatCard = ({ title, value, icon, color }) => {
    const colorClasses = {
      blue: "from-blue-500 to-blue-600",
      purple: "from-purple-500 to-purple-600",
      emerald: "from-emerald-500 to-emerald-600",
      amber: "from-amber-500 to-amber-600"
    };

    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 bg-gradient-to-r ${colorClasses[color]} rounded-xl text-white`}>
            {icon}
          </div>
          <BarChart3 className="w-5 h-5 text-slate-400" />
        </div>
        <h4 className="text-2xl font-bold text-slate-800">{value}</h4>
        <p className="text-sm text-slate-600 mt-1">{title}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Advanced Shift Planning
          </h1>
          <p className="text-slate-600">
            Manage shifts across teams and locations with intelligent auto-assignment
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Team Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Team
              </label>
              <select
                value={selectedTeam}
                onChange={(e) => {
                  setSelectedTeam(e.target.value);
                  if (e.target.value !== 'all') {
                    loadTeamStatistics(e.target.value);
                  }
                }}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Teams</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>

            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Department
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate.toISOString().split('T')[0]}
                onChange={(e) => setStartDate(new Date(e.target.value))}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate.toISOString().split('T')[0]}
                onChange={(e) => setEndDate(new Date(e.target.value))}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-between items-center mt-6">
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode === 'calendar' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Calendar View
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                List View
              </button>
            </div>

            <button
              onClick={generateShiftPlan}
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all flex items-center"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Settings className="w-4 h-4 mr-2" />
                  Generate Shift Plan
                </>
              )}
            </button>
          </div>
        </div>

        {/* Statistics */}
        {selectedTeam !== 'all' && renderStatistics()}

        {/* Main Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : (
          renderCalendarView()
        )}
      </div>
    </div>
  );
} 