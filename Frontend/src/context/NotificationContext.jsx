import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { notificationApi } from "@/api/notification.api";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }

    try {
      const { data } = await notificationApi.getMyNotifications();
      setNotifications(data.notifications || []);
    } catch {
      // silent
    }
  }, [isAuthenticated]);

  // load notifications
  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // mark as read
  const markAsRead = async (id) => {
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));

    try {
      await notificationApi.markAsRead(id);
    } catch {}
  };

  // mark all as read
  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

    try {
      await notificationApi.markAllAsRead();
    } catch {}
  };

  // remove notification
  const removeNotification = async (id) => {
    setNotifications((prev) => prev.filter((n) => n._id !== id));

    try {
      await notificationApi.deleteNotification(id);
    } catch {}
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);

  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");

  return ctx;
}