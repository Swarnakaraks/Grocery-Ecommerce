import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff, Lock, Mail, User, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // register
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      await register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
      });

      navigate("/verify-email", { state: { email: form.email } });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed");
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

      {/* register card */}
      <div className="relative mt-1 w-full max-w-md px-4 pt-10 md:pt-0 md:px-0">
        <div className="relative overflow-hidden rounded-[2rem] border border-emerald-100/80 bg-white/95 shadow-[0_30px_80px_-30px_rgba(16,185,129,0.35)] backdrop-blur-xl">
          {/* header */}
          <div className="px-7 pb-2 pt-2 text-center sm:px-9">
            {/* logo */}
            <div className="mx-auto flex items-center justify-center">
              <img src="/logo1.jpeg" alt="SajiloKinmel" className="h-10 w-auto object-contain" />
            </div>

            {/* heading */}
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 ">Create your account</h1>

            {/* subtitle */}
            <p className="mx-auto mt-1.5 max-w-xs text-xs leading-5 text-slate-500">
              Join SajiloKinmel for fresh groceries, great deals, and easy doorstep delivery.
            </p>
          </div>

          {/* form */}
          <div className="px-7 pb-8 sm:px-9">
            <form onSubmit={handleSubmit} className="space-y-2">
              {/* full name */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-semibold text-slate-700 ">Full name</Label>

                <div className="group relative">
                  <User className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-500" />
                  <Input id="fullName" type="text" placeholder="John Doe" className="h-12 rounded-xl border-slate-200 bg-slate-50/70 pl-11 pr-4 transition-all duration-200 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                </div>
              </div>

              {/* email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-slate-700 ">Email address</Label>

                <div className="group relative">
                  <Mail className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-500" />
                  <Input id="email" type="email" placeholder="you@example.com" className="h-12 rounded-xl border-slate-200 bg-slate-50/70 pl-11 pr-4 transition-all duration-200 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>

              {/* password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-slate-700 ">Password</Label>

                <div className="group relative">
                  <Lock className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-500" />
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="Min 8 characters" className="h-12 rounded-xl border-slate-200 bg-slate-50/70 pl-11 pr-11 transition-all duration-200 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />

                  <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition-all hover:bg-emerald-50 hover:text-emerald-600" aria-label={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                  </button>
                </div>

                <p className="px-1 text-[11px] text-slate-400">Use at least 8 characters for a stronger password.</p>
              </div>

              {/* confirm password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">Confirm password</Label>

                <div className="group relative">
                  <Lock className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-500" />
                  <Input id="confirmPassword" type={showPassword ? "text" : "password"} placeholder="Re-enter your password" className={`h-12 rounded-xl bg-slate-50/70 pl-11 pr-4 transition-all duration-200 placeholder:text-slate-400 focus:bg-white focus:ring-4  ${form.confirmPassword && form.password !== form.confirmPassword ? "border-red-400 focus:border-red-500 focus:ring-red-500/10" : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10"}`} required value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
                </div>

                {/* password mismatch */}
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p className="px-1 text-[11px] font-medium text-red-500">Passwords do not match.</p>
                )}
              </div>

              {/* register button */}
              <Button type="submit" disabled={loading} className="group relative mt-2 h-12 w-full overflow-hidden rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-70">
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Create Account
                    </>
                  )}
                </span>
              </Button>
            </form>

            {/* login */}
            <p className="mt-5 text-center text-sm text-slate-500 ">
              Already have an account?{" "}
              <Link to="/login" className="font-bold text-emerald-600 transition-colors hover:text-emerald-700 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}