import React, { useEffect, useState } from "react";
import {
  fetchAllAffiliations,
  fetchByStatus,
  fetchByEmployeeId,
  fetchByDepartment,
  fetchByTeam,
} from "../API/apiService";
import { useMediaQuery } from '@mui/material';

export default function AffilateStatus() {
  const [affiliates, setAffiliates] = useState([]);
  const [filters, setFilters] = useState({
    status: "",
    employeeId: "",
    department: "",
    team: "",
  });

  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    loadAllAffiliates();
  }, []);

  const loadAllAffiliates = async () => {
    const res = await fetchAllAffiliations();
    setAffiliates(res);
  };

  const handleFilter = async () => {
    try {
      if (filters.employeeId) {
        const res = await fetchByEmployeeId(filters.employeeId);
        return setAffiliates(res);
      }
      if (filters.department) {
        const res = await fetchByDepartment(filters.department);
        return setAffiliates(res);
      }
      if (filters.team) {
        const res = await fetchByTeam(filters.team);
        return setAffiliates(res);
      }
      if (filters.status) {
        const res = await fetchByStatus(filters.status);
        return setAffiliates(res);
      }

      loadAllAffiliates(); // fallback
    } catch (err) {
      console.error("Error filtering affiliation status:", err);
    }
  };

  return (
    <div className={`${isMobile ? 'p-2' : 'p-6'} min-h-screen bg-white text-gray-800`}>
      <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold mb-4`}>Affiliation Status</h1>

      {/* Filters */}
      <div className={`flex ${isMobile ? 'flex-col' : 'flex-wrap'} gap-3 mb-6`}>
        <input
          placeholder="Employee ID"
          className="border p-2 rounded text-sm"
          value={filters.employeeId}
          onChange={(e) => setFilters({ ...filters, employeeId: e.target.value })}
        />
        <input
          placeholder="Department"
          className="border p-2 rounded text-sm"
          value={filters.department}
          onChange={(e) => setFilters({ ...filters, department: e.target.value })}
        />
        <input
          placeholder="Team"
          className="border p-2 rounded text-sm"
          value={filters.team}
          onChange={(e) => setFilters({ ...filters, team: e.target.value })}
        />
        <select
          className="border p-2 rounded text-sm"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">Filter by Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <div className={`flex ${isMobile ? 'flex-row' : ''} gap-3`}>
          <button
            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-sm"
            onClick={handleFilter}
          >
            {isMobile ? 'Filter' : 'Apply Filters'}
          </button>
          <button
            className="bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-700 text-sm"
            onClick={() => {
              setFilters({ status: "", employeeId: "", department: "", team: "" });
              loadAllAffiliates();
            }}
          >
            {isMobile ? 'Reset' : 'Reset Filters'}
          </button>
        </div>
      </div>

      {/* Content */}
      {isMobile ? (
        // Mobile Card View
        <div className="space-y-3">
          {affiliates.length > 0 ? (
            affiliates.map((item, index) => (
              <div key={index} className="border rounded-lg p-3 shadow-sm">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <p className="text-xs text-gray-500">Employee ID</p>
                    <p className="font-medium">{item.employeeId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="font-medium">{item.name}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <p className="text-xs text-gray-500">Department</p>
                    <p className="font-medium">{item.department}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Team</p>
                    <p className="font-medium">{item.team}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <p className="text-xs text-gray-500">Position</p>
                    <p className="font-medium">{item.position}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="font-medium capitalize text-blue-700">{item.status}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              No records found.
            </div>
          )}
        </div>
      ) : (
        // Desktop Table View
        <div className="overflow-x-auto">
          <div className="min-w-full inline-block align-middle">
            <div className="overflow-hidden">
              <table className="min-w-full border border-gray-300 text-sm">
                <thead className="bg-gray-200 text-left">
                  <tr>
                    <th className="p-2 border">Employee ID</th>
                    <th className="p-2 border">Name</th>
                    <th className="p-2 border">Department</th>
                    <th className="p-2 border">Team</th>
                    <th className="p-2 border">Position</th>
                    <th className="p-2 border">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {affiliates.length > 0 ? (
                    affiliates.map((item, index) => (
                      <tr key={index} className="bg-white border-t">
                        <td className="p-2 border">{item.employeeId}</td>
                        <td className="p-2 border">{item.name}</td>
                        <td className="p-2 border">{item.department}</td>
                        <td className="p-2 border">{item.team}</td>
                        <td className="p-2 border">{item.position}</td>
                        <td className="p-2 border capitalize text-blue-700">{item.status}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-gray-500">
                        No records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}