import React, { useState, useEffect } from 'react';
import {
  createProfile,
  fetchAllProfiles,
  updateProfile,
  deleteProfile,
} from '../API/apiService';

const defaultPermissionKeys = ['viewEmployee', 'editEmployee', 'deleteEmployee'];

const CreateProfile = () => {
  const [name, setName] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [permissions, setPermissions] = useState({
    viewEmployee: false,
    editEmployee: false,
    deleteEmployee: false,
  });
  const [filters, setFilters] = useState([
    { field: '', operator: '', value: '', conditionType: 'AND' }
  ]);
  const [profiles, setProfiles] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllProfiles();
      setProfiles(data);
    } catch (error) {
      console.error('Error loading profiles:', error);
      alert('Failed to load profiles.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermissionChange = (key) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleFilterChange = (index, key, value) => {
    const updated = [...filters];
    updated[index][key] = value;
    setFilters(updated);
  };

  const addFilter = () => {
    setFilters([...filters, { field: '', operator: '', value: '', conditionType: 'AND' }]);
  };

  const removeFilter = (index) => {
    const updated = filters.filter((_, i) => i !== index);
    setFilters(updated);
  };

  const resetForm = () => {
    setName('');
    setIsDefault(false);
    setPermissions({
      viewEmployee: false,
      editEmployee: false,
      deleteEmployee: false,
    });
    setFilters([{ field: '', operator: '', value: '', conditionType: 'AND' }]);
    setEditingId(null);
  };

  const handleEdit = (profile) => {
    setName(profile.name);
    setIsDefault(profile.default || false);
    setPermissions(profile.permissions || {
      viewEmployee: false,
      editEmployee: false,
      deleteEmployee: false,
    });
    setFilters(profile.filters || [{ field: '', operator: '', value: '', conditionType: 'AND' }]);
    setEditingId(profile._id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const profileData = {
      name,
      default: isDefault,
      permissions,
      filters: filters.filter(f => f.field && f.operator && f.value),
    };

    try {
      if (editingId) {
        await updateProfile(editingId, profileData);
        alert('Profile updated successfully!');
      } else {
        await createProfile(profileData);
        alert('Profile created successfully!');
      }
      resetForm();
      loadProfiles();
    } catch (error) {
      console.error('Error saving profile:', error);
      alert(`Failed to ${editingId ? 'update' : 'create'} profile.`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this profile?')) {
      try {
        await deleteProfile(id);
        alert('Profile deleted successfully!');
        loadProfiles();
      } catch (error) {
        console.error('Error deleting profile:', error);
        alert('Failed to delete profile.');
      }
    }
  };

  return (
    <div className=" mx-auto  max-w-6xl">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Profile Management</h1>

      <div className="">
        {/* Left Column - Profile Form */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-gray-700">
            {editingId ? 'Edit Profile' : 'Create New Profile'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Name:</label>
                <input
                  type="text"
                  value={name}
                  required
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="defaultProfile"
                  checked={isDefault}
                  onChange={() => setIsDefault(!isDefault)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="defaultProfile" className="ml-2 block text-sm text-gray-700">
                  Set as default profile
                </label>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Permissions:</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {defaultPermissionKeys.map(key => (
                  <div key={key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={permissions[key] || false}
                      onChange={() => handlePermissionChange(key)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter Conditions:</label>
              <div className="space-y-3">
                {filters.map((filter, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-3">
                      <label className="block text-xs text-gray-500 mb-1">Field</label>
                      <input
                        type="text"
                        placeholder="e.g. department"
                        value={filter.field}
                        onChange={(e) => handleFilterChange(index, 'field', e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-xs text-gray-500 mb-1">Operator</label>
                      <select
                        value={filter.operator}
                        onChange={(e) => handleFilterChange(index, 'operator', e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                      >
                        <option value="">Select operator</option>
                        <option value="==">Equals</option>
                        <option value="!=">Not equals</option>
                        <option value=">">Greater than</option>
                        <option value="<">Less than</option>
                        <option value=">=">Greater or equal</option>
                        <option value="<=">Less or equal</option>
                        <option value="contains">Contains</option>
                      </select>
                    </div>
                    <div className="col-span-3">
                      <label className="block text-xs text-gray-500 mb-1">Value</label>
                      <input
                        type="text"
                        placeholder="e.g. HR"
                        value={filter.value}
                        onChange={(e) => handleFilterChange(index, 'value', e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">Condition</label>
                      <select
                        value={filter.conditionType}
                        onChange={(e) => handleFilterChange(index, 'conditionType', e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                      >
                        <option value="AND">AND</option>
                        <option value="OR">OR</option>
                      </select>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeFilter(index)}
                        className="text-red-500 hover:text-red-700 p-2"
                        disabled={filters.length <= 1}
                        title="Remove filter"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addFilter}
                className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Filter
              </button>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
              <button
                type="submit"
                className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {editingId ? 'Update Profile' : 'Create Profile'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right Column - Profiles List */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-700">Existing Profiles</h2>
            <button 
              onClick={loadProfiles}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Refresh
            </button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-2">No profiles found</p>
              <p className="text-sm">Create your first profile using the form above</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {profiles.map(profile => (
                <div key={profile._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="mb-2 sm:mb-0">
                      <div className="flex items-center">
                        <h3 className="font-bold text-gray-800">
                          {profile.name}
                        </h3>
                        {profile.default && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">Permissions:</span> {Object.keys(profile.permissions || {})
                            .filter(key => profile.permissions[key])
                            .map(key => key.replace(/([A-Z])/g, ' $1').trim())
                            .join(', ') || 'None'}
                        </p>
                        {profile.filters && profile.filters.length > 0 && (
                          <p className="mt-1">
                            <span className="font-medium">Filters:</span> {profile.filters.length} condition{profile.filters.length !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(profile)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(profile._id)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateProfile;