import React, { useState, useEffect } from 'react';
import { Calendar, X, Plus, Trash2, Edit } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  createPublicHoliday,
  updatePublicHoliday,
  deletePublicHoliday,
  getHolidaysByCompany,
  getHolidaysByDateRange
} from '../API/apiService';

const PublicHolidayCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [holidays, setHolidays] = useState([]);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [newHoliday, setNewHoliday] = useState({
    holidayName: '',
    date: '',
    duration: 'FULL_DAY',
    calendarName: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const companyId = localStorage.getItem('userId');

  useEffect(() => {
    if (!companyId) {
      toast.error('Company ID not found. Please ensure you are logged in.');
      return;
    }
    fetchHolidays();
  }, [selectedDate, companyId]);

  const fetchHolidays = async () => {
    if (!companyId) return;
    
    try {
      setLoading(true);
      const startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
      let response = await getHolidaysByCompany(companyId);

      if (!response || response.length === 0) {
        response = await getHolidaysByDateRange(
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        );
      }
      setHolidays(response || []);
    } catch (error) {
      console.error('Error fetching holidays:', error);
      toast.error('Failed to load holidays. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (date) => {
    if (!companyId) {
      toast.error('Please log in to add holidays');
      return;
    }
    setSelectedDate(date);
    setShowModal(true);
    setIsEditing(false);
    setSelectedHoliday(null);
    setNewHoliday({
      holidayName: '',
      date: date.toISOString().split('T')[0],
      duration: 'FULL_DAY',
      calendarName: '',
      location: ''
    });
  };

  const handleHolidayClick = (holiday, e) => {
    e.stopPropagation();
    setShowModal(true);
    setIsEditing(true);
    setSelectedHoliday(holiday);
    setNewHoliday({
      ...holiday,
      date: holiday.date.split('T')[0]
    });
  };

  const handleDelete = async () => {
    if (!selectedHoliday || !selectedHoliday.id) {
      toast.error('No holiday selected for deletion');
      return;
    }

    try {
      setLoading(true);
      await deletePublicHoliday(selectedHoliday.id);
      toast.success('Holiday deleted successfully');
      setShowModal(false);
      fetchHolidays();
    } catch (error) {
      console.error('Error deleting holiday:', error);
      toast.error('Failed to delete holiday. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyId) {
      toast.error('Please log in to manage holidays');
      return;
    }
    
    try {
      setLoading(true);
      const holidayData = {
        ...newHoliday,
        companyId,
        year: new Date(newHoliday.date).getFullYear()
      };

      if (isEditing && selectedHoliday) {
        await updatePublicHoliday(selectedHoliday.id, holidayData);
        toast.success('Holiday updated successfully');
      } else {
        await createPublicHoliday(holidayData);
        toast.success('Holiday added successfully');
      }
      setShowModal(false);
      fetchHolidays();
    } catch (error) {
      console.error('Error managing holiday:', error);
      toast.error(`Failed to ${isEditing ? 'update' : 'add'} holiday. Please try again later.`);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(selectedDate);
    const firstDay = getFirstDayOfMonth(selectedDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 w-full" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
      const isSelected = day === selectedDate.getDate();
      const isToday = currentDate.toDateString() === new Date().toDateString();

      const dayHolidays = holidays.filter(holiday => {
        const holidayDate = new Date(holiday.date);
        return holidayDate.getDate() === day &&
               holidayDate.getMonth() === selectedDate.getMonth() &&
               holidayDate.getFullYear() === selectedDate.getFullYear();
      });

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(currentDate)}
          className={`h-24 w-full p-2 rounded-xl text-left transition-all duration-200 border-2 hover:shadow-lg hover:-translate-y-1
            ${isSelected ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-300' : ''}
            ${isToday && !isSelected ? 'bg-gradient-to-br from-emerald-100 to-emerald-50 border-emerald-300' : ''}
            ${!isSelected && !isToday ? 'bg-white border-slate-200 hover:bg-slate-50' : ''}
            ${dayHolidays.length > 0 ? 'ring-2 ring-orange-200' : ''}`}
        >
          <div className="flex flex-col h-full">
            <span className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-slate-800'}`}>{day}</span>
            {dayHolidays.map((holiday) => (
              <div
                key={holiday.id}
                onClick={(e) => handleHolidayClick(holiday, e)}
                className="mt-1 text-xs bg-orange-100 text-orange-800 rounded px-1 py-0.5 cursor-pointer hover:bg-orange-200 flex items-center justify-between"
              >
                <span>{holiday.holidayName}</span>
                <div className="flex items-center space-x-1">
                  <Edit className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </button>
      );
    }

    return days;
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center">
            <Calendar className="w-7 h-7 mr-2 text-blue-600" />
            Public Holiday Calendar
          </h1>
          <p className="text-slate-600 mt-1">Manage public holidays and events for your organization</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">
                {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
              <button
                onClick={() => handleDateClick(selectedDate)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Holiday
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-7 gap-4 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-semibold text-slate-600">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-4">
              {generateCalendarDays()}
            </div>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="flex justify-between items-center p-6 border-b border-slate-200">
                <h3 className="text-xl font-semibold text-slate-800">
                  {isEditing ? 'Edit Public Holiday' : 'Add Public Holiday'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Calendar Name *</label>
                    <input
                      type="text"
                      value={newHoliday.calendarName}
                      onChange={(e) => setNewHoliday({ ...newHoliday, calendarName: e.target.value })}
                      placeholder="Enter calendar name"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Location *</label>
                    <input
                      type="text"
                      value={newHoliday.location}
                      onChange={(e) => setNewHoliday({ ...newHoliday, location: e.target.value })}
                      placeholder="Enter location (e.g., Berlin, London, etc.)"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Holiday Name *</label>
                    <input
                      type="text"
                      value={newHoliday.holidayName}
                      onChange={(e) => setNewHoliday({ ...newHoliday, holidayName: e.target.value })}
                      placeholder="Enter holiday name"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
                    <input
                      type="date"
                      value={newHoliday.date}
                      onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Duration *</label>
                    <div className="space-y-2">
                      {['FULL_DAY', 'MORNING', 'AFTERNOON'].map(duration => (
                        <label key={duration} className="flex items-center">
                          <input
                            type="radio"
                            name="duration"
                            value={duration}
                            checked={newHoliday.duration === duration}
                            onChange={(e) => setNewHoliday({ ...newHoliday, duration: e.target.value })}
                            className="mr-2"
                          />
                          <span className="text-sm text-slate-600">
                            {duration.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  {isEditing && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={loading}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-slate-600 hover:text-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Holiday' : 'Add Holiday')}
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

export default PublicHolidayCalendar;
