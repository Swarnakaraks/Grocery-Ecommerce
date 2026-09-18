
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function StatCard({ icon: Icon, label, value, tone = "primary", delay = 0 }) {
  const tones = {
    primary: "bg-brand-50 text-primary",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    blue: "bg-blue-50 text-blue-600",
    violet: "bg-violet-50 text-violet-600",
  };

  // stat card
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="flex items-center gap-4 rounded-2xl border border-border bg-white p-5 shadow-sm">
      <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", tones[tone])}>
        <Icon size={22} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-2xl font-extrabold">{value}</p>
        <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
      </div>
    </motion.div>
  );
}