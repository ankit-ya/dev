import React, { useState, useEffect } from 'react';
import { 
  MdWifi, 
  MdWifiOff, 
  MdSignalWifi1Bar, 
  MdSignalWifi2Bar, 
  MdSignalWifi4Bar 
} from 'react-icons/md';

const StatusIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionQuality, setConnectionQuality] = useState('excellent');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Mock connection quality detection
    const checkConnectionQuality = () => {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (connection) {
        const { effectiveType } = connection;
        switch (effectiveType) {
          case 'slow-2g':
          case '2g':
            setConnectionQuality('poor');
            break;
          case '3g':
            setConnectionQuality('fair');
            break;
          case '4g':
            setConnectionQuality('good');
            break;
          default:
            setConnectionQuality('excellent');
        }
      }
    };

    checkConnectionQuality();
    const interval = setInterval(checkConnectionQuality, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const getConnectionIcon = () => {
    if (!isOnline) return <MdWifiOff className="w-4 h-4 text-red-500" />;
    
    switch (connectionQuality) {
      case 'poor':
        return <MdSignalWifi1Bar className="w-4 h-4 text-red-500" />;
      case 'fair':
        return <MdSignalWifi2Bar className="w-4 h-4 text-amber-500" />;
      case 'good':
        return <MdSignalWifi4Bar className="w-4 h-4 text-emerald-500" />;
      default:
        return <MdWifi className="w-4 h-4 text-emerald-500" />;
    }
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    return `Online • ${connectionQuality.charAt(0).toUpperCase() + connectionQuality.slice(1)}`;
  };

  const getStatusColor = () => {
    if (!isOnline) return 'text-red-600 bg-red-50 border-red-200';
    
    switch (connectionQuality) {
      case 'poor':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'fair':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'good':
      case 'excellent':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className={`fixed bottom-6 left-6 z-30 hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 backdrop-blur-sm shadow-lg ${getStatusColor()}`}>
      {getConnectionIcon()}
      <span className="text-xs font-medium">{getStatusText()}</span>
      
      {/* Connection quality indicator dots */}
      <div className="flex items-center gap-1 ml-2">
        <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-current' : 'bg-slate-300'}`}></div>
        <div className={`w-1.5 h-1.5 rounded-full ${isOnline && ['fair', 'good', 'excellent'].includes(connectionQuality) ? 'bg-current' : 'bg-slate-300'}`}></div>
        <div className={`w-1.5 h-1.5 rounded-full ${isOnline && ['good', 'excellent'].includes(connectionQuality) ? 'bg-current' : 'bg-slate-300'}`}></div>
        <div className={`w-1.5 h-1.5 rounded-full ${isOnline && connectionQuality === 'excellent' ? 'bg-current' : 'bg-slate-300'}`}></div>
      </div>
    </div>
  );
};

export default StatusIndicator; 