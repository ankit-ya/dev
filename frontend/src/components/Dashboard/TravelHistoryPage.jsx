import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Navigation, 
  Route, 
  Target, 
  Plus, 
  Filter,
  BarChart3,
  Download,
  User,
  Car,
  Plane,
  Train,
  Coffee,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Globe
} from "lucide-react";
import {
  trackLocation,
  checkLocationBoundaries,
  getTravelHistory,
  startTrip,
  endTrip,
  getActiveTrips,
  getTravelExpenseSummary
} from "../../API/apiService";

const TravelHistoryPage = () => {
  // Get user data from localStorage
  const getUserData = () => {
    const userData = localStorage.getItem("user");
    const profileData = localStorage.getItem("profileData");
    
    let user = null;
    if (userData) {
      try {
        user = JSON.parse(userData);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    
    if (profileData) {
      try {
        const profile = JSON.parse(profileData);
        user = { ...user, ...profile };
      } catch (e) {
        console.error('Error parsing profile data:', e);
      }
    }
    
    return user;
  };

  const currentUser = getUserData();
  const userName = currentUser ? 
    `${currentUser.firstName || currentUser.fullName || currentUser.name || 'Unknown'} ${currentUser.lastName || ''}`.trim() : 
    "Unknown User";
  const employeeId = currentUser?.id || currentUser?.userId || currentUser?.username || localStorage.getItem("userId");

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [travelData, setTravelData] = useState([]);
  const [activeTrips, setActiveTrips] = useState([]);
  const [expenseSummary, setExpenseSummary] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [transport, setTransport] = useState("car");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTransport, setFilterTransport] = useState("all");
  const [viewMode, setViewMode] = useState("list"); // list, map
  const [loading, setLoading] = useState(false);
  const [currentTrip, setCurrentTrip] = useState(null);

  // Fetch travel data when component mounts or date changes
  useEffect(() => {
    if (employeeId) {
      fetchTravelData();
      fetchActiveTrips();
      fetchExpenseSummary();
    }
  }, [employeeId, selectedDate]);

  const fetchTravelData = async () => {
    try {
      setLoading(true);
      const startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
      
      // Format dates as YYYY-MM-DD
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      
      const response = await getTravelHistory(
        employeeId,
        formattedStartDate,
        formattedEndDate
      );
      
      if (response?.status === 200 && response?.data) {
        setTravelData(response.data);
        if (response.message) {
          toast.success(response.message);
        }
      } else {
        setTravelData([]);
        throw new Error(response?.message || 'Failed to load travel history');
      }
    } catch (error) {
      console.error('Error fetching travel data:', error);
      toast.error(error.message || 'Failed to load travel history');
      setTravelData([]);
      
      // If there's an authentication error, redirect to login
      if (error.status === 401) {
        // Handle unauthorized access
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveTrips = async () => {
    try {
      const response = await getActiveTrips(employeeId);
      const hasActiveTrips = response && response.length > 0;
      setActiveTrips(response || []);
      
      // Update check-in state and current trip based on active trips
      if (hasActiveTrips) {
        setIsCheckedIn(true);
        setCurrentTrip(response[0]);
      } else {
        setIsCheckedIn(false);
        setCurrentTrip(null);
      }
    } catch (error) {
      console.error('Error fetching active trips:', error);
      toast.error('Failed to load active trips');
      setIsCheckedIn(false);
      setCurrentTrip(null);
      setActiveTrips([]);
    }
  };

  // Add effect to sync states when activeTrips changes
  useEffect(() => {
    const hasActiveTrips = activeTrips && activeTrips.length > 0;
    setIsCheckedIn(hasActiveTrips);
    setCurrentTrip(hasActiveTrips ? activeTrips[0] : null);
  }, [activeTrips]);

  const fetchExpenseSummary = async () => {
    try {
      const startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
      
      // Format dates as YYYY-MM-DD
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      
      const response = await getTravelExpenseSummary(
        employeeId,
        formattedStartDate,
        formattedEndDate
      );
      
      if (response?.status === 200 && response?.data) {
        const summaryData = response.data;
        setExpenseSummary({
          totalExpense: summaryData.totalExpense || 0,
          totalDistance: summaryData.totalDistance || 0,
          totalTrips: summaryData.totalTrips || 0,
          expenseByTransportMode: summaryData.expenseByTransportMode || {},
          averageExpensePerTrip: summaryData.averageExpensePerTrip || 0,
          startDate: formattedStartDate,
          endDate: formattedEndDate
        });
        if (response.message) {
          toast.success(response.message);
        }
      } else {
        setExpenseSummary({
          totalExpense: 0,
          totalDistance: 0,
          totalTrips: 0,
          expenseByTransportMode: {},
          averageExpensePerTrip: 0,
          startDate: formattedStartDate,
          endDate: formattedEndDate
        });
        throw new Error(response?.message || 'Failed to load expense summary');
      }
    } catch (error) {
      console.error('Error fetching expense summary:', error);
      toast.error(error.message || 'Failed to load expense summary');
      setExpenseSummary({
        totalExpense: 0,
        totalDistance: 0,
        totalTrips: 0,
        expenseByTransportMode: {},
        averageExpensePerTrip: 0,
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd')
      });
      
      // If there's an authentication error, redirect to login
      if (error.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
  };

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        }
      );
    });
  };

  const handleCheckInOut = async () => {
    try {
      setLoading(true);
      const location = await getCurrentLocation();
      setCurrentLocation(location);

      // Check if location is within boundaries
      const isWithinBoundaries = await checkLocationBoundaries(
        employeeId,
        location.latitude,
        location.longitude
      );

      if (!isWithinBoundaries) {
        toast.error('You are outside the allowed work area');
        return;
      }

      // Check current active trips
      const activeTripsResponse = await getActiveTrips(employeeId);
      const hasActiveTrip = activeTripsResponse && activeTripsResponse.length > 0;

      if (!hasActiveTrip) {
        // Start new trip
        const tripData = {
          employeeId,
          employeeName: userName,
          startLocation: {
            employeeId,
            latitude: location.latitude,
            longitude: location.longitude,
            timestamp: new Date().toISOString()
          },
          purpose: reason || 'Work Visit',
          transportMode: transport.toUpperCase(),
          status: 'STARTED'
        };
        
        const response = await startTrip(tripData);
        if (response?.data) {
          setCurrentTrip(response.data);
          setIsCheckedIn(true);
          toast.success('Trip started successfully');
        } else {
          throw new Error('Invalid response from server');
        }
      } else if (currentTrip?.id) {
        // End current trip
        const endLocation = {
          employeeId,
          latitude: location.latitude,
          longitude: location.longitude,
          timestamp: new Date().toISOString()
        };
        
        await endTrip(currentTrip.id, endLocation);
        setCurrentTrip(null);
        setIsCheckedIn(false);
        toast.success('Trip ended successfully');
      }

      await trackLocation({
        employeeId,
        ...location,
        timestamp: new Date().toISOString(),
        type: hasActiveTrip ? 'CHECKOUT' : 'CHECKIN'
      });

      // Refresh data
      await fetchActiveTrips();
      await fetchTravelData();
      await fetchExpenseSummary();
    } catch (error) {
      console.error('Error during check-in/out:', error);
      // Show the specific error message from the server if available
      const errorMessage = error.resMsg || error.message || 'Failed to process check-in/out';
      toast.error(errorMessage);
      
      // Refresh active trips to ensure UI is in sync
      await fetchActiveTrips();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitVisit = async () => {
    if (!reason || !selectedLocation) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const location = await getCurrentLocation();

      const tripData = {
        employeeId,
        employeeName: userName,
        startLocation: {
          employeeId,
          latitude: location.latitude,
          longitude: location.longitude,
          locationName: selectedLocation,
          timestamp: new Date().toISOString()
        },
        purpose: reason,
        transportMode: transport.toUpperCase(),
        status: 'STARTED',
        notes: feedback
      };

      const response = await startTrip(tripData);
      if (response?.data) {
        setCurrentTrip(response.data);
        toast.success('New visit started successfully');

        // Reset form
        setReason('');
        setSelectedLocation('');
        setFeedback('');
        
        // Refresh data
        fetchTravelData();
        fetchActiveTrips();
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error adding new visit:', error);
      toast.error(error.message || 'Failed to add new visit');
    } finally {
      setLoading(false);
    }
  };

  const formattedDate = format(selectedDate, "dd MMM yyyy");

  // Filter travel data
  const filteredTravelData = travelData.filter(item => {
    const statusMatch = filterStatus === "all" || item.status === filterStatus;
    const transportMatch = filterTransport === "all" || item.transport === filterTransport;
    return statusMatch && transportMatch;
  });

  // Calculate statistics from real data
  const getStats = () => {
    if (!travelData.length || !expenseSummary) {
      return {
        totalVisits: 0,
        totalDistance: 0,
        totalExpenses: 0,
        completed: 0,
        ongoing: 0,
        scheduled: 0
      };
    }

    return {
      totalVisits: travelData.length,
      totalDistance: expenseSummary.totalDistance || 0,
      totalExpenses: expenseSummary.totalExpenses || 0,
      completed: travelData.filter(t => t.status === 'COMPLETED').length,
      ongoing: activeTrips.length,
      scheduled: travelData.filter(t => t.status === 'SCHEDULED').length
    };
  };

  const stats = getStats();

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "ongoing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "scheduled":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const getTransportIcon = (transport) => {
    switch (transport) {
      case "car": return <Car className="w-4 h-4" />;
      case "flight": return <Plane className="w-4 h-4" />;
      case "metro": case "train": return <Train className="w-4 h-4" />;
      default: return <Navigation className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "office": return <Target className="w-5 h-5 text-blue-600" />;
      case "client": return <User className="w-5 h-5 text-purple-600" />;
      case "meeting": return <Coffee className="w-5 h-5 text-amber-600" />;
      case "travel": return <Plane className="w-5 h-5 text-green-600" />;
      default: return <MapPin className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Travel History
              </h1>
              <p className="text-slate-600 mt-1">Track your business travel and locations</p>
              <p className="text-sm text-slate-500 mt-1">Employee: {userName} | ID: {employeeId}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors duration-200 text-sm font-medium">
                <Download className="w-4 h-4" />
                Export Report
              </button>
              <div className="flex items-center bg-white border border-slate-300 rounded-lg">
                <button 
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-2 text-sm font-medium rounded-l-lg transition-colors duration-200 ${
                    viewMode === "list" ? "bg-blue-500 text-white" : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  List View
                </button>
                <button 
                  onClick={() => setViewMode("map")}
                  className={`px-3 py-2 text-sm font-medium rounded-r-lg transition-colors duration-200 ${
                    viewMode === "map" ? "bg-blue-500 text-white" : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  Map View
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Visits</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalVisits}</p>
                  <p className="text-blue-100 text-sm mt-1">This month</p>
                </div>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Distance Traveled</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{stats.totalDistance.toFixed(1)} km</p>
                  <p className="text-slate-500 text-sm mt-1">Total distance</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Route className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Travel Expenses</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">₹{stats.totalExpenses.toLocaleString()}</p>
                  <p className="text-slate-500 text-sm mt-1">This month</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Completed</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{stats.completed}</p>
                  <p className="text-slate-500 text-sm mt-1">Out of {stats.totalVisits}</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Check-in/Out Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Current Status</h3>
                  <p className="text-slate-600 text-sm">Travel History - {formattedDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <input
                  type="date"
                  value={selectedDate.toISOString().split("T")[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={handleCheckInOut}
                  disabled={loading}
                  className={`px-6 py-2 text-white font-semibold rounded-lg transition-all duration-200 ${
                    isCheckedIn 
                      ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700" 
                      : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  } disabled:opacity-50`}
                >
                  {loading ? "Processing..." : isCheckedIn ? "Check-out" : "Check-in"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-200">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-slate-600 text-sm font-medium">Check-in</p>
                <p className="text-xl font-bold text-slate-800 mt-1">09:00 AM</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-slate-600 text-sm font-medium">Check-out</p>
                <p className="text-xl font-bold text-slate-800 mt-1">05:30 PM</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-slate-600 text-sm font-medium">Total Distance</p>
                <p className="text-xl font-bold text-slate-800 mt-1">10.2 km</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-slate-400" />
                <h3 className="text-lg font-semibold text-slate-800">Filters</h3>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="scheduled">Scheduled</option>
                </select>

                <select 
                  value={filterTransport} 
                  onChange={(e) => setFilterTransport(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Transport</option>
                  <option value="car">Car</option>
                  <option value="metro">Metro</option>
                  <option value="taxi">Taxi</option>
                  <option value="flight">Flight</option>
                </select>
              </div>
            </div>
          </div>

          {/* Content based on view mode */}
          {viewMode === "list" ? (
            /* Travel List */
            <div className="space-y-6">
              {filteredTravelData.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-slate-200">
                  <Globe className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-800 mb-2">No Travel Records Found</h3>
                  <p className="text-slate-600">No travel records match your current filters.</p>
                </div>
              ) : (
                filteredTravelData.map((location) => (
                  <div key={location.id} className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow duration-200">
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                            {getTypeIcon(location.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-semibold text-slate-800">{location.name}</h3>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(location.status)}`}>
                                {location.status}
                              </span>
                            </div>
                            <p className="text-slate-600 mb-3">{location.purpose}</p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-slate-400" />
                                <span className="text-slate-600">
                                  {location.checkIn} - {location.checkOut}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Route className="w-4 h-4 text-slate-400" />
                                <span className="text-slate-600">{location.distance}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {getTransportIcon(location.transport)}
                                <span className="text-slate-600 capitalize">{location.transport}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-slate-500 mb-1">Expenses</p>
                          <p className="text-2xl font-bold text-slate-800">₹{location.expenses}</p>
                          <p className="text-sm text-slate-500 mt-1">{location.date}</p>
                        </div>
                      </div>

                      {location.notes && (
                        <div className="mt-6 pt-6 border-t border-slate-200">
                          <h4 className="text-sm font-medium text-slate-800 mb-2">Notes</h4>
                          <p className="text-sm text-slate-600">{location.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Map View */
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-200 bg-slate-50">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-blue-600" />
                  Travel Route Map
                </h3>
                <p className="text-slate-600 text-sm mt-1">Visual representation of your travel locations</p>
              </div>
              <div className="h-[500px] w-full">
                <MapContainer
                  center={[filteredTravelData[0]?.lat || 28.6139, filteredTravelData[0]?.lng || 77.209]}
                  zoom={11}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />
                  <Polyline 
                    positions={filteredTravelData.map((c) => [c.lat, c.lng])} 
                    color="#3b82f6" 
                    weight={3}
                    opacity={0.7}
                  />
                  {filteredTravelData.map((location) => (
                    <Marker position={[location.lat, location.lng]} key={location.id}>
                      <Popup className="custom-popup">
                        <div className="p-2">
                          <h4 className="font-semibold text-slate-800 mb-2">{location.name}</h4>
                          <div className="space-y-1 text-sm">
                            <p className="text-slate-600"><strong>Purpose:</strong> {location.purpose}</p>
                            <p className="text-slate-600"><strong>Time:</strong> {location.checkIn} - {location.checkOut}</p>
                            <p className="text-slate-600"><strong>Distance:</strong> {location.distance}</p>
                            <p className="text-slate-600"><strong>Transport:</strong> {location.transport}</p>
                            <p className="text-slate-600"><strong>Expenses:</strong> ₹{location.expenses}</p>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(location.status)} mt-2`}>
                              {location.status}
                            </span>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>
          )}

          {/* Add New Visit Form */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Plus className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Add New Visit</h3>
                <p className="text-slate-600 text-sm">Record a new travel location</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Location Name *</label>
                  <input
                    type="text"
                    placeholder="Enter location name"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Purpose of Visit *</label>
                  <input
                    type="text"
                    placeholder="Reason for visit"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Mode of Transport</label>
                  <select
                    value={transport}
                    onChange={(e) => setTransport(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="car">Car</option>
                    <option value="metro">Metro</option>
                    <option value="taxi">Taxi</option>
                    <option value="flight">Flight</option>
                    <option value="train">Train</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Notes/Feedback</label>
                  <textarea
                    placeholder="Additional notes or feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                  />
                </div>

                <button
                  onClick={handleSubmitVisit}
                  disabled={loading || !reason || !selectedLocation}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Adding Visit..." : "Add Visit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelHistoryPage;
