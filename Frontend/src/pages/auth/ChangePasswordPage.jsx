import React, { useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { authApi } from "@/api/auth.api";

export default function ChangePasswordPage() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [show, setShow] = useState({
    c: false,
    n: false,
    cf: false,
  });

  const [loading, setLoading] = useState(false);

  // submit password
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { data } = await authApi.changePassword(form);
      toast.success(data.message || "Password changed successfully");
      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Could not change password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] w-full bg-gradient-to-b from-green-50/50 via-white to-white px-4 py-10 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mx-auto w-full max-w-lg"
      >
        <Card className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-lg shadow-gray-200/40">
        
          <CardHeader className="px-6 pb-5 pt-7 sm:px-8 sm:pt-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-green-600 ring-1 ring-green-100">
                <ShieldCheck size={24} strokeWidth={2} />
              </div>

              <div className="min-w-0">
                <CardTitle className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                  Change Password
                </CardTitle>

                <CardDescription className="mt-1.5 text-sm leading-6 text-gray-500">
                  Keep your account secure with a strong password.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-6 pb-7 sm:px-8 sm:pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {[
                {
                  key: "currentPassword",
                  label: "Current password",
                  show: "c",
                },
                {
                  key: "newPassword",
                  label: "New password",
                  show: "n",
                },
                {
                  key: "confirmPassword",
                  label: "Confirm new password",
                  show: "cf",
                },
              ].map((f) => (
                <div className="space-y-2" key={f.key}>
                  <Label
                    htmlFor={f.key}
                    className="text-sm font-semibold text-gray-700"
                  >
                    {f.label}
                  </Label>

                  <div className="relative">
                    <Lock
                      className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                      strokeWidth={2}
                    />

                    <Input
                      id={f.key}
                      type={show[f.show] ? "text" : "password"}
                      required
                      value={form[f.key]}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          [f.key]: e.target.value,
                        })
                      }
                      className="h-11 rounded-xl border-gray-200 bg-gray-50/50 pl-10 pr-11 text-sm transition-all placeholder:text-gray-400 focus:border-green-500 focus:bg-white focus:ring-green-500/20"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShow({
                          ...show,
                          [f.show]: !show[f.show],
                        })
                      }
                      className="absolute right-3.5 top-1/2 flex -translate-y-1/2 items-center justify-center text-gray-400 transition-colors hover:text-green-600"
                      aria-label={
                        show[f.show] ? "Hide password" : "Show password"
                      }
                    >
                      {show[f.show] ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>
                  </div>
                </div>
              ))}

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-11 w-full rounded-xl bg-green-600 font-semibold shadow-sm transition-all hover:bg-green-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </form>

            <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-green-50/70 px-4 py-3 text-center text-xs text-green-700">
              <ShieldCheck size={15} className="shrink-0" />
              <span>Your password helps keep your account protected.</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}