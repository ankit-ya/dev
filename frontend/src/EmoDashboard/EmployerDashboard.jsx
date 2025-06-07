import React, { useState, useEffect, useMemo } from "react";
import { Routes, Route, NavLink, useNavigate, useLocation } from "react-router-dom";
import { IconButton, Menu, MenuItem, useMediaQuery, useTheme } from "@mui/material";
import { Menu as MenuIcon, Close as CloseIcon, AccountCircle, Notifications } from "@mui/icons-material";
import {
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Calendar,
  CheckCircle,
  LayoutDashboard,
  Clock as ClockIcon,
  CalendarDays,
  ClipboardList,
  Users,
  Briefcase,
  BarChart3,
  MapPin,
  UserCog,
  CalendarCheck2,
  Network,
  FileBarChart,
  BadgePercent,
  FileText,
  UserPlus,
  Settings,
  Monitor,
  Shield,
  Crown,
  Building2,
  Target,
  Zap
} from "lucide-react";

import logo from "/logo.svg";
import SHRAMII from "/SHRAMII.png";
import PopupWindow from "../components/Onboarding/PopupWindow";
import { getEmployerProfile } from "../API/apiService";

// Import pages
import ManageTeams from "../EmpPages/ManageTeamsPage";
import TeamPage from  "../EmpPages/TeamsPage";
import PositionsPage from  "../EmpPages/PositionsPage";
import HireWorkerPage from "../EmpPages/HireWorkerPage";
import AffilateStatus from "../EmpPages/AffilateStatus";
import EmpProfile from "./EmpProfile";
import CreateProfile from "./CreateProfile";
import TaskDashboard from "./TaskDashboard";
import OrgChart from "./OrgChart";
import CalenderTeam from "./CalenderTeam";
import ShiftPlan from "./ShiftPlan";
import ShiftPlanning from "./ShiftPlanning";
import PayrollPage from "./PayrollPage";
import LiveSiteMonitoringPage from "./LiveSiteMonitoringPage";
import LeaveApprovalPage from './LeaveApprovalPage';
import SubscriptionPage from "./SubscriptionPage";
import NotificationStats from "./NotificationStats";
import ShiftPlanEnhanced from "./ShiftPlanEnhanced";
import AffiliatedEmployees from './AffiliatedEmployees';
import WorkScheduleManager from './WorkScheduleManager';
import PublicHolidayCalendar from './PublicHolidayCalendar';

// Dummy Data
const dashboardData = {
  totalWorkingToday: 128,
  totalEmployees: 150,
  sites: [
    { id: 1, site: "DLF Cyber City", team: "Alpha", workers: 25, status: "online" },
    { id: 2, site: "Infosys SEZ", team: "Bravo", workers: 18, status: "offline" },
    { id: 3, site: "Huda Metro", team: "Charlie", workers: 14, status: "online" },
    { id: 4, site: "Ambience Mall", team: "Delta", workers: 20, status: "online" },
  ],
  upcomingLeaves: [
    { id: 1, name: "Alice Johnson", date: "2025-04-22" },
    { id: 2, name: "Bob Smith", date: "2025-04-23" },
  ],
};

// Move sidebarRoutes outside the component and memoize it
const sidebarRoutes = [
  {
    category: "Overview",
    routes: [
      { path: "", label: "Dashboard", icon: LayoutDashboard, gradient: "from-blue-500 to-blue-600" },
    ]
  },
  {
    category: "Team Management",
    routes: [
      { path: "ManageTeams", label: "Manage Teams", icon: Users, gradient: "from-emerald-500 to-emerald-600" },
      { path: "HireWorkerPage", label: "Onboarding", icon: UserPlus, gradient: "from-purple-500 to-purple-600" },
      { path: "AffilateStatus", label: "Affiliation", icon: Network, gradient: "from-indigo-500 to-indigo-600" },
      { path: "CreateProfile", label: "Create Profile", icon: Shield, gradient: "from-teal-500 to-teal-600" },
      { path: "affiliated-employees", label: "Affiliated Employees", icon: Users, gradient: "from-cyan-500 to-cyan-600" },
    ]
  },
  {
    category: "Operations",
    routes: [
      { path: "TaskDashboard", label: "Tasks", icon: Briefcase, gradient: "from-orange-500 to-orange-600" },
      { path: "leave-approval", label: "Leave Approval", icon: CalendarCheck2, gradient: "from-green-500 to-green-600" },
      { path: "shift-plan", label: "Shift Assign", icon: FileText, gradient: "from-cyan-500 to-cyan-600" },
      { path: "shift-planning", label: "Shift Planning", icon: Target, gradient: "from-pink-500 to-pink-600" },
      { path: "work-schedules", label: "Work Schedules", icon: ClockIcon, gradient: "from-violet-500 to-violet-600" },
      { path: "live-monitoring", label: "Live Monitoring", icon: Monitor, gradient: "from-red-500 to-red-600" },
    ]
  },
  {
    category: "Organization",
    routes: [
      { path: "org-chart", label: "Org Chart", icon: Building2, gradient: "from-violet-500 to-violet-600" },
      { path: "calendar", label: "Calendar", icon: CalendarDays, gradient: "from-amber-500 to-amber-600" },
      { path: "public-holidays", label: "Public Holidays", icon: Calendar, gradient: "from-orange-500 to-orange-600" },
      { path: "payroll", label: "Payroll", icon: FileBarChart, gradient: "from-lime-500 to-lime-600" },
      { path: "notification-stats", label: "Notification Stats", icon: FileBarChart, gradient: "from-purple-500 to-purple-600" },
    ]
  },
  {
    category: "Settings",
    routes: [
      { path: "Subscription", label: "Subscription", icon: Crown, gradient: "from-yellow-500 to-yellow-600" },
    ]
  }
];

// Create a memoized NavLink component
const MemoizedNavLink = React.memo(({ route, collapsed, location }) => (
  <NavLink
    key={route.path}
    to={`/employer-dashboard/${route.path}`}
    end={route.path === ""}
    className={({ isActive }) => {
      return `group flex items-center w-full p-3 rounded-xl transition-all duration-200 ${
        isActive 
          ? `bg-gradient-to-r ${route.gradient} text-white shadow-lg scale-105` 
          : 'text-slate-700 hover:bg-slate-50 hover:scale-105'
      } ${collapsed ? 'justify-center' : ''} no-underline`
    }}
  >
    {/* Icon Container */}
    <div className={`p-2 rounded-lg mr-3 transition-all duration-200 ${
      location.pathname === `/employer-dashboard/${route.path}` || (route.path === "" && location.pathname === "/employer-dashboard")
        ? 'bg-white bg-opacity-20 backdrop-blur-sm' 
        : 'bg-slate-100 group-hover:bg-slate-200'
    }`}>
      <div className={`transition-transform group-hover:scale-110 ${
        location.pathname === `/employer-dashboard/${route.path}` || (route.path === "" && location.pathname === "/employer-dashboard") 
          ? 'text-white' : 'text-slate-600'
      }`}>
        <route.icon className="h-5 w-5" />
      </div>
    </div>
    
    {/* Text Content */}
    {!collapsed && (
      <div className="flex-1 text-left">
        <span className="font-semibold text-sm block">{route.label}</span>
        <span className={`text-xs transition-colors ${
          location.pathname === `/employer-dashboard/${route.path}` || (route.path === "" && location.pathname === "/employer-dashboard")
            ? 'text-white text-opacity-80' : 'text-slate-500'
        }`}>
          {getRouteDescription(route.path)}
        </span>
      </div>
    )}
  </NavLink>
));

// Helper function to get route descriptions
const getRouteDescription = (path) => {
  switch (path) {
    case "ManageTeams": return "Organize your workforce";
    case "HireWorkerPage": return "Add new members";
    case "TaskDashboard": return "Assign & track work";
    case "leave-approval": return "Review requests";
    case "shift-plan": return "Schedule shifts";
    
    case "live-monitoring": return "Real-time tracking";
    case "payroll": return "Manage payments";
    case "org-chart": return "Company structure";
    case "calendar": return "Events & schedules";
    case "Subscription": return "Billing & plans";
    case "": return "Overview & insights";
    default: return "";
  }
};

// SummaryCard - Made more responsive and professional
const SummaryCard = ({ icon, label, value, bg, fg }) => (
  <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl p-6 transition-all duration-300 transform hover:-translate-y-1 border border-slate-200">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className={`${bg} p-4 rounded-xl shadow-lg`}>
          {React.cloneElement(icon, { className: `${fg} w-6 h-6` })}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
      </div>
    </div>
    
    {/* Decorative gradient overlay */}
    <div className={`absolute top-0 right-0 w-20 h-20 ${bg} opacity-5 rounded-full -translate-y-10 translate-x-10`}></div>
  </div>
);

// Dashboard Home - Made responsive and professional
const DashboardHome = ({ companyName }) => {
  const [filters, setFilters] = useState({ team: "", status: "", search: "" });
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const filteredSites = dashboardData.sites.filter(site => 
    (!filters.team || site.team === filters.team) &&
    (!filters.status || site.status === filters.status) &&
    (!filters.search || site.site.toLowerCase().includes(filters.search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Welcome to {companyName || "Your Company"}
          </h1>
          <p className="text-slate-600 text-lg">Here's what's happening with your workforce today</p>
        </div>

        {/* Enhanced KPI Cards - Responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryCard 
            icon={<BarChart3 />} 
            label="Avg Shift Length" 
            value="8h" 
            bg="bg-gradient-to-r from-teal-500 to-teal-600" 
            fg="text-white" 
          />
          <SummaryCard 
            icon={<ClockIcon />} 
            label="Overtime Today" 
            value="12h" 
            bg="bg-gradient-to-r from-orange-500 to-orange-600" 
            fg="text-white" 
          />
          <SummaryCard 
            icon={<ClipboardList />} 
            label="Open Requests" 
            value="3" 
            bg="bg-gradient-to-r from-blue-500 to-blue-600" 
            fg="text-white" 
          />
          <SummaryCard 
            icon={<Users />} 
            label="Total Employees" 
            value={dashboardData.totalEmployees} 
            bg="bg-gradient-to-r from-emerald-500 to-emerald-600" 
            fg="text-white" 
          />
        </div>

        {/* Enhanced Upcoming Leaves Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">
              {isSmallScreen ? "Upcoming Leaves" : "Upcoming Leaves (Next 7 days)"}
            </h3>
          </div>
          
          <div className="space-y-3">
            {dashboardData.upcomingLeaves.map((leave) => (
              <div key={leave.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="font-medium text-slate-800">{leave.name}</span>
                </div>
                <span className="text-sm text-slate-600 font-medium">
                  {new Date(leave.date).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Live Sites Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <MapPin className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Live Sites Status</h3>
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-6">
            <select 
              value={filters.team} 
              onChange={e => setFilters({ ...filters, team: e.target.value })} 
              className="bg-slate-50 border border-slate-300 rounded-lg px-4 py-2 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Teams</option>
              {[...new Set(dashboardData.sites.map(site => site.team))].map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
            <select 
              value={filters.status} 
              onChange={e => setFilters({ ...filters, status: e.target.value })} 
              className="bg-slate-50 border border-slate-300 rounded-lg px-4 py-2 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
            <input
              type="search"
              placeholder="Search Site..."
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
              className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-4 py-2 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Enhanced Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 rounded-lg">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 rounded-l-lg">Site</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Team</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700 rounded-r-lg">Workers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredSites.map(site => (
                  <tr key={site.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-800 font-medium">{site.site}</td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {site.team}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${site.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className={`text-sm font-medium capitalize ${site.status === 'online' ? 'text-green-700' : 'text-red-700'}`}>
                          {site.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-sm font-medium">
                        {site.workers}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

function EmployerDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [time, setTime] = useState(new Date());
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [showPopup, setShowPopup] = useState(false);
  const [companyName, setCompanyName] = useState("...");
  const location = useLocation();

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  useEffect(() => {
    const shouldShowPopup = localStorage.getItem("showPostOnboardingPopup") === "true";
    if (shouldShowPopup) {
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, 5000); // 5 seconds
  
      return () => clearTimeout(timer);
    }
  }, []);
  
  const handlePopupClose = () => {
    localStorage.removeItem("showPostOnboardingPopup");
    setShowPopup(false);
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-close sidebar on mobile when navigating
  useEffect(() => {
    if (sidebarOpen && isMobile) {
      setSidebarOpen(false);
    }
  }, [navigate]);

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [isMobile]);


  const isTokenExpired = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch (e) {
      return true;
    }
  };
  
  // Then in your fetchCompanyName:
  const token = localStorage.getItem("token");
  if (!token || isTokenExpired(token)) {
    localStorage.removeItem("token");
    navigate("/login");
    return;
  }

  // In EmployerDashboard.jsx, modify the fetchCompanyName function to handle empty cases:
const fetchCompanyName = async () => {
  try {
    const response = await apiService.getEmployerProfile();
    if (response.data && response.data.companyName) {
      setCompanyName(response.data.companyName);
    } else {
      setCompanyName("No company name set"); // Default value
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
    setCompanyName("Error loading company name");
  }
};
  
  

  // Memoize the navigation menu
  const navigationMenu = useMemo(() => (
    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
      {sidebarRoutes.map((group, groupIndex) => (
        <div key={groupIndex} className="mb-6">
          {/* Category Header */}
          {!collapsed && (
            <div className="mb-2 px-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-light text-gray-400 uppercase tracking-[0.3px] leading-tight" style={{ fontSize: '10px' }}>
                  {group.category}
                </h3>
              </div>
              <div className="h-[0.5px] bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-3"></div>
            </div>
          )}

          {/* Category Routes */}
          <div className="space-y-1">
            {group.routes.map(route => (
              <MemoizedNavLink
                key={route.path}
                route={route}
                collapsed={collapsed}
                location={location}
              />
            ))}
          </div>
        </div>
      ))}
    </nav>
  ), [collapsed, location]);

  return (
    <>
    {showPopup && <PopupWindow onClose={handlePopupClose} />}
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar - Enhanced styling to match sidebar */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-slate-200/50 flex items-center justify-between px-2 sm:px-4 py-2 shadow-sm sticky top-0 z-50">
        <div className="flex items-center">
          <img 
            src={SHRAMII} 
            className="h-8 sm:h-12 object-contain pl-7 scale-[2] sm:scale-[3.5] ml-2 sm:ml-6" 
            alt="Shramii Logo" 
          />
        </div>

        <div className="flex items-center gap-1 sm:gap-3">
          {/* Quick Actions - Only show on larger screens */}
          {!isMobile && (
            <div className="flex items-center gap-2 mr-4">
              <button 
                onClick={() => navigate("/employer-dashboard/TaskDashboard")}
                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                title="Tasks"
              >
                <Briefcase className="w-5 h-5" />
              </button>
              <button 
                onClick={() => navigate("/employer-dashboard/leave-approval")}
                className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 relative"
                title="Leave Approval"
              >
                <CalendarCheck2 className="w-5 h-5" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </button>
            </div>
          )}

          {/* Notifications Button */}
          <IconButton 
            size={isMobile ? "small" : "medium"} 
            onClick={() => alert('No new notifications')}
            className="relative hover:bg-slate-100"
          >
            <Notifications fontSize={isMobile ? "small" : "medium"} className="text-slate-600" />
          </IconButton>

          {/* Profile Button */}
          <IconButton 
            size={isMobile ? "small" : "medium"} 
            onClick={() => navigate("/employer-dashboard/EmpProfile")}
            title="Profile"
            className="hover:bg-slate-100"
          >
            <AccountCircle fontSize={isMobile ? "small" : "medium"} className="text-slate-600" />
          </IconButton>

          {/* Sidebar Toggle Button (Mobile) */}
          <IconButton 
            size={isMobile ? "small" : "medium"} 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden hover:bg-slate-100"
          >
            {sidebarOpen ? <CloseIcon fontSize={isMobile ? "small" : "medium"} className="text-slate-600" /> : <MenuIcon fontSize={isMobile ? "small" : "medium"} className="text-slate-600" />}
          </IconButton>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1">
        {/* Sidebar - Beautiful White Theme Inspired by Employee Dashboard */}
        <aside
          className={`fixed top-16 sm:top-24 inset-y-0 left-0 bg-white border-r border-slate-200 shadow-xl z-40
            ${collapsed ? "w-16 sm:w-20" : "w-64 sm:w-72"} transition-all duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} 
            overflow-hidden flex flex-col`}
        >
          {/* Sidebar Header - Personalized Company Branding */}
          <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            {!collapsed ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Company Logo - Dynamic based on company name */}
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg border-2 border-white">
                    <span className="text-white font-bold text-lg drop-shadow-sm">
                      {companyName ? companyName.charAt(0).toUpperCase() : 'C'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* Company Name */}
                    <h3 className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">
                      {companyName || "Your Company"}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">Management Portal</p>
                    {/* Company Status Indicator */}
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-[10px] text-green-600 font-medium">Active</span>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Collapse Button */}
                <button 
                  onClick={() => setCollapsed(!collapsed)}
                  className="p-2.5 rounded-xl hover:bg-blue-100 transition-all duration-200 group border border-blue-200 bg-white shadow-sm hover:shadow-md flex-shrink-0"
                  title="Collapse sidebar"
                >
                  <ChevronLeft size={18} className="text-blue-600 group-hover:text-blue-700" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <div className="relative">
                  {/* Collapsed Company Logo */}
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg border-2 border-white">
                    <span className="text-white font-bold text-lg drop-shadow-sm">
                      {companyName ? companyName.charAt(0).toUpperCase() : 'C'}
                    </span>
                  </div>
                  
                  {/* Company Status Indicator - Small dot */}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full border-2 border-white shadow-md flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  
                  {/* Enhanced Expand Button */}
                  <button 
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -top-1 -right-1 p-1.5 rounded-lg hover:bg-blue-100 transition-all duration-200 group border border-blue-200 bg-white shadow-md hover:shadow-lg"
                    title={`Expand ${companyName || "Company"} Dashboard`}
                  >
                    <ChevronRight size={14} className="text-blue-600 group-hover:text-blue-700" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Use memoized navigation menu */}
          {navigationMenu}

          {/* Footer Section - Enhanced Company Branding */}
          <div className="p-4 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 space-y-3">
            {/* Logout Button - Red theme to match employee design */}
            <button
              onClick={() => { localStorage.clear(); navigate("/login"); }}
              className={`group flex items-center w-full p-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 transform hover:scale-105 border-2 border-red-200 hover:border-red-300 bg-white shadow-sm
                ${collapsed ? 'justify-center' : ''}`}
            >
              <div className="p-2 rounded-lg mr-3 bg-red-100 group-hover:bg-red-200 transition-all duration-200">
                <svg className="w-4 h-4 text-red-600 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-8V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002-2v-1" />
                </svg>
              </div>
              {!collapsed && (
                <div className="flex-1 text-left">
                  <span className="font-semibold text-sm block">Sign Out</span>
                  <span className="text-red-500 text-xs">End {companyName ? companyName.split(' ')[0] : 'session'} session</span>
                </div>
              )}
            </button>
          </div>
        </aside>

        {/* Main Content - Responsive padding and margins */}
        <div 
          className={`flex-1 flex flex-col transition-all duration-300 ease-in-out
            ${collapsed ? 'lg:ml-16 sm:lg:ml-20' : 'lg:ml-64 sm:lg:ml-72'}`}
        >
          <main className="flex-1 overflow-y-auto p-3 sm:p-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 min-h-screen">
            <Routes>
              <Route path="" element={<DashboardHome companyName={companyName} />} />
              <Route path="EmpProfile" element={<EmpProfile />} />
              <Route path="ManageTeams" element={<ManageTeams />} />
              <Route path="teams/:departmentId" element={<TeamPage />} />
              <Route path="positions/:teamId" element={<PositionsPage/>} />
              <Route path="HireWorkerPage" element={<HireWorkerPage />} />
              <Route path="AffilateStatus" element={<AffilateStatus />} />
              <Route path="TaskDashboard" element={<TaskDashboard />} />
              <Route path='CreateProfile' element={<CreateProfile/>}/>
              <Route path="org-chart" element={<OrgChart />} />
              <Route path="calendar" element={<CalenderTeam />} />
              <Route path="public-holidays" element={<PublicHolidayCalendar />} />
              <Route path="shift-plan" element={<ShiftPlanEnhanced />} />
              <Route path="shift-planning" element={<ShiftPlanning />} />
              <Route path="work-schedules" element={<WorkScheduleManager />} />
              <Route path="payroll" element={<PayrollPage />} />
              <Route path="live-monitoring" element={<LiveSiteMonitoringPage />} />
              <Route path="leave-approval" element={<LeaveApprovalPage />} />
              <Route path="Subscription" element={<SubscriptionPage />} />
              <Route path="notification-stats" element={<NotificationStats />} />
              <Route path="affiliated-employees" element={<AffiliatedEmployees />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
    </>
  );
}

export default React.memo(EmployerDashboard);