import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authApi } from "@/api/auth.api";
import { userApi } from "@/api/user.api";
import { setAccessToken, setOnUnauthorized } from "@/api/axiosClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // auth modal
  const openAuthModal = useCallback(
    (tab = "login") => {
      navigate(tab === "register" ? "/register" : "/login", { state: { from: location } });
    },
    [navigate, location]
  );

  const closeAuthModal = useCallback(() => {}, []);

  // bootstrap auth
  const bootstrap = useCallback(async () => {
    try {
      const { data } = await authApi.refresh();
      setAccessToken(data.accessToken);
      const me = await userApi.getMe();
      setUser(me.data.user || me.data.data);
    } catch (err) {
      setAccessToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // auth check
  useEffect(() => {
    setOnUnauthorized(() => {
      setUser(null);
    });

    bootstrap();
    // eslint-disable-next-line
  }, []);

  // login
  const login = async (payload) => {
    const { data } = await authApi.login(payload);
    setAccessToken(data.accessToken);
    setUser(data.user);
    toast.success(data.message || "Welcome back!");
    return data.user;
  };

  // register
  const register = async (payload) => {
    const { data } = await authApi.register(payload);
    toast.success(data.message || "Registered successfully! Please check your email.");
    return data;
  };

  // logout
  const logout = async () => {
    try {
      await authApi.logout();
    } catch {}

    setAccessToken(null);
    setUser(null);
    toast.success("Logged out successfully");
  };

  // refresh profile
  const refreshProfile = async () => {
    try {
      const me = await userApi.getMe();
      setUser(me.data.user || me.data.data);
    } catch {}
  };

  const value = {
    user,
    setUser,
    loading,
    login,
    register,
    logout,
    refreshProfile,
    isAuthenticated: !!user,
    role: user?.role || null,
    openAuthModal,
    closeAuthModal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) throw new Error("useAuth must be used within AuthProvider");

  return ctx;
}