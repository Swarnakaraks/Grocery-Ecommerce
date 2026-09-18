import React from "react";
import { motion } from "framer-motion";


export function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="h-screen flex items-center justify-center bg-secondary/40 p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md rounded-2xl border border-border bg-white p-8 shadow-xl shadow-brand-900/5"
        >
          
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </motion.div>
      </div>
   
  );
}
