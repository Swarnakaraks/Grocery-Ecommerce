import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Bell, ChevronDown, LogOut, CheckCheck } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { notificationApi } from "@/api/notification.api";
import { cn, timeAgo } from "@/lib/utils";

export function DashboardLayout({ title, navItems }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationLoading, setNotificationLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const { user, isAuthenticated, role, logout, refreshProfile } = useAuth();

  // user info
  const userName = user?.fullName || user?.name || user?.username || "Administrator";
  const userEmail = user?.email || "admin@sajilokinmel.com";
  const userRole = role || user?.role || "admin";
  const userInitial = userName?.trim()?.charAt(0)?.toUpperCase() || "A";
  const profilePicture = user?.profilePicture?.url || user?.profilePicture || "";

  // active navigation
  const activeItem = useMemo(() => {
    return navItems.find((item) => {
      if (item.end) return location.pathname === item.to;
      return location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
    }) || null;
  }, [location.pathname, navItems]);

  // notifications
  const unreadCount = useMemo(() => notifications.filter((item) => !item.isRead).length, [notifications]);

  const loadNotifications = async () => {
    try {
      setNotificationLoading(true);

      const response = await notificationApi.getMyNotifications();
      const data = response?.data?.notifications || response?.data?.data || response?.data || [];

      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setNotificationLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    loadNotifications();
  }, [isAuthenticated]);

  // refresh profile
  useEffect(() => {
    if (!isAuthenticated) return;
    refreshProfile?.();
  }, [isAuthenticated]);

  // close dropdowns
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!event.target.closest("[data-profile-menu]")) setProfileOpen(false);
      if (!event.target.closest("[data-notification-menu]")) setNotificationOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // close mobile menu
  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
    setNotificationOpen(false);
  }, [location.pathname]);

  // mark notification read
  const handleMarkAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);

      setNotifications((current) =>
        current.map((notification) =>
          notification._id === id ? { ...notification, isRead: true } : notification
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  // mark all read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();

      setNotifications((current) =>
        current.map((notification) => ({ ...notification, isRead: true }))
      );
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  // logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // profile navigation
  const goToProfile = () => {
    setProfileOpen(false);
    navigate("/profile");
  };

  // sidebar
  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex-1 px-3 py-5">
        <p className="mb-3 px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Main Menu</p>

        <nav className="space-y-1.5">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md shadow-emerald-500/20"
                    : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all",
                    isActive
                      ? "bg-white/15 text-white"
                      : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-emerald-600"
                  )}>
                    <Icon size={17} strokeWidth={2} />
                  </span>

                  <span className="truncate">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* top navbar */}
      <header className="fixed inset-x-0 top-0 z-[100] h-[72px] border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl">
        <div className="flex h-full items-center px-4 sm:px-6 lg:pl-6 lg:pr-8">
          {/* mobile menu */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 lg:hidden"
          >
            <Menu size={19} />
          </motion.button>

          {/* logo */}
          <Link to="/" className="ml-5 flex min-w-0 shrink-0 items-center gap-1.5 font-bold sm:gap-2">
            <div className="flex shrink-0 items-center justify-center">
              <img src="/logo1.jpeg" alt="SajiloKinmel" className="h-8 w-8 rounded-lg object-contain sm:h-10 sm:w-10" />
            </div>

            <span className="truncate text-base tracking-tight text-foreground sm:text-xl">
              Sajilo<span className="text-gradient">Kinmel</span>
            </span>
          </Link>

          {/* navbar actions */}
          <div className="ml-auto flex items-center gap-2">
            {/* notification */}
            <div className="relative" data-notification-menu>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  setNotificationOpen((current) => !current);
                  setProfileOpen(false);

                  if (!notificationOpen) loadNotifications();
                }}
                className={cn(
                  "relative flex h-10 w-10 items-center justify-center rounded-xl border transition-all",
                  notificationOpen
                    ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                    : "border-slate-200 bg-white text-slate-500 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
                )}
                aria-label="Notifications"
              >
                <Bell size={18} />

                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[9px] font-extrabold text-white shadow-sm"
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </motion.span>
                )}
              </motion.button>

              {/* notification dropdown */}
              <AnimatePresence>
                {notificationOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 top-12 z-[120] w-[calc(100vw-2rem)] max-w-[370px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10"
                  >
                    {/* notification header */}
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
                      <div>
                        <h3 className="text-[16px] font-semibold text-slate-900">Notifications</h3>
                        <p className="mt-0.5 text-[10px] text-slate-400">
                          {unreadCount > 0
                            ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                            : "You're all caught up"}
                        </p>
                      </div>

                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-bold text-emerald-600 transition hover:bg-emerald-50"
                        >
                          <CheckCheck size={13} />
                          Mark all read
                        </button>
                      )}
                    </div>

                    {/* notification list */}
                    <div className="max-h-[390px] overflow-y-auto">
                      {notificationLoading ? (
                        <div className="space-y-3 p-4">
                          {[1, 2, 3].map((item) => (
                            <div key={item} className="flex animate-pulse gap-3">
                              <div className="h-9 w-9 rounded-xl bg-slate-100" />

                              <div className="flex-1 space-y-2">
                                <div className="h-3 w-3/4 rounded bg-slate-100" />
                                <div className="h-2.5 w-full rounded bg-slate-100" />
                                <div className="h-2 w-1/4 rounded bg-slate-100" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="px-5 py-12 text-center">
                          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
                            <Bell size={20} />
                          </div>

                          <p className="text-sm font-bold text-slate-800">No notifications</p>
                          <p className="mt-1 text-xs text-slate-400">You don't have any notifications yet.</p>
                        </div>
                      ) : (
                        notifications.slice(0, 8).map((notification) => (
                          <button
                            key={notification._id}
                            onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
                            className={cn(
                              "flex w-full gap-3 border-b border-slate-100 px-4 py-3.5 text-left transition hover:bg-slate-50",
                              !notification.isRead && "bg-emerald-50/60"
                            )}
                          >
                            <div className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                              notification.isRead
                                ? "bg-slate-100 text-slate-500"
                                : "bg-emerald-100 text-emerald-600"
                            )}>
                              <Bell size={16} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <p className="line-clamp-1 text-sm font-semibold text-slate-800">{notification.title}</p>

                                {!notification.isRead && (
                                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                                )}
                              </div>

                              <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-slate-500">{notification.message}</p>
                              <p className=" text-[9px] font-medium text-slate-400">{timeAgo(notification.createdAt)}</p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>

                    {notifications.length > 8 && (
                      <button
                        onClick={() => setNotificationOpen(false)}
                        className="w-full border-t border-slate-100 bg-slate-50 py-3 text-center text-xs font-bold text-emerald-600 transition hover:bg-emerald-50"
                      >
                        View all notifications
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* divider */}
            <div className="mx-1 hidden h-8 w-px bg-slate-200 sm:block" />

            {/* profile */}
            <div className="relative" data-profile-menu>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setProfileOpen((current) => !current);
                  setNotificationOpen(false);
                }}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-1.5 py-1.5 transition-all sm:pr-2.5",
                  profileOpen
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                )}
              >
                {/* profile image */}
                <div className="relative">
                  {profilePicture ? (
                    <img src={profilePicture} alt={userName} className="h-9 w-9 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-sm font-extrabold text-white shadow-sm">
                      {userInitial}
                    </div>
                  )}

                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                </div>

                <div className="hidden max-w-[120px] text-left sm:block">
                  <p className="truncate text-sm font-semibold text-slate-800">{userName}</p>
                  <p className="mt-0.5 text-xs font-semibold capitalize text-slate-400">{userRole}</p>
                </div>

                <ChevronDown
                  size={14}
                  className={cn(
                    "hidden text-slate-400 transition-transform sm:block",
                    profileOpen && "rotate-180 text-emerald-600"
                  )}
                />
              </motion.button>

              {/* profile dropdown */}
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 z-[120] w-[290px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
                  >
                    {/* profile header */}
                    <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4">
                      {profilePicture ? (
                        <img src={profilePicture} alt={userName} className="h-11 w-11 rounded-full object-cover ring-2 ring-emerald-100" />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                          {userInitial}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xl font-semibold text-slate-800">{userName}</p>
                        <p className="truncate text-sm text-slate-500">{userEmail}</p>
                        <p className="mt-0.5 text-sm font-medium capitalize text-emerald-600">{userRole}</p>
                      </div>
                    </div>

                    {/* logout */}
                    <div className="border-t border-slate-100 p-2">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-red-500 transition hover:bg-red-50"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
                          <LogOut size={15} />
                        </span>

                        <span className="text-sm font-semibold">Logout</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* desktop sidebar */}
      <aside className="fixed bottom-0 left-0 top-[72px] z-50 hidden w-[272px] border-r border-slate-200/80 bg-white lg:block">
        {SidebarContent}
      </aside>

      {/* mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-[150] bg-slate-950/50 backdrop-blur-sm lg:hidden"
            />

            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 top-0 z-[160] w-[290px] bg-white shadow-2xl lg:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-red-50 hover:text-red-500"
              >
                <X size={18} />
              </button>

              {SidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* page content */}
      <main className="min-h-screen pt-[72px] lg:pl-[272px]">
        <div className="mx-auto min-w-0 max-w-[1800px] px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}