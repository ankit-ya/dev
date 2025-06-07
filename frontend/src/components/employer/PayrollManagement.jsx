import React, { useState, useEffect } from 'react';
import { getEmployerPayrollIssues } from '../../API/apiService';
import PayrollIssueList from './PayrollIssueList';
import { toast } from 'react-toastify';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

const PayrollManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const employerId = localStorage.getItem('userId');

  return (
    <div className="container mx-auto p-4">
      <Tabs selectedIndex={activeTab} onSelect={index => setActiveTab(index)}>
        <TabList className="flex gap-4 mb-6 border-b border-slate-200">
          <Tab className="px-4 py-2 text-slate-600 hover:text-slate-800 cursor-pointer border-b-2 border-transparent transition-colors">
            Payroll Overview
          </Tab>
          <Tab className="px-4 py-2 text-slate-600 hover:text-slate-800 cursor-pointer border-b-2 border-transparent transition-colors">
            Issues & Requests
          </Tab>
          <Tab className="px-4 py-2 text-slate-600 hover:text-slate-800 cursor-pointer border-b-2 border-transparent transition-colors">
            Settings
          </Tab>
        </TabList>

        <TabPanel>
          <div className="space-y-6">
            {/* Add your existing payroll overview content here */}
          </div>
        </TabPanel>

        <TabPanel>
          <div className="space-y-6">
            <PayrollIssueList employerId={employerId} />
          </div>
        </TabPanel>

        <TabPanel>
          <div className="space-y-6">
            {/* Add your payroll settings content here */}
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
};

export default PayrollManagement; 