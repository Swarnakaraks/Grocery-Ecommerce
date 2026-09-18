import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(form);
      const from = location.state?.from?.pathname;

      if (from && from !== "/login" && from !== "/register") {
        navigate(from);
      } else if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "seller") {
        navigate("/seller");
      } else {
        navigate("/");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative grid min-h-[88vh] grid-cols-1 justify-center space-x-14 overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-green-50 lg:grid-cols-[2.5fr_1.5fr]">
      {/* poster */}
      <div className="hidden h-[88vh] overflow-hidden lg:flex lg:items-center lg:justify-center">
        <img src="/poster1.jpg" alt="FreshMart poster" className="h-full w-full object-cover object-[center_13%]" />
      </div>

      {/* login card */}
      <div className="relative mt-10 w-full max-w-md px-4 md:px-0">
        <div className="relative overflow-hidden rounded-[2rem] border border-emerald-100/80 bg-white/95 shadow-[0_30px_80px_-30px_rgba(16,185,129,0.35)] backdrop-blur-xl ">
          {/* header */}
          <div className="px-7 pb-5 pt-5 text-center">
            {/* logo */}
            <div className="mx-auto mb-2.5 flex items-center justify-center">
              <img src="/logo1.jpeg" alt="SajiloKinmel" className="h-10 w-auto object-contain" />
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Welcome back</h1>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500 ">
              Sign in to continue shopping fresh groceries and everyday essentials on SajiloKinmel.
            </p>
          </div>

          {/* form */}
          <div className="px-7 pb-9 sm:px-10">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-slate-700 ">Email address</Label>

                <div className="group relative">
                  <Mail className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-500" />
                  <Input id="email" type="email" placeholder="you@example.com" className="h-12 rounded-xl border-slate-200 bg-slate-50/70 pl-11 pr-4 transition-all duration-200 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 " required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>

              {/* password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</Label>

                  <Link to="/forgot-password" className="text-xs font-semibold text-emerald-600 transition-colors hover:text-emerald-700 hover:underline ">
                    Forgot password?
                  </Link>
                </div>

                <div className="group relative">
                  <Lock className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-500" />

                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" className="h-12 rounded-xl border-slate-200 bg-slate-50/70 pl-11 pr-11 transition-all duration-200 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />

                  <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition-all hover:bg-emerald-50 hover:text-emerald-600 " aria-label={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                  </button>
                </div>
              </div>

              {/* login button */}
              <Button type="submit" disabled={loading} className="group relative h-12 w-full overflow-hidden rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-70">
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" />
                      Sign In
                    </>
                  )}
                </span>
              </Button>
            </form>

            {/* register */}
            <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
              Don't have an account?{" "}
              <Link to="/register" className="font-bold text-emerald-600 transition-colors hover:text-emerald-700 hover:underline ">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}