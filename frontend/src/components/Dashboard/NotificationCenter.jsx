import React, { useEffect, useState } from "react";
import {
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../../API/apiService";

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    const res = await getUserNotifications();
    setNotifications(res.data.res.notifications || []);

  };

  const fetchUnreadCount = async () => {
    const res = await getUnreadNotificationCount();
  setUnreadCount(res.data.res.unreadCount || 0);

  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  const handleMarkRead = async (id) => {
    await markNotificationAsRead(id);
    fetchNotifications();
    fetchUnreadCount();
  };

  const handleDelete = async (id) => {
    await deleteNotification(id);
    fetchNotifications();
    fetchUnreadCount();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Notifications ({unreadCount} Unread)</h2>
      <button className="text-sm text-blue-600 underline mb-2" onClick={markAllNotificationsAsRead}>
        Mark All as Read
      </button>
      {notifications.map((n) => (
        <div key={n._id} className={`border p-3 mb-2 rounded ${n.readAt ? "bg-white" : "bg-yellow-100"}`}>
          <div className="font-semibold">{n.title}</div>
          <div className="text-sm">{n.message}</div>
          <div className="flex gap-2 mt-2">
            {!n.readAt && <button onClick={() => handleMarkRead(n._id)} className="text-green-600">Mark Read</button>}
            <button onClick={() => handleDelete(n._id)} className="text-red-600">Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationCenter;
