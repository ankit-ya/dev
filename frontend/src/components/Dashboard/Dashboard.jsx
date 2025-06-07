import React, { useState } from 'react';
import AppLayout from '../Layout/AppLayout';
import Breadcrumb from '../Layout/Breadcrumb';
import QuickActionBar from '../Layout/QuickActionBar';
import KeyboardShortcuts from '../Layout/KeyboardShortcuts';

import EmployeeDashboard from './EmployeeDashboard';
import TravelHistoryPage from './TravelHistoryPage';
import NotificationCenter from './NotificationCenter';
import Profile from './Profile';
import Payroll from './Payroll';
import PunchClock from './PunchClock';
import CalendarComponent from './Calendar';
import YourProfile from './YourProfile';
import LeaveAndAttendance from './LeaveAndAttendance'; 
import EmployeeTaskManager from './EmployeeTaskManager';

function Dashboard() {
  const [activeSection, setActiveSection] = useState("Home");

  // Mock user info - in a real app this would come from context/state management
  const userInfo = {
    name: "Ravi Kumar",
    userName: "s500069",
    designation: "Security Officer",
    department: "Field Operations",
    email: "ravi.kumar@shrami.in",
    photo: "https://via.placeholder.com/100/3B82F6/FFFFFF?text=RK"
  };

  // Breadcrumb configuration for different sections
  const getBreadcrumbItems = () => {
    const breadcrumbMap = {
      "TravelHistory": [{ name: "Travel History", section: "TravelHistory" }],
      "Profile": [{ name: "Profile", section: "Profile" }],
      "Payroll": [{ name: "Payroll", section: "Payroll" }],
      "PunchClock": [{ name: "Punch Clock", section: "PunchClock" }],
      "Calendar": [{ name: "Calendar", section: "Calendar" }],
      "YourProfile": [{ name: "Your Profile", section: "YourProfile" }],
      "LeaveAndAttendance": [{ name: "Leave & Attendance", section: "LeaveAndAttendance" }],
      "TaskManager": [{ name: "Task Manager", section: "TaskManager" }],
      "Notifications": [{ name: "Notifications", section: "Notifications" }]
    };
    
    return breadcrumbMap[activeSection] || [];
  };

  const renderContent = () => {
    switch(activeSection) {
      case "Home":
        return <EmployeeDashboard />;
      case "TravelHistory":
        return <TravelHistoryPage />;
      case "Profile":
        return <Profile />;
      case "Payroll":
        return <Payroll />;
      case "PunchClock":
        return <PunchClock />;
      case "Calendar":
        return <CalendarComponent />;
      case "YourProfile":
        return <YourProfile />;
      case "LeaveAndAttendance":
        return <LeaveAndAttendance />;
      case "TaskManager":
        return <EmployeeTaskManager employeeName="User 1" />;
      case "Notifications":
        return <NotificationCenter />;
      default:
        return <EmployeeDashboard />;
    }
  };

  return (
    <AppLayout 
      activeSection={activeSection} 
      onSectionChange={setActiveSection}
      userInfo={userInfo}
    >
      {/* Breadcrumb Navigation */}
      <Breadcrumb 
        items={getBreadcrumbItems()} 
        currentSection={activeSection} 
      />
      
      {/* Page Content */}
      <div className="transition-all duration-300">
        {renderContent()}
      </div>

      {/* Quick Action Bar */}
      <QuickActionBar 
        onActionClick={setActiveSection}
      />

      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts 
        onSectionChange={setActiveSection}
      />
    </AppLayout>
  );
}

export default Dashboard;
