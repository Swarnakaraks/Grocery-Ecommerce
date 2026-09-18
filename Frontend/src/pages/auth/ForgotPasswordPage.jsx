import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, Lock, Mail } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { authApi } from "@/api/auth.api";

const STEPS = { EMAIL: 0, OTP: 1, RESET: 2, DONE: 3 };

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(STEPS.EMAIL);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [resetToken, setResetToken] = useState("");
  const [passwords, setPasswords] = useState({ newPassword: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const inputsRef = useRef([]);

  // send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await authApi.forgotPassword(email);
      toast.success(data.message || "OTP sent to your email");
      setStep(STEPS.OTP);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not send OTP");
    } finally {
      setLoading(false);
    }
  };

  // OTP input
  const handleOtpChange = (value, idx) => {
    if (!/^\d*$/.test(value)) return;

    const next = [...otp];
    next[idx] = value.slice(-1);
    setOtp(next);

    if (value && idx < 5) inputsRef.current[idx + 1]?.focus();
  };

  // OTP navigation
  const handleOtpKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  // verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otp.join("");

    if (code.length !== 6) {
      toast.error("Please enter the full 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      const { data } = await authApi.verifyResetOtp({ email, otp: code });
      setResetToken(data.resetToken);
      toast.success("OTP verified");
      setStep(STEPS.RESET);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  // resend OTP
  const handleResendOtp = async () => {
    try {
      const { data } = await authApi.forgotPassword(email);
      toast.success(data.message || "OTP resent");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Please wait before requesting again");
    }
  };

  // reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { data } = await authApi.resetPassword({ resetToken, ...passwords });
      toast.success(data.message || "Password reset successfully");
      setStep(STEPS.DONE);
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not reset password");
    } finally {
      setLoading(false);
    }
  };

  const titles = {
    [STEPS.EMAIL]: ["Forgot password?", "Enter your email to receive a reset OTP"],
    [STEPS.OTP]: ["Verify OTP", `We sent a 6-digit code to ${email}`],
    [STEPS.RESET]: ["Set new password", "Choose a strong new password for your account"],
    [STEPS.DONE]: ["All done! 🎉", "Redirecting you to login..."],
  };

  return (
    <AuthLayout title={titles[step][0]} subtitle={titles[step][1]}>
      {step > STEPS.EMAIL && step < STEPS.DONE && (
        <button onClick={() => setStep(step - 1)} className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={14} /> Back
        </button>
      )}

      <AnimatePresence mode="wait">
        {step === STEPS.EMAIL && (
          <motion.form key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" className="pl-10" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Sending..." : "Send OTP"}</Button>
          </motion.form>
        )}

        {step === STEPS.OTP && (
          <motion.form key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="flex justify-between gap-2">
              {otp.map((digit, idx) => (
                <Input
                  key={idx}
                  ref={(el) => (inputsRef.current[idx] = el)}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, idx)}
                  onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                  maxLength={1}
                  inputMode="numeric"
                  className="h-14 w-12 rounded-xl border-2 text-center text-xl font-bold shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              ))}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              <KeyRound size={16} /> {loading ? "Verifying..." : "Verify OTP"}
            </Button>

            <button type="button" onClick={handleResendOtp} className="w-full text-center text-sm font-medium text-primary hover:underline">
              Didn't get a code? Resend OTP
            </button>
          </motion.form>
        )}

        {step === STEPS.RESET && (
          <motion.form key="reset" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">New password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="newPassword" type={showPassword ? "text" : "password"} className="pl-10 pr-10" required value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} />
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="confirmPassword" type={showPassword ? "text" : "password"} className="pl-10" required value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Resetting..." : "Reset Password"}</Button>
          </motion.form>
        )}

        {step === STEPS.DONE && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="h-16 w-16 text-primary" />
            <p className="font-medium">Password changed successfully!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {step === STEPS.EMAIL && (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Remembered your password? <Link to="/login" className="font-semibold text-primary hover:underline">Back to login</Link>
        </p>
      )}
    </AuthLayout>
  );
}