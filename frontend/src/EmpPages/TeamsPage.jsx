import React, { useEffect, useState } from 'react';
import {
  getAllTeams,
  getTeamsByDepartment,
  createTeam,
  updateTeam,
  deleteTeam
} from '../API/apiService';; // adjust path if needed

import { getAllDepartments } from '../API/apiService'; // if department dropdown/filter needed

const TeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [newTeam, setNewTeam] = useState({ name: '', department: { id: '' } });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token'); // Get from auth context or localStorage

  // Fetch all teams
  const loadTeams = async () => {
    try {
      setLoading(true);
      const data = await getAllTeams(token);
      setTeams(data);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  // Fetch departments (for dropdown)
  const loadDepartments = async () => {
    try {
      const data = await getAllDepartments(token);
      setDepartments(data);
    } catch (err) {
      console.error('Error loading departments:', err);
    }
  };

  // Fetch teams by department
  const filterTeams = async (departmentId) => {
    try {
      const data = await getTeamsByDepartment(departmentId, token);
      setTeams(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async () => {
    try {
      await createTeam(newTeam, token);
      setNewTeam({ name: '', department: { id: '' } });
      await loadTeams();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (teamId) => {
    try {
      await deleteTeam(teamId, token);
      await loadTeams();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (teamId, updatedName) => {
    try {
      const teamToUpdate = teams.find(team => team.id === teamId);
      const updatedTeam = {
        ...teamToUpdate,
        name: updatedName,
      };
      await updateTeam(teamId, updatedTeam, token);
      await loadTeams();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTeams();
    loadDepartments();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Teams</h2>

      {/* Filter by Department */}
      <div className="mb-4">
        <label>Filter by Department: </label>
        <select
          value={selectedDepartment}
          onChange={(e) => {
            setSelectedDepartment(e.target.value);
            filterTeams(e.target.value);
          }}
          className="border px-2 py-1"
        >
          <option value="">All</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>{dept.name}</option>
          ))}
        </select>
      </div>

      {/* Create Team */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Team Name"
          value={newTeam.name}
          onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
          className="border p-1 mr-2"
        />
        <select
          value={newTeam.department.id}
          onChange={(e) => setNewTeam({ ...newTeam, department: { id: e.target.value } })}
          className="border p-1 mr-2"
        >
          <option value="">Select Department</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>{dept.name}</option>
          ))}
        </select>
        <button onClick={handleCreate} className="bg-blue-500 text-white px-3 py-1 rounded">Add Team</button>
      </div>

      {/* Team List */}
      {loading ? (
        <p>Loading teams...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <table className="table-auto w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">Team Name</th>
              <th className="border px-4 py-2">Department</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team) => (
              <tr key={team.id}>
                <td className="border px-4 py-2">{team.name}</td>
                <td className="border px-4 py-2">{team.department?.name || '-'}</td>
                <td className="border px-4 py-2">
                  <button
                    onClick={() => {
                      const newName = prompt('Enter new team name', team.name);
                      if (newName) handleUpdate(team.id, newName);
                    }}
                    className="bg-yellow-400 px-2 py-1 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(team.id)}
                    className="bg-red-500 text-white px-2 py-1"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TeamsPage;
