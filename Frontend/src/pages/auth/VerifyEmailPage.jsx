import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Mail, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authApi } from "@/api/auth.api";

export default function VerifyEmailPage() {
  const { token } = useParams();
  const location = useLocation();
  const email = location.state?.email;
  const verificationStarted = useRef(false);

  const [status, setStatus] = useState(token ? "loading" : "waiting");
  const [message, setMessage] = useState("");

  // verify email
  useEffect(() => {
    if (!token || verificationStarted.current) return;

    verificationStarted.current = true;

    const verify = async () => {
      try {
        const { data } = await authApi.verifyEmail(token);
        setMessage(data.message);
        setStatus("success");
      } catch (err) {
        setMessage(err?.response?.data?.message || "Verification failed");
        setStatus("error");
      }
    };

    verify();
  }, [token]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-secondary/30 p-6">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md rounded-2xl border border-green-300 bg-white p-10 text-center shadow-xl">
        {/* waiting */}
        {status === "waiting" && (
          <>
            <Mail className="mx-auto h-16 w-16 text-primary" />
            <h2 className="mt-4 text-2xl font-bold">Check your email</h2>
            <p className="mt-3 text-sm text-muted-foreground">We've sent a verification link to</p>
            {email && <p className="mt-1 break-all font-semibold">{email}</p>}
            <p className="mt-4 text-sm text-muted-foreground">Please check your inbox and click the verification link to activate your FreshMart account.</p>
          </>
        )}

        {/* verifying */}
        {status === "loading" && (
          <>
            <Loader2 className="mx-auto h-16 w-16 animate-spin text-primary" />
            <h2 className="mt-4 text-xl font-bold">Verifying your email...</h2>
            <p className="mt-2 text-sm text-muted-foreground">Please wait while we verify your email address.</p>
          </>
        )}

        {/* success */}
        {status === "success" && (
          <>
            <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" />
            <h2 className="mt-4 text-xl font-bold">Email Verified!</h2>
            <p className="mt-2 text-sm text-muted-foreground">{message}</p>
            <Button className="mt-6 w-full" asChild>
              <Link to="/login">Continue to Login</Link>
            </Button>
          </>
        )}

        {/* error */}
        {status === "error" && (
          <>
            <XCircle className="mx-auto h-16 w-16 text-red-500" />
            <h2 className="mt-4 text-xl font-bold">Verification Failed</h2>
            <p className="mt-2 text-sm text-muted-foreground">{message}</p>
            <Button className="mt-6 w-full" variant="outline" asChild>
              <Link to="/login">Back to Login</Link>
            </Button>
          </>
        )}
      </motion.div>
    </div>
  );
}