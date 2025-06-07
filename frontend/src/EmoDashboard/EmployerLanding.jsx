import React from "react";
import {
  CalendarMonth,
  People,
  AccessTime,
  MonetizationOn,
  Add,
  TrendingUp,
  Analytics,
  Schedule,
  Groups,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function EmployerLanding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Welcome Back! 👋
              </h1>
              <p className="text-lg text-slate-600 mt-3 font-medium">
                Streamline your workforce management with powerful insights
              </p>
            </div>
            <div className="hidden lg:flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 font-medium text-sm">System Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Quick Stats with Modern Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard 
            label="Total Employees" 
            value="48" 
            change="+12%" 
            trend="up"
            icon={<People className="w-6 h-6" />}
            gradient="from-blue-500 to-blue-600"
            bgGradient="from-blue-50 to-blue-100"
          />
          <StatCard 
            label="Active Shifts Today" 
            value="12" 
            change="+8%" 
            trend="up"
            icon={<Schedule className="w-6 h-6" />}
            gradient="from-emerald-500 to-emerald-600"
            bgGradient="from-emerald-50 to-emerald-100"
          />
          <StatCard 
            label="Attendance Rate" 
            value="93%" 
            change="+5%" 
            trend="up"
            icon={<TrendingUp className="w-6 h-6" />}
            gradient="from-amber-500 to-amber-600"
            bgGradient="from-amber-50 to-amber-100"
          />
          <StatCard 
            label="Payroll Pending" 
            value="₹18,400" 
            change="-2%" 
            trend="down"
            icon={<MonetizationOn className="w-6 h-6" />}
            gradient="from-purple-500 to-purple-600"
            bgGradient="from-purple-50 to-purple-100"
          />
        </div>

        {/* Enhanced Quick Actions Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
            <Analytics className="w-6 h-6 mr-3 text-blue-600" />
            Quick Actions
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ActionCard
              icon={<CalendarMonth className="w-8 h-8" />}
              title="Schedule Shifts"
              subtitle="Plan and manage upcoming work shifts efficiently"
              iconColor="text-blue-600"
              borderColor="border-blue-200"
              hoverColor="hover:border-blue-400"
              bgColor="bg-blue-50"
            />
            <ActionCard
              icon={<Groups className="w-8 h-8" />}
              title="Manage Teams"
              subtitle="Organize teams and update worker information"
              onClick={() => navigate("/manage-teams")}
              iconColor="text-emerald-600"
              borderColor="border-emerald-200"
              hoverColor="hover:border-emerald-400"
              bgColor="bg-emerald-50"
            />
            <ActionCard
              icon={<MonetizationOn className="w-8 h-8" />}
              title="Run Payroll"
              subtitle="Generate salaries and comprehensive payslips"
              iconColor="text-amber-600"
              borderColor="border-amber-200"
              hoverColor="hover:border-amber-400"
              bgColor="bg-amber-50"
            />
            <ActionCard
              icon={<AccessTime className="w-8 h-8" />}
              title="Attendance Logs"
              subtitle="Review and analyze daily attendance patterns"
              iconColor="text-purple-600"
              borderColor="border-purple-200"
              hoverColor="hover:border-purple-400"
              bgColor="bg-purple-50"
            />
            <ActionCard
              icon={<Add className="w-8 h-8" />}
              title="Hire New Worker"
              subtitle="Onboard new workforce to your system"
              onClick={() => navigate("/hire-worker")}
              iconColor="text-rose-600"
              borderColor="border-rose-200"
              hoverColor="hover:border-rose-400"
              bgColor="bg-rose-50"
            />
            <ActionCard
              icon={<People className="w-8 h-8" />}
              title="Affiliate Status"
              subtitle="Monitor and manage affiliation relationships"
              onClick={() => navigate("/Affilate-status")}
              iconColor="text-indigo-600"
              borderColor="border-indigo-200"
              hoverColor="hover:border-indigo-400"
              bgColor="bg-indigo-50"
            />
          </div>
        </div>

        {/* Professional Footer Section */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-6 py-3 rounded-full shadow-sm border border-slate-200">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-slate-600 font-medium">Dashboard last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, change, trend, icon, gradient, bgGradient }) {
  const isPositive = trend === "up";
  
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${bgGradient} rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-r ${gradient} text-white shadow-lg`}>
            {icon}
          </div>
          <div className={`flex items-center space-x-1 text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <span>{change}</span>
            <TrendingUp className={`w-4 h-4 ${isPositive ? '' : 'rotate-180'}`} />
          </div>
        </div>
        
        <div>
          <p className="text-sm font-medium text-slate-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-slate-800">{value}</p>
        </div>
      </div>
      
      {/* Decorative gradient overlay */}
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradient} opacity-10 rounded-full -translate-y-12 translate-x-12`}></div>
    </div>
  );
}

function ActionCard({ icon, title, subtitle, onClick, iconColor, borderColor, hoverColor, bgColor }) {
  return (
    <div
      onClick={onClick}
      className={`group relative bg-white rounded-2xl border-2 ${borderColor} ${hoverColor} shadow-sm hover:shadow-xl cursor-pointer transition-all duration-300 transform hover:-translate-y-1 overflow-hidden`}
    >
      <div className="p-6">
        <div className="flex items-start space-x-4">
          <div className={`p-3 ${bgColor} rounded-xl ${iconColor} group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-slate-800 text-lg mb-2 group-hover:text-slate-900 transition-colors">
              {title}
            </h4>
            <p className="text-slate-600 text-sm leading-relaxed">
              {subtitle}
            </p>
          </div>
        </div>
      </div>
      
      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-blue-50 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
      
      {/* Action indicator */}
      <div className={`absolute top-4 right-4 w-2 h-2 ${iconColor.replace('text-', 'bg-')} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
    </div>
  );
}
