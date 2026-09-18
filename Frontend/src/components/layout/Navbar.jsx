import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Heart,
  Bell,
  User,
  Package,
  MapPin,
  Lock,
  Store,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  ChevronDown,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useNotifications } from "@/context/NotificationContext";
import { SearchBar } from "./SearchBar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn, timeAgo } from "@/lib/utils";

// icon badge
function IconBadge({ icon, count, onClick, label }) {
  return (
    <button onClick={onClick} className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-secondary sm:h-10 sm:w-10" aria-label={label}>
      {icon}
      <AnimatePresence>
        {count > 0 && (
          <motion.span key={count} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground shadow">
            {count > 99 ? "99+" : count}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

export function Navbar() {
  const { user, isAuthenticated, logout, role } = useAuth();
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  // logout
  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-white/90 backdrop-blur-md">
      {/* top strip */}
      <div className="hidden bg-emerald-900 py-1.5 text-center text-xs font-medium text-emerald-50 md:block">
        🌿 Free delivery on orders over Rs. 2000 &nbsp;•&nbsp; Fresh groceries delivered in 60 minutes
      </div>

      {/* main navbar */}
      <div className="mx-auto flex h-16 w-full  items-center gap-2 px-3 sm:gap-4 sm:px-6 lg:px-15">
        {/* logo */}
        <Link to="/" className="flex min-w-0 shrink-0 items-center gap-1.5 font-bold sm:gap-2">
          <div className="flex shrink-0 items-center justify-center">
            <img src="/logo1.jpeg" alt="SajiloKinmel" className="h-8 w-8 rounded-lg object-contain sm:h-10 sm:w-10" />
          </div>
          <span className="truncate text-base tracking-tight text-foreground sm:text-xl">
            Sajilo<span className="text-gradient">Kinmel</span>
          </span>
        </Link>

        {/* desktop search */}
        <SearchBar className="mx-2 hidden max-w-2xl flex-1 md:block" />

        {/* right actions */}
        <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-2">
          {/* chat */}
          {isAuthenticated && (
            <div className="hidden sm:block">
              <IconBadge icon={<MessageCircle className="h-5 w-5" />} count={0} label="Chat" onClick={() => navigate("/chat")} />
            </div>
          )}

          {/* notifications */}
          {isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-secondary sm:h-10 sm:w-10" aria-label="Notifications">
                  <Bell className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] max-w-80">
                <div className="flex items-center justify-between px-2 py-1">
                  <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-xs font-medium text-primary hover:underline">
                      Mark all read
                    </button>
                  )}
                </div>

                <DropdownMenuSeparator />

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 && (
                    <p className="px-2 py-6 text-center text-sm text-muted-foreground">No notifications yet</p>
                  )}

                  {notifications.slice(0, 8).map((n) => (
                    <DropdownMenuItem key={n._id} onClick={() => markAsRead(n._id)} className={cn("flex-col items-start gap-0.5", !n.isRead && "bg-brand-50")}>
                      <div className="flex w-full items-center justify-between">
                        <span className="text-sm font-semibold">{n.title}</span>
                        {!n.isRead && <span className="h-2 w-2 rounded-full bg-primary" />}
                      </div>
                      <span className="line-clamp-2 text-xs text-muted-foreground">{n.message}</span>
                      <span className="text-[10px] text-muted-foreground">{timeAgo(n.createdAt)}</span>
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* wishlist */}
          <div className="hidden sm:block">
            <IconBadge icon={<Heart className="h-5 w-5" />} count={wishlistCount} label="Wishlist" onClick={() => navigate("/wishlist")} />
          </div>

          {/* cart */}
          <IconBadge icon={<ShoppingCart className="h-[18px] w-[18px] sm:h-5 sm:w-5" />} count={itemCount} label="Cart" onClick={() => navigate("/cart")} />

          {/* profile */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="ml-0.5 flex shrink-0 items-center gap-1 rounded-full border border-border p-1 transition-colors hover:bg-secondary sm:ml-1 sm:gap-2 sm:py-1 sm:pl-1 sm:pr-2.5">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profilePicture?.url} alt={user?.fullName} />
                    <AvatarFallback>{user?.fullName?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>

                  <span className="hidden max-w-[100px] truncate text-sm font-medium sm:block">
                    {user?.fullName?.split(" ")[0]}
                  </span>

                  <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] max-w-64">
                {/* user info */}
                <div className="px-2 py-1.5">
                  <p className="truncate text-sm font-semibold">{user?.fullName}</p>
                  <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                  <Badge variant="secondary" className="mt-1 capitalize">{role}</Badge>
                </div>

                <DropdownMenuSeparator />

                {/* profile */}
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="h-4 w-4" /> My Profile
                </DropdownMenuItem>

                {/* orders */}
                <DropdownMenuItem onClick={() => navigate("/orders")}>
                  <Package className="h-4 w-4" /> My Orders
                </DropdownMenuItem>

                {/* wishlist */}
                <DropdownMenuItem onClick={() => navigate("/wishlist")}>
                  <Heart className="h-4 w-4" /> Wishlist
                </DropdownMenuItem>

                {/* addresses */}
                <DropdownMenuItem onClick={() => navigate("/addresses")}>
                  <MapPin className="h-4 w-4" /> Addresses
                </DropdownMenuItem>

                {/* change password */}
                <DropdownMenuItem onClick={() => navigate("/change-password")}>
                  <Lock className="h-4 w-4" /> Change Password
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* seller dashboard */}
                {role === "seller" && (
                  <DropdownMenuItem onClick={() => navigate("/seller")}>
                    <Store className="h-4 w-4" /> Seller Dashboard
                  </DropdownMenuItem>
                )}

                {/* admin dashboard */}
                {role === "admin" && (
                  <DropdownMenuItem onClick={() => navigate("/admin")}>
                    <LayoutDashboard className="h-4 w-4" /> Admin Dashboard
                  </DropdownMenuItem>
                )}

                {/* become seller */}
                {role === "buyer" && (
                  <DropdownMenuItem onClick={() => navigate("/become-seller")}>
                    <Store className="h-4 w-4" /> Become a Seller
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                {/* logout */}
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            /* guest buttons */
            <div className="flex items-center gap-1 sm:gap-2">
              {/* login */}
              <motion.button type="button" whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }} onClick={() => navigate("/login")} className="group relative hidden h-10 items-center justify-center rounded-xl px-3 text-sm font-semibold text-slate-600 transition-all duration-300 hover:bg-emerald-50 hover:text-emerald-700 sm:inline-flex sm:px-4">
                <span>Login</span>
                <motion.span className="absolute bottom-1.5 left-1/2 h-0.5 -translate-x-1/2 rounded-full bg-emerald-600" initial={{ width: 0 }} whileHover={{ width: "55%" }} transition={{ duration: 0.25 }} />
              </motion.button>

              {/* sign up */}
              <motion.button type="button" whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.96 }} onClick={() => navigate("/register")} className="group relative h-9 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 px-3.5 text-xs font-semibold text-white shadow-md shadow-emerald-200/60 transition-all duration-300 hover:from-emerald-700 hover:to-green-600 hover:shadow-lg hover:shadow-emerald-200 sm:h-10 sm:px-5 sm:text-sm">
                {/* shine */}
                <motion.span className="absolute inset-y-0 -left-10 w-3 rotate-12 bg-white/30 blur-sm" animate={{ left: ["-20%", "130%"] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }} />
                <span className="relative z-10">Sign Up</span>
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* mobile search */}
      <div className="px-3 pb-3 sm:px-4 md:hidden">
        <SearchBar />
      </div>
    </header>
  );
}