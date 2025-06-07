import React, { useState, useEffect } from 'react';
import { 
  getAllWorkSchedules, 
  createWorkSchedule, 
  updateWorkSchedule, 
  deleteWorkSchedule
} from '../API/apiService';
import { 
  Plus, 
  Trash2, 
  Edit2,
  Clock,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const WorkScheduleManager = () => {
  const [schedules, setSchedules] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'FIXED',
    is24x7: false,
    workDays: {},
    isDefault: false,
    assignedTo: [],
    assignmentType: null,
    weeklyHours: 0
  });

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      const employerId = localStorage.getItem('userId');
      const response = await getAllWorkSchedules(employerId);
      
      // The response is already the array of schedules
      if (Array.isArray(response)) {
        setSchedules(response);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching schedules:', err);
      setError('Failed to load work schedules. Please try again later.');
      toast.error('Failed to load work schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID not found. Please log in again.');
      }

      // Calculate weekly hours
      const weeklyHours = !formData.is24x7 ? 
        Object.values(formData.workDays).reduce((total, shifts) => 
          total + shifts.reduce((sum, shift) => sum + shift.durationMinutes, 0), 0) / 60 : 
        168; // 24 * 7 for 24x7 schedules

      // Ensure workDays has proper structure for each day
      const formattedWorkDays = formData.is24x7 ? {} : 
        Object.entries(formData.workDays).reduce((acc, [day, shifts]) => {
          acc[day] = shifts.map(shift => ({
            startTime: shift.startTime,
            endTime: shift.endTime,
            durationMinutes: shift.durationMinutes
          }));
          return acc;
        }, {});

      const payload = {
        name: formData.name,
        type: formData.type,
        is24x7: formData.is24x7,
        workDays: formattedWorkDays,
        isDefault: formData.isDefault,
        assignedTo: formData.assignedTo || [],
        assignmentType: formData.assignmentType || null,
        createdBy: userId,
        createdAt: currentSchedule ? currentSchedule.createdAt : Date.now(),
        updatedAt: Date.now(),
        weeklyHours: Math.round(weeklyHours)
      };

      // Log the full payload for debugging
      console.log('Full payload:', JSON.stringify(payload, null, 2));

      let response;
      if (currentSchedule) {
        response = await updateWorkSchedule(currentSchedule.id, payload);
      } else {
        response = await createWorkSchedule(payload);
      }

      // The response is the created/updated schedule object
      if (response && response.id) {
        toast.success(currentSchedule ? 'Schedule updated successfully!' : 'New schedule created successfully!');
        await fetchSchedules();
        setIsModalOpen(false);
        resetForm();
      } else {
        throw new Error(response?.error || 'Operation failed');
      }
    } catch (err) {
      console.error('Error saving schedule:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to save work schedule';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        const response = await deleteWorkSchedule(id);
        if (response.resCode === 200) {
          toast.success('Schedule deleted successfully!');
          await fetchSchedules();
        } else {
          throw new Error(response.resMsg || 'Failed to delete schedule');
        }
      } catch (err) {
        console.error('Error deleting schedule:', err);
        toast.error(err.message || 'Failed to delete schedule');
      }
    }
  };

  const handleEdit = (schedule) => {
    setCurrentSchedule(schedule);
    setFormData({
      name: schedule.name,
      type: schedule.type,
      is24x7: schedule.is24x7,
      workDays: schedule.workDays,
      isDefault: schedule.isDefault,
      assignedTo: schedule.assignedTo || [],
      assignmentType: schedule.assignmentType || null,
      weeklyHours: schedule.weeklyHours || 0
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setCurrentSchedule(null);
    setFormData({
      name: '',
      type: 'FIXED',
      is24x7: false,
      workDays: {},
      isDefault: false,
      assignedTo: [],
      assignmentType: null,
      weeklyHours: 0
    });
  };

  const handleDayToggle = (day) => {
    if (formData.is24x7) return;

    const newWorkDays = { ...formData.workDays };
    if (newWorkDays[day]) {
      delete newWorkDays[day];
    } else {
      newWorkDays[day] = [{ startTime: '09:00', endTime: '17:00', durationMinutes: 480 }];
    }
    setFormData({ ...formData, workDays: newWorkDays });
  };

  const handleTimeChange = (day, index, field, value) => {
    const newWorkDays = { ...formData.workDays };
    newWorkDays[day][index] = {
      ...newWorkDays[day][index],
      [field]: value
    };
    
    if (field === 'startTime' || field === 'endTime') {
      const start = newWorkDays[day][index].startTime;
      const end = newWorkDays[day][index].endTime;
      const duration = calculateDuration(start, end);
      newWorkDays[day][index].durationMinutes = duration;
    }
    
    setFormData({ ...formData, workDays: newWorkDays });
  };

  const calculateDuration = (start, end) => {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    return (endHour * 60 + endMin) - (startHour * 60 + startMin);
  };

  const addShift = (day) => {
    const newWorkDays = { ...formData.workDays };
    newWorkDays[day] = [
      ...(newWorkDays[day] || []),
      { startTime: '09:00', endTime: '17:00', durationMinutes: 480 }
    ];
    setFormData({ ...formData, workDays: newWorkDays });
  };

  const removeShift = (day, index) => {
    const newWorkDays = { ...formData.workDays };
    newWorkDays[day].splice(index, 1);
    if (newWorkDays[day].length === 0) {
      delete newWorkDays[day];
    }
    setFormData({ ...formData, workDays: newWorkDays });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Work Schedules</h1>
            <p className="text-gray-600">Create and manage work schedules</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Create Schedule
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex items-center">
            <AlertCircle className="mr-2" size={20} />
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          /* Schedules Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{schedule.name}</h3>
                    <div className="flex gap-2 mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        schedule.type === 'FIXED' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {schedule.type}
                      </span>
                      {schedule.isDefault && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(schedule)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit schedule"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(schedule.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete schedule"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Schedule Details */}
                <div className="space-y-4">
                  {/* Working Days */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} />
                    {schedule.is24x7 ? (
                      <span className="text-green-600 font-medium">24x7 Operation</span>
                    ) : (
                      <span>{Object.keys(schedule.workDays).length} working days</span>
                    )}
                  </div>

                  {/* Working Hours */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={16} />
                    <span>
                      {schedule.is24x7 
                        ? '24 hours' 
                        : Object.values(schedule.workDays).reduce((total, shifts) => 
                            total + shifts.reduce((sum, shift) => sum + shift.durationMinutes, 0), 0) / 60 + 'h per day'
                      }
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {currentSchedule ? 'Edit Schedule' : 'Create New Schedule'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Schedule Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="FIXED">Fixed</option>
                      <option value="FLEXIBLE">Flexible</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is24x7}
                        onChange={(e) => setFormData({ ...formData, is24x7: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">24x7 Operation</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.isDefault}
                        onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Set as Default</span>
                    </label>
                  </div>
                </div>

                {/* Work Days Selection */}
                {!formData.is24x7 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Working Days</label>
                    <div className="grid grid-cols-7 gap-2">
                      {DAYS.map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleDayToggle(day)}
                          className={`p-2 rounded-lg text-sm font-medium ${
                            formData.workDays[day]
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Shift Timings */}
                {!formData.is24x7 && (
                  <div className="space-y-4">
                    {Object.entries(formData.workDays).map(([day, shifts]) => (
                      <div key={day} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">{day}</h4>
                          <button
                            type="button"
                            onClick={() => addShift(day)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        {shifts.map((shift, index) => (
                          <div key={index} className="flex items-center gap-4 mt-2">
                            <input
                              type="time"
                              value={shift.startTime}
                              onChange={(e) => handleTimeChange(day, index, 'startTime', e.target.value)}
                              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                            <span>to</span>
                            <input
                              type="time"
                              value={shift.endTime}
                              onChange={(e) => handleTimeChange(day, index, 'endTime', e.target.value)}
                              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-500">
                              ({Math.floor(shift.durationMinutes / 60)}h {shift.durationMinutes % 60}m)
                            </span>
                            {shifts.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeShift(day, index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {currentSchedule ? 'Update Schedule' : 'Create Schedule'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkScheduleManager; 