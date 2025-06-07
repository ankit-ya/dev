// File: C:\Users\ankit\Desktop\shramikFEModule\src\EmoDashboard\LiveSiteMonitoringPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Wifi,
  WifiOff,
  Eye,
  Shield,
  Building2,
  Signal,
  RefreshCw,
  Filter,
  Search,
  Download,
  Zap,
  Star,
  TrendingUp,
  Bell,
  User,
  Camera,
  Navigation,
  Radio,
  Gauge,
  Target
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getMonitoringWarnings,
  getMonitoringSummary,
  getLastUpdate,
  getGeofenceViolations,
  getBreakViolations,
  getAttendanceTrend,
  getAttendanceStatus,
  getActiveShifts,
  exportMonitoringData
} from '../API/apiService';

// Enhanced dummy monitoring data
const dummyMonitoringData = [
  {
    id: "SITE001",
    siteName: "DLF Cyber City - Tower A",
    location: "Gurgaon, Haryana",
    coordinates: { lat: 28.4942, lng: 77.0891 },
    status: "active",
    guards: [
      {
        id: "G001",
        name: "Ramesh Kumar",
        position: "Main Gate",
        status: "on-duty",
        lastSeen: "2 minutes ago",
        deviceId: "DEV001",
        batteryLevel: 85,
        gpsSignal: "strong"
      },
      {
        id: "G002", 
        name: "Sita Devi",
        position: "Parking Area",
        status: "on-duty",
        lastSeen: "5 minutes ago",
        deviceId: "DEV002",
        batteryLevel: 92,
        gpsSignal: "strong"
      },
      {
        id: "G003",
        name: "Arjun Singh",
        position: "Reception",
        status: "break",
        lastSeen: "15 minutes ago",
        deviceId: "DEV003",
        batteryLevel: 67,
        gpsSignal: "moderate"
      }
    ],
    alerts: [
      {
        id: "A001",
        type: "attendance",
        message: "G003 (Arjun Singh) on extended break",
        severity: "warning",
        timestamp: "10 minutes ago"
      }
    ],
    checkpoints: 8,
    completedRounds: 12,
    totalRounds: 15,
    connectivity: "online",
    lastUpdate: "30 seconds ago"
  },
  {
    id: "SITE002",
    siteName: "Infosys SEZ Campus",
    location: "Bangalore, Karnataka", 
    coordinates: { lat: 12.9716, lng: 77.5946 },
    status: "active",
    guards: [
      {
        id: "G004",
        name: "Vikash Patel",
        position: "Entrance Security",
        status: "on-duty",
        lastSeen: "1 minute ago",
        deviceId: "DEV004",
        batteryLevel: 76,
        gpsSignal: "strong"
      },
      {
        id: "G005",
        name: "Sunita Sharma", 
        position: "Building B",
        status: "on-duty",
        lastSeen: "3 minutes ago",
        deviceId: "DEV005",
        batteryLevel: 88,
        gpsSignal: "strong"
      }
    ],
    alerts: [],
    checkpoints: 12,
    completedRounds: 18,
    totalRounds: 20,
    connectivity: "online",
    lastUpdate: "15 seconds ago"
  },
  {
    id: "SITE003",
    siteName: "Tech Mahindra - Pune Office",
    location: "Pune, Maharashtra",
    coordinates: { lat: 18.5204, lng: 73.8567 },
    status: "warning",
    guards: [
      {
        id: "G006",
        name: "Ravi Kumar",
        position: "Gate 1",
        status: "offline",
        lastSeen: "45 minutes ago",
        deviceId: "DEV006",
        batteryLevel: 15,
        gpsSignal: "weak"
      }
    ],
    alerts: [
      {
        id: "A002",
        type: "device",
        message: "DEV006 battery critically low",
        severity: "critical",
        timestamp: "30 minutes ago"
      },
      {
        id: "A003",
        type: "communication",
        message: "G006 (Ravi Kumar) no response for 45 mins",
        severity: "critical",
        timestamp: "45 minutes ago"
      }
    ],
    checkpoints: 6,
    completedRounds: 4,
    totalRounds: 8,
    connectivity: "poor",
    lastUpdate: "45 minutes ago"
  },
  {
    id: "SITE004",
    siteName: "TCS Innovation Center",
    location: "Chennai, Tamil Nadu",
    coordinates: { lat: 13.0827, lng: 80.2707 },
    status: "active",
    guards: [
      {
        id: "G007",
        name: "Priya Sharma",
        position: "Main Security",
        status: "on-duty",
        lastSeen: "1 minute ago",
        deviceId: "DEV007",
        batteryLevel: 91,
        gpsSignal: "strong"
      },
      {
        id: "G008",
        name: "Amit Gupta",
        position: "Perimeter",
        status: "on-duty", 
        lastSeen: "4 minutes ago",
        deviceId: "DEV008",
        batteryLevel: 83,
        gpsSignal: "strong"
      }
    ],
    alerts: [],
    checkpoints: 10,
    completedRounds: 14,
    totalRounds: 16,
    connectivity: "online",
    lastUpdate: "20 seconds ago"
  }
];

// Helper functions
const getStatusColor = (status) => {
  switch (status) {
    case 'active': return 'text-emerald-600 bg-emerald-100';
    case 'warning': return 'text-amber-600 bg-amber-100';
    case 'critical': return 'text-red-600 bg-red-100';
    case 'offline': return 'text-slate-600 bg-slate-100';
    default: return 'text-slate-600 bg-slate-100';
  }
};

const getGuardStatusColor = (status) => {
  switch (status) {
    case 'on-duty': return 'text-emerald-600 bg-emerald-100';
    case 'break': return 'text-amber-600 bg-amber-100';
    case 'offline': return 'text-red-600 bg-red-100';
    default: return 'text-slate-600 bg-slate-100';
  }
};

const getSignalStrength = (signal) => {
  switch (signal) {
    case 'strong': return { icon: Signal, color: 'text-emerald-600', bars: 4 };
    case 'moderate': return { icon: Signal, color: 'text-amber-600', bars: 3 };
    case 'weak': return { icon: Signal, color: 'text-red-600', bars: 2 };
    default: return { icon: WifiOff, color: 'text-slate-400', bars: 0 };
  }
};

const getBatteryColor = (level) => {
  if (level > 60) return 'text-emerald-600 bg-emerald-100';
  if (level > 30) return 'text-amber-600 bg-amber-100';
  return 'text-red-600 bg-red-100';
};

// Main Component
export default function LiveSiteMonitoringPage() {
  const [sites, setSites] = useState(dummyMonitoringData);
  const [loading, setLoading] = useState(true);
  const [expandedSite, setExpandedSite] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({
    activeSites: 0,
    shiftsInProgress: 0,
    employeesOnSite: 0,
    employeesAway: 0,
    pendingCheckIns: 0,
    overdueBreaks: 0,
    absentEmployees: 0,
    leaveEmployees: 0
  });
  const [warnings, setWarnings] = useState([]);
  const [history, setHistory] = useState([]);
  const [location, setLocation] = useState('All');
  const [shift, setShift] = useState('All');

  // Fetch monitoring data
  const fetchMonitoringData = async () => {
    try {
      setLoading(true);
      setError(null);

      const date = new Date().toISOString().split('T')[0];
      const currentLocation = location === 'All' ? null : location;
      const currentShift = shift === 'All' ? null : shift;

      const [
        summaryRes,
        warningsRes,
        activeShiftsRes,
        attendanceStatusRes,
        breakViolationsRes,
        geofenceViolationsRes
      ] = await Promise.all([
        getMonitoringSummary(date, currentLocation, currentShift),
        getMonitoringWarnings(date, currentLocation),
        getActiveShifts(date, currentLocation),
        getAttendanceStatus(date, currentLocation, currentShift),
        getBreakViolations(date, currentLocation),
        getGeofenceViolations(date, currentLocation)
      ]);

      if (summaryRes.resCode === 0 && summaryRes.res) {
        setSites(summaryRes.res);
        toast.success('Monitoring data refreshed successfully');
      } else {
        throw new Error(summaryRes.resMsg || 'Failed to fetch monitoring data');
      }
    } catch (err) {
      console.error('Error fetching monitoring data:', err);
      setError(err.message || 'Failed to fetch monitoring data');
      toast.error('Failed to refresh monitoring data');
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchMonitoringData();
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      setLastRefresh(new Date());
      fetchMonitoringData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Handle export
  const handleDownload = async (format) => {
    try {
      const date = new Date().toISOString().split('T')[0];
      const currentLocation = location === 'All' ? null : location;
      const currentShift = shift === 'All' ? null : shift;

      const response = await exportMonitoringData(date, currentLocation, currentShift, format);
      
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `monitoring_${date}_${format}.${format.toLowerCase()}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error exporting data:', err);
      setError('Failed to export data');
    }
  };

  // Site Card Component
  const SiteCard = ({ site, isExpanded, onToggle }) => {
    const statusColor = getStatusColor(site.status);
    const activeGuards = site.guards.filter(g => g.status === 'on-duty').length;
    const criticalAlerts = site.alerts.filter(a => a.severity === 'critical').length;
    const roundProgress = (site.completedRounds / site.totalRounds) * 100;

    return (
      <div className="bg-white border border-slate-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">{site.siteName}</h3>
                <p className="text-slate-600 text-sm flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {site.location}
                </p>
                <div className="flex items-center space-x-3 mt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${statusColor}`}>
                    {site.status === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
                    {site.status === 'warning' && <AlertTriangle className="w-3 h-3 mr-1" />}
                    {site.status === 'critical' && <AlertTriangle className="w-3 h-3 mr-1" />}
                    {site.status.toUpperCase()}
                  </span>
                  
                  <div className="flex items-center space-x-1 text-xs text-slate-500">
                    {site.connectivity === 'online' ? (
                      <Wifi className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <WifiOff className="w-3 h-3 text-red-600" />
                    )}
                    <span>{site.connectivity}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {activeGuards}/{site.guards.length}
              </div>
              <p className="text-sm text-slate-500">Guards Active</p>
              <button
                onClick={() => onToggle(site.id)}
                className="mt-2 p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-50 rounded-xl">
              <p className="text-xs text-blue-600 font-medium">Checkpoints</p>
              <p className="text-sm font-bold text-blue-800">{site.checkpoints}</p>
            </div>
            <div className="text-center p-3 bg-emerald-50 rounded-xl">
              <p className="text-xs text-emerald-600 font-medium">Rounds</p>
              <p className="text-sm font-bold text-emerald-800">{site.completedRounds}/{site.totalRounds}</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-xl">
              <p className="text-xs text-red-600 font-medium">Alerts</p>
              <p className="text-sm font-bold text-red-800">{site.alerts.length}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-600">Round Progress</span>
              <span className="text-sm font-bold text-emerald-600">{roundProgress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${roundProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Critical Alerts */}
          {criticalAlerts > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center text-red-700">
                <AlertTriangle className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">{criticalAlerts} Critical Alert{criticalAlerts > 1 ? 's' : ''}</span>
              </div>
            </div>
          )}

          {isExpanded && (
            <div className="border-t border-slate-200 pt-4 space-y-4">
              {/* Guards List */}
              <div>
                <h4 className="font-semibold text-slate-800 mb-3 flex items-center">
                  <Users className="w-4 h-4 mr-2 text-blue-600" />
                  Security Personnel ({site.guards.length})
                </h4>
                <div className="space-y-3">
                  {site.guards.map(guard => {
                    const statusColor = getGuardStatusColor(guard.status);
                    const batteryColor = getBatteryColor(guard.batteryLevel);
                    const signal = getSignalStrength(guard.gpsSignal);
                    
                    return (
                      <div key={guard.id} className="bg-slate-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                              {guard.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-slate-800">{guard.name}</p>
                              <p className="text-xs text-slate-500">{guard.id} • {guard.position}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${statusColor}`}>
                              {guard.status}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-600">Last Seen:</span>
                            <span className="font-medium">{guard.lastSeen}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-600">Battery:</span>
                            <span className={`font-medium px-2 py-1 rounded ${batteryColor}`}>
                              {guard.batteryLevel}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-600">GPS:</span>
                            <span className={`flex items-center ${signal.color}`}>
                              <signal.icon className="w-3 h-3 mr-1" />
                              <span className="font-medium">{guard.gpsSignal}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Alerts */}
              {site.alerts.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3 flex items-center">
                    <Bell className="w-4 h-4 mr-2 text-red-600" />
                    Active Alerts ({site.alerts.length})
                  </h4>
                  <div className="space-y-2">
                    {site.alerts.map(alert => {
                      const alertColor = alert.severity === 'critical' 
                        ? 'border-red-200 bg-red-50 text-red-700'
                        : 'border-amber-200 bg-amber-50 text-amber-700';
                      
                      return (
                        <div key={alert.id} className={`p-3 border rounded-xl ${alertColor}`}>
                          <div className="flex items-start space-x-2">
                            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{alert.message}</p>
                              <p className="text-xs opacity-75 mt-1">{alert.timestamp}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Site Metrics */}
              <div>
                <h4 className="font-semibold text-slate-800 mb-3 flex items-center">
                  <Activity className="w-4 h-4 mr-2 text-purple-600" />
                  Site Metrics
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-purple-50 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-purple-600">Last Update</span>
                      <Clock className="w-4 h-4 text-purple-600" />
                    </div>
                    <p className="text-sm font-bold text-purple-800 mt-1">{site.lastUpdate}</p>
                  </div>
                  <div className="bg-indigo-50 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-indigo-600">Site ID</span>
                      <Target className="w-4 h-4 text-indigo-600" />
                    </div>
                    <p className="text-sm font-bold text-indigo-800 mt-1">{site.id}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Summary Statistics Component
  const StatCard = ({ icon: Icon, label, value, subValue, color = "blue", trend }) => {
    const colorClasses = {
      blue: "bg-blue-50 border-blue-200 text-blue-600",
      emerald: "bg-emerald-50 border-emerald-200 text-emerald-600", 
      amber: "bg-amber-50 border-amber-200 text-amber-600",
      red: "bg-red-50 border-red-200 text-red-600",
      purple: "bg-purple-50 border-purple-200 text-purple-600"
    };

    return (
      <div className={`border rounded-2xl p-6 ${colorClasses[color]} transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl bg-white shadow-sm">
            <Icon className="w-6 h-6" />
          </div>
          {trend && (
            <div className="flex items-center space-x-1 text-xs font-medium">
              <TrendingUp className="w-3 h-3" />
              <span>{trend}</span>
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-medium opacity-75 mb-1">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subValue && <p className="text-xs opacity-75 mt-1">{subValue}</p>}
        </div>
      </div>
    );
  };

  // Filtered sites
  const filteredSites = useMemo(() => {
    let filtered = sites;
    
    if (searchTerm.trim()) {
      filtered = filtered.filter(site =>
        site.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(site => site.status === statusFilter);
    }
    
    return filtered;
  }, [sites, searchTerm, statusFilter]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalSites = sites.length;
    const activeSites = sites.filter(s => s.status === 'active').length;
    const totalGuards = sites.reduce((sum, s) => sum + s.guards.length, 0);
    const activeGuards = sites.reduce((sum, s) => sum + s.guards.filter(g => g.status === 'on-duty').length, 0);
    const totalAlerts = sites.reduce((sum, s) => sum + s.alerts.length, 0);
    const criticalAlerts = sites.reduce((sum, s) => sum + s.alerts.filter(a => a.severity === 'critical').length, 0);
    const offlineGuards = sites.reduce((sum, s) => sum + s.guards.filter(g => g.status === 'offline').length, 0);
    
    return {
      totalSites,
      activeSites,
      totalGuards,
      activeGuards,
      totalAlerts,
      criticalAlerts,
      offlineGuards,
      sitesOnline: sites.filter(s => s.connectivity === 'online').length
    };
  }, [sites]);

  const toggleSiteExpand = (siteId) => {
    setExpandedSite(expandedSite === siteId ? null : siteId);
  };

  const handleRefresh = () => {
    fetchMonitoringData();
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-slate-200 rounded w-1/3"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6">
                <div className="animate-pulse space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
                    <div className="w-8 h-4 bg-slate-200 rounded"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                    <div className="h-8 bg-slate-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-6">
          <div className="flex flex-col lg:flex-row justify-between gap-4 items-start lg:items-center">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-emerald-600 rounded-xl">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Live Site Monitoring
                </h1>
              </div>
              <p className="text-slate-600 font-medium">
                Real-time monitoring and tracking of security personnel across all sites
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center space-x-2 bg-emerald-100 px-4 py-2 rounded-xl">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-emerald-700 font-medium text-sm">
                  Live • Updated {lastRefresh.toLocaleTimeString()}
                </span>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
                >
                  <Filter size={18} />
                  <span>Filters</span>
                </button>
                
                <button
                  onClick={handleRefresh}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
                >
                  <RefreshCw size={18} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Filter className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-800">Filters & Controls</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Search Sites</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, location, or ID..."
                    className="w-full pl-10 pr-4 py-2 border-2 border-slate-200 bg-white rounded-xl focus:outline-none focus:border-blue-500 transition-all duration-200"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Status Filter</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-slate-200 bg-white rounded-xl focus:outline-none focus:border-blue-500 transition-all duration-200"
                >
                  <option value="all">All Sites</option>
                  <option value="active">Active</option>
                  <option value="warning">Warning</option>
                  <option value="critical">Critical</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Auto Refresh</label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      autoRefresh ? 'bg-emerald-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        autoRefresh ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-slate-600">
                    {autoRefresh ? 'On (30s)' : 'Off'}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Export Data</label>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-all duration-200"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <StatCard
            icon={Building2}
            label="Total Sites"
            value={statistics.totalSites}
            subValue={`${statistics.activeSites} active`}
            color="blue"
          />
          <StatCard
            icon={Users}
            label="Total Guards"
            value={statistics.totalGuards}
            subValue={`${statistics.activeGuards} on duty`}
            color="emerald"
          />
          <StatCard
            icon={Shield}
            label="Online Sites"
            value={statistics.sitesOnline}
            subValue={`${((statistics.sitesOnline / statistics.totalSites) * 100).toFixed(0)}% connectivity`}
            color="purple"
          />
          <StatCard
            icon={AlertTriangle}
            label="Active Alerts"
            value={statistics.totalAlerts}
            subValue={`${statistics.criticalAlerts} critical`}
            color="amber"
          />
          <StatCard
            icon={WifiOff}
            label="Offline Guards"
            value={statistics.offlineGuards}
            subValue="Need attention"
            color="red"
          />
        </div>

        {/* Sites List */}
        <div className="space-y-6">
          {filteredSites.length === 0 ? (
            <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg p-12 text-center">
              <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 mb-2">No sites found</h3>
              <p className="text-slate-500">Try adjusting your search criteria or filters</p>
            </div>
          ) : (
            <>
              {/* Results Header */}
              <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-slate-600">Monitoring</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-bold">
                      {filteredSites.length}
                    </span>
                    <span className="text-sm font-medium text-slate-600">
                      {filteredSites.length === 1 ? 'site' : 'sites'}
                    </span>
                    
                    {(statusFilter !== 'all' || searchTerm) && (
                      <div className="flex items-center space-x-2">
                        {statusFilter !== 'all' && (
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium">
                            {statusFilter}
                          </span>
                        )}
                        {searchTerm && (
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                            "{searchTerm}"
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-sm text-slate-500">
                    Last refresh: {lastRefresh.toLocaleTimeString()}
                  </div>
                </div>
              </div>

              {/* Site Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredSites.map(site => (
                  <SiteCard
                    key={site.id}
                    site={site}
                    isExpanded={expandedSite === site.id}
                    onToggle={toggleSiteExpand}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}

        {/* Quick Tips */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl shadow-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Monitoring Tips</h3>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Monitor guard status and battery levels to ensure continuous coverage</li>
                <li>• Set up auto-refresh for real-time updates every 30 seconds</li>
                <li>• Export monitoring data for compliance reporting and analysis</li>
                <li>• Pay attention to critical alerts and offline guards for immediate action</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}