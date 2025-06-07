import React, { useState } from 'react';
import { 
  MdAccessTime, 
  MdEventNote, 
  MdPayment, 
  MdHelp,
  MdAdd,
  MdClose
} from 'react-icons/md';
import { HiClock, HiCalendar, HiCreditCard, HiQuestionMarkCircle } from 'react-icons/hi';

const QuickActionBar = ({ onActionClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const quickActions = [
    {
      name: "Clock In/Out",
      icon: <MdAccessTime className="w-5 h-5" />,
      action: "PunchClock",
      color: "emerald",
      description: "Quick attendance"
    },
    {
      name: "Request Leave",
      icon: <MdEventNote className="w-5 h-5" />,
      action: "LeaveAndAttendance",
      color: "blue",
      description: "Apply for time off"
    },
    {
      name: "View Payslip",
      icon: <MdPayment className="w-5 h-5" />,
      action: "Payroll",
      color: "purple",
      description: "Check salary details"
    },
    {
      name: "Help & Support",
      icon: <MdHelp className="w-5 h-5" />,
      action: "help",
      color: "amber",
      description: "Get assistance"
    }
  ];

  const handleActionClick = (action) => {
    if (action === "help") {
      // Handle help action
      alert("Help & Support - Contact: support@shramii.in");
    } else {
      onActionClick(action);
    }
    setIsExpanded(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Quick Actions */}
      <div className={`transition-all duration-300 ${
        isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}>
        <div className="flex flex-col gap-3 mb-4">
          {quickActions.map((action, index) => (
            <button
              key={action.name}
              onClick={() => handleActionClick(action.action)}
              className={`group flex items-center gap-3 bg-white p-3 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-200 transform hover:scale-105 min-w-[200px]`}
              style={{ 
                animationDelay: isExpanded ? `${index * 50}ms` : '0ms'
              }}
            >
              <div className={`p-2 rounded-lg bg-${action.color}-100 text-${action.color}-600 group-hover:bg-${action.color}-200 transition-colors`}>
                {action.icon}
              </div>
              <div className="text-left flex-1">
                <span className="font-semibold text-slate-800 text-sm block">{action.name}</span>
                <span className="text-slate-500 text-xs">{action.description}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Action Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center ${
          isExpanded ? 'rotate-45' : 'rotate-0'
        }`}
      >
        {isExpanded ? (
          <MdClose className="w-6 h-6" />
        ) : (
          <MdAdd className="w-6 h-6" />
        )}
      </button>

      {/* Tooltip */}
      {!isExpanded && (
        <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            Quick Actions
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickActionBar; 