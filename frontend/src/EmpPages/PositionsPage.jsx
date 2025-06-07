import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlusCircle, ArrowLeft } from 'lucide-react';
import {  } from '../API/apiService';
import { useMediaQuery } from '@mui/material';

const PositionRow = ({ position, isMobile, isTablet }) => {
  return (
    <tr key={position.id} className="hover:bg-gray-50">
      {!isMobile && <td className="px-2 py-1 sm:px-4 sm:py-2 truncate max-w-[100px]">{position.id}</td>}
      <td className="px-2 py-1 sm:px-4 sm:py-2">{position.title}</td>
      {!isMobile && <td className="px-2 py-1 sm:px-4 sm:py-2">{position.team}</td>}
      {!isTablet && <td className="px-2 py-1 sm:px-4 sm:py-2">{position.department}</td>}
      <td className="px-2 py-1 sm:px-4 sm:py-2">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
          position.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {position.status}
        </span>
      </td>
    </tr>
  );
};

export default function PositionsPage() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [positions, setPositions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [positionTitle, setPositionTitle] = useState('');
  const [departments, setDepartments] = useState([]);

  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [teamData, positionsData, deptData] = await Promise.all([
          fetchTeamDetails(teamId),
          fetchPositionsByTeam(teamId),
          fetchDepartmentDetails()
        ]);
        setTeam(teamData);
        setPositions(positionsData || []);
        setDepartments(deptData || []);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    loadData();
  }, [teamId]);

  const resetForm = () => {
    setPositionTitle('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const department = departments.find(d => 
      d.teams?.some(t => t.id === teamId)
    ); // Added missing closing parenthesis here

    const newPosition = {
      id: Date.now().toString(),
      title: positionTitle,
      teamId: teamId,
      departmentId: department?.id || '',
      status: 'Active'
    };

    try {
      const savedPosition = await createPosition(newPosition);
      const freshPositions = await fetchPositionsByTeam(teamId);
      setPositions(freshPositions);
      resetForm();
      setShowForm(false);
      alert('Position created successfully!');
    } catch (error) {
      console.error('Failed to create position:', error);
      alert('Failed to create position. Please try again.');
    }
  };

  return (
    <div className={`${isMobile ? 'p-2' : 'p-4'} bg-white rounded-2xl shadow`}>
      <div className="flex items-center mb-4 gap-2">
        <button 
          onClick={() => navigate(-1)} 
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-semibold`}>
            {team?.teamName || 'Team'} Positions
          </h1>
          {team?.headOfTeam && (
            <p className="text-sm text-gray-600">
              Team Head: {team.headOfTeam.firstName || team.headOfTeamId}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <p className="text-gray-600">
          {positions.length} position{positions.length !== 1 ? 's' : ''} in this team
        </p>
        <button 
          onClick={() => setShowForm(true)} 
          className={`flex items-center px-3 py-1 sm:px-4 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700`}
        >
          <PlusCircle className="mr-2" size={16} /> 
          Add Position
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className={`bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full ${isMobile ? 'max-w-xs' : 'max-w-md'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">New Position</h2>
              <button 
                onClick={() => { resetForm(); setShowForm(false); }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium">Position Title</label>
                <input
                  type="text"
                  value={positionTitle}
                  onChange={(e) => setPositionTitle(e.target.value)}
                  required
                  className="mt-1 w-full px-3 py-2 border rounded-lg text-sm sm:text-base"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { resetForm(); setShowForm(false); }}
                  className="px-3 py-1 sm:px-4 sm:py-2 border rounded-lg text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full text-xs sm:text-sm text-gray-700">
          <thead className="bg-gray-100">
            <tr>
              {!isMobile && <th className="px-2 py-1 sm:px-4 sm:py-2 text-left">Position ID</th>}
              <th className="px-2 py-1 sm:px-4 sm:py-2 text-left">Title</th>
              {!isMobile && <th className="px-2 py-1 sm:px-4 sm:py-2 text-left">Team</th>}
              {!isTablet && <th className="px-2 py-1 sm:px-4 sm:py-2 text-left">Department</th>}
              <th className="px-2 py-1 sm:px-4 sm:py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {positions.length > 0 ? positions.map(pos => (
              <PositionRow 
                key={pos.id} 
                position={pos} 
                isMobile={isMobile}
                isTablet={isTablet}
              />
            )) : (
              <tr>
                <td colSpan={isMobile ? 3 : (isTablet ? 4 : 5)} className="text-center px-4 py-6 text-gray-500">
                  No positions found in this team.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}