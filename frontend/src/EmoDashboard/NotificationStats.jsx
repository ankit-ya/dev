// ✅ NotificationStats.jsx
import React, { useEffect, useState } from 'react';
import { getNotificationStats } from '../API/apiService';

const NotificationStats = () => {
  const [stats, setStats] = useState({ sent: 0, read: 0, unread: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getNotificationStats();
        setStats(res.data.res || {});
      } catch (err) {
        console.error('❌ Failed to fetch stats', err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">📊 Notification Stats</h2>
      <ul className="space-y-2">
        <li>📨 Sent: {stats.sent || 0}</li>
        <li>✅ Read: {stats.read || 0}</li>
        <li>📭 Unread: {stats.unread || 0}</li>
      </ul>
    </div>
  );
};

export default NotificationStats;
